const mongodb = require("mongodb");
const dotenv = require("dotenv");
const shortid = require("shortid");
dotenv.config();
const mongoClient = mongodb.MongoClient;
const MONGO_URL = process.env.MONGO_URL;
const validate = require("./ValidateURL");
const Shortener = async (req, res) => {
  try {
    const originalURL = req.body.originalURL;
    const UrlID = shortid.generate();
    if (validate(originalURL)) {
      //Create connection
      let client = await mongoClient.connect(MONGO_URL);
      //Select db
      let db = client.db("Urlshortener");
      let collection = db.collection("users");
      //Check for the user
      let url = await collection.findOne({ originalUrl: originalURL });
      if (url) {
        res.send(url);
      } else {
        const shortUrl = `${process.env.BACKEND_URL}/${UrlID}`;
        let Url = await db.collection("Url").insertOne({
          originalUrl: originalURL,
          shortUrl: shortUrl,
          UrlID: UrlID,
          userID: new mongodb.ObjectId(req.body.userid),
          date: new Date(),
          totalClicks: 0,
        });
        await client.close();
        res.send(Url);
      }
    } else {
      res.json({
        message: "Invalid Original Url",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

module.exports = Shortener;
