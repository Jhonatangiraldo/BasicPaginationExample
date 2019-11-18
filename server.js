/**
 * Note: For this pagination the BE calculates
 * the 'skip' number based on the page and limit
 * Another option may be having two properties:
 * limit and skip. So it skips a number and returns
 * a number of results that is the imit
 * The skip and limit is way more used
 */

const express = require('express');
const mongoose = require('mongoose');
const User = require('./users');

mongoose.connect('mongodb://pagination-sample:paginationSample1@ds061621.mlab.com:61621/pagination-sample');

const db = mongoose.connection;

db.once('open', async () => {
  if (await User.countDocuments().exec() > 0) return

  Promise.all([
    User.create({ name: 'User 1' }),
    User.create({ name: 'User 2' }),
    User.create({ name: 'User 3' }),
    User.create({ name: 'User 4' }),
    User.create({ name: 'User 5' }),
    User.create({ name: 'User 6' }),
    User.create({ name: 'User 7' }),
    User.create({ name: 'User 8' }),
    User.create({ name: 'User 9' }),
    User.create({ name: 'User 10' }),
    User.create({ name: 'User 11' }),
    User.create({ name: 'User 12' })
  ]).then(() => console.log('Added Users'))
})

const app = express();

app.get('/users', paginatedResults(User), (req, res) => {
  res.json(res.paginatedResults);
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    const result = {};

    if (skip > 0) {
      result.previous = {
        page: page - 1,
        limit,
      };
    }

    if (endIndex < await model.countDocuments().exec()) {
      result.next = {
        page: page + 1,
        limit,
      };
    }

    try {
      result.results = await model.find().sort('name').limit(limit).skip(skip).exec();
      res.paginatedResults = result;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
}

app.listen(3000);
