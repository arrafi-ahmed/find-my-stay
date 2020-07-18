const express 	= require('express');
const path 		= require('path');
const fs 		= require('fs');
const router 	= express.Router();
const userModel = require.main.require('./models/user-model');
const hostModel = require.main.require('./models/host-model');
var { check, validationResult } = require('express-validator');

router.get('/', (req, res)=>{
	if (req.cookies.username == null) {
		if (req.query.redirect == 'booking' && req.query.propertyId != null && req.query.checkin != null && req.query.checkout != null) {
			res.render('register', {booking:req.query, csrfToken: req.csrfToken(), title:'Login'});
		}else{
			res.render('register', {csrfToken: req.csrfToken(), title:'Register'});	
		}
	}else{
		res.redirect('/home');
	}
});

router.post('/user', 
	[
	check('id').not().isEmpty().trim().isLength({ min: 3 }),
	check('password').not().isEmpty().trim()
		.isLength({ min: 5 }).withMessage('Must be at least 5 chars long!')
		.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{5,}$/, "i").withMessage('Must contain lowercase, uppercase and digit!'),
	check('firstName').not().isEmpty().trim(),
	check('lastName').not().isEmpty().trim(),
	check('email').not().isEmpty().trim().normalizeEmail(),
	check('phone').not().isEmpty().trim(),
	check('dob', 'Age must be 18 years or older').not().isEmpty().trim().isBefore(new Date(new Date().getFullYear() -18,12,30).toDateString()),
	check('address').not().isEmpty().trim().isLength({ min: 2 }),
	check('city').not().isEmpty().trim().isLength({ min: 2 }),
	check('country').not().isEmpty().trim().isLength({ min: 2 })
	],
	async (req, res)=>{

	const findUserById = await userModel.findUserById('u-'+req.body.id);  
	const errors = validationResult(req);
	
	//input validation
	if (!errors.isEmpty()) {
		req.session.message = {type:'errors', errors:errors.array()};

		if (req.query.redirect == 'booking' && req.query.propertyId != null) {
			res.redirect('/register?redirect=' + 'booking&propertyId=' + req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
		}else{
			res.redirect('/register');	
		}		
	}

	//id exist validation
    else if(findUserById){
    	req.session.message = {type:'error', error:'ID already taken!'};

    	if (req.query.redirect == 'booking' && req.query.propertyId != null) {
			res.redirect('/register?redirect=' + 'booking&propertyId=' + req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
		}else{
			res.redirect('/register');	
		}    	
	}

	//if no error
	else{
		if (req.body.userSubmit) {
			const data = {
				id: 			'u-'+req.body.id,
				password: 		req.body.password,
				firstName: 		req.body.firstName,
				lastName: 		req.body.lastName,
				email: 			req.body.email,
				phone: 			req.body.phone,
				dob: 			req.body.dob,
				gender: 		req.body.gender,
				profilePhoto:   null,
				address:  		req.body.address,
				city:   		req.body.city,
				country:  		req.body.country	
			};

			// file upload
			if (req.files.profilePhoto.size != 0) {
				var name = req.body.id + path.extname(req.files.profilePhoto.name);
				await req.files.profilePhoto.mv("public/images/profilePhoto/user/" + name, (error)=>{
					if (error) {console.log("Error uploading");}
					else{console.log("Successfully uploaded");}
				});
				data.profilePhoto = name;			
			}
			else{
				data.profilePhoto = "defaultProfile.jpg";		
				var tempFile = req.files.profilePhoto.tempFilePath.replace(/\\/g, '/');
				fs.unlinkSync(tempFile);					
			}

			//insert operation
			const insertUser = await userModel.insertUser(data);
			if (insertUser){
				req.session.message = {type:'success', success:'Registration Successful!'};
				if (req.query.redirect == 'booking' && req.query.propertyId != null) {
					res.redirect('/booking?propertyId='+req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
				}
				else{
					res.redirect('/login');
				}
				
			}
			else{
				req.session.message = {type:'error', error:'Error registering account!'};
				if (req.query.redirect == 'booking' && req.query.propertyId != null) {
					res.redirect('/register?redirect=' + 'booking&propertyId=' + req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
				}
				else{
					res.redirect('/register');
				}				
			}
		};
	}
});

router.post('/host',
	[
	check('hid').not().isEmpty().trim().isLength({ min: 3 }),
	check('hpassword').not().isEmpty().trim()
		.isLength({ min: 5 }).withMessage('Must be at least 5 chars long!')
		.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{5,}$/, "i").withMessage('Must contain lowercase, uppercase and digit!'),
	check('hfirstName').not().isEmpty().trim(),
	check('hlastName').not().isEmpty().trim(),
	check('hemail').not().isEmpty().trim().normalizeEmail(),
	check('hphone').not().isEmpty().trim(),
	check('hdob', 'Age must be 18 years or older').not().isEmpty().trim().isBefore(new Date(new Date().getFullYear() -18,12,30).toDateString()),
	check('habout').not().isEmpty().trim().isLength({ min: 50 })
	],

	async (req, res)=>{

	const errors = await validationResult(req);
	const findHostById = await hostModel.findHostById('h-'+req.body.hid);  //id exist validation
	
	//input validation
	if (!errors.isEmpty()) {
		req.session.message = {type:'errors', errors:errors.array()};

		if (req.query.redirect == 'booking' && req.query.propertyId != null) {
			res.redirect('/register?redirect=' + 'booking&propertyId=' + req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
		}else{
			res.redirect('/register');	
		}		
	}

	//id exist validation
    else if(findHostById){
    	req.session.message = {type:'error', error:'ID already taken!'};

    	if (req.query.redirect == 'booking' && req.query.propertyId != null) {
			res.redirect('/register?redirect=' + 'booking&propertyId=' + req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
		}else{
			res.redirect('/register');	
		}    	
	}

    //if no error
    else{
    	if (req.body.hostSubmit) {
			const data = {
				id: 			'h-'+req.body.hid,
				password: 		req.body.hpassword,
				firstName: 		req.body.hfirstName,
				lastName: 		req.body.hlastName,
				email: 			req.body.hemail,
				phone: 			req.body.hphone,
				dob: 			req.body.hdob,
				gender: 		req.body.hgender,
				profilePhoto:   null,
				about:   		req.body.habout			
			};

			// file upload
			if (req.files.hprofilePhoto.size != 0) {
				var name = req.body.hid + path.extname(req.files.hprofilePhoto.name);
				await req.files.hprofilePhoto.mv("public/images/profilePhoto/host/" + name, (error)=>{
					if (error) {console.log("Error uploading");}
					else{console.log("Successfully uploaded");}
				});
				data.profilePhoto = name;			
			}
			else{
				data.profilePhoto = "defaultProfile.jpg";		
				var tempFile = req.files.profilePhoto.tempFilePath.replace(/\\/g, '/');
				fs.unlinkSync(tempFile);					
			}

			//insert operation
			const insertHost = await hostModel.insertHost(data);
			if (insertHost){
				req.session.message = {type:'success', success:'Registration Successful!'};
				if (req.query.redirect == 'booking' && req.query.propertyId != null) {
					res.redirect('/booking?propertyId='+req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
				}
				else{
					res.redirect('/login');
				}
				
			}
			else{
				req.session.message = {type:'error', error:'Error registering account!'};
				if (req.query.redirect == 'booking' && req.query.propertyId != null) {
					res.redirect('/register?redirect=' + 'booking&propertyId=' + req.query.propertyId + '&checkin=' + req.query.checkin + '&checkout=' + req.query.checkout);
				}
				else{
					res.redirect('/register');
				}				
			}
		}
    }
});

module.exports = router;