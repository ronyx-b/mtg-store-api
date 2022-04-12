const express = require('express'); // create express server
const app = express();
const cors = require('cors'); // load cors package
const dotenv = require('dotenv'); // ENV variables
dotenv.config();
const jwt = require('jsonwebtoken'); // JWT and Passport
const passport = require('passport');
const passportJWT = require('passport-jwt');
const multer = require('multer'); // Multer (Multipart Form Processing)
const fs = require('fs'); // File System -> For image deletion

const dataService = require('./data-service.js')

const HTTP_PORT = process.env.PORT || 8080;

/* configure middleware: express built-in body parser, cors */
app.use(express.json());
app.use(cors());

/* ****************************** JWT Configuration ****************************** */
// JSON Web Token Setup
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

// Configure its options
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');

jwtOptions.secretOrKey = process.env.JWT_SECRET;

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  // console.log('payload received', jwt_payload);

  if (jwt_payload) {
    next(null, {
      _id: jwt_payload._id,
      email: jwt_payload.email,
      isAdmin: jwt_payload.isAdmin
    });
  } else {
    next(null, false);
  }
});

// tell passport to use our "strategy"
passport.use(strategy);

// add passport as application-level middleware
app.use(passport.initialize());

// Admin authorization middleware
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({message: 'Access denied'});
  }
  next();
};

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "./img/",
  filename: function (req, file, cb) { cb(null, file.originalname); }
});
const upload = multer({ storage: storage });

/* ****************************** Server Routes ****************************** */
// Use React build
// app.use('/', express.static('build'));

// Images access route
app.use('/img', express.static('img'));

app.get('/', (req, res) => {
  res.send('Access API through /api route');
});

// API Entry point
app.get('/api', async (req, res) => {
  try {
    let msg = await dataService.listening();
    res.json({message: `API Listening, Data service: ${msg}`});
  } catch (err) {
    res.json({message: `there was an error: ${err}`});
  }
});

// Get all products
app.get('/api/products/', async (req, res) => {
  try {
    let products = await dataService.getAllProducts();
    res.json({products});
  } catch (err) {
    res.json({message: `there was an error: ${err}`});
  }
});

// Add new Product
app.post('/api/products', passport.authenticate('jwt', { session: false }), isAdmin, upload.single('image'), async (req, res) => {
  let formData = req.body;
  formData.image = (req.file)? req.file.originalname : "";
  try {
    await dataService.addProduct(formData);
    res.json({success: true, message: "form processed"});
  } catch (err) {
    res.json({success: false, message: `Error: ${err}`})
  }
});

// Register new user
app.post('/api/users', async (req, res) => {
  try {
    let formData = req.body;
    await dataService.registerUser(formData);
    res.json({success: true, message: 'new user registered'});
  } catch (err) {
    res.json({success: false, message: `Error: ${err}`})
  }
});

// Login user - POST /api/user/login
app.post('/api/user/login', async (req, res) => {
  try {
    let user = await dataService.login(req.body);
    let tokenPayload = {
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin
    };
    let expiresIn = (req.body.keeplogged)?{}:{expiresIn: '24h'};
    let token = jwt.sign(tokenPayload, jwtOptions.secretOrKey, expiresIn);
    res.json({message: "login successful", token: token})
  } catch (err) {
    res.status(422).json({message: err});
  }
});

// Check if user is admin
app.post('/api/user/isAdmin', passport.authenticate('jwt', { session: false }), isAdmin, (req, res) => {
  res.json({isAdmin: true});
});

// User Account
app.get('/api/user/account', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({message: 'user authenticated'});
});

// Start server
dataService.connect().then(() => {
  app.listen(HTTP_PORT, () => { console.log(`app listening on: ${HTTP_PORT}`); });
}).catch((err) => {
  console.log(`unable to start the server: ${err}`);
  process.exit();
});
