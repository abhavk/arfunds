const fs = require("fs");
const path = require("path");
const Arweave = require("arweave");
const { SmartWeaveNodeFactory } = require("redstone-smartweave");

const corp_scripts = JSON.parse(fs.readFileSync(path.join(__dirname, "../../wallet.json")).toString());

(async (wallet) => {
	// Load contract src and initState, set tags
	// Arweave and SmartWeave initialization
        const arweave = Arweave.init({
                host: "arweave.net",
                port: 443,
                protocol: "https",
        });
	const contractSrc = fs.readFileSync(path.join(__dirname, "../contracts/0.5.4/contract.js"), "utf8");
        var initState = fs.readFileSync(path.join(__dirname, "../contracts/0.5.4/init.json"), "utf8");
	const initJson = JSON.parse(initState);
	console.log(wallet);
	initJson.owner = wallet;
	initState = JSON.stringify(initJson, null, 2);
	
	const customTags = [
                {
                        "name": "App-Type",
                        "value": "Archiving-Pool-v1.0"
                }
        ]

  	
	const smartweave = SmartWeaveNodeFactory.memCached(arweave);
	
	// Deploying contract
  	console.log("Deployment started");
  	const contractTxId = await smartweave.createContract.deploy({
    		wallet: corp_scripts,
    		initState: initState,
    		src: contractSrc,
		tags: customTags
  	 });
	
	/*
	* const contractTxId = await smartweave.createContract.deployFromSourceTx({
	*	wallet: corp_scripts,
	*	initState: initState,
	*	srcTxId: `GJd-lCWMKIa0k5XibPsnvGEy5eh7DsjAtq_BrCkP1W4`,
	*	tags: customTags
	* });
  	*/
	console.log("Deployment completed: " + contractTxId);
	
})(process.argv[2]);
