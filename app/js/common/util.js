const PRODUCT_TYPE_NAS = "NAS";
const PRODUCT_TYPE_NPC = "NPC";
const PRODUCT_STATUS_ACTIVE = 1;
const PRODUCT_STATUS_COMPLETE = 2;
const PRODUCT_STATUS_FINISH = 3;

//设置cookie
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";path=/; " + expires;
}
//获取cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}
//清除cookie
function clearCookie(name) {
    setCookie(name, "", -1);
}

//发起ajax请求
function ajaxPost(url, data, success, async){
    if (async===undefined){
        async = true;
    }
    $.ajax({
        url:url,
        type:"post",
        contentType: "application/x-www-form-urlencoded",
        dataType:"json",
        data:data,
        async: async,
        success:function(data){
            success(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
//                            alert(XMLHttpRequest.status);
//                            alert(XMLHttpRequest.readyState);
//             alert(textStatus);
        }
    });
}
//发起ajax请求
function ajaxGet(url, data, success){
    $.ajax({
        url:url,
        type:"get",
        contentType: "application/x-www-form-urlencoded",
        dataType:"json",
        data:data,
        success:function(data){
            success(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
//                            alert(XMLHttpRequest.status);
//                            alert(XMLHttpRequest.readyState);
            alert(textStatus);
        }
    });
}

function getNowTimestamp(){
    var date = new Date();
    return date.getTime();
}
function timestampToTime(timestamp) {
    var date = new Date();
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    return new Date(date.getTime() + date.getTimezoneOffset()*60000);
}
function getRestTime(endTime) {
    return endTime * 1000 - getNowTimestamp();
}
function addrDisplay(addr) {
    return addr.substring(0,6)+"***";
}
function getRestTimeDisplay(endTime, winner, status){
    var time = getRestTime(endTime);
    var str = "";
    if (isAccepted(status)){
        str = " 领奖成功";
    }else {
        str = " 竞拍成功";
    }
    if ( time <= 0){
        return "拍卖结束,用户 "+addrDisplay(winner)+str+"";
    }
    var day = Math.floor(time/1000/60/60/24);
    var hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((time % (1000 * 60)) / 1000);
    return "距结束还有 " + day + "天" + hours + "时" + minutes + "分" + seconds + "秒";
}
//是否有领奖按钮
function isWinner(product) {
    if (curAddr && curAddr === product.winner && getRestTime(product.endTime) < 0 && product.status != PRODUCT_STATUS_FINISH){
        return true;
    }
    return false;
}
//是否领过奖
function isAccepted(status) {
    if (status === PRODUCT_STATUS_FINISH){
        return true;
    }
    return false;
}
//是否是管理员
function isAdmin() {
    if (curAddr && curAddr === dappAddr){
        return true;
    }
    return false;
}

function formatDate(date){
    var YYYY = date.getFullYear();
    var M=date.getMonth()+1;
    var MM=(M<10)?"0"+M:M;
    var D=date.getDate();
    var h=date.getHours();
    var m=date.getMinutes();
    var s=date.getSeconds();
    return YYYY+"-"+MM+"-"+D;
}

