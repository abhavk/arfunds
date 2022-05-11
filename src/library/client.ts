import Arfund, { getAllContracts } from "./Arfunds";
// import { getAllContracts } from "./Arfunds";
import Arweave from "arweave";

const poolId = "1mKRVBryZ_sGKJXlH2-h1takvfwwzyriK83uWTGmEEk";
const arweave = Arweave.init({
                host: "arweave.net",
                port: 443,
                protocol: "https",
                timeout: 20000,
                logging: false,
        });

let fund = new Arfund(poolId, arweave, true);


const bhaag = async () => { 
	let state;
	for (let i=0; i<5;i++) {
		state = await fund.getState();
		console.log(`fetched state ${i+1} times`);
	}	
	console.log(JSON.stringify(state, null, 2));
	for (let i=0; i<5;i++) {
		const contributor = await fund.getRandomContributor();
		console.log(contributor);
	}
	const contracts = await getAllContracts(arweave, true);
	console.log(contracts);
}

bhaag();

