import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from "redstone-smartweave";
import NodeCache from "node-cache";
import { selectTokenHolder } from "./selectRandomHolder";
import { queryContracts } from "./queryContracts";
const fs = require("fs");
const path = require("path");

const CONTRACT_SRC="YWvSw6cVdmfPrZBu7KGwrDVxJLtWSVHYnioSazhzG3A";

enum ExecutionEngine {
	REDSTONE, 
	NONE
}

export async function getAllContracts(arweave, filterApproved=false) {
	const APPROVED=["hrOrRCn3CrgZA6yy2AuAxbJzScAxKjnTQeBV2if4ZnA"];
        if (filterApproved) {
                return APPROVED;
        }
        const data = await queryContracts(CONTRACT_SRC, arweave);
	const contracts : string[] = [];
        data.forEach((edge) => contracts.push(edge.node.id));
        return contracts;
}

export async function createPool(arweave, title, description, wallet, owner, link="", ownerInfo="", rewards="Transferable artefacts"){
	const currentBlock = await arweave.api.get('/block/current');
	const balance = await arweave.api.get(`/wallet_list/${currentBlock.data.wallet_list}/${owner}/balance`);
	if (!(balance.data=="0")) {
		throw new Error(`Archiving pool address (owner) must have 0 balance at the time of creation. Balance of provided address ${owner} is ${balance.data}`);	
	}
	var initState = fs.readFileSync(path.join(__dirname, "../contracts/0.5.4/init.json"), "utf8");
	const initJson = JSON.parse(initState);	
	initJson.title = title;
	initJson.useOfProceeds = description;
	initJson.owner = owner;
	initJson.link = link;
	initJson.ownerInfo = ownerInfo;
	initJson.rewards = rewards;
	initState = JSON.stringify(initJson, null, 2);
	
	const customTags = [
		{
                        "name": "App-Type",
                        "value": "Archiving-Pool-v0.2"
                }
	];
	
	const smartweave = SmartWeaveNodeFactory.memCached(arweave);
	// Deploying contract
	console.log("Deployment started");
	const contractTxId = await smartweave.createContract.deployFromSourceTx(
	{
                wallet: wallet,
                initState: initState,
                srcTxId: CONTRACT_SRC,
                tags: customTags
        });
	console.log(`Deployed pool ${contractTxId} with source tx ${CONTRACT_SRC}`);
	return contractTxId;
}

export default class Arfund {
	public arweave: Arweave;
	public poolId: string;
	public cache: boolean;
	public execution: ExecutionEngine;
		
	// conditional variables
	public contract;
	public stateCache;
	private stateLockAvailable;

	/**
	* Constructs a new Arfund instance 
	* @param poolId - ID of the pool's init state to connect to
	*/

	constructor(poolId: string, arweave: Arweave, localCache=false, balanceUrl="http://gateway-1.arweave.net:1984/", executionEngine=ExecutionEngine.REDSTONE, cacheInvalidation=100) {
		this.poolId = poolId;
		this.cache = localCache;
		this.execution = executionEngine; 
		this.arweave=arweave;
		this.stateLockAvailable = true;		
		
		if (this.execution==ExecutionEngine.REDSTONE) {
			LoggerFactory.INST.logLevel("fatal");
			const smartweave = SmartWeaveNodeFactory.memCachedBased(arweave).useArweaveGateway().build();
			this.contract = smartweave.contract(this.poolId).setEvaluationOptions({
		walletBalanceUrl: balanceUrl
	});				  	}
		this.stateCache = new NodeCache({stdTTL:cacheInvalidation});
		
	}
	

	getPoolId() {
		return this.poolId;
	}	

