import { Request, Response } from 'express';
import { dataStore } from '../data/store';
import { AuthRequest } from '../middleware/auth';

export const getVideos = (req: Request, res: Response) => {
  try {
    const { deityId, category, templeId, search } = req.query;
    const videos = dataStore.getVideos({
      deityId: deityId as string,
      category: category as string,
      templeId: templeId as string,
      search: search as string
    });
    res.json({ success: true, count: videos.length, data: videos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVideoById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = dataStore.getVideoById(id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Devotional video not found' });
    }
    res.json({ success: true, data: video });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const performAction = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'blessing' | 'flower' | 'diya'
    if (!['blessing', 'flower', 'diya'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid devotional action. Must be blessing, flower, or diya.' });
    }
    const updated = dataStore.performDevotionalAction(id, action);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Devotional video not found' });
    }
    res.json({
      success: true,
      message: `Sacred ${action} offered successfully!`,
      data: {
        id: updated.id,
        blessingsCount: updated.blessingsCount,
        flowersOfferedCount: updated.flowersOfferedCount,
        diyasLitCount: updated.diyasLitCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadVideo = (req: AuthRequest, res: Response) => {
  try {
    const { title, hindiTitle, templeId, deityId, category, categoryLabel, videoUrl, thumbnailUrl, duration, description } = req.body;

    if (!title || !templeId || !videoUrl) {
      return res.status(400).json({ success: false, message: 'Title, templeId, and videoUrl are required.' });
    }

    const temple = dataStore.getTempleById(templeId);
    if (!temple) {
      return res.status(400).json({ success: false, message: 'Associated temple does not exist.' });
    }

    const newVideo = dataStore.addVideo({
      title,
      hindiTitle: hindiTitle || title,
      templeId,
      templeName: temple.name,
      templeCity: temple.city,
      templeState: temple.state,
      adminName: req.user?.email || temple.adminName,
      deityId: deityId || temple.deityId,
      category: category || 'live_darshan',
      categoryLabel: categoryLabel || 'Sacred Aarti',
      videoUrl,
      thumbnailUrl: thumbnailUrl || temple.avatarUrl,
      duration: duration || '10:00',
      uploadedAt: 'Just now',
      latitude: temple.latitude,
      longitude: temple.longitude,
      description: description || `Sacred darshan from ${temple.name}`
    });

    res.status(201).json({ success: true, message: 'Divine video published successfully!', data: newVideo });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
