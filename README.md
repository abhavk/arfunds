# arfunds

This repository allows interacting with `arfunds` contracts on Arweave. Arfunds is a project designed to help communities raise funds for archival projects around major events of historical importance. Each `arfunds` contract constitutes a pool, and keeps track of all contributions made to a particular pool contract. 

In order to test a deployed contract's state,

# Install dependencies
$ yarn add arweave redstone-smartweave

# Read state of existing contract
node src/deployment/read.js 
