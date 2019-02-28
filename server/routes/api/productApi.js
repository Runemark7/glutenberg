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
        id: req.body.id,
        image: req.body.image,
        price: req.body.price,
        description: req.body.desc,
        attribute: req.body.attribute,
        text: req.body.text,
        createdAt: new Date(),
        latestChangeAt: new Date()
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
    const client = await mongodb.MongoClient.connect('mongodb+srv://jensa123:olajens123@vueexpress-l2rzl.mongodb.net/test?retryWrites=true', { useNewUrlParser: true});
    return client.db('ecommerce').collection('products');
}

module.exports = router;