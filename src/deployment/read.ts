import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from "redstone-smartweave";
import fs from "fs";
import path from "path";
// import { TsLogFactory } from "redstone-smartweave/lib/cjs/logging/node/TsLogFactory";
// import { TsLogFactory } from "redstone-smartweave";
import { selectTokenHolder } from "./getRandomHolder";
import { getState } from "./getState";
import NodeCache from "node-cache";

const contractTxId = "6-tVIaRu5wJa0gWRF4Bhont5EWbhkK8AhJ3Ki3yDK5I";

async function archivePoolClient() {
	const arweave = Arweave.init({
    		host: "arweave.net",
    		port: 443,
    		protocol: "https",
    		timeout: 20000,
    		logging: false,
  	});

  	LoggerFactory.INST.logLevel("debug");	
	
	const smartweave = SmartWeaveNodeFactory.memCached(arweave);
	const contract = smartweave.contract(contractTxId);
	
	let state;
	state = await getState(contract);
	console.log(JSON.stringify(state, null, 2));
	console.log("Selecting random token holder");
	console.log(selectTokenHolder(state.tokens, state.totalSupply));
}

archivePoolClient().catch((e) => console.log(e));


