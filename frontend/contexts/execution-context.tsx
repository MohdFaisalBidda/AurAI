// contexts/execution-context.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useExecution, Execution } from '@/hooks/useExecution';

interface ExecutionContextType {
  executions: Execution[];
  loading: boolean;
  createNewExecution: (title?: string) => string;
  refreshExecutions: () => void;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined);

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const executionContext = useExecution();

  return (
    <ExecutionContext.Provider value={executionContext}>
      {children}
    </ExecutionContext.Provider>
  );
}

export function useExecutionContext() {
  const context = useContext(ExecutionContext);
  if (context === undefined) {
    throw new Error('useExecutionContext must be used within an ExecutionProvider');
  }
  return context;
}