	// public functions
	// read current state, with caching
	async getState() {
		console.log("getState() called");
		if (!this.cache) {
			const { state, validity } = await this.contract.readState();
			return state;
		}
		
		console.log("this.cache is true [in function getState()]!");
		// if in cache, use that value
		var currentState = this.stateCache.get("current");
		console.log(`cached variable "current" in getState(): ${currentState}`);
        	if (currentState == undefined) {
			// critical section - use locks
			while (!this.stateLockAvailable) {
				console.log("other thread is calling state");
				await new Promise(resolve => setTimeout(resolve, 200));
	
			}
			currentState = this.stateCache.get("current");
			if (currentState) {
				return currentState;
			} else {
				try {
					this.stateLockAvailable=false;
					const { state, validity } = await this.contract.readState();
					console.log(`newly fetched state : `);
					console.log(state);
					this.stateCache.set("current", state);
					this.stateLockAvailable=true;
					return state;
				} finally {
					this.stateLockAvailable=true;
				}
			}
        	} else {
                	return currentState;
        	}
	}

	async getInitState() {
		var initState = this.stateCache.get("init");
		if (initState == undefined) {
			const stateResponse = await this.arweave.api.get(`/${this.poolId}`);
			const state = stateResponse.data;
			this.stateCache.set("init", state, 10000);
			return state;
		} else {
			return initState;
		}
	}	
		
	async getRandomContributor() {
		console.log("getRandomContributor() called");
		const state = await this.getState();
		console.log(`state in getRandomContributor():`);
		console.log(state);
		return selectTokenHolder(state.tokens, state.totalSupply);
	}
	
	async contribute(amount: string) {
		if (!Number(amount)) {
			throw new Error(`Please contribute a valid (winston) amount`);
		}
		const contractInteractor = this.contract.connect("use_wallet");
		const initState = await this.getInitState();
		const interactionTx = await contractInteractor.writeInteraction({
                	function: "contribute"
        	    }, [], {
                	target: `${initState.owner}`,
                	// .000001 AR
                	winstonQty: amount
        	});
		return interactionTx;
	}

	async getOwnerBalance():Promise<string> {
		const [state, currentBlock] = await Promise.all([this.getInitState(),this.arweave.api.get(`/block/current`)]);
		const ownerAddress = state.owner;
		const walletListHash = currentBlock.data.wallet_list;
		const balance = await this.arweave.api.get(`/wallet_list/${walletListHash}/${ownerAddress}/balance`);
		return balance.data;
	}

	async getMetadata():Promise<any> {
		const initState = await this.getInitState();
		// console.log(JSON.parse(initState));
		console.log(initState.title);
		const metadata = ({ title, useOfProceeds, link, owner }) => { return { title, useOfProceeds, link, owner }};
		return metadata(initState);
	} 
	
	async getNftTags(projectName: string, artefactId: string, transferable: boolean): Promise<any> {
		/**
         	* Koi NFT params
         	* App-Name: SmartWeaveContract
         	* App-Version: 0.3.0
         	* Action: marketplace/Create
         	* Network: Koi
         	* Contract-Src: tWSBznzm4ccTlgxRBUmbU-5nqMXtH9W4WhNHVeZS0q0
         	* Init-State: { init state json }
         	*/
		console.log("getNftTags() called");
		const tags = []; 
        	const tokenHolder = await this.getRandomContributor();
		console.log(`token holder in getNftTags function: ${tokenHolder}`);
        	const initialState = {
                	"title": `${projectName} Artefact`,
                	"name": `Artefact ${artefactId}`,
                	"description": `Minted from archiving pool ${this.getPoolId()}`,
                	"ticker": "KOINFT",
                	"balances": {
                	},
                	"owners": {
                	},
                	"maxSupply": 1,
                	"contentType": "application/json",
                	"transferable": transferable
        	}
        	
		initialState.balances[tokenHolder] = 1;
        	initialState.owners["1"] = tokenHolder;
        	tags.push({ name: "App-Name", value: "SmartWeaveContract"});
        	tags.push({ name: "App-Version", value: "0.3.0"});
        	tags.push({ name: "Action", value: "marketplace/Create"});
        	tags.push({ name: "Network", value: "Koi" });
        	tags.push({ name: "Contract-Src", value: "tWSBznzm4ccTlgxRBUmbU-5nqMXtH9W4WhNHVeZS0q0"});
        	tags.push({ name: "Init-State", value: JSON.stringify(initialState) });
		return tags;
	}
			
}
