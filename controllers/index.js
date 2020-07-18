const express 		= require('express');
const router 		= express.Router();
const reviewModel	= require.main.require('./models/review-model');
const propertyModel	= require.main.require('./models/property-model');
var { query, validationResult } = require('express-validator');

router.get('/', async (req, res)=>{
	const getPromoteInfo = await propertyModel.getPromoteInfo();
	const getLatest3reviews = await reviewModel.getLatest3reviews();
	res.render('index', {property:getPromoteInfo, testimonials:getLatest3reviews, session:req.session, title:'Home'});
});

router.get('/homeSearch', (req, res)=>{
	res.redirect('/search?location='+req.query.location+'&checkin='+req.query.checkin+'&checkout='+req.query.checkout+'&type='+req.query.type);
});

module.exports = router;