const productModel = require("../models/ProductModel.js");
const ObjectsToCsv = require("objects-to-csv");
var fileSystem = require("fs");
var fastcsv = require("fast-csv");

exports.getAllProducts = (req, res) => {
  //if /products + query string
  //if we wonna get some movies
  if (req.query.isBestSeller) {
    //   productModel.find({ isBestSeller: true })//just wanna get the documents where this condition
    productModel
      .find()
      .where("isBestSeller")
      .equals(req.query.isBestSeller === "yes" ? true : false)
      .then((products) => {
        res.json({
          message: "Get bestseller products",
          data: products,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: `Error------> ${err}`,
        });
      });
  } else if (req.query.isFeatured) {
    //   productModel.find({ isBestSeller: true })//just wanna get the documents where this condition
    productModel
      .find()
      .where("isFeatured")
      .equals(req.query.isFeatured === "yes" ? true : false)
      .then((products) => {
        res.json({
          message: "Get featured products",
          data: products,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: `Error------> ${err}`,
        });
      });
  } else if (req.query.category) {
    productModel
      .find()
      .where("category")
      .equals(req.query.category)
      .then((products) => {
        res.json({
          message: `A list of products with the category ${req.query.category}`,
          data: products,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: `Error------>  ${err}`,
        });
      });
  }
  //http://localhost:3000/products
  //when we wanna get all movies
  else if (req.query.order || req.query.sortBy || req.query.limit) {
    let order = req.query.order ? req.query.order : "desc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    productModel
      .find() //in mongoose find means all documents
      .sort([[sortBy, order]])
      // .limit(limit)
      .then((products) => {
        res.json({
          message: "Get all products sorted",
          data: products,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: `Error------>   ${err}`,
        });
      });
  } else {
    productModel
      .find()
      // .limit(limit)
      .then((products) => {
        res.json({
          message: "Get all products",
          count: products.length,
          data: products,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: `Error------>   ${err}`,
        });
      });
  }
};

exports.getAProduct = (req, res) => {
  productModel
    .findById(req.params.id)
    .then((product) => {
      if (product) {
        res.json({
          message: `Product with the id ${req.params.id}`,
          data: product,
        });
      } else {
        res.status(404).json({
          message: `There is no product with the id ${req.params.id}`,
        });
      }
    })

    .catch((err) => {
      res.status(500).json({
        message: `Error------>  ${err}`,
      });
    });
};

exports.createAProduct = (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price || !category) {
    res.status(400).json({
      message: `bad request`,
    });
  }

  const newProduct = new productModel(req.body); //the data that client pass

  newProduct
    .save()
    .then((product) => {
      //if the document saved successfully,well return the json format of the inserted document

      res.json({
        message: "create a product",
        data: product,
      });
    })
    //if it fails we return json too
    //cuz its a server err we return status code of 500
    .catch((err) => {
      res.status(500).json({
        message: `Error ${err}`,
      });
    });
};

exports.updateAProduct = (req, res) => {
  productModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((product) => {
      if (product) {
        res.json({
          message: `updated`,
          data: product,
        });
      } else {
        res.status(400).json({
          message: `thres no product which such id`,
        });
      }
    })
    .catch((err) => {
      res.json({
        message: `Error ${err}`,
      });
    });
};

exports.deleteAProduct = (req, res) => {
  productModel
    .findByIdAndRemove(req.params.id)
    //no second param so doesnt reurn anything so no arg for then()
    .then((product) => {
      if (product) {
        res.json({
          message: `The product with the id ${req.params.id} was deleted`,
        });
      } else {
        res.status(400).json({
          message: `no product with the id ${req.params.id} found`,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err,
      });
    });
};

exports.getAllCategories = (req, res) => {
  productModel
    .find()
    .then((products) => {
      if (!products) {
        res.status(404).json({
          message: `No product categories`,
        });
      } else {
        let allCategories = [];
        for (i = 0; i < products.length; i++) {
          allCategories.push(products[i].category);
        }
        let uniqueCategories = [...new Set(allCategories)];
        res.json({
          message: `All product categories`,
          count: uniqueCategories.length,
          data: uniqueCategories,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: err,
      });
    });
};

exports.getRelatedProducts = (req, res) => {
  productModel
    .findById(req.params.id)
    .then((product) => {
      if (!product) {
        res.status(401).json({
          error: `there is no such product`,
        });
      }
      let limit = req.query.limit ? parseInt(req.query.limit) : 4;

      productModel
        .find({ _id: { $ne: product._id } })
        .where("category")
        .equals(product.category)
        .limit(limit)
        .then((products) => {
          res.json({
            message: `fetched products`,
            count: products.length,
            data: products,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.getProductsByCat = (req, res) => {
  const cat = req.params.cat;
  console.log(cat);

  productModel
    .find()
    .where("category")
    .equals(cat)
    .then((products) => {
      if (products.length > 0) {
        res.json({
          message: `products with ${cat} category`,
          count: products.length,
          data: products,
        });
      } else {
        res.status(401).json({
          error: `there is no such category`,
        });
      }
    })
    .catch((err) =>
      res.status(500).json({
        error: err,
      })
    );
};

exports.getProductsBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  productModel
    .find(findArgs)

    .sort([[sortBy, order]])
    // .skip(skip) //??
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
};

// exports.getCsvFile = async (req, res) => {
//   const data = await productModel.find().lean();
//   var ws = fileSystem.createWriteStream("6.csv", { mode: 0o755 });
//   fastcsv
//     .write(data, { headers: true })
//     .on("finish", function () {
//       res.send(
//         "<a href='./6.csv' download='6.csv' id='download-link'></a><script>document.getElementById('download-link').click();</script>"
//       );
//     })
//     .pipe(ws);
// };

exports.getCsvFile = async (req, res) => {
  const data = await productModel.find().lean();
  const ws = fileSystem.createWriteStream("./7.csv", { mode: 0o755 });
  console.log(typeof ws);
  fastcsv
    .write(data, { headers: true })
    .on("finish", function () {
      res.send(
        "<a href='./7.csv' download='7.csv' id='download-link'></a><script>document.getElementById('download-link').click();</script>"
      );
    })
    .pipe(ws);
};

// const data = await productModel.find().lean();
// var ws = fileSystem.createWriteStream("2.csv");
// fastcsv
//   .write(data, { headers: true })
//   .on("finish", function () {
//     res.send(
//       "<a href='C:/Documents/2.csv' download='2.csv' id='download-link'></a><script>document.getElementById('download-link').click();</script>"
//     );
//   })
//   .pipe(ws);
/////////////////////////////////////
//////////////////////////////////
// const data = await productModel.find().lean();
// var ws = fileSystem.createWriteStream("2.csv");
// const csv = new ObjectsToCsv(data);
// // Save to file:
// await csv.toDisk("/test.csv");
// Return the CSV file as string:
