/***
Copyright (C) 2012 Alexander Forselius

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var sp = getSpotifyApi(1);
var models = sp.require("sp://import/scripts/api/models");
var views = sp.require("sp://import/scripts/api/views");
var jquery = sp.require("sp://timemachine/js/jquery-1.7.2.min");
var nouislider = sp.require("sp://timemachine/js/jquery.nouislider");
var player = models.application.player;
exports.init = init;
var playlist = null;
var cache = new Array();
var draggingElement = null;
//googletracker = sp.require("sp://import/scripts/googletracker")


function authenticate() {
	var sp = getSpotifyApi(1);
	var auth = sp.require('sp://import/scripts/api/auth');

	auth.authenticateWithFacebook('257960877591796', ['user_about_me', 'user_checkins'], {

		onSuccess : function(accessToken, ttl) {
			console.log("Success! Here's the access token: " + accessToken);
		},

		onFailure : function(error) {
			console.log("Authentication failed with error: " + error);
		},

		onComplete : function() { }
	});
}

//tracker = new googletracker.GoogleTracker("UA-32248258-1");
var query = "";
var _gaq = _gaq || [];
function init(){


	
	_gaq.push(['_setAccount', 'UA-32248258-1']);
	_gaq.push(['_trackPageview']);

	(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();

	console.log(sp.core);
	/*setInterval(function () {
		// console.log(current_playlist);
		if(current_playlist != null) {	
			console.log("F");
			if(!current_playlist.data.subscribed) {
					$("#add_playlist").removeAttr("disabled");
				
			}
		}
	}, 1000);*/
	load();
//	tracker.track("Startup");
	
}
function switch_section(section) {
	$(".section").each(function(index) {
		
		$(this).hide();
	});
//	tracker.track(section);
	document.getElementById("section_" + section).style.display="block";

	
}
var first = true;
var changable = false;
/***
Generate a new track
****/
var temp_playlist = null;
var tile_size = 256;
var left = 1220;
function getLeft(no) {
	return   window.innerWidth +((no) * tile_size);
}
function scrollTo(no) {	
	$("#l_track").html("");
	$("#r_track").html("");
	$("#track").html("");
	var track = temp_playlist.get(no);
	// Create first view
	var player = new views.Image(track.data.album.cover, track.data.uri, "M");
	player.node.style.width = "340px";
	player.node.style.height = "340px";
	
	$("#track").append(player.node);
	
	// Create left and rightview
	
	// Create left view
	if(no > 0) {
		track = temp_playlist.get(no - 1);
		var l_player = new views.Image(track.data.album.cover, track.data.uri, "M");
	
		l_player.node.style.width = "120px";
		l_player.node.style.height = "120px";
		$("#l_track").append(l_player.node);
	}
	if(no < temp_playlist.tracks.length - 1) {
		track = temp_playlist.get(no+1);
		var r_player = new views.Image(track.data.album.cover, track.data.uri, "M");
	
		r_player.node.style.width = "120px";
		r_player.node.style.height = "120px";
		$("#r_track").append(r_player.node);
	}
	
}
var current_playlist = null;

function addAsPlaylist() {
	console.log(models.EVENT);
	$("#add_playlist").attr("disabled", "true");
	var years = start_year != end_year ? start_year + " - " + end_year : start_year;
	var newPlaylist = new models.Playlist("Time Machine - Year " + years + " " + (query != "" ? "(" + decodeURI(query) + ")" : ""));
	//models.Playlist.fromURI("spotify:user:darksonic90:playlist:4vEi9FCVeXrEe1VxGgataP", function(newPlaylist) {
	
		console.log(newPlaylist);
		
		for(var i = 0; i < playlist.length; i++) {
		
			newPlaylist.add(playlist.get(i));
		}
		current_playlist = newPlaylist;
		
		newPlaylist.observe(models.EVENT.CHANGE, function () {
			
			if(!newPlaylist.subscribed) {
				$("#add_playlist").removeAttr("disabled");
			}
		});
		/*$("#add_playlist").fadeOut(function () {
			$("#showPlaylist").fadeIn();
			console.log(current_playlist);
			$("#showPlaylist").attr("href", current_playlist.data.uri);
		});*/
	//});
}

