/***

Copyright (C) 2012 Alexander Forselius

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
***/
/***************
@module echonest
***/
var sp = getSpotifyApi(1);
var models = sp.require("sp://import/scripts/api/models");

function toQuerystring(params) {
	var c = "";
	for(var key in params) {
		c += key + "=" + encodeURI(params[key]) + "&";
	}
	return c;
}
exports.EVENT = {
	CHANGE : 0x01
};

/***
@class Search
@implements Observerable
***/
exports.Search = function(api_key, params, options) {
	var _observers = [];
	this.__defineGetter__("observers", function () {
		return _observers;
	});
	var trackList = [];
	this.__defineGetter__("tracks", function () {
		return trackList;
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
	var resultIndex = 0; // ResultIndex
	var pageSize = (typeof(options) !== "undefined") ? ((typeof(options.pageSize) !== "undefined") ? options.pageSize : 30) : 30;
	this.baseUri = "http://developer.echonest.com/api/v4/song/search?api_key=" + api_key + "&results=" + pageSize;
	
	this.baseUri+="&" + toQuerystring(params) + "&start={page}&bucket=tracks&bucket=id:spotify-WW";
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			if(xmlHttp.status == 200) {
				var data = eval("(" + xmlHttp.responseText + ")");
				resultIndex++; // Increase resultindex
			
				console.log(data);
				var currentIndex = 0;
				// Response
				var count = 0;
				
				// Enumerate all content
				for(var x = 0; x < data.response.songs.length; x++) {
					var song = data.response.songs[x];
					var tracks = song.tracks;
					for(var i = 0; i < 1 && n < song.tracks.length; i++) {
						count++;
					}
				}
			
				for(var x = 0; x < data.response.songs.length; x++) {
					 // The count of elements in the result
			
					var song = data.response.songs[x];
					
				
					for(var n = 0; n < 1 && n < song.tracks.length; n++) {
						var track =  song.tracks[n];
						console.log(song);
						var id = track.foreign_id;						// Grab the ID
						var uri = id.replace("spotify-WW:","spotify:"); // Convert to REAL spotify URI
							
						console.log(uri);
							// Lockup the song on Spotify
						models.Track.fromURI(uri, function(track) {
							
							trackList.push(track);
							currentIndex++;
							console.log(currentIndex + " " + count);
							// I will measure so it will raise the callback when this pointer is increaesd to the count:
							if(currentIndex >= count -1) {
								_notify(models.EVENT.CHANGE, null);
							}
							
						});
					}
				}
			}
		} else {
		}
	};

	this.appendNext = function () {
		console.log(this.baseUri.replace("{page}", resultIndex));
		xmlHttp.open("GET", this.baseUri.replace("{page}", resultIndex), true);
		xmlHttp.send(null);
	};
};
exports.Search.prototype = new models.Observable();

/***
@class Radio
@implements Observerable
***//*
exports.Radio = function(api_key, params) {
	var _observers = [];
	this.__defineGetter__("observers", function () {
		return _observers;
	});
	var trackList = [];
	this.__defineGetter__("tracks", function () {
		return trackList;
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
	var resultIndex = 0; // ResultIndex
	this.baseUri = "http://developer.echonest.com/api/v4/playlist/basic?api_key=" + api_key + "";
	
	this.baseUri+="&" + toQuerystring(params) + "&start={page}&bucket=tracks&bucket=id:spotify-WW";
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			if(xmlHttp.status == 200) {
				var data = eval("(" + xmlHttp.responseText + ")");
				resultIndex++; // Increase resultindex
			
				console.log(data);
				var currentIndex = 0;
				// Response
				var count = 0;
				
				// Enumerate all content
				for(var x = 0; x < data.response.songs.length; x++) {
					var song = data.response.songs[x];
					var tracks = song.tracks;
					for(var i = 0; i < tracks.length; i++) {
						count++;
					}
				}
			
				for(var x = 0; x < data.response.songs.length; x++) {
					 // The count of elements in the result
			
					var song = data.response.songs[x];
					
				
					for(var n = 0; n < song.tracks.length; n++) {
						var track =  song.tracks[n];
						console.log(song);
						var id = track.foreign_id;						// Grab the ID
						var uri = id.replace("spotify-WW:","spotify:"); // Convert to REAL spotify URI
							
						console.log(uri);
							// Lockup the song on Spotify
						models.Track.fromURI(uri, function(track) {
							
							trackList.push(track);
							currentIndex++;
							console.log(currentIndex + " " + count);
							// I will measure so it will raise the callback when this pointer is increaesd to the count:
							if(currentIndex >= count -1) {
								_notify(models.EVENT.CHANGE, null);
							}
							
						});
					}
				}
			}
		} else {
		}
	};

	this.getNext = function () {
		console.log(this.baseUri.replace("{page}", resultIndex));
		xmlHttp.open("GET", this.baseUri.replace("{page}", resultIndex), true);
		xmlHttp.send(null);
	};
};

*/
/***
@class Playlist
@implements Observerable
Note You do not create this from scractch, use byParams.
***/
exports.Playlist = {
	/**
	@method fromParams
	@returns A Playlist with the tracks
	**/
	byParams: function(api_key, params, callback) {
	
			var _observers = [];
			this.__defineGetter__("observers", function () {
				return _observers;
			});
			var trackList = [];
			this.__defineGetter__("tracks", function () {
				return trackList;
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
			var resultIndex = 0; // ResultIndex
			this.baseUri = "http://developer.echonest.com/api/v4/playlist/static?api_key=" + api_key + "";
			
			this.baseUri+="&" + toQuerystring(params) + "&bucket=tracks&bucket=id:spotify-WW";
			var xmlHttp = new XMLHttpRequest();
			
			xmlHttp.onreadystatechange = function() {
				if(xmlHttp.readyState == 4) {
					if(xmlHttp.status == 200) {
						console.log("A");
						var data = eval("(" + xmlHttp.responseText + ")");
						resultIndex++; // Increase resultindex
						// Create a temporary playlist
						var playlist = new models.Playlist();
						console.log(data);
						var currentIndex = 0;
						// Response
						var count = 0;
						
						// Enumerate all content
						for(var x = 0; x < data.response.songs.length; x++) {
							var song = data.response.songs[x];
							var tracks = song.tracks;
							for(var i = 0; i < tracks.length; i++) {
								count++;
							}
						}
					
						for(var x = 0; x < data.response.songs.length; x++) {
							 // The count of elements in the result
					
							var song = data.response.songs[x];
							
						
							for(var n = 0; n < song.tracks.length; n++) {
								var track =  song.tracks[n];
								console.log(song);
								var id = track.foreign_id;						// Grab the ID
								var uri = id.replace("spotify-WW:","spotify:"); // Convert to REAL spotify URI
									
								console.log(uri);
									// Lockup the song on Spotify
								models.Track.fromURI(uri, function(track) {
									
									playlist.add(track);
									currentIndex++;
									console.log(currentIndex + " " + count);
									// I will measure so it will raise the callback when this pointer is increaesd to the count:
									if(currentIndex >= count -1) {
										callback.call(playlist);
									}
									
								});
							}
						}
					}
				} else {
				}
				
			};
			console.log(this.baseUri.replace("{page}", resultIndex));
				xmlHttp.open("GET", this.baseUri.replace("{page}", resultIndex), true);
				xmlHttp.send(null);
		}
};