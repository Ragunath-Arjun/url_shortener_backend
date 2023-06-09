const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const dotenv = require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const MONGO_URL = process.env.MONGO_URL;
const nodemailer = require("nodemailer");

const forgotpassword = async (req, res) => {
  try {
    //Initiate connection
    let client = await mongoClient.connect(MONGO_URL);
    //Select db
    let db = client.db("Urlshortener");
    //Check user exists
    let collection = db.collection("users");

    //if user exists!
    const user = await collection.findOne({ email: req.body.email });

    if (user) {
      //generate random string
      let randomString = randomstring.generate();
      console.log(randomString);
      //send a mail using nodemailer
      //Create Transporter
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          // type: 'OAUTH2',
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
          // clientId: process.env.OAUTH_CLIENTID,
          // clientSecret: process.env.OAUTH_CLIENT_SECRET,
          // refreshToken: process.env.OAUTH_REFRESH_TOKEN
        },
      });
      //Mail options
      let mailOptions = {
        from: "no-reply@noreply.com",
        to: `${req.body.email}`,
        subject: "Reset Password - URLShortener",
        html: `<h4>Hi,</h4><p>We've received a request to reset the password. You can reset the password by clicking the link below.</p><a href="${process.env.FRONTEND_URL}/reset-password?tk=${randomString}">Reset Password</a>`,
      };
      //Send mail
      let info = await transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log("email sent successfully");
        }
      });
      //Expiring date
      const expiresin = new Date();
      expiresin.setHours(expiresin.getHours() + 1);
      //store random string
      await db.collection("users").findOneAndUpdate(
        { email: req.body.email },
        {
          $set: {
            resetPasswordToken: randomString,
            resetPasswordExpires: expiresin,
          },
        }
      );
      //Close the connection
      await client.close();
      res.json({
        exists: true,
      });
    } else {
      res.json({
        message: "User doesnot exist",
        exists: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

module.exports = forgotpassword;
