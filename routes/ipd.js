const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const ipdPatients = [
    { id: 'IPD-001', patient: 'Michael Brown', bed: 'G-101', ward: 'General', admitted: '2025-12-25', doctor: 'Dr. Sharma', condition: 'Stable' },
    { id: 'IPD-002', patient: 'David Lee', bed: 'ICU-02', ward: 'ICU', admitted: '2025-12-29', doctor: 'Dr. Kumar', condition: 'Critical' },
    { id: 'IPD-003', patient: 'Lisa Anderson', bed: 'M-15', ward: 'Maternity', admitted: '2025-12-28', doctor: 'Dr. Reddy', condition: 'Stable' }
  ];

  res.render('pages/ipd', {
    title: 'IPD Management',
    currentPage: 'ipd',
    ipdPatients
  });
});

module.exports = router;
