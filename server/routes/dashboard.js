const express = require('express');
const User = require('../model/User');
const Trip = require('../model/Trips');
const router = express.Router();

// Utility: Filter by date
function filterByDate(items, key, start, end) {
  return items.filter((item) =>
    item[key] >= start && (!end || item[key] <= end)
  ).length;
}

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const d = new Date();
    const startCurrent = new Date(d.getFullYear(), d.getMonth(), 1);
    const startPrev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const endPrev = new Date(d.getFullYear(), d.getMonth(), 0);

    const [users, trips] = await Promise.all([
      User.find({}),
      Trip.find({}),
    ]);

    const role = 'user'; // example: adjust by your User schema

    const filterUsersByRole = users.filter((u) => u.status === role);

    res.json({
      totalUsers: users.length,
      usersJoined: {
        currentMonth: filterByDate(users, 'joinedAt', startCurrent, undefined),
        lastMonth: filterByDate(users, 'joinedAt', startPrev, endPrev)
      },
      userRole: {
        total: filterUsersByRole.length,
        currentMonth: filterByDate(filterUsersByRole, 'joinedAt', startCurrent),
        lastMonth: filterByDate(filterUsersByRole, 'joinedAt', startPrev, endPrev)
      },
      totalTrips: trips.length,
      tripsCreated: {
        currentMonth: filterByDate(trips, 'createdAt', startCurrent),
        lastMonth: filterByDate(trips, 'createdAt', startPrev, endPrev)
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/user-growth
router.get('/user-growth', async (req, res) => {
  try {
    const users = await User.find({});
    const userGrowth = {};

    for (const user of users) {
      const day = user.joinedAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      userGrowth[day] = (userGrowth[day] || 0) + 1;
    }

    const result = Object.entries(userGrowth).map(([day, count]) => ({
      count,
      day,
    }));

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/trip-growth
router.get('/trip-growth', async (req, res) => {
  try {
    const trips = await Trip.find({});
    const tripsGrowth = {};

    for (const trip of trips) {
      const day = trip.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      tripsGrowth[day] = (tripsGrowth[day] || 0) + 1;
    }

    const result = Object.entries(tripsGrowth).map(([day, count]) => ({
      count,
      day,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/travel-styles
router.get('/travel-styles', async (req, res) => {
  try {
    const trips = await Trip.find({});
    const travelStyleCounts = {};

    for (const trip of trips) {
      const parsedDetail = parseTripData(trip.tripDetail);
      const travelStyle = parsedDetail.travelStyle;
      if (travelStyle) {
        travelStyleCounts[travelStyle] = (travelStyleCounts[travelStyle] || 0) + 1;
      }
    }

    const result = Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
      count,
      travelStyle,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 function parseTripData(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    return data;
  } catch (error) {
    console.error("Failed to parse trip data:", error);
    return null;
  }
}

module.exports = router;
