const mongoose = require('mongoose')


const photoSchema = new mongoose.Schema({

    partImage: {
        type: Buffer    
      },

    partImageType: {
      type: String    
      }

})


module.exports = mongoose.model('Photo', photoSchema)