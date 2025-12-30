const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const emrRecords = [
    { id: 'EMR-001', patient: 'John Doe', lastUpdated: '2025-12-30', records: 45, allergies: 'Penicillin', bloodGroup: 'A+' },
    { id: 'EMR-002', patient: 'Sarah Smith', lastUpdated: '2025-12-29', records: 32, allergies: 'None', bloodGroup: 'B+' },
    { id: 'EMR-003', patient: 'Michael Brown', lastUpdated: '2025-12-30', records: 78, allergies: 'Sulfa drugs', bloodGroup: 'O+' }
  ];

  res.render('pages/emr', {
    title: 'Electronic Medical Records',
    currentPage: 'emr',
    emrRecords
  });
});

module.exports = router;
