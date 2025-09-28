'use client';

import { OpenAIClient } from 'cedar-os/lib/store/agentConnection/providers/openai';

// Debug logging
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
console.log('API Key status:', {
  exists: !!apiKey,
  length: apiKey?.length,
  startsWith: apiKey?.slice(0, 3),
  envKeys: Object.keys(process.env).filter(key => key.includes('OPENAI'))
});

export const cedarConfig = {
  agent: new OpenAIClient({
    apiKey: apiKey,
    model: 'gpt-3.5-turbo',
    onError: (error) => {
      console.error('Cedar OpenAI Error:', {
        status: error.status,
        message: error.message,
        details: error
      });
    }
  })
};