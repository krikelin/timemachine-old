/***

Copyright (C) 2012 Alexander Forselius

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
***/
var sp = getSpotifyApi(1);
var models = sp.require("sp://import/scripts/api/models");
/**
@module timemachine
@class Search
**/
exports.Search = function(start_year, end_year, query, options) {
	var decades = [];
	var trackList = [];
	var albumList = [];
	var artistList = [];
	var _observers = [];
	var curYear = 0;
	var pageSize = (typeof(options) !== "undefined") ?  ((typeof(options.pageSize) !== "undefined") ? options.pageSize : 15 ): 15;
	this.__defineGetter__("observers", function () {
		return _observers;
	});
	var trackList = [];
	this.__defineGetter__("tracks", function () {
		return trackList;
	});
	this.__defineGetter__("albums", function () {
		return albumList;
	});
	this.__defineGetter__("artists", function () {
		return artistList;
	});
	this.notify = function(event, data) {
		for(var i = 0; i < _observers.length; i++) {
			var observer = _observers[i];
			if(event == observer.event) {
				observer.observer.call(event, observer.data);
			}
		}
	};
	var _notify = this.notify;
	this.observe = function(event, observer) {
		var observer_ = {
			event: event,
			observer: observer
		};
		this.observers.push(observer_);
	};
	this.ignore = function(event, observer) {
		if(typeof(observer) === "undefined") {
			for(var i = 0; i < this.observers.length; i++) {
			
				if(oberver.event == event) {
					_observers.remove(observer);
				}
			}
		} else {
			_observers.remove(observer);
		}	
	};
	this.appendNext = function() {
		var i = 0;
		
	//	alert("A");
		/*
		alert(pageSize);
		console.log(quote);
		var years = [];
		
		for(var i = 0; i < end_year - start_year; i++) {
			years.push(" year:" + (i + start_year) + " ");
		}
		var q = years.join(" OR ");
		q+=" " + query;
		var search = new models.Search(q);
		alert(q);
		search.observe(models.EVENT.CHANGE, function() {
			console.log(search.tracks);
			for(var x = 0; x < search.tracks.length; x++) {
				
				
				trackList.push(search.tracks[x]);
				console.log(trackList);
			}
			for(var x = 0; x < 5; x++) {
				artistList.push(search.artists[x]);
			}
			for(var x = 0; x < 3; x++) {
				albumList.push(search.albums[x]);
			}
			
			_notify(models.EVENT.CHANGE, null);
			
		}, {pageSize:pageSize});*/	
		console.log(pageSize, (end_year - start_year),  pageSize / ((end_year - start_year) ) );
		console.log( pageSize / ((end_year - start_year) ));
		var quote = Math.round( (end_year - start_year) / pageSize );
		var cnt = quote*pageSize;
		var n = setInterval(function() {
			// Get two from each decade
		
		//	console.log(i);
			if((i % quote) == 0) {	
				
			//	console.log("FG");
				var cYear = parseInt(start_year) + i;
				console.log(cYear);
				//console.log(query);
			//	alert(query);
			//	console.log(("year:" + (cYear) + " " + query));
				var search = new models.Search("year:" + (cYear) + " " + query);
				search.observe(models.EVENT.CHANGE, function() {
				//	console.log("Q");
					console.log("A", cYear);
	
				for(var x = 0; x < pageSize && x < search.tracks.length; x++) {
						
						
						trackList.push(search.tracks[x]);
					//	console.log(trackList);
					}
					for(var x = 0; x < 5; x++) {
						artistList.push(search.artists[x]);
					}
					for(var x = 0; x < 3; x++) {
						albumList.push(search.albums[x]);
					}
					
				//	console.log(curYear);
					console.log("A");
					if(cYear >= end_year - 5) {
						
						
						_notify(models.EVENT.CHANGE, null);
						clearInterval(n);
					}
					
				}, {pageSize:quote});
				
				search.appendNext();
		
			}
			if(cYear > end_year-1) {
				clearInterval(n);
			}
			i++;
		}, 50);
		
	};
};