import React, { useState } from 'react';
import { UserFile } from '@/src/types';
import { Button } from '../ui/Button';
import { X, Globe, Lock, Link as LinkIcon, Copy, Check, Eye, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareFileModalProps {
  file: UserFile;
  onClose: () => void;
  onTogglePublic: (file: UserFile, permission?: 'view' | 'edit') => Promise<void>;
}

export const ShareFileModal: React.FC<ShareFileModalProps> = ({ file, onClose, onTogglePublic }) => {
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [permission, setPermission] = useState<'view' | 'edit'>(file.permission || 'view');

  const shareUrl = `${window.location.origin}/share/${file.share_token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async (newPermission?: 'view' | 'edit') => {
    setUpdating(true);
    await onTogglePublic(file, newPermission || permission);
    setUpdating(false);
  };

  const handlePermissionChange = async (p: 'view' | 'edit') => {
    setPermission(p);
    if (file.is_public) {
      await handleToggle(p);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${file.is_public ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              {file.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <h2 className="text-xl font-bold text-white">Share File</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Public Sharing</p>
              <p className="text-xs text-slate-500 mt-0.5">Allow anyone with the link to view this file.</p>
            </div>
            <button 
              onClick={() => handleToggle()}
              disabled={updating}
              className={`w-12 h-6 rounded-full relative transition-colors ${file.is_public ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${file.is_public ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex gap-2">
            <button 
              disabled={!file.is_public && !updating}
              onClick={() => handlePermissionChange('view')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                permission === 'view' 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
              } ${!file.is_public && 'opacity-50 cursor-not-allowed'}`}
            >
              <Eye className="w-4 h-4" /> Viewer
            </button>
            <button 
              disabled={!file.is_public && !updating}
              onClick={() => handlePermissionChange('edit')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                permission === 'edit' 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
              } ${!file.is_public && 'opacity-50 cursor-not-allowed'}`}
            >
              <Edit3 className="w-4 h-4" /> Editor
            </button>
          </div>

          {file.is_public && (
            <div className="pt-4 border-t border-slate-800 space-y-2 animate-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shareable Link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 truncate font-mono">
                  {shareUrl}
                </div>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={handleCopy}
                  className="rounded-xl shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} className="rounded-xl px-8">Done</Button>
        </div>
      </div>
    </div>
  );
};
