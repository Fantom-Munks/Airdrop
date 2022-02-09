const { ethers } = require("ethers");
const fs = require("fs/promises");
const path = require("path");

const contractAbi = require("../artifacts/FantomMunks.json");
const contractAddress = "0x7e72f05B8Cd0860a83A6b27d3D80BD3B3E440c27";
const outputFile = path.join("output", "holders.json");

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ftm.tools/");

async function main() {
  // Clear file before rewrite
  fs.writeFile(outputFile, "{}");

  const readOnlyContract = new ethers.Contract(
    contractAddress,
    contractAbi,
    provider
  );
  for (let i = 0; i < 10000; i++) {
    try {
      const owner = await readOnlyContract.ownerOf(i);
      console.log(`#${i}: ${owner}`);

      const unparsedData = await fs.readFile(outputFile);
      const data = JSON.parse(unparsedData);
      if (data[owner]) {
        data[owner] = data[owner] + 1;
      } else {
        data[owner] = 1;
      }
      await fs.writeFile(outputFile, JSON.stringify(data, null, 4));
    } catch (err) {
      console.log(`#${i}: error getting owner`);
    }
  }
}

main();
