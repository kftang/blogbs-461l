const { Datastore } = require('@google-cloud/datastore');
const express = require('express');
const uuid = require('uuid/v4');

const router = express.Router();
const datastore = new Datastore();

class Subscriber {
  constructor(email, name) {
    this.email = email;
    this.name = name;
  }
}

router.get('/send', async (req, res, next) => {
  if (!req.headers['x-appengine-cron']) {
    console.log(req.headers);
    next();
    return;
  }
  const { sgMail } = req;

  const subscribersQuery = datastore.createQuery('subscribers');
  const [subscribers] = await datastore.runQuery(subscribersQuery);
  const emails = subscribers.map(subscriber => subscriber.email);

  const current = new Date();
  const today = new Date(current.getFullYear(), current.getMonth(), current.getDate());

  const blogPostsQuery = datastore.createQuery('blogposts');
  const [allBlogPosts] = await datastore.runQuery(blogPostsQuery);
  const blogPosts = allBlogPosts.filter(blogPost => blogPost.date > today).slice(0, 3);

  const posts = blogPosts.map(blogPost => ({
    title: blogPost.title,
    author: blogPost.user,
    content: blogPost.content,
    date: (new Date(blogPost.date)).toLocaleString(),
    url: 'blogbs-461l.appspot.com/blogposts/0',
  }));
  if (!posts.length) {
    res.status(200).send();
    return;
  }
  try {
    const response = await sgMail.send({
      to: emails,
      from: 'blogbs461l@gmail.com',
      templateId: 'd-2e976458c8074eb2bc239966b7407b5b',
      dynamic_template_data: {
        posts,
        date: (new Date()).toLocaleDateString(),
      },
    });
    res.status(200).send();
  } catch (error) {
    console.error(error);
    console.error(error.response.body);
    res.status(500).send();
  }
});

router.post('/subscribe', async (req, res) => {
  const { user } = req;
  if (!user) {
    res.redirect(401, '/');
    return;
  }
  const newSubscriber = new Subscriber(user.email, user.displayName);
  const key = datastore.key(['subscribers', newSubscriber.email]);
  const entity = {
    key,
    data: newSubscriber,
  };

  try {
    await datastore.save(entity);
    res.redirect('/');
  } catch (error) {
    res.redirect(409, '/');
  }
});

module.exports = router;
