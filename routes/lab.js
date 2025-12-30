const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const labTests = [
    { id: 'LAB-001', patient: 'John Doe', test: 'Complete Blood Count', status: 'Completed', ordered: '2025-12-30 09:00', result: 'Normal' },
    { id: 'LAB-002', patient: 'Sarah Smith', test: 'Lipid Profile', status: 'In Progress', ordered: '2025-12-30 10:30', result: 'Pending' },
    { id: 'LAB-003', patient: 'David Lee', test: 'Blood Sugar', status: 'Completed', ordered: '2025-12-30 08:00', result: 'Elevated' }
  ];

  res.render('pages/lab', {
    title: 'Laboratory Management',
    currentPage: 'lab',
    labTests
  });
});

module.exports = router;
