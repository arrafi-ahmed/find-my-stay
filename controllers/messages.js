const express 		= require('express');
const router 		= express.Router();
const messagesModel	= require.main.require('./models/messages-model');
const invoiceModel	= require.main.require('./models/invoice-model');
const hostModel		= require.main.require('./models/host-model');
const userModel		= require.main.require('./models/user-model');
var { body, validationResult } = require('express-validator');

router.get('*', (req, res, next)=>{
	if(req.cookies.username == null){
		res.redirect('/login');
	}else{
		next();
	}
});

router.get('/', async (req, res)=>{
	const getRecentContacts = await messagesModel.getRecentContacts(req.cookies.username);
	res.render('messages', {contacts:getRecentContacts, csrfToken:req.csrfToken(), title:'Messages'});
});

router.post('/', 
	[
	body('receiver').not().isEmpty().trim(),
	body('content').not().isEmpty().trim()
	],
	async (req, res)=>{

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	    req.session.message = {type:'errors', errors:errors.array()};
	    res.redirect('/messages');
	}
	//check if receiver id exists
	var validReceiver = null;
	if (req.cookies.role == 'user') {
		validReceiver = await hostModel.findHostById(req.body.receiver);
	}else{
		validReceiver = await userModel.findUserById(req.body.receiver);
	}
	//if exists then send message
	if (validReceiver) {
		message = {
			receiver: req.body.receiver,
			content: req.body.content,
			sender: req.cookies.username,
			isInvoice: null
		}
		const sendMessage = await messagesModel.sendMessage(message);
		if (sendMessage) {
			req.session.message = {type: 'success', success:'Message sent succesfully!'};
		}else{
			req.session.message = {type: 'error', error:'Message sending failed!'};
		}
		res.redirect('/messages');
	}else{
		req.session.message = {type: 'error', error:'Invalid receiver!'};
		res.redirect('/messages');
	}
});

router.get('/:id', async (req, res)=>{
	//check for id validity first time link visited
	if (req.session.validReceiver == null || req.session.validReceiver != req.params.id) {
		if (req.cookies.role == 'user') {
			validReceiver = await hostModel.getHostById(req.params.id);
		}else{
			validReceiver = await userModel.getUserById(req.params.id);
		}
		if(validReceiver){
			req.session.validReceiver = validReceiver.id;	
		} 			
	}
	if (req.session.validReceiver == req.params.id) {
		const getMessageById = await messagesModel.getMessageById(req.cookies.username, req.params.id);	
		res.render('messages', {messages:getMessageById, paramsId:req.params.id, csrfToken:req.csrfToken(), title:'Messages'});
	}else{
		req.session.message = {type: 'error', error:'Invalid request!'};
		res.redirect('/messages');
	}
});

router.post('/:id', 
	[
	body('content').not().isEmpty().trim()
	],
	async (req, res)=>{

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	    req.session.message = {type:'errors', errors:errors.array()};
	    res.redirect('/messages');
	}
	//check if receiver id exists
	if (req.session.validReceiver == req.params.id) {
		message = {
			receiver: req.params.id,
			content: req.body.content,
			sender: req.cookies.username,
			isInvoice: null
		}
		const sendMessage = await messagesModel.sendMessage(message);
		res.redirect('/messages/' + req.params.id);
	}else{
		req.session.message = {type: 'error', error:'Invalid receiver!'};
		res.redirect('/messages');
	}
});

router.get('/:message/invoice', async (req, res)=>{
	//check for message validity
	checkInvoice = await messagesModel.checkInvoice(req.params.message, req.cookies.username);
	if (checkInvoice) {
		checkInvoice = JSON.parse(checkInvoice.content);
		getInvoiceByBookId = await invoiceModel.getInvoiceByBookId(checkInvoice.bookId);
		checkInvoice.invoiceId = getInvoiceByBookId.id;
		res.render('invoice', {invoice:checkInvoice, csrfToken:req.csrfToken(), title:'Invoice'});
	}else{
		req.session.message = {type: 'error', error:'Invalid request!'};
		res.redirect('/messages');
	}
});

module.exports = router;