const mongoose = require('mongoose')

const doSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  doNo: {type: String},  
  issuer: {type: String},
  receiver: { type: String },
  status: {type: String},  
  soNumber : {type :String}, 
  drawingNo : {type :String},
  barcode : {type :String},
  poNumber : {type :String}, 
  unitPrice : {type :Number}, 
  orderQty : {type :Number}, 
  deliverQty : {type :Number}, 
   
  customer: { 
    type: mongoose.Schema.Types.ObjectId,    
    ref: 'customer'
  },
})


module.exports = mongoose.model('DO', doSchema)