import NodeCache from "node-cache";

const stateCache = new NodeCache({stdTTL:100});

export async function getState(contract, cache=true) {
        var currentState = stateCache.get("current");
        if (currentState == undefined) {
                console.log("cache miss!");
                const { state, validity } = await contract.readState();
                stateCache.set("current", state );
		return state;
        } else {
                console.log("cache hit!");
        	return currentState;
	}
}
