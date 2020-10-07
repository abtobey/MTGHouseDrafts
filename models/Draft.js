const mongoose=require("mongoose")
const Schema = mongoose.Schema;
// Create Schema
const DraftSchema = new Schema({
  format: {
    type: String,
    required: true
  },
  players: [{
    type: String,
    required: true
  }],
  date: {
    type: Date,
    default: Date.now
  }
});
module.exports = Draft = mongoose.model("drafts", DraftSchema);