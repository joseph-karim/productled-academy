import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Supabase client and exports
vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { 
          user: { 
            id: 'test-user-id',
            email: 'test@example.com'
          }
        }, 
        error: null 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ 
        data: { 
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com'
            }
          }
        }, 
        error: null 
      }),
      setSession: vi.fn().mockResolvedValue({ error: null })
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: {
          id: 'test-id',
          pricing_strategy: {
            model: 'freemium',
            basis: 'per-user',
            freePackage: {
              limitations: ['100 users'],
              conversionGoals: ['Team collaboration'],
              features: []
            },
            paidPackage: {
              valueMetrics: ['Active users'],
              targetConversion: 10,
              features: []
            }
          }
        }, 
        error: null 
      }),
      delete: vi.fn().mockResolvedValue({ error: null }),
      order: vi.fn().mockReturnThis()
    }))
  },
  saveAnalysis: vi.fn().mockImplementation((data) => Promise.resolve({ 
    id: 'test-id', 
    ...data,
    pricing_strategy: data.pricingStrategy 
  })),
  updateAnalysis: vi.fn().mockImplementation((id, data) => Promise.resolve({ 
    id, 
    ...data,
    pricing_strategy: data.pricingStrategy 
  })),
  getSharedAnalysis: vi.fn().mockImplementation((shareId) => Promise.resolve({
    id: 'test-id',
    share_id: shareId,
    is_public: true,
    pricing_strategy: {
      model: 'freemium',
      basis: 'per-user',
      freePackage: {
        limitations: ['100 users'],
        conversionGoals: ['Team collaboration'],
        features: []
      },
      paidPackage: {
        valueMetrics: ['Active users'],
        targetConversion: 10,
        features: []
      }
    }
  })),
  shareAnalysis: vi.fn().mockResolvedValue('test-share-id'),
  deleteAnalysis: vi.fn().mockResolvedValue(undefined),
  getAnalyses: vi.fn().mockResolvedValue([]),
  getAnalysis: vi.fn().mockResolvedValue({ id: 'test-id' }),
  createAnalysis: vi.fn().mockResolvedValue({ id: 'test-id' })
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: vi.fn().mockImplementation((params) => {
          if (params.messages[1].content.includes('invalid json')) {
            return Promise.resolve({
              choices: [{
                message: {
                  function_call: {
                    name: 'provide_analysis',
                    arguments: 'invalid json'
                  }
                }
              }]
            });
          }

          if (params.messages[1].content.includes('missing fields')) {
            return Promise.resolve({
              choices: [{
                message: {
                  function_call: {
                    name: 'provide_analysis',
                    arguments: JSON.stringify({
                      summary: 'Test summary',
                      strengths: [],
                      weaknesses: []
                      // Missing required fields to test error handling
                    })
                  }
                }
              }]
            });
          }

          return Promise.resolve({
            choices: [{
              message: {
                function_call: {
                  name: 'provide_analysis',
                  arguments: JSON.stringify({
                    deepScore: {
                      desirability: 8,
                      effectiveness: 7,
                      efficiency: 7,
                      polish: 6
                    },
                    summary: 'Test summary',
                    strengths: [],
                    weaknesses: [],
                    recommendations: [],
                    componentScores: {
                      productDescription: 85,
                      idealUser: 80,
                      userEndgame: 75,
                      challenges: 70,
                      solutions: 75,
                      modelSelection: 80,
                      packageDesign: 70,
                      pricingStrategy: 75
                    },
                    componentFeedback: {
                      productDescription: { strengths: [], recommendations: [] },
                      idealUser: { strengths: [], recommendations: [] },
                      userEndgame: { strengths: [], recommendations: [] },
                      challenges: { strengths: [], recommendations: [] },
                      solutions: { strengths: [], recommendations: [] },
                      modelSelection: { strengths: [], recommendations: [], analysis: '', considerations: [] },
                      packageDesign: { strengths: [], recommendations: [], analysis: '', balanceScore: 75 },
                      pricingStrategy: { strengths: [], recommendations: [], analysis: '', conversionPotential: 80 }
                    },
                    actionPlan: {
                      immediate: [],
                      medium: [],
                      long: []
                    },
                    testing: {
                      abTests: [],
                      metrics: []
                    },
                    journeyAnalysis: {
                      overview: '',
                      discovery: { score: 0, analysis: '', strengths: [], suggestions: [] },
                      signup: { score: 0, analysis: '', strengths: [], suggestions: [] },
                      activation: { score: 0, analysis: '', strengths: [], suggestions: [] },
                      engagement: { score: 0, analysis: '', strengths: [], suggestions: [] },
                      conversion: { score: 0, analysis: '', strengths: [], suggestions: [] }
                    }
                  })
                }
              }
            }]
          });
        })
      }
    };
  }
}));

// Mock environment variables
vi.mock('@vite/env', () => ({
  VITE_OPENAI_API_KEY: 'test-api-key',
  VITE_SUPABASE_URL: 'http://localhost:54321',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key'
}));

// Mock canvas
const mockContext2D = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  closePath: vi.fn(),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  transform: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 })
};

// Mock HTMLCanvasElement
class MockCanvasElement extends HTMLCanvasElement {
  getContext(contextType: string) {
    if (contextType === '2d') return mockContext2D;
    return null;
  }
}

// @ts-ignore - Override HTMLCanvasElement
global.HTMLCanvasElement = MockCanvasElement;
global.HTMLCanvasElement.prototype.getContext = function(contextType: string) {
  if (contextType === '2d') return mockContext2D;
  return null;
};

// Mock window.crypto
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
    getRandomValues: () => new Uint32Array(10).fill(1)
  }
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
});

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: class MockChart {
    static register() {}
  },
  RadialLinearScale: class {},
  PointElement: class {},
  LineElement: class {},
  Filler: class {},
  Tooltip: class {},
  Legend: class {},
  CategoryScale: class {},
  LinearScale: class {},
  BarElement: class {}
}));

// Mock VAPI
vi.mock('@vapi-ai/web', () => ({
  default: class MockVapi {
    constructor() {}
    start() {}
    stop() {}
    setMuted() {}
  }
}));

// Mock Daily.co
vi.mock('@daily-co/daily-js', () => ({
  DailyIframe: class MockDailyIframe {
    constructor() {}
    createFrame() {}
    join() {}
    leave() {}
  }
}));