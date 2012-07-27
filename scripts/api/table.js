/***
Table module for Spotify Apps
@module table
**/

var views = sp.require("sp://import/scripts/api/views");
var models = sp.require("sp://import/scripts/api/models");
/***
@from http://stackoverflow.com/questions/288699/get-the-position-of-a-div-span-tag
***/
function getPos(el) {
	// yay readability
	for (var lx=0, ly=0;
		 el != null;
		 lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
	return {x: lx,y: ly};
}
/**
@class Table
**/
exports.Table = function(playlist, track, columns) {	
//	alert("A");
	this.playlist = playlist;
	this.list = new views.List(playlist, track);
	var _playlist = playlist;

	this.tableHeader = new exports.TableHeader(this, columns);
	var bg = this.list.node.getElementsByTagName("div")[0];
	bg.appendChild(this.tableHeader.node);
	setTimeout(function () {
		bg.style.height = (parseInt(bg.style.height) + 20 ) + "px";
		
	}, 100);
	bg.setAttribute("style", "");
	console.log(bg);
	var tanooki = document.createElement("div");
	tanooki.setAttribute("id", "tanooki");
	tanooki.style.position = "relative";
	tanooki.style.display = "none";
	tanooki.style.height = "20px";
	tanooki.style.width="100%";
	this.list.node.getElementsByTagName("div")[0].appendChild(tanooki);
	this.tableNode = this.tableHeader.node;
	this.node = document.createElement("div");
	this.node.appendChild(this.list.node); 
	var _node = this.node;
	var sortMode = null;
	
	window.onscroll = function(e) {
		var tabHeader = document.getElementById("table-header"); 
		var tanooki = document.getElementById("tanooki");
		
		var table = _node;
		var pos = getPos(_node);
		var topP = 0;
		var c = document.querySelectorAll("nav");
		for(var i = 0; i < c.length; i++) {
			if(c[i].style.position == "fixed") {	
				try {
				console.log(c[i].style.height);
				topP += parseInt(c[i].style.height);
				
				} catch(e) {
					console.log(e.stack);
				}
				
			}
		}
		console.log(pos.y - window.scrollY);
		var offset = pos.y - window.scrollY;
		if(offset <= 0 + topP ) {
			tabHeader.style.position = "fixed";
			tabHeader.style.left = "0px";
			tabHeader.style.zIndex = "12"; try {
			tabHeader.style.top = ( 0 + topP ) + "px";
			} catch(e) { console.log(e.stack); }
	//		alert(tabHeader.style.top);
			tanooki.style.display = "block";
			
		} else {
			console.log("F");
			tabHeader.style.position = "relative";
			tanooki.style.display = "none";
			tabHeader.style.top = "0px";
		}
	};
	this.sort = function(column) {	
		try {
			var mode = true;
			if(sortMode !== null) {
				if(typeof(sortMode["column"]) !== "undefined") {
					if(sortMode.column == column) {
					mode = !sortMode.mode;
					}
				}
			}
			console.log("GCWE");	
			console.log(this.playlist);
			var list = this.playlist.tracks.slice(0);
			list.sort(function(track, track2) {
				var order = 0;
				console.log(track);
				
				switch(column) {
					case views.Track.FIELD.NAME:
					
						order = track.data.name < (track2.data.name);
							
						break;
					case views.Track.FIELD.ARTIST:
						order = track.data.artists[0].name < track2.data.artists[0].name;
						break;
					case views.Track.FIELD.ALBUM:
						order = track.data.album.name <  track2.data.album.name;
						break;
					case views.Track.FIELD.DURATION:
						order = track.data.duration < track2.data.duration;
						break;
				}
				order = order ? -1 : 1;
				console.log(order);
				return mode ? order : -order;
			
			});
			
			// Remove all songs
			while(playlist.length > 0)	playlist.remove(playlist.get(0));
			for(var i = 0; i < list.length; i++) {
				playlist.add(list[i]);
			}
		/*	console.log(list);
			sortMode = { column: column, mode: mode};
			var div = this.node.getElementsByTagName("div")[0];
			var elms = [];
			for(var x = 0; x < list.length; x++) {
				var track = list[x];
				var a = this.node.querySelectorAll("a[href=\"" + track.data.uri + "\"]")[0];
				elms.push(a);
				a.parentNode.removeChild(a);
				
			}
			for(var x = 0; x < elms.length; x++) {
	
				a.setAttribute("style","-webkit-transform: translateY(" + (20 * x) + "px)");
				a.setAttribute("data-itemindex", x);
				a.setAttribute("data-viewindex", x);
				div.appendChild(a);
			}
			var list = new views.List(playlist, track);
			
			var tableHeader = new exports.TableHeader(this, columns);
			list.node.getElementsByTagName("div")[0].appendChild(tableHeader.node);
			
			console.log(this.node);
			this.node.innerHTML="";
			
			var as = list.node.getElementsByTagName("a");
			var aplaylist = new models.Playlist();
		
			
			console.log("FG");
			console.log(aplaylist.tracks);
			this.list = new views.List(aplaylist, track);
			var tableHeader = new exports.TableHeader(this, columns);
			this.list.node.getElementsByTagName("div")[0].appendChild(tableHeader.node);
			this.node.innerHTML ="";
			this.node.appendChild(this.list.node);
			console.log(this.node);*/
		} catch(e) {
			console.log(e.stack);
		}
	};
};
/***
@class TableHeader
****/
exports.Column = function(type, title, table) {
	console.log(table);	
	this.node = document.createElement("span")
	this.node.setAttribute("class", "sp-column sp-track-field-" + type.toLowerCase() + "");
	this.node.innerHTML = title;
	console.log(this.node);

	/*this.node.addEventListener("click", function () {
		try {
			table.sort(views.Track.FIELD[type]);
		} catch(e) {
			console.log(e.stack);
		}
		
	});*/
};
exports.TableHeader = function (table, columns) {
	var a = document.createElement("a");
	a.setAttribute("class", "sp-header sp-item sp-list");
	a.style.height= "16px";
	a.style.position = "relative";
	a.setAttribute("id", "table-header");
	if(columns |= views.Track.FIELD.STAR) a.appendChild(new exports.Column("STAR","", table).node);
	if(columns |= views.Track.FIELD.SHARE) a.appendChild(new exports.Column("SHARE","", table).node, table);
	if(columns |= views.Track.FIELD.NAME)  a.appendChild(new exports.Column("NAME","Name", table).node, table);
	if(columns |= views.Track.FIELD.ARTIST) a.appendChild(new exports.Column("ARTIST","Artist", table).node, table);
	if(columns |= views.Track.FIELD.DURATION) a.appendChild(new exports.Column("DURATION","Length", table).node, table);
	if(columns |= views.Track.FIELD.ALBUM) a.appendChild(new exports.Column("ALBUM","Album", table).node, table);
	
	this.node = a;
};