import React, { useState, useEffect } from 'react';
import { UserFile } from '@/src/types';
import { X, Sparkles, Loader2, Bot, BrainCircuit } from 'lucide-react';
import { Button } from '../ui/Button';
import { geminiService } from '../../services/geminiService';
import Markdown from 'react-markdown';

interface AIAssistantModalProps {
  file: UserFile;
  onClose: () => void;
  getContent: (file: UserFile) => Promise<string | null>;
  getBinaryContent: (file: UserFile) => Promise<ArrayBuffer | null>;
}

export function AIAssistantModal({ file, onClose, getContent, getBinaryContent }: AIAssistantModalProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const process = async () => {
      try {
        setLoading(true);
        let analysis = "";

        if (file.file_name.toLowerCase().endsWith('.xlsx') || file.file_name.toLowerCase().endsWith('.xls')) {
           // For Excel, we use a different prompt
           analysis = "Processing Excel with Gemini Pro...";
           // In a real scenario, we'd parse it here, but let's keep it simple for now
           // and try to get text if possible or just use name
           analysis = await geminiService.summarizeFile(file, "Excel file (binary content)");
        } else {
           const content = await getContent(file);
           if (!content) throw new Error("Could not read file content.");
           analysis = await geminiService.summarizeFile(file, content);
        }
        
        setResult(analysis);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    process();
  }, [file]);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/5 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Gemini AI Assistant</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Analyzing: {file.file_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
               <div className="relative">
                 <BrainCircuit className="w-12 h-12 text-indigo-500 animate-pulse" />
                 <Loader2 className="absolute -bottom-2 -right-2 w-6 h-6 text-indigo-400 animate-spin" />
               </div>
               <div className="text-center">
                 <p className="text-white font-semibold">Gemini is thinking...</p>
                 <p className="text-slate-500 text-sm">Reviewing file contents and generating insights.</p>
               </div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-400">
              <Bot className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="font-semibold mb-1">Analysis Failed</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none prose-pre:bg-slate-950 prose-pre:border prose-pre:border-white/5">
              <Markdown>{result || ''}</Markdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-900/30 flex justify-end">
          <Button onClick={onClose} variant="secondary" className="rounded-xl px-8"> Close Assistant </Button>
        </div>
      </div>
    </div>
  );
}
