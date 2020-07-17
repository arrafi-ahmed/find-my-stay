const express 	= require('express');
const router 	= express.Router();
const hostModel	= require.main.require('./models/host-model');
const userModel	= require.main.require('./models/user-model');
var { body, validationResult } = require('express-validator');

router.get('/', (req, res)=>{
	if (req.cookies['username'] == null) {
		if (req.query.redirect == 'booking' && req.query.propertyId != null && req.query.checkin != null && req.query.checkout != null) {
			res.render('login', {booking:req.query, csrfToken: req.csrfToken(), title:'Login'});
		}else{
			res.render('login', {csrfToken: req.csrfToken(), title:'Login'});
		}			
	}else{
		res.redirect('/home');
	}
});

router.post('/',
	[
	body('id').not().isEmpty().trim().isLength({ min: 5 }),
	body('password').not().isEmpty().trim().isLength({ min: 5 })
	],
	async (req, res)=>{

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	    req.session.message = {type:'errors', errors:errors.array()};

	    if (req.query.redirect == 'booking' && req.query.propertyId != null && req.query.checkin != null && req.query.checkout != null) {
			res.redirect('/login?redirect=' + 'booking&propertyId=' + req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
		}else{
			res.redirect('/login');
		}	  
	}

	//if no input validation error
	else{
		const credential ={
			id: 		req.body.id,
			password: 	req.body.password
		};

		if (req.body.role == 'user') {
			const validateUser = await userModel.validateUser(credential);
			if(validateUser[0]){
				res.cookie('username', req.body.id);
				res.cookie('role', 'user');
				res.cookie('name', validateUser[1]+' '+validateUser[2]);
				res.cookie('photo', validateUser[3]);
				
				if (req.query.redirect == 'booking' && req.query.propertyId != null && req.query.checkin != null && req.query.checkout != null) {
					res.redirect('/booking?propertyId='+req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
				}else{
					res.redirect('/home');
				}
			}else{
				if (req.query.redirect == 'booking' && req.query.propertyId != null && req.query.checkin != null && req.query.checkout != null) {
					req.session.message = {type:'error', error:'Incorrect id/password'};
					res.redirect('/login?redirect=' + 'booking&propertyId=' + req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);	
				}else{
					req.session.message = {type:'error', error:'Incorrect id/password'};
					res.redirect('/login');	
				}				
			}
		}
		else if (req.body.role == 'host'){
			const validateHost = await hostModel.validateHost(credential);
			if(validateHost){
				res.cookie('username', req.body.id);
				res.cookie('role', 'host');
				res.cookie('name', validateHost[1]+' '+validateHost[2]);
				res.cookie('photo', validateHost[3]);
				
				if (req.query.redirect == 'booking' && req.query.propertyId != null && req.query.checkin != null && req.query.checkout != null) {
					res.redirect('/booking?propertyId='+req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
				}else{
					res.redirect('/home');
				}
			}else{
				if (req.query.redirect == 'booking' && req.query.propertyId != null && req.query.checkin != null && req.query.checkout != null) {
					req.session.message = {type:'error', error:'Incorrect id/password'};
					res.redirect('/login?redirect=' + 'booking&propertyId=' + req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
				}else{
					req.session.message = {type:'error', error:'Incorrect id/password'};
					res.redirect('/login');
				}		
			}
		}
	}	
});

module.exports = router;