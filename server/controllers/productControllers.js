import Products from "../models/productModel.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Products.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(`Error while fetching products: ${error.message}`);
    res.status(500).json([]);
  }
};

// Get single product by id
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findById(id);
    if (!product) return res.status(404).json({});
    res.status(200).json(product);
  } catch (error) {
    console.error(`Error while fetching product: ${error.message}`);
    res.status(500).json({});
  }
};

// Add a product
export const addProduct = async (req, res) => {
  try {
    const { img, brand, title, rating, reviews, sellPrice, orders, mrp, discount, category } = req.body;
    const newProduct = await Products.create({ img, brand, title, rating, reviews, sellPrice, orders, mrp, discount, category });
    return res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error(`Error while adding product: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Get products by Category
export const getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Products.find({ category: category.toLowerCase() });
    res.status(200).json(products || []); // always return array
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json([]); // return empty array
  }
};

// Get top rated products
export const getTopRated = async (req, res) => {
  try {
    const topRated = await Products.find().sort({ rating: -1 }).limit(12);
    res.status(200).json(topRated || []);
  } catch (error) {
    console.error('Error fetching top-rated products:', error.message);
    res.status(500).json([]);
  }
};

// Get best sellers
export const getBestSellers = async (req, res) => {
  try {
    const bestSellers = await Products.find().sort({ reviews: -1 }).limit(12);
    res.status(200).json(bestSellers || []);
  } catch (error) {
    console.error('Error fetching best sellers:', error.message);
    res.status(500).json([]);
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    let query = req.query.q ? req.query.q.trim() : '';
    if (!query) return res.status(200).json([]);

    query = query.replace(/sneakers/gi, 'sneaker')
                 .replace(/kids|boys|girls/gi, "child")
                 .replace(/mens/gi, "men")
                 .replace(/womens/gi, "women")
                 .replace(/\b(shoe|shoes)\b/gi, ' ')
                 .replace(/'/g, '')
                 .trim();

    const terms = query.split(/\s+/);
    const searchQuery = {
      $or: terms.map(term => ({
        $or: [
          { title: { $regex: term, $options: "i" } },
          { brand: { $regex: term, $options: "i" } },
          { category: { $in: [term] } }
        ]
      }))
    };

    const results = await Products.find(searchQuery);
    res.status(200).json(results || []);
  } catch (error) {
    console.error('Error performing search:', error.message);
    res.status(500).json([]);
  }
};

// Filter products
export const filterProducts = async (req, res) => {
  try {
    const { brand, rating, category, price, discount } = req.query;
    const filter = {};

    if (brand) filter.brand = new RegExp(brand, 'i');
    if (rating) filter.rating = { $gte: parseFloat(rating) || 0 };
    if (category) {
      if (category.toLowerCase() === "unisex") filter.category = "adult";
      else if (category.toLowerCase() === "kids") filter.category = "child";
      else filter.category = category.toLowerCase();
    }
    if (price) {
      const match = price.match(/(\d+)-(\d+)/);
      if (match) filter.sellPrice = { $gte: parseFloat(match[1]), $lte: parseFloat(match[2]) };
      else if (price.includes("+")) filter.sellPrice = { $gte: parseFloat(price) };
    }
    if (discount) {
      const match = discount.match(/(\d+)%/);
      if (match) filter.discount = { $gte: parseInt(match[1], 10) };
    }

    const result = await Products.find(filter);
    res.status(200).json(result || []); // always return array
  } catch (error) {
    console.error('Error filtering products:', error.message);
    res.status(500).json([]);
  }
};

// Get list of products by IDs
export const listOfProducts = async (req, res) => {
  try {
    const { list } = req.params;
    const idArray = list.split(',').map(id => id.trim());
    const result = await Products.find({ _id: { $in: idArray } });
    res.status(200).json(result || []); // always return array
  } catch (error) {
    console.error('Error fetching products by list:', error.message);
    res.status(500).json([]);
  }
};