export function selectTokenHolder(tokens, totalSupply) {
        const weights = {};
        for (const address of Object.keys(tokens)) {
                weights[address] = tokens[address] / totalSupply;
        }

        let sum = 0;
        const r = Math.random();

        for (const address of Object.keys(weights)) {
                sum += weights[address];
                if (r<=sum && weights[address] >0) {
                        return address;
                }
        }

        throw new Error('Unable to select token holder');
}
