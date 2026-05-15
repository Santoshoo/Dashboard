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
      // IT COMMAND CENTER
      { id: "203107", name: "Manaswini Behera", department: "IT COMMAND CENTER" },
      { id: "106346", name: "Lonalisa Badajena", department: "IT COMMAND CENTER" },
      { id: "202889", name: "Mukul Pattnaik", department: "IT COMMAND CENTER" },
      { id: "204805", name: "Abinash Das", department: "IT COMMAND CENTER" },
      { id: "206993", name: "Ritwik Nandy", department: "IT COMMAND CENTER" },
      { id: "203129", name: "Satyajeet Sahoo", department: "IT COMMAND CENTER" },
      { id: "206999", name: "Laboni Pratihar", department: "IT COMMAND CENTER" },
      { id: "202885", name: "Bikku Kumar", department: "IT COMMAND CENTER" },
      { id: "207000", name: "Diptiranjan Nayak", department: "IT COMMAND CENTER" },
      { id: "205186", name: "Sunita Rout", department: "IT COMMAND CENTER" },
      { id: "203826", name: "Anmol Nayak", department: "IT COMMAND CENTER" },
      { id: "206997", name: "Santosh Kumar Rout", department: "IT COMMAND CENTER" },
      { id: "207070", name: "Suchismita Dash", department: "IT COMMAND CENTER" },
      { id: "107113", name: "Ashabari Dhal", department: "IT COMMAND CENTER" },
      { id: "209677", name: "Mitali Madhusmita Sahoo", department: "IT COMMAND CENTER" },
      { id: "203117", name: "Pratik Ray", department: "IT COMMAND CENTER" },
      { id: "210764", name: "Tapaswini Ojha", department: "IT COMMAND CENTER" },
      { id: "210762", name: "Ananya Mahapatra", department: "IT COMMAND CENTER" },
      { id: "210918", name: "Pritipuspa Barik", department: "IT COMMAND CENTER" },
      { id: "210763", name: "Md Danish Alam", department: "IT COMMAND CENTER" },
      { id: "210761", name: "Sidhanta Barik", department: "IT COMMAND CENTER" },
      { id: "210759", name: "Santosh Kumar Sahoo", department: "IT COMMAND CENTER" },
      { id: "210760", name: "Rikon kumar parida", department: "IT COMMAND CENTER" },
      { id: "210690", name: "Soumya Ranjan Das", department: "IT COMMAND CENTER" },
      { id: "210919", name: "Jyotiranjan Nayak", department: "IT COMMAND CENTER" },
      { id: "211210", name: "Amlan Nanda", department: "IT COMMAND CENTER" },
      { id: "211604", name: "BijayaKetan Sahoo", department: "IT COMMAND CENTER" },
      
      // IT DATA CENTER
      { id: "203146", name: "Rajesh Ojha", department: "IT DATA CENTER" },
      { id: "107200", name: "Dibya Kishor Bishi", department: "IT DATA CENTER" },
      { id: "204000", name: "Bijay Kumar Maharana", department: "IT DATA CENTER" },
      { id: "107119", name: "Rajat Ku Mohanty", department: "IT DATA CENTER" },
      { id: "204826", name: "Sanjay Kumar Sahoo", department: "IT DATA CENTER" },
      { id: "107121", name: "Sashikanta Behera", department: "IT DATA CENTER" },
      { id: "107106", name: "Rajesh Kumar Bal", department: "IT DATA CENTER" },
      { id: "203114", name: "Susant Kumar Pradhan", department: "IT DATA CENTER" },
      { id: "204821", name: "Ranjit Singh Purty", department: "IT DATA CENTER" },
      { id: "203109", name: "Sandeep Sahoo", department: "IT DATA CENTER" },
      { id: "203620", name: "Sunil Kumar Barik", department: "IT DATA CENTER" },
      { id: "205359", name: "Gopabandhu Behera", department: "IT DATA CENTER" },
      { id: "204381", name: "Pankaj Kumar Dash", department: "IT DATA CENTER" },
      { id: "206599", name: "Rajeeb Lochan Mishra", department: "IT DATA CENTER" },
      { id: "207046", name: "Babul Patra", department: "IT DATA CENTER" },
      { id: "210846", name: "Satwik Kanungo", department: "IT DATA CENTER" },
      { id: "211362", name: "Satyabrata swain", department: "IT DATA CENTER" },
      { id: "201901", name: "Pradeep Kumar Sahoo", department: "IT DATA CENTER" },
      { id: "205357", name: "Papu Behera", department: "IT DATA CENTER" }
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
