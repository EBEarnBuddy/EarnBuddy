import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { seedPermanentProjects } from '../lib/seedProjects';

const AdminSeedButton: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const handleSeedProjects = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const count = await seedPermanentProjects();
      setResult({
        success: true,
        message: `Successfully seeded ${count} projects!`,
        count
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Failed to seed projects: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        onClick={handleSeedProjects}
        disabled={isSeeding}
        className={`px-4 py-3 rounded-lg shadow-lg font-medium transition-all duration-300 flex items-center gap-2 ${
          isSeeding
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-xl'
        }`}
        whileHover={!isSeeding ? { scale: 1.05 } : {}}
        whileTap={!isSeeding ? { scale: 0.95 } : {}}
      >
        {isSeeding ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Database className="w-5 h-5" />
        )}
        {isSeeding ? 'Seeding...' : 'Seed Projects'}
      </motion.button>

      {/* Result notification */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mt-3 p-3 rounded-lg shadow-lg max-w-sm ${
            result.success
              ? 'bg-green-100 border border-green-300 text-green-800'
              : 'bg-red-100 border border-red-300 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{result.message}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminSeedButton;