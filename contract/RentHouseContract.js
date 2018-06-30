"use strict";

//constant
const PAY_STATUS_SUCCESS = "SUCCESS";
const PAY_STATUS_FAILD = "FAILD";
const PAY_TYPE_DEPOSIT = "DEPOSIT";
const PAY_TYPE_RETURN_DEPOSIT = "RETURN DEPOSIT";
const PAY_TYPE_PRICE = "PRICE";
const PAY_TYPE_SAVE = "SAVE";
const PAY_TYPE_WITHDRAW = "WITHDRAW";

const WARNING_TYPE_INS_BAL = "Insufficient balance"
const WARNING_TYPE_DEPOSIT = "It's time to pay this month money"

const RETURN_SUCCESS = "success";
const RETURN_DENIED = "Permission denied!";


var HouseAgree = function (obj){
	if (typeof obj === "string") {
		obj = JSON.parse(obj);
	}
	if (typeof obj === "object") {
		this.id = obj.id;
		this.title = obj.title; //contract name
		this.creator = obj.creator; //house owner
		this.creatorName = obj.creatorName;
		this.customer = obj.customer; //who rent the house
		this.customerName = obj.customerName;
		this.createTime = obj.createTime;
		this.price = obj.price; //house price per month
		this.fee = obj.fee; //current month water and electricity fee
		this.deposit = obj.deposit; //house deposit
		this.startDate = obj.startDate; //first pay date
		this.endDate = obj.endDate; //last pay date
		this.payLogs = obj.payLogs; //record of pay
		this.payStatus = obj.payStatus; //if pay current month
	} else {
        this.id = "";
        this.title = ""; //contract name
        this.creator = ""; //house owner
        this.creatorName = "";
        this.customer = ""; //who rent the house
        this.customerName = "";
        this.createTime = "";
        this.price = ""; //house price per month
        this.fee = ""; //current month water and electricity fee
        this.deposit = ""; //house deposit
        this.startDate = "";
        this.endDate = "";
        this.payLogs = []; //record of pay
        this.payStatus = ""; //if pay current month
	}
}

HouseAgree.prototype = {
	toString : function() {
		return JSON.stringify(this);
	},
	addLog : function(log) {
		if (this.payLogs == null) {
			this.payLogs = [];
		}
		if (log) {
			this.payLogs.unshift(log);
		}
	}
}

var Log = function (obj){
	if (typeof obj === "string") {
		obj = JSON.parse(obj);
	}
	if (typeof obj === "object") {
		this.time = obj.time;
		this.price = obj.price;
        this.fee = obj.fee;
        this.type = obj.type;
        this.status = obj.status;
	} else {
        this.time = "";
        this.price = "";
        this.fee = "";
        this.type = "";
        this.status = "";
	}
}

Log.prototype = {
	toString : function(){
		return JSON.stringify(this);
	}
}

var offerCompare = function (obj1, obj2) {
    var val1 = obj1.time;
    var val2 = obj2.time;
    if (val1 < val2) {
        return 1;
    } else if (val1 > val2) {
        return -1;
    } else {
        return 0;
    }            
} 

var Account = function(obj) {
	if (typeof obj === "string") {
		obj = JSON.parse(obj);
	}
	if (typeof obj === "object") {
		this.addr = obj.addr;
		this.balance = obj.balance;
		this.createTime = obj.createTime;
		this.type = obj.type;
		this.logs = obj.logs;
		this.warnings = obj.warnings;
	} else {
        this.addr = "";
        this.balance = "";
        this.createTime = "";
        this.type = "";
        this.logs = [];
        this.warnings = [];
	}
}

Account.prototype = {
	toString : function(){
		return JSON.stringify(this);
	},
	addWarning : function(warning) {
		if (this.warnings == null) {
			this.warnings = [];
		}
		if (warning) {
			this.warnings.unshift(warning);
		}
	},
	addLog : function(log) {
		if (this.logs == null) {
			this.logs = [];
		}
		if (log) {
			this.logs.unshift(log);
		}
	}
}

var Warning = function (obj){
	if (typeof obj === "string") {
		obj = JSON.parse(obj);
	}
	if (typeof obj === "object") {
		this.time = obj.time;
		this.type = obj.type;
		this.agreeId = obj.agreeId;
	} else {
        this.time = "";
        this.type = "";
        this.agreeId = "";
	}
}

Warning.prototype = {
	toString : function(){
		return JSON.stringify(this);
	}
}

