import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { UserFile } from '@/src/types';
import { AdvancedFilePreview } from '@/src/components/features/AdvancedFilePreview';
import { Button } from '@/src/components/ui/Button';
import { Download, Share2, AlertCircle, Loader2, HardDrive, Edit3 } from 'lucide-react';
import { FileEditorModal } from '@/src/components/features/FileEditorModal';
import { useStorage } from '@/src/hooks/useStorage';
import toast from 'react-hot-toast';

export const SharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [file, setFile] = useState<UserFile | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { saveFileContent, getFileContent, getFileArrayBuffer } = useStorage(undefined);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('share_token', token)
          .eq('is_public', true)
          .single();

        if (error) throw error;
        setFile(data);
      } catch (err: any) {
        console.error('Error fetching shared file:', err.message);
        setError('The file you are looking for does not exist or is no longer public.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchSharedFile();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 p-6">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium">Retrieving shared resource...</p>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 p-6 text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-slate-500">{error}</p>
        </div>
        <Button onClick={() => navigate('/')} className="rounded-xl px-8">
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <nav className="h-20 border-b border-slate-900 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">DriveTo</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold mt-[-4px]">Shared Link</span>
          </div>
        </div>
        
        <Button 
          onClick={() => window.open(file.file_url, '_blank')}
          className="rounded-xl bg-indigo-600 px-6"
        >
          <Download className="w-4 h-4 mr-2" /> Download
        </Button>
      </nav>

      <main className="flex-1 p-6 md:p-12 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">{file.file_name}</h2>
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <span>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <span>Shared on {new Date(file.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                 <Share2 className="w-3 h-3" /> Public {file.permission?.toUpperCase() || 'VIEW'}
               </div>
               {file.permission === 'edit' && (
                 <Button 
                   onClick={() => setShowEditor(true)}
                   className="rounded-lg h-9 px-4 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30"
                 >
                   <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Online
                 </Button>
               )}
            </div>
          </div>

          <div className="w-full aspect-video md:aspect-[21/9] bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
            <AdvancedFilePreview file={file} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-2xl mx-auto mt-12">
            <h3 className="text-lg font-bold text-white">Want your own secure storage?</h3>
            <p className="text-slate-500 text-sm">Create an account on DriveTo today for encrypted file sharing and advanced device sync.</p>
            <div className="pt-4">
              <Button onClick={() => navigate('/signup')} variant="secondary" className="rounded-xl px-12">
                Join DriveTo
              </Button>
            </div>
          </div>
        </div>
      </main>

      {showEditor && file.permission === 'edit' && (
        <FileEditorModal
          file={file}
          user={{ id: 'anonymous-' + Math.random().toString(36).substring(2), email: 'Guest Editor' }}
          onClose={() => setShowEditor(null as any)}
          onSave={saveFileContent}
          getContent={getFileContent}
          getBinaryContent={getFileArrayBuffer}
        />
      )}
      
      <footer className="py-8 text-center text-slate-600 text-xs border-t border-slate-900 mt-20">
        &copy; {new Date().getFullYear()} DriveTo Storage. All rights reserved.
      </footer>
    </div>
  );
};
