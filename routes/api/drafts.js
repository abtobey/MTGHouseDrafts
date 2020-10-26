const express = require("express");
const { db } = require("../../models/Draft");
const router = express.Router();
const Draft = require("../../models/Draft");
const User = require("../../models/User");

router.post("/draft", (req,res) => {
    const newDraft=new Draft({
        players:req.body.players,
        round: 1,
        format:req.body.format,
        userId:req.body.userId
    });
    Draft.create(newDraft)
    .then(({_id})  => User.findOneAndUpdate({"_id": req.body.userId}, {$push: {drafts: _id}}, {new:true}))
    .then(data=> res.json(data.drafts[data.drafts.length-1]))
    .catch(err => console.log(err))
  })

router.get("/draft/:_id", (req,res) => {
    Draft.findOne({_id: req.params._id})
    .then(data => res.json(data))
    .catch(err => console.log(err))
})
module.exports = router;