import React from 'react';
import { UserFile } from '@/src/types';
import { X, ExternalLink, Download, Edit2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { AdvancedFilePreview } from './AdvancedFilePreview';
import { isEditable } from '@/src/lib/fileUtils';

interface FilePreviewModalProps {
  file: UserFile;
  user: any;
  onClose: () => void;
  onEdit: (file: UserFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, user, onClose, onEdit }) => {
  const editable = isEditable(file);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-4 md:p-8 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full h-full max-w-6xl bg-slate-900 border border-white/5 sm:border-slate-800 rounded-none sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm sm:text-lg font-bold text-white truncate max-w-[150px] sm:max-w-md">{file.file_name}</h2>
              <p className="text-[9px] sm:text-xs text-slate-500 uppercase tracking-wider truncate">{file.file_type}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {editable && (
                <button 
                  onClick={() => {
                    onClose();
                    onEdit(file);
                  }}
                  className="w-9 h-9 sm:h-10 sm:px-4 bg-indigo-600 hover:bg-indigo-500 text-white sm:bg-indigo-600/10 sm:text-indigo-400 sm:hover:bg-indigo-600 sm:hover:text-white rounded-xl transition-all flex items-center justify-center"
                  title="Edit File"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline-block ml-2 text-xs font-bold">Edit File</span>
                </button>
              )}
              <button 
                onClick={() => window.open(file.file_url, '_blank')}
                className="w-9 h-9 sm:h-10 sm:px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center justify-center"
                title="Download"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline-block ml-2 text-xs font-bold">Download</span>
              </button>
              <button 
                onClick={onClose} 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all flex items-center justify-center"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden">
          <AdvancedFilePreview file={file} userId={user?.id} />
        </div>
      </div>
    </div>
  );
};
