"use client";

import { CedarCopilot } from 'cedar-os';
import { cedarConfig } from '../cedar/config';

export default function CedarProvider({ children }) {
  return (
    <CedarCopilot 
      config={{
        agent: cedarConfig.agent
      }}
    >
      {children}
    </CedarCopilot>
  );
}
