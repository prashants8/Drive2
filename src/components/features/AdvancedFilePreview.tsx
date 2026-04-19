import React from 'react';
import { UserFile } from '@/src/types';
import { FileText, FileVideo, FileAudio, ExternalLink, Download, ArrowRight, EyeOff, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

import { OnlyOfficeEditor } from './OnlyOfficeEditor';

interface AdvancedFilePreviewProps {
  file: UserFile;
  userId?: string;
}

export const AdvancedFilePreview: React.FC<AdvancedFilePreviewProps> = ({ file, userId }) => {
  const type = file.file_type.toLowerCase();
  const name = file.file_name.toLowerCase();

  const isPDF = type.includes('pdf') || name.endsWith('.pdf');
  const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv');
  const isOfficeOther = 
    name.endsWith('.docx') || 
    name.endsWith('.pptx') ||
    name.endsWith('.doc') || 
    name.endsWith('.ppt');

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

  if (isExcel) {
    return <ExcelPreview file={file} />;
  }

  if (isPDF || isOfficeOther) {
    const isOnlyOfficeAvailable = !!(import.meta as any).env.VITE_ONLYOFFICE_SERVER_URL;

    if (isOfficeOther && isOnlyOfficeAvailable && userId) {
      return (
        <div className="w-full h-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
          <OnlyOfficeEditor 
            file={file} 
            userId={userId} 
            initialMode="view"
            onClose={() => {}} 
          />
        </div>
      );
    }

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

const ExcelPreview: React.FC<{ file: UserFile }> = ({ file }) => {
  const [data, setData] = React.useState<any[][]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(file.file_url);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(jsonData as any[][]);
      } catch (error) {
        console.error('Error parsing Excel:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [file.file_url]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full h-full overflow-auto bg-slate-900 p-6">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden border border-slate-800 rounded-xl">
          <table className="min-w-full divide-y divide-slate-800">
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
              {data.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-4 py-2 text-xs text-slate-400 border-r border-slate-800 last:border-0">
                      {String(cell || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TextPreview: React.FC<{ file: UserFile }> = ({ file }) => {
  const [content, setContent] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(file.file_url)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(() => setContent('Failed to load text content.'))
      .finally(() => setLoading(false));
  }, [file.file_url]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isHTML = content?.trim().startsWith('<') && content?.includes('</');

  return (
    <div className="w-full h-full bg-slate-950 p-6 overflow-auto rounded-3xl border border-slate-800 shadow-inner">
      {isHTML ? (
        <div 
          className="prose prose-invert max-w-none text-slate-300"
          dangerouslySetInnerHTML={{ __html: content || '' }} 
        />
      ) : (
        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300">{content}</pre>
      )}
    </div>
  );
};
