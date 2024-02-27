const express = require("express");
const { sha256, sha224 } = require("js-sha256");
const authRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

async function get_user(username, password) {
  const db_connect = dbo.getDb();
  const userRecord = await db_connect
    .collection("users")
    .findOne({ userName: username });

  if (!userRecord) {
    return null;
  }

  // password correct
  if (sha256(password + userRecord.salt) === userRecord.passwordHash) {
    return userRecord;
  }

  return null;
}

async function get_user_by_id(id) {
  const db_connect = dbo.getDb();

  const userRecord = await db_connect
    .collection("users")
    .findOne({ _id: ObjectId(id) });

  if (userRecord) {
    return userRecord;
  }
  return null;
}

authRoutes.route("/a").get(async function (req, response) {
  response.json({ dog: sha256("password_1123tq32435") });
});

authRoutes.route("/b").get(async function (req, response) {
  response.json({ dog: req.session });
});

authRoutes.route("/auth").post(async function (req, response) {
  const password = req.body.password;
  const userName = req.body.userName;

  const userRecord = await get_user(userName, password);

  if (userRecord) {
    console.log("user found by username and password");
    console.log(userRecord);

    // comment some of thes out when working
    req.session.userId = userRecord._id;
    req.session.userName = userRecord.userName;
    req.session.password = userRecord.password;

    console.log("req.session.userid: ", req.session.userId);
    response.json({ msg: "correct" });
  } else {
    response.status(403).send("not valid");
  }
});

authRoutes.route("/register").post(async function (req, response) {
  const password = req.body.password;
  const userName = req.body.userName;
  const salt = Math.floor(Math.random() * 999999);

  myobj = {
    passwordHash: sha256(password + salt),
    userName: userName,
    salt: salt,
  };

  let db_connect = dbo.getDb();
  const result = await db_connect.collection("users").insertOne(myobj);

  response.json(result);
  console.log("added record: ", myobj);
});

authRoutes.route("/prev").get(async function (req, res) {
  console.log("req.session.userid: ", req.session.userId);

  // if (req.session.userId) {
  if (1) {
    // const userRecord = await get_user_by_id(req.session.userId);
    console.log(req.session);
    const userRecord = await get_user(
      req.session.userName,
      req.session.password
    );

    if (userRecord) {
      console.log("user found by id");
      res.json({ message: "logged in" });
    } else {
      // User not found
      res.status(404).send("user not found");
    }
  } else {
    // No valid session
    res.status(401).send("not logged in");
  }
});

authRoutes.route("/logout").get(async function (req, res) {
  try {
    req.session.destroy();
    res.json(null);
  } catch {
    res.status(500).send("idk man");
  }
});

authRoutes.route("/setSession").get(async function (req, res) {
  console.log(req.session);
  if (!req.session.username) {
    req.session.username = "brad";
    console.log("Session set");
    console.log(req.session);
  } else {
    console.log("Session already existed");
  }
  res.json("{}");
});

authRoutes.route("/getSession").get(async function (req, res) {
  if (!req.session.username) {
    console.log("No session found");
  } else {
    console.log("User is: " + req.session.username);
  }
  res.json("{}");
});

module.exports = authRoutes;
