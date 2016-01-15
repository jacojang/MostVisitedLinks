let daysAgo = 30;
var self = require('sdk/self');
var tabs = require("sdk/tabs");
let { search } = require("sdk/places/history");
let { getFavicon } = require("sdk/places/favicon");

var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var mvldb = require("lib/mvldb");
mvldb.open("1",daysAgo,function(){
	mvldb.removeOldItems();
	setInterval(function(){
		mvldb.removeOldItems();
	},7200000);
});
var button = ToggleButton({
	id: "mostvisitedlink",
	label: "Most visited link",
	icon: {
		"16": "./img/star-icon-16.png",
		"32": "./img/star-icon-32.png",
		"64": "./img/star-icon-64.png"
	},
	onChange: handleChange
});

var panel = panels.Panel({
	contentURL: self.data.url("panel.html"),
	contentScriptFile:self.data.url("panel.js"),
	onHide: handleHide
});

function handleChange(state) {
	if (state.checked) {
		panel.show({
			width:454,
			height:500,
			position: button
		});

		let lastWeek = Date.now - (1000*60*60*24*daysAgo);
		search(
		  [{ from: lastWeek }],
		  { sort: "visitCount", descending:true }
		).on("end", function (results) {
			//console.log(results);
			panel.port.emit('init',results,mvldb.getHistory());
		});
	}
}

function handleHide() {
	button.state('window', {checked: false});
}

panel.port.on('openNewTab',function(url){
	mvldb.addItem(url);
	tabs.open(url);
	panel.hide();
});

panel.port.on('openNewHere',function(url){
	mvldb.addItem(url);
	tabs.activeTab.url = url;
	tabs.activeTab.activate();
	panel.hide();
});

panel.port.on('get_favico',function(inUrl,id){
	getFavicon(inUrl).then(function (url) {
		panel.port.emit("show_favico",url,id);
	});
});
