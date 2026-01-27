import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle, Loader2, FileJson, Beaker, Globe } from 'lucide-react';
import { voiceDetectionHandler } from '../api/voiceDetection';
import { SupportedLanguage } from '../types';
import { VALID_SILENCE_MP3 } from '../services/mockAudio';
import { API_ENDPOINT } from '../constants';

interface TestCase {
  id: string;
  category: 'AUTH' | 'VALIDATION' | 'FUNCTIONAL';
  name: string;
  description: string;
  payload: {
    headers: Record<string, string>;
    body: any;
  };
  expectedStatus: 'success' | 'error';
  // If defined, checks if the error message contains this string
  expectedMessageFragment?: string; 
}

interface TestResult {
  id: string;
  passed: boolean;
  actualStatus: string;
  actualMessage?: string;
  response: any;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'T01',
    category: 'AUTH',
    name: 'Invalid API Key',
    description: 'Requests with incorrect API keys should be rejected.',
    payload: {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'wrong_key' },
      body: { language: 'English', audioFormat: 'mp3', audioBase64: '...' }
    },
    expectedStatus: 'error',
    expectedMessageFragment: 'Invalid API key'
  },
  {
    id: 'T02',
    category: 'VALIDATION',
    name: 'Missing Audio Base64',
    description: 'Payloads missing required fields must fail.',
    payload: {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'sk_test_123456789' },
      body: { language: 'English', audioFormat: 'mp3' } // Missing audioBase64
    },
    expectedStatus: 'error',
    expectedMessageFragment: 'Missing required fields'
  },
  {
    id: 'T03',
    category: 'VALIDATION',
    name: 'Unsupported Language',
    description: 'Languages outside the fixed 5 must be rejected.',
    payload: {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'sk_test_123456789' },
      body: { language: 'Spanish', audioFormat: 'mp3', audioBase64: VALID_SILENCE_MP3 }
    },
    expectedStatus: 'error',
    expectedMessageFragment: 'Unsupported language'
  },
  {
    id: 'T04',
    category: 'VALIDATION',
    name: 'Invalid Audio Format',
    description: 'Only MP3 format is supported.',
    payload: {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'sk_test_123456789' },
      body: { language: 'English', audioFormat: 'wav', audioBase64: VALID_SILENCE_MP3 }
    },
    expectedStatus: 'error',
    expectedMessageFragment: 'Invalid audioFormat'
  },
  {
    id: 'T05',
    category: 'FUNCTIONAL',
    name: 'Valid Request (English)',
    description: 'Correct payload should return success and classification.',
    payload: {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'sk_test_123456789' },
      body: { language: SupportedLanguage.English, audioFormat: 'mp3', audioBase64: VALID_SILENCE_MP3 }
    },
    expectedStatus: 'success'
  },
  {
    id: 'T06',
    category: 'FUNCTIONAL',
    name: 'Valid Request (Tamil)',
    description: 'Correct payload for Tamil should return success.',
    payload: {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'sk_test_123456789' },
      body: { language: SupportedLanguage.Tamil, audioFormat: 'mp3', audioBase64: VALID_SILENCE_MP3 }
    },
    expectedStatus: 'success'
  },
  {
    id: 'T07',
    category: 'FUNCTIONAL',
    name: 'Valid Request (Hindi)',
    description: 'Correct payload for Hindi should return success.',
    payload: {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'sk_test_123456789' },
      body: { language: SupportedLanguage.Hindi, audioFormat: 'mp3', audioBase64: VALID_SILENCE_MP3 }
    },
    expectedStatus: 'success'
  },
  {
    id: 'T08',
    category: 'FUNCTIONAL',
    name: 'Valid Request (Malayalam)',
    description: 'Correct payload for Malayalam should return success.',
    payload: {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'sk_test_123456789' },
      body: { language: SupportedLanguage.Malayalam, audioFormat: 'mp3', audioBase64: VALID_SILENCE_MP3 }
    },
    expectedStatus: 'success'
  },
  {
    id: 'T09',
    category: 'FUNCTIONAL',
    name: 'Valid Request (Telugu)',
    description: 'Correct payload for Telugu should return success.',
    payload: {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'sk_test_123456789' },
      body: { language: SupportedLanguage.Telugu, audioFormat: 'mp3', audioBase64: VALID_SILENCE_MP3 }
    },
    expectedStatus: 'success'
  }
];

const TestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    setResults({});
    
    for (const test of TEST_CASES) {
      setCurrentTestId(test.id);
      
      // Simulate slight delay for visualization
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const response = await voiceDetectionHandler(test.payload.headers, test.payload.body);
        
        let passed = response.status === test.expectedStatus;
        
        if (passed && test.expectedStatus === 'error' && test.expectedMessageFragment) {
          passed = (response as any).message?.includes(test.expectedMessageFragment);
        }

        setResults(prev => ({
          ...prev,
          [test.id]: {
            id: test.id,
            passed,
            actualStatus: response.status,
            actualMessage: response.status === 'error' ? (response as any).message : undefined,
            response
          }
        }));

      } catch (e) {
        setResults(prev => ({
          ...prev,
          [test.id]: {
            id: test.id,
            passed: false,
            actualStatus: 'EXCEPTION',
            actualMessage: String(e),
            response: null
          }
        }));
      }
    }

    setCurrentTestId(null);
    setIsRunning(false);
  };

  const getStatusIcon = (testId: string) => {
    if (currentTestId === testId) return <Loader2 className="animate-spin text-brand-500" size={20} />;
    const result = results[testId];
    if (!result) return <div className="w-5 h-5 rounded-full border-2 border-slate-700" />;
    return result.passed 
      ? <CheckCircle className="text-emerald-500" size={20} />
      : <XCircle className="text-rose-500" size={20} />;
  };

  const calculateStats = () => {
    const total = TEST_CASES.length;
    const executed = Object.keys(results).length;
    const passed = Object.values(results).filter(r => r.passed).length;
    return { total, executed, passed };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header / Stats */}
      <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Beaker className="text-brand-500" />
            Automated Test Suite
          </h2>
          <div className="flex items-center gap-2 mt-1">
             <Globe size={12} className="text-slate-500"/>
             <span className="text-slate-400 text-xs font-mono">{API_ENDPOINT}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-200">{stats.total}</div>
            <div className="text-xs text-slate-500 uppercase font-semibold">Total</div>
          </div>
          <div className="text-center">
             <div className="text-2xl font-bold text-emerald-500">{stats.passed}</div>
             <div className="text-xs text-slate-500 uppercase font-semibold">Passed</div>
          </div>
          <div className="text-center">
             <div className="text-2xl font-bold text-rose-500">{stats.executed - stats.passed}</div>
             <div className="text-xs text-slate-500 uppercase font-semibold">Failed</div>
          </div>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className={`
            px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center gap-2
            ${isRunning 
              ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
              : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20'}
          `}
        >
          {isRunning ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Running...
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              Run All Tests
            </>
          )}
        </button>
      </div>

      {/* Test List */}
      <div className="space-y-3">
        {TEST_CASES.map((test) => {
          const result = results[test.id];
          const isError = result && !result.passed;

          return (
            <div 
              key={test.id} 
              className={`
                bg-slate-900/50 border rounded-xl overflow-hidden transition-all duration-200
                ${isError ? 'border-rose-500/30 bg-rose-950/10' : 'border-slate-800'}
              `}
            >
              <div className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(test.id)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      text-xs font-bold px-2 py-0.5 rounded text-slate-950
                      ${test.category === 'AUTH' ? 'bg-amber-400' : test.category === 'VALIDATION' ? 'bg-sky-400' : 'bg-purple-400'}
                    `}>
                      {test.category}
                    </span>
                    <h3 className="font-semibold text-slate-200 truncate">{test.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{test.description}</p>
                </div>

                <div className="text-xs font-mono text-slate-500 hidden md:block">
                  ID: {test.id}
                </div>
              </div>

              {/* Expand Error Details */}
              {result && !result.passed && (
                <div className="bg-rose-950/20 border-t border-rose-500/20 p-4 text-xs font-mono text-rose-300 grid gap-2">
                  <div className="flex gap-2">
                    <span className="font-bold">Expected:</span>
                    <span>Status "{test.expectedStatus}" {test.expectedMessageFragment && `containing "${test.expectedMessageFragment}"`}</span>
                  </div>
                   <div className="flex gap-2">
                    <span className="font-bold">Actual:</span>
                    <span>
                      Status "{result.actualStatus}"
                      {result.actualMessage && ` - Message: "${result.actualMessage}"`}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Show Success Details (Optional, collapsed by default but rendered for debugging transparency if needed) */}
              {result && result.passed && test.category === 'FUNCTIONAL' && (
                 <div className="bg-emerald-950/10 border-t border-emerald-500/10 p-3 flex justify-between items-center px-4">
                    <span className="text-xs text-emerald-400/70 font-mono">
                      Confirmed: {result.response.classification} (Confidence: {result.response.confidenceScore})
                    </span>
                 </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestRunner;