const mongodb = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const mongoClient = mongodb.MongoClient;
const MONGO_URL = process.env.MONGO_URL;

const ShortURL = async (req, res) => {
  try {
    //Create connection
    let client = await mongoClient.connect(MONGO_URL);
    //Select db
    let db = client.db("Urlshortener");
    //Get all urls for a user
    let urls = await db
      .collection("Url")
      .find({ userID: mongodb.ObjectId(req.body.userid) })
      .toArray();
    //Close the commection
    await client.close();
    // console.log(urls)
    res.send(urls);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = ShortURL;
