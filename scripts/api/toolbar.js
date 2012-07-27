/***
@module toolbar

@class Toolbar 
*/
exports.Toolbar = function() {
	this.node = document.createElement("toolbar");
};
/**
@class toolbutton
**/
exports.Toolbutton = function (icon, text, callback) {
	this.node = document.createElement("button");
};