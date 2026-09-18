import React from 'react';
import {
  ShieldCheck,
  Plus,
  Link2,
  FileEdit,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  Clock,
  FileText,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
} from 'lucide-react';
import { VideoItem, VideoStatus } from '../types/video';

interface AdminBarProps {
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  videos: VideoItem[];
  batchSelectMode: boolean;
  onToggleBatchSelectMode: () => void;
  selectedIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchStatusChange: (status: VideoStatus) => void;
  onBatchDelete: () => void;
  onOpenAddModal: (tab: 'link' | 'manual') => void;
  lang: 'km' | 'en';
  onOpenAuthModal?: (mode?: 'verify' | 'change') => void;
  onLockAdmin?: () => void;
}

export const AdminBar: React.FC<AdminBarProps> = ({
  isAdminMode,
  onToggleAdminMode,
  videos,
  batchSelectMode,
  onToggleBatchSelectMode,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onBatchStatusChange,
  onBatchDelete,
  onOpenAddModal,
  lang,
  onOpenAuthModal,
  onLockAdmin,
}) => {
  const publishedCount = videos.filter((v) => v.status === 'published').length;
  const scheduledCount = videos.filter((v) => v.status === 'scheduled').length;
  const draftCount = videos.filter((v) => v.status === 'draft').length;

  if (!isAdminMode) {
    return (
      <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-3.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">
              {lang === 'km' ? 'កំពុងមើលជាសាធារណៈ (Visitor View)' : 'Visitor Preview Mode'}
            </p>
            <p className="text-[11px] text-slate-400">
              {lang === 'km'
                ? 'ត្រូវការលេខកូដសម្ងាត់ Admin ដើម្បីចូលគ្រប់គ្រង កែសម្រួល ឬបន្ថែមវីដេអូ'
                : 'Secret passcode required to access video management and edits'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onOpenAuthModal) onOpenAuthModal('verify');
            else onToggleAdminMode();
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-400/40 rounded-xl transition-all shadow-md active:scale-95"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{lang === 'km' ? 'បញ្ចូលកូដសម្ងាត់ Admin' : 'Enter Admin Passcode'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-purple-950/70 backdrop-blur-xl rounded-2xl border border-indigo-400/30 p-4 shadow-xl space-y-3.5">
      {/* Top row: Admin Title, Stats, and Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                {lang === 'km' ? 'ផ្ទាំងគ្រប់គ្រង Admin (Admin Control)' : 'Admin Control Dashboard'}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                {lang === 'km' ? 'សកម្ម' : 'Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              {lang === 'km'
                ? 'គ្រប់គ្រងវីដេអូ កែសម្រួល ផ្សាយ និងបញ្ចូលតាមតំណភ្ជាប់ ឬដោយដៃ'
                : 'Manage, edit, publish videos & add via link or manual input'}
            </p>
          </div>
        </div>

        {/* Quick Status Stats & Switch View */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Counter Chips */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-400 text-[11px]">{lang === 'km' ? 'សរុប៖' : 'Total:'}</span>
            <span className="font-bold text-white">{videos.length}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">{publishedCount} {lang === 'km' ? 'បានបង្ហោះ' : 'pub'}</span>
            {scheduledCount > 0 && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-400 font-medium">{scheduledCount} {lang === 'km' ? 'គ្រោង' : 'sch'}</span>
              </>
            )}
            {draftCount > 0 && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-medium">{draftCount} {lang === 'km' ? 'ព្រាង' : 'draft'}</span>
              </>
            )}
          </div>

          {/* Change PIN button */}
          <button
            type="button"
            onClick={() => onOpenAuthModal?.('change')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 rounded-xl transition-colors"
            title={lang === 'km' ? 'ប្តូរលេខកូដសម្ងាត់ Admin' : 'Change Admin Passcode'}
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">{lang === 'km' ? 'ប្តូរលេខកូដ' : 'Change PIN'}</span>
          </button>

          {/* Toggle View mode */}
          <button
            type="button"
            onClick={onToggleAdminMode}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            title={lang === 'km' ? 'ប្តូរទៅមើលជាសាធារណៈ (Visitor Preview)' : 'Switch to Visitor View'}
          >
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{lang === 'km' ? 'ទិដ្ឋភាពទូទៅ' : 'Preview'}</span>
          </button>

          {/* Lock / Logout from Admin */}
          <button
            type="button"
            onClick={() => {
              if (onLockAdmin) onLockAdmin();
              else onToggleAdminMode();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-200 hover:text-white bg-red-600/30 hover:bg-red-600/50 border border-red-400/40 rounded-xl transition-all shadow-sm active:scale-95"
            title={lang === 'km' ? 'ចាកចេញពី Admin (តម្រូវឲ្យបញ្ចូលលេខសម្ងាត់សារជាថ្មីដើម្បីចូលម្តងទៀត)' : 'Log out from Admin (Passcode required to re-enter)'}
          >
            <Lock className="w-3.5 h-3.5 text-red-300" />
            <span>{lang === 'km' ? 'ចាកចេញ (Lock)' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Actions Row: Quick Add Options & Batch Select Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Add Buttons (Link vs Manual) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onOpenAddModal('link')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/25 border border-indigo-400/30 transition-all"
            title="បញ្ចូលវីដេអូថ្មីតាមតំណភ្ជាប់ Facebook ឬ YouTube"
          >
            <Link2 className="w-4 h-4 text-indigo-200" />
            <span>{lang === 'km' ? 'បញ្ចូលតាមតំណភ្ជាប់ (Link)' : 'Add via Link'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenAddModal('manual')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-all"
            title="បញ្ចូលវីដេអូដោយដៃ (រូបភាពផ្ទាល់ ព័ត៌មានលម្អិត)"
          >
            <FileEdit className="w-4 h-4 text-purple-300" />
            <span>{lang === 'km' ? 'បញ្ចូលដោយដៃ (Manual)' : 'Manual Entry'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleBatchSelectMode}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
              batchSelectMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-white/5 text-slate-300 hover:text-white border-white/10 hover:bg-white/10'
            }`}
          >
            {batchSelectMode ? <CheckSquare className="w-3.5 h-3.5 text-amber-400" /> : <Square className="w-3.5 h-3.5" />}
            <span>{lang === 'km' ? 'គ្រប់គ្រងជាដុំ (Batch)' : 'Batch Select'}</span>
          </button>
        </div>

        {/* Right: Batch operations (when active) */}
        {batchSelectMode && (
          <div className="flex items-center gap-2 flex-wrap bg-white/5 p-2 rounded-xl border border-white/10 animate-in fade-in">
            <span className="text-xs font-semibold text-slate-300 px-1">
              {lang === 'km'
                ? `បានជ្រើស ${selectedIds.length}/${videos.length}`
                : `Selected ${selectedIds.length}/${videos.length}`}
            </span>

            {selectedIds.length < videos.length ? (
              <button
                type="button"
                onClick={onSelectAll}
                className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-white/5 hover:bg-white/10"
              >
                {lang === 'km' ? 'ជ្រើសទាំងអស់' : 'Select All'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onDeselectAll}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-white/5 hover:bg-white/10"
              >
                {lang === 'km' ? 'ដកការជ្រើស' : 'Deselect'}
              </button>
            )}

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => onBatchStatusChange('published')}
                  className="px-2 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-lg transition-colors"
                  title="ប្តូរទៅជា បានបង្ហោះ"
                >
                  {lang === 'km' ? 'ដាក់បង្ហោះ' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => onBatchStatusChange('draft')}
                  className="px-2 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 rounded-lg transition-colors"
                  title="ប្តូរទៅជា ព្រាងទុក"
                >
                  {lang === 'km' ? 'ដាក់ព្រាង' : 'Draft'}
                </button>
                <button
                  type="button"
                  onClick={onBatchDelete}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-300 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg transition-colors"
                  title="លុបវីដេអូដែលបានជ្រើស"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                  <span>{lang === 'km' ? 'លុប' : 'Delete'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
