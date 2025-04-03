import { create } from 'zustand';
import type { FormState, Challenge, Solution, ModelType, Feature, UserOutcome, UserJourney, IdealUser, Analysis } from '../types';
import { devtools } from 'zustand/middleware';

interface FormStore extends FormState {
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
  addFeature: (feature: Feature) => void;
  updateFeature: (id: string, feature: Partial<Feature>) => void;
  removeFeature: (id: string) => void;
  setUserJourney: (journey: UserJourney) => void;
  setCallToAction: (text: string) => void;
  setAnalysis: (analysis: Analysis | null) => void;
  setProcessingState: (state: { [key: string]: boolean }) => void;
  resetState: () => void;
  setTitle: (title: string) => void;
}

const initialState = {
  title: '',
  productDescription: '',
  idealUser: undefined,
  outcomes: [],
  challenges: [],
  solutions: [],
  selectedModel: null,
  freeFeatures: [],
  userJourney: undefined,
  callToAction: undefined,
  analysis: null,
  processingState: {},
};

export const useModelInputsStore = create<FormState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setTitle: (title) => set({ title }),

      setProductDescription: (description) =>
        set({ productDescription: description }),

      setIdealUser: (user) =>
        set({ idealUser: user }),

      addOutcome: (outcome) =>
        set((state) => ({
          outcomes: [...state.outcomes.filter(o => o.level !== outcome.level), outcome]
        })),

      updateOutcome: (level, text) =>
        set((state) => ({
          outcomes: [
            ...state.outcomes.filter(o => o.level !== level),
            { level, text }
          ]
        })),

      addChallenge: (challenge) =>
        set((state) => ({
          challenges: [...state.challenges, challenge],
        })),

      updateChallenge: (id, challenge) =>
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === id ? { ...c, ...challenge } : c
          ),
        })),

      removeChallenge: (id) =>
        set((state) => ({
          challenges: state.challenges.filter((c) => c.id !== id),
          solutions: state.solutions.filter((s) => s.challengeId !== id),
        })),

      addSolution: (solution) =>
        set((state) => ({
          solutions: [...state.solutions, solution],
        })),

      updateSolution: (id, solution) =>
        set((state) => ({
          solutions: state.solutions.map((s) =>
            s.id === id ? { ...s, ...solution } : s
          ),
        })),

      removeSolution: (id) =>
        set((state) => ({
          solutions: state.solutions.filter((s) => s.id !== id),
        })),

      addCoreSolution: (solution) =>
        set((state) => ({
          solutions: [...state.solutions, { ...solution, category: 'core' }],
        })),

      setSelectedModel: (model) =>
        set({ selectedModel: model }),

      addFeature: (feature) =>
        set((state) => ({
          freeFeatures: [...state.freeFeatures, feature],
        })),

      updateFeature: (id, feature) =>
        set((state) => ({
          freeFeatures: state.freeFeatures.map((f) =>
            f.id === id ? { ...f, ...feature } : f
          ),
        })),

      removeFeature: (id) =>
        set((state) => ({
          freeFeatures: state.freeFeatures.filter((f) => f.id !== id),
        })),

      setUserJourney: (journey) =>
        set({ userJourney: journey }),

      setCallToAction: (text) =>
        set({ callToAction: text }),

      setAnalysis: (analysis) =>
        set({ analysis }),

      setProcessingState: (state) =>
        set((prev) => ({ 
          processingState: { ...prev.processingState, ...state }
        })),

      resetState: () => set(initialState)
    }),
    { name: 'model-inputs-store' }
  )
);