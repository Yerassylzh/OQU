import { BadgeState } from '@/types';

interface TopicCardProps {
  title: string;
  description: string;
  badgeState: BadgeState;
  score: number | null;
  onClick: () => void;
}

export default function TopicCard({ title, description, badgeState, score, onClick }: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-6 bg-white rounded-xl border-2 border-gray-200 
                 hover:border-blue-300 hover:shadow-lg transition-all duration-200
                 flex items-center justify-between group"
    >
      <div className="text-left flex-1">
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      <div className="ml-6">
        {badgeState === 'not-started' && (
          <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
            Не начато
          </div>
        )}

        {badgeState === 'mastered' && score !== null && (
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold
                          border-2 border-green-300">
            ✓ {score}%
          </div>
        )}

        {badgeState === 'needs-revision' && score !== null && (
          <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold
                          border-2 border-red-300 animate-pulse">
            ⚠ {score}% - Повторить!
          </div>
        )}
      </div>
    </button>
  );
}
