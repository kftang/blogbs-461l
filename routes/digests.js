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

router.get('/send', (req, res, next) => {
  if (!req.header['X-Appengine-Cron']) {
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
    author: blogPost.author,
    content: blogPost.content,
    url: '/blogposts/0',
  }));
  sgMail.send({
    to: emails,
    from: 'blogbs461l',
    templateId: 'd-2e976458c8074eb2bc239966b7407b5b',
    dynamic_template_data: {
      posts,
      date: (new Date()).toLocaleDateString(),
    },
  });
});

router.post('/subscribe', (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(401).send();
    return;
  }
  const newSubscriber = new Subscriber(user.email, user.displayName);
  const key = datastore.key(['subscriber', newSubscriber.email]);
  const entity = {
    key,
    data: newSubscriber,
  };

  try {
    await datastore.save(entity);
    res.status(200).send();
  } catch (error) {
    res.status(409).send();
  }
});

router.post('/unsubscribe', (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(401).send();
    return;
  }
  const key = datastore.key(['subscriber', user.email]);

  try {
    await datastore.delete(key);
    res.status(200).send();
  } catch (error) {
    res.status(409).send();
  }
});

module.exports = router;
