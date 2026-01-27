import React from 'react';
import { ApiSuccessResponse, Classification } from '../types';
import { CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalysisResultProps {
  result: ApiSuccessResponse;
}

const AnalysisResultCard: React.FC<AnalysisResultProps> = ({ result }) => {
  const isHuman = result.classification === Classification.HUMAN;
  
  const scorePercent = Math.round(result.confidenceScore * 100);
  
  // Data for the gauge chart
  const data = [
    { name: 'Confidence', value: scorePercent },
    { name: 'Remaining', value: 100 - scorePercent },
  ];

  const primaryColor = isHuman ? '#10b981' : '#f43f5e'; // Emerald or Rose
  const bgColor = '#334155'; // Slate 700

  return (
    <div className="w-full animate-fade-in-up">
      <div className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-sm
        ${isHuman ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-rose-950/30 border-rose-500/30'}
      `}>
        {/* Header Badge */}
        <div className={`
          absolute top-0 left-0 w-full h-1 
          ${isHuman ? 'bg-emerald-500' : 'bg-rose-500'}
        `} />

        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
          
          {/* Chart Section */}
          <div className="relative w-40 h-40 flex-shrink-0">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell key="cell-0" fill={primaryColor} />
                    <Cell key="cell-1" fill={bgColor} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-2xl font-bold ${isHuman ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {scorePercent}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Confidence</span>
              </div>
          </div>

          {/* Text Info Section */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              {isHuman ? (
                <CheckCircle2 className="text-emerald-500" size={28} />
              ) : (
                <AlertTriangle className="text-rose-500" size={28} />
              )}
              <h2 className={`text-2xl font-bold ${isHuman ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.classification.replace('_', ' ')}
              </h2>
            </div>
            
            <p className="text-slate-400 text-sm mb-4">
              Language detected: <span className="text-slate-200 font-medium">{result.language}</span>
            </p>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <div className="flex items-start gap-2">
                <Activity className="text-slate-500 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-slate-300 text-sm leading-relaxed">
                  {result.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultCard;