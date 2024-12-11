const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  fileName: String,
  hash: String,
  uploadReport: Object,
  scanReport: Object,
  scorecardReport: Object,
  visualData: Object,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", reportSchema);
