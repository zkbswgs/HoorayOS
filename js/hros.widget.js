/*
**  小挂件
*/
HROS.widget = (function(){
	return {
		init : function(){
			//挂件上各个按钮
			HROS.widget.handle();
			//挂件移动
			HROS.widget.move();
			//还原上次退出系统时widget的状态
			HROS.widget.reduction();
		},
		/*
		**  创建挂件
		**  自定义挂件：HROS.widget.createTemp({url,width,height,left,top});
		**      示例：HROS.widget.createTemp({url:"http://www.baidu.com",width:800,height:400,left:100,top:100});
		*/
		createTemp : function(obj){
			var type = 'widget', appid = obj.appid == null ? Date.parse(new Date()) : obj.appid;
			//判断窗口是否已打开
			var iswidgetopen = false;
			$('#desk .widget').each(function(){
				if($(this).attr('realappid') == appid){
					iswidgetopen = true;
					return false;
				}
			});
			//如果没有打开，则进行创建
			if(!iswidgetopen){
				function nextDo(options){
					$('#desk').append(widgetWindowTemp({
						'width' : options.width,
						'height' : options.height,
						'type' : 'widget',
						'id' : 'w_' + options.appid,
						'appid' : options.appid,
						'realappid' : options.appid,
						'top' : options.top,
						'left' : options.left,
						'url' : options.url,
						'issetbar' : 0
					}));
				}
				nextDo({
					appid : appid,
					url : obj.url,
					width : obj.width,
					height : obj.height,
					top : obj.top == null ? 0 : obj.top,
					left : obj.left == null ? 0 : obj.left
				});
			}
		},
		create : function(realappid, type){
			var type = type == null ? 'widget' : type, appid;
			//判断窗口是否已打开
			var iswidgetopen = false;
			$('#desk .widget').each(function(){
				if($(this).attr('realappid') == realappid){
					iswidgetopen = true;
					appid = $(this).attr('appid');
					return false;
				}
			});
			//如果没有打开，则进行创建
			if(!iswidgetopen && $('#d_' + appid).attr('opening') != 1){
				$('#d_' + appid).attr('opening', 1);
				function nextDo(options){
					var widgetId = '#w_' + options.appid;
					if(HROS.widget.checkCookie(realappid, type)){
						var widgetState = $.parseJSON($.cookie('widgetState' + HROS.CONFIG.memberID));
						$(widgetState).each(function(){
							if(this.realappid == options.realappid && this.type == options.type){
								options.top = this.top;
								options.left = this.left;
							}
						});
					}else{
						HROS.widget.addCookie(options.realappid, options.type, 0, 0);
					}
					TEMP.widgetTemp = {
						'title' : options.title,
						'width' : options.width,
						'height' : options.height,
						'type' : options.type,
						'id' : 'w_' + options.appid,
						'appid' : options.appid,
						'realappid' : options.realappid == 0 ? options.appid : options.realappid,
						'top' : typeof(options.top) == 'undefined' ? 0 : options.top,
						'left' : typeof(options.left) == 'undefined' ? 0 : options.left,
						'url' : options.url,
						'issetbar' : 1
					};
					$('#desk').append(widgetWindowTemp(TEMP.widgetTemp));
					$(widgetId).data('info', TEMP.widgetTemp);
				}
				ZENG.msgbox.show('小挂件正在加载中，请耐心等待...', 6, 100000);
				$.ajax({
					type : 'POST',
					url : ajaxUrl,
					data : 'ac=getMyAppById&id=' + realappid + '&type=' + type
				}).done(function(widget){
					ZENG.msgbox._hide();
					widget = $.parseJSON(widget);
					if(widget != null){
						if(widget['error'] == 'ERROR_NOT_FOUND'){
							ZENG.msgbox.show('小挂件不存在，建议删除', 5, 2000);
						}else if(widget['error'] == 'ERROR_NOT_INSTALLED'){
							HROS.window.createTemp({
								appid : 'hoorayos-yysc',
								title : '应用市场',
								url : 'sysapp/appmarket/index.php?id=' + realappid,
								width : 800,
								height : 484,
								isflash : false,
								refresh : true
							});
						}else{
							nextDo({
								appid : widget['appid'],
								realappid : widget['realappid'],
								title : widget['name'],
								url : widget['url'],
								type : widget['type'],
								width : widget['width'],
								height : widget['height']
							});
						}
					}else{
						ZENG.msgbox.show('小挂件加载失败', 5, 2000);
					}
					$('#d_' + appid).attr('opening', 0);
				});
			}
		},
		//还原上次退出系统时widget的状态
		reduction : function(){
			var widgetState = $.parseJSON($.cookie('widgetState' + HROS.CONFIG.memberID));
			$(widgetState).each(function(){
				HROS.widget.create(this.realappid, this.type);
			});
		},
		//根据id验证是否存在cookie中
		checkCookie : function(realappid, type){
			var flag = false, widgetState = $.parseJSON($.cookie('widgetState' + HROS.CONFIG.memberID));
			$(widgetState).each(function(){
				if(this.realappid == realappid && this.type == type){
					flag = true;
				}
			});
			return flag;
		},
		/*
		**  以下三个方法：addCookie、updateCookie、removeCookie
		**  用于记录widget打开状态以及摆放位置
		**  实现用户再次登入系统时，还原上次widget的状态
		*/
		addCookie : function(realappid, type, top, left){
			if(!HROS.widget.checkCookie(realappid, type)){
				var widgetState = $.parseJSON($.cookie('widgetState' + HROS.CONFIG.memberID));
				if(widgetState == null){
					widgetState = [];
				}
				widgetState.push({
					realappid : realappid,
					type : type,
					top : top,
					left : left
				});
				$.cookie('widgetState' + HROS.CONFIG.memberID, $.toJSON(widgetState), {expires : 95});
			}else{
				HROS.widget.updateCookie(realappid, type, top, left);
			}
		},
		updateCookie : function(realappid, type, top, left){
			if(HROS.widget.checkCookie(realappid, type)){
				var widgetState = $.parseJSON($.cookie('widgetState' + HROS.CONFIG.memberID));
				$(widgetState).each(function(){
					if(this.realappid == realappid && this.type == type){
						this.top = top;
						this.left = left;
					}
				});
				$.cookie('widgetState' + HROS.CONFIG.memberID, $.toJSON(widgetState), {expires : 95});
			}
		},
		removeCookie : function(realappid, type){
			if(HROS.widget.checkCookie(realappid, type)){
				var widgetState = $.parseJSON($.cookie('widgetState' + HROS.CONFIG.memberID));
				$(widgetState).each(function(i){
					if(this.realappid == realappid && this.type == type){
						widgetState.splice(i, 1);
						return false;
					}
				});
				$.cookie('widgetState' + HROS.CONFIG.memberID, $.toJSON(widgetState), {expires : 95});
			}
		},
		move : function(){
			$('#desk').on('mousedown', '.widget .move', function(e){
				var obj = $(this).parents('.widget');
				var lay, x, y;
				x = e.clientX - obj.offset().left;
				y = e.clientY - obj.offset().top;
				//绑定鼠标移动事件
				$(document).on('mousemove', function(e){
					lay = HROS.maskBox.desk();
					lay.show();
					_l = e.clientX - x;
					_t = e.clientY - y;
					_t = _t < 0 ? 0 : _t;
					obj.css({
						left : _l,
						top : _t
					});
				}).on('mouseup', function(){
					$(this).off('mousemove').off('mouseup');
					if(typeof(lay) !== 'undefined'){
						lay.hide();
					}
					HROS.widget.updateCookie(obj.attr('realappid'), obj.attr('type'), _t, _l);
				});
			});
		},
		close : function(appid){
			var widgetId = '#w_' + appid;
			HROS.widget.removeCookie($(widgetId).attr('realappid'), $(widgetId).attr('type'));
			$(widgetId).html('').remove();
		},
		handle : function(){
			$('#desk').on('click', '.widget .ha-close', function(e){
				var obj = $(this).parents('.widget');
				HROS.widget.close(obj.attr('appid'));
			}).on('click', '.widget .ha-star', function(){
				var obj = $(this).parents('.widget');
				$.ajax({
					type : 'POST',
					url : ajaxUrl,
					data : 'ac=getAppStar&id=' + obj.data('info').realappid
				}).done(function(point){
					$.dialog({
						title : '给“' + obj.data('info').title + '”打分',
						width : 250,
						id : 'star',
						content : starDialogTemp({
							'point' : Math.floor(point),
							'realpoint' : point * 20
						})
					});
				});
				$('body').off('click').on('click', '#star ul li', function(){
					var num = $(this).attr('num');
					var realappid = $(this).parent('ul').data('realappid');
					if(!isNaN(num) && /^[1-5]$/.test(num)){
						if(HROS.base.checkLogin()){
							$.ajax({
								type : 'POST',
								url : ajaxUrl,
								data : 'ac=updateAppStar&id=' + obj.data('info').realappid + '&starnum=' + num
							}).done(function(responseText){
								$.dialog.list['star'].close();
								if(responseText){
									ZENG.msgbox.show("打分成功！", 4, 2000);
								}else{
									ZENG.msgbox.show("你已经打过分了！", 1, 2000);
								}
							});
						}else{
							HROS.base.login();
						}
					}
				});
			}).on('click', '.widget .ha-share', function(){
				var obj = $(this).parents('.widget');
				$.dialog({
					title : '分享应用',
					width : 370,
					id : 'share',
					content : shareDialogTemp({
						'sinaweiboAppkey' : HROS.CONFIG.sinaweiboAppkey == '' ? '1197457869' : HROS.CONFIG.sinaweiboAppkey,
						'tweiboAppkey' : HROS.CONFIG.tweiboAppkey == '' ? '801356816' : HROS.CONFIG.tweiboAppkey,
						'title' : '我正在使用 %23HoorayOS%23 中的 %23' + obj.data('info').title + '%23 应用，很不错哦，推荐你也来试试！',
						'url' : HROS.CONFIG.website + '?run=' + obj.data('info').realappid + '%26type=widget'
					})
				});
				$('body').off('click').on('click', '#share a', function(){
					$.dialog.list['share'].close();
				});
			});
		}
	}
})();