import React from 'react';
import { UserFolder, UserFile } from '@/src/types';
import { X, Folder, Move, ChevronRight, HardDrive } from 'lucide-react';
import { Button } from '../ui/Button';

interface MoveFileModalProps {
  file: UserFile;
  allFolders: UserFolder[];
  onClose: () => void;
  onMove: (file: UserFile, folderId: string | null) => Promise<void>;
}

export const MoveFileModal: React.FC<MoveFileModalProps> = ({ file, allFolders, onClose, onMove }) => {
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(file.folder_id);

  const handleMove = async () => {
    await onMove(file, selectedFolderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Move className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Move File</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-950/50 border border-slate-800 rounded-2xl p-2 space-y-1 custom-scrollbar">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              selectedFolderId === null ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400'
            }`}
          >
            <HardDrive className="w-5 h-5" />
            <span className="text-sm font-medium">My Drive (Root)</span>
          </button>

          {allFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedFolderId === folder.id ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <Folder className="w-5 h-5" />
              <div className="text-left flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">{folder.name}</span>
                {folder.parent_id && (
                  <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Subfolder</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0 pt-4">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleMove}
            disabled={selectedFolderId === file.folder_id}
            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
          >
            Move Here
          </Button>
        </div>
      </div>
    </div>
  );
};
