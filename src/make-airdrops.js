const { ethers } = require("ethers");
const fs = require("fs/promises");
const path = require("path");
const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

const contractAbi = require("../artifacts/SwordsGoldenScarlet.json");
const contractAddress = process.env.CONTRACT;
const holdersFile = path.join("output", "holders.json");
const BATCH_SIZE = 50;

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ftm.tools");
const signer = new ethers.Wallet(process.env.WALLET_PK, provider);
const contract = new ethers.Contract(contractAddress, contractAbi, signer);

let addressList = [];
let quantityList = [];
let currentBatch = 0;

async function main() {
  const holdersList = JSON.parse((await fs.readFile(holdersFile)).toString());
  for (let holder in holdersList) {
    if (holder) {
      if (currentBatch === BATCH_SIZE) {
        await makeAirdrop(quantityList, addressList);
      }

      let quantity = holdersList[holder];
      if (currentBatch + quantity > BATCH_SIZE) {
        while (currentBatch + quantity > BATCH_SIZE) {
          const currentQuantity = BATCH_SIZE - currentBatch;
          addressList.push(holder);
          quantityList.push(currentQuantity);
          currentBatch += currentQuantity;
          await makeAirdrop(quantityList, addressList);

          quantity = quantity - currentQuantity;
        }
      }

      if (quantity > 0) {
        addressList.push(holder);
        quantityList.push(quantity);
        currentBatch += quantity;
      }
    }
  }

  if (addressList.length > 0 && quantityList.length > 0) {
    await makeAirdrop(quantityList, addressList);
  }
}

const makeAirdrop = async (quantities, addresses) => {
  console.log(`${quantities}|${addresses}`);
  try {
    await contract.airdrop(quantities, addresses);
  } catch (err) {
    console.log("ERROR AIRDROPING: ", quantities, addresses, err);
  }
  addressList = [];
  quantityList = [];
  currentBatch = 0;
};

main();
