import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { UserFile, UserFolder, FileVersion } from '@/src/types';
import toast from 'react-hot-toast';

export function useStorage(userId: string | undefined) {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [folders, setFolders] = useState<UserFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [view, setView] = useState<'all' | 'trash'>('all');
  const [versions, setVersions] = useState<Record<string, FileVersion[]>>({});

  const fetchFolders = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_trashed', view === 'trash')
        .order('name', { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch (error: any) {
      console.error('Error fetching folders:', error.message);
      toast.error('Error fetching folders: ' + error.message);
    }
  }, [userId, view]);

  const fetchFiles = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      let query = supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .eq('is_trashed', view === 'trash')
        .order('created_at', { ascending: false });

      if (view !== 'trash') {
        if (currentFolderId) {
          query = query.eq('folder_id', currentFolderId);
        } else {
          query = query.is('folder_id', null);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast.error('Error fetching files: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [userId, currentFolderId, view]);

  const createFolder = async (name: string) => {
    if (!userId) return;
    
    if (folders.some(f => f.name.toLowerCase() === name.toLowerCase() && f.parent_id === currentFolderId)) {
      toast.error(`A folder named "${name}" already exists here.`);
      return;
    }

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

  const renameFolder = async (folder: UserFolder, newName: string) => {
    if (!userId) return;

    if (folders.some(f => f.name.toLowerCase() === newName.toLowerCase() && f.parent_id === folder.parent_id && f.id !== folder.id)) {
      toast.error(`A folder named "${newName}" already exists here.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('folders')
        .update({ name: newName })
        .eq('id', folder.id);

      if (error) throw error;
      
      setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, name: newName } : f));
      toast.success('Folder renamed');
    } catch (error: any) {
      toast.error('Error renaming folder: ' + error.message);
    }
  };

  const deleteFolder = async (folder: UserFolder) => {
    if (!userId) return;
    try {
      // Note: This won't delete files in storage. 
      // In a real app, you'd want a database trigger or a server side function 
      // to clean up storage objects when the folder/file records are deleted.
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folder.id);

      if (error) throw error;
      
      setFolders(prev => prev.filter(f => f.id !== folder.id));
      toast.success('Folder deleted');
      // Refetch both to ensure local state is synced with DB cascade
      fetchFolders();
      fetchFiles();
    } catch (error: any) {
      toast.error('Error deleting folder: ' + error.message);
    }
  };

  const uploadFile = async (newFiles: File[]) => {
    if (!userId) return;
    
    setUploading(true);
    // Track local file names to avoid duplicates within the SAME batch
    const currentBatchNames = new Set<string>();
    
    for (const file of newFiles) {
      if (files.some(f => f.file_name === file.name) || currentBatchNames.has(file.name)) {
        toast.error(`A file named "${file.name}" already exists here.`);
        continue;
      }
      currentBatchNames.add(file.name);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
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
        toast.success(`${file.name} uploaded successfully!`);
      } catch (error: any) {
        toast.error(`Error uploading ${file.name}: ` + error.message);
      }
    }
    setUploading(false);
    fetchFiles();
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

  const togglePublicAccess = async (file: UserFile, permission: 'view' | 'edit' = 'view') => {
    try {
      const isPublic = !file.is_public;
      const shareToken = isPublic ? Math.random().toString(36).substring(2, 15) : null;
      
      const { error } = await supabase
        .from('files')
        .update({ 
          is_public: isPublic,
          share_token: shareToken,
          permission: permission
        })
        .eq('id', file.id);

      if (error) throw error;
      
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, is_public: isPublic, share_token: shareToken, permission } : f));
      toast.success(isPublic ? `File shared (${permission})` : 'Sharing disabled');
    } catch (error: any) {
      toast.error('Error updating sharing: ' + error.message);
    }
  };

  const moveToTrash = async (item: UserFile | UserFolder, type: 'file' | 'folder') => {
    try {
      const table = type === 'file' ? 'files' : 'folders';
      const { error } = await supabase
        .from(table)
        .update({ is_trashed: true })
        .eq('id', item.id);

      if (error) throw error;
      toast.success(`${type === 'file' ? 'File' : 'Folder'} moved to Trash`);
      fetchFiles();
      fetchFolders();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  const restoreFromTrash = async (item: UserFile | UserFolder, type: 'file' | 'folder') => {
    try {
      const table = type === 'file' ? 'files' : 'folders';
      const { error } = await supabase
        .from(table)
        .update({ is_trashed: false })
        .eq('id', item.id);

      if (error) throw error;
      toast.success(`${type === 'file' ? 'File' : 'Folder'} restored`);
      fetchFiles();
      fetchFolders();
    } catch (error: any) {
      toast.error('Error restoring: ' + error.message);
    }
  };

  const fetchVersions = async (fileId: string) => {
    try {
      const { data, error } = await supabase
        .from('file_versions')
        .select('*')
        .eq('file_id', fileId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(prev => ({ ...prev, [fileId]: data || [] }));
      return data;
    } catch (error: any) {
      toast.error('Error fetching versions: ' + error.message);
    }
  };

  const restoreVersion = async (file: UserFile, version: FileVersion) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ 
          file_url: version.file_url,
          version: version.version_number
        })
        .eq('id', file.id);

      if (error) throw error;
      toast.success(`Restored to version ${version.version_number}`);
      fetchFiles();
    } catch (error: any) {
      toast.error('Error restoring version: ' + error.message);
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
      
      // CREATE A VERSION BEFORE SAVING NEW CONTENT
      const { error: versionError } = await supabase.from('file_versions').insert({
        file_id: file.id,
        file_url: file.file_url,
        version_number: file.version,
        created_by: userId
      });
      if (versionError) throw versionError;

      const url = new URL(file.file_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      // Use a versioned path if we want true history in storage too
      const storagePath = `${userId}/${file.id}_v${file.version + 1}_${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(storagePath, content, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-files')
        .getPublicUrl(storagePath);

      const newSize = content instanceof Blob ? content.size : new Blob([content]).size;
      const { error: dbError } = await supabase
        .from('files')
        .update({ 
          file_size: newSize,
          file_url: publicUrl,
          version: file.version + 1,
          updated_at: new Date().toISOString()
        })
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
    renameFolder,
    deleteFolder,
    uploadFile, 
    renameFile, 
    moveFile,
    deleteFile, 
    togglePublicAccess,
    saveFileContent, 
    getFileContent, 
    getFileArrayBuffer,
    fetchFiles,
    // Advanced Features
    view,
    setView,
    moveToTrash,
    restoreFromTrash,
    versions,
    fetchVersions,
    restoreVersion
  };
}
