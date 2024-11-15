const product = require("../../model/product");
const { getRoleOrInstitute } = require("../../utils/helper");
const { ApiError } = require("../../utils/ApiError");

const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiResponse } = require("../../utils/ApiResponse");

const getProductsByFilter = asyncHandler(async (req, res) => {
  const { categories, page = 1, limit = 8 } = req.query;

  const getFilteredProducts = async (categoryArray, page, limit, req) => {
    const startIndex = (page - 1) * limit;
    const baseUrl = req.protocol + "://" + req.get("host");

    const products = await product
      .find({})
      .populate("t_id", "f_Name l_Name role")
      .populate("categoryid", "category_name")
      .lean();

    const filteredproduct = products.filter((product) => {
      return categoryArray.some((cat) =>
        new RegExp(
          `^${cat.replace(/[-[\]{}()*+?.&,\\^$|#\s]/g, "\\$&")}$`,
          "i"
        ).test(product?.categoryid?.category_name)
      );
    });

    return filteredproduct
      .slice(startIndex, startIndex + limit)
      .map((product) => {
        const reviews = product.reviews || [];
        const totalStars = reviews.reduce(
          (sum, review) => sum + review.star_count,
          0
        );
        const averageRating =
          reviews.length > 0 ? totalStars / reviews.length : null;

        return {
          _id: product._id,
          product_image: product.product_image
            ? `${baseUrl}/${product.product_image.replace(/\\/g, "/")}`
            : "",
          products_category: product.categoryid?.category_name || "",
          products_rating: averageRating
            ? averageRating?.toFixed(1)
            : "No reviews",
          products_name: product.product_name || "",
          products_price: product.product_prize || "",
          products_selling_price: product.product_selling_prize || "",
          identityFlag: getRoleOrInstitute(product.t_id?.role) || "",
          product_flag: product.product_flag || "",
        };
      });
  };

  if (!categories || categories.length === 0) {
    throw new ApiError(400, "Categories parameter is required");
  }

  const categoryArray = categories.split(",");
  const products = await getFilteredProducts(categoryArray, page, limit, req);

  if (!products.length) {
    throw new ApiError(404, "No products found for the selected categories");
  }

  res.status(200).json(
    new ApiResponse(200, "Filter Products", products, {
      currentPage: page,
      totalPages: Math.ceil(products.length / limit),
      totalItems: products.length,
      pageSize: limit,
    })
  );
});

module.exports = {
  getProductsByFilter,
};
