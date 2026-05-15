const { Employee } = require('./models/Employee');
const { connectDB, sequelize } = require('./config/db');

const updateDepartments = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });

    const dataCenter = [
      'Rajesh Ojha', 'Dibya Kishor Bishi', 'Bijay Kumar Maharana', 'Rajat Ku Mohanty', 
      'Sanjay Kumar Sahoo', 'Sashikanta Behera', 'Rajesh Kumar Bal', 'Susant Kumar Pradhan', 
      'Ranjit Singh Purty', 'Sandeep Sahoo', 'Sunil Kumar Barik', 'Gopabandhu Behera', 
      'Pankaj Kumar Dash', 'Rajeeb Lochan Mishra', 'Babul Patra', 'Satwik Kanungo', 
      'Satyabrata swain', 'Pradeep Kumar Sahoo', 'Papu Behera'
    ];

    const commandCenter = [
      'Manaswini Behera', 'Lonalisa Badajena', 'Mukul Pattnaik', 'Abinash Das', 
      'Ritwik Nandy', 'Satyajeet Sahoo', 'Laboni Pratihar', 'Bikku Kumar', 
      'Diptiranjan Nayak', 'Sunita Rout', 'Anmol Nayak', 'Santosh Kumar Rout', 
      'Suchismita Dash', 'Ashabari Dhal', 'Mitali Madhusmita Sahoo', 'Pratik Ray', 
      'Tapaswini Ojha', 'Ananya Mahapatra', 'Pritipuspa Barik', 'Md Danish Alam', 
      'Sidhanta Barik', 'Santosh Kumar Sahoo', 'Rikon kumar parida', 'Soumya Ranjan Das', 
      'Jyotiranjan Nayak', 'Amlan Nanda', 'BijayaKetan Sahoo'
    ];

    for (const name of dataCenter) {
      await sequelize.models.Employee.update(
        { department: 'IT DATA CENTER' },
        { where: { name: name } }
      );
    }

    for (const name of commandCenter) {
      await sequelize.models.Employee.update(
        { department: 'IT COMMAND CENTER' },
        { where: { name: name } }
      );
    }

    console.log('✅ Departments updated for all employees');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating departments:', err);
    process.exit(1);
  }
};

updateDepartments();
