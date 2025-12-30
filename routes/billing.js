const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const bills = [
    { id: 'BILL-001', patient: 'John Doe', amount: 5500, status: 'Paid', date: '2025-12-30', type: 'OPD' },
    { id: 'BILL-002', patient: 'Michael Brown', amount: 125000, status: 'Pending', date: '2025-12-30', type: 'IPD' },
    { id: 'BILL-003', patient: 'Emma Wilson', amount: 185000, status: 'Partially Paid', date: '2025-12-30', type: 'Surgery' }
  ];

  res.render('pages/billing', {
    title: 'Billing Management',
    currentPage: 'billing',
    bills
  });
});

module.exports = router;
