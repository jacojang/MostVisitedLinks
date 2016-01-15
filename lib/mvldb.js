var { indexedDB, IDBKeyRange } = require('sdk/indexed-db');
var database = {};
var history = {};

database.onerror = function(e) {
	console.error(e.value)
}

function openDB(version,cb) {
	var request = indexedDB.open("URLDB", version);

	request.onupgradeneeded = function(e) {
		var db = e.target.result;
		e.target.transaction.onerror = database.onerror;

		if(db.objectStoreNames.contains("history")) {
			db.deleteObjectStore("history");
		}
		var store = db.createObjectStore("history", {keyPath: "time"});
	};

	request.onsuccess = function(e) {
		if(cb){
			database.db = e.target.result;
			cb();
		}
	};
	request.onerror = database.onerror;
};

function addItem(url) {
	var db = database.db;
	var trans = db.transaction(["history"], "readwrite");
	var store = trans.objectStore("history");
	var time = new Date().getTime();
	var request = store.put({
		"url": url,
		"time": time
	});

	if(!history.hasOwnProperty(url)){
		history[url] = 0;
	}
	history[url] += 1;
	request.onerror = database.onerror;
};

function getItems(callback) {
	var cb = callback;
	var db = database.db;
	var trans = db.transaction(["history"], "readwrite");
	var store = trans.objectStore("history");
	history = {};

	trans.oncomplete = function() {
		if(cb) cb(history);
	}

	var ctime = (new Date()).getTime();
	var bound = ctime - ( database.daysAgo * 86400000 );

	var keyRange = IDBKeyRange.lowerBound(bound);
	var cursorRequest = store.openCursor(keyRange);

	cursorRequest.onsuccess = function(e) {
		var result = e.target.result;
		if(!!result == false)
		return;

		if(!history.hasOwnProperty(result.value.url)){
			history[result.value.url] = 0;
		}
		history[result.value.url] += 1;
		result.continue();
	};

	cursorRequest.onerror = database.onerror;
};

function removeOldItems(){
	var db = database.db;
	var trans = db.transaction(["history"], "readwrite");
	var store = trans.objectStore("history");
	var history = new Object();

	trans.oncomplete = function() {
		getItems();
	}

	var ctime = (new Date()).getTime();
	var bound = ctime - ( database.daysAgo * 86400000 );

	var keyRange = IDBKeyRange.upperBound(bound);
	var cursorRequest = store.openCursor(keyRange);

	cursorRequest.onsuccess = function(e) {
		var result = e.target.result;
		if(result) {
			var request = result.delete();
			request.onsuccess = function() { };
			result.continue();
		}
	};
};

exports.open = function(version,daysAgo,success){
	database.daysAgo = daysAgo;
	openDB(version,success);
}

exports.getHistory = function(){
	return history;
}

exports.addItem = addItem;
exports.getItems = getItems;
exports.removeOldItems = removeOldItems;
