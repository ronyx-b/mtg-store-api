const express = require("express");
const userRouter = express.Router();
const jwtPassportUtils = require("../utils/jwtPassportUtils"); 
const userController = require("../data-service/userController");
const ordersController = require("../data-service/ordersController");

/**
 * GET user account info
 */
userRouter.get("/", jwtPassportUtils.authenticateToken, async (req, res) => {
  try {
    const userData = await userController.getUserData(req.user._id);
    res.status(200).json({ user: userData });
  } catch (err) {
    res.status(422).json({message: `there was an error: ${err}`});
  }
});

/**
 * POST register user
 */
userRouter.post("/register", async (req, res) => {
  try {
    let formData = req.body;
    await userController.registerUser(formData);
    res.status(201).json({success: true, message: 'new user registered'});
  }
  catch (err) {
    res.status(422).json({success: false, message: `Error: ${err}`})
  }
});

/**
 * POST login user (create session token)
 */
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password, keepLogged } = req.body;
    const user = await userController.loginUser({ email, password });
    const tokenPayload = {
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin
    };
    const optionsExpiresIn = keepLogged ? {} : { expiresIn: '24h' };
    const token = jwtPassportUtils.signToken(tokenPayload, optionsExpiresIn)
    res.status(201).json({
      success: true, 
      token,
    });
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * GET check if user is Admin
 */
userRouter.get("/is-admin", jwtPassportUtils.authenticateToken, async (req, res) => {
  try {
    let isAdmin = req.user?.isAdmin;
    res.status(200).json({ isAdmin });
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * GET user orders
 */
userRouter.get("/orders", jwtPassportUtils.authenticateToken, async (req, res) => {
  try {
    const orders = await ordersController.getOrdersByUserId(req.user._id);
    res.status(200).json({ orders });
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * POST checkout a new order
 */
userRouter.post("/orders", jwtPassportUtils.authenticateToken, async (req, res) => {
  /** @type {{ user_id: string, date: Date, address: Object, products: Object[] }} */
  const order = { 
    user_id: req.body.user_id, 
    date: req.body.date, 
    address: req.body.address,
    products: req.body.products,
  };
  try {
    if (!order.user_id || !order.date || !order.address || !order.products || order.products?.length === 0 ) {
      throw new Error("invalid order format");
    }
    await ordersController.checkoutOrder(order);
    res.status(201).json({ success: true, message: "order processed", order });
  } catch (err) {
    res.status(422).json({ success: false, message: `Error: ${err}` });
  }
});

module.exports = userRouter;