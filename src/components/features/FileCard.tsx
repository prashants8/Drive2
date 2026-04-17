import React from 'react';
import { UserFile } from '@/src/types';
import { 
  File, Download, Trash2, Edit2, Eye, FileText, 
  ImageIcon, FileVideo, FileArchive, Music, FileCode,
  FileSpreadsheet, FileBox, Share2, Move
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
}

export const FileCard: React.FC<FileCardProps> = ({ file, onDelete, onEdit, onPreview, onShare, onMove }) => {
  const isImage = file.file_type.includes('image');
  const editable = isEditable(file);

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

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 hover:border-indigo-500/50 transition-all group overflow-hidden relative">
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="p-3 bg-slate-800/80 rounded-xl backdrop-blur-sm">
          {getIcon()}
          {file.is_public && (
            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-lg border-2 border-slate-900">
              <Share2 className="w-2 h-2" />
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPreview(file)}
            className="h-8 w-8 text-slate-400 hover:text-white"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onShare(file)}
            className="h-8 w-8 text-slate-400 hover:text-emerald-400"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(file)}
            className="h-8 w-8 text-slate-400 hover:text-amber-400"
            title="Move to Folder"
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(file)}
            className="h-8 w-8 text-slate-400 hover:text-white"
            title={editable ? "Edit Content" : "Rename"}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(file.file_url, '_blank')}
            className="h-8 w-8 text-slate-400 hover:text-white"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(file)}
            className="h-8 w-8 text-slate-400 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isImage && (
        <div className="absolute inset-x-0 bottom-0 top-1/2 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none overflow-hidden">
          <img 
            src={file.file_url} 
            alt="Preview" 
            className="w-full h-full object-cover grayscale blur-[2px]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>
      )}
      
      <div className="relative z-10">
        <h3 className="text-sm font-medium text-slate-200 truncate pr-2 mb-1" title={file.file_name}>
          {file.file_name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{formatFileSize(file.file_size)}</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span className="text-xs text-slate-500">
            {new Date(file.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
