import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from "redstone-smartweave";
import fs from "fs";
import path from "path";
// import { TsLogFactory } from "redstone-smartweave/lib/cjs/logging/node/TsLogFactory";
// import { TsLogFactory } from "redstone-smartweave";
import { selectTokenHolder } from "./selectRandomHolder";
import { getState } from "./getState";
import NodeCache from "node-cache";

const contractTxId = process.argv[2];

async function archivePoolClient() {
	const arweave = Arweave.init({
    		host: "arweave.net",
    		port: 443,
    		protocol: "https",
    		timeout: 20000,
    		logging: false,
  	});

  	LoggerFactory.INST.logLevel("debug");	
	
	const smartweave = SmartWeaveNodeFactory.memCachedBased(arweave).useArweaveGateway().build();
	const contract = smartweave.contract(contractTxId).setEvaluationOptions({
                walletBalanceUrl: "http://gateway-1.arweave.net:1984/"
        });;
	
	let state;
	state = await getState(contract);
	console.log(JSON.stringify(state, null, 2));
	console.log("Selecting random token holder");
	console.log(selectTokenHolder(state.tokens, state.totalSupply));
}

archivePoolClient().catch((e) => console.log(e));


