const mongoose = require('mongoose');

const MonumentImageSchema = new mongoose.Schema(
  {
    monumentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    source: {
      type: String,
      enum: ['wikipedia', 'unsplash'],
      required: true
    },
    width: {
      type: Number,
      default: null
    },
    height: {
      type: Number,
      default: null
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

MonumentImageSchema.index({ monumentId: 1 }, { unique: true });
MonumentImageSchema.index({ name: 1 });

module.exports = mongoose.model('MonumentImage', MonumentImageSchema, 'monument_images');
