const Product = require("../../../model/product");
const { ApiError } = require("../../../utils/ApiError");
const mongoose = require("mongoose");

// Get products filtered by multiple categories
const getProductsByFilter = async (req, res) => {
  try {
    const { categories } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Ensure that categories are provided in the query parameters
    if (!categories || categories.length === 0) {
      return res.status(400).json({
        message: "Categories parameter is required",
      });
    }

    // Split the categories string (comma-separated) into an array
    const categoryArray = categories.split(",");

    // Find products by filtering with the category IDs
    const products = await Product.find({ category_id: { $in: categoryArray } })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate("category_id", "category_name") // Populate category information
      .populate("supplier_id", "name contact_info"); // Populate supplier information (if applicable)

    // If no products are found for the specified categories
    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found for the selected categories",
      });
    }

    // Prepare the base URL for image URLs
    const baseUrl = req.protocol + "://" + req.get("host");

    // Map over the products to include full image URLs and other necessary fields
    const productsWithFullImageUrl = products.map((product) => ({
      _id: product?._id,
      product_name: product?.product_name || "",
      category_name: product?.category_id?.category_name || "",
      supplier_name: product?.supplier_id?.name || "",
      product_image: product?.product_image
        ? `${baseUrl}/${product?.product_image?.replace(/\\/g, "/")}`
        : "",
      price: product?.price || 0,
      offer_price: product?.offer_price || 0,
      stock: product?.stock || 0,
      description: product?.description || "",
    }));

    // Send response with pagination details
    res.status(200).json({
      totalResults: products.length,
      page,
      limit,
      products: productsWithFullImageUrl,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json(new ApiError(400, "Validation Error", error.errors));
    } else {
      res.status(500).json(new ApiError(500, "Server Error", error));
    }
  }
};

module.exports = {
  getProductsByFilter,
};
