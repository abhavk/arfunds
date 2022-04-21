const fs = require("fs");
const path = require("path");
const Arweave = require("arweave");
const { SmartWeaveNodeFactory } = require("redstone-smartweave");

const corp_scripts = JSON.parse(fs.readFileSync("wallet.json").toString());

(async () => {
	// Load contract src and initState, set tags
	const contractSrc = fs.readFileSync(path.join(__dirname, "./archiver_0/contract.js"), "utf8");
        const initState = fs.readFileSync(path.join(__dirname, "./archiver_0/init.json"), "utf8");
	const customTags = [
                {
                        "name": "App-Type",
                        "value": "Archiving-Pool-v0.1"
                }
        ]

	// Arweave and SmartWeave initialization
  	const arweave = Arweave.init({
    		host: "arweave.net",
    		port: 443,
    		protocol: "https",
  	});
  	
	const smartweave = SmartWeaveNodeFactory.memCached(arweave);
	
	// Deploying contract
  	console.log("Deployment started");
  	const contractTxId = await smartweave.createContract.deploy({
    		wallet: corp_scripts,
    		initState: initState,
    		src: contractSrc,
		tags: customTags
  	});
  	console.log("Deployment completed: " + contractTxId);
	
})();
