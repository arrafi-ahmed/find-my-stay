const express 		= require('express');
const geoip 		= require('geoip-lite');
const router 		= express.Router();
const bookingsModel	= require.main.require('./models/bookings-model');
var { query, validationResult } = require('express-validator');

router.get('/', 
	[
	query('location').not().isEmpty().trim(),
	query('checkin')
		.isAfter(new Date(new Date().getTime() - new Date().getTimezoneOffset()*60000).toDateString())
			.withMessage('Date cant be before today!'),
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
	if (!errors.isEmpty()) {
		req.session.message = {type:'errors', errors:errors.array()};
		res.render('search', {title:'Search', message:req.session.message});
	}
	//if no errors
	else{
		query = {
			location : req.session.location = req.query.location.split(/[ ,]/),
			checkin : req.session.checkin = req.query.checkin,
			checkout : req.session.checkout = req.query.checkout,
			type : []
		}
		if (req.query.type == "both") {
			query.type.push(0); query.type.push(1);
		}else if (req.query.type == "entire-place"){
			query.type.push(0);
		}else{
			query.type.push(1);
		}
		const searchBooking = await bookingsModel.searchBooking(query);
		res.render('search', {propertyList:searchBooking, query:query, title:'Search'});
	}	
});

router.get('/type/:type', async (req, res)=>{
	const ip = req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress) || '';
	const city = geoip.lookup(ip).city;
	// const date = new Date(new Date().getTime() - new Date().getTimezoneOffset()*60000);
	const today = new Date().toISOString().slice(0, 10);
	const tomorrow = new Date(date.setDate(date.getDate() + 1)).toISOString().slice(0,10);
	
	console.log(today);
	console.log(tomorrow);
	res.redirect('/search?location='+city+'&checkin='+today+'&checkout='+tomorrow+'&type='+req.params.type);	
});

router.get('/location/:location', async (req, res)=>{
	const date = new Date(new Date().getTime() - new Date().getTimezoneOffset()*60000);
	const today = date.toISOString().slice(0, 10);
	const tomorrow = new Date(date.setDate(date.getDate() + 1)).toISOString().slice(0,10);
	res.redirect('/search?location='+req.params.location+'&checkin='+today+'&checkout='+tomorrow+'&type=both');	
});

module.exports = router;