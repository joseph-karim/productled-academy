// Basic store implementation
import { create } from 'zustand';

export interface FormState {
  title: string;
  productDescription: string;
  idealUser: string;
  outcomes: any[];
  challenges: any[];
  solutions: any[];
  selectedModel: string | null;
  userJourney: any;
  analysis: any;
  
  setTitle: (title: string) => void;
  setProductDescription: (description: string) => void;
  setIdealUser: (user: string) => void;
  setOutcomes: (outcomes: any[]) => void;
  setChallenges: (challenges: any[]) => void;
  setSolutions: (solutions: any[]) => void;
  setSelectedModel: (model: string) => void;
  setUserJourney: (journey: any) => void;
  setAnalysis: (analysis: any) => void;
}

export const useFormStore = create<FormState>((set) => ({
  title: '',
  productDescription: '',
  idealUser: '',
  outcomes: [],
  challenges: [],
  solutions: [],
  selectedModel: null,
  userJourney: null,
  analysis: null,
  
  setTitle: (title) => set({ title }),
  setProductDescription: (productDescription) => set({ productDescription }),
  setIdealUser: (idealUser) => set({ idealUser }),
  setOutcomes: (outcomes) => set({ outcomes }),
  setChallenges: (challenges) => set({ challenges }),
  setSolutions: (solutions) => set({ solutions }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setUserJourney: (userJourney) => set({ userJourney }),
  setAnalysis: (analysis) => set({ analysis }),
}));