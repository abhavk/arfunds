
function addOrUpdateBigStrings(object, key, qty) {
	if (object[key]) {
		object[key] = (BigInt(object[key]) + BigInt(qty)).toString();
	} else {
		object[key] = qty.toString();
	}
}

function addOrUpdateIntStrings(object, key, qty) {
	if (object[key]) {
		object[key] = (parseInt(object[key]) + qty).toString();
	} else {
		object[key] = qty.toString();
	}
}

function allocate(state, toAllocate, sumContribution) {
	const commitFactor = Number(toAllocate)/Number(sumContribution);
	var sumAllocated = 0;
	var remainder = toAllocate % Object.keys(state.commit.contributors).length;
	for (var key in state.commit.contributors) {
		var newAllocation = parseInt(commitFactor*Number(state.commit.contributors[key]));
		if (remainder > 0) {
			newAllocation += 1;
			remainder--;
		}
		sumAllocated += newAllocation;
		this.addOrUpdateIntStrings(state.tokens, key, newAllocation);
		this.addOrUpdateBigStrings(state.contributors, key, state.commit.contributors[key]);
	}
	state.totalContributions = (BigInt(state.totalContributions) + sumContribution).toString();
}

async function commitToState(state, height) {
	const commit = state.commit;
	if (commit) {
             if (commit.n < height) {
	            	// fetch info for computation
		    	const totalSupply = parseInt(state.totalSupply);
		    	// compute new contribution
                    	var sumContribution = 0n;
                    	for (var key in commit.contributors) {
                                sumContribution += BigInt(commit.contributors[key]);
                 	   } 
		   
		    	const existingBalance = BigInt(await SmartWeave.getBalance(state.owner, commit.n)) - sumContribution;
			
			if (existingBalance == 0) {
                                // totalSupply==0 => existingBalance==0, but not other way round
                                // mint 100% of supply (1 M tokens)
                                state.totalSupply = "1000000";
                                state.tokens = {};
				const toAllocate = 1000000;
                       		allocate(state, toAllocate, sumContribution);
 
			} else {
				const mintedTokens = parseInt((Number(1000000000000n*sumContribution/existingBalance)/1000000000000) * Number(totalSupply));
                         	const adjustmentFactor = Number(totalSupply)/Number(totalSupply + mintedTokens);	
				var sum = 0;
                                for (var key in state.tokens) {
                                        const newAlloc = parseInt(state.tokens[key]*adjustmentFactor);
                                        sum += newAlloc;
                                        state.tokens[key] = newAlloc.toString();
                                 };
				const toAllocate = totalSupply - sum;
				allocate(state, toAllocate, sumContribution);
			}
			// this commit's work is done, time to delete now
			delete state.commit;
	      }
        }
}

export async function handle(state, action) {
  	const balances = state.balances;
	const caller = action.caller;
	const height = SmartWeave.block.height;
	switch (action.input.function) {
		case "contribute": {
			const contribution = BigInt(SmartWeave.transaction.quantity);
			const target = SmartWeave.transaction.target;
			// check inputs
			if (target != state.owner) {
                                throw new ContractError(`Please fund the correct owner: ${state.owner}.`);                 
                        }
			if (contribution == 0) {
				throw new ContractError(`Please fund non-zero amount`);
			}
			// if previous commit exist -> push to state
			if (state.commit) {
				if (state.commit.n < height) {
					await commitToState(state, height);
					state.commit = { n: height, contributors: {} };
				} 
			} else {
				state.commit = { n: height, contributors: {}} 
			}
			
			// push new contribution to commit stack
			addOrUpdateBigStrings(state.commit.contributors, action.caller, contribution);
			return { state };		
                }
		case "commit": {
			await commitToState(state, height);
			return { state };
		}
		
		default: {
			throw new ContractError(
				`No action ${action.input.function} exists. Please send a valid action.`
			);
		}
	}

}
