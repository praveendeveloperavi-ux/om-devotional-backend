import { Request, Response } from 'express';
import { dataStore } from '../data/store';

export const getApplications = (req: Request, res: Response) => {
  try {
    const apps = dataStore.getTrusteeApplications();
    res.json({ success: true, count: apps.length, data: apps });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitApplication = (req: Request, res: Response) => {
  try {
    const { templeName, deityName, city, state, representativeName, designation, phone, email, registrationNumber, notes } = req.body;
    if (!templeName || !representativeName || !phone || !registrationNumber) {
      return res.status(400).json({ success: false, message: 'Temple name, representative name, phone, and registration number are required.' });
    }

    const application = dataStore.submitTrusteeApplication({
      templeName,
      deityName: deityName || 'Lord Shiva',
      city: city || 'Varanasi',
      state: state || 'Uttar Pradesh',
      representativeName,
      designation: designation || 'General Trustee',
      phone,
      email: email || 'trustee@mandir.org',
      registrationNumber,
      notes: notes || 'Temple registration application for live broadcast'
    });

    res.status(201).json({
      success: true,
      message: 'Temple verification application submitted successfully. Verification takes 24-48 hours.',
      data: application
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewApplication = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const reviewed = dataStore.reviewTrusteeApplication(id, status);
    if (!reviewed) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({
      success: true,
      message: `Trustee application marked as ${status}.`,
      data: reviewed
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
