const { Datastore } = require('@google-cloud/datastore');
const express = require('express');
const uuid = require('uuid/v4');

const router = express.Router();
const datastore = new Datastore();


class BlogPost {
  constructor(title, content, user) {
    this.id = uuid();
    this.title = title;
    this.content = content;
    this.user = user;
    this.date = Date.now().valueOf()
  }
}

router.get('/:page', async (req, res) => {
  const { params: { page = 0 }, user } = req;

  // Get the number of blog posts
  const countPostsQuery = datastore.createQuery('blogposts').select('__key__');
  const countPostsResponse = await datastore.runQuery(countPostsQuery);
  const numBlogPosts = countPostsResponse[0].length;

  // Get blog posts for given page
  const query = datastore.createQuery('blogposts');
  const queryResponse = await datastore.runQuery(query);
  const [allBlogPosts] = queryResponse;
  allBlogPosts.sort((a, b) => b.date - a.date);

  const blogPosts = allBlogPosts.slice(page * 10, page * 10 + 10);
  res.render('blogPosts', { blogPosts, user, pages: numBlogPosts / 10 + 1 });
});

router.post('/debug', async (req, res) => {
  const { body: { title, content, user } } = req;
  if (!title || !content) {
    res.status(400).send();
    return;
  }

  const newBlogPost = new BlogPost(title, content, user);

  const key = datastore.key(['blogposts', newBlogPost.id]);
  const entity = {
    key,
    data: newBlogPost,
  };

  try {
    await datastore.save(entity);
    res.status(200).send();
  } catch (error) {
    res.status(409).send();
  }
});

router.post('/', async (req, res) => {
  const { body: { title, content }, user } = req;
  if (!title || !content) {
    res.status(400).send();
    return;
  }

  if (!req.user) {
    res.status(401).send();
  }
  const newBlogPost = new BlogPost(title, content, user.displayName);

  const key = datastore.key(['blogposts', newBlogPost.id]);
  const entity = {
    key,
    data: newBlogPost,
  };

  try {
    await datastore.save(entity);
    res.status(200).send();
  } catch (error) {
    res.status(409).send();
  }
});

module.exports = router;
