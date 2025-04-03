import React from 'react';
import { Signup } from '../core/auth/Signup'; // Assuming Signup component exists

export function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full p-8 bg-[#1c1c1c] rounded-lg shadow-lg border border-[#333333]">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#FFD23F]">Create Academy Account</h1>
        <Signup />
      </div>
    </div>
  );
} 