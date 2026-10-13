import { Request, Response } from 'express';
import { dataStore } from '../data/store';

export const getNotifications = (req: Request, res: Response) => {
  try {
    const notifs = dataStore.getNotifications();
    res.json({ success: true, count: notifs.length, data: notifs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markRead = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = dataStore.markNotificationAsRead(id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
