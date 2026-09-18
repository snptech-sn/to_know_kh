import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { VideoItem } from '../types/video';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Must use firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const VIDEOS_COLLECTION = 'videos';

// Convert undefined fields and sanitize values to avoid Firestore rule errors
function cleanVideoPayload(video: VideoItem): Record<string, any> {
  const data: Record<string, any> = { ...video };

  // Sanitize id: must be string matching ^[a-zA-Z0-9_\-]+$
  if (!data.id || typeof data.id !== 'string' || !/^[a-zA-Z0-9_\-]+$/.test(data.id)) {
    data.id = `tk-${Date.now()}`;
  } else if (data.id.length > 120) {
    data.id = data.id.substring(0, 120);
  }

  // Sanitize url: must not be empty or raw base64/blob data
  if (
    !data.url ||
    typeof data.url !== 'string' ||
    data.url.length < 5 ||
    data.url.startsWith('data:') ||
    data.url.startsWith('blob:')
  ) {
    data.url = 'https://www.facebook.com/share/1DpGT8ZZ7y/?mibextid=wwXIfr';
  } else if (data.url.length > 7500) {
    data.url = data.url.substring(0, 7500);
  }

  // Ensure title is present and valid string
  if (!data.title || typeof data.title !== 'string') {
    data.title = 'វីដេអូចំណេះដឹង នាំដឹង - To Know';
  } else {
    data.title = data.title.trim().substring(0, 1900);
  }

  if (data.titleEn && typeof data.titleEn === 'string') {
    data.titleEn = data.titleEn.trim().substring(0, 1900);
  }

  // Sanitize platform
  const validPlatforms = ['facebook', 'youtube', 'direct', 'other'];
  if (!validPlatforms.includes(data.platform)) {
    data.platform = 'facebook';
  }

  // Sanitize category
  const validCategories = [
    'បច្ចេកវិទ្យា',
    'វិទ្យាសាស្ត្រ',
    'ចំណេះដឹងទូទៅ',
    'ប្រវត្តិសាស្ត្រ',
    'សុខភាព & ខួរក្បាល',
    'គន្លឹះខ្លីៗ',
  ];
  if (!validCategories.includes(data.category)) {
    data.category = 'ចំណេះដឹងទូទៅ';
  }

  // Sanitize status
  const validStatuses = ['published', 'draft', 'scheduled'];
  if (!validStatuses.includes(data.status)) {
    data.status = 'published';
  }

  // Sanitize previewVideoUrl
  if (data.previewVideoUrl) {
    if (
      typeof data.previewVideoUrl !== 'string' ||
      data.previewVideoUrl.startsWith('blob:') ||
      data.previewVideoUrl.length > 22000
    ) {
      delete data.previewVideoUrl;
    }
  }

  // If embedUrl is base64, blob, or too long, remove it
  if (data.embedUrl) {
    if (
      typeof data.embedUrl !== 'string' ||
      data.embedUrl.startsWith('data:') ||
      data.embedUrl.startsWith('blob:') ||
      data.embedUrl.length > 11000
    ) {
      delete data.embedUrl;
    }
  }

  // Sanitize thumbnail
  if (data.thumbnail) {
    if (
      typeof data.thumbnail !== 'string' ||
      data.thumbnail.startsWith('blob:') ||
      data.thumbnail.length > 900000
    ) {
      data.thumbnail = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
    }
  }

  // Sanitize images array
  if (Array.isArray(data.images)) {
    data.images = data.images.filter(
      (img) => typeof img === 'string' && img.trim().length > 0 && !img.startsWith('blob:')
    );
    if (data.images.length > 20) {
      data.images = data.images.slice(0, 20);
    }
  } else {
    data.images = data.thumbnail ? [data.thumbnail] : [];
  }

  // Sanitize description
  if (data.description && typeof data.description === 'string') {
    data.description = data.description.trim().substring(0, 28000);
  }

  // Sanitize numbers
  data.views = Math.max(0, Number(data.views) || 0);
  data.likes = Math.max(0, Number(data.likes) || 0);
  data.shares = Math.max(0, Number(data.shares) || 0);

  // Sanitize publishDate
  if (!data.publishDate || typeof data.publishDate !== 'string') {
    data.publishDate = new Date().toISOString().split('T')[0];
  } else if (data.publishDate.length > 50) {
    data.publishDate = data.publishDate.substring(0, 50);
  }

  // Sanitize tags
  if (Array.isArray(data.tags)) {
    data.tags = data.tags.filter((t) => typeof t === 'string' && t.trim().length > 0).slice(0, 50);
  } else {
    data.tags = ['នាំដឹង', 'ចំណេះដឹង', 'បច្ចេកវិទ្យា'];
  }

  // Sanitize duration
  if (data.duration && typeof data.duration === 'string') {
    data.duration = data.duration.substring(0, 50);
  }

  // Sanitize notes
  if (data.notes && typeof data.notes === 'string') {
    data.notes = data.notes.substring(0, 18000);
  }

  // Remove undefined or null properties
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || data[key] === null) {
      delete data[key];
    }
  });

  return data;
}

