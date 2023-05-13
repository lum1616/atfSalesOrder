const express = require('express')
const salesOrder = require('../models/salesOrder')
const router = express.Router()
const Customer = require('../models/customer')
const DO = require('../models/do')


router.get('/', async (req, res) => {
  
  let salesOrders
  let customers
  let title

  try {
    // salesOrders = await salesOrder.find().sort({ createdAt: 'desc' }).limit(10).exec()
    salesOrders = await salesOrder.find().sort({ customer: 1 }).exec()
    customers = await Customer.find({})
    title="Parts In Progress"

    } catch {
    salesOrders = [] 
  }

  res.render('index', { so: salesOrders, cu : customers, title:title })
})

router.post('/', async (req, res) => {

  let salesOrders
  let customers
  let dos

  try {
    
    salesOrders = await salesOrder.find().sort({ orderNumber: 1 }).exec()
    customers = await Customer.find({})
    dos = await DO.find().sort({ drawingNo: 1 }).exec()   
    title = req.body.filter
    //
    if (title === "FAB Orders"){
      
      res.render(`fabList`, { so: salesOrders, cu : customers, title:title })
      }
    //  
    if (title === "DO List"){
       res.render(`doList`, { dos: dos, cu : customers, title:title })
      }
    if (title === "Description"){
        res.render(`descList`, { so: salesOrders, cu : customers, title:title })
       }
 
    //  
    if (title === "Parts In Progress"){
       res.redirect('/') 
     }  




      



  } catch {   
   
  }
})



module.exports = router