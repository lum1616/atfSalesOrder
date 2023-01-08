const express = require('express')
const router = express.Router()
const SalesOrder = require('../models/salesOrder')
const Customer = require('../models/customer')
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
router.get('/new', async (req, res) => {
    renderNewPage(res, new SalesOrder())
})

// Create SalesOrders Route
router.post('/', async (req, res) => {
  const salesOrder = new SalesOrder({
    date: new Date(req.body.date),
    orderNumber: req.body.orderNumber,
    drawingNo : req.body.drawingNo,
    poNumber: req.body.poNumber,   
    orderQty: req.body.orderQty,
    orderQty: req.body.orderQty,
    deliverQty: req.body.deliverQty,
    orderQty: req.body.orderQty,
    unitPrice: req.body.unitPrice,
    customer: req.body.customer
  })
  saveCover(salesOrder, req.body.cover)

  try {
    const newSalesOrder = await salesOrder.save()
    res.redirect(`salesOrders/${newSalesOrder.id}`)
  } catch {    
    renderNewPage(res, salesOrder, true)
  }
})

// Show SalesOrder Route
router.get('/:id', async (req, res) => {

  try {
    const salesOrder = await SalesOrder.findById(req.params.id).exec()
    res.render('salesOrders/show', { salesOrder: salesOrder })     

  } catch {
    res.redirect('/')
  }
})

// Edit SalesOrder Route
router.get('/:id/edit', async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id)
    renderEditPage(res, salesOrder)
  } catch {
    res.redirect('/')
  }
})

// Update SalesOrder Route
router.put('/:id', async (req, res) => {
  let salesOrder

  try {
    salesOrder = await SalesOrder.findById(req.params.id)
    salesOrder.orderQty = req.body.orderQty
    salesOrder.orderNumber =req.body.orderNumber
    salesOrder.orderNumber = req.body.orderNumber,
    salesOrder.drawingNo = req.body.drawingNo,
    salesOrder.deliverQty = req.body.deliverQty
    salesOrder.date = new Date(req.body.date)
    salesOrder.drawingNo = req.body.drawingNo
    salesOrder.poNumber = req.body.poNumber
    salesOrder.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      
      saveCover(salesOrder, req.body.cover)
    }
    await salesOrder.save()
    res.redirect(`/salesOrders/${salesOrder.id}`)
  } catch {
    if (salesOrder != null) {
      renderEditPage(res, salesOrder, true)
    } else {
      redirect('/')
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

async function renderNewPage(res, salesOrder, hasError = false) {
  renderFormPage(res, salesOrder, 'new', hasError)
}

async function renderEditPage(res, salesOrder, hasError = false) {
  renderFormPage(res, salesOrder, 'edit', hasError)
}

async function renderFormPage(res, salesOrder, form, hasError = false) {
  try {   
    const customers = await Customer.find({})
    const params = {
      customers: customers,
      salesOrder: salesOrder
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating SalesOrder'
      } else {
        params.errorMessage = 'Error Creating SalesOrder'
      }
    }
    res.render(`salesOrders/${form}`, params)
  } catch {
    console.log("error enter rendernewpage");
    res.redirect('/salesOrders')
  }
}

function saveCover(salesOrder, coverEncoded) {
  if (coverEncoded == null) return
  
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    console.log("cover type=  " + cover.type);
    salesOrder.partImage = new Buffer.from(cover.data, 'base64')
    salesOrder.partImageType = cover.type
  }
}

module.exports = router