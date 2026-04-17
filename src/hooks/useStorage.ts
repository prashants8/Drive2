import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { UserFile, UserFolder } from '@/src/types';
import toast from 'react-hot-toast';

export function useStorage(userId: string | undefined) {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [folders, setFolders] = useState<UserFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const fetchFolders = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch (error: any) {
      console.error('Error fetching folders:', error.message);
    }
  }, [userId]);

  const fetchFiles = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      let query = supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (currentFolderId) {
        query = query.eq('folder_id', currentFolderId);
      } else {
        query = query.is('folder_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast.error('Error fetching files: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [userId, currentFolderId]);

  const createFolder = async (name: string) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          name,
          user_id: userId,
          parent_id: currentFolderId
        })
        .select()
        .single();

      if (error) throw error;
      setFolders(prev => [...prev, data]);
      toast.success('Folder created');
    } catch (error: any) {
      toast.error('Error creating folder: ' + error.message);
    }
  };

  const uploadFile = async (file: File) => {
    if (!userId) return;
    
    // Check for duplicate name in current scope
    if (files.some(f => f.file_name === file.name)) {
      toast.error(`A file named "${file.name}" already exists here.`);
      return;
    }

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-files')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('files').insert({
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        user_id: userId,
        folder_id: currentFolderId
      });

      if (dbError) throw dbError;

      toast.success('File uploaded successfully!');
      fetchFiles();
    } catch (error: any) {
      toast.error('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const renameFile = async (file: UserFile, newName: string) => {
    if (!userId) return;
    
    if (files.some(f => f.file_name === newName && f.id !== file.id)) {
      toast.error(`A file named "${newName}" already exists.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('files')
        .update({ file_name: newName })
        .eq('id', file.id);

      if (error) throw error;
      
      toast.success('File renamed');
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, file_name: newName } : f));
    } catch (error: any) {
      toast.error('Error renaming file: ' + error.message);
    }
  };

  const moveFile = async (file: UserFile, targetFolderId: string | null) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ folder_id: targetFolderId })
        .eq('id', file.id);

      if (error) throw error;
      toast.success('File moved');
      fetchFiles();
    } catch (error: any) {
      toast.error('Error moving file: ' + error.message);
    }
  };

  const togglePublicAccess = async (file: UserFile) => {
    try {
      const isPublic = !file.is_public;
      const shareToken = isPublic ? Math.random().toString(36).substring(2, 15) : null;
      
      const { error } = await supabase
        .from('files')
        .update({ 
          is_public: isPublic,
          share_token: shareToken
        })
        .eq('id', file.id);

      if (error) throw error;
      
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, is_public: isPublic, share_token: shareToken } : f));
      toast.success(isPublic ? 'File shared publicly' : 'Sharing disabled');
    } catch (error: any) {
      toast.error('Error updating sharing: ' + error.message);
    }
  };

  const deleteFile = async (file: UserFile) => {
    try {
      const url = new URL(file.file_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const storagePath = `${userId}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([storagePath]);

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;
      
      toast.success('File deleted');
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (error: any) {
      toast.error('Error deleting file: ' + error.message);
    }
  };

  const saveFileContent = async (file: UserFile, content: string | Blob) => {
    if (!userId) return;
    try {
      setUploading(true);
      const url = new URL(file.file_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const storagePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(storagePath, content, { upsert: true });

      if (uploadError) throw uploadError;

      const newSize = content instanceof Blob ? content.size : new Blob([content]).size;
      const { error: dbError } = await supabase
        .from('files')
        .update({ file_size: newSize })
        .eq('id', file.id);

      if (dbError) throw dbError;

      fetchFiles();
      return true;
    } catch (error: any) {
      toast.error('Error saving file: ' + error.message);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const getFileContent = async (file: UserFile): Promise<string | null> => {
    try {
      const response = await fetch(file.file_url);
      if (!response.ok) throw new Error('Failed to fetch file content');
      return await response.text();
    } catch (error: any) {
      toast.error('Error loading file: ' + error.message);
      return null;
    }
  };

  const getFileArrayBuffer = async (file: UserFile): Promise<ArrayBuffer | null> => {
    try {
      const response = await fetch(file.file_url);
      if (!response.ok) throw new Error('Failed to fetch file content');
      return await response.arrayBuffer();
    } catch (error: any) {
      toast.error('Error loading binary file: ' + error.message);
      return null;
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchFolders();
  }, [userId, currentFolderId, fetchFiles, fetchFolders]);

  return { 
    files, 
    folders,
    loading, 
    uploading, 
    currentFolderId,
    setCurrentFolderId,
    createFolder,
    uploadFile, 
    renameFile, 
    moveFile,
    deleteFile, 
    togglePublicAccess,
    saveFileContent, 
    getFileContent, 
    getFileArrayBuffer,
    fetchFiles 
  };
}