var HouseContract = function(){
	LocalContractStorage.defineProperties(this, {
		_name : null,
		_creator : null,
		_balance : new BigNumber(0),
		_fee : new BigNumber(0.01),
		_wei : 1000000000000000000,
        agreeindex: 0
	});

	LocalContractStorage.defineMapProperties(this, {
		"houseAgrees" : {
			parse : function(value) {
				return new HouseAgree(value);
			},
			stringify : function(obj) {
				return obj.toString();
			}
		},
        "agreeKeys" : {
            parse : function(value) {
                return value.toString();
            },
            stringify : function(o) {
                return o.toString();
            }
        }
	});

	LocalContractStorage.defineMapProperties(this, {
		"accounts" : {
			parse : function(value) {
				return new Account(value);
			},
			stringify : function(obj) {
				return obj.toString();
			}
		}
	});
}

HouseContract.prototype = {
	init : function(product) {
		this._name = "Nebulas AuctionContract. author:n1P2Tb9xonsp2TXxS8xAZnD2JuSLVF1cgPj";
		this._creator = Blockchain.transaction.from;
		this._balance = new BigNumber(0);
		this._fee = new BigNumber(0.01);
		this._wei = 1000000000000000000;
        this.agreeindex = 0;
	},

	createHouseAgree : function(args) {  //title,creatorName,price,deposit,startDate,endTime
		var from = Blockchain.transaction.from;
        var time = Blockchain.transaction.timestamp;
		var agree = new HouseAgree(args);
		var id = from + time;
        agree = new HouseAgree({
			id : id,
            title : agree.title,
            creator : from,
            creatorName : agree.creatorName,
            createTime : time,
            price : agree.price,
            deposit : agree.deposit,
            fee : 0,
            startDate : agree.startDate,
            endDate : agree.endDate,
            payLogs : [],
            payStatus : PAY_STATUS_FAILD
		});
        this.agreeindex ++;
		this.agreeKeys.set(this.agreeindex, id);
        this.houseAgrees.set(id, agree);
		//create account if account not exists
		var account = this.accounts.get(from);
		if(!account){
			account = new Account({
                addr : from,
                balance : 0,
                createTime : time,
                type : "",
                logs : [],
                warnings : []
			});
			this.accounts.set(from, account);
		}
        return this.houseAgrees.get(this.agreeKeys.get(this.agreeindex));
	},
	signAgree : function(agreeId, customerName){
        var from = Blockchain.transaction.from;
        var time = Blockchain.transaction.timestamp;
        var value = Blockchain.transaction.value.div(this._wei);

		//create account if account not exists
        var account = this.accounts.get(from);
        if(!account){
            account = new Account({
                addr : from,
                balance : 0,
                createTime : time,
                type : "",
                logs : [],
                warnings : []
            });
            this.accounts.set(from, account);
        }

        var agree = this.houseAgrees.get(agreeId);
        if (!agree){
            throw new Error( agreeId + " not exists");
		}
		if (value != agree.deposit){
            throw new Error( "Transaction price is not equal deposit");
		}
		// if (from === agree.creator){
         //    throw new Error( "Customer can not be house owner");
		// }
        agree.customer = from;
		agree.customerName = customerName;
		var log = new Log({
			time : time,
            price : value,
            fee : "",
            type : PAY_TYPE_DEPOSIT,
            status : PAY_STATUS_SUCCESS
		});
		agree.addLog(log);
        this.houseAgrees.set(agreeId, agree);

		var owner = this.accounts.get(agree.creator);
        owner.balance = new BigNumber(owner.balance).plus(new BigNumber(agree.deposit));
        this.accounts.set(agree.creator,owner);
	},
	addFee : function (agreeId, fee) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.transaction.timestamp;
        var agree = this.houseAgrees.get(agreeId);
        if (!agree){
            throw new Error( agreeId + " not exists");
        }
        if (from != agree.creator){
            throw new Error( "Only house owner can add the fee");
		}
		agree.fee = fee;
        this.houseAgrees.set(agreeId, agree);
    },
	warnCustomer : function (agreeId) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.transaction.timestamp;
        var agree = this.houseAgrees.get(agreeId);
        if (!agree){
            throw new Error( agreeId + " not exists");
        }
        if (from != agree.creator){
            throw new Error( "Only house owner can warn customer");
        }
        var customer = this.accounts.get(agree.customer);
        if (!customer){
            throw new Error( "This contract have no customer");
		}
        var warning = new Warning({
            time : time,
            type : WARNING_TYPE_DEPOSIT,
            agreeId : agreeId
        });
        customer.addWarning(warning);
        this.accounts.set(agree.customer,customer);
    },
    test : function () {
        return new BigNumber("0.1").plus(new BigNumber("0.2"))
    },
	payToHouseOwner : function (agreeId) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.transaction.timestamp;
        var value = Blockchain.transaction.value.div(this._wei);

        var agree = this.houseAgrees.get(agreeId);
        if (!agree){
            throw new Error( agreeId + " not exists");
        }
        // if (value != Number(agree.price) + Number(agree.fee)){
        //     throw new Error( "Transaction price is not equal price + fee");
        // }
        if (from !== agree.customer){
            throw new Error( "Only customer can pay the money");
        }
        var owner = this.accounts.get(agree.creator);
        owner.balance = new BigNumber(owner.balance).plus(new BigNumber(value));
        this.accounts.set(agree.creator,owner);
        var log = new Log({
            time : time,
            price : agree.price,
            fee : agree.fee,
            type : PAY_TYPE_PRICE,
            status : PAY_STATUS_SUCCESS
        });
        agree.addLog(log);
        this.houseAgrees.set(agreeId, agree);
    },
	withDraw : function (price) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.transaction.timestamp;
        var value = new BigNumber(price).mul(this._wei);
        //create account if account not exists
        var account = this.accounts.get(from);
        if(!account){
            account = new Account({
                addr : from,
                balance : 0,
                createTime : time,
                type : "",
                logs : [],
                warnings : []
            });
            this.accounts.set(from, account);
        }
        if (value.gt(new BigNumber(account.balance).mul(this._wei))){
            throw new Error( "Insufficient balance");
		}
        account.balance -= price;
        this.accounts.set(from, account);
        Blockchain.transfer(from, value);
    },
	returnDepositToCustomer : function (agreeId) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.transaction.timestamp;
        var agree = this.houseAgrees.get(agreeId);
        if (!agree){
            throw new Error( agreeId + " not exists");
        }
        if (from != agree.creator){
            throw new Error( "Only house owner can return deposit");
        }
        var owner = this.accounts.get(agree.creator);
        owner.balance -= agree.deposit;
        this.accounts.set(agree.creator,owner);
        var customer = this.accounts.get(agree.customer);
        customer.balance += agree.deposit;
        this.accounts.set(agree.customer,customer);

        var log = new Log({
            time : time,
            price : agree.deposit,
            fee : 0,
            type : PAY_TYPE_RETURN_DEPOSIT,
            status : PAY_STATUS_SUCCESS
        });
        agree.addLog(log);
        this.houseAgrees.set(agreeId, agree);
    },
	searchAgreeById : function (agreeId) {
		var agree = this.houseAgrees.get(agreeId);
        if (!agree){
            throw new Error( agreeId + " not exists");
        }
        return agree;
    },
	getPubAgree : function () {
        var from = Blockchain.transaction.from;
        var time = Blockchain.transaction.timestamp;
        var list = [];
        var agree;
        for (var i = this.agreeindex; i > 0; i--) {
            agree = this.houseAgrees.get(this.agreeKeys.get(i));
            if (agree && agree.creator === from) {
                list.push(agree);
            }
        }
        return list;
    },
    getAcceptAgree : function () {
        var from = Blockchain.transaction.from;
        var time = Blockchain.transaction.timestamp;
        var list = [];
        var agree;
        for (var i = this.agreeindex; i > 0; i--) {
            agree = this.houseAgrees.get(this.agreeKeys.get(i));
            if (agree && agree.customer === from) {
                list.push(agree);
            }
        }
        return list;
    },
    //get user info
    getUserInfo : function(){
        var from = Blockchain.transaction.from;
        var account = this.accounts.get(from);
        if(!account){
            account = new Account({
                addr : from,
                balance : 0,
                createTime : time,
                type : "",
                logs : [],
                warnings : []
            });
            this.accounts.set(from, account);
        }
        return account;
    },

	getCreator : function(){
		return this._creator;
	},

	verifyAddress : function(address) {
		// 1-valid, 0-invalid
		var result = Blockchain.verifyAddress(address);
		return {
			valid : result == 0 ? false : true
		};
	}
};
module.exports = HouseContract;