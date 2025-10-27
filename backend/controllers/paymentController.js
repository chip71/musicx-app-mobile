const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/orders');
const Album = require('../models/albums');

/** Helper: HMAC SHA256 */
function hmacSha256(message, secret) {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

/** POST /payments/momo/create-link */
exports.createMoMoPaymentLink = async (req, res) => {
  try {
    const { userId, items, subtotal, shippingPrice = 0, discount = 0, totalAmount, shippingAddress, shippingMethod, paymentMethod } = req.body;

    if (!userId || !items || items.length === 0 || !subtotal || !totalAmount) 
      return res.status(400).json({ message: 'Missing required fields' });

    // Reduce stock
    await Promise.all(items.map(async it => {
      const album = await Album.findById(it.albumId);
      if (!album) throw new Error(`Album not found: ${it.albumId}`);
      if (album.stock < it.quantity) throw new Error(`Insufficient stock for ${album.title}`);
      album.stock -= it.quantity;
      await album.save();
    }));

    // Create order
    const orderId = `ORD-${Date.now()}`;
    const newOrder = new Order({ orderId, userId, items, subtotal, shippingPrice, discount, totalAmount, currency: 'VND', shippingAddress, shippingMethod, paymentMethod: paymentMethod || 'momo', status: 'pending_payment', orderDate: new Date() });
    await newOrder.save();

    // MoMo config
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const redirectUrl = process.env.MOMO_RETURN_URL;
    const ipnUrl = process.env.MOMO_NOTIFY_URL;

    if (!partnerCode || !accessKey || !secretKey) {
      return res.status(200).json({ message: 'Order created (no MoMo config)', orderId, payUrl: `https://test-payment.momo.vn/v2/gateway/pay?orderId=${orderId}&amount=${totalAmount}` });
    }

    const rawAmount = String(Math.round(totalAmount));
    const requestType = 'captureWallet';
    const requestId = `${partnerCode}${Date.now()}`;
    const orderInfo = `Payment for order ${orderId}`;
    const extraData = '';

    const rawSignature = `accessKey=${accessKey}&amount=${rawAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = hmacSha256(rawSignature, secretKey);

    const requestBody = { partnerCode, accessKey, requestId, amount: rawAmount, orderId, orderInfo, redirectUrl, ipnUrl, extraData, requestType, signature, lang: 'en' };

    const momoRes = await axios.post(process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/create', requestBody, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });

    if (momoRes.data?.payUrl) return res.status(200).json({ message: 'MoMo payment link created', orderId, payUrl: momoRes.data.payUrl, momoResponse: momoRes.data });
    return res.status(500).json({ message: 'MoMo did not return payUrl', orderId, momoResponse: momoRes.data });

  } catch (err) {
    console.error('createMoMoPaymentLink error:', err.response?.data || err.message || err);
    return res.status(400).json({ message: err.response?.data?.message || err.message || 'Failed to create MoMo link' });
  }
};


/** POST /payments/momo/notify */
exports.handleMoMoNotify = async (req, res) => {
  try {
    const body = req.body || {};
    const { partnerCode, accessKey, requestId, amount, orderId, orderInfo,
      transId, resultCode, message, extraData, signature: receivedSignature } = body;

    const secretKey = process.env.MOMO_SECRET_KEY;
    if (!secretKey) console.warn('MOMO_SECRET_KEY missing - cannot verify IPN signature');

    let expectedSignature = null;
    if (secretKey) {
      const responseTime = body.responseTime || '';
      const payType = body.payType || '';
      const rawNotify =
        `accessKey=${accessKey || ''}&amount=${amount || ''}&extraData=${extraData || ''}&message=${message || ''}` +
        `&orderId=${orderId || ''}&orderInfo=${orderInfo || ''}&partnerCode=${partnerCode || ''}&payType=${payType}` +
        `&requestId=${requestId || ''}&responseTime=${responseTime}&resultCode=${resultCode || ''}&transId=${transId || ''}`;
      expectedSignature = hmacSha256(rawNotify, secretKey);
    }

    if (expectedSignature && receivedSignature !== expectedSignature) {
      console.warn('MoMo IPN signature mismatch', { expectedSignature, receivedSignature });
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (String(resultCode) === '0') {
      order.status = 'paid';
      order.paymentResult = { transId, momoMessage: message, momoRaw: body };
    } else {
      order.status = 'pending_payment'; // or 'failed'
      order.paymentResult = { momoRaw: body };
    }
    await order.save();
    return res.json({ resultCode: 0, message: 'Accepted' });

  } catch (err) {
    console.error('handleMoMoNotify error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/** GET /payments/momo/return */
exports.handleMoMoReturn = async (req, res) => {
  try {
    const params = req.query || {};
    const orderId = params.orderId || '';

    const frontendReturn = process.env.FRONTEND_RETURN_URL; 
    if (frontendReturn) {
      const url = new URL(frontendReturn);
      url.searchParams.set('orderId', orderId);
      Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));
      return res.redirect(url.toString());
    }

    return res.send(`<html><body><h2>MoMo Payment Return</h2><p>OrderId: ${orderId}</p><pre>${JSON.stringify(params, null, 2)}</pre><p>You can close this window.</p></body></html>`);
  } catch (err) {
    console.error('handleMoMoReturn error:', err);
    return res.status(500).send('Server error');
  }
};

/** GET /payments/momo/status/:orderId */
exports.checkMoMoStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;

    const requestBody = { partnerCode, accessKey, requestId: orderId, orderId, requestType: "transactionStatus" };
    const momoEndpoint = process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/query';
    const momoRes = await axios.post(momoEndpoint, requestBody, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });

    const momoData = momoRes.data;
    let statusUpdate = 'pending_payment';
    if (momoData.resultCode === 0) statusUpdate = 'paid';
    else if (momoData.resultCode === 1) statusUpdate = 'failed';

    const order = await Order.findOneAndUpdate({ orderId }, { status: statusUpdate }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ order, momoResponse: momoData });

  } catch (err) {
    console.error('checkMoMoStatus error:', err.response?.data || err.message || err);
    return res.status(500).json({ message: 'Server error' });
  }
};
