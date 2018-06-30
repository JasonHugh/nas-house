var URL = "https://mainnet.nebulas.io";  //testnet : https://testnet.nebulas.io
var nebulas = require("nebulas"),
    neb = new nebulas.Neb(),
    api = neb.api,
    nonce = 0,
    gaslimit = 2000000,
    gasprice = 1000000,
    wei = 1000000000000000000,
    serialNumber,
    intervalQuery;
neb.setRequest(new nebulas.HttpRequest(URL));
var NebPay = require("nebpay");
var nebPay = new NebPay();
var dappAddr ="n1Kj6K2hMDGMriemWvceempWAzLwEFTVPJ4";
var contractAddr = "n1z64fyzA8ATiuLy5rw4RuJCERnPoHacU6Y";  //testnet : n1jFxXaJhre46xracifhSTVH9vhzCoZBC43
var curAddr;
//获取当前用户信息
function getUserInfo(self,add){
    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");
    window.addEventListener('message', function (e) {
        if (e.data && e.data.data) {
            if (e.data.data.account) {
                curAddr = e.data.data.account;
                if (curAddr){
                    getPersonalData(self, curAddr);
                }
            }
        }
    });
}

function createHouseAgree(data){
    serialNumber = nebPay.call(contractAddr,0,"createHouseAgree",JSON.stringify([data]),{
        listener : function (resp) {
            //延迟5秒执行
            intervalQuery = setInterval(function () {
                queryResultInfo();
            }, 15000);
        }
    });
}
function searchAgree(self, agreeId) {
    queryData(dappAddr, "searchAgreeById", [agreeId], function (data) {
        self.agree = data;
    })
}
function accept(self, id, customerName){
    queryData(dappAddr, "searchAgreeById", [id], function (data) {
        console.log(data);
        serialNumber = nebPay.call(contractAddr,data.price,"signAgree",JSON.stringify([id, customerName]),{
            listener : function (resp) {
                //延迟5秒执行
                intervalQuery = setInterval(function () {
                    queryResultInfo();
                }, 15000);
            }
        });
    })
}
function warn(self, id){
    queryData(dappAddr, "searchAgreeById", [id], function (data) {
        console.log(data);
        serialNumber = nebPay.call(contractAddr,0,"warnCustomer",JSON.stringify([id]),{
            listener : function (resp) {
                //延迟5秒执行
                intervalQuery = setInterval(function () {
                    queryResultInfo();
                }, 15000);
            }
        });
    })
}
function give(self, id){
    queryData(dappAddr, "searchAgreeById", [id], function (data) {
        console.log(data);
        serialNumber = nebPay.call(contractAddr,data.price,"payToHouseOwner",JSON.stringify([id]),{
            listener : function (resp) {
                //延迟5秒执行
                intervalQuery = setInterval(function () {
                    queryResultInfo();
                }, 15000);
            }
        });
    })
}
function withDraw(self, price){
    serialNumber = nebPay.call(contractAddr,0,"withDraw",JSON.stringify([price]),{
        listener : function (resp) {
            //延迟5秒执行
            intervalQuery = setInterval(function () {
                queryResultInfo();
            }, 15000);
        }
    });
}

function queryData(addr, method, args, callback){
    neb.api.getAccountState(addr).then(function (resp) {
        nonce = parseInt(resp.nonce || 0) + 1;
        neb.api.call({
            from: addr,
            to: contractAddr,
            value: 0,
            nonce: nonce,
            gasPrice: gasprice,
            gasLimit: gaslimit,
            contract: {
                "function": method,
                "args": JSON.stringify(args)
            }
        }).then(function (resp) {
            if(resp.execute_err==""){
                callback(JSON.parse(resp.result));
            }else{
                // alert(resp.execute_err);
            }
        }).catch(function (err) {
            console.log(err);
        });
    }).catch(function (e) {
        console.log(e);
    });
}
function getPersonalData(self, addr){
    neb.api.getAccountState(addr).then(function (resp) {
        nonce = parseInt(resp.nonce || 0) + 1;
        var balance = resp.balance / wei;
        neb.api.call({
            from: addr,
            to: contractAddr,
            value: 0,
            nonce: nonce,
            gasPrice: gasprice,
            gasLimit: gaslimit,
            contract: {
                "function": "getUserInfo",
                "args": ''
            }
        }).then(function (resp) {
            if(resp.execute_err==""){
                self.account = JSON.parse(resp.result);
            }else{
                // alert(resp.execute_err);
            }
        }).catch(function (err) {
            console.log(err);
        });
    }).catch(function (e) {
        console.log(e);
    });
}
function getPubAgree(self,addr){
    queryData(addr, "getPubAgree", [], function (data) {
        self.pubAgrees = data;
    })
}
function getAcceptAgree(self,addr){
    queryData(addr, "getAcceptAgree", [], function (data) {
        self.acceptAgrees = data;
    })
}
//获取当前用户竞拍
function getUserWinProducts(self){
    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");
    window.addEventListener('message', function (e) {
        if (e.data && e.data.data) {
            if (e.data.data.account) {
                curAddr = e.data.data.account;
                if (curAddr){
                    queryData(curAddr, "getUserWinProducts", [], function (data) {
                        self.jproducts = data;
                    })
                }
            }
        }
    });
}
//获取当前用户竞拍
function getUserPubProducts(self){
    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");
    window.addEventListener('message', function (e) {
        if (e.data && e.data.data) {
            if (e.data.data.account) {
                curAddr = e.data.data.account;
                if (curAddr){
                    queryData(curAddr, "getUserPubProducts", [], function (data) {
                        self.pproducts = data;
                    })
                }
            }
        }
    });
}
//获取NPC拍卖商品
function getAllNPCProducts(self){
    queryData(dappAddr, "getAllNPCProducts", [], function (data) {
        self.products = data;
    })
}
function getNPCNewsLogs(self){
    queryData(dappAddr, "getNPCNewsLogs", [], function (data) {
        self.news = data;
    })
}
//出价NPC
function offerNPC(self, id, price){
    if (!curAddr){
        $('#priceModal').modal('hide');
        alert("请在WebExtensionWallet插件（<a target='_blank' href='https://github.com/ChengOrangeJu/WebExtensionWallet'>点击下载</a>）中选择钱包文件，然后刷新页面，系统会自动识别您的账户信息");
        return;
    }
    queryData(dappAddr, "getProductById", [id], function (data) {
        console.log(data);
        if (price <= data.nowPrice){
            alert("出价必须大于当前价格");
            return;
        }else if (getRestTime(data.endTime) <= 0){
            $('#priceModal').modal('hide');
            alert("此商品已经拍卖完成");
            return;
        }else if (curAddr === data.winner){
            $('#priceModal').modal('hide');
            alert("不能连续拍卖相同的商品");
            return;
        }
        serialNumber = nebPay.call(contractAddr,"0","offerNPC",JSON.stringify([id, price]),{
            listener : function (resp) {
                //延迟5秒执行
                intervalQuery = setInterval(function () {
                    queryResultInfo();
                }, 15000);
            }
        });
        $("#dealPrice").val(null);
        $('#priceModal').modal('hide');
    })
}



// 根据交易流水号查询执行结果数据
function queryResultInfo() {
    nebPay.queryPayInfo(serialNumber)
        .then(function (resp) {
            console.log(resp);
            var respObject = JSON.parse(resp);
            if(respObject.code === 0){
                console.log(resp);
                // location.reload();
                clearInterval(intervalQuery);
            }
        })
        .catch(function (err) {
            console.log(err);
        })
}