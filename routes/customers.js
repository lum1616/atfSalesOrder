const express = require('express')
const router = express.Router()
const Customer = require('../models/customer')
const SalesOrder = require('../models/salesOrder')

// All Customers Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const customers = await Customer.find(searchOptions)
    res.render('customers/index', {
      customers: customers,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Customer Route
router.get('/new', (req, res) => {
  res.render('customers/new', { customer: new Customer() })
})

// Create Customer Route
router.post('/', async (req, res) => {
 
  const customer = new Customer({
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
    fax: req.body.fax,
    pic: req.body.pic,
    handphone: req.body.handphone,  
    status: "" 
  })
  console.log(customer);
  try {
    const newCustomer = await customer.save()
    res.redirect(`customers/${newCustomer.id}`)
  } catch {
    res.render('customers/new', {
      customer: customer,
      errorMessage: 'Error creating Customer'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    const salesOrders = await SalesOrder.find({ customer: customer.id }).limit(6).exec()
    res.render('customers/show', {
      customer: customer,
      salesOrdersByAuthor: salesOrders
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/:id/edit', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    res.render('customers/edit', { customer: customer })
  } catch {
    res.redirect('/customers')
  }
})

router.put('/:id', async (req, res) => {
  let customer
  try {
    customer = await Customer.findById(req.params.id)
    customer.name = req.body.name
    customer.address = req.body.address
    customer.phone = req.body.phone
    customer.fax = req.body.fax
    customer.pic = req.body.pic
    customer.handphone = req.body.handphone
    await customer.save()
    res.redirect(`/customers/${customer.id}`)
  } catch {
    if (customer == null) {
      res.redirect('/')
    } else {
      res.render('customers/edit', {
        customer: customer,
        errorMessage: 'Error updating Customer'
      })
    }
  }
})

router.delete('/:id', async (req, res) => {
  let customer
  try {
    customer = await Customer.findById(req.params.id)
    await customer.remove()
    res.redirect('/customers')
  } catch {
    if (customer == null) {
      res.redirect('/')
    } else {
      res.redirect(`/customers/${customer.id}`)
    }
  }
})

module.exports = router