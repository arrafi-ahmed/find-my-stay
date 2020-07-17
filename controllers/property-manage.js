const express 		= require('express');
const path 			= require('path');
const sizeOf 		= require('image-size');
const fs 			= require('fs');
const router 		= express.Router();
const propertyModel	= require.main.require('./models/property-model');
var { body, validationResult } = require('express-validator');

router.get('*', (req, res, next)=>{
	if(req.cookies.username == null){
		res.redirect('/login');
	}else if(req.cookies.role == 'user'){
		req.session.message = {type:'error', error:'Access Denied!'};
		res.redirect('/home');
	}
	else{
		next();
	}
});

router.get('/', async (req, res)=>{
	const getPropertyByHostId = await propertyModel.getPropertyByHostId(req.cookies.username);
	res.render('property-manage', {propertyList:getPropertyByHostId, csrfToken:req.csrfToken(), title:'Property Manage'});
});

router.get('/add', async (req, res)=>{
	res.render('property-add', {csrfToken: req.csrfToken(), title:'Add Property'});
})
//property adding
router.post('/add', 
	[
	body('name').not().isEmpty().trim()
		.isLength({ min: 5, max:50 }).withMessage('Length must be between 5 and 50 chars long!'),
	body('address').not().isEmpty().trim().isLength({ min: 2, max:200 }).withMessage('Length must be between 2 and 200 chars long!'),
	body('city').not().isEmpty().trim().isLength({ min: 2, max:50 }).withMessage('Length must be between 2 and 50 chars long!'),
	body('country').not().isEmpty().trim().isLength({ min: 2, max:50 }).withMessage('Length must be between 2 and 50 chars long!'),
	body('description').not().isEmpty().trim()
		.isLength({ min: 50 }).withMessage('Length must be minimum 50 chars long!'),
	body('price').not().isEmpty().trim().isNumeric()
	],
	async (req, res)=>{
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	    req.session.message = {type:'errors', errors:errors.array()};
	    res.redirect('/manage-property');
	}

	//if no input validation error
	else{
		property = {
			name: req.body.name,
			address: req.body.address,
			city: req.body.city,
			country: req.body.country,
			description: req.body.description,
			price: parseInt(req.body.price),
			type: parseInt(req.body.type),
			propertyPhotos: [],
			hostId: req.cookies.username
		}
		if (req.files != null) {
			var tempFile;
			// check image size
			const validImageSize = req.files.propertyPhoto.some(photo => photo.size < 400000)
	    	if (!validImageSize) {
	    		req.session.message = {type:'error', error:'Image size must be less than 400KB'};
				res.redirect('/manage-property');
	    	}
			//check image ratio
			const promises = req.files.propertyPhoto.map(photo => new Promise(resolve => {
			    var tempFile = photo.tempFilePath.replace(/\\/g, '/');
			    const acceptedRatio = 3;
			    // get image ratio
			    sizeOf(tempFile, (err, dimensions) =>{
			    	const width = dimensions.width;
			        const height = dimensions.height;
			        const ratio = width / height;
			        if (ratio < (acceptedRatio - 0.1) || ratio > (acceptedRatio + 0.1)) {
			        	fs.unlinkSync(tempFile);
			            return resolve(false);
			        }
			        resolve(true);
			    });
			}));
			const result = await Promise.all(promises);

			// if any of the ratio is invalid, redirect
			if (result.some(ratio => ratio === false)) {
			   
			    req.session.message = {type:'error', error:'Image ratio must be 3:1 (W X H)'};
				res.redirect('/manage-property');
			} 
			// else upload
			else {
			    for(i=0; i<req.files.propertyPhoto.length; i++){
			    	const currentSec = new Date().toISOString().slice(17,22).replace('.','-');
					const name = req.cookies.username + "-" + currentSec + req.files.propertyPhoto[i].name;
					
					await req.files.propertyPhoto[i].mv("public/images/propertyPhoto/" + name, (error)=>{
						if (error) {console.log("Error uploading");
						}else{console.log("Successfully uploaded");}
					});
					property.propertyPhotos.push(name);
				}
				property.propertyPhotos = JSON.stringify(property.propertyPhotos);
				const insertProperty = await propertyModel.insertProperty(property);
				if (insertProperty) {
					req.session.message = {type:'success', success:'Property added successfully!'};
					res.redirect('/manage-property');
				}else{
					req.session.message = {type:'error', error:'Error adding property!'};
					res.redirect('/manage-property');
				}				
			}
		}
		// if no image uploaded
		else{
			req.session.message = {type:'error', error:'Property must have minimum 3 images!'};
			res.redirect('/manage-property');
		}	
	}
});

router.get('/:id/edit', async (req, res)=>{
	const getPropertyByIdHostId = await propertyModel.getPropertyByIdHostId(req.params.id, req.cookies.username);
	if (getPropertyByIdHostId) {
		req.session.validEditProperty = req.params.id;
		res.render('property-edit', {property:getPropertyByIdHostId, csrfToken: req.csrfToken(), title:'Edit Property'});
	}else{
		req.session.message = {type: 'error', error:'Invalid request!'};
		res.redirect('/manage-property');
	}	
})

