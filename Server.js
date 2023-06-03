const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const register = require("./Modules/Register");
const login = require("./Modules/Login");
const app = express();
const authenticate = require("./Modules/Authenticate");
const forgotpassword = require("./Modules/Forgotpassword");
const resetpassword = require("./Modules/Resetpassword");
const changepassword = require("./Modules/Changepassword");
const getUser = require("./Modules/Getuser");
const shortener = require("./Modules/Shortener");
const redirection = require("./Modules/Redirection");
const ShortURL = require("./Modules/ShortURL");
const Groupdata = require("./Modules/Groupdata");
const activateaccount = require("./Modules/ActivateAccount");

dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const PORT = process.env.PORT || 5000;

//Create User
app.post("/register", register);
//Activate account
app.post("/activateaccount", activateaccount);
//Login
app.post("/login", login);
//Homepage
app.get("/user", authenticate, getUser);
//Forgotpassword
app.post("/forgotpassword", forgotpassword);
//reset password
app.post("/resetpassword", resetpassword);
//Change password
app.post("/changepassword", changepassword);
//Create UrlShortener
app.post("/short", authenticate, shortener);
//get all urls for a user
app.get("/geturl", authenticate, ShortURL);
//Data for charts
app.get("/chartdata", authenticate, Groupdata);
//Redirect the short url
app.get("/:UrlID", redirection);

app.listen(PORT, () =>
  console.log(`App is running in http://localhost:${PORT}`)
);
