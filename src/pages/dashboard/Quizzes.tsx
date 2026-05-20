import React, { useState } from "react";
import { useQuizzes, useCreateQuiz, useQuizSubmissions, IQuestion } from "../../services/api/quizzes";
import { useQuery } from "@tanstack/react-query";
import { getBaseClass, getSubjects } from "../../services/api/calls/getApis";
import { toast } from "react-toastify";
import Loader from "../../shared/Loader";
import moment from "moment";

const Quizzes: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'submissions'>('list');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuizzes();
  const createQuizMutation = useCreateQuiz();

  const { data: classesData } = useQuery({ queryKey: ["classes"], queryFn: getBaseClass });
  const { data: subjectsData } = useQuery({ queryKey: ["subjects"], queryFn: getSubjects });
  const classesList = classesData?.data?.classes || [];
  const subjectsList = subjectsData?.data?.data || [];

  const { data: submissions, isLoading: isLoadingSubmissions } = useQuizSubmissions(selectedQuizId || "");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(30);
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState<IQuestion[]>([
    { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0, points: 1 }
  ]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0, points: 1 }]);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !className || !subject || !dueDate) {
      toast.error("Please fill in all basic details.");
      return;
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText) {
        toast.error(`Question ${i + 1} text is missing.`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1} has empty options.`);
        return;
      }
    }

    try {
      await createQuizMutation.mutateAsync({
        title, description, class: className, subject, durationMinutes: duration, dueDate, questions
      });
      toast.success("Quiz created successfully!");
      setView('list');
      // Reset form
      setTitle(""); setDescription(""); setClassName(""); setSubject(""); setDueDate("");
      setQuestions([{ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0, points: 1 }]);
    } catch (error) {
      toast.error("Failed to create quiz.");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-Poppins">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-Lora text-[#05878F]">Quizzes & CBT</h1>
          <p className="text-gray-600 text-sm">Manage computer-based tests for your classes.</p>
        </div>
        {view === 'list' ? (
          <button onClick={() => setView('create')} className="bg-[#05878F] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#046A7E] shadow-sm">
            + Create New Quiz
          </button>
        ) : (
          <button onClick={() => setView('list')} className="text-[#05878F] font-medium border border-[#05878F] px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors">
            Back to Quizzes
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {isLoadingQuizzes ? (
            <div className="flex justify-center py-10"><Loader /></div>
          ) : !quizzes || quizzes.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No quizzes created yet. Click above to build one!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-teal-100 text-[#05878F] text-xs font-bold px-2 py-1 rounded">{quiz.class}</span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded">{quiz.subject}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{quiz.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{quiz.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {quiz.durationMinutes} mins
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {moment(quiz.dueDate).format("MMM Do, YYYY")}
                    </div>
                  </div>

                  <button 
                    onClick={() => { setSelectedQuizId(quiz._id); setView('submissions'); }}
                    className="w-full text-center py-2 bg-gray-50 text-[#05878F] rounded-lg font-medium hover:bg-teal-50 transition-colors border border-gray-100"
                  >
                    View Submissions
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'create' && (
        <form onSubmit={handleSubmitQuiz} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Quiz Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#05878F]/20 focus:border-[#05878F]" placeholder="e.g. Mid-Term Mathematics Test" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Instructions</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#05878F]/20 focus:border-[#05878F]" placeholder="Answer all questions carefully." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Class</label>
                <select value={className} onChange={e => setClassName(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#05878F]/20 focus:border-[#05878F]">
                  <option value="">Select a class...</option>
                  {classesList.map((c: any, i: number) => <option key={i} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#05878F]/20 focus:border-[#05878F]">
                  <option value="">Select a subject...</option>
                  {subjectsList.map((s: any, i: number) => <option key={i} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} min={1} required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#05878F]/20 focus:border-[#05878F]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} min={moment().format("YYYY-MM-DD")} required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#05878F]/20 focus:border-[#05878F]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">Quiz Questions</h2>
              <button type="button" onClick={handleAddQuestion} className="text-[#05878F] font-bold text-sm bg-teal-50 px-3 py-1.5 rounded-md hover:bg-teal-100">+ Add Question</button>
            </div>

            <div className="space-y-8">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 relative group">
                  {questions.length > 1 && (
                    <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                  
                  <div className="mb-4 pr-8">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Question {qIndex + 1}</label>
                    <textarea 
                      value={q.questionText} 
                      onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                      required
                      rows={2}
                      className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#05878F]/20 focus:border-[#05878F] resize-none" 
                      placeholder="Type your question here..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name={`correct-${qIndex}`} 
                          checked={q.correctOptionIndex === optIndex}
                          onChange={() => handleQuestionChange(qIndex, 'correctOptionIndex', optIndex)}
                          className="w-5 h-5 text-[#05878F] focus:ring-[#05878F] cursor-pointer"
                        />
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">{String.fromCharCode(65 + optIndex)}.</span>
                          <input 
                            type="text" 
                            value={opt} 
                            onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)}
                            required
                            className={`w-full pl-8 pr-3 py-2 border rounded-lg outline-none transition-colors ${q.correctOptionIndex === optIndex ? 'border-[#05878F] bg-teal-50/30' : 'border-gray-300 focus:border-[#05878F]'}`}
                            placeholder={`Option ${optIndex + 1}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 w-48">
                    <label className="text-sm font-medium text-gray-700">Points:</label>
                    <input 
                      type="number" 
                      value={q.points} 
                      onChange={e => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))}
                      min={1} 
                      className="w-full p-1.5 border border-gray-300 rounded-lg outline-none text-center" 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t flex justify-end">
              <button 
                type="submit" 
                disabled={createQuizMutation.isPending}
                className="bg-[#05878F] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#046A7E] shadow-sm disabled:opacity-50"
              >
                {createQuizMutation.isPending ? "Publishing..." : "Publish Quiz"}
              </button>
            </div>
          </div>
        </form>
      )}

      {view === 'submissions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Student Submissions</h2>
          
          {isLoadingSubmissions ? (
            <div className="flex justify-center py-10"><Loader /></div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No students have taken this quiz yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-100 text-gray-600 text-sm">
                    <th className="p-4 font-semibold">Student ID</th>
                    <th className="p-4 font-semibold text-center">Score</th>
                    <th className="p-4 font-semibold text-center">Percentage</th>
                    <th className="p-4 font-semibold text-right">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, i) => {
                    const percent = Math.round((sub.score / sub.totalPoints) * 100);
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-800">{sub.studentId}</td>
                        <td className="p-4 text-center font-bold text-gray-700">{sub.score} / {sub.totalPoints}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            percent >= 80 ? 'bg-green-100 text-green-700' :
                            percent >= 50 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {percent}%
                          </span>
                        </td>
                        <td className="p-4 text-right text-sm text-gray-500">
                          {moment(sub.submitTime).format("MMM Do YYYY, h:mm a")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
