
#!/bin/bash
binPath="/usr/bin"
config="zen.conf"
minWithdraw=0.0001
wallet=""

balance=`zen-cli -conf="$config" getbalance`
withdawAmount=`echo "$balance * 0.95" | bc -l | awk '{printf "%f", $0}'`

if [ $(echo "$withdawAmount>$minWithdraw" | bc -l) -eq 1 ]
then
        echo "[`date`] Send $withdawAmount to $wallet"
        $binPath/zen-cli -conf="$config" sendtoaddress "$wallet" "$withdawAmount"
        else
        echo "[`date`] Withdraw amount $withdawAmount is less then $minWithdraw"
fi
echo `date` > lastrun.txt

