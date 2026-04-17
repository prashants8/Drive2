import React from 'react';
import { UserFile } from '@/src/types';
import { FileText, FileVideo, FileAudio, ExternalLink, Download, ArrowRight, EyeOff, Loader2 } from 'lucide-react';

interface AdvancedFilePreviewProps {
  file: UserFile;
}

export const AdvancedFilePreview: React.FC<AdvancedFilePreviewProps> = ({ file }) => {
  const type = file.file_type.toLowerCase();
  const name = file.file_name.toLowerCase();

  const isPDF = type.includes('pdf') || name.endsWith('.pdf');
  const isOffice = 
    name.endsWith('.docx') || 
    name.endsWith('.xlsx') || 
    name.endsWith('.pptx') ||
    name.endsWith('.doc') || 
    name.endsWith('.xls') ||
    name.endsWith('.ppt') ||
    name.endsWith('.csv');

  if (type.includes('image')) {
    return (
      <div className="flex items-center justify-center p-4 h-full bg-slate-950/20 backdrop-blur-sm rounded-3xl overflow-hidden">
        <img 
          src={file.file_url} 
          alt={file.file_name} 
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform hover:scale-[1.02] duration-500"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (type.includes('video')) {
    return (
      <div className="flex items-center justify-center p-4 h-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <video 
          src={file.file_url} 
          controls 
          className="max-w-full max-h-full"
        />
      </div>
    );
  }

  if (type.includes('audio')) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 gap-8">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 animate-pulse">
          <FileAudio className="w-12 h-12" />
        </div>
        <audio 
          src={file.file_url} 
          controls 
          className="w-full max-w-md"
        />
        <div className="text-center">
          <p className="text-white font-medium mb-1">{file.file_name}</p>
          <p className="text-slate-500 text-sm">Audio Stream</p>
        </div>
      </div>
    );
  }

  if (isPDF || isOffice) {
    // Microsoft Office Online Viewer is generally more robust for Excel/binary office files
    // Fallback to Google Docs Viewer if needed, but Office is better for spreadsheets
    const viewerUrl = isPDF 
      ? `https://docs.google.com/viewer?url=${encodeURIComponent(file.file_url)}&embedded=true`
      : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.file_url)}`;

    return (
      <div className="w-full h-full bg-slate-100 rounded-3xl overflow-hidden shadow-2xl relative">
        <iframe
          src={viewerUrl}
          className="w-full h-full border-none relative z-10"
          title="Document Preview"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
           <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-slate-400 text-sm">Initializing document viewer...</p>
           </div>
        </div>
      </div>
    );
  }

  // Text/Code Fallback (Try to fetch and show)
  const isText = 
    type.includes('text') || 
    name.endsWith('.md') || 
    name.endsWith('.json') || 
    name.endsWith('.js') || 
    name.endsWith('.ts') || 
    name.endsWith('.tsx') || 
    name.endsWith('.css') || 
    name.endsWith('.html');

  if (isText) {
    return <TextPreview file={file} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center gap-6">
      <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-700">
        <EyeOff className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">No Direct Preview</h3>
        <p className="text-slate-500 max-w-xs mx-auto">
          We don't support online preview for this file type yet.
        </p>
      </div>
      <a 
        href={file.file_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
      >
        <Download className="w-4 h-4" />
        Download to view
      </a>
    </div>
  );
};

const TextPreview: React.FC<{ file: UserFile }> = ({ file }) => {
  const [content, setContent] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(file.file_url)
      .then(res => res.text())
      .then(text => setContent(text.slice(0, 10000))) // Cap it for preview
      .catch(() => setContent('Failed to load text content.'))
      .finally(() => setLoading(false));
  }, [file.file_url]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full h-full bg-slate-950 p-6 font-mono text-sm text-slate-300 overflow-auto rounded-3xl border border-slate-800 shadow-inner">
      <pre className="whitespace-pre-wrap">{content}</pre>
    </div>
  );
};
