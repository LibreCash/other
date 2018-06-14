#!/bin/bash
binPath="/opt/litecoin/bin/"
config="litecoin.conf"
minWithdraw=0.001
wallet="YourWalletHere"

balance=`$binPath/litecoin-cli -conf="$config" getbalance`
withdawAmount=`echo "$balance * 0.90" | bc -l | awk '{printf "%f", $0}'`

if [ $(echo "$withdawAmount>$minWithdraw" | bc -l) -eq 1 ] 
then
        echo "[`date`] Send $withdawAmount to $wallet"
        $binPath/litecoin-cli -conf="$config" sendtoaddress "$wallet" "$withdawAmount"
        else
        echo "[`date`] Withdraw amount $withdawAmount is less then $minWithdraw"
fi
echo `date` > lastrun.txt
