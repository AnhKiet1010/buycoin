const SlipRate = require("../models/slipRate.model");

exports.createInitialSlipRate = async () => {
  const initialConfigs = [
    { minCoins: 1000, maxCoins: 10000, slipRate: 0.3 },
    { minCoins: 10001, maxCoins: 100000, slipRate: 0.2 },
    { minCoins: 100001, maxCoins: null, slipRate: 0.1 },
  ];

  await SlipRate.insertMany(initialConfigs);
  console.log("Các mức slip rate ban đầu đã được thêm vào cơ sở dữ liệu");
};

exports.getSlipRates = async (req, res) => {
  // const slipRate = await SlipRate.findOne({
  //   minCoins: { $lte: coinAmount },
  //   $or: [{ maxCoins: { $gte: coinAmount } }, { maxCoins: null }],
  // });
  const slipRates = await SlipRate.find();

  res.json({
    status: 200,
    data: {
      slipRates,
    },
    errors: [],
    message: "",
  });
};
