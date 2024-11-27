const SlipRate = require("../models/slipRate.model");
const { getPriceAmc } = require("../utils/getPriceAmc");
const { getPriceHewe } = require("../utils/getPriceHewe");

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
  const slipRates = await SlipRate.find();

  let responseHewe = await getPriceHewe();
  let responseAmc = await getPriceAmc();

  res.json({
    status: 200,
    data: {
      slipRates,
      hewePrice: responseHewe.data.ticker.latest * 100,
      amcPrice: responseAmc.data.result[0].p,
    },
    errors: [],
    message: "",
  });
};
