const express = require('express')
const router = express.Router()
const SalesOrder = require('../models/salesOrder')
const Customer = require('../models/customer')
const { Mongoose } = require('mongoose')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']


// All SalesOrders Route
router.get('/', async (req, res) => {

  let query = SalesOrder.find() 
  try {
    const salesOrders = await query.exec()
    res.render('salesOrders/index', {
      salesOrders: salesOrders,
      searchOptions: req.query      
    })
  } catch {
    res.redirect('/')
  }
})

// New SalesOrders Route
router.get('/newSO', async (req, res) => {

  const customers = await Customer.find({}) 
  const params = {
    customers: customers,
    salesOrder: new SalesOrder()     
  }
  res.render(`salesOrders/newSO`, params)
  //  renderNewPage(res, new SalesOrder())
})

// Create SalesOrders Route
router.post('/', async (req, res) => {
  const salesOrder = new SalesOrder({
    date: new Date(req.body.date),
    orderNumber: req.body.orderNumber, 
    poNumber: req.body.poNumber, 
    customer: req.body.customer
  })
  // saveCover(salesOrder, req.body.cover)
  try {
    console.log("save new so");
    console.log(salesOrder);
    const newSalesOrder = await salesOrder.save()
    res.redirect(`salesOrders/${newSalesOrder.id}`)
  } catch {   
    renderNewPage(res, salesOrder, true)
  }
})

// Show SalesOrder Route
router.get('/:id', async (req, res) => {
  let query = SalesOrder.find() 

  try {    
    const salesOrder = await SalesOrder.findById(req.params.id).exec() 
    const salesOrders = await query.exec()   
    const customer = await Customer.findById(salesOrder.customer.toString()).exec()

    res.render('salesOrders/show', { salesOrder: salesOrder,
                                    salesOrders: salesOrders,
                                      customer:customer })     

  } catch {
   
    res.redirect('/')
  }
})

// Edit SalesOrder Part Route
router.get('/:id/edit', async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id)
    const customer = await Customer.findById(salesOrder.customer.toString()).exec()
    renderEditPage(res, salesOrder, customer, "Edit" )
  } catch {
    res.redirect('/')
  }
})

// Edit SalesOrder Part Route
router.get('/:id/add', async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id)
    const customer = await Customer.findById(salesOrder.customer.toString()).exec()
    renderAddPage(res, salesOrder, customer, "Add" )
  } catch {
    res.redirect('/')
  }
})

// update (save) SalesOrder Part Route
router.put('/:id', async (req, res) => {
  let salesOrder

  try { 
    if (req.body.button === "Add"){

     salesOrder = new SalesOrder({
      date : new Date(req.body.date),
      orderNumber : req.body.orderNumber,
      poNumber : req.body.poNumber,
      customer : req.body.customerId      
     }) 
     

    }

    if (req.body.button === "Edit")
    {  
      salesOrder = await SalesOrder.findById(req.body.soId)
    }     
    
    salesOrder.orderQty = Number(req.body.orderQty)
    salesOrder.unitPrice = Number(req.body.unitPrice)
    salesOrder.drawingNo = req.body.drawingNo
    salesOrder.description = req.body.description  
    
    await salesOrder.save()
    
    res.redirect(`/salesOrders/${salesOrder.id}`)
  } catch {
    if (salesOrder != null) {
      console.log("1");
      renderEditPage(res, salesOrder, true)
    } else {
      console.log("2");
      res.redirect('/')
    }
  }
})

// Delete SalesOrder Page
router.delete('/:id', async (req, res) => {
  let salesOrder
  try {    
    salesOrder = await SalesOrder.findById(req.params.id)
    await salesOrder.remove()
    res.redirect('/salesOrders')
  } catch {
    if (salesOrder != null) {      
      res.render('salesOrders/show', {
        salesOrder: salesOrder,
        errorMessage: 'Could not remove salesOrder'
      })
    } else {     
      res.redirect('/')
    }
  }
})

async function renderAddPage(res, salesOrder, hasError = false) {
  renderFormPage(res, salesOrder, 'Add', hasError)
}

async function renderEditPage(res, salesOrder, hasError = false) {

  
  renderFormPage(res, salesOrder, 'Edit', hasError)
}

async function renderFormPage(res, salesOrder, form, hasError = false) {
  try {   
    const customers = await Customer.find({})    
    const params = {
      customers: customers,
      salesOrder: salesOrder,
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
    res.render(`salesOrders/editPart`, params)
 
  } catch {
    
    res.redirect('/salesOrders')
  }
}

function saveCover(salesOrder, coverEncoded) {
  if (coverEncoded == null) return
  
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    
    part.partImage = new Buffer.from(cover.data, 'base64')
    part.partImageType = cover.type
  }
}

module.exports = router