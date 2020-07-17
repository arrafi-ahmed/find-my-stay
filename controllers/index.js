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

router.get('/homeSearch', 
	[
	query('location').not().isEmpty().trim(),
	query('checkin')
		.isAfter(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toDateString()).withMessage('Date can not be before today!'),
	query('checkout')
		.custom((value, { req }) => {
			var checkin = new Date(req.query.checkin).getTime();
			if ( new Date(value).getTime() < new Date(checkin + 1).getTime() ){
			    throw new Error('Date must be after checkin!');
			}
			return true;
		})
	],

	async (req, res)=>{

	const errors = await validationResult(req);
	//input validation
	if (!errors.isEmpty()) {
		req.session.message = {type:'errors', errors:errors.array()};
		res.redirect('/home');
	}
	//if no errors
	else{
		res.redirect('/search?location='+req.query.location+'&checkin='+req.query.checkin+'&checkout='+req.query.checkout+'&type='+req.query.type);
	}	
});

module.exports = router;