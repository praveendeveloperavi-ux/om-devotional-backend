import mongoose from 'mongoose';
import {
  DeityModel,
  TempleModel,
  VideoModel,
  UserModel,
  TrusteeApplicationModel,
  NotificationModel
} from '../models/mongoSchema';
import {
  SEED_DEITIES,
  SEED_TEMPLES,
  SEED_VIDEOS,
  SEED_TRUSTEE_APPLICATIONS,
  SEED_NOTIFICATIONS
} from './seedData';
import { dataStore } from './store';
import { User, Temple, Video, TrusteeApplication, NotificationItem } from '../types';

export class MongoDBSyncService {
  private isConnected = false;

  public setConnected(status: boolean) {
    this.isConnected = status;
  }

  public getIsConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Seed collections if empty, or hydrate memory store with MongoDB records if populated.
   */
  async initializeDatabase() {
    try {
      console.log('🕉️ [MongoDB Atlas] Initializing collections & seeding authentic data...');

      // 1. Deities
      const deityCount = await DeityModel.countDocuments();
      if (deityCount === 0) {
        console.log(`🕉️ [MongoDB Atlas] Seeding ${SEED_DEITIES.length} Deities...`);
        await DeityModel.insertMany(SEED_DEITIES);
      } else {
        const mongoDeities = await DeityModel.find().lean();
        dataStore.setDeities(mongoDeities as any);
        console.log(`🕉️ [MongoDB Atlas] Loaded ${mongoDeities.length} Deities from database.`);
      }

      // 2. Temples
      const templeCount = await TempleModel.countDocuments();
      if (templeCount === 0) {
        console.log(`🕉️ [MongoDB Atlas] Seeding ${SEED_TEMPLES.length} Temples with Gate & Darshan Timings...`);
        await TempleModel.insertMany(SEED_TEMPLES);
      } else {
        const mongoTemples = await TempleModel.find().lean();
        dataStore.setTemples(mongoTemples as any);
        console.log(`🕉️ [MongoDB Atlas] Loaded ${mongoTemples.length} Temples from database.`);
      }

      // 3. Videos
      const videoCount = await VideoModel.countDocuments();
      if (videoCount === 0) {
        console.log(`🕉️ [MongoDB Atlas] Seeding ${SEED_VIDEOS.length} Devotional Videos & Aarti Streams...`);
        await VideoModel.insertMany(SEED_VIDEOS);
      } else {
        const mongoVideos = await VideoModel.find().lean();
        dataStore.setVideos(mongoVideos as any);
        console.log(`🕉️ [MongoDB Atlas] Loaded ${mongoVideos.length} Videos from database.`);
      }

      // 4. Trustee Applications
      const trusteeCount = await TrusteeApplicationModel.countDocuments();
      if (trusteeCount === 0) {
        console.log(`🕉️ [MongoDB Atlas] Seeding ${SEED_TRUSTEE_APPLICATIONS.length} Trustee Applications...`);
        await TrusteeApplicationModel.insertMany(SEED_TRUSTEE_APPLICATIONS);
      } else {
        const mongoTrustees = await TrusteeApplicationModel.find().lean();
        dataStore.setTrusteeApplications(mongoTrustees as any);
        console.log(`🕉️ [MongoDB Atlas] Loaded ${mongoTrustees.length} Trustee Applications from database.`);
      }

      // 5. Notifications
      const notifCount = await NotificationModel.countDocuments();
      if (notifCount === 0) {
        console.log(`🕉️ [MongoDB Atlas] Seeding ${SEED_NOTIFICATIONS.length} Notifications...`);
        await NotificationModel.insertMany(SEED_NOTIFICATIONS);
      } else {
        const mongoNotifs = await NotificationModel.find().lean();
        dataStore.setNotifications(mongoNotifs as any);
        console.log(`🕉️ [MongoDB Atlas] Loaded ${mongoNotifs.length} Notifications from database.`);
      }

      // 6. Users
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('🕉️ [MongoDB Atlas] Seeding default Super Admin & Devotee accounts...');
        const initialUsers: User[] = [
          {
            id: 'usr-admin-1',
            name: 'Praveen Developer (Chief Admin)',
            email: 'praveendeveloperavi@gmail.com',
            role: 'super_admin',
            savedVideos: ['vid-kashi-live', 'vid-ram-shringaar'],
            followedTemples: ['temple-kashi', 'temple-ayodhya'],
            createdAt: new Date().toISOString()
          },
          {
            id: 'usr-devotee-1',
            name: 'Bhakt Ananya',
            email: 'bhakt@omdevotional.com',
            role: 'devotee',
            savedVideos: ['vid-tirupati-suprabhatam'],
            followedTemples: ['temple-tirupati'],
            createdAt: new Date().toISOString()
          }
        ];
        await UserModel.insertMany(initialUsers);
      } else {
        const mongoUsers = await UserModel.find().lean();
        dataStore.setUsers(mongoUsers as any);
        console.log(`🕉️ [MongoDB Atlas] Loaded ${mongoUsers.length} Users from database.`);
      }

      this.isConnected = true;
      console.log('✨ [MongoDB Atlas] Database synchronization completed successfully!');
    } catch (err: any) {
      console.error('⚠️ [MongoDB Atlas] Synchronization error:', err.message);
    }
  }

  // Persistence Helpers (write-through)
  async persistUser(user: User) {
    if (!this.getIsConnected()) return;
    try {
      await UserModel.findOneAndUpdate({ id: user.id }, user, { upsert: true, new: true });
    } catch (e: any) {
      console.warn('MongoDB persistUser warning:', e.message);
    }
  }

  async persistVideo(video: Video) {
    if (!this.getIsConnected()) return;
    try {
      await VideoModel.findOneAndUpdate({ id: video.id }, video, { upsert: true, new: true });
    } catch (e: any) {
      console.warn('MongoDB persistVideo warning:', e.message);
    }
  }

  async persistTrusteeApplication(app: TrusteeApplication) {
    if (!this.getIsConnected()) return;
    try {
      await TrusteeApplicationModel.findOneAndUpdate({ id: app.id }, app, { upsert: true, new: true });
    } catch (e: any) {
      console.warn('MongoDB persistTrusteeApplication warning:', e.message);
    }
  }

  async persistNotification(notif: NotificationItem) {
    if (!this.getIsConnected()) return;
    try {
      await NotificationModel.findOneAndUpdate({ id: notif.id }, notif, { upsert: true, new: true });
    } catch (e: any) {
      console.warn('MongoDB persistNotification warning:', e.message);
    }
  }

  async persistVideoAction(videoId: string, action: 'blessing' | 'flower' | 'diya') {
    if (!this.getIsConnected()) return;
    try {
      const field = action === 'blessing' ? 'blessingsCount' : action === 'flower' ? 'flowersOfferedCount' : 'diyasLitCount';
      await VideoModel.updateOne({ id: videoId }, { $inc: { [field]: 1 } });
    } catch (e: any) {
      console.warn('MongoDB persistVideoAction warning:', e.message);
    }
  }

  async persistFollowTemple(templeId: string) {
    if (!this.getIsConnected()) return;
    try {
      await TempleModel.updateOne({ id: templeId }, { $inc: { followersCount: 1 } });
    } catch (e: any) {
      console.warn('MongoDB persistFollowTemple warning:', e.message);
    }
  }

  async persistSavedVideos(userId: string, savedVideos: string[]) {
    if (!this.getIsConnected()) return;
    try {
      await UserModel.updateOne({ id: userId }, { $set: { savedVideos } });
    } catch (e: any) {
      console.warn('MongoDB persistSavedVideos warning:', e.message);
    }
  }

  async getDatabaseStats() {
    if (!this.getIsConnected()) {
      return {
        connected: false,
        source: 'in-memory-fallback',
        counts: {
          deities: dataStore.getDeities().length,
          temples: dataStore.getTemples().length,
          videos: dataStore.getVideos().length,
          trustees: dataStore.getTrusteeApplications().length,
          notifications: dataStore.getNotifications().length
        }
      };
    }

    const [deities, temples, videos, users, trustees, notifications] = await Promise.all([
      DeityModel.countDocuments(),
      TempleModel.countDocuments(),
      VideoModel.countDocuments(),
      UserModel.countDocuments(),
      TrusteeApplicationModel.countDocuments(),
      NotificationModel.countDocuments()
    ]);

    return {
      connected: true,
      database: mongoose.connection.name || 'omdevotional',
      host: mongoose.connection.host,
      counts: { deities, temples, videos, users, trustees, notifications }
    };
  }
}

export const dbSyncService = new MongoDBSyncService();
