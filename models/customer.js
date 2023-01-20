const mongoose = require('mongoose')


const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  fax: {
    type: String,
  },
  pic: {
    type: String,
  },
  handphone: {
    type: String,
  },
  status: {
    type: String,
  }
})


module.exports = mongoose.model('Customer', customerSchema)