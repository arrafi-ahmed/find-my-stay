const express 		= require('express');
const path 			= require('path');
const router 		= express.Router();
const userModel		= require.main.require('./models/user-model');
const reviewModel 	= require.main.require('./models/review-model');
var { check, validationResult } = require('express-validator');

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

//if req.cookies.username, link privately accessable; if req.params.id, publicly accessable; 
router.get('/:id', async (req, res) => {
	if (req.params.id == req.cookies.username) {
		const getRoleById = await userModel.getUserById(req.params.id);
		res.render("account-user", {profile:getRoleById, title:'Profile'});
	}else{
		req.session.message = {type:'error', error:'Invalid request!'};
		res.redirect('/'+ req.cookies.role + '/' + req.cookies.username);
	}		
});

router.get('/:id/edit', async (req, res) => {
	if (req.params.id == req.cookies.username) {
		const getUserById = await userModel.getUserById(req.cookies.username);
		res.render("account-user", {profileEdit:getUserById, csrfToken:req.csrfToken(), title:'Edit Profile'}); 
	}else{
		req.session.message = {type:'error', error:'Invalid request!'};
		res.redirect('/'+ req.cookies.role + '/' + req.cookies.username +'/edit');
	}	
});

router.post('/:id/edit', 
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
	async (req, res) => {

	const errors = await validationResult(req);
	//input validation
	if (!errors.isEmpty()) {
		req.session.message = {type:'errors', errors:errors.array()};
		res.redirect('/user/'+req.params.id+'/edit');
	}else{
		user = {
			id: 			req.cookies.username,
			password: 		req.body.password,
			firstName: 		req.body.firstName,
			lastName: 		req.body.lastName,
			email: 			req.body.email,
			phone: 			req.body.phone,
			dob: 			req.body.dob,
			gender: 		req.body.gender,
			address:  		req.body.address,
			city:   		req.body.city,
			country:  		req.body.country,
			profilePhoto:  	null
		};
		if (req.files.profilePhoto.size != 0) {
			if (req.body.oldPhoto == "defaultProfile.jpg") {
				name = req.body.id + path.extname(req.files.profilePhoto.name);
				res.cookie('photo', name);
			}else{
				name = req.body.oldPhoto;
			}
			req.files.profilePhoto.mv('public/images/profilePhoto/user/'+name, (error)=>{
				if (error) {console.log("Error uploading");
				}else {console.log("Successfully uploaded");}
			});

			user.profilePhoto = name;
			const updateUser = await userModel.updateUser(user);
			if (updateUser){
				req.session.message = {type:'success', success:'Updated successfully!'};
				res.redirect('/user/'+req.params.id);
			}
			else{
				req.session.message = {type:'error', error:'Error updating account!'};
				res.redirect('/user/'+req.params.id+'/edit');
			}
		}else{
			const updateUserWithoutImg = await userModel.updateUserWithoutImg(user);
			if (updateUserWithoutImg){
				req.session.message = {type:'success', success:'Updated successfully!'};
				res.redirect('/user/'+req.params.id);
			}
			else{
				req.session.message = {type:'error', error:'Error updating account!'};
				res.redirect('/user/'+req.params.id+'/edit');
			}
		}
	}
});

router.get('/:id/reviews', async (req, res) => {
	if (req.params.id == req.cookies.username) {
		const getReviewsByUser = await reviewModel.getReviewsByUser(req.cookies.username);
		res.render("account-user", {reviews:getReviewsByUser, title:'My Reviews'}); 
	}else{
		req.session.message = {type:'error', error:'Invalid request!'};
		res.redirect('/'+ req.cookies.role + '/' + req.cookies.username + '/reviews');
	}	
});

module.exports = router;