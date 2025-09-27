"use client";

import { CedarCopilot } from 'cedar-os';

export default function CedarProvider({ children }) {
  return (
    <CedarCopilot
      llmProvider={{
        provider: 'openai',
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        // Uncomment and configure if using custom backend
        // baseURL: 'http://localhost:4111',
      }}
    >
      {children}
    </CedarCopilot>
  );
}