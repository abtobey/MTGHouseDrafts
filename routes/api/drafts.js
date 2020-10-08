const express = require("express");
const { db } = require("../../models/Draft");
const router = express.Router();
const Draft = require("../../models/Draft");

router.post("/draft", (req,res) => {
    const newDraft=new Draft({
        players:req.body.players,
        format:req.body.format,
        userId:req.body.userId
    });
    console.log("something")
    Draft.create(newDraft)
    .then(({_id})  => db.User.findOneAndUpdate({"_id": req.body.userId}, {$push: {drafts: _id}}, {new:true}))
    .then(data => res.json(data))
    .catch(err => console.log(err))
  })

router.get("/draft", (req,res) => {
    Draft.findAll({_id: req.body._id})
    .then(data => res.json(data))
    .catch(err => console.log(err))
})
module.exports = router;