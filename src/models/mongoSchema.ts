import mongoose, { Schema } from 'mongoose';

// Deity Schema
export const DeitySchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hindiName: { type: String, required: true },
  sanskritMantra: { type: String, required: true },
  symbol: { type: String, required: true },
  avatarUrl: { type: String, required: true },
  color: { type: String, required: true }
}, { timestamps: true });

// Temple Schema
export const TempleSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hindiName: { type: String, required: true },
  deityId: { type: String, required: true },
  deityName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  adminName: { type: String, required: true },
  adminRole: { type: String, required: true },
  isVerified: { type: Boolean, default: true },
  avatarUrl: { type: String, required: true },
  coverUrl: { type: String, required: true },
  followersCount: { type: Number, default: 0 },
  dailyDarshanTimings: { type: String, required: true },
  description: { type: String, required: true },
  templeHours: {
    openingTime: { type: String },
    closingTime: { type: String },
    morningSlot: { type: String },
    eveningSlot: { type: String },
    breakTime: { type: String },
    statusText: { type: String }
  },
  darshanSlots: [{
    name: { type: String, required: true },
    hindiName: { type: String },
    time: { type: String, required: true },
    type: { type: String, enum: ['aarti', 'darshan', 'bhog', 'special'], default: 'darshan' },
    description: { type: String }
  }]
}, { timestamps: true });

// Video Schema
export const VideoSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  hindiTitle: { type: String, required: true },
  templeId: { type: String, required: true },
  templeName: { type: String, required: true },
  templeCity: { type: String, required: true },
  templeState: { type: String, required: true },
  adminName: { type: String, required: true },
  deityId: { type: String, required: true },
  category: { type: String, required: true },
  categoryLabel: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  duration: { type: String, default: '10:00' },
  uploadedAt: { type: String, default: 'Just now' },
  viewsCount: { type: Number, default: 0 },
  blessingsCount: { type: Number, default: 0 },
  flowersOfferedCount: { type: Number, default: 0 },
  diyasLitCount: { type: Number, default: 0 },
  isLive: { type: Boolean, default: false },
  liveViewers: { type: Number, default: 0 },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  description: { type: String, required: true },
  commentsCount: { type: Number, default: 0 }
}, { timestamps: true });

// User Schema
export const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['devotee', 'temple_admin', 'super_admin'], default: 'devotee' },
  phone: { type: String },
  templeId: { type: String },
  savedVideos: [{ type: String }],
  followedTemples: [{ type: String }],
  avatarUrl: { type: String }
}, { timestamps: true });

// Trustee Application Schema
export const TrusteeApplicationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  templeName: { type: String, required: true },
  deityName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  representativeName: { type: String, required: true },
  designation: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  appliedAt: { type: String, required: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Notification Schema
export const NotificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  templeName: { type: String, required: true },
  videoId: { type: String },
  timestamp: { type: String, default: 'Just now' },
  isRead: { type: Boolean, default: false },
  type: { type: String, enum: ['upload', 'admin_approved', 'live_aarti', 'daily_darshan'], default: 'daily_darshan' }
}, { timestamps: true });

export const DeityModel = mongoose.model('Deity', DeitySchema);
export const TempleModel = mongoose.model('Temple', TempleSchema);
export const VideoModel = mongoose.model('Video', VideoSchema);
export const UserModel = mongoose.model('User', UserSchema);
export const TrusteeApplicationModel = mongoose.model('TrusteeApplication', TrusteeApplicationSchema);
export const NotificationModel = mongoose.model('Notification', NotificationSchema);
