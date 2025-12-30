const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const insuranceClaims = [
    { id: 'INS-001', patient: 'Michael Brown', provider: 'Star Health', claimAmount: 125000, status: 'Approved', submitted: '2025-12-28' },
    { id: 'INS-002', patient: 'Emma Wilson', provider: 'HDFC Ergo', claimAmount: 185000, status: 'Under Review', submitted: '2025-12-30' },
    { id: 'INS-003', patient: 'David Lee', provider: 'ICICI Lombard', claimAmount: 95000, status: 'Pending', submitted: '2025-12-29' }
  ];

  res.render('pages/insurance', {
    title: 'Insurance Management',
    currentPage: 'insurance',
    insuranceClaims
  });
});

module.exports = router;
