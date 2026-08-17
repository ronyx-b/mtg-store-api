# MTG Store API

RESTful backend API for the **MTG Store** e-commerce application.

This service provides the backend functionality for the [MTG Store frontend](https://github.com/ronyx-b/mtg-store-app), including user authentication, product management, Magic: The Gathering set information, orders, and image management.

The API is built with **Node.js and Express**, uses **MongoDB** for persistent data storage through **Mongoose**, and integrates with **Cloudinary** for product and set imagery.

**Live API:** https://mtg-store-api.vercel.app/

**Frontend:** https://github.com/ronyx-b/mtg-store-app

**Repository:** https://github.com/ronyx-b/mtg-store-api

---

## Features

### 👤 User Management

* User registration and authentication
* JWT-based authentication
* Password hashing with bcrypt
* User account information
* User address management
* Default address management
* Authentication middleware
* Administrator role support

Authenticated requests use JWTs supplied through the request's `Authorization` header. The backend uses Passport and `passport-jwt` to validate tokens.

### 🛍️ Product Management

* Retrieve products
* Paginated product listing
* Retrieve product collections
* Create products
* Product inventory/stock information
* Product categories
* Product images
* Cloudinary image uploads

The product API supports pagination through `pageNum` and `pageSize` query parameters. Product creation accepts multipart form data and uploads the associated image to Cloudinary.

### 📦 Orders

The backend maintains order information associated with users, including:

* Order number
* Order date
* Customer
* Shipping address
* Products purchased
* Product quantities
* Product prices

Order functionality is implemented through the data-service layer and exposed through the authenticated user routes.

### 🃏 Magic: The Gathering Sets

The API provides functionality for featured Magic: The Gathering sets.

Features include:

* Retrieve featured sets
* Pagination
* Retrieve an individual set by set code
* Create featured sets
* Set release dates
* Scryfall set IDs
* Set hero images
* Featured-set status

Set hero images are uploaded to Cloudinary.

### 🖼️ Image Management

Product and set images are uploaded through the API and stored using **Cloudinary**.

The backend uses `multer` to process uploaded files and Cloudinary to store the resulting images.

---

## Technology Stack

| Technology                                                        | Purpose                       |
| ----------------------------------------------------------------- | ----------------------------- |
| [Node.js](https://nodejs.org/)                                    | JavaScript runtime            |
| [Express](https://expressjs.com/)                                 | REST API framework            |
| [MongoDB](https://www.mongodb.com/)                               | Database                      |
| [Mongoose](https://mongoosejs.com/)                               | MongoDB ODM                   |
| [Passport](https://www.passportjs.org/)                           | Authentication middleware     |
| [Passport JWT](https://www.passportjs.org/packages/passport-jwt/) | JWT authentication strategy   |
| [JSON Web Token](https://github.com/auth0/node-jsonwebtoken)      | Authentication tokens         |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js)              | Password hashing              |
| [Cloudinary](https://cloudinary.com/)                             | Image storage and delivery    |
| [Multer](https://github.com/expressjs/multer)                     | Multipart file uploads        |
| [CORS](https://github.com/expressjs/cors)                         | Cross-origin resource sharing |
| [log4js](https://log4js-node.github.io/log4js-node/)              | Application logging           |

The current project is version `2.0.0` and uses Express 5, Mongoose 8, bcrypt 6, JWT 9, and the other dependencies defined in `package.json`.

---

## Architecture

The API follows a layered architecture separating HTTP routing from application/data access logic.

```text
                    ┌──────────────────────┐
                    │     MTG Store UI     │
                    │   Next.js / React    │
                    └──────────┬───────────┘
                               │
                         HTTP / JSON
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Express API     │
                    │      server.js       │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │   User     │   │  Products  │   │   Sets     │
       │   Router   │   │   Router   │   │   Router   │
       └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
             │                │                │
             └────────────────┼────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │    Data Services     │
                    │                      │
                    │ User Controller      │
                    │ Products Controller  │
                    │ Orders Controller    │
                    │ Sets Controller      │
                    └──────────┬───────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
                     ▼                   ▼
              ┌─────────────┐     ┌─────────────┐
              │   MongoDB   │     │  Cloudinary │
              │  + Mongoose │     │    Images   │
              └─────────────┘     └─────────────┘
```

The Express application mounts the API under three primary route groups:

```text
/api/user
/api/products
/api/sets
```

and exposes `/api` as an API health/readiness endpoint.

---

## Project Structure

```text
mtg-store-api/
│
├── data-service/
│   ├── index.js
│   ├── ordersController.js
│   ├── productsController.js
│   ├── setsController.js
│   └── userController.js
│
├── routers/
│   ├── products-router.js
│   ├── sets-router.js
│   └── user-router.js
│
├── utils/
│   ├── fileUploadUtils.js
│   └── jwtPassportUtils.js
│
├── server.js
├── package.json
├── package-lock.json
├── vercel.json
└── .gitignore
```

### `server.js`

The main Express application.

It is responsible for:

* Creating the Express application
* Configuring JSON parsing
* Configuring CORS
* Registering API routers
* Providing API health/status responses
* Handling unknown routes
* Starting the HTTP server

The application listens on `process.env.PORT`, falling back to port `3000`.

### `routers/`

Contains the HTTP API routes.

```text
user-router.js
products-router.js
sets-router.js
```

The routers are responsible for receiving HTTP requests, validating/processing request data, invoking the appropriate controller, and returning HTTP responses.

### `data-service/`

Contains the application's database/data-access logic.

```text
index.js
userController.js
productsController.js
ordersController.js
setsController.js
```

`index.js` defines the Mongoose schemas and manages the MongoDB connection.

### `utils/`

Contains reusable infrastructure utilities.

```text
jwtPassportUtils.js
fileUploadUtils.js
```

The JWT utility configures Passport's JWT strategy and provides token signing/authentication middleware.

---

## Database

The application uses **MongoDB** through **Mongoose**.

The database connection is configured through:

```text
MONGODB_CONN_STR
```

The backend establishes the connection using:

```javascript
mongoose.createConnection(process.env.MONGODB_CONN_STR)
```

The application defines four primary MongoDB models:

```text
users
products
orders
featuredSets
```

### User

Stores:

* Email
* Name
* Phone
* Addresses
* Default address
* Password hash
* Administrator status

### Product

Stores:

* Name
* Product type
* Description
* Card set
* Price
* Stock
* Cloudinary image identifier

### Order

Stores:

* User ID
* Order date
* Order number
* Shipping address
* Purchased products
* Quantities
* Prices

### Featured Set

Stores:

* Set name
* Set code
* Release date
* Scryfall ID
* Cloudinary hero image
* Featured status

---

## API

All API endpoints are rooted at:

```text
/api
```

### Health Check

```http
GET /api
```

Returns:

```json
{
  "message": "API ready"
}
```

### Users

Base route:

```text
/api/user
```

User routes include authenticated account operations, authentication, addresses, and order-related functionality.

JWT authentication is applied to protected user operations using Passport JWT.

### Products

Base route:

```text
/api/products
```

#### Get Products

```http
GET /api/products
```

Optional query parameters:

```text
pageNum
pageSize
```

Example:

```http
GET /api/products?pageNum=1&pageSize=20
```

Response structure:

```json
{
  "productList": [],
  "count": 0,
  "pageNum": 1,
  "pageSize": 20
}
```

#### Get Product Collection

```http
POST /api/products/collection
```

Example request:

```json
{
  "productIdList": [
    "product-id-1",
    "product-id-2"
  ]
}
```

#### Create Product

```http
POST /api/products
```

Product creation accepts multipart form data and an image upload. The uploaded image is stored in Cloudinary and its public identifier is associated with the product.

### Sets

Base route:

```text
/api/sets
```

#### Get Featured Sets

```http
GET /api/sets
```

Optional query parameters:

```text
pageNum
pageSize
```

#### Get Set

```http
GET /api/sets/:code
```

Example:

```http
GET /api/sets/fin
```

#### Create Featured Set

```http
POST /api/sets
```

The request accepts set metadata and a hero image. The image is uploaded to Cloudinary.

---

## Authentication

Authentication uses **JSON Web Tokens (JWT)**.

The backend uses:

* `jsonwebtoken` to create signed tokens
* `passport` for authentication middleware
* `passport-jwt` to validate incoming tokens
* `JWT_SECRET` as the signing/verification secret

### Token Header

Protected endpoints expect a JWT in the `Authorization` header using the `jwt` scheme:

```http
Authorization: jwt <token>
```

The Passport strategy extracts the token using `ExtractJwt.fromAuthHeaderWithScheme("jwt")`.

### Token Payload

The token contains information such as:

```json
{
  "_id": "user-id",
  "email": "user@example.com",
  "isAdmin": false
}
```

The default token expiration configured by the application is **24 hours**.

---

## Environment Variables

Create a `.env` file for local development or configure the variables through the deployment environment.

```env
MONGODB_CONN_STR=<mongodb-connection-string>
JWT_SECRET=<strong-random-secret>

CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
```

The exact Cloudinary variables should match the configuration expected by `fileUploadUtils.js`.

### Security

Never commit environment files containing:

* MongoDB credentials
* JWT secrets
* Cloudinary API secrets
* Other private credentials

Add local environment files to `.gitignore`.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/ronyx-b/mtg-store-api.git
cd mtg-store-api
```

Install dependencies:

```bash
npm install
```

Configure the required environment variables.

Then start the API:

```bash
node server.js
```

The application will listen on:

```text
http://localhost:3000
```

unless another port is supplied through the `PORT` environment variable.

---

## Frontend Integration

This API is designed to work with the companion MTG Store frontend:

**https://github.com/ronyx-b/mtg-store-app**

The frontend communicates with this service through HTTP requests.

```text
┌─────────────────────────┐
│      MTG Store UI       │
│   Next.js + React       │
└────────────┬────────────┘
             │
             │ HTTP / JSON
             │
             ▼
┌─────────────────────────┐
│      MTG Store API      │
│   Node.js + Express     │
└────────────┬────────────┘
             │
       ┌─────┴──────┐
       │            │
       ▼            ▼
   MongoDB       Cloudinary
```

This separation allows the frontend and backend to be deployed independently.

---

## Deployment

The API is configured for deployment on **Vercel** and is currently available at:

**https://mtg-store-api.vercel.app/**

The repository contains a `vercel.json` configuration file for deployment.

For deployment:

1. Import the repository into Vercel.
2. Configure the required environment variables.
3. Deploy the application.
4. Verify the `/api` endpoint.
5. Verify MongoDB connectivity.
6. Verify Cloudinary image uploads.
7. Configure the frontend to use the deployed API URL.

---

## Error Handling

The API uses standard HTTP status codes to indicate the result of requests.

Common responses include:

| Status | Meaning                        |
| -----: | ------------------------------ |
|  `200` | Request completed successfully |
|  `201` | Resource created successfully  |
|  `404` | Endpoint/resource not found    |
|  `422` | Request could not be processed |

The Express application also provides a catch-all `404` response for unknown routes.

---

## Logging

Application logging is provided through **log4js**.

The data service uses logging for database connection status and Mongoose connection errors.

---

## Development

### Start the server

```bash
node server.js
```

### Install dependencies

```bash
npm install
```

### Test

The repository currently does not contain an automated test suite. The `test` npm script is currently a placeholder and exits with an error.

---

## API Design

The API is organized around domain resources:

```text
/api
│
├── /user
│   └── Authentication, accounts, addresses, orders
│
├── /products
│   └── Product catalog and product management
│
└── /sets
    └── Featured Magic: The Gathering sets
```

This structure keeps routing concerns separate from database operations and makes the API easier to extend as additional store functionality is introduced.

---

## Related Project

### MTG Store Frontend

The frontend application is maintained in a separate repository:

**https://github.com/ronyx-b/mtg-store-app**

The frontend is responsible for the user interface and client-side application state, while this repository provides the backend API and persistent application data.

---

## Magic: The Gathering Disclaimer

Magic: The Gathering is a trademark of **Wizards of the Coast LLC**.

This project is an independent application and is not affiliated with, sponsored by, or endorsed by Wizards of the Coast.

Magic: The Gathering card names, artwork, logos, and related intellectual property belong to their respective owners.

---

## License

This project is licensed under the **ISC License**.

---

## Author

**Rony Boscan**

GitHub: https://github.com/ronyx-b

Frontend: https://github.com/ronyx-b/mtg-store-app

Backend: https://github.com/ronyx-b/mtg-store-api
