import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Loader2, FolderPlus } from 'lucide-react';

interface CreateFolderModalProps {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim());
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">New Folder</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Folder Name</label>
          <Input
            placeholder="Enter folder name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="bg-slate-950 border-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={loading || !name.trim()} 
            className="flex-1 rounded-xl"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};