/**
 * Real-time subscription to all videos from Firestore
 */
export function subscribeToVideos(
  onSuccess: (videos: VideoItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  try {
    const colRef = collection(db, VIDEOS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: VideoItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as VideoItem);
        });
        onSuccess(items);
      },
      (error) => {
        onError?.(error);
        console.warn('Firestore subscription fallback to local cache:', error);
      }
    );
  } catch (error) {
    onError?.(error);
    console.warn('Firestore collection access failed, fallback to local storage:', error);
    return () => {};
  }
}

/**
 * Save / Update a single video in Firestore
 */
export async function saveVideoToCloud(video: VideoItem): Promise<VideoItem> {
  const payload = cleanVideoPayload(video) as VideoItem;
  const docPath = `${VIDEOS_COLLECTION}/${payload.id}`;
  try {
    const docRef = doc(db, VIDEOS_COLLECTION, payload.id);
    await setDoc(docRef, payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Delete a video from Firestore
 */
export async function deleteVideoFromCloud(videoId: string): Promise<void> {
  const docPath = `${VIDEOS_COLLECTION}/${videoId}`;
  try {
    const docRef = doc(db, VIDEOS_COLLECTION, videoId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Seed or batch import videos to Cloud Firestore
 */
export async function batchSaveVideosToCloud(videos: VideoItem[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    videos.forEach((v) => {
      const docRef = doc(db, VIDEOS_COLLECTION, v.id);
      batch.set(docRef, cleanVideoPayload(v), { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, VIDEOS_COLLECTION);
  }
}

/**
 * Reset all videos on Cloud with provided default dataset
 */
export async function resetCloudVideos(defaultVideos: VideoItem[]): Promise<void> {
  try {
    // Delete existing
    const colRef = collection(db, VIDEOS_COLLECTION);
    const existingSnap = await getDocs(colRef);
    const batch = writeBatch(db);
    existingSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    // Add default videos
    defaultVideos.forEach((v) => {
      const docRef = doc(db, VIDEOS_COLLECTION, v.id);
      batch.set(docRef, cleanVideoPayload(v));
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, VIDEOS_COLLECTION);
  }
}

/**
 * Google Sign In Helper
 */
export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Sign out helper
 */
export async function logOut() {
  return await signOut(auth);
}

const SETTINGS_COLLECTION = 'app_settings';
const SECURITY_DOC_ID = 'security';

/**
 * Real-time listener for Admin Passcode across all devices & browsers
 */
export function subscribeToAdminPasscode(
  onPasscodeChange: (passcode: string) => void
): Unsubscribe {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SECURITY_DOC_ID);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && typeof data.passcode === 'string' && data.passcode.trim()) {
            onPasscodeChange(data.passcode.trim());
          }
        }
      },
      (error) => {
        console.warn('Firestore security settings listener notice:', error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe to security passcode in Firestore:', error);
    return () => {};
  }
}

/**
 * Persist new Admin Passcode to Cloud Firestore so all devices update immediately
 */
export async function updateAdminPasscodeInCloud(newPasscode: string): Promise<void> {
  const docPath = `${SETTINGS_COLLECTION}/${SECURITY_DOC_ID}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SECURITY_DOC_ID);
    await setDoc(
      docRef,
      {
        passcode: newPasscode.trim(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

const CHANNEL_INFO_DOC_ID = 'channel_info';

export interface ChannelStats {
  followers: string;
  likes: string;
  updatedAt?: string;
}

/**
 * Real-time listener for Channel/Facebook Followers & Likes across all devices
 */
export function subscribeToChannelStats(
  onStatsChange: (stats: ChannelStats) => void
): Unsubscribe {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CHANNEL_INFO_DOC_ID);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data) {
            onStatsChange({
              followers: data.followers || '12.4K',
              likes: data.likes || '2.3K',
              updatedAt: data.updatedAt,
            });
          }
        }
      },
      (error) => {
        console.warn('Firestore channel stats listener notice:', error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe to channel stats in Firestore:', error);
    return () => {};
  }
}

/**
 * Persist new Channel Stats (Followers / Likes) to Cloud Firestore
 */
export async function updateChannelStatsInCloud(stats: Partial<ChannelStats>): Promise<void> {
  const docPath = `${SETTINGS_COLLECTION}/${CHANNEL_INFO_DOC_ID}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CHANNEL_INFO_DOC_ID);
    await setDoc(
      docRef,
      {
        ...stats,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

