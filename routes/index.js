const { Datastore } = require('@google-cloud/datastore');
const express = require('express');
const router = express.Router();

const datastore = new Datastore();

/* GET home page. */
router.get('/', async (req, res) => {
  const { user } = req;
  const query = datastore.createQuery('blogposts');
  const queryResponse = await datastore.runQuery(query);
  const [allBlogPosts] = queryResponse;
  allBlogPosts.sort((a, b) => b.date - a.date);

  const blogPosts = allBlogPosts.slice(0, 3);
  res.render('index', { blogPosts, user });
});

module.exports = router;
