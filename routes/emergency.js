const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const emergencyCases = [
    { id: 'EM-001', patient: 'Alex Turner', age: 42, condition: 'Cardiac Arrest', severity: 'Critical', arrival: '10:30 AM', status: 'Under Treatment' },
    { id: 'EM-002', patient: 'Nina Patel', age: 28, condition: 'Road Accident', severity: 'Serious', arrival: '11:15 AM', status: 'Stabilized' },
    { id: 'EM-003', patient: 'Chris Evans', age: 35, condition: 'Severe Burns', severity: 'Critical', arrival: '12:00 PM', status: 'Under Treatment' }
  ];

  res.render('pages/emergency', {
    title: 'Emergency Management',
    currentPage: 'emergency',
    emergencyCases
  });
});

module.exports = router;
