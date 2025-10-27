// models/orders.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  // ✅ Change type and add ref
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  // ✅ Change type and add ref
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'pending_payment', 'shipped', 'delivered', 'cancelled'], default: 'pending' }, // Added pending_payment
  items: [orderItemSchema],
  // Include all cost fields
  subtotal: { type: Number, required: true },
  shippingPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'VND' },
  shippingAddress: shippingAddressSchema,
  shippingMethod: { type: String },
  paymentMethod: { type: String },
  // Optional: Add fields for payment details if needed
  // paymentResult: { id: String, status: String, update_time: String, email_address: String }
});

module.exports = mongoose.model('Order', orderSchema, 'orders');