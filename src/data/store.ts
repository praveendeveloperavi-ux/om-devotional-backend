import { Deity, Temple, Video, TrusteeApplication, NotificationItem, User } from '../types';
import { SEED_DEITIES, SEED_TEMPLES, SEED_VIDEOS, SEED_TRUSTEE_APPLICATIONS, SEED_NOTIFICATIONS } from './seedData';
import { dbSyncService } from './dbSync';

class DevotionalDataStore {
  private deities: Deity[] = [...SEED_DEITIES];
  private temples: Temple[] = [...SEED_TEMPLES];
  private videos: Video[] = [...SEED_VIDEOS];
  private trusteeApplications: TrusteeApplication[] = [...SEED_TRUSTEE_APPLICATIONS];
  private notifications: NotificationItem[] = [...SEED_NOTIFICATIONS];
  private users: User[] = [
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

  // Hydration Setters (invoked by MongoDBSyncService)
  setDeities(deities: Deity[]) {
    if (deities && deities.length) this.deities = deities;
  }

  setTemples(temples: Temple[]) {
    if (temples && temples.length) this.temples = temples;
  }

  setVideos(videos: Video[]) {
    if (videos && videos.length) this.videos = videos;
  }

  setTrusteeApplications(apps: TrusteeApplication[]) {
    if (apps && apps.length) this.trusteeApplications = apps;
  }

  setNotifications(notifs: NotificationItem[]) {
    if (notifs && notifs.length) this.notifications = notifs;
  }

  setUsers(users: User[]) {
    if (users && users.length) this.users = users;
  }

  // Deities
  getDeities(): Deity[] {
    return this.deities;
  }

  // Temples
  getTemples(): Temple[] {
    return this.temples;
  }

  getTempleById(id: string): Temple | undefined {
    return this.temples.find(t => t.id === id);
  }

  followTemple(templeId: string): { temple: Temple; isFollowed: boolean } | null {
    const temple = this.getTempleById(templeId);
    if (!temple) return null;
    temple.followersCount += 1;
    // Persist to MongoDB
    dbSyncService.persistFollowTemple(templeId);
    return { temple, isFollowed: true };
  }

  // Videos
  getVideos(filters?: { deityId?: string; category?: string; templeId?: string; search?: string }): Video[] {
    return this.videos.filter(v => {
      if (filters?.deityId && filters.deityId !== 'all' && v.deityId !== filters.deityId) {
        return false;
      }
      if (filters?.category && filters.category !== 'all') {
        if (filters.category === 'live' && !v.isLive) return false;
        if (filters.category !== 'live' && v.category !== filters.category) return false;
      }
      if (filters?.templeId && v.templeId !== filters.templeId) {
        return false;
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(q) || v.hindiTitle.toLowerCase().includes(q);
        const matchesTemple = v.templeName.toLowerCase().includes(q);
        const matchesDesc = v.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTemple && !matchesDesc) return false;
      }
      return true;
    });
  }

  getVideoById(id: string): Video | undefined {
    return this.videos.find(v => v.id === id);
  }

  // Devotional actions
  performDevotionalAction(videoId: string, action: 'blessing' | 'flower' | 'diya'): Video | null {
    const video = this.getVideoById(videoId);
    if (!video) return null;

    if (action === 'blessing') {
      video.blessingsCount += 1;
    } else if (action === 'flower') {
      video.flowersOfferedCount += 1;
    } else if (action === 'diya') {
      video.diyasLitCount += 1;
    }

    // Persist to MongoDB
    dbSyncService.persistVideoAction(videoId, action);
    return video;
  }

  // Add new video (by Temple Admin)
  addVideo(newVideoData: Omit<Video, 'id' | 'viewsCount' | 'blessingsCount' | 'flowersOfferedCount' | 'diyasLitCount' | 'commentsCount'>): Video {
    const newVideo: Video = {
      ...newVideoData,
      id: `vid-${Date.now()}`,
      viewsCount: 1,
      blessingsCount: 0,
      flowersOfferedCount: 0,
      diyasLitCount: 0,
      commentsCount: 0
    };
    this.videos.unshift(newVideo);

    // Persist to MongoDB
    dbSyncService.persistVideo(newVideo);

    // Trigger notification
    this.addNotification({
      title: `🔔 New Video from ${newVideo.templeName}`,
      message: `${newVideo.adminName} has just uploaded "${newVideo.title}". Watch the divine darshan now.`,
      templeName: newVideo.templeName,
      videoId: newVideo.id,
      type: 'upload'
    });

    return newVideo;
  }

  // Trustee Applications
  getTrusteeApplications(): TrusteeApplication[] {
    return this.trusteeApplications;
  }

  submitTrusteeApplication(appData: Omit<TrusteeApplication, 'id' | 'status' | 'appliedAt'>): TrusteeApplication {
    const newApp: TrusteeApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'pending',
      appliedAt: new Date().toISOString().split('T')[0]
    };
    this.trusteeApplications.unshift(newApp);

    // Persist to MongoDB
    dbSyncService.persistTrusteeApplication(newApp);
    return newApp;
  }

  reviewTrusteeApplication(id: string, status: 'approved' | 'rejected'): TrusteeApplication | null {
    const app = this.trusteeApplications.find(a => a.id === id);
    if (!app) return null;
    app.status = status;

    // Persist to MongoDB
    dbSyncService.persistTrusteeApplication(app);

    if (status === 'approved') {
      this.addNotification({
        title: `✅ Temple Registration Approved: ${app.templeName}`,
        message: `Representative ${app.representativeName} has been verified as authorized admin. You can now broadcast live Darshan.`,
        templeName: app.templeName,
        type: 'admin_approved'
      });
    }
    return app;
  }

  // Notifications
  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): NotificationItem {
    const notif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false
    };
    this.notifications.unshift(notif);

    // Persist to MongoDB
    dbSyncService.persistNotification(notif);
    return notif;
  }

  markNotificationAsRead(id: string): boolean {
    const notif = this.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.isRead = true;

    // Persist to MongoDB
    dbSyncService.persistNotification(notif);
    return true;
  }

  // Users & Auth
  findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  createUser(userData: { name: string; email: string; role?: User['role']; phone?: string }): User {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'devotee',
      phone: userData.phone,
      savedVideos: [],
      followedTemples: [],
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);

    // Persist to MongoDB
    dbSyncService.persistUser(newUser);
    return newUser;
  }

  toggleSaveVideo(userId: string, videoId: string): string[] | null {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;
    const idx = user.savedVideos.indexOf(videoId);
    if (idx >= 0) {
      user.savedVideos.splice(idx, 1);
    } else {
      user.savedVideos.push(videoId);
    }

    // Persist to MongoDB
    dbSyncService.persistSavedVideos(userId, user.savedVideos);
    return user.savedVideos;
  }
}

export const dataStore = new DevotionalDataStore();
