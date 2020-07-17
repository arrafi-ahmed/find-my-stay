const express = require('express');
const router  = express.Router();

router.get('/', (req, res)=>{
	res.clearCookie('username');
	res.clearCookie('role');
	res.clearCookie('name');
	res.clearCookie('photo');

	req.session = null;
	res.redirect('/login');
});

module.exports = router;