import React, { useState } from 'react';
import { UserFolder, UserFile } from '@/src/types';
import { Folder, MoreVertical, Trash2, Edit2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/src/lib/utils';

interface FolderCardProps {
  folder: UserFolder;
  onClick: (id: string) => void;
  onDelete: (folder: UserFolder) => void;
  onRename: (folder: UserFolder) => void;
  onRestore?: (folder: UserFolder) => void;
  onDropFile?: (fileId: string, folderId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick, onDelete, onRename, onRestore, onDropFile }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDropFile) {
      setIsOver(true);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const fileId = e.dataTransfer.getData('fileId');
    if (fileId && onDropFile) {
      onDropFile(fileId, folder.id);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "bg-slate-900/50 border rounded-2xl p-4 transition-all group relative flex items-center justify-between",
        isOver ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" : "border-slate-800 hover:border-indigo-500/50"
      )}
    >
      <div 
        onClick={() => onClick(folder.id)}
        className="flex items-center gap-4 cursor-pointer flex-1"
      >
        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
          <Folder className="w-6 h-6 fill-current" />
        </div>
        <div className="overflow-hidden">
          <h3 className="text-sm font-medium text-slate-200 truncate pr-2" title={folder.name}>
            {folder.name}
          </h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Folder</p>
        </div>
      </div>
      
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-[140]" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-36 bg-slate-900 border border-white/5 rounded-xl shadow-2xl z-[150] overflow-hidden animate-in fade-in zoom-in duration-200">
              {onRestore ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onRestore(folder);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-400 hover:bg-indigo-400/5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onRename(folder);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Rename
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete(folder);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> {onRestore ? 'Perm Delete' : 'Delete'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
