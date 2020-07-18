const express 		= require('express');
const router 		= express.Router();
const propertyModel	= require.main.require('./models/property-model');
const reviewModel	= require.main.require('./models/review-model');
const bookingsModel	= require.main.require('./models/bookings-model');
var { body, validationResult } = require('express-validator');

router.get('/:id', async (req, res)=>{
	const getPropertyById = await propertyModel.getPropertyById(req.params.id);
	const get4ReviewsByProperty = await reviewModel.get4ReviewsByProperty(req.params.id);
	const getHostByProperty = await propertyModel.getHostByProperty(req.params.id);
	if (getPropertyById) {
		if (req.session.check != null && req.session.check.findBooking == true) {
			res.locals.message = {type:'error', error:'Selected date already booked!'}
		}
		res.render('property-single', {property:getPropertyById, reviews:get4ReviewsByProperty, host:getHostByProperty, session:req.session, csrfToken: req.csrfToken(), title: getPropertyById.name});
	}else{
		req.session.message = {type:'error', error:'Invalid request!'}
		res.redirect('/');
	}	
});

router.post('/:id', 
	[
	body('checkin')
		.isAfter(new Date(new Date().getTime() - new Date().getTimezoneOffset()*60000).toDateString())
			.withMessage('Date can not be before today!'),
	body('checkout')
		.custom((value, { req }) => {
			var checkin = new Date(req.body.checkin).getTime();
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
		//reset
		req.session.checkin = null;
		req.session.checkout = null;
		req.session.check = null;
		res.redirect('/property/' + req.params.id);
	}
	//if no errors
	else{
		
		var checkin = req.session.checkin = req.body.checkin;
		var checkout = req.session.checkout = req.body.checkout;
		
		if (req.body.check) {
			const findBooking = await bookingsModel.findBooking(req.params.id, checkin, checkout);
			if (findBooking) { 
				req.session.check = {
					propertyId : req.params.id,
					checkin : req.body.checkin,
					checkout : req.body.checkout,
					findBooking : true
				};	
				req.session.check.maxAge = 6000;
				// setTimeout(()=>{ req.session.check = null; }, 10000);		
			}else{
				req.session.check = {
					propertyId : req.params.id,
					checkin : req.body.checkin,
					checkout : req.body.checkout,
					findBooking : false
				};
				req.session.check.maxAge = 6000;
				// setTimeout(()=>{ req.session.check = null; }, 10000);
			}
			res.redirect('/property/' + req.params.id);
		}	
		else if(req.body.book){
			res.redirect('/booking?propertyId=' + req.body.propertyId + '&checkin=' + req.body.checkin + '&checkout=' + req.body.checkout);
		}
	}
});

router.get('/:id/reviews', async (req, res)=>{
	const getPropertyById = await propertyModel.getPropertyById(req.params.id);
	const getAllReviewsByProperty = await reviewModel.getAllReviewsByProperty(req.params.id);

	if (getPropertyById) {
		res.render('property-reviews', {property:getPropertyById, reviews:getAllReviewsByProperty, title: 'Reviews'});	
	}else{
		req.session.message = {type:'error', error:'Invalid request!'}
		res.redirect('/');
	}	
});

module.exports = router;