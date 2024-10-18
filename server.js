const express = require('express'); // create express server
const app = express();
const cors = require('cors'); // load cors package
const dotenv = require('dotenv'); // ENV variables
dotenv.config();

const multer = require('multer'); // Multer (Multipart Form Processing)

const userRouter = require("./routers/user-router");
const productsRouter = require('./routers/products-router');
const setsRouter = require('./routers/sets-router');

const HTTP_PORT = process.env.PORT || 3000;

/* configure middleware: express built-in body parser, cors */
app.use(express.json());
app.use(cors());

// Multer Storage Configuration
const productStorage = multer.diskStorage({
  destination: "./img/",
  filename: function (req, file, cb) { cb(null, file.originalname); }
});
const uploadProduct = multer({ storage: productStorage });

const heroStorage = multer.diskStorage({
  destination: "./img/hero/",
  filename: function (req, file, cb) { cb(null, file.originalname); }
});
const uploadHero = multer({ storage: heroStorage });

/* ****************************** Server Routes ****************************** */
// Use React build
// app.use('/', express.static('build'));

// Images access route
app.use('/img', express.static(__dirname + '/img'));

app.get('/', (req, res) => {
  res.status(200).send('Access API through /api route');
});

// API Entry point
app.get('/api', async (req, res) => {
  try {
    res.status(200).json({message: `API ready`});
  } catch (err) {
    res.status(422).json({message: `there was an error: ${err}`});
  }
});

app.use("/api/user", userRouter);
app.use("/api/products", productsRouter);
app.use("/api/sets", setsRouter);

// Start server
if(require.main === module){
  app.listen(HTTP_PORT, async () => { 
    console.log(`app listening on: ${HTTP_PORT}`); 
  });
}

module.exports = app;