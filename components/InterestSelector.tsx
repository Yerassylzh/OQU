import { Interest } from '@/types';

interface InterestCategory {
  name: string;
  icon: string;
  options: { label: string; icon: string }[];
}

interface InterestSelectorProps {
  selectedInterests: string[];
  onToggle: (interest: string) => void;
  categories: InterestCategory[];
}

export default function InterestSelector({ selectedInterests, onToggle, categories }: InterestSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {categories.map((category) => (
        <div
          key={category.name}
          className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 
                     hover:border-purple-200 transition-all duration-200"
        >
          {/* Category Header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
            <span className="text-2xl">{category.icon}</span>
            <h3 className="text-base font-bold text-gray-800">{category.name}</h3>
          </div>

          {/* Interest Pills */}
          <div className="flex flex-wrap gap-2">
            {category.options.map((option) => (
              <button
                key={option.label}
                onClick={() => onToggle(option.label)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                  flex items-center gap-1.5 border
                  ${selectedInterests.includes(option.label)
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }
                `}
              >
                <span className="text-sm">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
