import React, { useState } from "react";
import { useAssignments, useSubmitAssignment, useStudentSubmission } from "../../services/api/assignments";
import { useQuizzes, useStudentQuizAttempts } from "../../services/api/quizzes";
import Loader from "../../shared/Loader";
import { toast } from "react-toastify";
import { getUser } from "../../utils/authTokens";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";

const EPortal: React.FC = () => {
  const guardian = getUser();
  const navigate = useNavigate();
  const loggedInStudentIdStr = guardian?.email?.toUpperCase(); // e.g. HSM001
  
  const [studentClass, setStudentClass] = useState("JSS 1"); 
  const [activeTab, setActiveTab] = useState<'assignments' | 'quizzes'>('assignments');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Assignments Data
  const { data: assignments, isLoading: isLoadingAssignments } = useAssignments(studentClass);
  const { data: mySubmission, isLoading: isLoadingSubmission } = useStudentSubmission(
    selectedAssignment?._id || "", 
    String(guardian?.id || "")
  );
  const submitMutation = useSubmitAssignment();

  // Quizzes Data
  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuizzes(studentClass);
  const { data: quizAttempts, isLoading: isLoadingQuizAttempts } = useStudentQuizAttempts(loggedInStudentIdStr || "unknown");

  const handleSubmitAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    const formData = new FormData(e.currentTarget);
    formData.append("assignmentId", selectedAssignment._id);
    formData.append("studentId", String(guardian?.id || ""));

    try {
      await submitMutation.mutateAsync(formData);
      toast.success("Assignment submitted successfully!");
      setIsSubmitModalOpen(false);
    } catch (error) {
      toast.error("Failed to submit assignment. Make sure you haven't already submitted it.");
    }
  };

  const hasTakenQuiz = (quizId: string) => {
    if (!quizAttempts) return false;
    return quizAttempts.some(attempt => {
      // Handle populated quizId or string quizId
      const attemptQuizId = typeof attempt.quizId === 'object' ? attempt.quizId._id : attempt.quizId;
      return attemptQuizId === quizId;
    });
  };

  const getQuizScore = (quizId: string) => {
    if (!quizAttempts) return null;
    return quizAttempts.find(attempt => {
      const attemptQuizId = typeof attempt.quizId === 'object' ? attempt.quizId._id : attempt.quizId;
      return attemptQuizId === quizId;
    });
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-Poppins">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-Lora text-[#05878F]">Student E-Portal</h1>
          <p className="text-gray-600">Managing learning tasks for {loggedInStudentIdStr}</p>
        </div>
        
        <div className="bg-white p-1 rounded-lg border border-gray-200 flex shadow-sm">
          <button 
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'assignments' ? 'bg-[#05878F] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Assignments
          </button>
          <button 
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'quizzes' ? 'bg-[#05878F] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            CBT / Quizzes
          </button>
        </div>
      </div>

      {activeTab === 'assignments' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignments List */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold font-Lora mb-4">Pending Assignments</h2>
            {isLoadingAssignments ? (
              <div className="flex justify-center"><Loader /></div>
            ) : assignments?.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div 
                    key={assignment._id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAssignment?._id === assignment._id ? 'border-[#05878F] bg-[#ECFEFF]' : 'border-gray-200 hover:border-[#05878F]'}`}
                    onClick={() => setSelectedAssignment(assignment)}
                  >
                    <h3 className="font-bold text-md text-gray-800">{assignment.title}</h3>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-[#05878F] font-bold bg-teal-50 px-2 py-0.5 rounded">{assignment.subject}</span>
                      <span className="text-red-500 font-medium">Due: {moment(assignment.dueDate).format("MMM Do")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No pending assignments.</p>
            )}
          </div>

          {/* Assignment Details */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
            {!selectedAssignment ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select an assignment to view details.
              </div>
            ) : (
              <div>
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-2xl font-bold font-Lora text-[#05878F] mb-2">{selectedAssignment.title}</h2>
                  <p className="text-gray-700 mb-4">{selectedAssignment.description}</p>
                  
                  {selectedAssignment.fileUrl && (
                    <a 
                      href={selectedAssignment.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#05878F] hover:underline bg-teal-50 px-4 py-2 rounded-lg font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Download Material
                    </a>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4">Your Submission</h3>
                  {isLoadingSubmission ? (
                    <Loader />
                  ) : mySubmission ? (
                    <div>
                      <div className="flex items-center gap-2 text-green-600 font-bold mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Submitted on {new Date(mySubmission.submittedAt).toLocaleDateString()}
                      </div>
                      <p className="text-gray-700 text-sm mb-4">Comments: {mySubmission.comments || "None"}</p>
                      {mySubmission.grade && (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block font-bold">
                          Grade: {mySubmission.grade}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500 text-sm mb-4">You have not submitted this assignment yet.</p>
                      <button 
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="bg-[#05878F] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#046A7E] transition-colors"
                      >
                        Upload Submission
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold font-Lora mb-6 border-b pb-2 text-gray-800">Available Quizzes</h2>
          {isLoadingQuizzes || isLoadingQuizAttempts ? (
            <div className="flex justify-center py-10"><Loader /></div>
          ) : quizzes && quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz: any) => {
                const isTaken = hasTakenQuiz(quiz._id);
                const attempt = getQuizScore(quiz._id);
                
                return (
                  <div key={quiz._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                    {isTaken && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">COMPLETED</div>
                    )}
                    <div className="flex justify-between items-start mb-3 mt-1">
                      <span className="bg-teal-100 text-[#05878F] text-xs font-bold px-2 py-1 rounded">{quiz.subject}</span>
                      <span className="text-gray-500 text-xs font-medium">{quiz.durationMinutes} mins</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{quiz.title}</h3>
                    <p className="text-xs text-red-500 font-medium mb-4">Due: {moment(quiz.dueDate).format("MMM Do YYYY")}</p>
                    
                    {isTaken && attempt ? (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                        <p className="text-xs text-gray-500 font-medium mb-1">Your Score</p>
                        <p className="text-xl font-bold text-[#05878F]">{attempt.score} <span className="text-sm text-gray-400">/ {attempt.totalPoints}</span></p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => navigate(`/dashboard/eportal/quiz/${quiz._id}`)}
                        className="w-full text-center py-2.5 bg-[#05878F] text-white rounded-lg font-bold hover:bg-[#046A7E] transition-colors shadow-sm"
                      >
                        Start Quiz
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
              No quizzes available for your class at the moment.
            </div>
          )}
        </div>
      )}

      {/* Submission Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Submit Assignment</h2>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments (Optional)</label>
                <textarea 
                  name="comments"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#05878F]" 
                  rows={3}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (PDF/DOC)</label>
                <input 
                  type="file" 
                  name="file"
                  required
                  accept=".pdf,.doc,.docx"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#05878F]"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                  className="bg-[#05878F] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#046A7E] transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitMutation.isPending ? "Uploading..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPortal;
