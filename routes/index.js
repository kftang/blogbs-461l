const { Datastore } = require('@google-cloud/datastore');
const express = require('express');
const router = express.Router();

const datastore = new Datastore();

/* GET home page. */
router.get('/', async (req, res) => {
  const { user } = req;
  const query = datastore.createQuery('blogposts').order('date').limit(3);
  const queryResponse = await datastore.runQuery(query);
  const [blogPosts] = queryResponse;
  res.render('index', { blogPosts, user });
});

module.exports = router;
