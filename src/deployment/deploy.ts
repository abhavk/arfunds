import Arfund, { createPool } from "../library/Arfunds";

const fs = require("fs");
const path = require("path");
const Arweave = require("arweave");
const { WarpNodeFactory } = require("warp-contracts");

const corp_scripts = JSON.parse(fs.readFileSync("wallet.json").toString());
let config;

(async () => {
	// Load contract src and initState, set tags
	// Arweave and SmartWeave initialization
        const arweave = Arweave.init({
                host: "arweave.net",
                port: 443,
                protocol: "https",
        });
	
	config = JSON.parse(fs.readFileSync("config.json").toString());	
	const contractSrc = fs.readFileSync(path.join(__dirname, "../contracts/contract.js"), "utf8");
	
	await createPool(arweave, config.Pool.Title, config.Pool.Description, corp_scripts, config.Pool.Wallet, config.Pool.Website, config.Pool.OperatorInfo, config.Pool.Rewards);
	
	// Deploying contract
  	/*
	* console.log("Deployment started");
  	* const contractTxId = await smartweave.createContract.deploy({
    	*	wallet: corp_scripts,
    	*	initState: initState,
    	*	src: contractSrc,
	*	tags: customTags
  	* });
	*/

	
	
})();
