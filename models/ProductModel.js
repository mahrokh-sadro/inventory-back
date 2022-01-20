const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },
  description: String,

  category: {
    type: String,
    required: true,
  },

  quantity: Number,
  isBestSeller: Boolean,
  isFeatured: Boolean,
  photoURL: Array,
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  sold: {
    type: Number,
    default: 0,
  },
  shipping: {
    required: false,
    type: Boolean,
  },
});

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
