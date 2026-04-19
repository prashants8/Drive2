import React, { useState, useEffect } from 'react';
import { UserFile } from '@/src/types';
import Papa from 'papaparse';

export const SpreadsheetEditor = ({ file, content, onChange }: { file: UserFile, content: string, onChange: (val: string) => void }) => {
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
