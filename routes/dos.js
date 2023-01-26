const express = require('express')
const router = express.Router()
const SalesOrder = require('../models/salesOrder')
const Customer = require('../models/customer')
const DO = require('../models/do')
const { Mongoose } = require('mongoose')


// All DOs Route
router.get('/', async (req, res) => {

  let query = DO.find() 
  try {
    const dos = await query.exec()       
    res.render('dos/index', {
      dos: dos,
      searchOptions: req.query      
    })
  } catch {    
    res.redirect('/')
  }
})

// New DOs Route
router.get('/newDO', async (req, res) => {

  const dos = await DO.find({}) 
  const customers = await Customer.find({}) 
   
  const params = {
    dos: dos,
    customers : customers,    
    ddo: new DO()     
  }
  res.render(`dos/newDO`, params)
  
})

// Create New Dos Route
router.post('/', async (req, res) => {
  const doN = new DO({
    date: new Date(req.body.date),
    doNo: req.body.doNumber,     
    customer: req.body.customer,
    issuer : "",
    receiver : "",
    soNumber : "",
    poNumber : "",
    drawingNo : "",
    orderQty : 0,
    deliverQty : 0
  })
  
  try {
    const newDo = await doN.save()
    res.redirect(`dos/${newDo.id}`)
  } catch {   
    renderNewPage(res, doN, true)
  }
})

// Show DO Route
router.get('/:id', async (req, res) => {
  let query = DO.find() 

  try {     

    const doL = await DO.findById(req.params.id).exec()     
    const dos = await query.exec()   
    const customer = await Customer.findById(doL.customer.toString()).exec()    
    res.render('dos/showDO', { doL: doL,
                               dos: dos,
                                      customer:customer })     

  } catch {   
    res.redirect('/')
  }
})

// Edit DO Part Route
router.get('/:id/edit', async (req, res) => {  
  try {     
    const doL = await DO.findById(req.params.id).exec()
    //console.log(doL);
    const customer = await Customer.findById(doL.customer.toString()).exec()
    //console.log("e");
    renderEditPage(res, doL, customer)
  } catch {
             res.redirect('/')
          }
})

// Add DO Part Route
router.get('/:id/add', async (req, res) => {
  try {
    const doL = await DO.findById(req.params.id)
    const customer = await Customer.findById(doL.customer.toString()).exec()
    renderAddPage(res, doL, customer )
    } catch {
    res.redirect('/')
  }
})

// update (save) do Part Route
router.put('/:id', async (req, res) => {

  let so = await SalesOrder.findById(req.body.soId)
  let doN = await DO.findById(req.body.id)    
  
  try { 
    if (req.body.button === "Add"){       
      doN = new DO({
        date : new Date(req.body.date),
        doNo : req.body.doNumber,
        customer : req.body.customerId      
       })      
    }
    
    if (req.body.button === "Edit")
    { 
      doN = await DO.findById(req.body.id)      
    }
    doN.soNumber = so.orderNumber
    doN.poNumber = so.poNumber
    doN.unitPrice = so.unitPrice
    doN.orderQty = so.orderQty
    doN.drawingNo = so.drawingNo
    doN.deliverQty = req.body.deliverQty
    await doN.save()
    res.redirect(`/dos/${doN.id}`)
  } catch {
      if (doN != null) {          
          renderEditPage(res, doN, true)
          } else {                 
                  res.redirect('/')
                  }
  }
})

// Delete DO Page
router.delete('/:id', async (req, res) => {
  let doL
  try {    
    doL = await DO.findById(req.params.id)
    await doL.remove()
    res.redirect('/dos')
  } catch {
    if (doL != null) {      
      res.render('dos/showDO', {
        doL: doL,
        errorMessage: 'Could not remove DO'
      })
    } else {     
      res.redirect('/')
    }
  }
})

async function renderAddPage(res, doL ,customer, hasError = false) {  
  renderFormPage(res, doL, customer, 'Add', hasError)
}

async function renderEditPage(res, doL, customer, hasError = false) {
  renderFormPage(res, doL, customer, 'Edit', hasError)
}

async function renderFormPage(res, doL, customer,form, hasError = false) {
  try {   
    const salesOrders = await SalesOrder.find({})
    const params = {
      salesOrders : salesOrders,
      customer: customer,
      doL: doL,     
      form : form          
    }       
    /* if (hasError) {
      if (form === 'edit') {   
        params.errorMessage = 'Error Updating SalesOrder'
      } else {
        params.errorMessage = 'Error Creating SalesOrder'
      }
    } */
    //res.render(`salesOrders/${form}`, params)
    res.render(`dos/editPart`, params)
 
  } catch {    
    res.redirect('/dos')
  }
}

module.exports = router