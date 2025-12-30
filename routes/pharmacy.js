const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const pharmacyOrders = [
    { id: 'PH-001', patient: 'John Doe', medication: 'Amoxicillin 500mg', quantity: 20, status: 'Dispensed', prescribed: '2025-12-30' },
    { id: 'PH-002', patient: 'Sarah Smith', medication: 'Atorvastatin 10mg', quantity: 30, status: 'Pending', prescribed: '2025-12-30' },
    { id: 'PH-003', patient: 'Michael Brown', medication: 'Paracetamol 650mg', quantity: 10, status: 'Dispensed', prescribed: '2025-12-29' }
  ];

  res.render('pages/pharmacy', {
    title: 'Pharmacy Management',
    currentPage: 'pharmacy',
    pharmacyOrders
  });
});

module.exports = router;
