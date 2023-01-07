const mongoose = require('mongoose')

const doSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  doNo: {
    type: String,
  },
  salesOrderNo: {
    type: String,
  },
  qty: {
    type: Number,
  },
  issuer: {
    type: String,
  },
  receiver: {
    type: String,
  },
  status: {
    type: String,
  }
})


module.exports = mongoose.model('DO', doSchema)