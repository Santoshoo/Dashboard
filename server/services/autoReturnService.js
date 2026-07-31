const Movement = require('../models/Movement');

/**
 * Returns 9:00 PM IST Date object for the given date.
 */
function get9PmIstForDate(dateInput) {
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return null;
  // Get date in YYYY-MM-DD format in Asia/Kolkata timezone
  const istDateString = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  return new Date(`${istDateString}T21:00:00.000+05:30`);
}

/**
 * Sweeps all open movements and auto-returns any movement where current time
 * is past 9:00 PM IST of the movement date or past a previous calendar day.
 */
async function performAutoReturn() {
  try {
    const now = new Date();
    const openMovements = await Movement.findAll({
      where: { returnTime: null }
    });

    if (!openMovements || openMovements.length === 0) {
      console.log('[AutoReturn] No open movements found.');
      return { success: true, count: 0 };
    }

    let autoReturnedCount = 0;

    for (const movement of openMovements) {
      const outDate = movement.outTime || movement.createdAt;
      const target9Pm = get9PmIstForDate(outDate);

      if (!target9Pm) continue;

      // Check if current time is equal to or past 9:00 PM IST of the movement's date
      if (now >= target9Pm) {
        // Determine appropriate return time: 9 PM IST if outTime was before 9 PM IST, otherwise current time
        let calculatedReturnTime = target9Pm;
        if (new Date(outDate) >= target9Pm) {
          calculatedReturnTime = now;
        }

        movement.returnTime = calculatedReturnTime;
        movement.returnedBy = 'AUTO_CRON';

        let currentTimeline = movement.timeline || [];
        if (typeof currentTimeline === 'string') {
          try {
            currentTimeline = JSON.parse(currentTimeline);
          } catch (e) {
            currentTimeline = [];
          }
        }
        if (!Array.isArray(currentTimeline)) {
          currentTimeline = [];
        }

        currentTimeline.push({
          time: calculatedReturnTime,
          status: 'Auto-Returned at 9 PM by System'
        });

        movement.timeline = currentTimeline;
        movement.changed('timeline', true);

        await movement.save();
        autoReturnedCount++;
        console.log(`[AutoReturn] Auto-returned movement ID: ${movement.id} (${movement.employeeName})`);
      }
    }

    console.log(`[AutoReturn] Auto-return check completed. ${autoReturnedCount} record(s) returned.`);
    return { success: true, count: autoReturnedCount };
  } catch (error) {
    console.error('[AutoReturn] Error during auto-return job:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  performAutoReturn,
  get9PmIstForDate
};
