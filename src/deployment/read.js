const Arweave=require("arweave");
const { LoggerFactory, SmartWeaveNodeFactory } = require("redstone-smartweave");
const fs = require("fs");
const path = require("path");
const { TsLogFactory } = require("redstone-smartweave/lib/cjs/logging/node/TsLogFactory");


const contractTxId = "zJ0pvRVzCHREMy1Yy4MuvXgI5Ge0rr4bpV6-keKhw5E";

async function archivePoolClient() {
	const arweave = Arweave.init({
    		host: "arweave.net",
    		port: 443,
    		protocol: "https",
    		timeout: 20000,
    		logging: false,
  	});

	LoggerFactory.use(new TsLogFactory());
  	LoggerFactory.INST.logLevel("debug", "ContractInteractionsLoader");	
	
	const smartweave = SmartWeaveNodeFactory.memCached(arweave);
	const contract = smartweave.contract(contractTxId);

	const { state, validity } = await contract.readState();
	console.log(JSON.stringify(state, null, 2));
}

archivePoolClient().catch((e) => console.log(e));
