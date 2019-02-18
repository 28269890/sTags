/*
		jQuery 标签插件

ver 0.1

可应用于input和div标签

应用于input标签：将对input标签的数据进行修改

应用于div标签：实现tag标签列表的点击事件



配置文件说明
	data:标签数据：数组 --必填项
		格式例子：[{id:1,name:"sdd",screen:"sdd"},{id:2,name:"ggf",screen:"ggf"}]
		--div标签，当作用于div标签时，还可对每个标签添加单独的点击事件
		{
			id:1,
			name:"sdd",
			screen:"sdd",
			fn:function(e){//e为点击元素自身
				console.log(e.tagid)
			}
		}

	data_:附加标签数据，该数据将会显示在标签列表最后，以标签形式显示，作为单纯的按钮功能，不受标签、筛选和tagid限制。
		[
			{
				name:"",//标签名
				position:0,//插入位置：0最后插入，非零最前插入
				fn:function(){ //点击事件
					console.log("button1 event")
				}
			}
		]

	dataAttr：数据值添加：数组
		原有数据可能不会适应本插件，这里是为了补全本插件所用的数据
		如原有数据可能是，{index:1,title:"标题一",pinyin:"bt1"}
		那么为了能够让本插件正确使用这些数据，dataAttr的属性就应该填写["index","title","pinyin"]
		注意，要按照顺序填写
		index对应id
		title对应name
		pinyind对应screen

	defaultData:默认标签：数组 
		存放标签数据中的id的值
		当input标签中有数据是会替换本数值并转为数组
		数据例子：[1,2,3]
		--input标签
			当作用于input标签时，将会将默认值的标签填入标签编辑框
		--div标签
			当作用于div标签时，将不再显示所有标签而改为仅显示默认标签
	
	tagInputCSS:标签编辑框CSS样式：字符串  -- input标签有效
		默认值：sTags-input
	
	tagListCSS:待选标签列表CSS样式：字符串 
		默认值：sTags

	tagCSS:标签编辑框内的标签的CSS样式：数组  -- input标签有效
		默认值：["sTags-old","sTags-new"]
		数据0表示 defaultData（默认标签数据的样式）
		数据1表示 本次编辑新增加的标签的样式
	
	screen：标签列表筛选功能是否启用:bool值
		默认值：true
		该功能针对标签数据的screen，如果关闭该功能则忽略screen的数据。

	screenInput：筛选输入框属性：json
		默认值:{
					type:"text",
					size:8,
					placeholder:"筛选"
				}

	tagTXT：标签列表的前缀字符：字符串

	click:标签列表的点击事件 -- 当标签应用于div时有效  -- div标签有效
		例子：click:function(e){
			console.log(e.attr("gatid"),e.text())
		}

	color:标签列表颜色开关：数字
			--0:关闭
			--1:按screen首字符切换colorData内容
				要使用该功能，请将标签数据按照screen排序
				该功能要开启screen才有效
			--2:随机使用colorData内容
	colorData:要应用的标签列表的颜色数据：二维数组
			olorData[x][0]:标签背景色
			olorData[x][1]:标签字色







默认 样式表
<style type="text/css">
	.sTags-input{
		border: 1px solid #ccc;
		height: 100px;
	}
	.sTags-input>div{
		display: inline-block;
		padding: 5px 5px 5px 12px;
		margin: 2px;
		border-radius: 2px;

	}
	.sTags-input>div>a{
		display: inline-block;
		margin: 0 7px;
		color: #ddd;
		cursor: pointer;

	}
	.sTags{
		margin: 10px 0;
	}
	.sTags-old{
		color: #fff;
		background: #A2A;
	}
	.sTags-new{
		color: #fff;
		background: #A2CD5A;
	}
	.sTags>a,
	.sTags>div{
		cursor: pointer;
		display: inline-block;
		padding: 5px 12px;
		margin: 2px;
		border-radius: 2px;
		color: #fff;
		background: #A2CD5A;
	}
</style>
*/

