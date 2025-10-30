const Order = require('../models/orders');
const Album = require('../models/albums');
const crypto = require('crypto');

function generateOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${date}-${random}`;
}
function generateSku() {
  return `SKU-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

// CREATE ORDER (with stock update)
exports.createOrder = async (req, res) => {
  try {
    const body = req.body;
    if (!body.userId || !body.items?.length) {
      return res.status(400).json({ message: 'Missing required fields: userId or items' });
    }

    // Check stock before creating
    for (const item of body.items) {
      const album = await Album.findById(item.albumId);
      if (!album) return res.status(400).json({ message: `Album not found: ${item.albumId}` });
      if (album.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${album.name}` });
      }
    }

    const itemsWithSku = body.items.map(item => ({
      ...item,
      sku: item.sku || generateSku(),
    }));

    const orderData = {
      ...body,
      items: itemsWithSku,
      orderId: body.orderId || generateOrderId(),
      status: body.status || 'pending',
      orderDate: body.orderDate || new Date(),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    // Decrease stock
    for (const item of itemsWithSku) {
      const album = await Album.findById(item.albumId);
      if (album) {
        album.stock = Math.max(album.stock - item.quantity, 0);
        await album.save();
        console.log(`🟢 Updated stock for ${album.name}: ${album.stock}`);
      }
    }

    res.status(201).json({ message: '✅ Order created successfully', order: newOrder });
  } catch (err) {
    console.error('❌ Error creating order:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET USER ORDERS
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    console.error('❌ Error fetching user orders:', err);
    res.status(500).json({ message: err.message });
  }
};
// CANCEL ORDER (and restock albums)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // If order already shipped, delivered, or cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res
        .status(400)
        .json({ message: `Cannot cancel order with status: ${order.status}` });
    }

    // Restore stock
    for (const item of order.items) {
      const album = await Album.findById(item.albumId);
      if (album) {
        album.stock += item.quantity;
        await album.save();
        console.log(`🔁 Restored ${item.quantity} to ${album.name}.`);
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: '✅ Order cancelled and stock restored.', order });
  } catch (err) {
    console.error('❌ Cancel order error:', err);
    res.status(500).json({ message: err.message });
  }
};
