"use client";

import { AuthProvider } from './AuthProvider';
import CedarProvider from './CedarProvider';

export default function ClientWrapper({ children }) {
  return (
    <AuthProvider>
      <CedarProvider>
        {children}
      </CedarProvider>
    </AuthProvider>
  );
}
