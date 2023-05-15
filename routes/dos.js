const express = require('express')
const router = express.Router()
const SalesOrder = require('../models/salesOrder')
const Customer = require('../models/customer')
const DO = require('../models/do')
const path = require("path")
const PDFDocument = require('pdfkit')
const fs =require('fs')
const runNumber = require('../models/runNumber') 

function genPdf (cust,dos,doL,fabs,res){
  
  let pdfFile = path.join(__dirname, "../output.pdf")
  // Create a document
  const doc = new PDFDocument();  
  doc.pipe(fs.createWriteStream(pdfFile));

  let d = doL.date.toISOString().replace(/T.*/,'').split('-').reverse().join('-');
  let posX1 = 50+3;
  let posX2 = 85;
  let posY = 254+30;

  // Add an image, constrain it to a given size, and center it vertically and horizontally
  // Fit the image within the dimensions
  doc.image('atf-logo.png', 50, 15, {fit: [100, 100]})   
      .stroke()
      .fontSize(15)
      .text('AUTOFILL MANUFACTURING SDN BHD',150,15)
      .fontSize(10)
      .text('Co Rgn no.503130-X       SST NO. J12-1808-21019559 ',150,40)
      .text('No. 10 Jalan 3, Taman Perindustrian Sinaran,',150,40+12)
      .text('Jalan Mersing, 86000 Kluang,Johor.',150,40+(12*2))
      .text('Tel: 07-7877167',150,40+(12*3))
      
      // top line 
      .lineWidth(35)
      .moveTo(35,126)
      .lineTo(375,126)
      .moveTo(35,126.5)
      .lineTo(375,126.5)

      .moveTo(500,126)
      .lineTo(550,126)
      .moveTo(500,126.5)
      .lineTo(550,126.5)

      .fontSize(13)
      .font('Times-Roman')      
      .text('DELIVERY ORDER', 383, 120)


      .fontSize(11)
      //.text('DO. No.', 400, 100)
      .text(doL.doNo, 440+25, 100)  // x,y
      
      // company etc
      .fontSize(10)
      .rect(35, 141 , 350, 90)  // x,y,w,h 
      .text('Name',38, 151)  // x,y
      .text('Attn',38, 151+12)
      .text('Address',38, 151+(12*2))
      .text('Phone',38,151+(12*4))
      .lineWidth(0.1)                
      .moveTo(100,151+10)
      .lineTo(100+270,161)
      .text(cust.name,100, 151)  // x,y
      .moveTo(100,161+12)
      .lineTo(370,161+12)
      .text(cust.pic,100, 151+12)  // x,y
      .moveTo(100,161+12*2)
      .lineTo(370,161+12*2)
      .text(cust.address,100, 151+12*2)  // x,y
      .moveTo(100,161+12*3)
      .lineTo(370,161+12*3)
      .moveTo(100,161+12*4)
      .lineTo(370,161+12*4)
      .text(cust.phone,100, 151+12*4)  // x,y

      // date etc
      .rect(400,141, 150, 90)  
      .text('Date',403, 151)  // x,y 
      .text('PO No.',403, 151+12)  // x,y 
      .text('Ref No.',403, 151+12*2)  // x,y 
      .text('Quotation No.',403, 151+12*3)  // x,y 
      .text('Terms',403, 151+12*4)  // x,y 

      .moveTo(463,151+10)
      .lineTo(463+80,150+10)
      .text(d,463, 151)  // x,y

      .moveTo(463,161+12)
      .lineTo(463+80,161+12)
      .text(doL.poNumber,463, 151+12)  // x,y

      .moveTo(463,161+(12*2))
      .lineTo(463+80,161+(12*2))
      .text(doL.soNumber,463, 151+12*2)  // x,y

      .moveTo(463,161+(12*3))
      .lineTo(463+80,161+(12*3))
      //.text(fabs.quotationNo,463, 151+12*3)  // x,y

      .moveTo(463,161+(12*4))
      .lineTo(463+80,161+(12*4))
      .text(cust.terms,463, 151+12*4)  // x,y



      // data contents  
      .rect(35,250, 515, 390)  
      .moveTo(35,250+15)    // horizon line
      .lineTo(550,250+15)
      .moveTo(80,250)       // vertical line left
      .lineTo(80,250+390)
      .moveTo(400,250)      // vertical line right
      .lineTo(400,250+390)
      .fontSize(11)
      .text('Qty',50, 254)  // x,y 
      .text('Description',200, 254)  // x,y 
      .text('REMARKS',450, 254)  // x,y 
      
      .text('Dwg No.',300, 254+13,)  // x,y 
      .moveTo(300,267+12)      // vertical line right
      .lineTo(300+42,267+12)
      
       

      // bottom
      .moveTo(35,700)      // line left
      .lineTo(35+100,700)
      .moveTo(400,700)      // line Right
      .lineTo(400+100,700)
      .text('ISSUE BY',35+10, 703)  // x,y 
      .text('RECEIVE BY',400+10, 703)  // x,y 
      .stroke()
      .pipe(res)

  dos.forEach( ddo => {    
    if (doL.doNo === ddo.doNo) {
      doc.text( ddo.deliverQty, posX1, posY)      // quantity 
      fabs.forEach (fab => {
        if (fab.barcode === ddo.barcode ){
          doc.fontSize(11)
          doc.text(fab.description, posX2, posY)  // description 
          doc.text(fab.drawingNo, 300, posY)  // description 
          doc.fontSize(10)
          doc.text(fab.quotationNo,463, 151+12*3)  // x,y       
        }        
      })          
      posY += 13;            
    } 
    })    
      
    // Finalize PDF file
    doc.end() 
}


