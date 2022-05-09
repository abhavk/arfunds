import Arweave from "arweave";
import { LoggerFactory, SmartWeaveNodeFactory } from "redstone-smartweave";
import NodeCache from "node-cache";
import { selectTokenHolder } from "./selectRandomHolder";
enum ExecutionEngine {
	REDSTONE, 
	NONE
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

	constructor(poolId: string, arweave: Arweave, localCache=false, executionEngine=ExecutionEngine.REDSTONE) {
		this.poolId = poolId;
		this.cache = localCache;
		// this.cacheInvalidation = cacheInvalidation;
		this.execution = executionEngine; 
		this.arweave=arweave;
				
		
		if (this.execution==ExecutionEngine.REDSTONE) {
			LoggerFactory.INST.logLevel("fatal");
			const smartweave = SmartWeaveNodeFactory.memCached(arweave);
			this.contract = smartweave.contract(this.poolId);				  	}
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
		
}
