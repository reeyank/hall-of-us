"use client";

import { CedarCopilot } from 'cedar-os';
import LangChainProvider from './LangChainProvider';

export default function CedarProvider({ children }) {
  console.log('CedarProvider: Rendering CedarCopilot with LangChainProvider');
  return (
    <CedarCopilot llmProvider={LangChainProvider}>
      {children}
    </CedarCopilot>
  );
}
