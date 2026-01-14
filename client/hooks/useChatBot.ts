'use client';

import { useState, useCallback } from 'react';

interface UseChatBotReturn {
  askBot: (question: string, roomContext?: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export const useChatBot = (): UseChatBotReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askBot = useCallback(async (question: string, roomContext?: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: question,
          context: roomContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      const data = await response.json();
      return data.text;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { askBot, isLoading, error };
};
