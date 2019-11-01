const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  res.clearCookie('idToken');
  res.clearCookie('serverIdToken');
  res.redirect('/');
});

module.exports = router;
