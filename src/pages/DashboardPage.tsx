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
import { RenameFolderModal } from '../components/features/RenameFolderModal';
import { ShareFileModal } from '../components/features/ShareFileModal';
import { MoveFileModal } from '../components/features/MoveFileModal';
import { AIAssistantModal } from '../components/features/AIAssistantModal';
import { useStorage } from '../hooks/useStorage';
import { UserFile, UserFolder } from '../types';
import { isEditable } from '../lib/fileUtils';
import { HardDrive, Search, Loader2, FolderPlus, LayoutGrid, List } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '@/src/lib/utils';

interface DashboardPageProps {
  user: any;
}

export function DashboardPage({ user }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recent' | 'upload' | 'trash'>('dashboard');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [renamingFile, setRenamingFile] = useState<UserFile | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<UserFolder | null>(null);
  const [editingFile, setEditingFile] = useState<UserFile | null>(null);
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null);
  const [sharingFile, setSharingFile] = useState<UserFile | null>(null);
  const [movingFile, setMovingFile] = useState<UserFile | null>(null);
  const [aiFile, setAiFile] = useState<UserFile | null>(null);
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
  } = useStorage(user?.id);

  // Sync activeTab with view
  React.useEffect(() => {
    if (activeTab === 'trash') {
      setView('trash');
    } else {
      setView('all');
    }
  }, [activeTab, setView]);

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
  ).sort((a, b) => {
    if (activeTab === 'recent') {
      return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const currentFolders = activeTab === 'trash' || activeTab === 'recent' ? [] : folders.filter(f => f.parent_id === currentFolderId);

  const stats = {
    total: files.length,
    size: files.reduce((acc, f) => acc + f.file_size, 0),
    latest: files[0]?.created_at ? new Date(files[0].created_at).toLocaleDateString() : 'N/A'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      <div className={cn(
        "fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out z-[110] lg:relative lg:translate-x-0 h-screen shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }} 
          onLogout={handleLogout} 
          itemCount={files.length + folders.length}
          storageUsage={stats.size}
          onCreateFolder={() => setIsCreatingFolder(true)}
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-900 rounded-xl text-slate-400"
            >
              <LayoutGrid className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {activeTab === 'trash' ? 'Trash Bin' : activeTab === 'recent' ? 'Recent Activity' : activeTab === 'dashboard' ? 'My Files' : 'Upload Files'}
              </h1>
              <p className="text-sm text-slate-500">
                {activeTab === 'trash' 
                  ? 'Review and restore deleted files.'
                  : activeTab === 'recent'
                    ? 'Your most recently updated files.'
                    : activeTab === 'dashboard' 
                      ? `Managing ${files.length + folders.length} items.` 
                      : 'Upload new documents.'}
              </p>
            </div>
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

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mr-2">
              <button 
                onClick={() => setLayoutMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  layoutMode === 'grid' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setLayoutMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  layoutMode === 'list' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <List className="w-4 h-4" />
              </button>
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
            </div>
          </header>

        {activeTab === 'dashboard' || activeTab === 'trash' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {activeTab === 'dashboard' && (
              <FolderBreadcrumbs 
                currentFolderId={currentFolderId}
                allFolders={folders} 
                onNavigate={setCurrentFolderId}
              />
            )}

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
                          onDelete={activeTab === 'trash' ? deleteFolder : (f) => moveToTrash(f, 'folder')} 
                          onRename={setRenamingFolder}
                          onRestore={activeTab === 'trash' ? (f) => restoreFromTrash(f, 'folder') : undefined}
                          onDropFile={(fileId, folderId) => {
                            const file = files.find(f => f.id === fileId);
                            if (file) moveFile(file, folderId);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Files</h3>
                  <div className={cn(
                    layoutMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      : "space-y-2"
                  )}>
                    {filteredFiles.map((file) => (
                        <FileCard 
                          key={file.id} 
                          file={file} 
                          layoutMode={layoutMode}
                          onDelete={activeTab === 'trash' ? deleteFile : (f) => moveToTrash(f, 'file')}
                          onEdit={handleEditClick}
                          onPreview={(f) => setPreviewFile(f)}
                          onShare={setSharingFile}
                          onMove={setMovingFile}
                          onAI={setAiFile}
                          onRestore={activeTab === 'trash' ? (f) => restoreFromTrash(f, 'file') : undefined}
                          onViewVersions={fetchVersions}
                          versions={versions[file.id]}
                          onRestoreVersion={(v) => restoreVersion(file, v)}
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

      {renamingFolder && (
        <RenameFolderModal 
          folder={renamingFolder}
          onClose={() => setRenamingFolder(null)}
          onRename={renameFolder}
        />
      )}

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
          user={user}
          onClose={() => setEditingFile(null)}
          onSave={saveFileContent}
          getContent={getFileContent}
          getBinaryContent={getFileArrayBuffer}
        />
      )}

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          user={user}
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

      {aiFile && (
        <AIAssistantModal
          file={aiFile}
          onClose={() => setAiFile(null)}
          getContent={getFileContent}
          getBinaryContent={getFileArrayBuffer}
        />
      )}
    </div>
  );
}
