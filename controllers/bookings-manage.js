const express 		= require('express');
const router 		= express.Router();
const bookingsModel	= require.main.require('./models/bookings-model');
const invoiceModel	= require.main.require('./models/invoice-model');
const messagesModel	= require.main.require('./models/messages-model');
const propertyModel	= require.main.require('./models/property-model');
const userModel		= require.main.require('./models/user-model');
const hostModel		= require.main.require('./models/host-model');

router.get('*', (req, res, next)=>{
	if(req.cookies.username == null){
		res.redirect('/login');
	}else if(req.cookies.role == 'user'){
		req.session.message = {type:'error', error:'Access Denied!'};
		res.redirect('/home');
	}else{
		next();
	}
});

router.get('/', async (req, res)=>{
	const getBookingByHost = await bookingsModel.getBookingByHost(req.cookies.username);
	res.render('bookings-manage', {bookings:getBookingByHost, csrfToken:req.csrfToken(), title:'Manage Bookings'});
});

router.post('/:id', async (req, res)=>{
	if (req.body.accept) {
		const acceptBooking = await bookingsModel.acceptBooking(req.params.id, req.cookies.username);
		if (acceptBooking) {
			req.session.message = {type:'success', success:'Booking accepted!'};
		}else{
			req.session.message = {type:'error', error:'Request failed!'};
		}
	}
	else if (req.body.decline) {
		const declineBooking = await bookingsModel.declineBooking(req.params.id, req.cookies.username);
		if (declineBooking) {
			req.session.message = {type:'success', success:'Booking declined!'};
		}else{
			req.session.message = {type:'error', error:'Request failed!'};
		}
	}
	else if (req.body.paid) {
		const paidBooking = await bookingsModel.paidBooking(req.params.id, req.cookies.username);
		if (paidBooking) {
			req.session.message = {type:'success', success:'Booking marked as paid!'};
		}else{
			req.session.message = {type:'error', error:'Request failed!'};
		}
	}
	else if(req.body.invoice){
		const getPropertyByBookId = await propertyModel.getPropertyByBookId(req.params.id);
	
		if (getPropertyByBookId && getPropertyByBookId.host_id == req.cookies.username) {
			const getUserById = await userModel.getUserById(getPropertyByBookId.user_id);
			const getHostById = await hostModel.getHostById(req.cookies.username);

			const date1 = new Date(getPropertyByBookId.start_date);
			const date2 = new Date(getPropertyByBookId.end_date);
			const duration = parseInt((date2 - date1) / (1000 * 3600 * 24));
			const currentTime = new Date().toISOString().slice(0,19).replace('T', ' ')+' GMT'; // var currentDate = new Date().toISOString().slice(0,10);
			
			message = {
				propertyId : getPropertyByBookId.property_id,
				propertyName : getPropertyByBookId.name,
				propertyAddress : getPropertyByBookId.address,
				propertyCity : getPropertyByBookId.city,
				propertyCountry : getPropertyByBookId.country,
				hostPhone : getHostById.phone,
				hostEmail : getHostById.email,
				
				userId : getUserById.id,
				userName : getUserById.first_name+' '+getUserById.last_name,
				userAddress : getUserById.address,
				userCity : getUserById.city,
				userCountry : getUserById.country,
				userPhone : getUserById.phone,
				userEmail : getUserById.email,
				
				currentDate : currentTime,
				bookId : getPropertyByBookId.book_id,
				price : getPropertyByBookId.price,
				startDate : getPropertyByBookId.cstart_date,
				endDate : getPropertyByBookId.cend_date,
				duration : duration,
				totalAmount : duration * getPropertyByBookId.price
			};
			
			messageBody = {
				receiver : message.userId,
				content  : JSON.stringify(message),
				sender   : req.cookies.username,
				isInvoice: 1		
			};
			invoice = {
				bookId: message.bookId,
				userId: message.userId,
				amount: message.totalAmount,
				hostId: req.cookies.username
			};

			const insertInvoice = await invoiceModel.insertInvoice(invoice);
			const invoicedBooking = await bookingsModel.invoicedBooking(req.params.id, req.cookies.username);
			const sendMessages = await messagesModel.sendMessage(messageBody);
			if (insertInvoice && sendMessages && invoicedBooking) {
				req.session.message = {type:'success', success:'Invoice successfully sent!'}
				res.redirect('/messages/' + message.userId);
			}else {
				req.session.message = {type:'error', error:'Error sending invoice!'}
				res.redirect('/manage-bookings');
			}		
		}else{
			req.session.message = {type:'error', error:'Invalid request!'}
			res.redirect('/manage-bookings');
		}
	}
	res.redirect('/manage-bookings');
});

module.exports = router;