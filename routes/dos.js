const express = require('express')
const router = express.Router()
const SalesOrder = require('../models/salesOrder')
const Customer = require('../models/customer')
const DO = require('../models/do')
const { Mongoose } = require('mongoose')
const ejs = require('ejs')
const path = require("path")
const pdf = require("html-pdf")
const fs =require('fs')
const { jsPDF } = require('jspdf')
const runNumber = require('../models/runNumber') 

// All DOs Route
router.get('/', async (req, res) => {

  let query = DO.find()
  let customers = Customer.find()  
  try {
    const dos = await query.exec()       
    res.render('dos/index', {
      dos: dos,
      customers : customers,
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

   //get DO running number
   let doNumber = await runNumber.findOne({code: "DO"})
 
   if (doNumber == null){
     doNumber = new DOnumber()
     doNumber.code = "DO"
     doNumber.counter = 0
     await doNumber.save()
     doNumber.counter++ 
   }else {     
     doNumber.counter++     
   }
    
   IptDONo = await getRunNo("DO")
   
  const params = {
    dos: dos,
    customers : customers,    
    ddo: new DO(),   
    IptDONo : IptDONo  
  }
  res.render(`dos/newDO`, params)
  
})

// Create New Dos Route
router.post('/', async (req, res) => {
  const doN = new DO({
    date: new Date(req.body.date),
    doNo: req.body.doNumber.trim(),     
    customer: req.body.customer,
    issuer : req.body.issuer,
    status : " ",
    receiver : "",
    soNumber : "",
    poNumber : "",
    drawingNo : "",
    orderQty : 0,
    deliverQty : 0,
    unitPrice : 0
  })
  const doNumber = await runNumber.findOne({code : "DO"})
  doNumber.counter++ 

  /* doN.barcode = await getRunNo("PA")
  const paNumber = await runNumber.findOne({code : "PA"})
  paNumber.counter++ 
  await paNumber.save() */

  
  try {

    await doNumber.save()
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

// Print Do Route lib=html-pdf 
router.get('/:id/print', async (req, res) => {
  try {
    const dos = await DO.find() 
    const doL = await DO.findById(req.params.id)
    const customer = await Customer.findById(doL.customer.toString()).exec()
      
    let pdfFile = 'C:/DO/' + doL.doNo + '.pdf'
   
    
    ejs.renderFile(path.join(__dirname, "../views/doTemplate.ejs"),
     {dos, doL, customer},(err, data) => {
                      if (err) {
                        res.send(err);
                      } else {
                        let options = {
                              "height": "11.25in",
                              "width": "8.5in",
                              "header": {
                                  "height": "20mm",
                              },
                              "footer": {
                                  "height": "20mm",
                              },

                          };
                          pdf.create(data, options).toFile(pdfFile, function (err, data) {
                              if (err) {
                                  res.send(err);
                              } else{

                                  fs.readFile(pdfFile,function(error,data){
                                          if(error){
                                                  res.json({'status':'error',msg:err});
                                          }else{                                               
                                                  res.writeHead(200, {"Content-Type": "application/pdf"  });
                                                  res.write(data);
                                                  res.end();       
                                                }
                                  });
                                }//else
                          });

                        }//else
    })
    //res.redirect('/')
       
  }
  catch {
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
        customer : req.body.customerId , 
        issuer : req.body.issuer    
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
    doN.barcode = so.barcode
      
    
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
  //console.log(req.params.id);
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
    
    if(form === "Add"){
     
      doL.barcode = await getRunNo("PA")      
    }

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

  return _runNumber.code + "-" + year.substring(2) + "-" + strCnt 
 
  
  
}

module.exports = router