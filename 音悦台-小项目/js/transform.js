 
 (function(w){
	/*
	对2d变换的读写操作的封装
		--2个参数 读
		--3个参数 写
	*/
	w.css=function (node,type,val){
			if(!node.transforms){
				//整个数据的仓库  注意在组件外部使用时，不能置为null
				node.transforms={};
			}
			
			//写操作
			if(arguments.length>2){
				// 写操作
				var text="";
				node.transforms[type]=val;
				for(item in node.transforms){
					//以单位分类
					switch (item){
						case "skewX":
						case "skewY":
						case "skew":
						case "rotate":
							text += item+"("+node.transforms[item]+"deg) ";
							break;
						case "scale":
						case "scaleX":
						case "scaleY":
							text += item+"("+node.transforms[item]+") ";
							break;
						case "translate":
						case "translateX":
						case "translateY":
						case "translateZ":
							text += item+"("+node.transforms[item]+"px) ";
							break;
					}
				}
				node.style.transform = node.style.webkitTransform = text;
			}else{
				//读操作
				val = node.transforms[type];
				if(typeof val =="undefined"){
					if(type=="scale"||type=="scaleX"||type=="scaleY"){
						val=1;
					}else{
						val=0;
					}
				}
				return val;
			}
		}

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
			css(child,"translateZ",0.001);
			
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
				
				elementPoint={clientX:css(child,"translateX"),clientY:css(child,"translateY")};
				//快照
				startPoint={clientX:touchC.clientX,clientY:touchC.clientY};
				
				lastTime=new Date().getTime();
				lastPoint=css(child,"translateY");
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
				
				css(child,"translateY",translateY);
				var nowTime = new Date().getTime();
				var nowPoint = css(child,"translateY");
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
				var target =css(child,"translateY")+speed*200;
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
//				css(child,"translateY",target);

				//快速滑屏
				move(type,target,time);
			})
			
			function move(type,target,time){
//				t:当前的次数(从1开始)
//				b:一开始的位置
//				c:最终位置与初始位置的差值
//				d:总次数
//				s:回弹距离
				var t=0;
				var b=css(child,"translateY");
				var c=target-b;//0 
				var d=time/0.02;
				
				clearInterval(wrap.clearTime);
				wrap.clearTime=setInterval(function(){
					t++;
					if(t>d){
						clearInterval(wrap.clearTime);
						if(callBack&&callBack["end"]){
							callBack["end"]();
						}
					}else{
						//位移
						var point = Tween[type](t,b,c,d);
						css(child,"translateY",point);
						if(callBack&&callBack["move"]){
							callBack["move"]();
						}
					}
				},20)
			}
		}

})(window)
