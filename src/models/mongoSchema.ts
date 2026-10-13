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
});

// Temple Schema
export const TempleSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hindiName: { type: String, required: true },
  deityId: { type: String, required: true, ref: 'Deity' },
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
  description: { type: String, required: true }
});

// Video Schema
export const VideoSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  hindiTitle: { type: String, required: true },
  templeId: { type: String, required: true, ref: 'Temple' },
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
});

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
  followedTemples: [{ type: String }]
}, { timestamps: true });

export const DeityModel = mongoose.model('Deity', DeitySchema);
export const TempleModel = mongoose.model('Temple', TempleSchema);
export const VideoModel = mongoose.model('Video', VideoSchema);
export const UserModel = mongoose.model('User', UserSchema);
