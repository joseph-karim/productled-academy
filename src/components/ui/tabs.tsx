import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, className = '', children }: TabsProps) {
  return (
    <div className={`${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className = '', children }: TabsListProps) {
  return (
    <div className={`flex bg-[#1A1A1A] rounded-lg p-1 ${className}`}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  // These are passed by Tabs parent
  activeValue?: string;
}

export function TabsTrigger({ 
  value, 
  className = '', 
  disabled = false, 
  children,
  onValueChange,
  ...props
}: TabsTriggerProps) {
  const isActive = props.activeValue === value;
  
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
        ${isActive 
          ? 'bg-[#FFD23F] text-[#1C1C1C]' 
          : 'text-gray-300 hover:text-white'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
      onClick={() => !disabled && onValueChange && onValueChange(value)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  // These are passed by Tabs parent
  activeValue?: string;
}

export function TabsContent({ 
  value, 
  className = '', 
  children,
  ...props
}: TabsContentProps) {
  if (props.activeValue !== value) {
    return null;
  }
  
  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
} 