const { ethers } = require("ethers");

// Khởi tạo provider (kết nối với AMC)
const provider = new ethers.JsonRpcProvider(process.env.NODE_URL);
const senderPrivateKey = process.env.SENDER_ADDRESS_PRIVATE_KEY;

// Hàm chuyển AMC
const sendAmc = async ({ receiverAddress, amount }) => {
  try {
    // Tạo ví gửi từ private key
    const wallet = new ethers.Wallet(senderPrivateKey, provider);

    console.log(`Sending from: ${wallet.address} to: ${receiverAddress}`);

    // Kiểm tra số dư ví gửi
    const balance = await provider.getBalance(wallet.address);
    const balanceInAMC = ethers.formatEther(balance);

    console.log(`Sender balance: ${balanceInAMC} AMC`);

    if (parseFloat(balanceInAMC) < amount) {
      throw new Error("Insufficient balance.");
    }

    // Số tiền gửi
    const amountInWei = ethers.parseEther(amount.toString());

    // Tạo giao dịch
    const tx = {
      to: receiverAddress,
      value: amountInWei,
      gasLimit: 21000, // Gas tiêu chuẩn cho giao dịch gửi BNB
    };

    // Gửi giao dịch
    const txResponse = await wallet.sendTransaction(tx);

    console.log("Transaction sent:", txResponse.hash);

    // Chờ giao dịch được xác nhận
    const receipt = await txResponse.wait();
    console.log("Transaction confirmed:", receipt.transactionHash);

    return receipt;
  } catch (error) {
    console.error("Error sending AMC:", error.message);
    throw error;
  }
};

module.exports = { sendAmc };

// // Ví dụ gọi hàm
// (async () => {
//   try {
//     const privateKey = process.env.PRIVATE_KEY; // Private key của ví gửi
//     const receiverAddress = "0x1234567890abcdef1234567890abcdef12345678"; // Địa chỉ nhận
//     const amountBNB = 0.01; // Số lượng BNB muốn gửi

//     const { transactionHash, blockHash } = await sendBNB(privateKey, receiverAddress, amountBNB);

//     console.log("Transaction Hash:", transactionHash);
//     console.log("Block Hash:", blockHash);
//   } catch (error) {
//     console.error("Failed to send BNB:", error.message);
//   }
// })();
