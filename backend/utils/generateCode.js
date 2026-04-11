const crypto = require('crypto');

/**
 * Generates a short unique quiz code (8 uppercase alphanumeric chars)
 * e.g. "A3BX92PQ"
 */
const generateCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

module.exports = { generateCode };
