const Order = require('../models/orders');
const Album = require('../models/albums');
const crypto = require('crypto');

/* ============================================================
   ✅ GET ALL ORDERS (Admin)
============================================================ */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username email')
      .populate('items.albumId', 'title artist price')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('❌ Error retrieving orders:', error);
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
};

/* ============================================================
   ✅ GET ORDER BY ID (Admin or User)
============================================================ */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'username email')
      .populate('items.albumId', 'title artist price');

    if (!order) {
      return res.status(404).json({ message: `Order with id ${id} not found.` });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error('❌ Error fetching order by ID:', err);
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

/* ============================================================
   ✅ UPDATE ORDER STATUS (Dropdown)
============================================================ */
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: `Order with id ${id} not found.` });
    }

    // Các trạng thái hợp lệ
    const validStatuses = ['pending', 'pending_payment', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      message: '✅ Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

/* ============================================================
   ✅ DELETE ORDER (Admin)
============================================================ */
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: `Order with id ${id} not found.` });
    }

    res.status(200).json({
      message: '🗑️ Order deleted successfully',
      order
    });
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

/* ============================================================
   ✅ CREATE ORDER (User)
============================================================ */
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      subtotal,
      shippingPrice,
      discount,
      totalAmount,
      shippingAddress,
      shippingMethod,
      paymentMethod
    } = req.body;

    if (!userId || !items?.length) {
      return res.status(400).json({ message: 'Missing required fields: userId or items.' });
    }

    const order = new Order({
      orderId: `ORD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      userId,
      items,
      subtotal,
      shippingPrice,
      discount: discount || 0,
      totalAmount,
      shippingAddress,
      shippingMethod: shippingMethod || 'standard',
      paymentMethod: paymentMethod || 'cod',
      status: 'pending'
    });

    const savedOrder = await order.save();

    res.status(201).json({
      message: '✅ Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};
// [GET] /api/users/:userId/orders
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate('items.albumId', 'title artist price')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user orders', error: error.message });
  }
};

// [PUT] /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (order.status === 'cancelled')
      return res.status(400).json({ message: 'Order already cancelled.' });

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};
