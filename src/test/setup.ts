import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock OpenAI
vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: vi.fn()
      }
    };
  }
}));

// Mock environment variables
vi.mock('@vite/env', () => ({
  VITE_OPENAI_API_KEY: 'test-api-key'
}));

// Mock window.crypto for UUID generation
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
    getRandomValues: () => new Uint32Array(10