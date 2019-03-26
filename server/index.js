const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

//Middleware
app.use(cors());
app.use(bodyParser.json());

const products = require('./routes/api/productApi');
const media = require('./routes/api/media');
const search = require('./routes/api/url');

app.use('/api/products', products);
app.use('/wp/v2/media', media);
app.use('/wp/v2/search', search);



const port = 5000;

app.listen(port,  ()=>console.log(`Server started on port ${port}`)); 