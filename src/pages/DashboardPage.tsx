import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { FileCard } from '../components/features/FileCard';
import { FileUpload } from '../components/features/FileUpload';
import { EditFileModal } from '../components/features/EditFileModal';
import { FilePreviewModal } from '../components/features/FilePreviewModal';
import { FileEditorModal } from '../components/features/FileEditorModal';
import { FolderCard } from '../components/features/FolderCard';
import { FolderBreadcrumbs } from '../components/features/FolderBreadcrumbs';
import { CreateFolderModal } from '../components/features/CreateFolderModal';
import { ShareFileModal } from '../components/features/ShareFileModal';
import { MoveFileModal } from '../components/features/MoveFileModal';
import { useStorage } from '../hooks/useStorage';
import { UserFile, UserFolder } from '../types';
import { isEditable } from '../lib/fileUtils';
import { HardDrive, Search, Loader2, FolderPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface DashboardPageProps {
  user: any;
}

export function DashboardPage({ user }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingFile, setRenamingFile] = useState<UserFile | null>(null);
  const [editingFile, setEditingFile] = useState<UserFile | null>(null);
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null);
  const [sharingFile, setSharingFile] = useState<UserFile | null>(null);
  const [movingFile, setMovingFile] = useState<UserFile | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const navigate = useNavigate();
  const { 
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
  } = useStorage(user?.id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleEditClick = (file: UserFile) => {
    if (isEditable(file)) {
      setEditingFile(file);
    } else {
      setRenamingFile(file);
    }
  };

  const filteredFiles = files.filter(f => 
    f.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentFolders = folders.filter(f => f.parent_id === currentFolderId);

  const stats = {
    total: files.length,
    size: files.reduce((acc, f) => acc + f.file_size, 0),
    latest: files[0]?.created_at ? new Date(files[0].created_at).toLocaleDateString() : 'N/A'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      <main className="ml-64 p-8">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {activeTab === 'dashboard' ? 'My Files' : 'Upload Files'}
              </h1>
              <p className="text-slate-500">
                {activeTab === 'dashboard' 
                  ? `Managing ${files.length + folders.length} items in your cloud.` 
                  : 'Upload new documents, images, and tools to your cloud.'}
              </p>
            </div>
            {activeTab === 'dashboard' && (
              <Button 
                onClick={() => setIsCreatingFolder(true)}
                variant="secondary"
                className="rounded-xl h-12 px-6 bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400"
              >
                <FolderPlus className="w-5 h-5 mr-2" /> New Folder
              </Button>
            )}
          </div>

          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl h-11 pl-11 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white placeholder:text-slate-600"
            />
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <FolderBreadcrumbs 
              currentFolderId={currentFolderId}
              allFolders={folders} // Actually we need ALL folders to derive path, useStorage should provides all folders if we want perfect breadcrumbs or we just provide folders in current scope? No, useStorage fetchFolders only fetches for current parent.
              // Let's refine useStorage later if needed, for now let's use what we have.
              onNavigate={setCurrentFolderId}
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Total Files', value: stats.total, sub: 'Successfully stored' },
                { label: 'Cloud Usage', value: (stats.size / 1024 / 1024).toFixed(2) + ' MB', sub: 'Of free tier storage' },
                { label: 'Last Upload', value: stats.latest, sub: 'Recent activity' },
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-600 mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-slate-500 text-sm font-medium">Scanning your cloud...</p>
              </div>
            ) : (filteredFiles.length > 0 || currentFolders.length > 0) ? (
              <div className="space-y-8">
                {currentFolders.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Folders</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {currentFolders.map(folder => (
                        <FolderCard 
                          key={folder.id} 
                          folder={folder} 
                          onClick={setCurrentFolderId} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFiles.map((file) => (
                      <FileCard 
                        key={file.id} 
                        file={file} 
                        onDelete={deleteFile}
                        onEdit={handleEditClick}
                        onPreview={(f) => setPreviewFile(f)}
                        onShare={setSharingFile}
                        onMove={setMovingFile}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem]">
                <div className="p-6 bg-slate-900 rounded-3xl mb-6">
                   <HardDrive className="w-12 h-12 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No files found</h3>
                <p className="text-slate-500 mb-8 max-w-xs">Start by uploading some files to your secure personal cloud storage.</p>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                  Upload my first file
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <FileUpload onUpload={uploadFile} uploading={uploading} />
          </div>
        )}
      </main>

      {renamingFile && (
        <EditFileModal
          file={renamingFile}
          onClose={() => setRenamingFile(null)}
          onRename={renameFile}
        />
      )}

      {editingFile && (
        <FileEditorModal
          file={editingFile}
          onClose={() => setEditingFile(null)}
          onSave={saveFileContent}
          getContent={getFileContent}
          getBinaryContent={getFileArrayBuffer}
        />
      )}

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onEdit={handleEditClick}
        />
      )}

      {isCreatingFolder && (
        <CreateFolderModal
          onClose={() => setIsCreatingFolder(false)}
          onCreate={createFolder}
        />
      )}

      {sharingFile && (
        <ShareFileModal
          file={sharingFile}
          onClose={() => setSharingFile(null)}
          onTogglePublic={togglePublicAccess}
        />
      )}

      {movingFile && (
        <MoveFileModal
          file={movingFile}
          allFolders={folders} // Note: This might need ALL folders for deep moving, but currently we have current scope.
          onClose={() => setMovingFile(null)}
          onMove={moveFile}
        />
      )}
    </div>
  );
}
