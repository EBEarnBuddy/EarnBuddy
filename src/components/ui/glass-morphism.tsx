import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassMorphismProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
}

export const GlassMorphism: React.FC<GlassMorphismProps> = ({ 
  children, 
  className, 
  intensity = 'medium',
  ...props 
}) => {
  const intensityClasses = {
    light: 'bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm',
    medium: 'bg-white/50 dark:bg-gray-900/50 backdrop-blur-md',
    heavy: 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl'
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl dark:shadow-gray-900/20",
        intensityClasses[intensity],
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/10 dark:before:from-gray-800/10 before:to-transparent before:pointer-events-none",
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};