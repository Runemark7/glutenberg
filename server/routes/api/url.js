const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

//Get posts
router.get('/:id', async (req,res) =>{
    const posts = await loadPostsCollection();
    res.send(await posts.find({title: req.params.id}).toArray());
});

async function loadPostsCollection(){
    const client = await mongodb.MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true});
    return client.db('gutenberg').collection('urlTwo');
}

module.exports = router;