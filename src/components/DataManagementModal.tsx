import React, { useRef, useState } from 'react';
import { X, Download, Upload, RefreshCw, AlertTriangle, CheckCircle2, FileJson } from 'lucide-react';
import { VideoItem } from '../types/video';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: VideoItem[];
  onImport: (videos: VideoItem[]) => void;
  onReset: () => void;
  lang: 'km' | 'en';
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  videos,
  onImport,
  onReset,
  lang,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(videos, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `to-know-videos-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setMsg({
        type: 'success',
        text: lang === 'km' ? 'បានទាញយកទិន្នន័យបម្រុងទុកដោយជោគជ័យ!' : 'Exported JSON backup successfully!',
      });
    } catch {
      setMsg({
        type: 'error',
        text: lang === 'km' ? 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យ' : 'Failed to export backup.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImport(parsed as VideoItem[]);
          setMsg({
            type: 'success',
            text:
              lang === 'km'
                ? `បានបញ្ចូលទិន្នន័យចំនួន ${parsed.length} វីដេអូដោយជោគជ័យ!`
                : `Successfully imported ${parsed.length} videos!`,
          });
        } else {
          throw new Error('Invalid structure');
        }
      } catch {
        setMsg({
          type: 'error',
          text: lang === 'km' ? 'ឯកសារ JSON មិនត្រឹមត្រូវ សូមពិនិត្យឡើងវិញ' : 'Invalid JSON file format.',
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl max-w-md w-full shadow-2xl border border-white/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white">
              {lang === 'km' ? 'គ្រប់គ្រងទិន្នន័យ & បម្រុងទុក' : 'Data & Backup Management'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {msg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {msg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'km'
              ? 'ទិន្នន័យវីដេអូទាំងអស់ត្រូវបានរក្សាទុកនៅលើ Cloud Firestore Database និង Browser Storage ដោយស្វ័យប្រវត្តិ។ អ្នកអាចទាញយកបម្រុងទុក (Export) ឬបញ្ចូលឡើងវិញ (Import) បានគ្រប់ពេលវេលា។'
              : 'All video data is synchronized with Cloud Firestore Database and cached locally. You can export a backup or restore at any time.'}
          </p>

          <div className="space-y-2.5">
            {/* Export */}
            <button
              id="data-export-btn"
              onClick={handleExport}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-medium text-slate-200 text-sm transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'km' ? 'ទាញយកទិន្នន័យបម្រុងទុក (Export JSON)' : 'Export JSON Backup'}</span>
              </div>
              <span className="text-xs text-slate-400">{videos.length} items</span>
            </button>

            {/* Import */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                id="data-import-btn"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-medium text-slate-200 text-sm transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'km' ? 'បញ្ចូលទិន្នន័យបម្រុងទុក (Import JSON)' : 'Import JSON Backup'}</span>
                </div>
              </button>
            </div>

            {/* Reset */}
            <button
              id="data-reset-btn"
              onClick={() => {
                if (
                  window.confirm(
                    lang === 'km'
                      ? 'តើអ្នកប្រាកដជាចង់កំណត់ទិន្នន័យទៅលំនាំដើម "នាំដឹង - To Know" វិញទេ?'
                      : 'Reset library to default "To Know" videos?',
                  )
                ) {
                  onReset();
                  setMsg({
                    type: 'success',
                    text: lang === 'km' ? 'បានកំណត់ទៅលំនាំដើមជោគជ័យ!' : 'Reset to default successfully!',
                  });
                }
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-2xl font-medium text-amber-300 text-sm transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>{lang === 'km' ? 'កំណត់ឡើងវិញទៅទិន្នន័យដើម (Reset)' : 'Reset to Default Library'}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-white/5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            {lang === 'km' ? 'បិទ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
