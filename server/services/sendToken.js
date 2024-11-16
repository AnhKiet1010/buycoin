const { ethers } = require("ethers");

// Địa chỉ ví gửi và nhận, private key của ví gửi
const senderPrivateKey = "YOUR_SENDER_PRIVATE_KEY";
const receiverAddress = "RECEIVER_WALLET_ADDRESS";
const tokenAddress = "YOUR_TOKEN_CONTRACT_ADDRESS"; // Địa chỉ contract của token trên mạng của bạn

// Cấu hình kết nối với mạng blockchain riêng của bạn (ví dụ: RPC endpoint từ node của bạn)
const provider = new ethers.JsonRpcProvider("http://localhost:8545"); // Thay bằng RPC URL của mạng của bạn

// Tạo ví của người gửi từ private key
const senderWallet = new ethers.Wallet(senderPrivateKey, provider);

// ABI của smart contract ERC-20 (chỉ cần hàm transfer)
const tokenAbi = ["function transfer(address to, uint256 amount) public returns (bool)"];

async function sendToken() {
  try {
    // Số lượng token bạn muốn gửi (ví dụ: 10 token)
    const amountToSend = ethers.parseUnits("10", 18); // Giả sử token của bạn có 18 chữ số thập phân

    // Tạo đối tượng contract từ ABI và địa chỉ contract
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, senderWallet);

    // Gửi giao dịch token
    const tx = await tokenContract.transfer(receiverAddress, amountToSend);

    console.log("Giao dịch đang được gửi...");

    // Chờ giao dịch được xác nhận
    const receipt = await tx.wait();

    console.log("Giao dịch thành công!", receipt);
  } catch (error) {
    console.error("Có lỗi xảy ra khi gửi token:", error);
  }
}

// Gọi hàm gửi token
sendToken();
