const express = require('express')
const salesOrder = require('../models/salesOrder')
const router = express.Router()


router.get('/', async (req, res) => {
  let salesOrders
  try {
    salesOrders = await salesOrder.find().sort({ createdAt: 'desc' }).limit(10).exec()
  } catch {
    salesOrders = []
  }
  res.render('index', { salesOrders: salesOrders })
})

module.exports = router