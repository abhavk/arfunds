const fs = require("fs");
const path = require("path");
const Arweave = require("arweave");
const { SmartWeaveNodeFactory } = require("redstone-smartweave");

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
        var initState = fs.readFileSync(path.join(__dirname, "../contracts/init.json"), "utf8");
	const initJson = JSON.parse(initState);
	initJson.title = config.Pool.Title;
	initJson.useOfProceeds = config.Pool.Description;
	initJson.link = config.Pool.Website;
	initJson.owner = config.Pool.Wallet;
	initJson.ownerInfo = config.Pool.OperatorInfo;
	initJson.rewards = config.Pool.Rewards;

	initState = JSON.stringify(initJson, null, 2);
	
	const customTags = [
                {
                        "name": "App-Type",
                        "value": "Archiving-Pool-v1.0"
                }
        ]

  	
	const smartweave = SmartWeaveNodeFactory.memCached(arweave);
	
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

	
	const contractTxId = await smartweave.createContract.deployFromSourceTx({
		wallet: corp_scripts,
		initState: initState,
		srcTxId: `iZJZIiz1jxpD_PWI6It5HxxC-bO2JKNSW7jWzbCxcYE`,
		tags: customTags
	 });
  	
	console.log("Deployment completed: " + contractTxId);
	
})();
