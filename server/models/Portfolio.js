// // server/models/Portfolio.js
// const mongoose = require('mongoose');

// const portfolioSchema = new mongoose.Schema({
//   userId: { type: String, default: 'default-user' },
//   name: { type: String, required: true },
//   holdings: [{
//     ticker: String,
//     name: String,
//     weight: Number // 비중 (%)
//   }],
//   initialCapital: { type: Number, default: 10000000 },
//   startDate: Date,
//   endDate: Date,
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Portfolio', portfolioSchema);