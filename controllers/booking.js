const express 		= require('express');
const router 		= express.Router();
const propertyModel	= require.main.require('./models/property-model');
const bookingsModel	= require.main.require('./models/bookings-model');
const messagesModel	= require.main.require('./models/messages-model');

router.get('/', async (req, res)=>{
	if (req.cookies.username == null) {
		req.session.message = {type:'error', error:'Please log in to confirm booking!'};
		res.redirect('/login?redirect=' + 'booking&propertyId=' + req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
	}
	else if(req.cookies.role == 'host'){
		req.session.check = null;
		req.session.message = {type:'error', error:'Hosts are not allowed to book property!'};
		res.redirect('/property/' + req.query.propertyId);
	}
	else if(req.query.propertyId == req.session.check.propertyId && req.query.checkin == req.session.check.checkin && req.query.checkout == req.session.check.checkout) {
		const getPropertyById = await propertyModel.getPropertyById(req.query.propertyId);

		const date1 = new Date(req.query.checkin);
		const date2 = new Date(req.query.checkout);
		const duration = parseInt((date2 - date1) / (1000 * 3600 * 24));
		
		bookings = {
			duration : duration,
			totalAmount : duration * getPropertyById.price
		}; 
		res.render('booking', {property: getPropertyById, bookings: bookings, query:req.query, findBooking:req.session.check.findBooking, csrfToken:req.csrfToken(), title:'Confirm Booking'});
	}else{
		req.session.check = null;
		req.session.message = {type:'error', error:'Invalid request!'};
		res.redirect('/home');
	}	
});

router.post('/', async (req, res)=>{
	if(req.session.check.propertyId == req.query.propertyId && req.session.check.findBooking === false){
		booking = {
			propertyId : req.body.propertyId,
			totalAmount: req.body.totalAmount,
			startDate  : req.body.startDate,
			endDate    : req.body.endDate,
			status 	   : 0,
			hostId 	   : req.body.hostId,
			userId 	   : req.cookies.username
		};
		var messageContent = 'New booking confirmed! | Property ID: '+req.body.propertyId+ ' | Start Date: '+req.body.startDate+' | End Date: '+req.body.endDate+' | Total Amount: '+req.body.totalAmount+' | User ID: '+req.cookies.username;
		message = {
			receiver : req.body.hostId,
			content  : messageContent,
			sender   : req.cookies.username			
		};
		
		//check booking second time to check if record exist
		const findBooking = await bookingsModel.findBooking(req.query.propertyId, req.query.checkin, req.query.checkout);
		//if duplicate booking not found
		if (!findBooking) {
			const insertBooking = await bookingsModel.insertBooking(booking);
			const sendMessage = await messagesModel.sendMessage(message);
			if (insertBooking && sendMessage) {
				req.session.check = null;
				req.session.message = {type:'success', success:'Booking Confirmed!'};
				res.redirect('/recent-bookings');
			}else{
				req.session.check = null;
				req.session.message = {type:'error', error:'Error confirming the booking!'};
				res.redirect('booking?propertyId='+req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
			}
		}
		else{
			req.session.check = null;
			req.session.message = {type:'error', error:'Selected date already booked!'};
			res.redirect('/property/' + req.query.propertyId);
		}
		
	}else{
		req.session.message = {type:'error', error:'Invalid request!'};
		res.redirect('/property/' + req.query.propertyId);
	}
});

module.exports = router;