// All DOs Route
router.get('/', async (req, res) => {
  
  let query = DO.find()  
  const customers = await Customer.find() 
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
     doNumber = new runNumber()
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
    issuer : req.body.issuer.trim(),
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
    const customer = await Customer.findById(doL.customer.toString()).exec()
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
    const cust = await Customer.findById(doL.customer.toString()).exec()
    const fabs = await SalesOrder.find()
   
    
    genPdf(cust,dos,doL,fabs,res);
  }
  catch {
          res.redirect('/')
        }
})


// update (save) do Part Route
router.put('/:id', async (req, res) => {
  
  let so = await SalesOrder.findById(req.body.soId)
  let doN = await DO.findById(req.body.id)
  let lastDeliver
  try { 
    if (req.body.button === "Add"){       
      doN = new DO({
        date : new Date(req.body.date),
        doNo : req.body.doNumber,
        customer : req.body.customerId , 
        issuer : req.body.issuer.trim()    
       })      
    }
    if (req.body.button === "Edit")
    { 
      doN = await DO.findById(req.body.id)
      if (doN.status === "send"){
        lastDeliver = doN.deliverQty        
      }
    }
    doN.soNumber = so.orderNumber
    doN.poNumber = so.poNumber
    doN.unitPrice = so.unitPrice
    doN.orderQty = so.orderQty
    doN.drawingNo = so.drawingNo
    doN.deliverQty = req.body.deliverQty
    doN.barcode = so.barcode

    // update do and salesorder status and delivered quantity
    let _so = await SalesOrder.findOne({barcode: [doN.barcode]})
    if (_so !== null){      
      if (doN.status !== "send"){
        doN.status = "send"
        _so.deliveredQty += doN.deliverQty
        
      }else{
        _so.deliveredQty -= lastDeliver
        _so.deliveredQty += doN.deliverQty
        }
        
      if (_so.deliveredQty >= _so.orderQty){
        _so.status = "done"
      }else{
        _so.status = "" 
        }

      await _so.save()
    }
    await doN.save()
    res.redirect(`/dos/${doN.id}`)
  }
  catch {
      if (doN != null) {          
        renderEditPage(res, doN, true)
      }
      else {res.redirect('/') }
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
    
    let orderQtyList = []
    let deliveredQtyList = []
    salesOrders.forEach(so => {  
       if (doL.customer.toString() === so.customer.toString() ) {
          orderQtyList.push(so.orderQty)
          deliveredQtyList.push(so.deliveredQty)
      }
    })
    

    const params = {
      salesOrders : salesOrders,
      customer: customer,
      doL: doL,
      orderQtyList : orderQtyList,
      deliveredQtyList : deliveredQtyList,
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