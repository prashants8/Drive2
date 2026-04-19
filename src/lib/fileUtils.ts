import { UserFile } from '../types';

export const isEditable = (file: UserFile) => {
  const name = file.file_name.toLowerCase();
  const type = file.file_type.toLowerCase();

  // Rich Text
  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    return 'rich-text';
  }

  // Text/Code
  if (
    type.startsWith('text/') ||
    name.endsWith('.js') ||
    name.endsWith('.jsx') ||
    name.endsWith('.ts') ||
    name.endsWith('.tsx') ||
    name.endsWith('.css') ||
    name.endsWith('.html') ||
    name.endsWith('.json') ||
    name.endsWith('.md') ||
    name.endsWith('.py') ||
    name.endsWith('.sh') ||
    name.endsWith('.sql') ||
    name.endsWith('.txt') ||
    name.endsWith('.xml') ||
    name.endsWith('.yml') ||
    name.endsWith('.yaml') ||
    name.endsWith('.env')
  ) {
    return 'code';
  }

  // Spreadsheet
  if (name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return 'spreadsheet';
  }

  return null;
};

export const getFileIconType = (file: UserFile) => {
  const name = file.file_name.toLowerCase();
  const type = file.file_type.toLowerCase();

  if (type.includes('image')) return 'image';
  if (type.includes('video')) return 'video';
  if (type.includes('audio')) return 'audio';
  if (type.includes('pdf')) return 'pdf';
  if (name.endsWith('.docx') || name.endsWith('.doc')) return 'word';
  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) return 'excel';
  if (name.endsWith('.pptx') || name.endsWith('.ppt')) return 'powerpoint';
  if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return 'archive';
  if (isEditable(file) === 'code') return 'code';
  
  return 'file';
};
