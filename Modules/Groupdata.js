const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const dotenv = require("dotenv").config();
const MONGO_URL = process.env.MONGO_URL;

const Groupdata = async (req, res) => {
  try {
    //Create connection
    let client = await mongoClient.connect(MONGO_URL);
    //Select db
    let db = client.db("Urlshortener");
    //Get all urls for a user { userID: mongodb.ObjectId(req.body.userid) }
    let collection = db.collection("Url");

    let urlsperday = await collection
      .aggregate([
        { $match: { userID: req.body.userid } },
        {
          $group: {
            _id: {
              month: { $month: "$date" },
              day: { $dayOfMonth: "$date" },
              year: { $year: "$date" },
            },

            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    console.log("urlsperday", urlsperday);
    let urlspermonth = await db
      .collection("Url")
      .aggregate([
        { $match: { userID: req.body.userid } },
        {
          $group: {
            _id: {
              month: { $month: "$date" },
              year: { $year: "$date" },
            },

            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    //Close the connection
    console.log("urlspermonth", urlspermonth);
    await client.close();

    res.json({
      urlspermonth,
      urlsperday,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = Groupdata;
