const mongoose = require('mongoose')

const salesOrderSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  orderNumber: {
    type: String   
  },
  poNumber: {
    type: String   
  },
  orderQty: {
    type: Number
  },
  deliverQty: {
    type: Number   
  },
  unitPrice: {
    type: Number    
  },
  customer: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'customer'
  },
  drawingNo: {
    type: String    
  },
  prodType: {
    type: String    
  },
  description: {
    type: String    
  },
  status: {
    type: String    
  },
  partImage: {
    type: Buffer    
  },
  partImageType: {
    type: String    
  }
})

salesOrderSchema.virtual('partImagePath').get(function() {
  if (this.partImage != null && this.partImageType != null) {
    return `data:${this.partImageType};charset=utf-8;base64,${this.partImage.toString('base64')}`
  }
})


module.exports = mongoose.model('SalesOrder', salesOrderSchema)