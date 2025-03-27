import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AuthButton } from '../auth/AuthButton';
import { FileText } from 'lucide-react';

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="bg-[#1C1C1C] border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-grow-0">
            {user && (
              <Link 
                to="/my-analyses"
                className="flex items-center text-gray-300 hover:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                My Analyses
              </Link>
            )}
          </div>
          
          <div className="flex items-center justify-center flex-grow">
            <Link to="/" className="flex items-baseline">
              <span className="text-2xl font-bold text-white">ProductLed</span>
              <div className="w-1.5 h-1.5 ml-0.5 mb-1 bg-[#FFD23F] rounded-full" />
              <span className="ml-3 text-gray-400">Free Model Analyzer</span>
            </Link>
          </div>
          
          <div className="flex-grow-0">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}