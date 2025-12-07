interface LoadingSpinnerProps {
  topic: string;
}

export default function LoadingSpinner({ topic }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="relative inline-block">
          {/* Spinner */}
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          
          {/* Inner pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            Персонализация урока...
          </h2>
          <p className="text-lg text-gray-600">
            Преобразование <span className="font-semibold text-blue-600">{topic}</span> под ваши интересы
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 justify-center mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
