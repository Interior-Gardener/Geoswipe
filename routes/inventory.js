const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const inventory = [
    { id: 'INV-001', item: 'Surgical Gloves', category: 'Medical Supplies', quantity: 500, reorderLevel: 100, status: 'In Stock' },
    { id: 'INV-002', item: 'Paracetamol 500mg', category: 'Pharmacy', quantity: 50, reorderLevel: 100, status: 'Low Stock' },
    { id: 'INV-003', item: 'IV Fluid (500ml)', category: 'Medical Supplies', quantity: 200, reorderLevel: 50, status: 'In Stock' }
  ];

  res.render('pages/inventory', {
    title: 'Inventory Management',
    currentPage: 'inventory',
    inventory
  });
});

module.exports = router;
