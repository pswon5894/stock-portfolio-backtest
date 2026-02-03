// const express = require('express');
// const router = express.Router();
// const Portfolio = require('../models/Portfolio');

// // 포트폴리오 생성
// router.post('/', async (req, res) => {
//   try {
//     const portfolio = new Portfolio(req.body);
//     await portfolio.save();
//     res.status(201).json(portfolio);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // 모든 포트폴리오 조회
// router.get('/', async (req, res) => {
//   try {
//     const portfolios = await Portfolio.find();
//     res.json(portfolios);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 특정 포트폴리오 조회
// router.get('/:id', async (req, res) => {
//   try {
//     const portfolio = await Portfolio.findById(req.params.id);
//     if (!portfolio) {
//       return res.status(404).json({ error: '포트폴리오를 찾을 수 없습니다' });
//     }
//     res.json(portfolio);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 포트폴리오 수정
// router.put('/:id', async (req, res) => {
//   try {
//     const portfolio = await Portfolio.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!portfolio) {
//       return res.status(404).json({ error: '포트폴리오를 찾을 수 없습니다' });
//     }
//     res.json(portfolio);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // 포트폴리오 삭제
// router.delete('/:id', async (req, res) => {
//   try {
//     const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
//     if (!portfolio) {
//       return res.status(404).json({ error: '포트폴리오를 찾을 수 없습니다' });
//     }
//     res.json({ message: '포트폴리오가 삭제되었습니다' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;