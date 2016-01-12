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
		var favico = createElement("SPAN","favico",(i+1));
		if(!tdata.title || tdata.title.length < 1){
			var title = createElement("SPAN","title",tdata.url,tdata.url);
		}else{
			var title = createElement("SPAN","title",tdata.title,tdata.url);
		}
		var openHere = createElement("SPAN","openhere","Open Here");

		(function(url,node){
			node.onclick=function(){ openNewTab(url); }
		})(tdata.url,title);

		(function(url,node){
			node.onclick=function(){ openNewHere(url); }
		})(tdata.url,openHere);

		container.appendChild(favico);
		container.appendChild(title);
		container.appendChild(openHere);
		contents.appendChild(container);
	};
});
