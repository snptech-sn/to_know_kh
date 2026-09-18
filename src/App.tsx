import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ChannelHero } from './components/ChannelHero';
import { StatsBanner } from './components/StatsBanner';
import { AdminBar } from './components/AdminBar';
import { FilterBar } from './components/FilterBar';
import { VideoCard } from './components/VideoCard';
import { VideoModal } from './components/VideoModal';
import { PlayerModal } from './components/PlayerModal';
import { DataManagementModal } from './components/DataManagementModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ChannelStatsModal } from './components/ChannelStatsModal';
import { VideoItem, ViewMode, SortOption, VideoStatus } from './types/video';
import { INITIAL_VIDEOS, OFFICIAL_PAGE_INFO } from './data/initialVideos';
import { Video, Plus, SearchX, CheckCircle, ExternalLink, Cloud } from 'lucide-react';
import {
  subscribeToVideos,
  saveVideoToCloud,
  deleteVideoFromCloud,
  batchSaveVideosToCloud,
  resetCloudVideos,
  signInWithGoogle,
  logOut,
  auth,
  subscribeToAdminPasscode,
  updateAdminPasscodeInCloud,
  subscribeToChannelStats,
  updateChannelStatsInCloud,
} from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const STORAGE_KEY = 'to_know_video_library_v1';
const LANG_STORAGE_KEY = 'to_know_video_lang_v1';
const ADMIN_STORAGE_KEY = 'to_know_admin_mode_v1';
const ADMIN_PASSCODE_KEY = 'to_know_admin_passcode_v1';
const ADMIN_AUTH_KEY = 'to_know_admin_auth_v1';
const DEFAULT_ADMIN_PASSCODE = '123456';

const safeStorage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, val: string): void => {
    try {
      localStorage.setItem(key, val);
    } catch {}
  },
  getSession: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setSession: (key: string, val: string): void => {
    try {
      sessionStorage.setItem(key, val);
    } catch {}
  },
};

