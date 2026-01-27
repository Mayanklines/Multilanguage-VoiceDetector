import React, { useState } from 'react';
import { Mic, ShieldCheck, Github, AlertCircle, Beaker, LayoutDashboard } from 'lucide-react';
import FileUpload from './components/FileUpload';
import AnalysisResultCard from './components/AnalysisResult';
import ApiLogger from './components/ApiLogger';
import TestRunner from './components/TestRunner';
import { AudioFileState, SupportedLanguage, ApiResponse, ApiRequest } from './types';
import { SUPPORTED_LANGUAGES, APP_NAME, APP_DESCRIPTION } from './constants';
import { voiceDetectionHandler } from './api/voiceDetection';

function App() {
  const [activeTab, setActiveTab] = useState<'ANALYSIS' | 'TESTING'>('ANALYSIS');
  
  // Analysis State
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(SupportedLanguage.English);
  const [audioState, setAudioState] = useState<AudioFileState>({ file: null, base64: null, previewUrl: null });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!audioState.base64 || !selectedLanguage) {
      alert("Please select a language and upload an audio file.");
      return;
    }
    
    setIsAnalyzing(true);
    setApiResponse(null);
    setLastRequest(null);

    const requestBody: ApiRequest = {
      language: selectedLanguage,
      audioFormat: 'mp3',
      audioBase64: audioState.base64
    };

    const requestHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': 'sk_test_123456789'
    };

    setLastRequest({
      headers: requestHeaders,
      body: requestBody
    });

    try {
      const response = await voiceDetectionHandler(requestHeaders, requestBody);
      setApiResponse(response);
    } catch (e) {
      setApiResponse({
        status: 'error',
        message: 'Network error or server unreachable.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-100">
      
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('ANALYSIS')}>
            <div className="bg-brand-600 p-1.5 rounded-lg text-white shadow-lg shadow-brand-500/20">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
              {APP_NAME}
            </span>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-800 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setActiveTab('ANALYSIS')}
              className={`
                px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all
                ${activeTab === 'ANALYSIS' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              <LayoutDashboard size={14} />
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('TESTING')}
              className={`
                px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all
                ${activeTab === 'TESTING' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              <Beaker size={14} />
              Test Suite
            </button>
          </div>

          <div className="flex items-center gap-4">
             <span className="text-xs text-slate-500 hidden md:block">
              API Mode: <span className="text-emerald-500 font-mono">Active</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        
        {activeTab === 'ANALYSIS' ? (
          <>
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Voice Detection <span className="text-brand-500">API</span>
              </h1>
              <p className="text-slate-400 max-w-lg mx-auto text-lg">
                A demonstration client for the VoiceGuard REST API.
              </p>
            </div>

            {/* Control Panel */}
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 md:p-8 rounded-2xl backdrop-blur-sm shadow-xl space-y-8 animate-fade-in-up">
              
              {/* Step 1: Language */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-slate-700 text-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                  Select Language
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`
                        px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border
                        ${selectedLanguage === lang 
                          ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-900/50' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}
                      `}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Upload */}
              <div className="space-y-3">
                 <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-slate-700 text-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                  Upload Audio Sample
                </label>
                <FileUpload 
                  onFileSelect={(state) => {
                    setAudioState(state);
                    setApiResponse(null); 
                    setLastRequest(null);
                  }} 
                  selectedFile={audioState} 
                />
                {audioState.previewUrl && (
                  <audio 
                    controls 
                    src={audioState.previewUrl} 
                    className="w-full mt-2 h-8 opacity-70 hover:opacity-100 transition-opacity" 
                  />
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !audioState.file}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-3
                    ${isAnalyzing 
                      ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                      : audioState.file 
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-xl shadow-brand-500/20 transform hover:-translate-y-0.5' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                  `}
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Request...
                    </>
                  ) : (
                    <>
                      <Mic size={20} />
                      SEND API REQUEST
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {apiResponse && apiResponse.status === 'error' && (
              <div className="bg-rose-950/40 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3 text-rose-200 animate-fade-in">
                <AlertCircle className="flex-shrink-0 mt-0.5 text-rose-500" size={18} />
                <p className="text-sm">Error: {apiResponse.message}</p>
              </div>
            )}

            {/* Success Result */}
            {apiResponse && apiResponse.status === 'success' && (
              <div className="scroll-mt-24" id="results">
                 <AnalysisResultCard result={apiResponse} />
              </div>
            )}

            {/* API Logs */}
            {(lastRequest || apiResponse) && (
               <ApiLogger request={lastRequest} response={apiResponse} />
            )}
          </>
        ) : (
          /* Testing Mode */
          <TestRunner />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-8 text-center text-slate-500 text-sm">
        <p>© 2024 VoiceGuard AI. Built for Voice Detection Challenge.</p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="hover:text-brand-400 transition-colors flex items-center gap-1">
             <Github size={14} /> View API Specs
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