function createPlaylist(playlist, params) {
	_gaq.push(["_trackEvent", "user_created_playlist", params]);
	$("#c_player").html("");
	$("#c_playlist").html("");
	if(playlist.tracks.length < 1) {
		$("#flow").html("<center><span class=\"label\">No songs were found</spn></center>");
		return;
	}
	
	var player = new views.Player(playlist);
	player.context = playlist;
	console.log("A");
	var template = models.readFile("templates/time.html");
	var searchField = document.getElementById("query");
	
	searchField.setAttribute("placeholder", searchField.dataset["template"].replace("${start}", year).replace("${end}", end));
	try {
		var table = sp.require("sp://timemachine/scripts/api/table");
	console.log(playlist);
	var list = new table.Table(playlist, function(track) {
	
		try {
			var track = new views.Track(track, views.Track.FIELD.SHARE| views.Track.FIELD.STAR| views.Track.FIELD.NAME | views.Track.FIELD.ARTIST | views.Track.FIELD.ALBUM | views.Track.FIELD.DURATION);
			
		//	console.log(track.track);
			var year = track.track.data.album.year;
				
			$(track.node).append("<span class=\"sp-track-field-year\"><a href=\"spotify:app:timemachine:year:" + year + ":" + year + ":" + params + "			\">" + year + "</a></span>");
			track.node.innerHTML = "<span style=\"opacity:0.8;box-shadow:inset 0px 0px 3px #222222; background-image: url('" + track.track.data.album.cover + "'); background-size:100%; background-position: 0% 0%;\" class=\"sp-track-field-cover\" ><span></span></span>" + track.node.innerHTML;
			return track;
		} catch (e) {
			console.log(e.stack);
		}
	});
	list.tableHeader.node.innerHTML = ("<span class=\"sp-column sp-header sp-track-field-cover\"></span>") + list.tableHeader.node.innerHTML;
	$(list.tableHeader.node).append("<span class=\"sp-column sp-header sp-track-field-year\">Year</span>");
	} catch(e) {
		console.log(e.stack);
	}

	
	$("#flow").html(template);

	$("#c_player").append(player.node);
	
	
	list.node.getElementsByTagName("div")[0].style.height= "auto";
	
//	alert("A");
	
	
	console.log(list.node);
	
	$("#c_playlist").append(list.node);
	
	var btn = document.createElement("button");
	$(btn).addClass("button sp-flat");
	$(btn).html("Show search results");
	$(btn).css({"cursor":"pointer"});
	player.node.getElementsByTagName("a")[0].style.cursor = "default";
	player.node.getElementsByTagName("a")[0].setAttribute("title", "");
	btn.setAttribute("onclick", "self.location='spotify:search:year:" + year +  "-" + end + " "	 + params.decodeForText() + "'");
	$("#c_field").append(btn);
	$("#c_field").append("<span id=\"cf\"><button id=\"add_playlist\" class=\"add-playlist button icon\" value=\"" + playlist.uri + "\"><span class=\"plus\"></span>Add as playlist</button><a href=\"#\" style=\"display: none\" id=\"showPlaylist\"><button class=\"button\" style=\"cursor: pointer\">Show playlist</button><a></span>");
	
	$("#c_field").append("<span id=\"cf\"><button id=\"share_playlist\" class=\"add-playlist button icon\" onclick=\"share('http://open.spotify.com/app/timemachine/year/" + year + "/" + end + "/" + params.decodeForText()+ "')\"><span class=\"share\"></span>Share</button><a href=\"#\" style=\"display: none\" id=\"showPlaylist\"><button class=\"button\" style=\"cursor: pointer\">Show playlist</button><a></span>");
	$("#c_player").append("<div id=\"share\">" + document.getElementById("share_template").innerHTML + "</div>");
	$("#add_playlist").bind("click", addAsPlaylist);
	$(btn).css({"cursor":"pointer"});

}
/**
@from http://www.hardcode.nl/subcategory_1/article_317-array-shuffle-function
**/
function arrayShuffle(oldArray) {
	var newArray = oldArray.slice();
 	var len = newArray.length;
	var i = len;
	 while (i--) {
	 	var p = parseInt(Math.random()*len);
		var t = newArray[i];
  		newArray[i] = newArray[p];
	  	newArray[p] = t;
 	}
	return newArray; 
};
 

var year = 1950;
var end = new Date().getFullYear();
var echonest = sp.require("sp://timemachine/scripts/api/echonest");
var tm = sp.require("sp://timemachine/scripts/api/timemachine");
function scrobble(year, end, params) {
//	tracker.track("scrobble?year=" + year + "&end=" + end + "&params=" + params);
	_gaq.push(["_trackEvent", "scrobble", ("start=" + year + "&end=" + end + "&params=" + params)]);
	query = params;
	if(!activated) {
		return;
	}
	$("#example").html("spotify:search:year:" + year + "-" + end);
	$("#example").attr("href", "spotify:search:year:" + year + "-" + end);
	
	var options =
	{	
		"searchAlbums" : false,
		"searchArtists" : false,
		"pageSize": 50,
	};
	var d = document.getElementById("artists");
				d.innerHTML = "";
				var e = document.getElementById("artists_text");
				e.innerHTML = "";
	var _query = "year:" + year + "-" + end + " " + decodeURI(params) + "";
	if(params.indexOf("<!") == 0)
		_query="";
	//alert(query);
	$("#c_playlist").html("<br /><div class=\"loader\"></div>"); // Clear
	console.log("year:" + year + "  " + params + "");
	console.log(year);
	query = params;
	console.log(document.getElementById("query").value);
	var search = new tm.Search(year, end, query, {pageSize:6}); /* new tm.Search(year, end, query, {pageSize:10});*/
		
	if(playlists[year + "-" + end + " " + params] != undefined) {
		playlist = playlists[year + "-" + end + " " + params];
		createPlaylist(playlist, params);
		
	} else {
		
		playlist = new models.Playlist();
		search.observe(models.EVENT.LOAD_ERROR, function() {
			$("#flow").html("<b>Sorry an error occured in the search. Try again later</b>");
		});
		$("#albums").html("<flow id=\"albumlist\"></flow>");
		search.observe(models.EVENT.CHANGE, function() {

			/*search.tracks.forEach(function(track) {
				console.log(track);
				playlist.add(track);
			});*/
		
			/*var combined = search.tracks.concat(search.tracks, search1.tracks);
			var results = arrayShuffle(combined);
			results.sort(function(track, track2) {
				console.log(track2);
				return track2.data.album.year > track.data.album.year;
			});
			results.forEach(function(track) {
				playlist.add(track);
			});*/
		
			try {
				console.log(search.tracks);
				search.tracks.forEach(function(track) {
					//	console.log(track);
					playlist.add(track);
				});
				
				var d = document.getElementById("artists");
				d.innerHTML = "";
				var e = document.getElementById("artists_text");
				e.innerHTML = "";
				var i = 0;
				for(var i = 0; i < search.artists.length && i < 5; i++) {
					var artist = search.artists[i];
	
					try {
					var img = new views.Image(artist.data.portrait, artist.data.uri, artist.data.name);
					img.node.style.width = "64px";
					img.node.style.height = "64px";
					img.node.style.cssFloat = "left";
					d.appendChild(img.node);
					e.innerHTML += "<li style=\"float: left\"><a href=\"" + artist.data.uri + "\">" + artist.data.name + "</a></li>";
					} catch(e) {
						console.log(e.stack);
					}
				
				}
			} catch (e) {
		
				console.log(e);
			}

			var i = 0;
		/*	search.albums.forEach(function(album) {
				if(i < 10) {
					//var img = new views.Image(album.data.cover, album.data.uri, album.data.name);
				
					try {
						models.Album.fromURI(album.data.uri, function(album) {
							var img = new views.Player(album);
							img.context = album;
							img.track = album.get(0);
							img.node.style.width = "94px";
							img.node.style.height = "94px";
							img.node.style.margin = "5px";
							
							$("#albumlist").append(img.node);
						});
					} catch (e) {
						console.log(e.stack);
					}
				}
				i++;
			});*/
			createPlaylist(playlist, params);
			
			
			
		});
		search.appendNext();
		
		// Get list of compilations
		var search2 = new models.Search("artist:\"Various Artists\" year:" + year + "-" + end + " " + params, {pageSize: 5, searchTracks:false, searchAlbums: true, searchArtists: false});
		search2.observe(models.EVENT.CHANGE, function () {
			console.log(search2.albums);
			var d = document.getElementById("compilations");
			d.innerHTML = "";
			search2.albums.forEach(function(album) {
				console.log(album);
				
				models.Album.fromURI(album.data.uri, function (album) {
					try {
						var player = new views.Player(album);
						player.context = album;
						player.track = album.get(0);
						player.node.style.cssFloat = "left";
						d.appendChild(player.node);
					} catch (e) {
						console.log(e.stack);
					}
				});
			});
		});

		search2.appendNext();
/*		
		search3.observe(models.EVENT.CHANGE, function () {
			console.log(search2.albums);
			var d = document.getElementById("compilations");
			d.innerHTML = "";
			
		});*/
		/*
			var player = new views.Player(playlist);
			player.context = playlist;
			console.log("A");
			var template = models.readFile("templates/time.html");
			try{
				var list = new views.List(playlist, function(track) {
					return new views.Track(track, views.Track.FIELD.SHARE| views.Track.FIELD.STAR| views.Track.FIELD.NAME | views.Track.FIELD.ARTIST | views.Track.FIELD.DURATION);
				});
				$("#flow").html(template);
				
				console.log(player.node.getElementsByTagName("a")[0]);
				console.log("FWAR");
				$("#c_player").append(player.node);
				console.log(player.node);	
				player.node.getElementsByTagName("a")[0].setAttribute("style","cursor: default !important");
				player.node.getElementsByTagName("a")[0].setAttribute("href", "");
				player.node.getElementsByTagName("a")[0].setAttribute("title", "");
				player.node.getElementsByTagName("a")[0].setAttribute("href", "");
				console.log(list);
				list.node.getElementsByTagName("div")[0].setAttribute("style", "");
				console.log(list.node.getElementsByTagName("div")[0]);
				console.log(list.node);
				
				$("#c_playlist").append(list.node);
				
				$("#c_player").append("<br/><button id=\"add_playlist\" class=\"add-playlist button icon\" value=\"" + playlist.uri + "\"><span class=\"plus\"></span>Add as playlist</button>");
				$("#add_playlist").bind("click", addAsPlaylist);
				$(btn).css({"cursor":"pointer"});
		//		$("#c_playlist").append(list.node);
				console.log(player.node);
				
				console.log(player.node);
			
				
			}catch(e) {
				console.log(e.stack);
			}
			console.log("year:1901-" + year + "  " + params + "");
			var btn = document.createElement("button");
			$(btn).addClass("button sp-flat");
			$(btn).html("Show more matches");
			btn.style.cursor = "pointer";
			btn.setAttribute("onclick", "self.location='spotify:search:year:" + year + "+" + params + "'");
			$("#c_player").append(btn);*/
			
	
		
	}
}
var genre ="";
var year = 2011;
var can_change = true;
var preTrack = null;
var nowTrack = null;
var activated = true;
var playlists = {};
var start_year = 0;
var end_year = 0;
var START_YEAR = 1950;
var timeslider = null;
var bigyear = null;
var inProgress = false;
var dragging = false;
function setSlider(year, end) {
	timeslider = $("#timeslider");
	var interval = new Date().getFullYear() - START_YEAR;
			
	var e = [Math.round((year - START_YEAR) / (interval) * 100), Math.round((end - START_YEAR ) / (interval) * 100)];
	console.log("AQC", e);
	inProgress =true;
	if(!isNaN(year)&&!isNaN(end) && year > 0 && end > 0)
	timeslider.noUiSlider("move", {
	
		setTo: e
	});
	$("#startyear").html(year);
	$("#endyear").html(end);
}
function setTime(args) {
	try {
		if(!isNaN(args[1]) && !isNaN(args[2])) {
			console.log(args);
			year = args[1];
			end = args[2];
			start_year = year;
			end_year = end;
		//	switch_section("radio");
			genre = "";
			if(args.length > 3) {
				var start = 3;
				for(var i = start; i < args.length; i++) {
					
					genre += ((i > start) ? ":" : "") + args[i].decodeForText();
				}
			}
			var endYear = (new Date().getFullYear() - START_YEAR);
			console.log(genre);
			console.log(year, end);
			scrobble(year, end, genre.replace("___",":"));
			
			console.log("FWRF");
			var start = 3;
			$("#query").val("");
			if(args.length > 3) {
				
				for( var i = start; i < args.length; i++) {
					$("#query").val($("#query").val() +((i > start) ? ":" : "") + args[i].decodeForText());
				
				}
			}
			
			inProgress = false;
			console.log("AGWETFW", year, end);
			try {
				setTimeout(function () {
				console.log("DADA", year, end);
					setSlider(year, end);
				}, 25);
			}catch(e) {
				console.log(e.stack);
			}
			//$(bigyear).html(year.decodeForText() + " - " + end);
			console.log(bigyear);
		} else {
	//		switch_section("overview");
			
		}
	} catch( e) {
		console.log(e.stack);
	}
}
function reset() {
	
	args = ["year", new Date().getFullYear()-1, new Date().getFullYear()];
	console.log(args);
	setSlider(1990, new Date().getFullYear());
	return args;
}
var progressive = false;
var curURI = "";
var activating = false;
function load(){
	var args = [];
	if(args.length < 2)
		args = ["year", 1950, new Date().getFullYear()];
	
	setTime(args);
	
	// load miniplayer
	if(models.session.state != 1) {
		$("body").css({"overflow":"hidden"});
		$("#connLost").show();
	}
	models.Playlist.fromURI("spotify:user:drsounds:playlist:1G8msMVpoksRtZj5GeFM1T" , function (playlist) {
		console.log(playlist.data.cover);
		var pl = new views.Image(playlist.data.cover, playlist.data.uri, playlist.data.name);
		
		$(pl.node).css({"float":"left", "display":"inline", "width":"40px", "height":"40px"});
		$("#miniplayer").append(pl.node);
	});
	timeslider = $("#timeslider");
	$("#bigyear").html("Select year");
	
	models.session.observe(models.EVENT.STATECHANGED, function () {
		console.log(models.session.state);
		if(models.session.state != 1) {	
		//	$("#section_overview").show();
			$("#connLost").show();
			$("body").css({"overflow":"hidden"});
			
		//	$("body").append("<div id=\"connLost\" class=\"fade\"><div class=\"msg\">The connection is lost.</div></div>");
		} else {	
			
			$("#connLost").css({"display":"none"});
			$("body").css({"overflow":"auto"});
			
		//	$("#section_overview").hide();
		//	var c = $("#connLost");
			//c.remove();
		}
	});
/*	document.getElementsByTagName("nav")[0].addEventListener("mouseup", function() {
	
		if(!inProgress) return;
		start_year = Math.round((timeslider.noUiSlider("getValue")[0]/100) * (new Date().getFullYear() - START_YEAR)) + START_YEAR;
		end_year = Math.round((timeslider.noUiSlider("getValue")[1]/100) * (new Date().getFullYear() - START_YEAR)) + START_YEAR ;
		self.location="spotify:app:timemachine:year:" + start_year + ":" + end_year + ":" + document.getElementById("query").value.replace(":","___").decodeForText();
	});
	document.getElementsByTagName("body")[0].addEventListener("mouseup", function() {
	
		if(!inProgress) return;
		start_year = Math.round((timeslider.noUiSlider("getValue")[0]/100) * (new Date().getFullYear() - START_YEAR)) + START_YEAR;
		end_year = Math.round((timeslider.noUiSlider("getValue")[1]/100) * (new Date().getFullYear() - START_YEAR)) + START_YEAR ;
		self.location="spotify:app:timemachine:year:" + start_year + ":" + end_year + ":" + document.getElementById("query").value.replace(":","___").decodeForText();
	});*/
	$("#timeslider").bind("mouseup", function () {	
	//	self.location="spotify:app:timemachine:year:" + start_year + ":" + end_year + ":" + document.getElementById("query").value.replace(":","___").decodeForText();
	});
	
	bigyear = $("#bigyear");
	models.Artist.fromURI("spotify:artist:2FOROU2Fdxew72QmueWSUy", function(artist) {
		console.log(artist);
	});
	console.log(models.EVENT);
	temp_playlist = new models.Playlist();
	$("#timeslider").noUiSlider("init", { scale: [0,100],
		tracker: 
		function() {	
			
			start_year = Math.round((timeslider.noUiSlider("getValue")[0]/100) * (new Date().getFullYear() - START_YEAR)) + START_YEAR;
			end_year = Math.round((timeslider.noUiSlider("getValue")[1]/100) * (new Date().getFullYear() - START_YEAR)) + START_YEAR ;
			progressive = true;
			$("#startyear").html(start_year);
			$("#endyear").html(end_year);
		},
		change: function() {
			if(start_year >= 1900 && progressive) {
				start_year = Math.round((timeslider.noUiSlider("getValue")[0]/100) * (new Date().getFullYear() - START_YEAR)) + START_YEAR;
				end_year = Math.round((timeslider.noUiSlider("getValue")[1]/100) * (new Date().getFullYear() - START_YEAR)) + START_YEAR ;
				
				progressive = false;
				self.location="spotify:app:timemachine:year:" + start_year + ":" + end_year + ":" + document.getElementById("query").value.decodeForLink();
			}
		},
	});
	$("#timeslider").bind("mousedown", function () {
		progressive = true;
		inProgress=true;
	});
	$("#btnGo").bind("click", function(e) {
		var year = document.getElementById("timeslider").value;
		
		
		var uri = "spotify:app:timemachine:year:" + start_year + ":" + end_year + ":" + document.getElementById("query").value.decodeForLink();
		if(curURI !== uri) {
			self.location=uri;
			curURI = uri;
		}
	});
	$("#query").bind("keydown", function(e) {
		if(e.keyCode == 13) {
			
			var uri = "spotify:app:timemachine:year:" + start_year + ":" + end_year + ":" + document.getElementById("query").value.decodeForLink();
			if(curURI !== uri) {
				self.location=uri;
				curURI = uri;
			}
		}
	});
	$("#query").bind("blur", function(e) {
		var start = $("#timeslider").noUiSlider("getValue", { point : 'lower' }) + START_YEAR;
		var end = $("#timeslider").noUiSlider("getValue", { point : 'upper'} ) + new Date().getFullYear() - 100;
	//	alert(document.getElementById("query").value + " " + models.application.arguments[3] + " " + document.getElementById("query").value.length);
	//	alert(document.getElementById("query").value + "===" + models.application.arguments[3] + " || " + "(" + document.getElementById("query").value.length + " == " + "0" + " && " + models.application.arguments[3] + " === undefined");
		
		/*if(document.getElementById("query").value === models.application.arguments[3] || (document.getElementById("query").value.length == 0 && models.application.arguments[3] === undefined) ) {
		//	alert(document.getElementById("query").value + "===" + models.application.arguments[3] + " || " + "(" + document.getElementById("query").value.length == 0 + " && " + models.application.arguments[3] + " === undefined");
		
			return;
		}*/
		var uri = "spotify:app:timemachine:year:" + start_year + ":" + end_year + ":" + document.getElementById("query").value.decodeForLink();
		if(curURI !== uri) {
			self.location=uri;
			curURI = uri;
		}
	});
	
	$("#timeslider").bind("click", function() {
		console.log("FWRF");
		self.location="spotify:app:timemachine:year:" + start_year + ":" + end_year + ":" + document.getElementById("query").value.decodeForLink();
		start_year = Math.round((timeslider.noUiSlider("getValue")[0]/100) * (new Date().getFullYear() - START_YEAR)) + START_YEAR;
			end_year = Math.round((timeslider.noUiSlider("getValue")[1]/100) * (new Date().getFullYear() - START_YEAR)) + START_YEAR ;
			$(bigyear).html(start_year + " - " + end_year);
	});
	
	models.application.observe(models.EVENT.ACTIVATE, function() {
		activated = true;
		
	});
	models.application.observe(models.EVENT.DEACTIVATE, function() {
		activated = false;
		activating = true;
		
	
	});
	/*models.player.observe(models.EVENT.CHANGE, function () {
		if(models.player.context != null) {
			$(".sp-player-button").each(function () {
				if($(this).prev("a").first().attr("href") == models.player.context.data.uri) {
					if(!models.player.playing) {
						$(this).css({"display":"block"});
						$(this).addClass("paused");
					} else {
						$(this).removeClass("paused");
					}
					
				} else {
				}	
			});
		};
	});*/
	models.application.observe(models.EVENT.ARGUMENTSCHANGED, function() {
			
			var args = models.application.arguments;
	
			if(args.length > 0 || (!activating && args.length == 0)) {
				
					try {
						document.body.style.backgroundImage = "";
						activated = true;
						
				
			
						// alert(args.length);
						if(args.length == 0) {
							args = ["year", 1950, new Date().getFullYear(), ""];
						} 
						if(args.length > 3) {
							args[3] = decodeURI(args[3]);
						}
						console.log(args);
						
						
						$("#query").removeAttr("disabled");
						temp_playlist = new models.Playlist();
						first = true;
						if(args.length < 2)
							args = [1950, new Date().getFullYear()];
						setTime(args);
					} catch (e) {
						console.log(e.stack);
					}
				
				
				activating = false;
			} else {
			
				activating = false;
			}
	});
	
	models.player.observe(models.EVENT.CHANGE, function(event) {
		
		
	});
	$("a").each(function(index) {
		console.log("LINK");
		$(this).bind("click", function() {
			console.log("G");
			console.log($(this).attr("href"));
			try {
				window.location=$(this).attr("href");
				
			}catch(e) {
				console.log(e.stack);
			}
		});
	});
	
}