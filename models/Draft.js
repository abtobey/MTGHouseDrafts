const mongoose=require("mongoose")
const Schema = mongoose.Schema;
// Create Schema
const DraftSchema = new Schema({
  format: {
    type: String,
    required: false
  },
  players: [{
    type: String,
    required: true
  }],
  matchups: [{
    type: String,
    required: true
  }],
  finalists: [{
    type: String,
    required: false
  }],
  roundSnapshots: [{
    type: String,
    required: false
  }],
  round: {
    type: Number,
    required: true
  },
  userId :{
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
module.exports = Draft = mongoose.model("drafts", DraftSchema);