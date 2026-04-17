import React from 'react';
import { UserFile } from '@/src/types';
import { X, ExternalLink, Download, Edit2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { AdvancedFilePreview } from './AdvancedFilePreview';
import { isEditable } from '@/src/lib/fileUtils';

interface FilePreviewModalProps {
  file: UserFile;
  onClose: () => void;
  onEdit: (file: UserFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose, onEdit }) => {
  const editable = isEditable(file);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full h-full max-w-6xl bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white truncate max-w-md">{file.file_name}</h2>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{file.file_type}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
              {editable && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    onClose();
                    onEdit(file);
                  }}
                  className="rounded-xl h-10 px-4 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border-none"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit File
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => window.open(file.file_url, '_blank')}
                className="rounded-xl h-10 px-4"
              >
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden">
          <AdvancedFilePreview file={file} />
        </div>
      </div>
    </div>
  );
};
