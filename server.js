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
  res.status(200).send('Access API through /api route');
});

// API Entry point
app.get('/api', async (req, res) => {
  try {
    let msg = await dataService.listening();
    res.status(200).json({message: `API Listening, Data service: ${msg}`});
  } catch (err) {
    res.status(422).json({message: `there was an error: ${err}`});
  }
});

// Get all products
app.get('/api/products/', async (req, res) => {
  try {
    let products = await dataService.getAllProducts();
    res.status(200).json({products});
  } catch (err) {
    res.status(422).json({message: `there was an error: ${err}`});
  }
});

// Get a collection of products
app.post('/api/products/collection', async (req, res) => {
  // getProductsCollection
  let productsIds = req.body.products;
  try {
    let products = await dataService.getProductsCollection(productsIds);
    res.status(200).json({products});
  } catch (err) {
    res.status(422).json({message: `there was an error: ${err}`});
  }
});

// app.get('/api/products/set/:set', async (req, res) => {
//   let set = req.params.set;
//   try {
//     let products = await dataService;
//     res.status(200).json({products});
//   } catch (err) {
//     res.status(422).json({message: `there was an error: ${err}`});
//   }
// });

// Get a single product
app.get('/api/products/:id', async (req, res) => {
  let productId = req.params.id;
  try {
    let product = await dataService.getProductById(productId);
    res.status(200).json({product});
  } catch (err) {
    res.status(422).json({message: `there was an error: ${err}`});
  }
});

// Add new Product
app.post('/api/products', passport.authenticate('jwt', { session: false }), isAdmin, upload.single('image'), async (req, res) => {
  let formData = req.body;
  formData.image = (req.file)? req.file.originalname : "";
  try {
    await dataService.addProduct(formData);
    res.status(201).json({success: true, message: "form processed"});
  } catch (err) {
    res.status(422).json({success: false, message: `Error: ${err}`})
  }
});

// Edit a Product
app.put('/api/products/:id', passport.authenticate('jwt', { session: false }), isAdmin, upload.single('image'), async (req, res) => {
  let formData = req.body;
  let id = req.params.id;
  if (req.file) {
    formData.image = req.file.originalname;
  } 
  try {
    await dataService.editProduct(formData, id);
    res.status(201).json({success: true, message: "form processed"});
  } catch (err) {
    res.status(422).json({success: false, message: `Error: ${err}`})
  }
});

// Register new user
app.post('/api/users', async (req, res) => {
  try {
    let formData = req.body;
    await dataService.registerUser(formData);
    res.status(201).json({success: true, message: 'new user registered'});
  } catch (err) {
    res.status(422).json({success: false, message: `Error: ${err}`})
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
    res.status(201).json({message: "login successful", token: token})
  } catch (err) {
    res.status(422).json({message: err});
  }
});

// Check if user is logged in
app.post('/api/user/account', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json({message: 'user authenticated'});
});

// Check if user is admin
app.post('/api/user/isAdmin', passport.authenticate('jwt', { session: false }), isAdmin, (req, res) => {
  res.status(200).json({isAdmin: true});
});

// Get Featured sets
app.get('/api/sets', async (req, res) => {
  try {
    let sets = await dataService.getFeaturedSets();
    res.status(200).json({sets});
  } catch (err) {
    res.status(422).json({message: `there was an error: ${err}`});
  }
});

// Add Featured set
app.post('/api/sets', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
  let data = req.body;
  try {
    await dataService.addFeaturedSet(data);
    res.status(201).json({success: true, message: "form processed"});
  } catch (err) {
    res.status(422).json({success: false, message: `Error: ${err}`})
  }
});

// Start server
dataService.connect().then(() => {
  app.listen(HTTP_PORT, () => { console.log(`app listening on: ${HTTP_PORT}`); });
}).catch((err) => {
  console.log(`unable to start the server: ${err}`);
  process.exit();
});
