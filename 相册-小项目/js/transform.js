(function(w){
	w.damu={};
	/*
	 * 竖向滑屏组件
	 * 		快速滑屏
	 * 		即点即停
	 * 		可扩展外部逻辑
	 * 		防抖动
	 * 		兼容dom结构的改变（重绘重排）
	 * */
	w.damu.drag=function(wrap,callBack){
			var child = wrap.children[0];
			$.css(child,"translateZ",0.001);
			
			var elementPoint ={};
			var startPoint = {};
			var minY = wrap.clientHeight - child.offsetHeight;
			
			//为我们的快速滑屏提供数据
			var	Tween ={
				Linear: function(t,b,c,d){ 
							return c*t/d + b; 
					},
				Back: function(t,b,c,d,s){
			            if (s == undefined) s = 1.70158;
			            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		        	}
				}
			
			//防抖动
			var isFirst = true;
			var isY = true;
			
			var lastTime =0;
			var lastPoint = 0;
			var timeVal = 1;
			var disVal = 0;
			wrap.addEventListener("touchstart",function(ev){
				minY = wrap.clientHeight - child.offsetHeight;
				//即点即停
				clearInterval(wrap.clearTime);
				ev = ev||event;
				var touchC = ev.changedTouches[0];
				child.style.transition="none";
				
				elementPoint={clientX:$.css(child,"translateX"),clientY:$.css(child,"translateY")};
				//快照
				startPoint={clientX:touchC.clientX,clientY:touchC.clientY};
				
				lastTime=new Date().getTime();
				lastPoint=$.css(child,"translateY");
				disVal = 0;
				timeVal=1;
				if(callBack&&callBack["start"]){
					callBack["start"]();
				}
				
				isFirst = true;
				isY = true;
			})
			wrap.addEventListener("touchmove",function(ev){
				if(!isY){
					return;
				}
				ev = ev||event;
				var touchC = ev.changedTouches[0];
				//快照
				var movePoint ={clientX:touchC.clientX,clientY:touchC.clientY};
				var disX = movePoint.clientX - startPoint.clientX;
				var disY = movePoint.clientY - startPoint.clientY;
				var translateY = elementPoint.clientY+disY;
				var scale = 0;
				if(translateY>0){
					scale = document.documentElement.clientHeight/(document.documentElement.clientHeight+translateY);
					translateY = elementPoint.clientY+disY*scale;
				}else if(translateY<minY){
					var over = minY - translateY;
					scale = document.documentElement.clientHeight/(document.documentElement.clientHeight+over);
					translateY = elementPoint.clientY+disY*scale;
				}
				
				if(isFirst){
					isFirst=false;
					if(Math.abs(disX)>Math.abs(disY)){
						isY=false;
						return;
					}
				}
				
				$.css(child,"translateY",translateY);
				var nowTime = new Date().getTime();
				var nowPoint = $.css(child,"translateY");
				timeVal = nowTime - lastTime;
				disVal = nowPoint-lastPoint;
				lastTime = nowTime;
				lastPoint = nowPoint;
				if(callBack&&callBack["move"]){
					callBack["move"]();
				}
			})
			wrap.addEventListener("touchend",function(){
				var speed = disVal/timeVal;
				var target =$.css(child,"translateY")+speed*200;
//				var Bessel = "";
				var type="Linear";
				var time = Math.abs(speed*0.15);
				time=time<0.3?0.3:time;
				if(target>0){
					target=0;
					type="Back";
//					Bessel = "cubic-bezier(.88,1.3,.71,1.32)";
				}else if(target<minY){
					target=minY;
					type="Back";
//					Bessel = "cubic-bezier(.88,1.3,.71,1.32)";
				}
//				child.style.transition=time+"s "+Bessel;
//				$.css(child,"translateY",target);

				//快速滑屏
				move(type,target,time);
				if(callBack&&callBack["end"]){
					callBack["end"]();
				}
			})
			
			function move(type,target,time){
//				t:当前的次数(从1开始)
//				b:一开始的位置
//				c:最终位置与初始位置的差值
//				d:总次数
//				s:回弹距离
				var t=0;
				var b=$.css(child,"translateY");
				var c=target-b;//0 
				var d=time/0.02;
				
				clearInterval(wrap.clearTime);
				wrap.clearTime=setInterval(function(){
					t++;
					if(t>d){
						clearInterval(wrap.clearTime);
						if(callBack&&callBack["over"]){
							callBack["over"]();
						}
					}else{
						//位移
						var point = Tween[type](t,b,c,d);
						$.css(child,"translateY",point);
						if(callBack&&callBack["move"]){
							callBack["move"]();
						}
					}
				},20)
			}
		}

})(window)
