const express = require("express");
const { sha256, sha224 } = require('js-sha256');
const authRoutes = express.Router();
const dbo = require("../db/conn"); 
const ObjectId = require("mongodb").ObjectId;

user = {
    name: "joe",
    password: "1234"
}

authRoutes.route("/a").get(async function (req, response) {
    response.json({dog: sha256('password_1123tq32435')});
});

authRoutes.route("/auth").post(async function (req, response) {

    const password = req.body.password;
    const userName = req.body.userName;

    const db_connect = dbo.getDb();
    const userRecord = await db_connect.collection("users").findOne({userName: userName});

    if (!userRecord) {
        response.json({msg: "incorrect", access: 0})
        return;
    }

    if (sha256(password + userRecord.salt) === userRecord.passwordHash)
    {
        response.json({msg: "correct", access: 1});
    }
    else {
        response.json({msg: "incorrect", access: 0});
    }
});

authRoutes.route("/register").post(async function (req, response) {
    const password = req.body.password;
    const userName = req.body.userName;
    const salt = Math.floor(Math.random() * 999999)

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

module.exports = authRoutes;
