import React from 'react';
import { Terminal, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { API_ENDPOINT } from '../constants';

interface ApiLoggerProps {
  request: any;
  response: any;
}

const ApiLogger: React.FC<ApiLoggerProps> = ({ request, response }) => {
  if (!request && !response) return null;

  return (
    <div className="w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-sm shadow-2xl animate-fade-in-up mt-8">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
        <Terminal size={16} className="text-slate-400" />
        <span className="text-slate-400 font-medium">API Network Log</span>
      </div>
      
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        {/* Request Panel */}
        <div className="p-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-brand-500 mb-3">
            <ArrowUpRight size={16} />
            <span className="font-bold">POST {API_ENDPOINT}</span>
          </div>
          {request ? (
            <pre className="text-slate-300">
              {JSON.stringify(request, (key, value) => {
                // Truncate long base64 string for display
                if (key === 'audioBase64' && typeof value === 'string' && value.length > 50) {
                  return value.substring(0, 30) + "...[truncated]...";
                }
                return value;
              }, 2)}
            </pre>
          ) : (
            <span className="text-slate-600 italic">Waiting for request...</span>
          )}
        </div>

        {/* Response Panel */}
        <div className="p-4 overflow-x-auto relative">
           <div className="flex items-center gap-2 text-emerald-500 mb-3">
            <ArrowDownLeft size={16} />
            <span className="font-bold">Response Body</span>
          </div>
          {response ? (
            <pre className={`
              ${response.status === 'error' ? 'text-rose-400' : 'text-emerald-400'}
            `}>
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : (
             <span className="text-slate-600 italic">Waiting for response...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiLogger;