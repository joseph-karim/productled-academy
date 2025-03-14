import { create } from 'zustand';
import type { FormState, Challenge, Solution, ModelType, Feature, UserOutcome, UserJourney, IdealUser, Analysis } from '../types';

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
  setSelectedModel: (model: ModelType | null) => void;
  addFeature: (feature: Feature) => void;
  updateFeature: (id: string, feature: Partial<Feature>) => void;
  removeFeature: (id: string) => void;
  setUserJourney: (journey: UserJourney) => void;
  setAnalysis: (analysis: Analysis | null) => void;
}

export const useFormStore = create<FormStore>((set) => ({
  productDescription: '',
  idealUser: undefined,
  outcomes: [],
  challenges: [],
  solutions: [],
  selectedModel: null,
  freeFeatures: [],
  userJourney: undefined,
  analysis: null,

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

  setAnalysis: (analysis) =>
    set({ analysis }),
}));