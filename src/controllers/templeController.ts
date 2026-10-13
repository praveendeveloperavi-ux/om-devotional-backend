import { Request, Response } from 'express';
import { dataStore } from '../data/store';

// Haversine formula for calculating distance between coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const getTemples = (req: Request, res: Response) => {
  try {
    const { deityId, search, lat, lng } = req.query;
    let temples = dataStore.getTemples();

    if (deityId && deityId !== 'all') {
      temples = temples.filter(t => t.deityId === deityId);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      temples = temples.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          t.hindiName.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.state.toLowerCase().includes(q)
      );
    }

    let result = temples.map(t => {
      let distanceKm: number | undefined;
      if (lat && lng) {
        const uLat = parseFloat(lat as string);
        const uLng = parseFloat(lng as string);
        if (!isNaN(uLat) && !isNaN(uLng)) {
          distanceKm = calculateDistance(uLat, uLng, t.latitude, t.longitude);
        }
      }
      return {
        ...t,
        distanceKm
      };
    });

    if (lat && lng) {
      result.sort((a, b) => (a.distanceKm || 99999) - (b.distanceKm || 99999));
    }

    res.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTempleById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const temple = dataStore.getTempleById(id);
    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }
    // Also attach videos belonging to this temple
    const templeVideos = dataStore.getVideos({ templeId: id });
    res.json({
      success: true,
      data: {
        ...temple,
        videos: templeVideos
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const followTemple = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = dataStore.followTemple(id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }
    res.json({
      success: true,
      message: `Now following ${result.temple.name}`,
      followersCount: result.temple.followersCount
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
