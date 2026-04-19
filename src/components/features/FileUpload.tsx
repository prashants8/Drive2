import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/src/lib/utils';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  uploading: boolean;
}

export function FileUpload({ onUpload, uploading }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      toast.success('All files uploaded successfully');
    } catch (error) {
           // Error handled in useStorage
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div 
        {...getRootProps()} 
        className={cn(
          "relative border-4 border-dashed rounded-[3rem] p-16 transition-all cursor-pointer group flex flex-col items-center text-center gap-6",
          isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-500">
          <Upload className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Drop your files here</h3>
          <p className="text-slate-500 font-medium">Drag and drop files, or click to browse from your computer.</p>
        </div>
        <div className="absolute bottom-10 left-10 text-[10px] font-bold text-slate-700 uppercase tracking-widest hidden lg:block"> Secure encrypted portal </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Selected Files ({selectedFiles.length})</h4>
            <Button 
              onClick={handleUpload}
              disabled={uploading}
              className="px-8 rounded-xl h-12 shadow-xl shadow-indigo-600/20"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upload Now"}
            </Button>
          </div>

          <div className="grid gap-3">
            {selectedFiles.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl group border border-transparent hover:border-indigo-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <File className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white max-w-[200px] truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(i)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