(function($){
	$.fn.sTags = function(options){
		var o = $.extend({}, $.fn.sTags.defaults,options);
		var id = Date.now()+""+Math.ceil(Math.random()*1000);
		var this_ = $(this);

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

		if(o.tagName==""){
			o.tagName = "div"
		}

		var inputdiv=$('<div/>',{//定义绑定输入框的div 即 标签输入框
			class:o.tagInputCSS,
			"tag-id":id
		})
		var tagList=$('<div/>',{//定义选择数据的div
			class:o.tagListCSS,
			"tag-list-id":id
		})

		var list = function(target){//列出数据 target目标div指 定义选择数据的div
			if(o.screen){//如果启用筛选
				//定义筛选框
				$("<input>",o.screenInput).keyup(function(){
					var skey = $(this).val().replace(/[^a-zA-Z]/g,"")
					if(skey==""){
						$(target+">"+o.tagName+"[screen]").show()
					}else{
						$(target+">"+o.tagName+"[screen]").hide()
						$(target+">"+o.tagName+"[screen^='"+skey+"']").show()
					}
				}).appendTo(target)
			}

			var color = 0 //颜色内容
			var color_i = 0 //颜色计数
			var color_s = ""  //按筛选内容的首字母换色，保存首字母内容
		
			if(o.data.length>0){//如果有标签数据

				for(var i in o.data){//循环标签数据

					var attr = {}
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
						if(this_.prop("tagName")=="DIV"){
							if(typeof($(this).data("fn")) =="function"){
								$(this).data("fn")($(this))
							}else{
								o.click($(this))
							}
						}
						if(this_.prop("tagName")=="INPUT"){
							addtag($(this))
						}
					})

					E.appendTo(target)
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
					div.prependTo(target)
				}else{
					div.appendTo(target)
				}
			}

			$(target).prepend(o.tagTXT)//添加标签文本

		}


		if($(this).prop("tagName")=="DIV"){//如果作用于div标签。
			$(this)
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
			list("[tag-list-id="+id+"]")
		}

		if($(this).prop("tagName")=="INPUT"){ //如果作用域输入框

			$(this).hide();
			$(this).after(tagList)
			$(this).after(inputdiv)

			var addtag = function(e){ //向标签输入框中添加标签
				var val = this_.val();//获取当前值
				if(val==""){ //将当前值处理为数组
					val=[];
				}else{
					val = val.split(",")
				}

				val = val.map(Number)
				
				if(val.indexOf(Number(e.attr("tagid"))) > -1){ //如果当前值已存在点击值
					return false
				}

				val.push(e.attr("tagid")) //将点击值添加到当前值中

				this_.val(val.join(","))//修改当前值

				var cls = $("<a>x</a>").click(function(){
					deltag($(this))
				})//删除标签

				var newtag = $('<div><span>'+e.text()+'</span></div>')
					.attr("tagid",e.attr("tagid"))
					.append(cls)//向标签输入框中添加的新标签。

				if(Array.isArray(o.defaultData)){//如果默认值是数组
					if(o.defaultData.indexOf(Number(e.attr("tagid"))) > -1){//如果默认值中包含该值
						newtag.attr("class",o.tagCSS[0]) //添加默认值样式
					}else{
						newtag.attr("class",o.tagCSS[1]) //添加新值样式
					}				
				}else{
					newtag.attr("class",o.tagCSS[1]) //添加新值样式
				}

				newtag.appendTo("[tag-id="+id+"]") //将新标签放入 标签输入框中。

			}
			
			var deltag = function(e){
				var tag = e.parent()
				var val = this_.val();
				var re = new RegExp("([^\d]?)"+tag.attr("tagid")+"([^\d]?)","g")
				val = val.replace(/[^\d,]/).replace(re,"$1$2").replace(/,,/,",").replace(/^,/,"").replace(/,$/,"")
				this_.val(val)
				tag.remove()
			}

			list("[tag-list-id="+id+"]")

			if(this_.val()){ //处理默认值
				o.defaultData = this_.val().split(",")
				this_.val("")
			}

			if(Array.isArray(o.defaultData)){//如果默认值是数组
				o.defaultData = o.defaultData.map(Number)
			}

			for(var i in o.defaultData){
				$("[tag-list-id="+id+"]>[tagid="+o.defaultData[i]+"]").click()
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

