"use client";

import { AuthProvider } from './AuthProvider';

export default function ClientWrapper({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