export default function App() {
  // Load saved language
  const [lang, setLang] = useState<'km' | 'en'>(() => {
    const saved = safeStorage.get(LANG_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'km';
  });

  // Admin secret passcode
  const [adminPasscode, setAdminPasscode] = useState<string>(() => {
    return safeStorage.get(ADMIN_PASSCODE_KEY) || DEFAULT_ADMIN_PASSCODE;
  });

  // Session authentication state (persists per browser session or until locked)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return safeStorage.getSession(ADMIN_AUTH_KEY) === 'true';
  });

  // Admin Mode state (defaults to false if not authenticated)
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    const isAuth = safeStorage.getSession(ADMIN_AUTH_KEY) === 'true';
    if (!isAuth) return false;
    const saved = safeStorage.get(ADMIN_STORAGE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  // Passcode prompt / Change modal state
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'verify' | 'change';
    pendingAction?: () => void;
  }>({
    isOpen: false,
    mode: 'verify',
  });

  useEffect(() => {
    if (isAdminAuthenticated) {
      safeStorage.set(ADMIN_STORAGE_KEY, String(isAdminMode));
    }
  }, [isAdminMode, isAdminAuthenticated]);

  // Real-time Cloud listener for Admin Passcode across all browsers/devices
  useEffect(() => {
    const unsubscribe = subscribeToAdminPasscode((cloudPasscode) => {
      if (cloudPasscode && cloudPasscode.trim().length >= 4) {
        setAdminPasscode(cloudPasscode.trim());
        safeStorage.set(ADMIN_PASSCODE_KEY, cloudPasscode.trim());
      }
    });
    return () => unsubscribe();
  }, []);

  // Facebook Channel Followers & Likes state & real-time sync
  const [channelStats, setChannelStats] = useState<{ followers: string; likes: string }>({
    followers: OFFICIAL_PAGE_INFO.followers,
    likes: OFFICIAL_PAGE_INFO.likes,
  });
  const [channelStatsModalOpen, setChannelStatsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToChannelStats((cloudStats) => {
      if (cloudStats) {
        setChannelStats({
          followers: cloudStats.followers || OFFICIAL_PAGE_INFO.followers,
          likes: cloudStats.likes || OFFICIAL_PAGE_INFO.likes,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Batch selection state
  const [batchSelectMode, setBatchSelectMode] = useState(false);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'syncing' | 'connected' | 'error'>('syncing');

  // Load videos from localStorage or initial dataset
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = safeStorage.get(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse local storage videos', e);
    }
    return INITIAL_VIDEOS;
  });

  // Auth observer
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Auth observer setup notice:', err);
      return () => {};
    }
  }, []);

  // Real-time Cloud Firestore subscription
  useEffect(() => {
    setCloudStatus('syncing');
    let isInitial = true;
    const unsubscribe = subscribeToVideos(
      async (remoteVideos) => {
        setCloudStatus('connected');
        if (remoteVideos.length === 0 && isInitial) {
          isInitial = false;
          // Seed Firestore with initial videos so library is stored on Cloud immediately
          try {
            await batchSaveVideosToCloud(videos.length > 0 ? videos : INITIAL_VIDEOS);
          } catch (e) {
            console.error('Failed to seed cloud videos', e);
          }
        } else {
          isInitial = false;
          setVideos(remoteVideos);
        }
      },
      (error) => {
        console.error('Firestore subscription error', error);
        setCloudStatus('error');
      }
    );
    return () => unsubscribe();
  }, []);

  // Save on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    } catch (e) {
      console.error('Failed to save videos to localStorage', e);
    }
  }, [videos]);

  // Save language preference
  const toggleLanguage = () => {
    const nextLang = lang === 'km' ? 'en' : 'km';
    setLang(nextLang);
    localStorage.setItem(LANG_STORAGE_KEY, nextLang);
  };

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals state
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    video: VideoItem | null;
    defaultTab?: 'link' | 'manual';
  }>({
    isOpen: false,
    video: null,
    defaultTab: 'link',
  });
  const [playerVideo, setPlayerVideo] = useState<VideoItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [dataModalOpen, setDataModalOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: videos.length };
    videos.forEach((v) => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return counts;
  }, [videos]);

  // Filtering & Sorting pipeline
  const filteredVideos = useMemo(() => {
    return videos
      .filter((v) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = v.title.toLowerCase().includes(q) || (v.titleEn && v.titleEn.toLowerCase().includes(q));
          const matchDesc = v.description.toLowerCase().includes(q);
          const matchTags = v.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTags) return false;
        }

        // Category
        if (selectedCategory !== 'all' && v.category !== selectedCategory) {
          return false;
        }

        // Status or Favorites
        if (selectedStatus === 'favorites') {
          if (!v.isFavorite) return false;
        } else if (selectedStatus !== 'all') {
          if (v.status !== selectedStatus) return false;
        }

        // Platform
        if (selectedPlatform !== 'all' && v.platform !== selectedPlatform) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'newest') {
          const timeA = new Date(a.publishDate).getTime() || 0;
          const timeB = new Date(b.publishDate).getTime() || 0;
          if (timeB !== timeA) return timeB - timeA;
          return (b.id || '').localeCompare(a.id || '');
        }
        if (sortOption === 'oldest') {
          const timeA = new Date(a.publishDate).getTime() || 0;
          const timeB = new Date(b.publishDate).getTime() || 0;
          if (timeA !== timeB) return timeA - timeB;
          return (a.id || '').localeCompare(b.id || '');
        }
        if (sortOption === 'most_views') {
          return (b.views || 0) - (a.views || 0);
        }
        if (sortOption === 'most_likes') {
          return (b.likes || 0) - (a.likes || 0);
        }
        if (sortOption === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [videos, searchQuery, selectedCategory, selectedStatus, selectedPlatform, sortOption]);

  // Handlers with Cloud persistence
  const handleSaveVideo = async (videoData: VideoItem) => {
    const isEdit = Boolean(videoModal.video);
    // Optimistically update local state immediately
    if (isEdit) {
      setVideos((prev) => prev.map((v) => (v.id === videoData.id ? videoData : v)));
    } else {
      setVideos((prev) => [videoData, ...prev]);
    }

    try {
      const savedPayload = await saveVideoToCloud(videoData);
      // Ensure local state synchronizes with the exact sanitized cloud payload
      setVideos((prev) => {
        const foundIndex = prev.findIndex((v) => v.id === videoData.id || v.id === savedPayload.id);
        if (foundIndex >= 0) {
          const next = [...prev];
          next[foundIndex] = savedPayload;
          return next;
        }
        return [savedPayload, ...prev];
      });

      showToast(
        lang === 'km'
          ? isEdit
            ? 'បានកែសម្រួលព័ត៌មាន និងរក្សាទុកលើ Cloud រួចរាល់!'
            : 'បានបន្ថែមមាតិកាថ្មី និងរក្សាទុកលើ Cloud ដោយជោគជ័យ!'
          : isEdit
          ? 'Content updated and saved to Cloud!'
          : 'New content added and saved to Cloud successfully!'
      );
    } catch (e) {
      console.error('Failed to sync video to Cloud:', e);
      showToast(
        lang === 'km'
          ? 'មិនអាចរក្សាទុកលើ Cloud បានទេ តែទិន្នន័យត្រូវបានរក្សាទុកក្នុងម៉ាស៊ីនរួចរាល់'
          : 'Could not sync to Cloud, saved to local cache'
      );
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const target = videos.find((v) => v.id === id);
    if (!target) return;
    const updated = { ...target, isFavorite: !target.isFavorite };
    setVideos((prev) => prev.map((v) => (v.id === id ? updated : v)));
    try {
      await saveVideoToCloud(updated);
    } catch (e) {
      console.error('Failed to sync favorite to Cloud', e);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const idToDelete = deleteTarget.id;
    setVideos((prev) => prev.filter((v) => v.id !== idToDelete));
    showToast(lang === 'km' ? 'បានលុបវីដេអូពី Cloud រួចរាល់!' : 'Video removed from Cloud!');
    setDeleteTarget(null);
    try {
      await deleteVideoFromCloud(idToDelete);
    } catch (e) {
      console.error('Failed to delete from Cloud', e);
    }
  };

  // Quick Status Change directly from card
  const handleQuickStatusChange = async (id: string, nextStatus: VideoStatus) => {
    const target = videos.find((v) => v.id === id);
    if (!target) return;
    const updated = { ...target, status: nextStatus };
    setVideos((prev) => prev.map((v) => (v.id === id ? updated : v)));
    showToast(
      lang === 'km'
        ? `បានប្តូរស្ថានភាពទៅជា៖ ${nextStatus}`
        : `Status changed to: ${nextStatus}`,
    );
    try {
      await saveVideoToCloud(updated);
    } catch (e) {
      console.error('Quick status update failed', e);
    }
  };

  // Batch selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedVideoIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedVideoIds(videos.map((v) => v.id));
  };

  const handleDeselectAll = () => {
    setSelectedVideoIds([]);
  };

  const handleBatchStatusChange = async (newStatus: VideoStatus) => {
    if (selectedVideoIds.length === 0) return;
    const updatedVideos = videos.map((v) =>
      selectedVideoIds.includes(v.id) ? { ...v, status: newStatus } : v,
    );
    setVideos(updatedVideos);
    showToast(
      lang === 'km'
        ? `បានប្តូរស្ថានភាព ${selectedVideoIds.length} វីដេអូទៅជា "${newStatus}"!`
        : `Updated status of ${selectedVideoIds.length} videos to "${newStatus}"!`,
    );
    try {
      await batchSaveVideosToCloud(updatedVideos);
    } catch (e) {
      console.error('Batch status update failed', e);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedVideoIds.length === 0) return;
    const count = selectedVideoIds.length;
    const remaining = videos.filter((v) => !selectedVideoIds.includes(v.id));
    const toDelete = [...selectedVideoIds];
    setVideos(remaining);
    setSelectedVideoIds([]);
    setBatchSelectMode(false);
    showToast(
      lang === 'km'
        ? `បានលុប ${count} វីដេអូដោយជោគជ័យ!`
        : `Deleted ${count} videos successfully!`,
    );
    try {
      for (const id of toDelete) {
        await deleteVideoFromCloud(id);
      }
    } catch (e) {
      console.error('Batch delete failed', e);
    }
  };

  const handleImportVideos = async (newVideos: VideoItem[]) => {
    setVideos(newVideos);
    setDataModalOpen(false);
    showToast(
      lang === 'km'
        ? `បានបញ្ចូល ${newVideos.length} វីដេអូទៅកាន់ Cloud ដោយជោគជ័យ!`
        : `Uploaded ${newVideos.length} videos to Cloud successfully!`,
    );
    try {
      await batchSaveVideosToCloud(newVideos);
    } catch (e) {
      console.error('Failed to save imported videos to Cloud', e);
    }
  };

  const handleResetVideos = async () => {
    setVideos(INITIAL_VIDEOS);
    setDataModalOpen(false);
    showToast(lang === 'km' ? 'បានកំណត់ឡើងវិញលើ Cloud ជោគជ័យ!' : 'Reset Cloud library to default!');
    try {
      await resetCloudVideos(INITIAL_VIDEOS);
    } catch (e) {
      console.error('Failed to reset Cloud videos', e);
    }
  };

  // Admin authentication guard
  const requireAdminAuth = (action: () => void) => {
    if (isAdminAuthenticated) {
      action();
    } else {
      setAuthModal({
        isOpen: true,
        mode: 'verify',
        pendingAction: action,
      });
    }
  };

  const handleAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminMode(true);
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    showToast(
      lang === 'km'
        ? 'បានផ្ទៀងផ្ទាត់លេខកូដ Admin ជោគជ័យ!'
        : 'Admin passcode verified successfully!'
    );
    if (authModal.pendingAction) {
      const pending = authModal.pendingAction;
      setAuthModal({ isOpen: false, mode: 'verify', pendingAction: undefined });
      pending();
    }
  };

  const handleLockAdmin = () => {
    setIsAdminAuthenticated(false);
    setIsAdminMode(false);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    safeStorage.setSession(ADMIN_AUTH_KEY, 'false');
    safeStorage.set(ADMIN_STORAGE_KEY, 'false');
    setBatchSelectMode(false);
    setSelectedVideoIds([]);
    showToast(
      lang === 'km'
        ? 'បានចាកចេញពី Admin រួចរាល់! (ត្រូវបញ្ចូលលេខសម្ងាត់សារជាថ្មីដើម្បីចូល)'
        : 'Logged out of Admin! Passcode required to re-enter.'
    );
  };

  const handleToggleAdminMode = () => {
    if (isAdminMode) {
      // Exiting Admin mode locks session and requires passcode next time
      handleLockAdmin();
    } else {
      // Entering Admin mode strictly requires entering the secret passcode
      setAuthModal({
        isOpen: true,
        mode: 'verify',
        pendingAction: () => {
          setIsAdminAuthenticated(true);
          setIsAdminMode(true);
        },
      });
    }
  };

  const handleUpdatePasscode = async (newPasscode: string) => {
    const trimmed = newPasscode.trim();
    setAdminPasscode(trimmed);
    safeStorage.set(ADMIN_PASSCODE_KEY, trimmed);

    try {
      await updateAdminPasscodeInCloud(trimmed);
      showToast(
        lang === 'km'
          ? 'លេខកូដសម្ងាត់ថ្មីត្រូវបានរក្សាទុកលើ Cloud និង Sync គ្រប់ឧបករណ៍ទាំងអស់!'
          : 'Passcode updated and synced across all devices in Cloud!'
      );
    } catch (err) {
      console.error('Failed to sync passcode to Cloud:', err);
      showToast(
        lang === 'km'
          ? 'បានប្តូរក្នុងម៉ាស៊ីននេះ តែមានបញ្ហាក្នុងការ Sync ទៅកាន់ Cloud'
          : 'Passcode updated locally, but failed to sync to Cloud'
      );
    }
  };

  const handleSaveChannelStats = async (newFollowers: string, newLikes: string) => {
    setChannelStats({ followers: newFollowers, likes: newLikes });
    try {
      await updateChannelStatsInCloud({ followers: newFollowers, likes: newLikes });
      showToast(
        lang === 'km'
          ? 'បានធ្វើបច្ចុប្បន្នភាពចំនួនអ្នកតាមដានលើ Cloud ជោគជ័យ!'
          : 'Channel followers count synced to Cloud successfully!'
      );
    } catch (err) {
      console.error('Failed to sync channel stats to Cloud:', err);
      showToast(
        lang === 'km'
          ? 'មិនអាច Sync ចំនួនអ្នកតាមដានទៅកាន់ Cloud បានទេ'
          : 'Failed to sync channel stats to Cloud'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Frosted Glass Ambient Glow Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[550px] h-[550px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-[35%] right-[-100px] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] left-[20%] w-[600px] h-[450px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <Header
        onAddClick={() => requireAdminAuth(() => setVideoModal({ isOpen: true, video: null, defaultTab: 'link' }))}
        onDataClick={() => setDataModalOpen(true)}
        lang={lang}
        onToggleLang={toggleLanguage}
        totalVideos={videos.length}
        cloudStatus={cloudStatus}
        user={user}
        isAdminMode={isAdminMode && isAdminAuthenticated}
        onToggleAdminMode={handleToggleAdminMode}
        onSignIn={async () => {
          try {
            await signInWithGoogle();
            showToast(lang === 'km' ? 'បានចូលគណនីជោគជ័យ!' : 'Signed in successfully!');
          } catch (e) {
            console.error('Sign in failed', e);
          }
        }}
        onSignOut={async () => {
          try {
            await logOut();
            showToast(lang === 'km' ? 'បានចាកចេញពីគណនី!' : 'Signed out!');
          } catch (e) {
            console.error('Sign out failed', e);
          }
        }}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
        {/* Channel Banner */}
        <ChannelHero
          onQuickCategory={(cat) => setSelectedCategory(cat)}
          lang={lang}
          followers={channelStats.followers}
          likes={channelStats.likes}
          isAdminMode={isAdminMode && isAdminAuthenticated}
          onEditStats={() => setChannelStatsModalOpen(true)}
        />

        {/* High-level stats summary */}
        <StatsBanner videos={videos} lang={lang} />

        {/* Admin Bar & Batch Controls */}
        <AdminBar
          isAdminMode={isAdminMode && isAdminAuthenticated}
          onToggleAdminMode={handleToggleAdminMode}
          videos={videos}
          batchSelectMode={batchSelectMode}
          onToggleBatchSelectMode={() => {
            requireAdminAuth(() => {
              setBatchSelectMode(!batchSelectMode);
              if (batchSelectMode) setSelectedVideoIds([]);
            });
          }}
          selectedIds={selectedVideoIds}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBatchStatusChange={handleBatchStatusChange}
          onBatchDelete={handleBatchDelete}
          onOpenAddModal={(tab) => requireAdminAuth(() => setVideoModal({ isOpen: true, video: null, defaultTab: tab }))}
          onOpenAuthModal={(mode) => setAuthModal({ isOpen: true, mode: mode || 'verify' })}
          onLockAdmin={handleLockAdmin}
          lang={lang}
        />

        {/* Filter, Search & View controls */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          categoryCounts={categoryCounts}
          lang={lang}
        />

        {/* Video Grid or List */}
        {filteredVideos.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5'
                : 'space-y-3'
            }
          >
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                viewMode={viewMode}
                onPlay={(v) => setPlayerVideo(v)}
                onEdit={(v) => requireAdminAuth(() => setVideoModal({ isOpen: true, video: v, defaultTab: 'manual' }))}
                onDelete={() => requireAdminAuth(() => setDeleteTarget(video))}
                onToggleFavorite={handleToggleFavorite}
                lang={lang}
                isAdminMode={isAdminMode && isAdminAuthenticated}
                batchSelectMode={batchSelectMode}
                isSelected={selectedVideoIds.includes(video.id)}
                onToggleSelect={handleToggleSelect}
                onQuickStatusChange={(id, nextStatus) => requireAdminAuth(() => handleQuickStatusChange(id, nextStatus))}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto my-8 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 mb-3">
              <SearchX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-1">
              {lang === 'km' ? 'រកមិនឃើញវីដេអូដែលត្រូវគ្នាទេ' : 'No matching videos found'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {lang === 'km'
                ? 'សូមព្យាយាមផ្លាស់ប្តូរពាក្យគន្លឹះស្វែងរក ឬជម្រើសតម្រងរបស់អ្នក'
                : 'Try adjusting your search terms or filter selection'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSelectedPlatform('all');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors"
              >
                {lang === 'km' ? 'សម្អាតតម្រងទាំងអស់' : 'Clear all filters'}
              </button>
              <button
                type="button"
                onClick={() => requireAdminAuth(() => setVideoModal({ isOpen: true, video: null, defaultTab: 'link' }))}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-colors"
              >
                {lang === 'km' ? 'បន្ថែមវីដេអូថ្មី' : 'Add New Video'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 mt-12 py-6 text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{OFFICIAL_PAGE_INFO.nameKm}</span>
            <span>•</span>
            <span className="text-slate-400">{OFFICIAL_PAGE_INFO.taglineKm}</span>
          </div>
          <div className="flex items-center gap-4">
            {isAdminMode && (
              <>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cloud Firestore Synced</span>
                </div>
                <span>•</span>
              </>
            )}
            <a
              href={OFFICIAL_PAGE_INFO.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 inline-flex items-center gap-1 transition-colors text-slate-300 font-medium"
            >
              <span>© Copyright by S.N.P Technology</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Add / Edit Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={() => setVideoModal({ isOpen: false, video: null, defaultTab: 'link' })}
        onSave={handleSaveVideo}
        editVideo={videoModal.video}
        lang={lang}
        defaultTab={videoModal.defaultTab || 'link'}
      />

      {/* Theater / Video Player Modal */}
      {playerVideo && (
        <PlayerModal
          video={playerVideo}
          onClose={() => setPlayerVideo(null)}
          onEdit={(v) => {
            requireAdminAuth(() => {
              setPlayerVideo(null);
              setVideoModal({ isOpen: true, video: v, defaultTab: 'manual' });
            });
          }}
          onToggleFavorite={handleToggleFavorite}
          lang={lang}
        />
      )}

      {/* Admin Passcode Authentication Modal */}
      <AdminAuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'verify', pendingAction: undefined })}
        onSuccess={handleAuthSuccess}
        lang={lang}
        currentPasscode={adminPasscode}
        onUpdatePasscode={handleUpdatePasscode}
        mode={authModal.mode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        video={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        lang={lang}
      />

      {/* Data Backup & Import Modal */}
      <DataManagementModal
        isOpen={dataModalOpen}
        onClose={() => setDataModalOpen(false)}
        videos={videos}
        onImport={handleImportVideos}
        onReset={handleResetVideos}
        lang={lang}
      />

      {/* Channel Stats (Followers & Likes) Edit / Sync Modal */}
      <ChannelStatsModal
        isOpen={channelStatsModalOpen}
        onClose={() => setChannelStatsModalOpen(false)}
        followers={channelStats.followers}
        likes={channelStats.likes}
        onSave={handleSaveChannelStats}
        lang={lang}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 backdrop-blur-xl text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl border border-white/15 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
