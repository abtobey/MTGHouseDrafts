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