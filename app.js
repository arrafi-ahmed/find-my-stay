//declaration
const port 			= process.env.PORT || 3000;
const express 		= require('express');
const path 			= require('path');
const bodyParser 	= require('body-parser');
const ejs 			= require('ejs');
const cookieParser 	= require('cookie-parser');
const session 		= require('cookie-session');
const fileUpload 	= require('express-fileupload');
const expressLayouts= require('express-ejs-layouts');
const csurf 		= require('csurf');

const hostModel		= require('./models/host-model');
const bookingsModel	= require('./models/bookings-model');
const reviewModel	= require('./models/review-model');
const invoiceModel	= require('./models/invoice-model');
const messagesModel	= require('./models/messages-model');
const propertyModel	= require('./models/property-model');

const register 		= require('./controllers/register');
const login 		= require('./controllers/login');
const index 		= require('./controllers/index');
const propertyManage= require('./controllers/property-manage');
const propertySingle= require('./controllers/property-single');
const search 		= require('./controllers/search');
const messages 		= require('./controllers/messages');
const bookingsManage= require('./controllers/bookings-manage');
const bookingsRecent= require('./controllers/bookings-recent');
const booking		= require('./controllers/booking');
const accountUser 	= require('./controllers/account-user');
const accountHost 	= require('./controllers/account-host');
const logout 		= require('./controllers/logout');

const app = express();

//configuration
app.set('view engine', 'ejs');
app.set('layout', 'partials/master');
// app.set('trust proxy', 1)

//middlewares
app.locals.siteName = 'FindMyStay';
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({name: 'session', keys: ['dGse349@4iB!k34', 'jsfWd346Gdl$!fl6']}));
app.use(fileUpload({useTempFiles:true, tempFileDir:path.join('public', 'images', 'tmp')}));
app.use(expressLayouts);
app.use(csurf());

app.use((req, res, next) => {
	res.locals.baseUrl = req.protocol + '://' + req.get('host');
	res.locals.currentUrl = res.locals.baseUrl + req.originalUrl;
	res.locals.path = req.path;
    res.locals.username = req.cookies.username != null ? req.cookies.username : null;
	res.locals.role = req.cookies.role != null ? req.cookies.role : null;
	res.locals.name = req.cookies.name != null ? decodeURI(req.cookies.name) : null;
	res.locals.photo = req.cookies.photo != null ? decodeURI(req.cookies.photo) : null;
	res.locals.message = req.session.message;
	req.session.message = null;
	next();
});

// csurf custom error page
app.use((err, req, res, next)=>{
	if (err.code !== 'EBADCSRFTOKEN') return next(err)
	// handle CSRF token errors here
	res.status(403)
	res.send('Unfornately request tampered, Go <a href="/">Home</a>')
})

app.use('/', index);
app.use('/home', index);
app.use('/register', register);
app.use('/login', login);
app.use('/property', propertySingle);
app.use('/manage-property', propertyManage);
app.use('/search', search);
app.use('/messages', messages);
app.use('/booking', booking);
app.use('/manage-bookings', bookingsManage);
app.use('/recent-bookings', bookingsRecent);
app.use('/user', accountUser);
app.use('/host', accountHost);
app.use('/logout', logout);

app.get('/subscribe', (req, res)=>{
	console.log(req.query.subscribeEmail);
	req.session.message = {type:'success', success:'Email subscribed!'};
	res.redirect('/');
});

//server startup
app.listen(port, ()=>{
	console.log('server started at ' + port);
});