import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getModuleData } from '@/core/services/supabase';
import { useAuth } from '@/core/auth/AuthProvider';
import { Loader2, CheckCircle, Lock } from 'lucide-react';

// Define structure for modules
const modules = [
  { key: 'strategy', name: 'Winning Strategy', stage: 1, icon: '🎯', path: '/app/strategy' }, // Placeholder path
  { key: 'user', name: 'Ideal User', stage: 1, icon: '👤', path: '/app/user' }, // Placeholder path
  { key: 'model', name: 'Intentional Model', stage: 1, icon: '🏗️', path: '/app/model' },
  { key: 'offer', name: 'Irresistible Offer', stage: 2, icon: '🎁', path: '/app/offer' }, // Placeholder path
  { key: 'onboarding', name: 'Frictionless Onboarding', stage: 2, icon: '🚀', path: '/app/onboarding' }, // Placeholder path
  { key: 'pricing', name: 'Powerful Pricing', stage: 2, icon: '💲', path: '/app/pricing' }, // Placeholder path
  { key: 'data', name: 'Actionable Data', stage: 3, icon: '📊', path: '/app/data' }, // Placeholder path
  { key: 'process', name: 'Growth Process', stage: 3, icon: '⚙️', path: '/app/process' }, // Placeholder path
  { key: 'team', name: 'Elite Team', stage: 3, icon: '👥', path: '/app/team' }, // Placeholder path
];

const stages = [
  { number: 1, title: 'Build an Unshakeable Foundation', modules: modules.filter(m => m.stage === 1) },
  { number: 2, title: 'Unlock Self-Serve Customers', modules: modules.filter(m => m.stage === 2) },
  { number: 3, title: 'Ignite Exponential Expansion', modules: modules.filter(m => m.stage === 3) },
];

export function AcademyDashboard() {
  const { user } = useAuth();
  const [moduleStatus, setModuleStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!user) return;
      setIsLoading(true);
      const statusPromises = modules.map(async (module) => {
        try {
          const data = await getModuleData(module.key);
          return { [module.key]: !!data }; // Mark as complete if any data exists
        } catch (error) {
          console.error(`Error fetching status for ${module.key}:`, error);
          return { [module.key]: false }; // Assume not complete on error
        }
      });
      const results = await Promise.all(statusPromises);
      const combinedStatus = results.reduce((acc, current) => ({ ...acc, ...current }), {});
      setModuleStatus(combinedStatus);
      setIsLoading(false);
    };

    fetchStatuses();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="w-8 h-8 text-[#FFD23F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold text-white text-center">Welcome to the ProductLed Academy</h1>
      {stages.map((stage) => (
        <div key={stage.number} className="bg-[#1c1c1c] border border-[#333333] rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-[#FFD23F] mb-1">Stage {stage.number}</h2>
          <p className="text-lg text-gray-300 mb-6">{stage.title}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stage.modules.map((module) => {
              const isComplete = moduleStatus[module.key] || false;
              // Basic logic: only 'model' is unlocked initially
              const isUnlocked = module.key === 'model'; 
              
              return (
                <Link 
                  key={module.key}
                  to={isUnlocked ? module.path : '#'} 
                  className={`block p-6 rounded-lg border transition-all duration-200 ease-in-out transform hover:-translate-y-1 ${ 
                    isUnlocked 
                      ? 'bg-[#2a2a2a] border-[#444444] hover:border-[#FFD23F] shadow-md' 
                      : 'bg-gray-800 border-gray-700 cursor-not-allowed opacity-60'
                  }`}
                  onClick={(e) => !isUnlocked && e.preventDefault()} // Prevent navigation for locked modules
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-3xl">{module.icon}</span>
                    {isUnlocked ? (
                      isComplete ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD23F]/20 text-[#FFD23F] border border-[#FFD23F]/50">In Progress</span>
                      )
                    ) : (
                      <Lock className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <h3 className="text-xl font-medium text-white mb-1">{module.name}</h3>
                  <p className="text-sm text-gray-400">Component #{modules.findIndex(m => m.key === module.key) + 1}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
} 