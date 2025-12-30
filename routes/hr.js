const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const staff = [
    { id: 'HR-001', name: 'Dr. Sharma', department: 'General Medicine', role: 'Senior Consultant', shift: 'Morning', status: 'On Duty' },
    { id: 'HR-002', name: 'Dr. Kumar', department: 'Orthopedics', role: 'Consultant', shift: 'Evening', status: 'On Duty' },
    { id: 'HR-003', name: 'Nurse Mary', department: 'ICU', role: 'Staff Nurse', shift: 'Night', status: 'On Leave' }
  ];

  res.render('pages/hr', {
    title: 'HR Management',
    currentPage: 'hr',
    staff
  });
});

module.exports = router;
