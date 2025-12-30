const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const radiologyScans = [
    { id: 'RAD-001', patient: 'Michael Brown', scan: 'X-Ray Chest', status: 'Completed', ordered: '2025-12-30 09:30', radiologist: 'Dr. Verma' },
    { id: 'RAD-002', patient: 'Lisa Anderson', scan: 'MRI Brain', status: 'In Progress', ordered: '2025-12-30 11:00', radiologist: 'Dr. Mehta' },
    { id: 'RAD-003', patient: 'Robert Johnson', scan: 'CT Scan Abdomen', status: 'Scheduled', ordered: '2025-12-30 14:00', radiologist: 'Dr. Verma' }
  ];

  res.render('pages/radiology', {
    title: 'Radiology Management',
    currentPage: 'radiology',
    radiologyScans
  });
});

module.exports = router;
