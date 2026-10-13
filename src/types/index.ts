export interface Deity {
  id: string;
  name: string;
  hindiName: string;
  sanskritMantra: string;
  symbol: string;
  avatarUrl: string;
  color: string;
}

export interface TempleHours {
  openingTime: string;
  closingTime: string;
  morningSlot: string;
  eveningSlot: string;
  breakTime?: string;
  statusText?: string;
}

export interface DarshanSlot {
  name: string;
  hindiName?: string;
  time: string;
  type?: 'aarti' | 'darshan' | 'bhog' | 'special';
  description?: string;
}

export interface Temple {
  id: string;
  name: string;
  hindiName: string;
  deityId: string;
  deityName: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  adminName: string;
  adminRole: string;
  isVerified: boolean;
  avatarUrl: string;
  coverUrl: string;
  followersCount: number;
  dailyDarshanTimings: string;
  description: string;
  templeHours?: TempleHours;
  darshanSlots?: DarshanSlot[];
}

export interface Video {
  id: string;
  title: string;
  hindiTitle: string;
  templeId: string;
  templeName: string;
  templeCity: string;
  templeState: string;
  adminName: string;
  deityId: string;
  category: 'live_darshan' | 'mangala_aarti' | 'sandhya_aarti' | 'abhishek' | 'festival_special' | string;
  categoryLabel: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  uploadedAt: string;
  viewsCount: number;
  blessingsCount: number;
  flowersOfferedCount: number;
  diyasLitCount: number;
  isLive?: boolean;
  liveViewers?: number;
  latitude: number;
  longitude: number;
  description: string;
  commentsCount: number;
}

export interface TrusteeApplication {
  id: string;
  templeName: string;
  deityName: string;
  city: string;
  state: string;
  representativeName: string;
  designation: string;
  phone: string;
  email: string;
  registrationNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  notes: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  templeName: string;
  videoId?: string;
  timestamp: string;
  isRead: boolean;
  type: 'upload' | 'admin_approved' | 'live_aarti' | 'daily_darshan';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'devotee' | 'temple_admin' | 'super_admin';
  templeId?: string;
  savedVideos: string[];
  followedTemples: string[];
  avatarUrl?: string;
  createdAt: string;
}
