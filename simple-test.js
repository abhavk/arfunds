// File simple-demo.js

const fs = require('fs');
const path = require('path');
const Arweave = require('arweave');
const { SmartWeaveNodeFactory, LoggerFactory } = require("redstone-smartweave");
const { default: ArLocal } = require("arlocal");
const test = true;
console.log(`Testing = ${test}`);

async function generateFundedWallet(arweave) {
	const wallet = await arweave.wallets.generate();
	const walletAddress = await arweave.wallets.jwkToAddress(wallet);
	await arweave.api.get(`/mint/${walletAddress}/2000000000000`);
	return wallet;
}

async function generateEmptyWallet(arweave) {
	const wallet = await arweave.wallets.generate();
	return wallet;
}

(async () => {
	
	// Set up Arweave client
	let arweave;
	let wallet;
	let mine;
	
	if (test) {
		// Set up ArLocal
        	const arLocal = new ArLocal(1985, false);
        	await arLocal.start();
		
		arweave = Arweave.init({
                	host: "localhost",
                	port: 1985,
                	protocol: "http"
        	});
		wallet = await arweave.wallets.generate();
		mine = () => arweave.api.get("mine");
		
		// add funds to wallet
		const walletAddress = await arweave.wallets.jwkToAddress(wallet);
        	await arweave.api.get(`/mint/${walletAddress}/2000000000000`);
        	arweave.wallets.getBalance(walletAddress).then(
                	(balance) => console.log(balance));     

	}
	
	// Set up SmartWeave client
	LoggerFactory.INST.logLevel('error');
	const smartweave = SmartWeaveNodeFactory.memCached(arweave);
	
	// contract definitions load
	const destinationWallet = await generateEmptyWallet(arweave);
	const contractSrc = fs.readFileSync(path.join(__dirname, "./src/contracts/contract.js"), "utf8");
	
	// some magic to insert new wallet for testing
	var initState = fs.readFileSync(path.join(__dirname, "./src/contracts/init.json"), "utf8");
	const initJson = JSON.parse(initState);
	const destAddress = await arweave.wallets.jwkToAddress(destinationWallet);
	initJson.owner = destAddress;
	initState = JSON.stringify(initJson, null,2);
		
	// deploy to arweave - local if test, arweave.net if not
	const contractTxId = await smartweave.createContract.deploy({
		wallet,
		initState: initState,
		src: contractSrc
	});
	
	await mine();
	
	// interact with contract
	const conInteractor = smartweave.contract(contractTxId).connect(wallet);
	
	// read state
	const state = await conInteractor.readState();
	console.log("state before any interactions");
	console.log(JSON.stringify(state,null,2));
	
	// sending "contribute" transaction
	console.log("sending 'contribute' interaction");
	await conInteractor.writeInteraction({
		function: "contribute"
	}, [], {
		target: destAddress,
		winstonQty: '1000000000000'
	});
	await mine();
	console.log("Interaction has been sent");

	// read state again
	const newState = await conInteractor.readState();
	console.log("state after first contribution");
	console.log(JSON.stringify(newState,null,2));

	// resent "contribute" transaction
	console.log("sending another 'contribute' txn");
	const wallet2 = await generateFundedWallet(arweave);
	const conInteractor2 = smartweave.contract(contractTxId).connect(wallet2);
	await conInteractor2.writeInteraction({
                function: "contribute"
        }, [], {
		target: destAddress,		
                //target: 'nDNofBkdEJDteCmSJcVJxxAAJz5UEHAXze1hU2GBn-A',
                winstonQty: '500000000000'
        });
	await mine();

	// read state one more time
	let finalState = await conInteractor2.readState();
        console.log("state after second contribution");
        console.log(JSON.stringify(finalState,null,2));
	
	// mint extra tokens in destAddress for testing
	await arweave.api.get(`/mint/${destAddress}/2000000000000`);
	await mine();
	await conInteractor.writeInteraction({
                function: "contribute"
        }, [], {
		target: destAddress,
                // target: 'nDNofBkdEJDteCmSJcVJxxAAJz5UEHAXze1hU2GBn-A',
                winstonQty: '500000000000'
        });
        await mine();
	finalState = await conInteractor.readState();
	console.log(JSON.stringify(finalState,null,2));	
	
	// read arweave wallet balance
	 arweave.wallets.jwkToAddress(wallet).then(
	 	(address) => arweave.wallets.getBalance(address).then(
	 			(balance) => console.log(balance)))
	
	arweave.wallets.getBalance('nDNofBkdEJDteCmSJcVJxxAAJz5UEHAXze1hU2GBn-A').then((balance) => console.log(balance));	
	// await arLocal.stop();
})();
