const mongoose = require('mongoose')

const runNumberSchema = new mongoose.Schema({

    code: {
        type: String  
      },

    year: {
      type: String    
      },

    counter : {
        type : Number
    }  

})


module.exports = mongoose.model('RunNumber', runNumberSchema)