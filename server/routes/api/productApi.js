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
        createdAt: Date.now(),
        namn: req.body.name, 
        price:req.body.price,
        visibility: req.body.visibility,
        sku:req.body.sku,
        imageUrl:req.body.imageUrl,
        category:req.body.category,
        productType:req.body.productType,
        attribut:req.body.attribut,
        tags:req.body.tags,
        stockBalance:req.body.stockBalance,
        weight:req.body.weight,
        dimensions:req.body.dimensions,
        shippingClass:req.body.shippingClass,
        description:req.body.description
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
    const client = await mongodb.MongoClient.connect('mongodb+srv://jensa123:olajens123@vueexpress-l2rzl.mongodb.net/admin', { useNewUrlParser: true});
    return client.db('ecommerce').collection('products');
}

module.exports = router;