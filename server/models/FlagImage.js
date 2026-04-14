const mongoose = require('mongoose');

const FlagImageSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
      trim: true
    },
    countryKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    flagUrl: {
      type: String,
      required: true
    },
    code: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    cachedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

FlagImageSchema.index({ countryKey: 1 }, { unique: true });

module.exports = mongoose.model('FlagImage', FlagImageSchema, 'flag_images');
