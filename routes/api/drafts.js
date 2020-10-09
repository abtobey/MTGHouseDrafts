const express = require("express");
const { db } = require("../../models/Draft");
const router = express.Router();
const Draft = require("../../models/Draft");
const User = require("../../models/User");

router.post("/draft", (req,res) => {
    const newDraft=new Draft({
        players:req.body.players,
        format:req.body.format,
        userId:req.body.userId
    });
    console.log("something")
    Draft.create(newDraft)
    .then(data => res.json(data))
    .then(({_id})  => User.findOneAndUpdate({"_id": req.body.userId}, {$push: {drafts: _id}}, {new:true}))
    .catch(err => console.log(err))
  })

router.get("/draft/:_id", (req,res) => {
    Draft.findOne({_id: req.params._id})
    .then(data => res.json(data))
    .catch(err => console.log(err))
})
module.exports = router;