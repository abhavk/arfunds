# arfunds

This repository publishes an npm package that allows interacting with `arfunds` contracts on Arweave. Arfunds is a project designed to help communities raise funds for archival projects around major events of historical importance. Each `arfunds` contract constitutes a pool, and keeps track of all contributions made to a particular pool contract. 

A demonstration of the usage of `arfunds` is available at [arfunds-client](https://github.com/abhavk/arfunds-client).

Building the package:
```
$ npm run build
```

In order to deploy and interact with archiving pools, you can use the arfunds library, explained in the aforementioned [arfunds-client](https://github.com/abhavk/arfunds-client) or alternatively you can directly use the command line tools that ship with this library. 
```
# deploy a new archiving pool (please edit the config.json file with relevant information)
$ npm run deploy
Deployment started
Deployment completed: 5Hoz9v0VgecpgHSeljNnZSWNEYff9JmZCIVyQmNpqEQ

# read the state of the contract
$ npm run read 5Hoz9v0VgecpgHSeljNnZSWNEYff9JmZCIVyQmNpqEQ
...
{
  "title": "Second Archive",
  "useOfProceeds": "This is a test archiving pool contract. Proceeds will be burned. Please do not send money to this contract.",
  "link": "",
  "owner": "AfvYaepZX04uxI324JCUryDHk1cccB4Upnevzwbom1c",
  "ownerInfo": "Contact: abhav@arweave.org",
  "rewards": "Transferable artefacts",
  "contributors": {},
  "tokens": {},
  "totalContributions": "0",
  "totalSupply": "0",
  "commit": {
    "n": 949892,
    "contributors": {
      "0L_z90sYv36VDoDhrRBffo9KrADWpCaaGQz7hJhhP9g": "1000000"
    }
  }
}

# contribute amount in winstons
$ npm run contribute 5Hoz9v0VgecpgHSeljNnZSWNEYff9JmZCIVyQmNpqEQ 1000000
...
interaction sent! id: aGTw43j_LKK9tv-vJEnpC3Mn35hfBpGEoso7hXbyX8c

```
## arfunds contracts

Help public data archival projects raise `arfunds`!
