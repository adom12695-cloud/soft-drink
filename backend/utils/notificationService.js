const Notification = require('../models/Notification');

/**
 * Create a notification for one or more recipients.
 *
 * @param {Object|Object[]} payload  - Single notification or array
 * @param {string|ObjectId} payload.recipient
 * @param {string}          payload.type
 * @param {string}          payload.title
 * @param {string}          payload.message
 * @param {string}          [payload.link]
 * @param {Object}          [payload.meta]
 */
const createNotification = async (payload) => {
  try {
    if (Array.isArray(payload)) {
      return await Notification.insertMany(payload);
    }
    return await Notification.create(payload);
  } catch (err) {
    // Never crash the main flow because of a notification failure
    console.error('Notification create error:', err.message);
  }
};

module.exports = { createNotification };
