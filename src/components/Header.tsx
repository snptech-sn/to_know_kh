import React from 'react';
import { Video, Plus, ExternalLink, Database, Globe, Cloud, LogIn, LogOut, ShieldCheck, Lock } from 'lucide-react';
import { OFFICIAL_PAGE_INFO } from '../data/initialVideos';
import { ChannelLogo } from './ChannelLogo';
import type { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  onAddClick: () => void;
  onDataClick: () => void;
  lang: 'km' | 'en';
  onToggleLang: () => void;
  totalVideos: number;
  cloudStatus: 'syncing' | 'connected' | 'error';
  user: FirebaseUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddClick,
  onDataClick,
  lang,
  onToggleLang,
  totalVideos,
  cloudStatus,
  user,
  onSignIn,
  onSignOut,
  isAdminMode,
  onToggleAdminMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/75 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <ChannelLogo size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight truncate">
                  {lang === 'km' ? OFFICIAL_PAGE_INFO.nameKm : OFFICIAL_PAGE_INFO.nameEn}
                </h1>
                <span className="hidden xs:inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-white/10 text-indigo-300 border border-white/10 backdrop-blur-md shrink-0">
                  {lang === 'km' ? 'គ្រប់គ្រងវីដេអូ' : 'Video Manager'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <p className="line-clamp-1 text-[11px] sm:text-xs">
                  {lang === 'km' ? OFFICIAL_PAGE_INFO.taglineKm : OFFICIAL_PAGE_INFO.taglineEn}
                </p>
                {isAdminMode && (
                  <>
                    <span className="text-slate-600 hidden md:inline">•</span>
                    {/* Cloud Status Pill (Visible only to Admin) */}
                    <div
                      className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px]"
                      title={
                        cloudStatus === 'connected'
                          ? 'ទិន្នន័យវីដេអូត្រូវបានរក្សាទុកលើ Cloud Firestore ដោយស្វ័យប្រវត្តិ'
                          : 'កំពុងភ្ជាប់ទៅកាន់ Cloud...'
                      }
                    >
                      <span className="relative flex h-2 w-2">
                        {cloudStatus === 'connected' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            cloudStatus === 'connected'
                              ? 'bg-emerald-500'
                              : cloudStatus === 'syncing'
                              ? 'bg-amber-400'
                              : 'bg-red-400'
                          }`}
                        ></span>
                      </span>
                      <Cloud className="w-3 h-3 text-indigo-400" />
                      <span className="text-slate-300">
                        {cloudStatus === 'connected'
                          ? 'Cloud Synced'
                          : cloudStatus === 'syncing'
                          ? (lang === 'km' ? 'កំពុងភ្ជាប់...' : 'Syncing...')
                          : 'Cloud Error'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions & Official Link */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Admin Mode Toggle / Logout */}
            <button
              id="header-admin-toggle-btn"
              type="button"
              onClick={onToggleAdminMode}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl transition-all border backdrop-blur-md active:scale-95 ${
                isAdminMode
                  ? 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border-red-500/40 shadow-sm'
                  : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border-indigo-400/30'
              }`}
              title={
                isAdminMode
                  ? lang === 'km'
                    ? 'ចុចដើម្បីចាកចេញពី Admin (Lock) - តម្រូវឲ្យបញ្ចូលលេខសម្ងាត់សារជាថ្មី'
                    : 'Click to log out of Admin (Passcode required to re-enter)'
                  : lang === 'km'
                  ? 'បញ្ចូលលេខកូដសម្ងាត់ដើម្បីចូល Admin'
                  : 'Enter passcode to access Admin'
              }
            >
              {isAdminMode ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold">Admin</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-400/30">
                    {lang === 'km' ? 'ចាកចេញ' : 'Lock'}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'km' ? 'ចូលជា Admin' : 'Admin'}</span>
                </>
              )}
            </button>

            {/* User Auth or Sign in */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="hidden lg:inline text-slate-300 font-medium max-w-[90px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  title={lang === 'km' ? 'ចាកចេញ' : 'Sign out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 backdrop-blur-md"
                title="ចូលគណនី Google"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'km' ? 'ចូល Google' : 'Sign In'}</span>
              </button>
            )}

            {/* Official Facebook Link Button */}
            <a
              id="header-facebook-link"
              href={OFFICIAL_PAGE_INFO.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 backdrop-blur-md"
              title="បើកទំព័រ Facebook ផ្លូវការ"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'km' ? 'ទំព័រ Facebook' : 'Facebook'}</span>
            </a>

            {/* Language Toggle */}
            <button
              id="header-lang-toggle"
              type="button"
              onClick={onToggleLang}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 backdrop-blur-md"
              title="ប្តូរភាសា / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'km' ? 'EN' : 'ខ្មែរ'}</span>
            </button>

            {/* Backup / Data Management */}
            <button
              id="header-data-manager"
              type="button"
              onClick={onDataClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 backdrop-blur-md"
              title={lang === 'km' ? 'គ្រប់គ្រងទិន្នន័យ & បម្រុងទុក' : 'Data & Backup'}
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">{lang === 'km' ? 'ទិន្នន័យ' : 'Backup'}</span>
            </button>

            {/* Add Video Button */}
            <button
              id="header-add-video-btn"
              type="button"
              onClick={onAddClick}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 transition-all border border-indigo-400/20 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">{lang === 'km' ? 'បន្ថែមវីដេអូថ្មី' : 'Add Video'}</span>
              <span className="xs:hidden">{lang === 'km' ? 'បន្ថែម' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

