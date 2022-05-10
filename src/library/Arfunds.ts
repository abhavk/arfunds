import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from "redstone-smartweave";
import NodeCache from "node-cache";
import { selectTokenHolder } from "./selectRandomHolder";
import { queryContracts } from "./queryContracts";

enum ExecutionEngine {
	REDSTONE, 
	NONE
}

export async function getAllContracts(arweave, filterApproved=true) {
	const CONTRACT_SRC="GJd-lCWMKIa0k5XibPsnvGEy5eh7DsjAtq_BrCkP1W4";
	const APPROVED=["6-tVIaRu5wJa0gWRF4Bhont5EWbhkK8AhJ3Ki3yDK5I"];
        if (filterApproved) {
                return APPROVED;
        }
        const data = await queryContracts(CONTRACT_SRC, arweave);
	const contracts = [];
        data.forEach((edge) => contracts.push(edge.node.id));
        return contracts;
}

export default class Arfund {
	public arweave: Arweave;
	public poolId: string;
	public cache: boolean;
	public cacheInvalidation: number;
	public execution: ExecutionEngine;
	
	// conditional variables
	public contract;
	public stateCache;

	/**
	* Constructs a new Arfund instance 
	* @param poolId - ID of the pool's init state to connect to
	*/

	constructor(poolId: string, arweave: Arweave, localCache=false, balanceUrl="http://gateway-1.arweave.net:1984/", executionEngine=ExecutionEngine.REDSTONE) {
		this.poolId = poolId;
		this.cache = localCache;
		// this.cacheInvalidation = cacheInvalidation;
		this.execution = executionEngine; 
		this.arweave=arweave;
				
		
		if (this.execution==ExecutionEngine.REDSTONE) {
			LoggerFactory.INST.logLevel("fatal");
			const smartweave = SmartWeaveNodeFactory.memCached(arweave);
			this.contract = smartweave.contract(this.poolId).setEvaluationOptions({
		walletBalanceUrl: balanceUrl
	});				  	}
		this.stateCache = new NodeCache({stdTTL:100});
		
	}
	

	getPoolId() {
		return this.poolId;
	}	

	// public functions
	// read current state, with caching
	async getState() {
		if (!this.cache) {
			const { state, validity } = await this.contract.readState();
			return state;
		}
		var currentState = this.stateCache.get("current");
        	if (currentState == undefined) {
                	const { state, validity } = await this.contract.readState();
                	this.stateCache.set("current", state );
                	return state;
        	} else {
                	return currentState;
        	}
	}	
		
	async getRandomContributor() {
		const state = await this.getState();
		return selectTokenHolder(state.tokens, state.totalSupply);
	}
	
	async contribute(amount: string) {
		const contractInteractor = this.contract.connect("use_wallet");
		const interactionTx = await contractInteractor.writeInteraction({
                	function: "contribute"
        	    }, [], {
                	target: 'bPVcHEkxWOVTknAK3HQtaE6qW3jzK-zpgxMi4bFmydI',
                	// .000001 AR
                	winstonQty: amount
        	});
		return interactionTx;
	}		
}
