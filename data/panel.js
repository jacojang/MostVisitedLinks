function init(){
}

function openNewTab(url){
	self.port.emit('openNewTab',url);
}

function openNewHere(url){
	self.port.emit('openNewHere',url);
}

function createElement(type,classname,text,tooltip){
	var t = document.createElement(type);
	if(classname){
		t.className = classname;
	}
	if(text){
		t.textContent = text;
	}
	if(tooltip){
		t.title = tooltip;
	}

	return t;
}

var getTitleCharReg = new RegExp("http.*?://[^.]*.(.)");
function getRepChar(tdata)
{
	if(tdata.title && tdata.title.length > 0){
		return tdata.title[0];
	}

	var ret = getTitleCharReg.exec(tdata.url);
	if(ret.length < 2) return "J";
	return ret[1].toUpperCase();
}

self.port.on('show_favico',function(url,id){
	if(!url || url.length == 0 || !id || id.length == 0) return;

	var favico = document.getElementById(id);
	if(!favico) return;

	var img = createElement("IMG","favico_img");
	img.src = url;
	favico.textContent = "";
	favico.appendChild(img);
})

self.port.on('init',function(data,history){
	var contents = document.getElementById('contents');
	if(!contents) return;

	var top30 = [];
	for(var i=0; i<data.length && i < 30 ; i++){
		var tdata = data[i];
		if(history.hasOwnProperty(tdata['url'])){
			tdata["visitCount"] += (parseInt(history[tdata["url"]])*2);
		}
		top30.push(tdata);
	}

	top30.sort(function(a,b){
		return b["visitCount"] - a["visitCount"];
	})

	// Erase All list
	while(contents.firstChild){
		contents.removeChild(contents.firstChild);
	}

	// Build List
	// favico, title(url), openHere
	for(var i = 0 ; i < top30.length && i < 20 ; i++){
		var tdata = top30[i];

		var container = createElement("DIV","container");
		var favico = createElement("DIV","favico",getRepChar(tdata));
		favico.id = "favi_"+i;
		if(!tdata.title || tdata.title.length < 1){
			var title = createElement("DIV","title",tdata.url,tdata.url);
		}else{
			var title = createElement("DIV","title",tdata.title,tdata.url);
		}
		var openHere = createElement("DIV","openhere","New tab");

		(function(url,node){
			node.onclick=function(){ openNewTab(url); }
		})(tdata.url,openHere);

		(function(url,node){
			node.onclick=function(){ openNewHere(url); }
		})(tdata.url,title);

		(function(url,node){
			node.onclick=function(){ openNewHere(url); }
		})(tdata.url,favico);

		container.appendChild(favico);
		container.appendChild(title);
		container.appendChild(openHere);
		contents.appendChild(container);

		self.port.emit("get_favico",tdata.url,favico.id);
	};
});
