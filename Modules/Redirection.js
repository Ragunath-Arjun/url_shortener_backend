const mongodb = require("mongodb");
const dotenv = require("dotenv");
const shortid = require("shortid");
dotenv.config();
const mongoClient = mongodb.MongoClient;
const MONGO_URL = process.env.MONGO_URL;

const redirection = async (req, res) => {
  try {
    //Create connection
    let client = await mongoClient.connect(MONGO_URL);
    //Select db
    let db = client.db("Urlshortener");
    //Check for the user
    let url = await db.collection("Url").findOne({ UrlID: req.params.UrlID });
    // console.log(url, req.params.UrlID);
    if (url) {
      let clicks = url.totalClicks + 1;
      await db
        .collection("Url")
        .findOneAndUpdate(
          { UrlID: req.params.UrlID },
          { $set: { totalClicks: clicks } }
        );
      await client.close();
      return res.redirect(url.originalUrl);
    } else {
      res.status(404).json({
        message: "not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

module.exports = redirection;
