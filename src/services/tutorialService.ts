import { VideoTutorial, User } from '@/types';
import { storage } from './storage';
import { cloudSyncService } from './cloudSyncService';
import { auditService } from './auditService';
import { parseVideoEmbed } from '@/lib/videoEmbed';
import { INITIAL_TUTORIALS } from '@/config/tutorials';
import { rtdb } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';

class TutorialService {
  /**
   * Retrieves all video tutorials, sorted by sortOrder asc, then createdAt desc.
   */
  getAll(): VideoTutorial[] {
    const rawTutorials = storage.get<VideoTutorial[]>('TUTORIALS', INITIAL_TUTORIALS);
    // Filter out any legacy demo/mock tutorials
    const tutorials = rawTutorials.filter(
      (t) =>
        t &&
        t.id &&
        !['tut-1', 'tut-2', 'tut-3'].includes(t.id) &&
        !t.rawInput?.includes('dQw4w9WgXcQ') &&
        !t.rawInput?.includes('L_LUpnjgPso') &&
        !t.rawInput?.includes('kJQP7kiw5Fk')
    );

    // If demo items were purged, synchronize storage & cloud
    if (tutorials.length !== rawTutorials.length) {
      storage.set('TUTORIALS', tutorials);
      ['tut-1', 'tut-2', 'tut-3'].forEach((id) => {
        cloudSyncService.deleteTutorialFromCloud(id).catch(() => {});
      });
    }

    return [...tutorials].sort((a, b) => {
      if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) {
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Retrieves only active tutorials for the public user-facing library.
   */
  getActive(): VideoTutorial[] {
    return this.getAll().filter((item) => item.isActive);
  }

  /**
   * Retrieves a single tutorial by ID.
   */
  getById(id: string): VideoTutorial | undefined {
    return this.getAll().find((t) => t.id === id);
  }

  /**
   * Fetches latest tutorials from RTDB and Firestore, updates local storage, and returns clean list.
   * If local storage contains un-synced real tutorials (e.g. newly created by admin), it automatically pushes them to RTDB.
   */
  async fetchFromCloud(): Promise<VideoTutorial[]> {
    try {
      const snap = await get(ref(rtdb, 'tutorials'));
      if (snap.exists()) {
        const val = snap.val() || {};
        const remoteItems = Object.values(val) as VideoTutorial[];
        const cleaned = remoteItems.filter(
          (t) =>
            t &&
            t.id &&
            !['tut-1', 'tut-2', 'tut-3'].includes(t.id) &&
            !t.rawInput?.includes('dQw4w9WgXcQ')
        );

        // Merge with any local tutorials not yet in RTDB
        const local = this.getAll();
        const map = new Map<string, VideoTutorial>();
        cleaned.forEach((t) => map.set(t.id, t));
        local.forEach((t) => {
          if (!map.has(t.id)) {
            map.set(t.id, t);
            // Push missing local tutorial to RTDB so other users immediately receive it!
            set(ref(rtdb, `tutorials/${t.id}`), t).catch(() => {});
          }
        });

        const merged = Array.from(map.values()).sort((a, b) => {
          if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) {
            return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        storage.set('TUTORIALS', merged);
        return merged;
      } else {
        // If RTDB is empty but local storage has tutorials created by admin, sync them to RTDB now!
        const local = this.getAll();
        if (local.length > 0) {
          for (const t of local) {
            await set(ref(rtdb, `tutorials/${t.id}`), t).catch(() => {});
          }
        }
        return local;
      }
    } catch (err) {
      console.warn('[TutorialService] fetchFromCloud error:', err);
      return this.getAll();
    }
  }

  /**
   * Adds or updates a video tutorial item.
   */
  async save(
    data: {
      id?: string;
      title: string;
      rawInput: string;
      description?: string;
      category?: string;
      duration?: string;
      thumbnailUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
      featured?: boolean;
      sourceDirectUrl?: string;
    },
    admin?: User | null
  ): Promise<VideoTutorial> {
    const list = this.getAll();
    const isNew = !data.id || !list.some((item) => item.id === data.id);

    const parsed = parseVideoEmbed(data.rawInput);

    const tutorialId = data.id || `tut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const tutorial: VideoTutorial = {
      id: tutorialId,
      title: (data.title || parsed.extractedTitle || 'Untitled Video Tutorial').trim(),
      description: data.description?.trim() || '',
      embedUrl: parsed.embedUrl || data.rawInput,
      rawInput: data.rawInput.trim(),
      sourceType: parsed.sourceType,
      category: data.category?.trim() || 'Getting Started',
      duration: data.duration?.trim() || '',
      thumbnailUrl: data.thumbnailUrl?.trim() || parsed.thumbnailUrl || '',
      sourceDirectUrl: data.sourceDirectUrl?.trim() || parsed.sourceDirectUrl || '',
      sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : list.length + 1,
      isActive: data.isActive !== undefined ? data.isActive : true,
      featured: Boolean(data.featured),
      createdAt: isNew ? now : list.find((item) => item.id === tutorialId)?.createdAt || now,
      updatedAt: now,
    };

    let updatedList: VideoTutorial[];
    if (isNew) {
      updatedList = [tutorial, ...list];
    } else {
      updatedList = list.map((item) => (item.id === tutorialId ? tutorial : item));
    }

    storage.set('TUTORIALS', updatedList);

    // Sync to Firestore cloud
    try {
      await cloudSyncService.syncTutorialToCloud(tutorial);
    } catch (err) {
      console.warn('[TutorialService] cloud sync warning:', err);
    }

    // Audit log
    if (admin) {
      auditService.logAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: isNew ? 'CREATE_VIDEO_TUTORIAL' : 'UPDATE_VIDEO_TUTORIAL',
        entityType: 'tutorial',
        entityId: tutorial.id,
        details: `${isNew ? 'Created' : 'Updated'} video tutorial "${tutorial.title}" (${tutorial.sourceType})`,
      });
    }

    return tutorial;
  }

  /**
   * Deletes a tutorial by ID.
   */
  async delete(id: string, admin?: User | null): Promise<boolean> {
    const list = this.getAll();
    const itemToDelete = list.find((t) => t.id === id);
    if (!itemToDelete) return false;

    const filtered = list.filter((t) => t.id !== id);
    storage.set('TUTORIALS', filtered);

    try {
      await cloudSyncService.deleteTutorialFromCloud(id);
    } catch (err) {
      console.warn('[TutorialService] cloud delete warning:', err);
    }

    if (admin) {
      auditService.logAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: 'DELETE_VIDEO_TUTORIAL',
        entityType: 'tutorial',
        entityId: id,
        details: `Deleted video tutorial "${itemToDelete.title}"`,
      });
    }

    return true;
  }

  /**
   * Toggles the active visibility status of a tutorial.
   */
  async toggleStatus(id: string, admin?: User | null): Promise<VideoTutorial | undefined> {
    const list = this.getAll();
    const item = list.find((t) => t.id === id);
    if (!item) return undefined;

    const updated: VideoTutorial = {
      ...item,
      isActive: !item.isActive,
      updatedAt: new Date().toISOString(),
    };

    const nextList = list.map((t) => (t.id === id ? updated : t));
    storage.set('TUTORIALS', nextList);

    try {
      await cloudSyncService.syncTutorialToCloud(updated);
    } catch (err) {
      console.warn('[TutorialService] cloud toggle warning:', err);
    }

    if (admin) {
      auditService.logAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: 'TOGGLE_VIDEO_STATUS',
        entityType: 'tutorial',
        entityId: id,
        details: `${updated.isActive ? 'Activated' : 'Deactivated'} tutorial "${item.title}"`,
      });
    }

    return updated;
  }
}

export const tutorialService = new TutorialService();
