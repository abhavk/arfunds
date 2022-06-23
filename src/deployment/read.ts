import Arweave from "arweave";
import { LoggerFactory, WarpNodeFactory } from "warp-contracts";
import fs from "fs";
import path from "path";
// import { TsLogFactory } from "redstone-smartweave/lib/cjs/logging/node/TsLogFactory";
// import { TsLogFactory } from "redstone-smartweave";
import { selectTokenHolder } from "./selectRandomHolder";
import { getState } from "./getState";
import NodeCache from "node-cache";
import Arfund from "../library/Arfunds";
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
	console.log(`Fetching state for fund ${contractTxId}`);	
	const fund = new Arfund(contractTxId, arweave, true);
	
	let state;
	state = await fund.getState();
	console.log(JSON.stringify(state, null, 2));
	console.log("Selecting random token holder");
	console.log(selectTokenHolder(state.tokens, state.totalSupply));
}

archivePoolClient().catch((e) => console.log(e));


