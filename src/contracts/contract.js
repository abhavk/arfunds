// This file has the smartweave code for Artifact generation

export async function handle(state, action) {
  	const balances = state.balances;
	const caller = action.caller;
	switch (action.input.function) {
		case "read": {
			return { result: state }; 
		}
		case "contribute": {
			const contribution = BigInt(SmartWeave.transaction.quantity);
			const target = SmartWeave.transaction.target;
			if (target != state.owner) {
				throw new ContractError(
				`Please fund the correct owner: ${state.owner}.`);
			}
			if (caller in state.contributors) {
				state.contributors[caller] = (BigInt(state.contributors[caller]) + contribution).toString();
			} else {
				state.contributors[caller] = contribution.toString();
			}
			state.totalContributions = (BigInt(state.totalContributions) + contribution).toString();
			return { state };
		}
		default: {
			throw new ContractError(
				`No action ${action.input.function} exists. Please send a valid action.`
			);
		}
	}

}
