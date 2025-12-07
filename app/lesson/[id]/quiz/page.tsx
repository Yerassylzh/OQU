'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuizQuestion from '@/components/QuizQuestion';
import { useGlobalContext } from '@/context/GlobalProvider';
import { fetchQuiz } from '@/lib/aiService'; // Now uses AI!
import { getTopicById } from '@/lib/mockData';
import { Quiz } from '@/types';

interface QuizAnswer {
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
  feedback?: string;
  correctExplanation?: string; // Explanation for why correct answer is correct
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { userInterests } = useGlobalContext();
  const topicId = params.id as string;

  const topic = getTopicById(topicId);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to prevent duplicate quiz loads in React Strict Mode
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Guard: Prevent duplicate execution during Strict Mode double-mount
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadQuiz = async () => {
      setIsLoading(true);
      const quizData = await fetchQuiz(topicId, userInterests);
      setQuiz(quizData);
      setIsLoading(false);
    };

    loadQuiz();
  }, [topicId, userInterests]);

  const handleNext = (answerData: QuizAnswer) => {
    const updatedAnswers = [...answers, answerData];
    setAnswers(updatedAnswers);

    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finished all questions - store results in sessionStorage
      const correctCount = updatedAnswers.filter(a => a.isCorrect).length;
      
      // Store quiz results in sessionStorage (avoids HTTP 431 from long URLs)
      sessionStorage.setItem('quiz_results', JSON.stringify({
        topicId,
        score: correctCount,
        total: quiz.questions.length,
        answers: updatedAnswers,
        timestamp: Date.now()
      }));
      
      // Navigate with clean URL (no query parameters)
      router.push(`/lesson/${topicId}/result`);
    }
  };

  if (isLoading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка теста...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const correctSoFar = answers.filter(a => a.isCorrect).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-purple-600 hover:text-purple-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Выйти из теста
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Проверка знаний</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">Вопрос {currentQuestionIndex + 1} из {quiz.questions.length}</p>
              <p className="text-sm font-semibold text-green-600">{correctSoFar} правильных ответов</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Quiz Question Component */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <QuizQuestion
            key={currentQuestion.id}
            questionId={currentQuestion.id}
            question={currentQuestion.question}
            options={currentQuestion.options}
            correctAnswer={currentQuestion.correctAnswer}
            correctExplanation={currentQuestion.correctExplanation}
            onNext={handleNext}
          />
        </div>

        {/* Hint */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 Не торопитесь. В конце вы увидите подробные объяснения!
          </p>
        </div>
      </div>
    </div>
  );
}
