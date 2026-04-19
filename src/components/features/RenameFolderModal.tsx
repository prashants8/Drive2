import React, { useState } from 'react';
import { UserFolder } from '@/src/types';
import { X, Edit2, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface RenameFolderModalProps {
  folder: UserFolder;
  onClose: () => void;
  onRename: (folder: UserFolder, newName: string) => Promise<void>;
}

export function RenameFolderModal({ folder, onClose, onRename }: RenameFolderModalProps) {
  const [newName, setNewName] = useState(folder.name);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() === folder.name) {
      onClose();
      return;
    }

    setLoading(true);
    await onRename(folder, newName.trim());
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                <Edit2 className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-white tracking-tight">Rename Folder</h3>
               <p className="text-slate-500 text-sm font-medium">Update the name of your folder below.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">New Folder Name</label>
              <Input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="flex-1 rounded-xl h-12 text-slate-400"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !newName.trim()}
                className="flex-[2] rounded-xl h-12 shadow-xl shadow-indigo-600/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
