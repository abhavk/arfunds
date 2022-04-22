# arfunds

This repository allows interacting with `arfunds` contracts on Arweave. Arfunds is a project designed to help communities raise funds for archival projects around major events of historical importance. Each `arfunds` contract constitutes a pool, and keeps track of all contributions made to a particular pool contract. 

In order to test a deployed sample (`1mKRVBryZ_sGKJXlH2-h1takvfwwzyriK83uWTGmEEk`) contract's state,

```
# Install dependencies
$ yarn add arweave redstone-smartweave

# Read state of deployed test contract
$ node src/deployment/read.js

# Contribute to test pool (burns 0.001 AR every time!)
$ node src/deployment/contribute.js
```

In order to test new contracts, 
```
# deploy a new contract
$ node src/deployment/deploy.js

# for local testing
$ yarn add arlocal@1.1.30
$ node simple-test.js
``` 

## Reading from this contract
`arfunds` contracts are currently deployed with the tag `Archiving-Pool-v0.1` and the contract source is `IpC5qdc3RR04Skcia8VNghBd4WD17rzBgsjPc6t1wMI` on the Arweave network. 
