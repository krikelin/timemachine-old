exports.Search = function (params, prop) {	
	this.observers = [];
	var notify = function(evt, data) {
		for(var i = 0; i < this.observers.length; i++) {
			var observer = this.observers[0];
			if(observer.event == evt) {
				this.observer.callback(data);
			}
		}
	};
	this.notify = notify;
	this.observe = function(evt, callback) {
		var observer = { event: evt, callback: callback};
		this.observers.push(observer);
	};
	this.appendNext = function() {
		// http://en.wikipedia.org/w/api.php?format=xml&action=query&titles=Albert%20Einstein&prop=revisions&rvprop=content
		var url = "http://en.wikipedia.org/w/api.php?format=json&action=query&titles=" + encodeURI(params.titles) + "&prop=revisions&rvprop=content";
		var xmlHttp = new XMLHttpReqest();
		xmlHttp.onreadystatechange = function () {
			if(xmlHttp.readyState == 4) {}
		};
		xmlHttp.open("GET", url, true);
	};
};