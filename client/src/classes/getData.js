const getProducts = {
    data:{
        products:[]
    },
    methods:{
       async getProducts()
       {
        const url = "http://localhost:5000/api/products";
        const products = await (getProducts.methods.getData(url));
        getProducts.data.products.splice(0);
        products.forEach(product => {
            getProducts.data.products.push(product);
        });
       },
       async getData(url)
       {
        let data = await fetch(url);
        data = await data.json();
        return data;
       }
    }
}



export default getProducts;