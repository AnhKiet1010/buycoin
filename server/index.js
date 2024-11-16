require("dotenv").config();

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");

const app = express();
const httpServer = require("http").createServer(app);

const connectDB = require("./config/db");

app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: "2gb" }));
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is OK");
});

const transactionRouter = require("./routes/transaction.route");
app.use("/api/v1/transaction", transactionRouter);

const slipRateRouter = require("./routes/slipRate.route");
app.use("/api/v1/slip-rate", slipRateRouter);

// Connect to database
connectDB();

app.use(express.static("public"));

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
