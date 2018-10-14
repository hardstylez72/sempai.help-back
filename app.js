const
    createError = require('http-errors'),
	express = require('express'),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	init = require('./init'),
	app = require('./index').app,
	indexRouter = require('./routes/index'),
	usersRouter = require('./routes/users'),
	musicStream = require('./routes/musicStream'),
	imgUpload = require('./routes/imgUpload'),
	music = require('./routes/music'),
	addlink = require('./routes/addlink'),
	uuidv1 = require('uuid/v1'),
    login = require('./routes/login'),
    authHandler = require('./middleWare/auth').authHandler,
	favorite = require('./routes/favorite');

const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:3000/',
    credentials: true,

}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(authHandler());

// app.use((err, req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// var options = {
//     dotfiles: 'ignore',
//     etag: false,
//     extensions: ['htm', 'html'],
//     index: false,
//     maxAge: '1d',
//     redirect: false,
//     setHeaders: function (res, path, stat) {
//         res.set('x-timestamp', Date.now());
//     }
// }



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/imgUpload', imgUpload);
app.use('/addlink', addlink);
app.use('/radio', musicStream);
app.use('/music', music);
app.use('/login', login);
app.use('/track', favorite);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
