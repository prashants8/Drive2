import React from 'react';
import { UserFolder, UserFile } from '@/src/types';
import { Folder, MoreVertical, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface FolderCardProps {
  folder: UserFolder;
  onClick: (id: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick }) => {
  return (
    <div 
      onClick={() => onClick(folder.id)}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 hover:border-indigo-500/50 transition-all group cursor-pointer flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
          <Folder className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-200 truncate pr-2" title={folder.name}>
            {folder.name}
          </h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Folder</p>
        </div>
      </div>
      
      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </div>
  );
};
