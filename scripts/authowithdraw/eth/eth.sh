#!/bin/bash

# RPC
# ATTACHPARAMETER="rpc:http://localhost:8545"

ATTACHPARAMETER="ipc:/mnt/volume-lk-ethnode/.ethereum/geth.ipc"
echo `date` > lastrun.txt
# Uncomment the following line and comment the next line using // while debugging this script
geth attach $ATTACHPARAMETER << EOF
// geth attach $ATTACHPARAMETER << EOF | grep "Data: " | sed "s/Data: //"
console.log("Script runed at:"+new Date().toLocaleString());
var config = {
 minBalance: 100000000000, // Do it 0.1 eth = 100000000000 wei later
 gasPrice: 6000000000,// 6 Gwei
 gasLimit:21000,
 coinbase:"YourWallet",
 withdrawWallet:"WithdrawWallet"
}; 
var balance = eth.getBalance(config.coinbase, "latest");
var txPrice = config.gasPrice * config.gasLimit;
var sendAmount = balance - txPrice;
console.log("Tx costs - "+txPrice+", tx amount - "+sendAmount);
console.log("Wallet "+config.coinbase+" balance = "+balance);
if ( 
	balance >= config.minBalance && 
	balance >= txPrice
) {
 personal.unlockAccount(config.coinbase,"",15000);
 console.log("Create transaction...");
 var txHash = eth.sendTransaction({
 from:config.coinbase, 
 to:config.withdrawWallet, 
 value: sendAmount,
 gas:config.gasLimit,
 gasPrice:config.gasPrice
});
 console.log("Tx hash: ",txHash);
}else{
 console.log("Balance "+balance+" less then mix withdraw amount "+config.minBalance+". Wait...");
}
console.log("Script ended at:"+new Date().toLocaleString());
EOF
