const express = require('express'); // create express server
const app = express();
const cors = require('cors'); // load cors package

const dataService = require('./data-service.js')

/* configure middleware: express built-in body parser, cors */
app.use(express.json());
app.use(cors());

const HTTP_PORT = process.env.PORT || 8080;

app.use('/', express.static('build'));

app.use('/img', express.static('img'));

app.get('/api', async (req, res) => {
  try {
    let msg = await dataService.listening();
  res.json({message: `API Listening, Data service: ${msg}`});
  } catch (err) {
  res.json({message: `there was an error: ${err}`});
  }
});

app.get('/api/add-prod', async (req, res) => {
  let data = {
    name: 'Kamigawa: Neon Dynasty - Bundle',
    description: 'Each Kamigawa: Neon Dynasty Bundle contains 8 Kamigawa: Neon Dynasty Set Boosters, 20 foil lands, 20 nonfoil lands, 1 foil promo card, and 1 20-sided die.',
    cardSet: 'Kamigawa: Neon Dynasty',
    price: '39.99',
    stock: '10',
    image: 'kamigawa-neon-dynasty-bundle-52665.jpg'
  };
  try {
    await dataService.addProduct(data);
    res.json({message: 'product added'});
  } catch (err) {
    res.json({message: err});
  }
});

app.get('/api/products/', async (req, res) => {
  try {
    let products = await dataService.getAllProducts();
    res.json({products});
  } catch (err) {
    res.json({message: `there was an error: ${err}`});
  }
});

dataService.connect().then(() => {
  app.listen(HTTP_PORT, () => { console.log(`app listening on: ${HTTP_PORT}`); });
}).catch((err) => {
  console.log(`unable to start the server: ${err}`);
  process.exit();
});
