import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AiAssistantScreen } from '@/src/features/ai/AiAssistantScreen';

export default function AiPage() {
  const params = useLocalSearchParams<{
    mode?: 'dashboard' | 'lesson';
    class_id?: string;
    course_id?: string;
    chapterId?: string;
    lessonId?: string;
  }>();

  return (
    <AiAssistantScreen
      mode={params.mode || 'dashboard'}
      class_id={params.class_id}
      course_id={params.course_id}
      chapterId={params.chapterId}
      lessonId={params.lessonId}
    />
  );
}
