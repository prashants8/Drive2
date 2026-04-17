import React, { useState } from 'react';
import { CreateFolderModal } from './CreateFolderModal';
import { MoveFileModal } from './MoveFileModal';
import { ShareFileModal } from './ShareFileModal';
import { UserFolder, UserFile } from '@/src/types';
import { Folder, ChevronRight, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { Button } from '../ui/Button';

interface FolderBreadcrumbsProps {
  currentFolderId: string | null;
  allFolders: UserFolder[];
  onNavigate: (id: string | null) => void;
}

export const FolderBreadcrumbs: React.FC<FolderBreadcrumbsProps> = ({ currentFolderId, allFolders, onNavigate }) => {
  const getPath = () => {
    const path: UserFolder[] = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = allFolders.find(f => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parent_id;
      } else {
        break;
      }
    }
    return path;
  };

  const path = getPath();

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto py-2 no-scrollbar">
      <button 
        onClick={() => onNavigate(null)}
        className="text-sm font-medium text-slate-500 hover:text-white transition-colors whitespace-nowrap"
      >
        My Drive
      </button>
      {path.map((folder, i) => (
        <React.Fragment key={folder.id}>
          <ChevronRight className="w-4 h-4 text-slate-700 shrink-0" />
          <button 
            onClick={() => onNavigate(folder.id)}
            className={`text-sm font-medium whitespace-nowrap transition-colors ${i === path.length - 1 ? 'text-white' : 'text-slate-500 hover:text-white'}`}
          >
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};
