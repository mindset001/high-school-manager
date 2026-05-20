import React, { useState } from "react";
import { useAssignments, useCreateAssignment, useSubmissions, useGradeSubmission } from "../../services/api/assignments";
import Loader from "../../shared/Loader";
import { toast } from "react-toastify";

const Assignments: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  const { data: assignments, isLoading: isLoadingAssignments } = useAssignments();
  const { data: submissions, isLoading: isLoadingSubmissions } = useSubmissions(selectedAssignment || "");

  const createMutation = useCreateAssignment();
  const gradeMutation = useGradeSubmission();

  const handleCreateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Assignment created successfully");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to create assignment");
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent<HTMLFormElement>, submissionId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const grade = Number(formData.get("grade"));
    const feedback = formData.get("feedback") as string;

    try {
      await gradeMutation.mutateAsync({ submissionId, data: { grade, feedback } });
      toast.success("Submission graded successfully");
    } catch (error) {
      toast.error("Failed to grade submission");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-Lora text-[#05878F]">Assignments</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#05878F] text-white px-4 py-2 rounded-md font-Poppins hover:bg-[#046A7E] transition-colors"
        >
          + Create Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assignments List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold font-Lora mb-4">Posted Assignments</h2>
          {isLoadingAssignments ? (
            <Loader />
          ) : assignments?.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment: any) => (
                <div 
                  key={assignment._id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAssignment === assignment._id ? 'border-[#05878F] bg-[#ECFEFF]' : 'border-gray-200 hover:border-[#05878F]'}`}
                  onClick={() => setSelectedAssignment(assignment._id)}
                >
                  <h3 className="font-bold text-lg">{assignment.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                  <div className="flex justify-between text-xs text-gray-500 font-Poppins">
                    <span>Class: {assignment.class}</span>
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No assignments posted yet.</p>
          )}
        </div>

        {/* Submissions View */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold font-Lora mb-4">Submissions</h2>
          {!selectedAssignment ? (
            <p className="text-gray-500 text-center py-8">Select an assignment to view submissions.</p>
          ) : isLoadingSubmissions ? (
            <Loader />
          ) : submissions?.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((sub: any) => (
                <div key={sub._id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">{sub.student.firstName} {sub.student.lastName} ({sub.student.studentId})</span>
                    <span className="text-xs text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                  </div>
                  {sub.textResponse && <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-2">{sub.textResponse}</p>}
                  {sub.fileUrl && (
                    <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-[#05878F] text-sm hover:underline block mb-2">
                      View Attached File
                    </a>
                  )}
                  
                  {sub.grade !== undefined ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="font-bold text-sm text-green-600">Grade: {sub.grade}/100</p>
                      {sub.feedback && <p className="text-sm text-gray-600">Feedback: {sub.feedback}</p>}
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleGradeSubmission(e, sub._id)} className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                      <input type="number" name="grade" placeholder="Grade (0-100)" required className="border p-1 text-sm rounded" min="0" max="100" />
                      <input type="text" name="feedback" placeholder="Feedback (optional)" className="border p-1 text-sm rounded" />
                      <button type="submit" className="bg-[#05878F] text-white text-sm py-1 rounded">Submit Grade</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No submissions yet for this assignment.</p>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold font-Lora mb-4">Create New Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4 font-Poppins">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" name="title" required className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={3} className="w-full border border-gray-300 rounded-md p-2"></textarea>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  {/* Ideally this would be a select populated from the API */}
                  <input type="text" name="class" required placeholder="e.g. JSS 1" className="w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject ID</label>
                  {/* Ideally this would be a select populated from the API */}
                  <input type="text" name="subject" required className="w-full border border-gray-300 rounded-md p-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" name="dueDate" required className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
                <input type="file" name="file" className="w-full text-sm" />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-[#05878F] text-white rounded-md hover:bg-[#046A7E]">
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
