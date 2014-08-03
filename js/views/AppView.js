// strophe
// 2014
// AppView Backbone View
//
define(['underscore', 'jquery', 'backbone','views/StageView','modernizr'], function (_, $, backbone, StageView) {
	return backbone.View.extend({
		el:'body',
		initialize:function(){
			$(document).ready(function(){
				new StageView();
			});
		}
	});
});