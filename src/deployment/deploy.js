const fs = require("fs");
const path = require("path");
const Arweave = require("arweave");
const { SmartWeaveNodeFactory } = require("redstone-smartweave");

const corp_scripts = JSON.parse(fs.readFileSync(path.join(__dirname, "../../wallet.json")).toString());

(async () => {
	// Load contract src and initState, set tags
	// Arweave and SmartWeave initialization
        const arweave = Arweave.init({
                host: "arweave.net",
                port: 443,
                protocol: "https",
        });
	const wallet = await arweave.wallets.generate();
        const walletAddress = await arweave.wallets.jwkToAddress(wallet);
	const contractSrc = fs.readFileSync(path.join(__dirname, "../contracts/contract.js"), "utf8");
        var initState = fs.readFileSync(path.join(__dirname, "../contracts/init.json"), "utf8");
	const initJson = JSON.parse(initState);
	initJson.owner = walletAddress;
	initState = JSON.stringify(initJson, null, 2);
	
	const customTags = [
                {
                        "name": "App-Type",
                        "value": "Archiving-Pool-v0.1"
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
  	console.log("Deployment completed: " + contractTxId);
	
})();
