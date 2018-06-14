#!/bin/bash
binPath="/usr/bin"
config="zcash.conf"
minWithdraw=0.01
wallet="YourWalletHere"

balance=`$binPath/zcash-cli -conf="$config" getbalance`
withdawAmount=`echo "$balance * 0.95" | bc -l | awk '{printf "%f", $0}'`

if [ $(echo "$withdawAmount>$minWithdraw" | bc -l) -eq 1 ]
then
        echo "[`date`] Send $withdawAmount to $wallet"
        $binPath/zcash-cli -conf="$config" sendtoaddress "$wallet" "$withdawAmount"
		else
        echo "[`date`] Withdraw amount $withdawAmount is less then $minWithdraw"
fi
echo `date` > lastrun.txt
