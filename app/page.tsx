'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InterestSelector from '@/components/InterestSelector';
import { useGlobalContext } from '@/context/GlobalProvider';

// Interest categories - Russian version
const INTEREST_CATEGORIES = [
  {
    name: "Музыка",
    icon: "🎧",
    options: [
      { label: "Поп", icon: "🎤" },
      { label: "Рэп", icon: "🎧" },
      { label: "Рок", icon: "🎸" },
      { label: "EDM", icon: "🎛" },
      { label: "Джаз", icon: "🎷" },
      { label: "Инди", icon: "🎵" },
    ],
  },
  {
    name: "Спорт",
    icon: "⚽",
    options: [
      { label: "Футбол", icon: "⚽" },
      { label: "Бокс", icon: "🥊" },
      { label: "Бег", icon: "🏃" },
      { label: "Плавание", icon: "🏊" },
      { label: "Баскетбол", icon: "🏀" },
      { label: "Тренажеры", icon: "🏋" },
    ],
  },
  {
    name: "Игры",
    icon: "🎮",
    options: [
      { label: "Шутеры", icon: "🔫" },
      { label: "RPG", icon: "🗡" },
      { label: "MOBA", icon: "⚔" },
      { label: "Гонки", icon: "🏎" },
      { label: "Приключения", icon: "🧭" },
    ],
  },
  {
    name: "Фильмы",
    icon: "🎬",
    options: [
      { label: "Ужасы", icon: "👻" },
      { label: "Аниме", icon: "🍥" },
      { label: "Комедия", icon: "😂" },
      { label: "Драма", icon: "🎭" },
      { label: "Фантастика", icon: "🚀" },
    ],
  },
  {
    name: "Еда",
    icon: "🍔",
    options: [
      { label: "Пицца", icon: "🍕" },
      { label: "Суши", icon: "🍣" },
      { label: "Бургеры", icon: "🍔" },
      { label: "Десерты", icon: "🍰" },
      { label: "Азиатская кухня", icon: "🍜" },
    ],
  },
  {
    name: "Технологии",
    icon: "💻",
    options: [
      { label: "ИИ", icon: "🤖" },
      { label: "Гаджеты", icon: "📱" },
      { label: "Программирование", icon: "⌨" },
      { label: "VR/AR", icon: "🕶" },
    ],
  },
  {
    name: "Путешествия",
    icon: "✈",
    options: [
      { label: "Горы", icon: "🏔" },
      { label: "Море", icon: "🏖" },
      { label: "Города", icon: "🌆" },
      { label: "Европа", icon: "🇪🇺" },
      { label: "Азия", icon: "🌏" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserInterests, hasInterests } = useGlobalContext();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Auto-redirect to dashboard if user already has interests
  useEffect(() => {
    if (hasInterests) {
      router.push('/dashboard');
    }
  }, [hasInterests, router]);

  const toggleInterest = (interestLabel: string) => {
    if (selectedInterests.includes(interestLabel)) {
      setSelectedInterests(selectedInterests.filter(label => label !== interestLabel));
    } else {
      setSelectedInterests([...selectedInterests, interestLabel]);
    }
  };

  const handleContinue = () => {
    if (selectedInterests.length > 0) {
      // Save ALL selected interests
      setUserInterests(selectedInterests);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 
                    flex items-center justify-center p-4 md:p-6">
      {/* Main Card - Fixed height, centered */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
           style={{ maxHeight: '90vh' }}>
        
        {/* Header - Fixed at top */}
        <div className="p-6 md:p-8 text-center border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r 
                          from-pink-500 to-purple-600 rounded-2xl mb-3">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Выберите свои интересы
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            Чем больше расскажете — тем лучше мы настроим контент! ✨
          </p>
        </div>

        {/* Scrollable Categories Box */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          <InterestSelector
            selectedInterests={selectedInterests}
            onToggle={toggleInterest}
            categories={INTEREST_CATEGORIES}
          />
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleContinue}
            disabled={selectedInterests.length === 0}
            className={`
              w-full py-3.5 md:py-4 rounded-xl text-base md:text-lg font-semibold 
              transition-all duration-300
              ${selectedInterests.length > 0
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {selectedInterests.length > 0
              ? `Продолжить (${selectedInterests.length} выбрано)`
              : 'Выберите хотя бы один интерес'}
          </button>
        </div>
      </div>
    </div>
  );
}
