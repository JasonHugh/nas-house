//轮播
var img_num = $('.slide-box li').length;
$('.slide-btn li').mouseover(function(){
    var index = $(this).index();
    var is_now = $('.slide-box li').eq(index).css('display');
    if(is_now != 'list-item'){
        $('.slide-btn li').removeClass('slide-btn-active');
        $(this).addClass('slide-btn-active');
        $('.slide-box li').fadeOut()
        $('.slide-box li').eq(index).fadeIn();
        clearInterval(id);
        id = setInterval('slide_clock()',4000);
    }
})
var id = setInterval('slide_clock()',4000);
function slide_clock(){
    var index = $('.slide-btn li[class="slide-btn-active"]').index();
    var time = 1000
    if(index == img_num-1){
        $('.slide-btn li').removeClass('slide-btn-active');
        $('.slide-btn li').eq(0).addClass('slide-btn-active');
        $('.slide-box li').fadeOut(time)
        $('.slide-box li').eq(0).fadeIn(time);
    }else{
        $('.slide-btn li').removeClass('slide-btn-active');
        $('.slide-btn li').eq(index+1).addClass('slide-btn-active');
        $('.slide-box li').fadeOut(time)
        $('.slide-box li').eq(index+1).fadeIn(time);
    }
}

//顶部导航
$(".center").on('mouseover','.headernav>li',function(){
    $(this).children('a').addClass('navcurrent');
    $(this).children('ul').show();
})
$(".center").on('mouseout','.headernav>li',function(){
    $(this).children('a').removeClass('navcurrent');
    $(this).children('ul').hide();
})
$(".center").on('mouseover','.headernav li li',function(){
    $(this).children('a').addClass('subcurrent');
})
$(".center").on('mouseout','.headernav li li',function(){
    $(this).children('a').removeClass('subcurrent');
})


//底部显示位置
//setTimeout(fomatFooter,1000);
fomatFooter();
function fomatFooter() {
    var footer = $("#footer");
    var right = $(".containright");
    var h = $(window).height();
    if (right.height()) {
        if (right.height() < h - 505) {
            //footer.css("position", "fixed").css("bottom", 0).css("left", 0);

            //左侧导航栏高度
            $(".containleft").css("minHeight",h - 505);
            // $(".containleft").height(h - 505);
        } else {
            //左侧导航栏高度
            $(".containleft").css("minHeight",$(".containright").height() + 10);
            // $(".containleft").height($(".containright").height() + 10);
        }
    }
}

//详情页返回按钮
function backClick(modal){
    $("#"+modal).show();
    $("#"+modal+"detail").hide();
    $(".page").show()
}

//客服QQ
$(function(){
	var KF = $(".keifu");
	var wkbox = $(".keifu_box");
	var kf_close = $(".keifu .keifu_close");
	var icon_keifu = $(".icon_keifu");
	var kH = wkbox.height();
	var kW = wkbox.width();
	var wH = $(window).height();
	KF.css({height:kH});
	icon_keifu.css("top",parseInt((kH-100)/2));
	var KF_top = (wH-kH)/2;
	if(KF_top<0) KF_top=0;
	KF.css("top",KF_top);
	$(kf_close).click(function(){
		KF.animate({width:"0"},200,function(){
			wkbox.hide();
			icon_keifu.show();
			KF.animate({width:26},300);
		});
	});
	$(icon_keifu).click(function(){
			$(this).hide();
			wkbox.show();
			KF.animate({width:kW},200);
	});
	setTimeout(function(){
        $(kf_close).click()
    },1000);
});

