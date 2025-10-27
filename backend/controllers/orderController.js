// controllers/orderController.js
const Order = require('../models/orders');
const crypto = require('crypto');

// 🆕 Helper to generate orderId like ORD-20251026-XYZ123
function generateOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${date}-${random}`;
}

// =============================================
// CREATE ORDER
// =============================================
exports.createOrder = async (req, res) => {
  try {
    const body = req.body;

    if (!body.userId || !body.items || body.items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields: userId or items' });
    }

    // ✅ Add generated orderId if not provided
    const orderData = {
      ...body,
      orderId: body.orderId || generateOrderId(),
      status: body.status || 'pending',
      orderDate: body.orderDate || new Date(),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    res.status(201).json({
      message: '✅ Order created successfully',
      order: newOrder,
    });
  } catch (err) {
    console.error('❌ Error creating order:', err);
    res.status(500).json({
      message: err.message || 'Failed to create order',
    });
  }
};

// =============================================
// GET USER ORDERS
// =============================================
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('❌ Error fetching user orders:', err);
    res.status(500).json({ message: err.message });
  }
};

// =============================================
// GET ALL ORDERS (ADMIN)
// =============================================
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
