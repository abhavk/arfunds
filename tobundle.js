var Arfund = require("./build/library/Arfunds").default;
var getAllContracts = require("./build/library/Arfunds").getAllContracts;

global.window.getAllContracts=getAllContracts
global.window.Arfund=Arfund
