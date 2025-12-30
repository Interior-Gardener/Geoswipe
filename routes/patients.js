const express = require('express');
const router = express.Router();

// Sample patient data
const patients = [
  { id: 'P001', name: 'John Doe', age: 45, gender: 'Male', phone: '9876543210', lastVisit: '2025-12-28', status: 'Active' },
  { id: 'P002', name: 'Sarah Smith', age: 32, gender: 'Female', phone: '9876543211', lastVisit: '2025-12-29', status: 'Active' },
  { id: 'P003', name: 'Michael Brown', age: 58, gender: 'Male', phone: '9876543212', lastVisit: '2025-12-25', status: 'Admitted' },
  { id: 'P004', name: 'Emma Wilson', age: 28, gender: 'Female', phone: '9876543213', lastVisit: '2025-12-30', status: 'Active' },
  { id: 'P005', name: 'James Taylor', age: 65, gender: 'Male', phone: '9876543214', lastVisit: '2025-12-27', status: 'Discharged' }
];

// List all patients
router.get('/', (req, res) => {
  res.render('pages/patients', {
    title: 'Patient Management',
    currentPage: 'patients',
    patients
  });
});

// Register new patient form
router.get('/register', (req, res) => {
  res.render('pages/patient-register', {
    title: 'Register Patient',
    currentPage: 'patients'
  });
});

// Patient details
router.get('/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  res.render('pages/patient-details', {
    title: 'Patient Details',
    currentPage: 'patients',
    patient: patient || patients[0]
  });
});

module.exports = router;
