import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz, useSubmitQuiz } from "../../services/api/quizzes";
import { toast } from "react-toastify";
import Loader from "../../shared/Loader";
// import moment from "moment";
import { getUser } from "../../utils/authTokens";

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = getUser();
  const studentId = user?.email?.toUpperCase() || "unknown"; // Guardian logs in with Student ID as email

  const { data: quiz, isLoading, isError } = useQuiz(id || "");
  const submitQuizMutation = useSubmitQuiz();

  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (quiz) {
      if (answers.length === 0) {
        setAnswers(new Array(quiz.questions.length).fill(-1));
      }
      if (timeLeft === null) {
        setTimeLeft(quiz.durationMinutes * 60);
      }
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleAnswerChange = (qIndex: number, optIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz || !id) return;
    
    // Check for unanswered questions
    if (answers.includes(-1) && timeLeft !== null && timeLeft > 0) {
      const confirm = window.confirm("You have unanswered questions. Are you sure you want to submit?");
      if (!confirm) return;
    }

    try {
      const result = await submitQuizMutation.mutateAsync({
        id,
        attemptData: {
          studentId,
          answers,
          startTime,
          submitTime: new Date().toISOString()
        }
      });
      
      toast.success(`Quiz submitted! You scored ${result.result.score} / ${result.result.totalPoints}`);
      navigate('/dashboard/eportal');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit quiz.");
      navigate('/dashboard/eportal');
    }
  };

  const handleAutoSubmit = async () => {
    toast.info("Time is up! Auto-submitting your quiz.");
    await handleSubmit();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader /></div>;
  if (isError || !quiz) return <div className="text-center py-20 text-red-500">Failed to load quiz.</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-Poppins">
      {/* Sticky Header with Timer */}
      <div className="sticky top-0 z-10 bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold font-Lora text-[#05878F]">{quiz.title}</h1>
          <p className="text-gray-500 text-sm">{quiz.subject} • {quiz.questions.length} Questions</p>
        </div>
        <div className={`text-2xl font-bold font-mono px-4 py-2 rounded-lg ${timeLeft && timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-700'}`}>
          {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
        </div>
        <button 
          onClick={handleSubmit}
          disabled={submitQuizMutation.isPending}
          className="bg-[#05878F] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#046A7E] transition-colors shadow-sm disabled:opacity-50"
        >
          {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>

      {/* Quiz Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 text-gray-700">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <p>{quiz.description}</p>
      </div>

      {/* Questions */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {quiz.questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-teal-300 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                <span className="text-gray-400 mr-2">{qIndex + 1}.</span> 
                {q.questionText}
              </h3>
              <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">{q.points} {q.points === 1 ? 'pt' : 'pts'}</span>
            </div>

            <div className="space-y-3 pl-6">
              {q.options.map((opt, optIndex) => (
                <label 
                  key={optIndex} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    answers[qIndex] === optIndex 
                      ? 'border-[#05878F] bg-teal-50/30 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name={`question-${qIndex}`} 
                    checked={answers[qIndex] === optIndex}
                    onChange={() => handleAnswerChange(qIndex, optIndex)}
                    className="w-5 h-5 text-[#05878F] focus:ring-[#05878F]"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Submit Area */}
      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleSubmit}
          disabled={submitQuizMutation.isPending}
          className="bg-[#05878F] text-white px-10 py-3 rounded-xl font-bold text-lg hover:bg-[#046A7E] transition-colors shadow-md disabled:opacity-50"
        >
          {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
};

export default TakeQuiz;
