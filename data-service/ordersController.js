const DataService = require("./index");

const getOrderDetails = async (id) => {
  try {
    const db = await DataService.connect();
    if (!db.error) {
      const order = await db.model.Order.findById(id);
      if (!order) {
        throw 'order not found';
      }
      return order;
    }
  }
  catch (err) {
    throw `error looking for order data: ${err}`;
  }
};

const getOrdersByUserId = async (id, pagination = { pageSize: 10, pageNum: 1 }) => {
  try {
    const { pageSize, pageNum } = pagination;
    const db = await DataService.connect();
    if (db.error) {
      throw new Error("error connecting to DB");
    }
    const count = await db.model.Order.countDocuments({ user_id: id });
    if (count < (pageSize * (pageNum - 1))) {
      throw new Error("page out of range");
    }
    const orders = await db.model.Order.find(
      { 
        user_id: id 
      }, 
      null, 
      { 
        sort: { 
          date: "desc" 
        },
        limit: pageSize, 
        skip: pageNum > 1 ? (pageNum - 1) * pageSize : 0,
      },
    );
    if (!orders) {
      throw 'orders not found';
    }
    return { count, orders };
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