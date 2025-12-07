import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/geminiClient';
import { LessonContent } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { topicId, topicTitle, topicDescription, grade, userInterests } = await request.json();

    // Validation
    if (!topicId || !topicTitle || !grade || !userInterests || userInterests.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Professional prompt
    const prompt = `Ты профессиональный учитель математики в Казахстане. Создай персонализированный урок для ученика.

**ИНФОРМАЦИЯ ОБ УЧЕНИКЕ:**
- Класс: ${grade}
- Интересы ученика: ${userInterests.join(', ')} (используй ВСЕ эти интересы для персонализации!)

**ТЕМА УРОКА:**
- ID: ${topicId}
- Название: ${topicTitle}
- Описание: ${topicDescription || 'Математическая тема'}

**ЗАДАНИЕ:**
Создай урок из ТРЕХ карточек, используя ОДИН ИЛИ НЕСКОЛЬКО интересов ученика для персонализации:

1. **МЕТАФОРА (metaphor)** - Свяжи математическую концепцию с интересами ученика
   - Можешь использовать любой из интересов: ${userInterests.join(', ')}
   - Или комбинировать несколько интересов в одном примере!
   - Покажи, как математика применяется в том, что им нравится
   - 2-3 параграфа

2. **ТЕОРИЯ (theory)** - Объясни математическую концепцию
   - Четкое определение
   - Ключевые формулы и правила
   - Пошаговое объяснение
   - Уровень ${grade} класса
   - 2-3 параграфа

3. **ПРИМЕР (example)** - Реши задачу, используя интерес ученика
   - Контекст из ЛЮБОГО интереса ученика (${userInterests.join(', ')})
   - Пошаговое решение
   - Объяснение каждого шага
   - 2-3 параграфа

**КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:**
- ВСЕ тексты на русском языке
- Используй РАЗНЫЕ интересы в разных карточках для разнообразия
- Можешь комбинировать несколько интересов в одном примере
- Уровень сложности для ${grade} класса
- Конкретные примеры, не абстрактные

Верни ТОЛЬКО валидный JSON с такой структурой:
{
  "topicId": "${topicId}",
  "cards": [
    {
      "id": "card-1",
      "type": "metaphor",
      "title": "Заголовок связи с интересом",
      "content": "Детальное объяснение..."
    },
    {
      "id": "card-2",
      "type": "theory",
      "title": "Теория",
      "content": "Математическое объяснение..."
    },
    {
      "id": "card-3",
      "type": "example",
      "title": "Пример из [интереса]",
      "content": "Решение задачи..."
    }
  ]
}`;

    console.log(`Generating lesson for ${topicTitle}, grade ${grade}`);
    
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

    let lessonData: LessonContent;
    try {
      lessonData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response preview:', responseText.substring(0, 300));
      return NextResponse.json(
        { error: 'AI returned invalid format. Please try again.' },
        { status: 500 }
      );
    }

    // Validate structure
    if (!lessonData.cards || lessonData.cards.length !== 3) {
      console.error('Invalid lesson structure');
      return NextResponse.json(
        { error: 'AI generated incomplete lesson. Please try again.' },
        { status: 500 }
      );
    }

    // Add missing interest field for compatibility
    const finalResponse: LessonContent = {
      topicId,
      interest: 'Football', // Legacy field
      cards: lessonData.cards
    };

    console.log(`Lesson generated successfully for ${topicTitle}`);
    return NextResponse.json(finalResponse);

  } catch (error: any) {
    console.error('Lesson generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate lesson',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
