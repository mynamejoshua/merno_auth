const express = require("express");
const { sha256, sha224 } = require('js-sha256');
const authRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;


async function get_user(username, password) {
    const db_connect = dbo.getDb();
    const userRecord = await db_connect.collection("users").findOne({ userName: username });

    if (!userRecord) {
        return null;
    }

    // password correct
    if (sha256(password + userRecord.salt) === userRecord.passwordHash) {
        return userRecord;
    }
    
    return null;
}

authRoutes.route("/a").get(async function (req, response) {
    response.json({ dog: sha256('password_1123tq32435') });
});

authRoutes.route("/auth").post(async function (req, response) {
    const password = req.body.password;
    const userName = req.body.userName;

    const userRecord = await get_user(userName, password);

    if (userRecord) {
        req.session.username = userName;
        req.session.password = password;

        response.json({ msg: "correct", access: 1 });
    }
    else {
        response.json({ msg: "incorrect", access: 0 });
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
    if (!req.session.username  || !req.session.password){
        res.json({});
        return;
    }
    
    const userRecord = get_user(req.session.username, req.session.password);
    if (userRecord) {
        res.json({username: req.session.username, access: 1})
    }
    
    return;
});

authRoutes.route("/logout").get(async function (req, res) {
    req.session.destroy();
});


module.exports = authRoutes;
