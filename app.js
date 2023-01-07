if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load()
  }
  
  const express = require('express')
  const app = express()
  const expressLayouts = require('express-ejs-layouts')
  const bodyParser = require('body-parser')
  const methodOverride = require('method-override')
  
  const indexRouter = require('./routes/index')
  const customerRouter = require('./routes/customers')
  const salesOrderRouter = require('./routes/salesOrders')
  
  app.set('view engine', 'ejs')
  app.set('views', __dirname + '/views')
  app.set('layout', 'layouts/layout')
  app.use(expressLayouts)
  app.use(methodOverride('_method'))
  app.use(express.static('public'))
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
  
  const mongoose = require('mongoose')
  mongoose.connect("mongodb://127.0.0.1:27017/atfDB",{ useNewUrlParser: true,useUnifiedTopology: true })
  const db = mongoose.connection
  db.on('error', error => console.error(error))
  db.once('open', () => console.log('Connected to Mongoose'))
  
  app.use('/', indexRouter)
  app.use('/customers', customerRouter)
  app.use('/salesOrders', salesOrderRouter)
  
  app.listen(process.env.PORT || 3000)