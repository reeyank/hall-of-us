"use client";

import { CedarCopilot } from 'cedar-os';

export default function CedarProvider({ children }) {
  return (
    <CedarCopilot
      llmProvider={{
        // provider: 'openai',
        // apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        baseURL: 'http://localhost:8000', // Your LangChain backend URL
      }}
    >
      {children}
    </CedarCopilot>
  );
}
