const express 		= require('express');
const path 			= require('path');
const fs 			= require('fs');
const router 		= express.Router();
const hostModel		= require.main.require('./models/host-model');
const bookingsModel	= require.main.require('./models/bookings-model');
const invoiceModel	= require.main.require('./models/invoice-model');
const propertyModel	= require.main.require('./models/property-model');
var { check, validationResult } = require('express-validator');

router.get('*', (req, res, next) => {
	if(req.cookies.username == null){
		res.redirect('/login');
	}else if(req.cookies.role == 'user'){
		req.session.message = {type:'error', error:'Access Denied!'};
		res.redirect('/home');
	}else{
		next();
	}
});

//if req.cookies.username, link privately accessable; if req.params.id, publicly accessable; 
router.get('/:id', async (req, res) => {
	if (req.params.id == req.cookies.username) {
		const getHostById = await hostModel.getHostById(req.params.id);
		getHostById.dob = getHostById.dob.toISOString().slice(0,10);
		res.render("account-host", {profile:getHostById, title:'Profile'});
	}else{
		req.session.message = {type:'error', error:'Invalid request!'};
		res.redirect('/'+ req.cookies.role + '/' + req.cookies.username);
	}	
});

router.get('/:id/edit', async (req, res) => {
	if (req.params.id == req.cookies.username) {
		const getHostById = await hostModel.getHostById(req.cookies.username);
		getHostById.dob = getHostById.dob.toISOString().slice(0,10);
		res.render("account-host", {profileEdit:getHostById, csrfToken:req.csrfToken(), title:'Edit Profile'});
	}else{
		req.session.message = {type:'error', error:'Invalid request!'};
		res.redirect('/'+ req.cookies.role + '/' + req.cookies.username +'/edit');
	}	
});

router.post('/:id/edit', 
	[
	check('id').not().isEmpty().trim().isLength({ min: 5 }),
	check('password').not().isEmpty().trim()
		.isLength({ min: 5 }).withMessage('Must be at least 5 chars long!')
		.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{5,}$/, "i").withMessage('Must contain lowercase, uppercase and digit!'),
	check('firstName').not().isEmpty().trim(),
	check('lastName').not().isEmpty().trim(),
	check('email').not().isEmpty().trim().normalizeEmail(),
	check('phone').not().isEmpty().trim(),
	check('dob', 'Age must be 18 years or older').not().isEmpty().trim().isBefore(new Date(new Date().getFullYear() -18,12,30).toDateString()),
	check('about').not().isEmpty().trim().isLength({ min: 50 })
	],
	async (req, res) => {

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	    req.session.message = {type:'errors', errors:errors.array()};
	    res.redirect('/host/'+req.params.id+'/edit');
	}else{		
		host = {
			id: 			req.cookies.username,
			password: 		req.body.password,
			firstName: 		req.body.firstName,
			lastName: 		req.body.lastName,
			email: 			req.body.email,
			phone: 			req.body.phone,
			dob: 			req.body.dob,
			gender: 		parseInt(req.body.gender),
			about:   		req.body.about,
			profilePhoto:  	null
		};
		

		if (req.files.profilePhoto.size != 0) {
			if (req.body.oldPhoto == "defaultProfile.jpg") {
				name = req.body.id + path.extname(req.files.profilePhoto.name);
				res.cookie('photo', name);
			}else{
				name = req.body.oldPhoto;
			}
			req.files.profilePhoto.mv('public/images/profilePhoto/host/'+name, (error)=>{
				if (error) {console.log("Error uploading");}
				else {console.log("Successfully uploaded");}
			});

			host.profilePhoto = name;
			
			var tempFile = req.files.profilePhoto.tempFilePath.replace(/\\/g, '/');
			fs.unlinkSync(tempFile);
			
			const updateHost = await hostModel.updateHost(host);
			if (updateHost){
				req.session.message = {type:'success', success:'Updated successfully!'};
				res.redirect('/host/'+req.params.id);
			}
			else{
				req.session.message = {type:'error', error:'Error updating account!'};
				res.redirect('/host/'+req.params.id+'/edit');
			}
		} else{
			var tempFile = req.files.profilePhoto.tempFilePath.replace(/\\/g, '/');
			fs.unlinkSync(tempFile);

			const updateHostWithoutImg = await hostModel.updateHostWithoutImg(host);
			if (updateHostWithoutImg){
				req.session.message = {type:'success', success:'Updated successfully!'};
				res.redirect('/host/'+req.params.id);
			}
			else{
				req.session.message = {type:'error', error:'Error updating account!'};
				res.redirect('/host/'+req.params.id+'/edit');
			}
		}
	}
});

router.get('/:id/data', async (req, res) => {
	if (req.params.id == req.cookies.username) {
		const getStatRecievedBook = await bookingsModel.getStatRecievedBook(req.cookies.username);
		const getStatApprovedBook = await bookingsModel.getStatApprovedBook(req.cookies.username);
		const getStatPaidBook = await bookingsModel.getStatPaidBook(req.cookies.username);
		const getStatReview = await bookingsModel.getStatReview(req.cookies.username);
		const getStatProp = await propertyModel.getStatProp(req.cookies.username);
		const getStatEarn = await invoiceModel.getStatEarn(req.cookies.username);

		getStat = {
			recievedBook: getStatRecievedBook.book,
			approvedBook: getStatApprovedBook.book,
			paidBook: getStatPaidBook.book,
			review: getStatReview.book,
			prop: getStatProp.prop,
			earn: getStatEarn.earn
		};
		res.render("account-host", {getStat, title:'Account Data'});
	}else{
		req.session.message = {type:'error', error:'Invalid request!'};
		res.redirect('/'+ req.cookies.role + '/' + req.cookies.username + '/data');
	}
	
});

module.exports = router;