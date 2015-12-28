var self = require('sdk/self');
var tabs = require("sdk/tabs");
let { search } = require("sdk/places/history");

var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");

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
			width:500,
			height:500,
			position: button
		});

		let lastWeek = Date.now - (1000*60*60*24*7);
		search(
		  [{ from: lastWeek }],
		  { sort: "visitCount", descending:true }
		).on("end", function (results) {
			console.log(results);
			panel.port.emit('init',results);
		});
	}
}

function handleHide() {
	button.state('window', {checked: false});
}

panel.port.on('openNewTab',function(url){
	tabs.open(url);
	panel.hide();
});

panel.port.on('openNewHere',function(url){
	tabs.activeTab.url = url;
	tabs.activeTab.activate();
	panel.hide();
});