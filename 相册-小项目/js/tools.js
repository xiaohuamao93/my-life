(function(w){
	w.$={};
	/*
	对2d变换的读写操作的封装
		--2个参数 读
		--3个参数 写
	*/
	w.$.css=function (node,type,val){
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


	w.$.gesTure=function(node,callBack){
			var hasStart = false;
			var gesTrue={};
			node.addEventListener("touchstart",function(ev){
				hasStart = false;
				ev=ev||event;
				var touches = ev.touches;
				//真正的gesturestart
				if(touches.length>=2){
					gesTrue.scale=$.getC(touches[0],touches[1]);
					gesTrue.rotate=$.getAngle(touches[0],touches[1]);
					hasStart = true;
					if(callBack&&callBack["start"]){
						callBack["start"].call(node,ev);
					}
				}
			})
			
			node.addEventListener("touchmove",function(ev){
				ev=ev||event;
				var touches = ev.touches;
				var scale=0;
				var rotate=0;
				//真正的gesturechange
				if(hasStart&&touches.length>=2){
					scale=$.getC(touches[0],touches[1]);
					rotate=$.getAngle(touches[0],touches[1]);
					ev.scale=scale/gesTrue.scale;
					//安卓分不清正负
					ev.rotation = rotate - gesTrue.rotate;
					if(callBack&&callBack["change"]){
						callBack["change"].call(node,ev);
					}
				}
			})
			
			document.addEventListener("touchend",function(ev){
				ev=ev||event;
				var touches = ev.touches;
				if(hasStart&&touches.length<2){
					if(callBack&&callBack["end"]){
						callBack["end"].call(node,ev);
					}
				}
			})
			
		}
		
	/*
	求出两点间线段与x正方向的夹角
	正切：
		在直角三角形中 对边和临边比值

		Math.atan2();	
			对于任意不同时等于0的实参数x和y，atan2(y,x)所表达的意思是坐标原点为起点，
			指向(x,y)的射线在坐标平面上与x轴正方向之间的角的角度。
			当y>0时，射线与x轴正方向的所得的角的角度指的是x轴正方向绕逆时针方向到达射线旋转的角的角度；
			而当y<0时，射线与x轴正方向所得的角的角度指的是x轴正方向绕顺时针方向达到射线旋转的角的角度
	*/
	w.$.getAngle=function (point1,point2){
		var a = point1.clientX - point2.clientX;
		var b = point1.clientY - point2.clientY;
		return Math.atan2(b,a)*180/Math.PI;
	}
		
	/*
	求出两点间的距离
	勾股定理
	*/
	w.$.getC=function (point1,point2){
		var a = point1.clientX - point2.clientX;
		var b = point1.clientY - point2.clientY;
		return Math.sqrt(a*a+b*b);
	}
})(window)
