import React, { useEffect, useState } from 'react';
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { UserFile } from '@/src/types';
import { Loader2, CheckCircle2, CloudLightning } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface OnlyOfficeEditorProps {
  file: UserFile;
  userId: string;
  onClose: () => void;
  initialMode?: 'edit' | 'view';
}

export const OnlyOfficeEditor: React.FC<OnlyOfficeEditorProps> = ({ file, userId, onClose, initialMode }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const mode = initialMode || (file.permission === 'edit' ? 'edit' : 'view');
        const response = await fetch(`/api/onlyoffice/config?fileId=${file.id}&userId=${userId}&mode=${mode}`);
        if (!response.ok) throw new Error('Failed to load editor configuration');
        const data = await response.json();
        
        // Add events to config
        data.events = {
          onAppReady: () => {
            console.log("OnlyOffice App is ready");
            setLoading(false);
          },
          onDocumentStateChange: (event: any) => {
             if (event.data) {
               setSaveStatus('saving');
             } else {
               setSaveStatus('saved');
             }
          },
          onError: (event: any) => {
            console.error("OnlyOffice Error:", event);
            setError(`Editor error: ${event.data}`);
          },
          onOutdatedVersion: () => {
             window.location.reload();
          }
        };

        setConfig(data);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchConfig();
  }, [file.id, userId, file.permission]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-8 text-center">
        <CloudLightning className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Editor failed to load</h2>
        <p className="text-slate-400 mb-6 max-w-md">{error}</p>
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Close Editor
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 overflow-hidden">
      {/* Google Docs-like Header Info */}
      <div className="absolute top-0 right-48 z-50 flex items-center gap-4 h-12">
        <div className="flex items-center gap-2 group">
          {saveStatus === 'saving' ? (
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium bg-slate-800/80 px-3 py-1.5 rounded-full border border-indigo-500/30 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium bg-slate-800/80 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              All changes saved
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-700" />
        
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden md:block">
          Last edited: {file.updated_at ? new Date(file.updated_at).toLocaleTimeString() : 'Just now'}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-[60]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-indigo-400 font-bold tracking-widest uppercase text-xs animate-pulse">
            Connecting to Document Server...
          </p>
        </div>
      )}

      <div className="flex-1 w-full h-full">
        {config && (
          <DocumentEditor 
            id="onlyoffice-editor"
            documentServerUrl={(import.meta as any).env.VITE_ONLYOFFICE_SERVER_URL || "https://documentserver.onlyoffice.com/"}
            config={config}
          />
        )}
      </div>
    </div>
  );
};
