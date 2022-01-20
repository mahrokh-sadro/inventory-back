const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const ObjectsToCsv = require("objects-to-csv");
// var http = require("http").createServer(app);
var fileSystem = require("fs");
var fastcsv = require("fast-csv");
// const bodyParser = require("body-parser");

const productsController = require("./controllers/ProductsController.js");

if (process.env.NODE_ENV != "production") {
  require("dotenv").config({ path: "config/keys.env" });
}
const app = express();

const corsOptionsDelegate = function (req, callback) {
  const allowlist = [
    `http://localhost:3000`,
    "http://127.0.0.1:3000",
    "https://shopify-inventory-front.netlify.app",
    "http://shopify-inventory-front.netlify.app",
    "https://shopify-inventory-front.netlify.app/",
    "http://shopify-inventory-front.netlify.app/",
  ];
  let corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

//middleware
app.use(cors(corsOptionsDelegate));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "main page",
  });
});

app.get("/download", async (req, res) => {
  const data = [
    { code: "CA", name: "California" },
    { code: "TX", name: "Texas" },
    { code: "NY", name: "New York" },
  ];

  const csv = new ObjectsToCsv(data);

  // Save to file:
  await csv.toDisk("./test.csv");

  // Return the CSV file as string:
  console.log(await csv.toString());
});

app.use("/products", productsController);

app.use("*", (req, res) => {
  res.status(404).json({
    message: "page not found",
  });
});

const HTTP_PORT = process.env.PORT || 5000;

app.listen(HTTP_PORT, () => {
  console.log(`app listening on `);

  mongoose
    .connect(process.env.MONGO_DB_CONNECTION_STRING)
    .then(() => {
      console.log("connected to db " + HTTP_PORT);
    })
    .catch((err) => {
      console.log(err);
    });
});

//handle a route that doesnt exist
