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

interface FileEditorModalProps {
  file: UserFile;
  onClose: () => void;
  onSave: (file: UserFile, content: string | Blob) => Promise<boolean>;
  getContent: (file: UserFile) => Promise<string | null>;
  getBinaryContent: (file: UserFile) => Promise<ArrayBuffer | null>;
}

export const FileEditorModal: React.FC<FileEditorModalProps> = ({ file, onClose, onSave, getContent, getBinaryContent }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorType, setEditorType] = useState<'code' | 'rich-text' | 'spreadsheet' | null>(null);

  useEffect(() => {
    const type = isEditable(file);
    setEditorType(type);

    const load = async () => {
      if (type === 'rich-text' && file.file_name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await getBinaryContent(file);
        if (arrayBuffer) {
          try {
            const result = await mammoth.convertToHtml({ arrayBuffer });
            setContent(result.value);
          } catch (err) {
            console.error('Mammoth conversion error:', err);
            setContent('<p>Error converting document for editing.</p>');
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
    
    // Tiptap save logic if active
    if (editorType === 'rich-text' && richTextEditor) {
      finalContent = richTextEditor.getHTML();
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
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (richTextEditor && content && editorType === 'rich-text') {
      richTextEditor.commands.setContent(content);
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
               <Table className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">{file.file_name}</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-1">
                {editorType?.toUpperCase()} EDITOR
              </p>
            </div>
          </div>
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

      {/* Editor Main Area */}
      <div className="flex-1 overflow-hidden bg-slate-950">
        {editorType === 'code' && (
          <Editor
            theme="vs-dark"
            defaultLanguage={getFileLanguage(file.file_name)}
            defaultValue={content}
            onChange={(val) => setContent(val || '')}
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
          <CSVEditor content={content} onChange={setContent} />
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

const CSVEditor = ({ content, onChange }: { content: string, onChange: (val: string) => void }) => {
  const [data, setData] = useState<any[][]>([]);
  
  useEffect(() => {
    const parsed = Papa.parse(content, { header: false });
    setData(parsed.data as any[][]);
  }, [content]);

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
    onChange(Papa.unparse(newData));
  };

  const addRow = () => {
    const newRow = new Array(data[0]?.length || 1).fill('');
    const newData = [...data, newRow];
    setData(newData);
    onChange(Papa.unparse(newData));
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
