const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

//Get posts
router.get('/', async (req,res)=>{
    const posts = await loadPostsCollection();
    res.send(await posts.find({}).toArray());
});

//Add post
router.post('/', async (req, res) => {
    const posts = await loadPostsCollection();
    await posts.insertOne({
        data: req.body.content,
    });
    res.status(201).send();
  });
  
//Delete post
router.delete('/:id', async (req,res) =>{
    const posts = await loadPostsCollection();
    await posts.deleteOne({_id: new mongodb.ObjectID(req.params.id)});
    res.status(200);
});
 
async function loadPostsCollection(){
    const client = await mongodb.MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true});
    return client.db('gutenberg').collection('data');
}

module.exports = router;