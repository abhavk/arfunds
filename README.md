# arfunds

This repository allows interacting with `arfunds` contracts on Arweave. Arfunds is a project designed to help communities raise funds for archival projects around major events of historical importance. Each `arfunds` contract constitutes a pool, and keeps track of all contributions made to a particular pool contract. 

In order to test a sample (`zJ0pvRVzCHREMy1Yy4MuvXgI5Ge0rr4bpV6-keKhw5E`) contract's state,

```
# Install dependencies
$ yarn add arweave redstone-smartweave

# Read state of existing contract
$ node src/deployment/read.js
``` 

## Reading from this contract
`arfunds` contracts are currently deployed with the tag `Archiving-Pool-v0.1` on the Arweave network. 
