const mongodb = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const mongoClient = mongodb.MongoClient;
const MONGO_URL = process.env.MONGO_URL;

const activateaccount = async (req, res) => {
  try {
    //Queryvalue
    const requesttoken = req.body.tk;
    //Initiate connection
    let client = await mongoClient.connect(MONGO_URL);
    //Select db
    let db = client.db("Urlshortener");
    //Check for the user
    let user = await db
      .collection("users")
      .findOne({ activateAccountToken: requesttoken });
    //if user exists!
    if (user) {
      //Update Password
      let activate = await db
        .collection("users")
        .findOneAndUpdate(
          { _id: mongodb.ObjectId(user._id) },
          { $set: { active: true } }
        );
      //Delete random String
      await db
        .collection("users")
        .findOneAndUpdate(
          { _id: mongodb.ObjectId(user._id) },
          { $unset: { activateAccountToken: 1, activateAccountExpires: 1 } }
        );
      res.json({
        token: "valid",
        username: user.firstName,
      });
      //Close the connection
      await client.close();
    } else {
      res.json({
        message: "Invalid token",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

module.exports = activateaccount;
