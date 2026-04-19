import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const RichTextEditor = ({ content, onChange }: { content: string, onChange: (val: string) => void }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content) {
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  return (
    <div className="max-w-4xl mx-auto h-full bg-slate-900 overflow-auto border-x border-white/5 flex flex-col">
      <div className="p-4 border-b border-white/5 flex flex-wrap gap-2 bg-slate-900 sticky top-0 z-10">
        <ToolbarButton 
          onClick={() => editor?.chain().focus().toggleBold().run()} 
          active={editor?.isActive('bold')} 
          label="B" 
          className="font-bold" 
        />
        <ToolbarButton 
          onClick={() => editor?.chain().focus().toggleItalic().run()} 
          active={editor?.isActive('italic')} 
          label="I" 
          className="italic" 
        />
        <ToolbarButton 
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} 
          active={editor?.isActive('heading', { level: 1 })} 
          label="H1" 
        />
        <ToolbarButton 
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} 
          active={editor?.isActive('heading', { level: 2 })} 
          label="H2" 
        />
        <ToolbarButton 
          onClick={() => editor?.chain().focus().toggleBulletList().run()} 
          active={editor?.isActive('bulletList')} 
          label="Bullet" 
        />
      </div>
      <div className="flex-1 p-12 focus:outline-none prose prose-invert max-w-none">
        <EditorContent editor={editor} />
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
