
function addProduct(){
	var forms = document.getElementsByClassName('share-form');
	var validation = Array.prototype.filter.call(forms, function(form) {
		if (form.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
		}else{
			var title = $('#shareTitle').val();
			var shareContent = $('#shareContent').val();
			var args = [{title:title,shareBody:shareContent}];
			defaultOptions.listener = function(data){
				if(typeof data === "object"){
					tips('发布共享成功，大约15秒后数据打包写入区块链，请稍后刷新查看。',true);
				}else{
					tips(data,false);
				}
			};
			nebPay.call(config.contractAddr,"0",config.share,JSON.stringify(args),defaultOptions);
		}
		form.classList.add('was-validated');
	});
}