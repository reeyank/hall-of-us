"use client";

import { CedarCopilot } from 'cedar-os';
import { AuthProvider } from './AuthProvider';
import CedarProvider from './CedarProvider';

export default function ClientWrapper({ children }) {
  return (
      <CedarCopilot
			llmProvider={{
				provider: 'custom',
				config: {
					baseURL: 'http://localhost:8000',
				},
			}}>
      <AuthProvider>
          {children}
      </AuthProvider>
    </CedarCopilot>
  );
}
