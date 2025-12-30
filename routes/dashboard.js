const express = require('express');
const router = express.Router();

// Dashboard route
router.get('/', (req, res) => {
  const stats = {
    totalPatients: 1247,
    activeOPD: 42,
    admittedIPD: 78,
    emergencyCases: 5,
    bedOccupancy: 82,
    pendingBills: 23,
    labTests: 156,
    surgeriesToday: 8,
    pharmacyOrders: 234,
    revenueToday: 485000
  };

  const recentActivities = [
    { time: '10 mins ago', activity: 'New patient registered - OPD', patient: 'John Doe', type: 'registration' },
    { time: '25 mins ago', activity: 'Lab test completed', patient: 'Sarah Smith', type: 'lab' },
    { time: '1 hour ago', activity: 'Patient admitted to ICU', patient: 'Michael Brown', type: 'admission' },
    { time: '2 hours ago', activity: 'Surgery scheduled', patient: 'Emma Wilson', type: 'surgery' },
    { time: '3 hours ago', activity: 'Billing cleared', patient: 'James Taylor', type: 'billing' }
  ];

  const bedStatus = {
    general: { total: 100, occupied: 78, available: 22 },
    icu: { total: 20, occupied: 18, available: 2 },
    emergency: { total: 15, occupied: 8, available: 7 },
    maternity: { total: 30, occupied: 24, available: 6 }
  };

  res.render('pages/dashboard', {
    title: 'Dashboard',
    currentPage: 'dashboard',
    stats,
    recentActivities,
    bedStatus
  });
});

module.exports = router;