//property editing
router.post('/:id/edit', 
	[
	body('name').not().isEmpty().trim()
		.isLength({ min: 5 }).withMessage('Length must be 5 chars long!'),
	body('address').not().isEmpty().trim().isLength({ min: 2 }),
	body('city').not().isEmpty().trim().isLength({ min: 2 }),
	body('country').not().isEmpty().trim().isLength({ min: 2 }),
	body('description').not().isEmpty().trim()
		.isLength({ min: 50 }).withMessage('Length must be 50 chars long!'),
	body('price').not().isEmpty().trim().isNumeric()
	],
	async (req, res)=>{

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	    req.session.message = {type:'errors', errors:errors.array()};
	    res.redirect('/manage-property/'+req.params.id+'/edit');
	}

	if (req.session.validEditProperty == req.params.id) {
		property = {
			propertyId: req.params.id,
			name: req.body.name,
			address: req.body.address,
			city: req.body.city,
			country: req.body.country,
			description: req.body.description,
			price: req.body.price,
			type: req.body.type,
			propertyPhotos: []		
		};
		// if tempfile assigned
		if (req.files != null) {
			
			const findNonZero = req.files.propertyPhoto.some(photo => photo.size != 0);
			const findZero = req.files.propertyPhoto.some(photo => photo.size == 0);
			//handling multiple image upload
			if(!findZero){
				//check image ratio
				const promises = req.files.propertyPhoto.map(photo => new Promise(resolve => {
					//if valid tempfile
					if (photo.size > 0 ) {
						const tempFile = photo.tempFilePath.replace(/\\/g, '/');
					    const acceptedRatio = 3;
					    // get image ratio
					    sizeOf(tempFile, (err, dimensions)=>{
					    	const width = dimensions.width;
					        const height = dimensions.height;
					        const ratio = width / height;
					        if (ratio < (acceptedRatio - 0.1) || ratio > (acceptedRatio + 0.1)) {
					        	fs.unlinkSync(tempFile);
					            return resolve(false);
					        }
					        resolve(true);
					    });
					}else{
						resolve(null);
					}		    
				}));
				const result = await Promise.all(promises);

				// if any of the ratio is invalid, redirect
				if (result.some(ratio => ratio === false)) {
				   
				    req.session.message = {type:'error', error:'Image ratio must be 3:1 (W X H)'};
					res.redirect('/manage-property');
				} 
				// else upload
				else{
					//add old images
					for(i=0; i<req.body.oldPhoto.length; i++){
						property.propertyPhotos.push(req.body.oldPhoto[i]);
					}
					const currentSec = new Date().toISOString().slice(17,22).replace('.','-');
					for(i=0; i<req.files.propertyPhoto.length; i++){
						//if valid temp file
						if (req.files.propertyPhoto[i].size > 0) {
							const name = req.cookies.username + "-" + currentSec + req.files.propertyPhoto[i].name;
							await req.files.propertyPhoto[i].mv("public/images/propertyPhoto/" + name, (error)=>{
								if (error) {console.log("Error uploading");
								}else{console.log("Successfully uploaded");}
							});
							property.propertyPhotos.push(name);
						}					
					}
					//update
					property.propertyPhotos = JSON.stringify(property.propertyPhotos);
					const updateProperty = await propertyModel.updateProperty(property);
					if (updateProperty) {
						req.session.message = {type:'success', success:'Property updated Successfully!'};
						res.redirect('/manage-property');
					}else{
						req.session.message = {type:'error', error:'Error updating property!'};
						res.redirect('/property/'+req.params.id+'/edit');
					}
				}	
			}
			// handling single image upload
			else if(findZero && findNonZero){
				req.session.message = {type:'error', error:'Upload minimum 3 images!'};
				res.redirect('/manage-property/'+req.params.id+'/edit');		
			}
			// handling zero upload when 2 uploads left
			else if(!findNonZero){
				const updatePropertyWithoutImg = await propertyModel.updatePropertyWithoutImg(property);
				if (updatePropertyWithoutImg) {
					req.session.message = {type:'success', success:'Property updated Successfully!'};
					res.redirect('/manage-property');
				}else{
					req.session.message = {type:'error', error:'Error updating property!'};
					res.redirect('/manage-property/'+req.params.id+'/edit');
				}
			}	
		}
		// if tempfile not assigned or handling zero upload when all uploaded
		else{
			const updatePropertyWithoutImg = await propertyModel.updatePropertyWithoutImg(property);
			if (updatePropertyWithoutImg) {
				req.session.message = {type:'success', success:'Property updated Successfully!'};
				res.redirect('/manage-property');
			}else{
				req.session.message = {type:'error', error:'Error updating property!'};
				res.redirect('/manage-property/'+req.params.id+'/edit');
			}	
		}
	} else{
		req.session.message = {type: 'error', error:'Invalid request!'};
		res.redirect('/manage-property');
	}	
});

// promote
router.post('/:id', async (req, res)=>{
	if (req.body.delete) {
		const getPropertyById = await propertyModel.getPropertyById(req.params.id);
		if (getPropertyById.host_id == req.cookies.username) {
			const deleteProperty = await propertyModel.deleteProperty(req.params.id);
			req.session.message = {type: 'success', success:'Property deleted successfully!'};
		}else{
			req.session.message = {type: 'error', error:'Error deleting property!'};
		}		
		res.redirect('/manage-property');
	}
	else if (req.body.promote) {
		var setPromoteStatus;
		const getPromoteStatus = await propertyModel.getPromoteStatus();
		if (getPromoteStatus) {
			const setPromoteStatusNull = await propertyModel.setPromoteStatusNull(getPromoteStatus.id);
			setPromoteStatus = await propertyModel.setPromoteStatus(req.params.id);												
		}else{
			const setPromoteStatus = await propertyModel.setPromoteStatus(req.params.id);			
		}
		if (setPromoteStatus) {
			req.session.message = {type: 'success', success:'Property featured successfully!'};
		}else{
			req.session.message = {type: 'error', error:'Error promoting property!'};
		}
		res.redirect('/manage-property');
	}
});

module.exports = router;