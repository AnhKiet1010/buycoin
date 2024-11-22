const { ethers } = require("ethers");
const tokenAbi = require("../abis/BEP20USDT.json");

// Địa chỉ ví gửi và nhận, private key của ví gửi
const senderPrivateKey = process.env.SENDER_ADDRESS_PRIVATE_KEY;
const tokenAddress = process.env.HEWE_ADDRESS; // Địa chỉ contract của token trên mạng của bạn

// Cấu hình kết nối với mạng blockchain riêng của bạn (ví dụ: RPC endpoint từ node của bạn)
const provider = new ethers.JsonRpcProvider(process.env.NODE_URL); // Thay bằng RPC URL của mạng của bạn

// Tạo ví của người gửi từ private key
const senderWallet = new ethers.Wallet(senderPrivateKey, provider);

async function sendHewe({ amount, receiverAddress }) {
  try {
    // Số lượng token bạn muốn gửi (ví dụ: 10 token)
    const amountToSend = ethers.parseUnits(amount.toString(), 18); // Giả sử token của bạn có 18 chữ số thập phân

    // Tạo đối tượng contract từ ABI và địa chỉ contract
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, senderWallet);

    // Gửi giao dịch token
    const tx = await tokenContract.transfer(receiverAddress, amountToSend);

    // console.log("Giao dịch đang được gửi...");

    // Chờ giao dịch được xác nhận
    const receipt = await tx.wait();

    // console.log("Giao dịch thành công!", receipt);
    return receipt;
  } catch (error) {
    console.error("Có lỗi xảy ra khi gửi token:", error);
    throw new Error(error);
  }
}

module.exports = { sendHewe };
