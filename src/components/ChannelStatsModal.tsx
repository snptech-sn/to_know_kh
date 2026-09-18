import React, { useState, useEffect } from 'react';
import { X, Users, ThumbsUp, Sparkles, ExternalLink, Check, RefreshCw } from 'lucide-react';
import { OFFICIAL_PAGE_INFO } from '../data/initialVideos';

interface ChannelStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  followers: string;
  likes: string;
  onSave: (newFollowers: string, newLikes: string) => Promise<void>;
  lang: 'km' | 'en';
}

export const ChannelStatsModal: React.FC<ChannelStatsModalProps> = ({
  isOpen,
  onClose,
  followers,
  likes,
  onSave,
  lang,
}) => {
  const [newFollowers, setNewFollowers] = useState(followers);
  const [newLikes, setNewLikes] = useState(likes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNewFollowers(followers);
    setNewLikes(likes);
  }, [followers, likes, isOpen]);

  // Global Escape Key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowers.trim()) return;
    setIsSaving(true);
    try {
      await onSave(newFollowers.trim(), newLikes.trim() || newFollowers.trim());
      onClose();
    } catch (err) {
      console.error('Failed to save channel stats:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="channel-stats-modal"
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-slate-900/95 border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-950/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'km' ? 'ធ្វើបច្ចុប្បន្នភាពអ្នកតាមដាន Facebook' : 'Update Facebook Followers'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'km' ? 'Sync ចំនួនអ្នកតាមដានពិតប្រាកដលើ Cloud' : 'Sync real followers count across all devices'}
              </p>
            </div>
          </div>
          <button
            id="close-channel-stats-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p>
                {lang === 'km'
                  ? 'បញ្ចូលចំនួនអ្នកតាមដាន (Followers) ជាក់ស្តែងពីទំព័រ Facebook របស់អ្នក។ ទិន្នន័យនេះនឹង Sync លើ Cloud ដោយស្វ័យប្រវត្តិគ្រប់ Browser ទាំងអស់។'
                  : 'Enter the actual Facebook page followers count. This syncs to Cloud Firestore in real time for all visitors.'}
              </p>
              <a
                href={OFFICIAL_PAGE_INFO.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-indigo-300 font-semibold hover:underline mt-1.5"
              >
                <span>{lang === 'km' ? 'បើកមើលទំព័រ Facebook ជាក់ស្តែង' : 'View live Facebook page'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'km' ? 'ចំនួនអ្នកតាមដាន (Followers)' : 'Followers Count'}</span>
            </label>
            <input
              id="input-channel-followers"
              type="text"
              value={newFollowers}
              onChange={(e) => setNewFollowers(e.target.value)}
              placeholder="ឧទាហរណ៍៖ 546 ឬ 12.4K"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'km' ? 'ចំនួនអ្នកចូលចិត្ត (Likes)' : 'Likes Count'}</span>
            </label>
            <input
              id="input-channel-likes"
              type="text"
              value={newLikes}
              onChange={(e) => setNewLikes(e.target.value)}
              placeholder="ឧទាហរណ៍៖ 500 ឬ 2.3K"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
            >
              {lang === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              id="save-channel-stats-btn"
              type="submit"
              disabled={isSaving || !newFollowers.trim()}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{lang === 'km' ? 'រក្សាទុក & Sync' : 'Save & Sync'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
