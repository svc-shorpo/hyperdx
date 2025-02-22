import express from 'express';

import Alert from '@/models/alert';
import LogView from '@/models/logView';
import { isUserAuthenticated } from '@/middleware/auth';

const router = express.Router();

router.post('/', isUserAuthenticated, async (req, res, next) => {
  try {
    const teamId = req.user?.team;
    const userId = req.user?._id;
    const { query, name } = req.body;
    if (teamId == null) {
      return res.sendStatus(403);
    }
    if (query == null || !name) {
      return res.sendStatus(400);
    }
    const logView = await new LogView({
      name,
      query: `${query}`,
      team: teamId,
      creator: userId,
    }).save();

    res.json({
      data: logView,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/', isUserAuthenticated, async (req, res, next) => {
  try {
    const teamId = req.user?.team;
    if (teamId == null) {
      return res.sendStatus(403);
    }
    const logViews = await LogView.find(
      { team: teamId },
      {
        name: 1,
        query: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    ).sort({ createdAt: -1 });
    const allAlerts = await Promise.all(
      logViews.map(lv => Alert.find({ logView: lv._id }, { __v: 0 })),
    );
    res.json({
      data: logViews.map((lv, idx) => ({
        ...lv.toJSON(),
        alerts: allAlerts[idx],
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', isUserAuthenticated, async (req, res, next) => {
  try {
    const teamId = req.user?.team;
    const { id: logViewId } = req.params;
    const { query } = req.body;
    if (teamId == null) {
      return res.sendStatus(403);
    }
    if (!logViewId || !query) {
      return res.sendStatus(400);
    }
    const logView = await LogView.findByIdAndUpdate(
      logViewId,
      {
        query,
      },
      { new: true },
    );
    res.json({
      data: logView,
    });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', isUserAuthenticated, async (req, res, next) => {
  try {
    const teamId = req.user?.team;
    const { id: logViewId } = req.params;
    if (teamId == null) {
      return res.sendStatus(403);
    }
    if (!logViewId) {
      return res.sendStatus(400);
    }
    // delete all alerts
    await Alert.deleteMany({ logView: logViewId });
    await LogView.findByIdAndDelete(logViewId);
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

export default router;
