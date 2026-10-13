import { Router } from 'express';
import { getVideos, getVideoById, performAction, uploadVideo } from '../controllers/videoController';
import { getTemples, getTempleById, followTemple } from '../controllers/templeController';
import { login, register, getMe, toggleSaveVideo } from '../controllers/authController';
import { getApplications, submitApplication, reviewApplication } from '../controllers/trusteeController';
import { getNotifications, markRead } from '../controllers/notificationController';
import { dataStore } from '../data/store';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Deities
router.get('/deities', (req, res) => {
  const deities = dataStore.getDeities();
  res.json({ success: true, count: deities.length, data: deities });
});

// Videos
router.get('/videos', getVideos);
router.get('/videos/:id', getVideoById);
router.post('/videos/:id/action', performAction);
router.post('/videos/upload', authenticateToken, uploadVideo);

// Temples
router.get('/temples', getTemples);
router.get('/temples/:id', getTempleById);
router.post('/temples/:id/follow', followTemple);

// Auth
router.post('/auth/login', login);
router.post('/auth/register', register);
router.get('/auth/me', authenticateToken, getMe);
router.post('/auth/save-video', authenticateToken, toggleSaveVideo);

// Trustee Applications & Temple Registration
router.get('/trustees/applications', getApplications);
router.post('/trustees/apply', submitApplication);
router.post('/trustees/review/:id', reviewApplication);

// Notifications
router.get('/notifications', getNotifications);
router.post('/notifications/:id/read', markRead);

export default router;
