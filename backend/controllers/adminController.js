const Order = require('../models/orders');
const User = require('../models/users');

// 🧮 ADMIN REVENUE STATS
exports.getRevenueStats = async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    const validStatuses = ['paid', 'delivered', 'completed'];
    const now = new Date();
    let matchCondition = { status: { $in: validStatuses } };

    // ✅ Nếu range=day → chỉ lấy đơn trong NGÀY HÔM NAY
    if (range === 'day') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      matchCondition.orderDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const orders = await Order.find(matchCondition);
    if (!orders.length) return res.json([]);

    // ✅ Gom nhóm theo range
    const revenueMap = new Map();

    orders.forEach(order => {
      const date = new Date(order.orderDate);
      let key;

      if (range === 'day') {
        // nhóm theo giờ trong ngày
        const hour = date.getHours().toString().padStart(2, '0');
        key = `${hour}:00`;
      } else if (range === 'week') {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil(((date - firstDayOfYear) / 86400000 + firstDayOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${week}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      revenueMap.set(key, (revenueMap.get(key) || 0) + (order.totalAmount || 0));
    });

    // ✅ Sắp xếp kết quả
    const sorted = Array.from(revenueMap.entries())
      .sort(([a], [b]) => {
        if (range === 'day') return parseInt(a) - parseInt(b);
        return new Date(a) - new Date(b);
      })
      .map(([label, amount]) => ({ label, amount }));

    res.json(sorted);
  } catch (err) {
    console.error('❌ Error in getRevenueStats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 📊 ADMIN DASHBOARD STATS
exports.getAdminStats = async (req, res) => {
  try {
    const validStatuses = ['paid', 'delivered', 'completed'];

    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: { $in: validStatuses } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({ totalRevenue, totalOrders, totalUsers });
  } catch (err) {
    console.error('❌ Error in getAdminStats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
