const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');

const authRoutes = require('./routes/auth');
const movementRoutes = require('./routes/movements');
const employeeRoutes = require('./routes/employees');
const Employee = require('./models/Employee');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/employees', employeeRoutes);

const PORT = process.env.PORT || 5000;

const seedEmployees = async () => {
  const employeeCount = await Employee.count();
  if (employeeCount === 0) {
    const employees = [
      { id: "203107", name: "Manaswini Behera" },
      { id: "106346", name: "Lonalisa Badajena" },
      { id: "202889", name: "Mukul Pattnaik" },
      { id: "204805", name: "Abinash Das" },
      { id: "206993", name: "Ritwik Nandy" },
      { id: "203129", name: "Satyajeet Sahoo" },
      { id: "206999", name: "Laboni Pratihar" },
      { id: "202885", name: "Bikku Kumar" },
      { id: "207000", name: "Diptiranjan Nayak" },
      { id: "205186", name: "Sunita Rout" },
      { id: "203826", name: "Anmol Nayak" },
      { id: "206997", name: "Santosh Kumar Rout" },
      { id: "207070", name: "Suchismita Dash" },
      { id: "107113", name: "Ashabari Dhal" },
      { id: "209677", name: "Mitali Madhusmita Sahoo" },
      { id: "203117", name: "Pratik Ray" },
      { id: "203146", name: "Rajesh Ojha" },
      { id: "107200", name: "Dibya Kishor Bishi" },
      { id: "204000", name: "Bijay Kumar Maharana" },
      { id: "107119", name: "Rajat Ku Mohanty" },
      { id: "204826", name: "Sanjay Kumar Sahoo" },
      { id: "107121", name: "Sashikanta Behera" },
      { id: "107106", name: "Rajesh Kumar Bal" },
      { id: "203114", name: "Susant Kumar Pradhan" },
      { id: "204821", name: "Ranjit Singh Purty" },
      { id: "203109", name: "Sandeep Sahoo" },
      { id: "203620", name: "Sunil Kumar Barik" },
      { id: "205359", name: "Gopabandhu Behera" },
      { id: "204381", name: "Pankaj Kumar Dash" },
      { id: "206599", name: "Rajeeb Lochan Mishra" },
      { id: "207046", name: "Babul Patra" },
      { id: "210846", name: "Satwik Kanungo" },
      { id: "211362", name: "Satyabrata swain" },
      { id: "201901", name: "Pradeep Kumar Sahoo" },
      { id: "205357", name: "Papu Behera" },
      { id: "210764", name: "Tapaswini Ojha" },
      { id: "210762", name: "Ananya Mahapatra" },
      { id: "210918", name: "Pritipuspa Barik" },
      { id: "210763", name: "Md Danish Alam" },
      { id: "210761", name: "Sidhanta Barik" },
      { id: "210759", name: "Santosh Kumar Sahoo" },
      { id: "210760", name: "Rikon kumar parida" },
      { id: "210690", name: "Soumya Ranjan Das" },
      { id: "210919", name: "Jyotiranjan Nayak" },
      { id: "211210", name: "Amlan Nanda" },
      { id: "211604", name: "BijayaKetan Sahoo" }
    ];
    await Employee.bulkCreate(employees);
    console.log('🌱 Database seeded with employees');
  }
};

const startServer = async () => {
  try {
    await connectDB();
    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced');

    // Fix existing employees with NULL isActive (migration for new column)
    await sequelize.query('UPDATE Employees SET isActive = true WHERE isActive IS NULL');
    console.log('✅ Migrated NULL isActive → true');
    
    await seedEmployees();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
  }
};

startServer();
