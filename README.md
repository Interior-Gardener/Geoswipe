# Hospital Information System (HIS) - PS03

A comprehensive, unified Hospital Information System built with Node.js and EJS that digitizes end-to-end hospital operations.

## 🏥 Features

### Clinical Management
- **Patient Registration**: Complete patient demographics and medical history
- **OPD Management**: Outpatient department queue and consultation tracking
- **IPD Management**: Inpatient bed allocation and ward management
- **Emergency Department**: Critical case management and triage
- **Operation Theater**: Surgery scheduling and OT management

### Diagnostic Services
- **Laboratory**: Test ordering, processing, and result management
- **Radiology**: Imaging scan scheduling and report management

### Pharmacy & Billing
- **Pharmacy**: Medication dispensing and inventory
- **Billing**: Invoice generation and payment tracking
- **Insurance**: Claims submission and approval tracking

### Administrative
- **EMR (Electronic Medical Records)**: Centralized patient health records
- **HR Management**: Staff scheduling, attendance, and payroll
- **Inventory Management**: Medical supplies and equipment tracking

### Analytics Dashboard
- Real-time bed occupancy tracking
- Revenue and billing analytics
- Department-wise performance metrics
- Patient flow monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. Navigate to the project directory:
```bash
cd Quasar
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```

## 📁 Project Structure

```
Quasar/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── routes/                # Route handlers
│   ├── dashboard.js
│   ├── patients.js
│   ├── opd.js
│   ├── ipd.js
│   ├── emergency.js
│   ├── ot.js
│   ├── lab.js
│   ├── radiology.js
│   ├── pharmacy.js
│   ├── billing.js
│   ├── insurance.js
│   ├── emr.js
│   ├── hr.js
│   └── inventory.js
├── views/                 # EJS templates
│   ├── partials/          # Reusable components
│   │   ├── header.ejs
│   │   ├── nav.ejs
│   │   └── footer.ejs
│   └── pages/             # Page templates
│       ├── dashboard.ejs
│       ├── patients.ejs
│       ├── patient-register.ejs
│       └── ... (other module pages)
└── public/                # Static assets
    └── css/
        └── style.css      # Application styles
```

## 🎯 Key Modules

### 1. Dashboard
- Real-time hospital overview
- Key performance indicators
- Recent activity feed
- Bed occupancy status
- Quick action shortcuts

### 2. Patient Management
- New patient registration
- Patient search and lookup
- Demographics and contact information
- Medical history tracking

### 3. Clinical Workflows
- OPD queue management
- IPD admission and discharge
- Emergency triage
- Surgery scheduling

### 4. Revenue Management
- Bill generation
- Payment collection
- Insurance claim processing
- Revenue analytics

### 5. Resource Management
- Staff scheduling
- Inventory tracking
- Equipment management
- Supply chain optimization

## 🔐 Security & Compliance

- Role-based access control (RBAC) ready
- Audit trail logging
- NABH-aligned documentation
- Data encryption support
- Session management

## 🎨 Technology Stack

- **Backend**: Node.js, Express.js
- **View Engine**: EJS (Embedded JavaScript Templates)
- **Styling**: Custom CSS with responsive design
- **Session Management**: express-session
- **Body Parsing**: body-parser

## 📊 Business Benefits

1. **Operational Efficiency**: Reduce manual work and paperwork
2. **Revenue Optimization**: Minimize revenue leakage through integrated billing
3. **Clinical Quality**: Standardized workflows and documentation
4. **Real-time Visibility**: 360° view of patients, resources, and revenue
5. **Regulatory Compliance**: NABH-aligned processes and audit trails
6. **Scalability**: Configurable masters for departments, tariffs, and services

## 🛠️ Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- Authentication and authorization
- API endpoints for mobile app
- Reporting and analytics module
- Appointment scheduling
- Telemedicine integration
- DICOM image viewer for radiology
- HL7/FHIR standards compliance

## 📝 License

This project is created for PS03 - Hospital Information System demonstration.

## 👥 Support

For support and queries, please refer to the system administrator.

---

**Hospital Information System v1.0.0** | *Unified Digital Healthcare Management Platform*
