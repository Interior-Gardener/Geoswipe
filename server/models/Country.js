const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("Country", countrySchema);
