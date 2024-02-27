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

async function get_user_by_hash(username, hash) {
    const db_connect = dbo.getDb();
    const userRecord = await db_connect
      .collection("users")
      .findOne({ userName: username, passwordHash: hash});

    if (!userRecord) {
      return null;
    }

    return userRecord;
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

authRoutes.route("/auth").post(async function (req, res) {
  const password = req.body.password;
  const userName = req.body.userName;

  const userRecord = await get_user(userName, password);

  if (userRecord) {
    console.log("user found by username and password");
    // console.log(userRecord);
    const user = userRecord.userName; 
    const hash = userRecord.passwordHash; 
    
    req.session.userName = user;
    req.session.passwordHash = hash;
    
    console.log("in auth");
    console.log("user record: ", userRecord);
    console.log("session id: ", req.sessionID);
    console.log("req.session.userName: ", req.session.userName);
    console.log("req.session.passwordHash: ", req.session.passwordHash);
    res.json({ msg: "correct" });
  } else {
    res.status(403).send("not valid");
  }
});

authRoutes.route("/register").post(async function (req, response) {
  const password = req.body.password;
  const userName = req.body.userName;
  const role = req.body.role;
  const salt = Math.floor(Math.random() * 999999);

  myobj = {
    passwordHash: sha256(password + salt),
    userName: userName,
    role: role,
    salt: salt,
  };

  let db_connect = dbo.getDb();
  const result = await db_connect.collection("users").insertOne(myobj);

  response.json(result);
  console.log("added record: ", myobj);
});

// check if user previously logged in
authRoutes.route("/prev").get(async function (req, res) {
  console.log("session id: ", req.sessionID);
  console.log("username: ", req.session.userName);
  console.log("passwordHash: ", req.session.passwordHash); 

  if (req.session.userName) {
    // Check for a session variable that you know is set
    const userRecord = await get_user_by_hash(
      req.session.userName, 
      req.session.passwordHash
    );

    if (userRecord) {
      console.log("user found");
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

authRoutes.route("/personalData").get(async function (req, res) {
  try {
    const userRecord = await get_user_by_id(req.session.userId);
    res.json({ userName: userRecord.userName, role: userRecord.role });
  } catch {
    res.status(401).send("not found");
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
    req.session.username = "dag";
    console.log("Session set");
    console.log(req.session);
  } else {
    console.log("Session already existed");
  }
  res.json("{}");
});

authRoutes.route("/getSession").get(async function (req, res) {
  req.session.userName = "b";
  req.session.password = "b12345";
  if (!req.session.username) {
    console.log("No session found");
  } else {
    console.log("User is: " + req.session.username);
  }
  res.json("{}");
});

module.exports = authRoutes;
