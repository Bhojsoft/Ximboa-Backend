const product = require("../../model/product");
const { ApiError } = require("../../utils/ApiError");

const getFilteredProducts = async (categoryArray, page, limit, req) => {
  const startIndex = (page - 1) * limit;
  const baseUrl = req.protocol + "://" + req.get("host");

  const products = await product
    .find({ categoryid: { $in: categoryArray } })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("categoryid", "category_name")
    // .populate("supplier_id", "name contact_info");

  return products.map((product) => ({
    _id: product._id,
    product_name: product.product_name || "",
    category_name: product.category_id?.category_name || "",
    supplier_name: product.supplier_id?.name || "",
    product_image: product.product_image
      ? `${baseUrl}/${product.product_image.replace(/\\/g, "/")}`
      : "",
    price: product.price || 0,
    offer_price: product.offer_price || 0,
    stock: product.stock || 0,
    description: product.description || "",
  }));
};

const { asyncHandler } = require("../../utils/asyncHandler");

const getProductsByFilter = asyncHandler(async (req, res) => {
  const { categories, page = 1, limit = 10 } = req.query;

  if (!categories || categories.length === 0) {
    throw new ApiError(400, "Categories parameter is required");
  }

  const categoryArray = categories.split(",");
  const products = await getFilteredProducts(categoryArray, page, limit, req);

  if (!products.length) {
    throw new ApiError(404, "No products found for the selected categories");
  }

  res.status(200).json({
    totalResults: products.length,
    page: parseInt(page),
    limit: parseInt(limit),
    products,
  });
});

module.exports = {
  getProductsByFilter,
};
