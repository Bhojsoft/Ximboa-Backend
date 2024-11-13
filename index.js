require("dotenv").config();
const express = require("express");
const app = express();

const router = require("./app");
const conndb = require("./config/DbConnection");
const cors = require("cors");

const port = process.env.PORT || 4000;

app.use(cors());

app.use("/api", router);

conndb().then(() => {
  app.listen(port, () => {
    console.log("Listenning on Port:", port);
  });
});
