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
  const pages = Math.floor(numBlogPosts / 10);
  res.render('blogPosts', {
    blogPosts,
    user,
    lastPage: page - 1 < 0 ? 0 : page - 1,
    nextPage: +page + 1 >= pages ? pages : +page + 1,
  });
});

router.post('/', async (req, res) => {
  const { body: { title, content }, user } = req;
  if (!title || !content) {
    res.redirect(400, '/');
    return;
  }

  if (!req.user) {
    res.redirect(401, '/');
    return;
  }
  const newBlogPost = new BlogPost(title, content, user.displayName);

  const key = datastore.key(['blogposts', newBlogPost.id]);
  const entity = {
    key,
    data: newBlogPost,
  };

  try {
    await datastore.save(entity);
    res.redirect('/');
    return;
  } catch (error) {
    res.redirect(409, '/');
    return;
  }
});

module.exports = router;
