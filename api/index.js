const app = require('../backend/src/index');

module.exports = (req, res) => {
  // Vercel Functions handler
  return app(req, res);
};
