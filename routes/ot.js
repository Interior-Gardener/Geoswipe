const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const otSchedule = [
    { id: 'OT-001', patient: 'Emma Wilson', surgery: 'Appendectomy', surgeon: 'Dr. Sharma', theater: 'OT-1', scheduled: '09:00 AM', status: 'In Progress' },
    { id: 'OT-002', patient: 'William Davis', surgery: 'Knee Replacement', surgeon: 'Dr. Kumar', theater: 'OT-2', scheduled: '11:00 AM', status: 'Scheduled' },
    { id: 'OT-003', patient: 'Olivia Brown', surgery: 'C-Section', surgeon: 'Dr. Reddy', theater: 'OT-3', scheduled: '02:00 PM', status: 'Scheduled' }
  ];

  res.render('pages/ot', {
    title: 'Operation Theater Management',
    currentPage: 'ot',
    otSchedule
  });
});

module.exports = router;
