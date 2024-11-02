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
      const orders = await db.model.Order.find(
        { 
          user_id: id 
        }, 
        null, 
        { 
          sort: { 
            date: "desc" 
          } 
        },
      );
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

const checkoutOrder = async (order) => {
  try {
    const db = await DataService.connect();
    if (db.error) {
      throw new Error("error connecting to DB");
    }
    await db.model.Order.create(order);
    return;
  }
  catch (err) {
    throw new Error(`Error checking out order: ${err}`);
  }
};

const getNextOrderNumber = async () => {
  try {
    const db = await DataService.connect();
    if (db.error) {
      throw new Error("error connecting to DB");
    }
    const lastOrder = await db.model.Order.findOne(
      {},
      null,
      {
        sort: {
          number: "desc"
        }
      }
    );
    const nextOrderNumber = lastOrder.number + 1;
    return nextOrderNumber;
  }
  catch (err) {
    throw new Error(`Error getting next order number: ${err}`);
  }
};

const ordersController = {
  getOrderDetails,
  getOrdersByUserId,
  checkoutOrder,
  getNextOrderNumber,
}

module.exports = ordersController;