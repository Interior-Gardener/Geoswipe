const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'hospital-his-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const dashboardRoutes = require('./routes/dashboard');
const patientRoutes = require('./routes/patients');
const opdRoutes = require('./routes/opd');
const ipdRoutes = require('./routes/ipd');
const emergencyRoutes = require('./routes/emergency');
const otRoutes = require('./routes/ot');
const labRoutes = require('./routes/lab');
const radiologyRoutes = require('./routes/radiology');
const pharmacyRoutes = require('./routes/pharmacy');
const billingRoutes = require('./routes/billing');
const insuranceRoutes = require('./routes/insurance');
const emrRoutes = require('./routes/emr');
const hrRoutes = require('./routes/hr');
const inventoryRoutes = require('./routes/inventory');

// Use routes
app.use('/', dashboardRoutes);
app.use('/patients', patientRoutes);
app.use('/opd', opdRoutes);
app.use('/ipd', ipdRoutes);
app.use('/emergency', emergencyRoutes);
app.use('/ot', otRoutes);
app.use('/lab', labRoutes);
app.use('/radiology', radiologyRoutes);
app.use('/pharmacy', pharmacyRoutes);
app.use('/billing', billingRoutes);
app.use('/insurance', insuranceRoutes);
app.use('/emr', emrRoutes);
app.use('/hr', hrRoutes);
app.use('/inventory', inventoryRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Hospital Information System running on http://localhost:${PORT}`);
});

module.exports = app;
