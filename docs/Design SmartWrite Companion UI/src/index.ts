// Main entry point for SmartWrite Companion
// This file exports the main App component and all individual modules

export { default as SmartWriteCompanion } from './App';

// Export individual modules for custom usage
export {
  SessionStats,
  TextMetrics,
  Readability,
  Suggestions,
  PersonaAnalysis
} from './components';

// Export types if needed for TypeScript consumers
export type ModuleStates = {
  sessionStats: boolean;
  textMetrics: boolean;
  readability: boolean;
  suggestions: boolean;
  personaAnalysis: boolean;
};

export type SessionData = {
  wordCount: number;
  goalCount: number;
  sessionTime: number;
  writingPace: number;
};

export type TextMetricsData = {
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  uniqueWords: number;
};

export type Suggestion = {
  type: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
};

export type ReadabilityFormula = 'flesch-reading' | 'flesch-kincaid' | 'gunning-fog';

export type ReadabilityScore = {
  score: number;
  label: string;
  secondaryScores: Array<{
    name: string;
    value: string;
  }>;
};
