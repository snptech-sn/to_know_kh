import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { VideoItem } from '../types/video';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  video: VideoItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  lang: 'km' | 'en';
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  video,
  onConfirm,
  onCancel,
  lang,
}) => {
  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150 text-center text-white">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {lang === 'km' ? 'តើអ្នកប្រាកដជាចង់លុបវីដេអូនេះទេ?' : 'Delete Video?'}
        </h3>
        <p className="text-xs text-slate-400 mb-5 line-clamp-2 px-2">
          &ldquo;{video.title}&rdquo;
        </p>

        <div className="flex items-center gap-2.5 justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors flex-1"
          >
            {lang === 'km' ? 'បោះបង់' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 border border-red-400/30 rounded-xl transition-colors flex-1 shadow-lg shadow-red-600/20"
          >
            {lang === 'km' ? 'លុបចេញ' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
