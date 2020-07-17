const express 		= require('express');
const router 		= express.Router();
const bookingsModel	= require.main.require('./models/bookings-model');
const reviewModel	= require.main.require('./models/review-model');
const propertyModel	= require.main.require('./models/property-model');
var { body, validationResult } = require('express-validator');

router.get('*', (req, res, next)=>{
	if(req.cookies.username == null){
		res.redirect('/login');
	}else if(req.cookies.role == 'host'){
		req.session.message = {type:'error', error:'Access Denied!'};
		res.redirect('/home');
	}
	else{
		next();
	}
});

router.get('/', async (req, res)=>{
	const getBookingPropertyByUser = await bookingsModel.getBookingPropertyByUser(req.cookies.username);
	res.render('bookings-recent', {bookings:getBookingPropertyByUser, csrfToken:req.csrfToken(), title:'Recent Bookings'});
});

router.post('/:id', async (req, res)=>{
	if (req.body.delete) {
		const deleteBooking = await bookingsModel.deleteBooking(req.params['id'], req.cookies.username);
		if (deleteBooking) {
			req.session.message = {type:'success', success:'Booking deleted!'};
		}else{
			req.session.message = {type:'error', error:'Error deleting the booking!'};
		}
	res.redirect('/recent-bookings');
	}
});

router.post('/:id/review', 
	[
	body('details').not().isEmpty().trim().isLength({ min: 5 }).withMessage('Review must be 5 chars minimum!'),
	],
	async (req, res)=>{
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	    req.session.message = {type:'errors', errors:errors.array()};
	    res.redirect('/recent-bookings');
	}else{
		const checkBookingByUserProperty = await bookingsModel.checkBookingByUserProperty(req.params.id, req.body.propertyId, req.cookies.username);
		if (checkBookingByUserProperty) {
			const currentDate = new Date().toISOString().slice(0,10);
			review = {
				userId 		: req.cookies.username,
				propertyId 	: req.body.propertyId,
				rating 		: parseInt(req.body.rating),
				details 	: req.body.details,
				date 		: currentDate
			};
			const insertReview 	= await reviewModel.insertReview(review);
			const getPropertyRating = await propertyModel.getPropertyRating(req.body.propertyId);
			
			rating = {
				newRating : (getPropertyRating.rating * getPropertyRating.rating_count + review.rating) / (getPropertyRating.rating_count + 1),
				newRatingCount : getPropertyRating.rating_count + 1
			}
			
			const updatePropertyRating = await propertyModel.updatePropertyRating(rating, req.body.propertyId);
		 	
			if (insertReview && updatePropertyRating) {
				const completeBooking = await bookingsModel.completeBooking(req.params.id);
				res.redirect('/property/' + req.body.propertyId);
			}else{
				res.redirect('/recent-bookings');
			}
		}else{
			req.session.message = {type:'error', error: 'Invalid request!'};
	    	res.redirect('/recent-bookings');
		}
	}
});

module.exports = router;