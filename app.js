var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var admin = require('firebase-admin');
var serviceAccount = require('./apportateen-firebase-admin.json');
var auth = require('basic-auth')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sponsorsRouter = require('./routes/sponsors');
var sedesRouter = require('./routes/sedes');
var guardiansRouter = require('./routes/guardians');
var avisosRouter = require('./routes/avisos');
var talleresRouter = require('./routes/talleres');
var categoriasRouter = require('./routes/categorias');
var convocatoriasRouter = require('./routes/convocatorias');
var archivosRouter = require('./routes/archivos');
var adminsRouter = require('./routes/admins');
var inscripcionesRouter = require('./routes/inscripciones')
var responsablesRouter = require('./routes/responsables')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");  
  // res.header("Access-Control-Allow-Origin", "https://apportateen.mx");  
  res.header("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE, CONNECT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  var user = auth(req)
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else if (user && user.name === 'admin' && user.pass === 'admin-password') {
    next();
  } else {
res.set({
  'WWW-Authenticate': 'Basic'
}).send(401);  }

})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sponsors', sponsorsRouter);
app.use('/sedes', sedesRouter);
app.use('/guardians', guardiansRouter);
app.use('/avisos', avisosRouter);
app.use('/talleres', talleresRouter);
app.use('/categorias', categoriasRouter);
app.use('/convocatorias', convocatoriasRouter);
app.use('/archivos', archivosRouter);
app.use('/admins', adminsRouter);
app.use('/inscripciones', inscripcionesRouter);
app.use('/responsable', responsablesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.log(req.app.get('env'));
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// initialize firebase admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://apportateen.firebaseio.com"
});

module.exports = app;
