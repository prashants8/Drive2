import React, { useState, useEffect } from 'react';
import { UserFile } from '@/src/types';
import { X, Save, Loader2, Maximize2, Minimize2, FileText, Code, Table, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { isEditable } from '@/src/lib/fileUtils';
import Editor from '@monaco-editor/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Papa from 'papaparse';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { useRealtimeCollaboration } from '@/src/hooks/useRealtimeCollaboration';
import { OnlyOfficeEditor } from './OnlyOfficeEditor';

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
    
    // Tiptap save logic if active
    if (editorType === 'rich-text' && richTextEditor) {
      finalContent = richTextEditor.getHTML();
    }

    // Spreadsheet save logic
    if (editorType === 'spreadsheet' && (name.endsWith('.xlsx') || name.endsWith('.xls'))) {
      try {
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

  // Tiptap Editor
  const richTextEditor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      const newHtml = editor.getHTML();
      setContent(newHtml);
      broadcastEdit(newHtml);
    },
  });

  useEffect(() => {
    if (richTextEditor && content && editorType === 'rich-text') {
      if (richTextEditor.getHTML() !== content) {
        richTextEditor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, richTextEditor, editorType]);

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
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              {editorType === 'code' ? <Code className="w-4 h-4" /> : 
               editorType === 'rich-text' ? <FileText className="w-4 h-4" /> : 
               editorType === 'spreadsheet' ? <Table className="w-4 h-4" /> :
               <Maximize2 className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">{file.file_name}</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">
                {editorType?.toUpperCase()} EDITOR
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex -space-x-2">
            {users.map((u, i) => (
              <div 
                key={i} 
                className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase"
                title={u.email}
              >
                {u.email?.charAt(0)}
              </div>
            ))}
            {users.length > 0 && <span className="ml-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest self-center">Editing Now</span>}
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              Discard
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-6"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-slate-950">
        {editorType === 'onlyoffice' && (
          <OnlyOfficeEditor 
            file={file} 
            userId={user?.id} 
            onClose={onClose} 
          />
        )}

        {editorType === 'code' && (
          <Editor
            theme="vs-dark"
            defaultLanguage={getFileLanguage(file.file_name)}
            defaultValue={content}
            onChange={(val) => {
              const newContent = val || '';
              setContent(newContent);
              broadcastEdit(newContent);
            }}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 20 }
            }}
          />
        )}

        {editorType === 'rich-text' && (
          <div className="max-w-4xl mx-auto h-full bg-slate-900 overflow-auto border-x border-white/5 flex flex-col">
            <div className="p-4 border-b border-white/5 flex flex-wrap gap-2 bg-slate-900 sticky top-0 z-10">
              <ToolbarButton 
                onClick={() => richTextEditor?.chain().focus().toggleBold().run()} 
                active={richTextEditor?.isActive('bold')} 
                label="B" 
                className="font-bold" 
              />
              <ToolbarButton 
                onClick={() => richTextEditor?.chain().focus().toggleItalic().run()} 
                active={richTextEditor?.isActive('italic')} 
                label="I" 
                className="italic" 
              />
              <ToolbarButton 
                onClick={() => richTextEditor?.chain().focus().toggleHeading({ level: 1 }).run()} 
                active={richTextEditor?.isActive('heading', { level: 1 })} 
                label="H1" 
              />
              <ToolbarButton 
                onClick={() => richTextEditor?.chain().focus().toggleHeading({ level: 2 }).run()} 
                active={richTextEditor?.isActive('heading', { level: 2 })} 
                label="H2" 
              />
              <ToolbarButton 
                onClick={() => richTextEditor?.chain().focus().toggleBulletList().run()} 
                active={richTextEditor?.isActive('bulletList')} 
                label="Bullet" 
              />
            </div>
            <div className="flex-1 p-12 focus:outline-none prose prose-invert max-w-none">
              <EditorContent editor={richTextEditor} />
            </div>
          </div>
        )}

        {editorType === 'spreadsheet' && (
          <SpreadsheetEditor file={file} content={content} onChange={(newVal) => {
            setContent(newVal);
            broadcastEdit(newVal);
          }} />
        )}
      </div>
    </div>
  );
};

const ToolbarButton = ({ onClick, active, label, className = '' }: any) => (
  <button 
    onClick={onClick}
    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
    } ${className}`}
  >
    {label}
  </button>
);

const SpreadsheetEditor = ({ file, content, onChange }: { file: UserFile, content: string, onChange: (val: string) => void }) => {
  const [data, setData] = useState<any[][]>([]);
  const name = file.file_name.toLowerCase();
  
  useEffect(() => {
    try {
      if (name.endsWith('.csv')) {
        const parsed = Papa.parse(content, { header: false });
        setData(parsed.data as any[][]);
      } else {
        // Assume JSON array for XLSX/XLS during session
        const parsed = JSON.parse(content || '[]');
        setData(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      setData([]);
    }
  }, [content, name]);

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    if (!newData[rowIndex]) newData[rowIndex] = [];
    newData[rowIndex][colIndex] = value;
    setData(newData);
    
    if (name.endsWith('.csv')) {
      onChange(Papa.unparse(newData));
    } else {
      onChange(JSON.stringify(newData));
    }
  };

  const addRow = () => {
    const newRow = new Array(data[0]?.length || 1).fill('');
    const newData = [...data, newRow];
    setData(newData);
    
    if (name.endsWith('.csv')) {
      onChange(Papa.unparse(newData));
    } else {
      onChange(JSON.stringify(newData));
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-slate-950 p-8">
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="bg-slate-800/50">
              {data[0]?.map((_, i) => (
                <th key={i} className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase border-b border-r border-white/5">
                  Col {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border-r border-white/5 p-0">
                    <input 
                      type="text" 
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="w-full h-full px-4 py-3 bg-transparent text-slate-300 text-sm focus:outline-none focus:bg-indigo-500/10 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          onClick={addRow}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold uppercase tracking-widest transition-all"
        >
          + Add New Row
        </button>
      </div>
    </div>
  );
};

const getFileLanguage = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': return 'javascript';
    case 'ts': case 'tsx': return 'typescript';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'py': return 'python';
    case 'sql': return 'sql';
    default: return 'plaintext';
  }
};
