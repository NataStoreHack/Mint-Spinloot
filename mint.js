const { ethers, Wallet, Contract, JsonRpcProvider } = require("ethers");
const inquirer = require("inquirer");
const fs = require("fs");

// Fungsi untuk mendapatkan alamat penerima dari private key file
function getRecipientAddressFromPKFile(filePath) {
  try {
    const privateKey = fs.readFileSync(filePath, "utf-8").trim();
    const wallet = new Wallet(privateKey);
    return wallet.address;
  } catch (error) {
    console.error("Error reading private key from file:", error);
    process.exit(1);
  }
}

// Konfigurasi Ethereum (Monad Testnet)
const provider = new JsonRpcProvider("https://testnet-rpc.monad.xyz/");

// Alamat kontrak minting token
const tokenAddress = "0xd80fde1b1a9f2a1c47100798d9d38f321a559f6e";

// ABI kontrak untuk minting token
const tokenABI = [
  "function mint(address account, uint256 amount) external",
  "function balanceOf(address account) public view returns (uint256)"
];

// Fungsi untuk minting token
async function mintTokens(toAddress, amount) {
  try {
    const amountInWei = ethers.parseUnits(amount.toString(), 6); // Directly use ethers.parseUnits
    console.log("Amount to mint in Wei:", amountInWei.toString());

    const signer = new Wallet(fs.readFileSync('pk.txt', 'utf-8').trim(), provider);
    const tokenContract = new Contract(tokenAddress, tokenABI, signer);

    const tx = await tokenContract.mint(toAddress, amountInWei);
    console.log(`Minting tokens... Transaction hash: ${tx.hash}`);

    await tx.wait();
    console.log(`Minting successful! Transaction hash: ${tx.hash}`);
  } catch (error) {
    console.error("Error occurred during minting:", error);
  }
}

// Fungsi utama untuk menjalankan minting
async function runMinting() {
  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "amount",
        message: "Enter the amount of tokens to mint:",
        validate: (input) => {
          if (isNaN(input) || input <= 0) {
            return "Please enter a valid number greater than 0.";
          }
          return true;
        },
      },
    ]);

    const { amount } = answers;
    console.log(`Amount from user input: ${amount}`);

    const toAddress = getRecipientAddressFromPKFile("pk.txt");
    console.log("Wallet address (penerima):", toAddress);

    await mintTokens(toAddress, amount);

  } catch (error) {
    console.error("Error occurred:", error);
  }
}

// Jalankan fungsi utama
runMinting();