const DataService = require("./index");

const getOrderDetails = async (id) => {
  try {
    const db = await DataService.connect();
    if (!db.error) {
      const order = await db.model.Order.findById(id);
      if (!userData) {
        throw 'order not found';
      }
      return order;
    }
  }
  catch (err) {
    throw `error looking for order data: ${err}`;
  }
};

const getOrdersByUserId = async (id) => {
  try {
    const db = await DataService.connect();
    if (!db.error) {
      const orders = await db.model.Order.find({ user_id: id });
      if (!orders) {
        throw 'orders not found';
      }
      return orders;
    }
  }
  catch (err) {
    throw `error looking for orders data: ${err}`;
  }
};

const ordersController = {
  getOrderDetails,
  getOrdersByUserId,
}

module.exports = ordersController;