import React from 'react';
import { UserFile } from '@/src/types';
import { 
  File, Download, Trash2, Edit2, Eye, FileText, 
  ImageIcon, FileVideo, FileArchive, Music, FileCode,
  FileSpreadsheet, FileBox, Share2, Move, Sparkles, Clock, MoreVertical
} from 'lucide-react';
import { formatFileSize } from '@/src/lib/utils';
import { Button } from '../ui/Button';
import { getFileIconType, isEditable } from '@/src/lib/fileUtils';

interface FileCardProps {
  file: UserFile;
  onDelete: (file: UserFile) => void;
  onEdit: (file: UserFile) => void;
  onPreview: (file: UserFile) => void;
  onShare: (file: UserFile) => void;
  onMove: (file: UserFile) => void;
  onAI: (file: UserFile) => void;
  onRestore?: (file: UserFile) => void;
  onViewVersions?: (fileId: string) => void;
  versions?: any[];
  onRestoreVersion?: (version: any) => void;
  layoutMode?: 'grid' | 'list';
}

export const FileCard: React.FC<FileCardProps> = ({ 
  file, onDelete, onEdit, onPreview, onShare, onMove, onAI, onRestore, onViewVersions, versions, onRestoreVersion, layoutMode = 'grid'
}) => {
  const isImage = file.file_type.includes('image');
  const editable = isEditable(file);
  const [showVersions, setShowVersions] = React.useState(false);

  const getIcon = () => {
    const type = getFileIconType(file);
    switch (type) {
      case 'image': return <ImageIcon className="w-6 h-6 text-blue-400" />;
      case 'video': return <FileVideo className="w-6 h-6 text-emerald-400" />;
      case 'audio': return <Music className="w-6 h-6 text-pink-400" />;
      case 'pdf': return <FileText className="w-6 h-6 text-orange-400" />;
      case 'word': return <FileText className="w-6 h-6 text-blue-500" />;
      case 'excel': return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
      case 'powerpoint': return <FileBox className="w-6 h-6 text-orange-600" />;
      case 'archive': return <FileArchive className="w-6 h-6 text-purple-400" />;
      case 'code': return <FileCode className="w-6 h-6 text-yellow-400" />;
      default: return <File className="w-6 h-6 text-indigo-400" />;
    }
  };

  if (layoutMode === 'list') {
    return (
      <div 
        draggable={!onRestore}
        onDragStart={(e) => {
          if (!onRestore) {
            e.dataTransfer.setData('fileId', file.id);
            e.dataTransfer.effectAllowed = 'move';
          }
        }}
        onClick={() => onPreview(file)}
        className="bg-slate-900/40 border border-slate-800 rounded-2xl p-3 hover:border-indigo-500/50 transition-all group flex items-center gap-4 cursor-pointer"
      >
        <div className="p-2.5 bg-slate-800 rounded-xl">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate" title={file.file_name}>
            {file.file_name}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onAI(file); }} className="h-8 w-8 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onShare(file); }} className="h-8 w-8 text-slate-400">
            <Share2 className="w-4 h-4" />
          </Button>
          <div className="relative group/more">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
              <MoreVertical className="w-4 h-4" />
            </Button>
            <div className="absolute top-full right-0 mt-1 w-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all p-1.5 z-50">
               <button onClick={(e) => { e.stopPropagation(); onDelete(file); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      draggable={!onRestore}
      onDragStart={(e) => {
        if (!onRestore) {
          e.dataTransfer.setData('fileId', file.id);
          e.dataTransfer.effectAllowed = 'move';
        }
      }}
      className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-indigo-500/50 transition-all group overflow-hidden relative flex flex-col h-full cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="p-4 bg-slate-800/80 rounded-2xl backdrop-blur-sm shadow-xl border border-white/5 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
          {getIcon()}
          {file.is_public && (
            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-lg border-2 border-slate-900">
              <Share2 className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
           <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onAI(file); }}
            className="h-10 w-10 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/20 border border-indigo-500/10 rounded-xl transition-all"
            title="Gemini AI Assistant"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 mb-6">
        <h3 className="text-base font-bold text-white truncate pr-2 mb-1.5 leading-tight" title={file.file_name}>
          {file.file_name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{formatFileSize(file.file_size)}</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider focus-within:">
            {new Date(file.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onPreview(file); }}
          className="flex-1 h-9 min-w-[70px] bg-slate-800/50 hover:bg-slate-700 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white border-none"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" /> View
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => { e.stopPropagation(); window.open(file.file_url, '_blank'); }}
          className="flex-1 h-9 min-w-[70px] bg-slate-800/50 hover:bg-slate-700 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white border-none"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" /> Get
        </Button>
        <div className="relative group/more flex-1 min-w-[70px]">
          <Button
            variant="secondary"
            size="sm"
            className="w-full h-9 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white border-none"
          >
            More
          </Button>
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all p-2 z-50">
            {onRestore ? (
              <button 
                onClick={(e) => { e.stopPropagation(); onRestore(file); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-400/5 rounded-xl transition-colors"
              >
                <Clock className="w-4 h-4" /> Restore File
              </button>
            ) : (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(file); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Rename / Edit
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onShare(file); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/5 rounded-xl transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share Link
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onMove(file); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-amber-400 hover:bg-amber-400/5 rounded-xl transition-colors"
                >
                  <Move className="w-4 h-4" /> Move to Folder
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onViewVersions) onViewVersions(file.id);
                    setShowVersions(!showVersions);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/5 rounded-xl transition-colors"
                >
                  <Clock className="w-4 h-4" /> Version History
                </button>
              </>
            )}
            <div className="h-px bg-slate-800 my-1 mx-2" />
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(file); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" /> {onRestore ? 'Delete Permanently' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {showVersions && !onRestore && (
        <div className="mt-4 p-3 bg-slate-950/50 rounded-xl border border-white/5 space-y-2 max-h-32 overflow-y-auto z-10 relative">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Versions</p>
          {versions && versions.length > 0 ? (
            versions.map((v, i) => (
              <div key={v.id} className="flex items-center justify-between group/v">
                <span className="text-[10px] text-slate-400">v{v.version_number} • {new Date(v.created_at).toLocaleDateString()}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); if(onRestoreVersion) onRestoreVersion(v); }}
                  className="text-[10px] text-indigo-400 font-bold opacity-0 group-hover/v:opacity-100 hover:underline"
                >
                  Restore
                </button>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-slate-600 italic px-1">No history found</p>
          )}
        </div>
      )}
    </div>
  );
}
