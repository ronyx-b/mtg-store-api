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
 * PUT change the user's password
 */
userRouter.put("/password", jwtPassportUtils.authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const id = req.user._id;
    if (newPassword !== confirmPassword) {
      throw new Error("passwords don't match");
    }
    await userController.changePassword(id, oldPassword, newPassword);
    res.status(201).json({ success: true, message: "password updated" });
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * POST add shipping address
 */
userRouter.post("/address", jwtPassportUtils.authenticateToken, async (req, res) => {
  try {
    const { name, street, city, province, postal } = req.body;
    const address = { name, street, city, province, postal };
    const makeDefaultAddress = req.body.makeDefaultAddress;
    const id = req.user._id;
    const addressId = await userController.addAddress(id, address);
    if (makeDefaultAddress) {
      await userController.updateDefaultAddress(id, addressId);
    }
    res.status(201).json({ success: true, message: "shipping address added" });
  } 
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * PUT update shipping address
 */
userRouter.put("/address", jwtPassportUtils.authenticateToken, async (req, res) => {
  try {
    const { name, street, city, province, postal, _id } = req.body;
    const address = { name, street, city, province, postal, _id };
    const makeDefaultAddress = req.body.makeDefaultAddress;
    const id = req.user._id;
    await userController.editAddress(id, address);
    if (makeDefaultAddress) {
      await userController.updateDefaultAddress(id, address._id);
    }
    res.status(200).json({ success: true, message: "shipping address updated" });
  } 
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * PUT update default address
 */
userRouter.put("/address/default", jwtPassportUtils.authenticateToken, async (req, res) => {
  try {
    const addressId = req.body.addressId;
    const id = req.user._id;
    await userController.updateDefaultAddress(id, addressId);
    res.status(200).json({ success: true, message: "default shipping address updated", addressId });
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * DELETE shipping address
 */
userRouter.delete("/address/:id", jwtPassportUtils.authenticateToken, async (req, res) => {
  try {
    const addressId = req.params.id;
    const id = req.user._id;
    await userController.deleteAddress(id, addressId);
    res.status(200).json({ success: true, message: "shipping address deleted" });
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
    const pageSize = req.query?.pageSize || 10;
    const pageNum = req.query?.pageNum || 1;
    const { count, orders } = await ordersController.getOrdersByUserId(req.user._id, { pageSize, pageNum });
    res.status(200).json({ count, orders, pageSize, pageNum });
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
    user_id: req.user._id, 
    date: req.body.date, 
    address: req.body.address,
    products: req.body.products,
  };
  try {
    if (!order.user_id || !order.date || !order.address || !order.products || order.products?.length === 0 ) {
      throw new Error("invalid order format");
    }
    const nextOrderNumber = await ordersController.getNextOrderNumber();
    order.number = nextOrderNumber;
    await ordersController.checkoutOrder(order);
    res.status(201).json({ success: true, message: "order processed", order });
  } catch (err) {
    res.status(422).json({ success: false, message: `Error: ${err}` });
  }
});

/**
 * GET an order by its ID
 */
userRouter.get("/orders/:order_id", jwtPassportUtils.authenticateToken, async (req, res) => {
  const order_id = req.params?.order_id;
  const user_id = req.user._id;
  try {
    const order = await ordersController.getOrderDetails(order_id);
    if (order.user_id !== user_id) {
      res.status(401).json({ message: "not authorized" });
    }
    res.status(200).json({ order });
  } catch (err) {
    res.status(422).json({ success: false, message: `Error: ${err}` });
  }
});

module.exports = userRouter;