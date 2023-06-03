const mongodb = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
dotenv.config();
const mongoClient = mongodb.MongoClient;
const MONGO_URL = process.env.MONGO_URL;

const register = async (req, res) => {
  try {
    //Initiate connection
    let client = await mongoClient.connect(MONGO_URL);
    //Select db
    let db = client.db("Urlshortener");
    //Check if user already exists
    let user = await db
      .collection("users")
      .find({ email: req.body.email })
      .toArray();
    // console.log(user);
    if (user.length <= 0) {
      //Select the collection and perform operation
      const salt = bcrypt.genSaltSync(10);
      const hashedpassword = bcrypt.hashSync(req.body.password, salt);
      //generate random string
      let randomString = randomstring.generate();
      //store random string
      let data = await db.collection("users").insertOne({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedpassword,
        active: false,
        activateAccountToken: randomString,
      });
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
        subject: "Email verification - URLShortner",
        html: `<h4>Hi ${req.body.firstName},</h4><p>We noticed that you recently created a URLShortener account. Click the below link to activate account.</p><a href="${process.env.FRONTEND_URL}/activate-account?tk=${randomString}">Activate</a>`,
      };
      //Send mail
      transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log("email sent successfully");
        }
      });
      //Close the connection
      await client.close();
      res.json({
        message: "User registered",
        userexists: false,
      });
    } else if (user && user.active === false) {
      //Select the collection and perform operation
      const salt = bcrypt.genSaltSync(10);
      const hashedpassword = bcrypt.hashSync(req.body.password, salt);
      //generate random string
      let randomString = randomstring.generate();
      //store random string
      let data = await db.collection("users").findOneAndUpdate(
        {
          email: user.email,
        },
        {
          $set: {
            activateAccountToken: randomString,
          },
        }
      );
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
        to: `${user.email}`,
        subject: "Email verification - URLShortner",
        html: `<h4>Hi ${user.firstName},</h4><p>We noticed that you recently created a URLShortener account. Click the below link to activate account.</p><a href="${process.env.FRONTEND_URL}/activate-account?tk=${randomString}">Activate</a>`,
      };
      //Send mail
      transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log("email sent successfully");
        }
      });
      //Close the connection
      await client.close();
      res.json({
        message: "User registered",
        userexists: false,
      });
    } else {
      res.json({
        message: "User already exists!",
        userexists: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

module.exports = register;
