import { create } from 'zustand';
import type { Challenge, Solution, ModelType, StoredAnalysis, UserJourney } from '../services/ai/analysis/types';

interface UserOutcome { level: string; text: string; /* Add other properties if needed */ }
interface IdealUser { 
  title: string; 
  description: string; 
  motivation: 'Low' | 'Medium' | 'High'; 
  ability: 'Low' | 'Medium' | 'High';
  traits: string[];
  impact: string;
}

export interface FormState { // Define basic FormState structure if not importable
  title: string;
  productDescription: string;
  idealUser?: IdealUser;
  outcomes: UserOutcome[];
  challenges: Challenge[];
  solutions: Solution[];
  selectedModel: ModelType | null;
  userJourney?: UserJourney;
  callToAction?: string;
  analysis?: StoredAnalysis | null;
  processingState: { [key: string]: boolean };
}

export interface FormActions {
  setTitle: (title: string) => void;
  setProductDescription: (description: string) => void;
  setIdealUser: (user: IdealUser | undefined) => void;
  addOutcome: (outcome: UserOutcome) => void;
  updateOutcome: (level: string, text: string) => void;
  addChallenge: (challenge: Challenge) => void;
  updateChallenge: (id: string, challenge: Partial<Challenge>) => void;
  removeChallenge: (id: string) => void;
  addSolution: (solution: Solution) => void;
  updateSolution: (id: string, solution: Partial<Solution>) => void;
  removeSolution: (id: string) => void;
  addCoreSolution: (solution: Solution) => void;
  setSelectedModel: (model: ModelType | null) => void;
  setUserJourney: (journey: UserJourney) => void;
  setCallToAction: (text: string) => void;
  setAnalysis: (analysis: StoredAnalysis | null) => void;
  setProcessingState: (state: { [key: string]: boolean }) => void;
  resetState: () => void;
}

export type FormStore = FormState & FormActions;

import { devtools } from 'zustand/middleware';

const initialState: FormState = {
  title: '',
  productDescription: '',
  idealUser: undefined,
  outcomes: [],
  challenges: [],
  solutions: [],
  selectedModel: null,
  userJourney: undefined,
  callToAction: undefined,
  analysis: null,
  processingState: {},
};

export const useModelInputsStore = create<FormStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setTitle: (title: string) => set({ title }),

      setProductDescription: (description: string) =>
        set({ productDescription: description }),

      setIdealUser: (user: IdealUser | undefined) =>
        set({ idealUser: user }),

      addOutcome: (outcome: UserOutcome) =>
        set((state: FormState) => ({
          outcomes: [...state.outcomes.filter((o: UserOutcome) => o.level !== outcome.level), outcome]
        })),

      updateOutcome: (level: string, text: string) =>
        set((state: FormState) => ({
          outcomes: [
            ...state.outcomes.filter((o: UserOutcome) => o.level !== level),
            { level, text }
          ]
        })),

      addChallenge: (challenge: Challenge) =>
        set((state: FormState) => ({
          challenges: [...state.challenges, challenge],
        })),

      updateChallenge: (id: string, challenge: Partial<Challenge>) => 
        set((state: FormState) => ({ 
          challenges: state.challenges.map((c: Challenge) => 
            c.id === id ? { ...c, ...challenge } : c
          ),
        })),

      removeChallenge: (id: string) => 
        set((state: FormState) => ({ 
          challenges: state.challenges.filter((c: Challenge) => c.id !== id), 
          solutions: state.solutions.filter((s: any) => s.challengeId !== id), 
        })),

      addSolution: (solution: Solution) => 
        set((state: FormState) => ({ 
          solutions: [...state.solutions, solution],
        })),

      updateSolution: (id: string, solution: Partial<Solution>) => 
        set((state: FormState) => ({ 
          solutions: state.solutions.map((s: Solution) => 
            s.id === id ? { ...s, ...solution } : s
          ),
        })),

      removeSolution: (id: string) => 
        set((state: FormState) => ({ 
          solutions: state.solutions.filter((s: Solution) => s.id !== id), 
        })),

      addCoreSolution: (solution: Solution) => 
        set((state: FormState) => ({ 
          solutions: [...state.solutions, { ...(solution as any), category: 'core' }], 
        })),

      setSelectedModel: (model: ModelType | null) => 
        set({ selectedModel: model }),


      setUserJourney: (journey: UserJourney) => 
        set({ userJourney: journey }),

      setCallToAction: (text: string) => 
        set({ callToAction: text }),

      setAnalysis: (analysis: StoredAnalysis | null) => 
        set({ analysis }),

      setProcessingState: (state: { [key: string]: boolean }) => 
        set((prev: FormState) => ({ 
          processingState: { ...prev.processingState, ...state }
        })),

      resetState: () => set(initialState)
    }),
    { name: 'model-inputs-store' }
  )
);