const 
	blocktrail = require('blocktrail-sdk'),
	config = require('./config.json'),
	fs = require('fs');

var	
	BitcoinClient,
	BitcoinCashClient,
	BitcoinWallet,
	BitcoinCashWallet,
	balances = { 
		bitcoin: null, 
		bitcoincash: null 
	},
	options = {
		forcefee: 3000
	};

async function init() {
	try {
	BitcoinClient = blocktrail.BlocktrailSDK({
  		apiKey: config.apiKey,
  		apiSecret: config.apiSecret,
  		network: 'BTC',
  		testnet: config.testnet,
	});

	BitcoinCashClient = blocktrail.BlocktrailSDK({
  		apiKey: config.apiKey,
  		apiSecret: config.apiSecret,
  		network: 'BCC',
  		testnet: config.testnet
  	});		
	BitcoinWallet = await BitcoinClient.initWallet(
  		config.wallets.bitcoin.wallet,
  		config.wallets.bitcoin.password,
	);

	BitcoinCashWallet = await BitcoinCashClient.initWallet(
  		config.wallets.bitcoincash.wallet,
  		config.wallets.bitcoincash.password,
	);
	} catch(e) {
		console.log("Error on wallet init");
		log(e);
	}

}

async function getBalance() {
	try {
		let 
			bitcoin = await BitcoinWallet.getBalance(),
			bitcoincash = await BitcoinCashWallet.getBalance();

		balances = {
			bitcoin: {
				confirmed:bitcoin[0],
				pending:bitcoin[1]
			},
			bitcoincash: {
				confirmed:bitcoincash[0],
				pending:bitcoincash[1]
			}
		};

	} catch(e) {
		console.log("Error with getting wallet balances");
		log(e);
	}

	console.log(balances);
}

async function withdrawBTC() {
	var 
		curConfig = config.wallets.bitcoin,
		pay = {},
		balance = balances.bitcoin,
		pending = balance.pending;

	try {	
    	amount = (balance.confirmed > 0) ? 
    	+(await BitcoinWallet.maxSpendable(
        	allowZeroConf, 
        	blocktrail.Wallet.FEE_STRATEGY_FORCE_FEE, 
        	options
        )).max
    	: 0;
    	amount = (pending < 0) ? amount - pending : amount;
        pay[curConfig.withdraw] = amount;

    } catch(e) {
    	//console.log(e.msg);
    	console.log("BTC: Balanse less than fee. Wait...");
    }
    if (amount >= curConfig.minAmount) {
		try {
			let unlockResult = await BitcoinWallet.unlock({
				passphrase: curConfig.password
			});
			
			let txResult = await BitcoinWallet.pay(
				pay,
				null, 
				true, 
				true, 
				blocktrail.Wallet.FEE_STRATEGY_FORCE_FEE,
				null,
				options
			);

			console.log(txResult);
			log(txResult,"debug");
		} catch(e) {
			console.log("Error in BTC transaction sending");
			log(e);
		}
	}
}


function log(e,type="error") {
	let message = `${Date.now()}; ${type} ; ${JSON.stringify(e)}\r\n`;
	console.log(message);
	fs.appendFileSync('log.log', message);
}

async function withdrawBCH() {
	let curConfig = config.wallets.bitcoincash,
		pay = {},
		balance = balances.bitcoincash,
		pending = balance.pending;
		
    try {	
    	var amount = (balance.confirmed > 0) ? 
    	+(await BitcoinWallet.maxSpendable(
        	true, 
        	blocktrail.Wallet.FEE_STRATEGY_FORCE_FEE, 
        	options
        )).max
    	: 0;
        pay[curConfig.withdraw] = amount;
     	
    } catch(e) {
    	//console.log(e);
    	console.log("BCH: Balanse less than fee. Wait...");
    }
	if (amount >= curConfig.minAmount) {
		try {
			let unlockResult = await BitcoinCashWallet.unlock({
				passphrase: curConfig.password
			});
			let txResult = await BitcoinCashWallet.pay(pay);
			log(unlockResult,"debug");
			log(txResult,"debug");
		} catch(e) {
			console.log("Error in BCH transaction sending");
			log(e);
		}
	}
}

async function main() {
	await init();
	await getBalance();
	await withdrawBTC();
	await withdrawBCH();
}

main()