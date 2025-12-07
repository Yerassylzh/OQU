import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/geminiClient';
import { Quiz } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { topicId, topicTitle, grade, userInterests, numQuestions = 3 } = await request.json();

    // Validation
    if (!topicId || !topicTitle || !grade || !userInterests || userInterests.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Professional prompt for quiz generation
    const prompt = `Ты профессиональный учитель математики. Создай тест для проверки знаний ученика.

**ИНФОРМАЦИЯ ОБ УЧЕНИКЕ:**
- Класс: ${grade}
- Интересы: ${userInterests.join(', ')} (используй ЛЮБОЙ из этих интересов!)

**ТЕМА ТЕСТА:**
- ${topicTitle}

**ЗАДАНИЕ:**
Создай ${numQuestions} вопроса с множественным выбором. Каждый вопрос должен:
- Быть на уровне ${grade} класса
- По возможности использовать РАЗНЫЕ интересы ученика для контекста (${userInterests.join(', ')})
- Варьировать интересы между вопросами для разнообразия
- Иметь 4 варианта ответа
- Иметь ТОЛЬКО ОДИН правильный ответ

**СОКРАТИЧЕСКАЯ ОБРАТНАЯ СВЯЗЬ:**
Для КАЖДОГО неправильного ответа напиши:
- Почему этот ответ НЕ правильный
- Какую ошибку делает ученик, выбирая его
- Подсказку, как подумать правильно
- 2-3 предложения

Правильный ответ НЕ должен иметь обратной связи (оставь undefined).

**ОБЪЯСНЕНИЕ ПРАВИЛЬНОГО ОТВЕТА:**
Для КАЖДОГО вопроса напиши поле "correctExplanation":
- Почему ПРАВИЛЬНЫЙ ответ является правильным
- Логику и рассуждение за решением
- Как ученик должен был подумать, чтобы найти решение
- 2-3 предложения

**КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:**
- ВСЕ тексты на русском языке
- Вопросы соответствуют программе ${grade} класса
- Сократическая обратная связь помогает ПОНЯТЬ, а не просто говорит "неправильно"
- Объяснение правильного ответа делает решение ЯСНЫМ и логичным
- Используй интересы для мотивации

Верни ТОЛЬКО валидный JSON с такой структурой:
{
  "topicId": "${topicId}",
  "questions": [
    {
      "id": "q1",
      "question": "Текст вопроса...",
      "correctExplanation": "Объяснение правильного ответа (2-3 предложения)",
      "options": [
        {
          "id": "opt-a",
          "text": "Вариант ответа",
          "errorFeedback": "Сократическое объяснение ошибки (2-3 предложения)"
        },
        {
          "id": "opt-b",
          "text": "Правильный ответ",
          "errorFeedback": undefined
        },
        {
          "id": "opt-c",
          "text": "Неправильный вариант",
          "errorFeedback": "Почему это не так..."
        },
        {
          "id": "opt-d",
          "text": "Еще неправильный",
          "errorFeedback": "Объяснение ошибки..."
        }
      ],
      "correctAnswer": "opt-b"
    }
  ]
}

ВАЖНО: errorFeedback = undefined только для правильного ответа!`;

    console.log(`Generating quiz for ${topicTitle}, grade ${grade}`);
    
    // Use centralized client with failover - gemini-2.5-flash model
    const responseText = await generateWithGemini({
      model: "gemini-2.5-flash",
      prompt,
      temperature: 0.7
    });
    
    console.log('Gemini response received, length:', responseText.length);
    
    // Parse AI response
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Handle undefined in JSON (AI might write it as string)
    jsonText = jsonText.replace(/"errorFeedback":\s*undefined/g, '"errorFeedback": null');
    jsonText = jsonText.replace(/"errorFeedback":\s*"undefined"/g, '"errorFeedback": null');

    let quizData: Quiz;
    try {
      quizData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response preview:', responseText.substring(0, 300));
      return NextResponse.json(
        { error: 'AI returned invalid format. Please try again.' },
        { status: 500 }
      );
    }

    // Validate structure
    if (!quizData.questions || quizData.questions.length === 0) {
      console.error('Invalid quiz structure');
      return NextResponse.json(
        { error: 'AI generated incomplete quiz. Please try again.' },
        { status: 500 }
      );
    }

    // Add topicId to each question for compatibility
    quizData.questions = quizData.questions.map(q => ({
      ...q,
      topicId
    }));

    console.log(`Quiz generated successfully: ${quizData.questions.length} questions`);
    return NextResponse.json(quizData);

  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate quiz',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
