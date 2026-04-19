import React, { useState, useEffect, Suspense, lazy } from 'react';
import { UserFile } from '@/src/types';
import { X, Save, Loader2, Maximize2, Minimize2, FileText, Code, Table, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { isEditable } from '@/src/lib/fileUtils';
import { useRealtimeCollaboration } from '@/src/hooks/useRealtimeCollaboration';

// Lazy loaded editors
const CodeEditor = lazy(() => import('./editors/CodeEditor').then(m => ({ default: m.CodeEditor })));
const RichTextEditor = lazy(() => import('./editors/RichTextEditor').then(m => ({ default: m.RichTextEditor })));
const SpreadsheetEditor = lazy(() => import('./editors/SpreadsheetEditor').then(m => ({ default: m.SpreadsheetEditor })));
const OnlyOfficeEditor = lazy(() => import('./OnlyOfficeEditor').then(m => ({ default: m.OnlyOfficeEditor })));

interface FileEditorModalProps {
  file: UserFile;
  user: any;
  onClose: () => void;
  onSave: (file: UserFile, content: string | Blob) => Promise<boolean>;
  getContent: (file: UserFile) => Promise<string | null>;
  getBinaryContent: (file: UserFile) => Promise<ArrayBuffer | null>;
}

export const FileEditorModal: React.FC<FileEditorModalProps> = ({ file, user, onClose, onSave, getContent, getBinaryContent }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorType, setEditorType] = useState<'code' | 'rich-text' | 'spreadsheet' | 'onlyoffice' | null>(null);

  const { users, lastMessage, broadcastEdit } = useRealtimeCollaboration(file.id, user);

  useEffect(() => {
    const type = isEditable(file);
    const name = file.file_name.toLowerCase();
    
    // Check for OnlyOffice support first
    const isOnlyOfficeSupported = [
      '.docx', '.doc', '.dotx', '.xlsx', '.xls', '.xltx', '.csv', '.pptx', '.ppt', '.potx'
    ].some(ext => name.endsWith(ext));

    if (isOnlyOfficeSupported) {
      setEditorType('onlyoffice');
      setLoading(false);
      return;
    }

    setEditorType(type);

    const load = async () => {
      const name = file.file_name.toLowerCase();
      
      if (type === 'rich-text' && (name.endsWith('.docx') || name.endsWith('.doc'))) {
        const arrayBuffer = await getBinaryContent(file);
        if (arrayBuffer) {
          // Check if it's actually a zip file (Office files are zips)
          const uint8 = new Uint8Array(arrayBuffer.slice(0, 4));
          const isZip = uint8[0] === 0x50 && uint8[1] === 0x4B && uint8[2] === 0x03 && uint8[3] === 0x04;
          
          if (isZip) {
            try {
              const mammoth = await import('mammoth');
              const result = await mammoth.convertToHtml({ arrayBuffer });
              setContent(result.value);
            } catch (err) {
              console.error('Mammoth conversion error:', err);
              setContent('<p>Error converting document for editing.</p>');
            }
          } else {
            // Probably already converted to HTML in a previous save
            const text = new TextDecoder().decode(arrayBuffer);
            setContent(text);
          }
        }
      } else if (type === 'spreadsheet' && (name.endsWith('.xlsx') || name.endsWith('.xls'))) {
        const arrayBuffer = await getBinaryContent(file);
        if (arrayBuffer) {
          const uint8 = new Uint8Array(arrayBuffer.slice(0, 4));
          const isZip = uint8[0] === 0x50 && uint8[1] === 0x4B && uint8[2] === 0x03 && uint8[3] === 0x04;

          if (isZip) {
            try {
              const XLSX = await import('xlsx');
              const workbook = XLSX.read(arrayBuffer, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              setContent(JSON.stringify(jsonData));
            } catch (err) {
              console.error('XLSX read error:', err);
              setContent('[]');
            }
          } else {
            // Probably saved as JSON array previously
            const text = new TextDecoder().decode(arrayBuffer);
            setContent(text);
          }
        }
      } else {
        const data = await getContent(file);
        setContent(data || '');
      }
      setLoading(false);
    };
    load();
  }, [file]);

  const handleSave = async () => {
    setSaving(true);
    let finalContent: string | Blob = content;
    const name = file.file_name.toLowerCase();
    
    // Spreadsheet save logic
    if (editorType === 'spreadsheet' && (name.endsWith('.xlsx') || name.endsWith('.xls'))) {
      try {
        const XLSX = await import('xlsx');
        const jsonData = JSON.parse(content);
        const worksheet = XLSX.utils.aoa_to_sheet(jsonData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        finalContent = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      } catch (err) {
        console.error('Excel save error:', err);
      }
    }

    const success = await onSave(file, finalContent);
    if (success) onClose();
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-medium">Opening editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-slate-950 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              {editorType === 'code' ? <Code className="w-4 h-4" /> : 
               editorType === 'rich-text' ? <FileText className="w-4 h-4" /> : 
               editorType === 'spreadsheet' ? <Table className="w-4 h-4" /> :
               <Maximize2 className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs sm:text-sm font-bold text-white leading-none truncate">{file.file_name}</h2>
              <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-tighter mt-1 truncate">
                {editorType?.toUpperCase()} EDITOR
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 ml-2">
          <div className="hidden md:flex -space-x-2">
            {users.map((u, i) => (
              <div 
                key={i} 
                className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase"
                title={u.email}
              >
                {u.email?.charAt(0)}
              </div>
            ))}
            {users.length > 0 && <span className="ml-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest self-center">Editing</span>}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center h-9 w-9 sm:w-auto sm:px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all"
              title="Save Changes"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline-block ml-2 text-xs font-bold">Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-slate-950">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        }>
          {editorType === 'onlyoffice' && (
            <OnlyOfficeEditor 
              file={file} 
              userId={user?.id} 
              onClose={onClose} 
            />
          )}

          {editorType === 'code' && (
            <CodeEditor
              fileName={file.file_name}
              content={content}
              onChange={(val) => {
                setContent(val);
                broadcastEdit(val);
              }}
            />
          )}

          {editorType === 'rich-text' && (
            <RichTextEditor
              content={content}
              onChange={(val) => {
                setContent(val);
                broadcastEdit(val);
              }}
            />
          )}

          {editorType === 'spreadsheet' && (
            <SpreadsheetEditor 
              file={file} 
              content={content} 
              onChange={(newVal) => {
                setContent(newVal);
                broadcastEdit(newVal);
              }} 
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};
