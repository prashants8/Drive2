import React from 'react';
import { HardDrive, Cloud, Clock, Star, Trash2, Settings, Download, LogOut, LayoutGrid, List, Plus, FolderPlus, Upload } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SidebarProps {
  activeTab: 'dashboard' | 'recent' | 'upload' | 'trash';
  setActiveTab: (tab: 'dashboard' | 'recent' | 'upload' | 'trash') => void;
  onLogout: () => void;
  itemCount: number;
  storageUsage: number;
  onCreateFolder: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onLogout, itemCount, storageUsage, onCreateFolder }: SidebarProps) {
  const usageMB = storageUsage / (1024 * 1024);
  const maxGB = 15;
  const usageGB = usageMB / 1024;
  const usagePercent = Math.min((usageGB / maxGB) * 100, 100);

  const menuItems = [
    { id: 'dashboard', icon: HardDrive, label: 'My Cloud', count: itemCount.toString() },
    { id: 'recent', icon: Clock, label: 'Recent' },
    { id: 'trash', icon: Trash2, label: 'Trash' },
  ];

  const [showNewMenu, setShowNewMenu] = React.useState(false);

  return (
    <aside className="w-full h-full bg-slate-900 border-r border-slate-800 flex flex-col z-[100] overflow-y-auto overflow-x-hidden">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8 group cursor-pointer">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
            <Cloud className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter hover:text-indigo-400 transition-colors">DRIVETO</span>
        </div>

        <div className="relative mb-8">
          <button 
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-3 px-5 py-3.5 bg-white text-slate-950 rounded-2xl font-bold shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all w-full"
          >
            <div className="p-1 bg-slate-100 rounded-lg">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
            <span>New</span>
          </button>

          {showNewMenu && (
            <>
              <div className="fixed inset-0 z-[110]" onClick={() => setShowNewMenu(false)} />
              <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-white/5 rounded-2xl shadow-2xl z-[120] overflow-hidden p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => { onCreateFolder(); setShowNewMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <FolderPlus className="w-4 h-4 text-indigo-400" />
                  New Folder
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button 
                  onClick={() => { setActiveTab('upload'); setShowNewMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Upload Files
                </button>
              </div>
            </>
          )}
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                activeTab === item.id 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-indigo-400" : "text-slate-500 group-hover:text-white")} />
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-12 space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Storage</p>
          <div className="px-4 space-y-3">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {usageMB < 1024 ? `${usageMB.toFixed(1)} MB` : `${usageGB.toFixed(2)} GB`} of {maxGB} GB Used
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto p-8 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
