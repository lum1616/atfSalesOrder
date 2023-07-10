const express = require('express')
const router = express.Router()
const SalesOrder = require('../models/salesOrder')
const Customer = require('../models/customer')
const { Mongoose } = require('mongoose')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const runNumber = require('../models/runNumber')



// All SalesOrders Route
router.get('/', async (req, res) => {  
  
  let query = SalesOrder.find() 
  const customers = await Customer.find() 
  
  try {
    const salesOrders = await query.exec()
    res.render('salesOrders/index', {
      salesOrders: salesOrders,
      customers : customers,
      searchOptions: req.query,        
    })
  } catch {
    res.redirect('/')
  }
})

// New SalesOrders Route
router.get('/newSO', async (req, res) => {

  
  const customers = await Customer.find({})

  //get FAB running number
  let IptFABNo = await getRunNo("FAB")

  //get FAB running number
  let IptPANo = await getRunNo("PA")
  

  const params = {
    customers: customers,
    salesOrder: new SalesOrder(),    
    IptFABNo : IptFABNo,
    IptPANo : IptPANo 
  }
  res.render(`salesOrders/newSO`, params)
  //  renderNewPage(res, new SalesOrder())
})

// Create SalesOrders Route
router.post('/', async (req, res) => {
  const salesOrder = new SalesOrder({
    date: new Date(req.body.date),
    orderNumber: req.body.orderNumber.trim(), 
    poNumber: req.body.poNumber.trim(), 
    customer: req.body.customer,
    quotationNo: req.body.quotationNo.trim(),
    barcode: req.body.barcode.trim(),
    desc_fab: req.body.desc_fab.trim(),
    status : "",
    unitPrice : 1,
    deliveredQty : 0,    
    orderQty : 1
  })
  
  
  const fabNumber = await runNumber.findOne({code : "FAB"})
  fabNumber.counter++ 
  
  const paNumber = await runNumber.findOne({code : "PA"})
   paNumber.counter++ 


  
  // save
  try {
    await fabNumber.save()
    await paNumber.save()
    
    const newSalesOrder = await salesOrder.save()
    res.redirect(`salesOrders/${newSalesOrder.id}`)
  } catch {   
    res.redirect('/')
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
      orderNumber : req.body.orderNumber.trim(),
      poNumber : req.body.poNumber.trim(),
      customer : req.body.customerId,
      barcode : req.body.barcode.trim(),
      deliveredQty : 0,
      status : ""  
          
     }) 
     const paNumber = await runNumber.findOne({code : "PA"})
    paNumber.counter++ 
    await paNumber.save()
     

    }

    if (req.body.button === "Edit")
    {  
      salesOrder = await SalesOrder.findById(req.body.soId)
    }     
    
    salesOrder.orderQty = Number(req.body.orderQty)
    salesOrder.unitPrice = Number(req.body.unitPrice)
    salesOrder.drawingNo = req.body.drawingNo.trim()
    salesOrder.description = req.body.description.trim()  
    salesOrder.quotationNo = req.body.quotationNo.trim()
    
    await salesOrder.save()

    // update quotation number
    let sos = await SalesOrder.find()
     sos.forEach( so => {
        //console.log(so.orderNumber)
        if (so.orderNumber === req.body.orderNumber.trim()) {
             so.quotationNo = salesOrder.quotationNo;  
             so.save()                  
             }            
       }
      
       
     )      
    
    
    res.redirect(`/salesOrders/${salesOrder.id}`)
  } catch {
    if (salesOrder != null) {
      //console.log("1");
      renderEditPage(res, salesOrder, true)
    } else {
      //console.log("2");
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
    //await SalesOrder.deleteMany({orderNumber:salesOrder.orderNumber}) 
    res.redirect('/salesOrders')
    //res.redirect(`/salesOrders/${salesOrder.id}`)
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
   
   
    if(form === "Add"){
      salesOrder.barcode = await getRunNo("PA")           
    }

    
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


async function getRunNo(Code){
  
  let _runNumber = await runNumber.findOne({code: [Code]})
  
   if (_runNumber == null){
    _runNumber = new runNumber()
    _runNumber.code = Code
    _runNumber.counter = 0
    await _runNumber.save()
    _runNumber.counter++ 
  }else {
    _runNumber = await runNumber.findOne({code: [Code]})
    _runNumber.counter++ 
  
  }   
  let d = new Date()
  let year = d.getFullYear().toString()
  let strCnt = _runNumber.counter.toString().padStart(6, '0')

  let IptRunNo = _runNumber.code + "-" + year.substring(2) + "-" + strCnt 
 
  return IptRunNo  
}

module.exports = router