/*
	jQuery 标签插件 	ver 0.2

	https://github.com/28269890/sTags

	Demo:https://28269890.github.io/sTags/
*/

(function($){
	$.fn.sTagsCtrl = function(ctrl){
		var t = $(this)
		var id = t.attr("tagid")
		if(id === undefined){
			return;
		}
		var o = t.data("sTipsSetOptions")
		var tagInputE = $("[tag-id="+id+"]")
		var tagListE = $("[tag-list-id="+id+"]")
		
		var color = 0 //颜色内容
		var color_i = 0 //颜色计数
		var color_s = ""  //按筛选内容的首字母换色，保存首字母内容

		var removeArray=function(array,val){
			for (var i = 0; i < array.length; i++) {
				if (array[array.length-i-1] == val){
					array.splice(array.length-i-1, 1);
				}
			}
		}

		function list(){//列出数据 target目标div指 定义选择数据的div
			tagListE.html("")
			if(o.screen){//如果启用筛选
				//定义筛选框
				$("<input>",o.screenInput).keyup(function(){
					var skey = t.val().replace(/[^a-zA-Z]/g,"")
					if(skey==""){
						tagListE.children(o.tagName+"[screen]").show()
					}else{
						tagListE.children(o.tagName+"[screen]").hide()
						tagListE.children(o.tagName+"[screen^='"+skey+"']").show()
					}
				}).appendTo(tagListE)
			}

		
			if(o.data.length>0){//如果有标签数据

				for(var i in o.data){//循环标签数据

					var attr = {} //标签列表的属性
					for(var j in o.tagAttr){
						attr[j] = o.tagAttr[j].replace('{name}',o.data[i].name).replace('{id}',o.data[i].id)
					}

					attr.tagid=o.data[i].id //定义标签id

					if(o.screen){ //如果启用筛选 则添加标签属性
						attr.screen = o.data[i].screen 
					}

					if(o.color==1 && o.data[i].screen){ //按照筛选首字母换色
						if(color_s==""){
							color_s=o.data[i].screen.substr(0,1)
							color = o.colorData[color_i]
						}else{
							if(color_s!=o.data[i].screen.substr(0,1)){
								color_i++
								if(color_i==o.colorData.length){
									color_i=0
								}
								color_s=o.data[i].screen.substr(0,1)
								color = o.colorData[color_i]
							}
						}
						attr.style="background:"+color[0]+";color:"+color[1]
					}

					if(o.color==2){//随机换色
						color = o.colorData[Math.floor(Math.random()*o.colorData.length)]
						attr.style="background:"+color[0]+";color:"+color[1]
					}
					
					var E =	$("<"+o.tagName+"/>",attr)
					if(o.tagHtml){
						E.html(o.tagHtml.replace('{name}',o.data[i].name).replace('{id}',o.data[i].id))
					}else{
						E.html('<span>'+o.data[i].name+'</span>')
					}
					E.data("fn",o.data[i].fn)
					E.click(function(){
						if(t.prop("tagName")=="DIV"){
							if(typeof($(this).data("fn")) =="function"){
								$(this).data("fn")($(this))
							}
							if(typeof(o.click)=="function"){
								o.click($(this))
							}
						}
						if(t.prop("tagName")=="INPUT"){
							addtag($(this))
						}
					})
					E.appendTo(tagListE)
				}
			}


			for(var i in o.data_){ //附加标签 作为按钮来使用
				var attr = {}
				if(o.color==1){
					color_i++
					if(color_i==o.colorData.length){
						color_i=0
					}
					color = o.colorData[color_i]
					attr.style="background:"+color[0]+";color:"+color[1]
				}	
				if(o.color==2){
					color = o.colorData[Math.floor(Math.random()*o.colorData.length)]
					attr.style="background:"+color[0]+";color:"+color[1]
				}
				var div = $("<div/>",attr)
				.html(o.data_[i].name)
				.data("fn",o.data_[i].fn)
				.click(function(){
					if(typeof($(this).data("fn")) =="function"){
						$(this).data("fn")($(this))
					}
				})
				if(o.data_[i].position){
					div.prependTo(tagListE)
				}else{
					div.appendTo(tagListE)
				}
			}
		}

		function addtag(e){ //向标签输入框中添加标签
			var val = Number(e.attr("tagid"));//获取选中值
			
			if(o.defaultData.indexOf(val) > -1){ //如果当前值已存在点击值
				return false
			}
			o.defaultData.push(val) //将点击值添加到当前值中
			if(o.defaultVal.indexOf(val) == -1){//如果原始值中不包含选中值，则在新增值中加入选中值
				o.addVal.push(val)
			}
			
			removeArray(o.removeVal,val)
			

			t.val(o.defaultData.join(","))//修改当前值


			var cls = $("<a>x</a>").click(function(){
				deltag($(this))
			})//删除标签

			var newtag = $('<div><span>'+e.text()+'</span></div>')
				.attr("tagid",e.attr("tagid"))
				.append(cls)//向标签输入框中添加的新标签。

			if(Array.isArray(o.defaultVal)){//如果默认值是数组
				if(o.defaultVal.indexOf(Number(e.attr("tagid"))) > -1){//如果默认值中包含该值
					newtag.attr("class",o.tagCSS[0]) //添加默认值样式
				}else{
					newtag.attr("class",o.tagCSS[1]) //添加新值样式
				}				
			}else{
				newtag.attr("class",o.tagCSS[1]) //添加新值样式
			}

			newtag.appendTo("[tag-id="+id+"]") //将新标签放入 标签输入框中。

		}

		function deltag(e){
			var tag = e.parent()
			var val = Number(tag.attr("tagid"));
			removeArray(o.defaultData,val)

			if(o.defaultVal.indexOf(val) > -1){//如果原始值中不包含选中值，则在新增值中加入选中值
				o.removeVal.push(val)
			}
			
			removeArray(o.addVal,val)

			t.val(o.defaultData.join(","))//修改当前值
			tag.remove()
		}
		
		if(ctrl=="ShowList"){
			list()
		}

		if(ctrl=="destroy"){
			if(t.prop("tagName")=="Input"){//如果作用于div标签。
				tagInputE.remove()
				tagListE.remove()
				t.show()
			}
			if(t.prop("tagName")=="DIV"){//如果作用于div标签。
				t.html("")
				t.removeClass(o.tagListCSS)
			}
		}
	}


	$.fn.sTags = function(options){
		var t = $(this);
		if(t.attr("tagid")===undefined){
			var o = $.extend({}, $.fn.sTags.defaults,options);
			var id = Date.now()+""+Math.ceil(Math.random()*1000);
			o.addVal=[]
			o.defaultVal=[]
			o.removeVal=[]
			t.attr("tagid",id)
			t.data("sTipsSetOptions",o)
		}
		

		if(o.dataAttr.length==3){//设定数据属性
			for(var i in o.data){
				if(!o.data[i].id){
					o.data[i].id = o.data[i][o.dataAttr[0]]
				}
				if(!o.data[i].name){
					o.data[i].name = o.data[i][o.dataAttr[1]]
				}
				if(!o.data[i].screen){
					o.data[i].screen = o.data[i][o.dataAttr[2]]
				}
			}
		}

		if(!o.tagName){
			o.tagName = "div"
		}


		if(t.prop("tagName")=="DIV"){//如果作用于div标签。
			t
				.attr("tag-list-id",id)
				.addClass(o.tagListCSS)
			var newarr = [];
			if(Array.isArray(o.defaultData)){
				if(o.data.length>0){
					for(var i in o.data){
						if(o.defaultData.indexOf(Number(o.data[i].id)) > -1){
							newarr.push(o.data[i])
						}
					}
				}
				o.data = newarr
			}
			t.sTagsCtrl("ShowList")
		}

		if(t.prop("tagName")=="INPUT"){ //如果作用域输入框

			var inputdiv=$('<div/>',{//定义绑定输入框的div 即 标签输入框
				class:o.tagInputCSS,
				"tag-id":id
			})
			var tagList=$('<div/>',{//定义选择数据的div
				class:o.tagListCSS,
				"tag-list-id":id
			})

			t.hide();
			t.after(tagList)
			t.after(inputdiv)

			t.sTagsCtrl("ShowList")

			var tempData = []
			if(Array.isArray(o.defaultData)){//如果默认值是数组
				tempData = o.defaultData
			}
			if(t.val()){ //处理默认值
				tempData = t.val().split(",")
				t.val("")
			}
			tempData = tempData.map(Number)
			o.defaultVal = tempData
			o.defaultData = []
			for(var i in tempData){
				if(!isNaN(tempData[i])){
					$("[tag-list-id="+id+"]>[tagid="+tempData[i]+"]").click()
				}
			}
		}
	}

	$.fn.sTags.defaults = {
		data:[],//格式:{id:数字,name:文本,screen:筛选文本}
		data_:[],//附加标签（按钮）数据
		dataAttr:[],//因数据格式不同，这里填写三个分别对应要展现的 id name screen 属性的对应属性。如填写则必须填写3个
		//defaultData:[],//默认的数据，内容为data.id
		tagInputCSS:"sTags-input",//输入框css
		tagListCSS:"sTags",//列表css
		tagCSS:["sTags-old","sTags-new"],//输入框内标签样式，第一个为默认标签样式，第二个为新增标签样式
		color:1,//标签列表颜色，0不使用，1按screen的首字母，按顺序循环数组内颜色，2随机颜色，数组内颜色，值0为背景色，1为字色
		colorData:[
			["#90c5f0","#fff"],
			["#8E388E","#fff"],
			["#FFA500","#fff"],
			["#FBF","#fff"],
			["#DA70D6","#fff"],
			["#A2CD5A","#fff"],
			["#228B22","#fff"],
			["#CDC0B0","#fff"],
			["#CD7054","#fff"],
			["#00688B","#fff"]
			],//标签列表颜色，0不使用，1按screen的首字母，按顺序循环数组内颜色，2随机颜色，数组内颜色，值0为背景色，1为字色
		screen:true,//是否启用筛选功能
		screenInput:{
					type:"text",
					size:8,
					placeholder:"筛选"
				},//筛选输入框属性,
		tagTXT:"Tags:",//标签列表前缀
		click:function(e){
			console.log(e.attr("tagid"))
		},//当目标元素为div时，列表的点击事件。e为点击元素自身
		tagName:"",//标签列表使用的html标签，默认为div，如要改为div和a之外的其他标签则需要修改css
		tagHtml:"",//自定义标签列表中的html内容。{name} 替换为 tag.name {id}将转换为 tag.id,
		tagAttr:{}//标签属性
	};
})(jQuery);

