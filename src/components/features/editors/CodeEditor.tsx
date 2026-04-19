import React from 'react';
import Editor from '@monaco-editor/react';

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

export const CodeEditor = ({ fileName, content, onChange }: { fileName: string, content: string, onChange: (val: string) => void }) => {
  return (
    <Editor
      theme="vs-dark"
      defaultLanguage={getFileLanguage(fileName)}
      defaultValue={content}
      onChange={(val) => {
        onChange(val || '');
      }}
      options={{
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 20 }
      }}
    />
  );
};
