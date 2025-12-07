'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopicCard from '@/components/TopicCard';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getTopicsByGrade } from '@/lib/mockData';
import { Grade } from '@/types';

const GRADES: Grade[] = [7, 8, 9, 10, 11];

export default function DashboardPage() {
  const router = useRouter();
  const { getBadgeState, getTopicScore, hasInterests } = useGlobalContext();
  const [selectedGrade, setSelectedGrade] = useState<Grade>(7);

  // Redirect to onboarding if user hasn't selected interests yet
  useEffect(() => {
    if (!hasInterests) {
      router.push('/');
    }
  }, [hasInterests, router]);

  const topics = getTopicsByGrade(selectedGrade);

  const handleTopicClick = (topicId: string) => {
    router.push(`/lesson/${topicId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Панель обучения
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
                Выберите тему для изучения
              </p>
            </div>
            <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push('/settings')}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2.5 md:py-3 bg-gray-600 text-white 
                           rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 
                           shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
              >
                ⚙️ <span className="hidden sm:inline">Настройки</span>
              </button>
              <button
                onClick={() => router.push('/history')}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2.5 md:py-3 bg-purple-600 text-white 
                           rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 
                           shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
              >
                📚 <span className="hidden sm:inline">История</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Grade Selector - Mobile Scrollable */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xs md:text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            Выберите класс
          </h2>
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {GRADES.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`
                  flex-shrink-0 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold 
                  transition-all duration-200 text-sm md:text-base
                  ${selectedGrade === grade
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                {grade} класс
              </button>
            ))}
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Темы
          </h2>
          {topics.map((topic) => {
            const badgeState = getBadgeState(topic.id);
            const scoreData = getTopicScore(topic.id);
            
            return (
              <TopicCard
                key={topic.id}
                title={topic.title}
                description={topic.description}
                badgeState={badgeState}
                score={scoreData?.score ?? null}
                onClick={() => handleTopicClick(topic.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
