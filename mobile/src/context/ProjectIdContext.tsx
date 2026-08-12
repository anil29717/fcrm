import { createContext, useContext } from 'react';

const ProjectIdContext = createContext<number | null>(null);

export const ProjectIdProvider = ProjectIdContext.Provider;

export function useProjectIdFromContext(): number | null {
  return useContext(ProjectIdContext);
}
