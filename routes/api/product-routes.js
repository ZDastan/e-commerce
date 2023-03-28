const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findAll();
    include: [
      { 
      model: Category,
      attributes: ["category_name"],
       },
       {
        model: Tag,
        attributes: ["tag_name"],
				through: "ProductTag",
       }
      ]
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findByPk(req.params.id, {
    include: [
      { 
        model: Category,
        attributes:['category_name']
      },
      { 
        model: Tag,
        attributes:['tag_name']
      }
    ]
  });
  res.status(200).json(productData);
   } catch(err) {
      console.log(err);
      res.status(500).json(err);
    }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create({
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    category_id: req.body.category_id,
    tagIds: req.body.tagIds
  })
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data

  Product.update({
    product_name:  req.body.product_name,
    price: req.body.price,
    stock:  req.body.stock,
    category_id: req.body.category_id
  }, {
    where: {
      id: req.params.id,
    },
  })
  .then((updatedProduct) => {
    res.json(updatedProduct);
  })
  .catch((err) => {
    console.log(err);
    res.json(err);
  });

});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
