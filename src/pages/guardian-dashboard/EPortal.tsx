import React, { useState } from "react";
import { useAssignments, useSubmitAssignment, useStudentSubmission } from "../../services/api/assignments";
import Loader from "../../shared/Loader";
import { toast } from "react-toastify";
import { getUser } from "../../utils/authTokens";

const EPortal: React.FC = () => {
  // Assuming the user is a Guardian, we get their details
  const guardian = getUser();
  
  // A guardian might have multiple students. For simplicity, we select the first one, or allow them to choose.
  // In this basic version, we assume `guardian.students[0]` exists if populated, 
  // or we might just use the guardian's own ID if they logged in with the studentId!
  // Since we modified login so Guardians log in using Student ID, `guardian.email` actually holds the Student ID.
  const loggedInStudentIdStr = guardian?.email?.toUpperCase(); // e.g. HSM001
  
  // Hardcoding class for demo purposes since we'd ideally fetch the student's full profile
  const [studentClass, setStudentClass] = useState("JSS 1"); 
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const { data: assignments, isLoading: isLoadingAssignments } = useAssignments(studentClass);
  // Ideally, we'd have the Mongo ObjectId for the student. For now, the backend will need to accept studentId (string) or ObjectId.
  // Wait, the API requires the MongoDB ObjectId for studentId. 
  // We'll pass the `loggedInStudentIdStr` to the backend, and the backend should handle it if we updated it, 
  // but to keep it simple, we assume the backend route `/assignments/:id/submissions/:studentId` takes the string ID.
  const { data: mySubmission, isLoading: isLoadingSubmission } = useStudentSubmission(
    selectedAssignment?._id || "", 
    String(guardian?.id || "") // Pass the User ID or we should pass the actual Student ObjectId
  );

  const submitMutation = useSubmitAssignment();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    const formData = new FormData(e.currentTarget);
    formData.append("assignmentId", selectedAssignment._id);
    
    // We need to pass the student's MongoDB ObjectId. 
    // Since the guardian logged in WITH the student ID, the `guardian.id` is actually the User ObjectId.
    // The backend `submitAssignment` expects `studentId` as the Student ObjectId.
    // We might need to adjust the backend to look up by User ID or Student ID.
    // For now, let's append what we have.
    formData.append("studentId", String(guardian?.id || ""));

    try {
      await submitMutation.mutateAsync(formData);
      toast.success("Assignment submitted successfully!");
      setIsSubmitModalOpen(false);
    } catch (error) {
      toast.error("Failed to submit assignment. Make sure you haven't already submitted it.");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-Poppins">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-Lora text-[#05878F]">Student E-Portal</h1>
        <p className="text-gray-600">Managing assignments for {loggedInStudentIdStr}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignments List */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold font-Lora mb-4">Pending Assignments</h2>
          {isLoadingAssignments ? (
            <Loader />
          ) : assignments?.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment: any) => (
                <div 
                  key={assignment._id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAssignment?._id === assignment._id ? 'border-[#05878F] bg-[#ECFEFF]' : 'border-gray-200 hover:border-[#05878F]'}`}
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <h3 className="font-bold text-md">{assignment.title}</h3>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span className="text-red-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No pending assignments.</p>
          )}
        </div>

        {/* Assignment Details & Submission */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          {!selectedAssignment ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an assignment to view details and submit.
            </div>
          ) : (
            <div>
              <div className="border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold font-Lora text-[#05878F] mb-2">{selectedAssignment.title}</h2>
                <p className="text-gray-700 mb-4">{selectedAssignment.description}</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded">Subject: {selectedAssignment.subject?.name || 'General'}</span>
                  <span className="bg-red-50 text-red-600 px-2 py-1 rounded">Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}</span>
                </div>
                {selectedAssignment.fileUrl && (
                  <a href={selectedAssignment.fileUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 text-[#05878F] hover:underline">
                    📄 Download Attachment
                  </a>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold font-Lora mb-4">Your Submission</h3>
                {isLoadingSubmission ? (
                  <Loader />
                ) : mySubmission ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold mb-2">✅ Assignment Submitted</p>
                    <p className="text-sm text-gray-600 mb-2">Submitted on {new Date(mySubmission.submittedAt).toLocaleString()}</p>
                    
                    {mySubmission.textResponse && (
                      <div className="bg-white p-3 rounded border text-sm text-gray-700 mb-2">{mySubmission.textResponse}</div>
                    )}
                    {mySubmission.fileUrl && (
                      <a href={mySubmission.fileUrl} target="_blank" rel="noreferrer" className="text-[#05878F] text-sm hover:underline">
                        📄 View Submitted File
                      </a>
                    )}
                    
                    {mySubmission.grade !== undefined && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="font-bold text-lg text-green-700">Grade: {mySubmission.grade}/100</p>
                        {mySubmission.feedback && <p className="text-gray-700 mt-1">Feedback: {mySubmission.feedback}</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-4">You have not submitted this assignment yet.</p>
                    <button 
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="bg-[#05878F] text-white px-6 py-2 rounded-md hover:bg-[#046A7E] transition-colors"
                    >
                      Submit Assignment
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Modal */}
      {isSubmitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold font-Lora mb-4">Submit: {selectedAssignment.title}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-Poppins">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Response (Optional)</label>
                <textarea name="textResponse" rows={4} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded-md p-2"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (Optional)</label>
                <input type="file" name="file" className="w-full text-sm border p-2 rounded-md" />
              </div>
              <p className="text-xs text-gray-500 italic">Please provide either a text response or a file.</p>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitMutation.isPending} className="px-4 py-2 bg-[#05878F] text-white rounded-md hover:bg-[#046A7E]">
                  {submitMutation.isPending ? "Submitting..." : "Submit"}
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
