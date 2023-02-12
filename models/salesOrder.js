const mongoose = require('mongoose')


const salesOrderSchema = new mongoose.Schema({

  date: {
    type: Date,   
    default: Date.now
  },
  // = FAB number
  orderNumber: {
    type: String   
  },
  poNumber: {
    type: String   
  },  

  customer: { 
    type: mongoose.Schema.Types.ObjectId,    
    ref: 'customer'
  },
  
  orderQty: {
    type: Number
  },

  deliveredQty: {
    type: Number   
  },

  unitPrice: {
    type: Number    
    },
  drawingNo: {
    type: String    
    },
  barcode : {
    type: String
  },  
  prodType: {
    type: String    
    },
  // quotation number link  
  quotationNo: {
    type: String    
    }, 

  description: {
    type: String    
    },
  status: {
    type: String    
    },

  reference: { 
    type: mongoose.Schema.Types.ObjectId,   
    ref: 'photo'
    },
})

salesOrderSchema.virtual('partImagePath').get(function() {
  if (this.partImage != null && this.partImageType != null) {
    return `data:${this.partImageType};charset=utf-8;base64,${this.partImage.toString('base64')}`
  }
})

module.exports = mongoose.model('SalesOrder', salesOrderSchema)