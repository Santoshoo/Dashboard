const { Sequelize } = require('sequelize');
require('dotenv').config();
const Movement = require('./models/Movement');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    timezone: '+05:30',
  }
);

const fixTimelines = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const movements = await Movement.findAll();
    let fixedCount = 0;

    for (const movement of movements) {
      if (!movement.visitLocation) continue;

      const locations = movement.visitLocation.split('->').map(s => s.trim());
      const purposes = movement.purpose ? movement.purpose.split('|').map(s => s.trim()) : [];
      
      let parsedTimeline = movement.timeline;
      if (typeof parsedTimeline === 'string') {
        try { parsedTimeline = JSON.parse(parsedTimeline); } catch (e) { parsedTimeline = null; }
      }

      if (!parsedTimeline || !Array.isArray(parsedTimeline) || parsedTimeline.length !== locations.length) {
        console.log(`Fixing timeline for ${movement.employeeName} (id: ${movement.id})`);
        
        const rebuiltTimeline = locations.map((loc, idx) => {
          // Try to recover timestamp from existing parsedTimeline if it exists, otherwise fallback to outTime
          let timestamp = movement.outTime;
          if (parsedTimeline && Array.isArray(parsedTimeline) && parsedTimeline[idx]) {
             timestamp = parsedTimeline[idx].timestamp || movement.outTime;
          }
          return {
            location: loc,
            purpose: purposes[idx] || movement.purpose,
            timestamp: timestamp
          };
        });

        movement.timeline = rebuiltTimeline;
        await movement.save();
        fixedCount++;
      }
    }
    console.log(`✅ Fixed ${fixedCount} broken timelines.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing timelines:', error);
    process.exit(1);
  }
};

fixTimelines();
