const { nanoid } = require('nanoid');

/**
 * Generates a short unique quiz code (8 uppercase alphanumeric chars)
 * e.g. "A3BX92PQ"
 */
const generateCode = () => {
  return nanoid(8).toUpperCase();
};

module.exports = { generateCode };
