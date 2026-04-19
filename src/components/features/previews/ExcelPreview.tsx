import React from 'react';
import { UserFile } from '@/src/types';
import * as XLSX from 'xlsx';

export const ExcelPreview: React.FC<{ file: UserFile }> = ({ file }) => {
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
