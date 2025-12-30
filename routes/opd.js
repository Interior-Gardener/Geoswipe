const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const opdQueue = [
    { token: 'OPD-001', patient: 'John Doe', department: 'General Medicine', doctor: 'Dr. Sharma', status: 'Consulting' },
    { token: 'OPD-002', patient: 'Sarah Smith', department: 'Cardiology', doctor: 'Dr. Patel', status: 'Waiting' },
    { token: 'OPD-003', patient: 'Robert Johnson', department: 'Orthopedics', doctor: 'Dr. Kumar', status: 'Waiting' },
    { token: 'OPD-004', patient: 'Emily Davis', department: 'Pediatrics', doctor: 'Dr. Singh', status: 'Completed' }
  ];

  res.render('pages/opd', {
    title: 'OPD Management',
    currentPage: 'opd',
    opdQueue
  });
});

module.exports = router;
