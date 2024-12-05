const SlipRate = require("../models/slipRate.model");
const { getPriceAmc } = require("../utils/getPriceAmc");
const { getPriceHewe } = require("../utils/getPriceHewe");

exports.createInitialSlipRate = async () => {
  const initialConfigs = [
    { minCoins: 1000, maxCoins: 10000, slipRate: 0.3, coin_symbol: "HEWE" },
    { minCoins: 10001, maxCoins: 100000, slipRate: 0.2, coin_symbol: "HEWE" },
    { minCoins: 100001, maxCoins: null, slipRate: 0.1, coin_symbol: "HEWE" },
    { minCoins: 1000, maxCoins: 10000, slipRate: 0.03, coin_symbol: "AMC" },
    { minCoins: 10001, maxCoins: 100000, slipRate: 0.02, coin_symbol: "AMC" },
    { minCoins: 100001, maxCoins: null, slipRate: 0.01, coin_symbol: "AMC" },
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
      hewePrice: responseHewe.data.ticker.latest,
      amcPrice: responseAmc.data.result[0].p,
    },
    errors: [],
    message: "",
  });
};

exports.updateSlipRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { minCoins, maxCoins, slipRate } = req.body;

    const updatedSlipRate = await SlipRate.findByIdAndUpdate(
      id,
      { minCoins, maxCoins, slipRate },
      { new: true, runValidators: true }
    );

    if (!updatedSlipRate) {
      return res.status(404).json({
        status: 404,
        data: null,
        errors: ["Slip rate not found"],
        message: "No slip rate found to update.",
      });
    }

    return res.status(200).json({
      status: 200,
      data: updatedSlipRate,
      errors: [],
      message: "Slip rate updated successfully",
    });
  } catch (error) {
    console.error("Error updating slip rate:", error);
    return res.status(500).json({
      status: 500,
      data: null,
      errors: ["Internal server error"],
      message: "Error updating slip rate.",
    });
  }
};
