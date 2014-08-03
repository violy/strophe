// strophe
// 2014
// PictureView Backbone View
//
define(['underscore', 'jquery', 'backbone','models/ClipModel', 'modernizr'], function (_, $, backbone) {
	var pictureView,
		pictureBlock,
		canvas,
		context
	return backbone.View.extend({
		el:'#picture',
		events:{
		},
		initialize:function(){
			//
			pictureView = this;
			pictureBlock = pictureView.$el.find('#picture-block');
			canvas = pictureBlock.get(0);
			context = canvas.getContext('2d');
			//
			this.cssRotation = false;
			this.alignH = this.alignV = .5; // alignement par défaut
			//
			$(window).resize($.proxy(this.Resize, this));
			this.Resize();
			//
		},
		Black:function(){
			context.fill='black';
			context.beginPath();
			context.fillRect(0,0,480,480);
		},
		Resize:function(animate){
			var p = this.$el.parent(),
				pw = p.width(),
				ph = p.height(),
				pSize = pw>ph ? pw:ph,
				mSize = ((pw>ph?ph:pw)-pSize),
				css = {
					width: pSize, height: pSize,
					left:0,top:0
				};
			if(this.cssRotation){
				css.top = -mSize/2 + mSize*this.alignV;
				css.left = mSize/2;
			}else if(pw > ph){
				css.top = mSize * this.alignV;
			}else{
				css.left = mSize * this.alignH;
			}
			if(animate){
				pictureBlock.animate(css,500);
			}else{
				pictureBlock.stop().css(css);
			}
		},
		Align:function(alignH,alignV){
			this.alignH = alignH;
			this.alignV = alignV;
			this.Resize();
		},
		StartClip:function(){
			this.$el.show();
			this.Align(this.sequence.currentClip.get('align_horizontal'), this.sequence.currentClip.get('align_vertical'));
			this.RenderFrame(this.sequence.currentClip.currentFrame());
		},
		SetSequence:function(sequence){
			this.sequence = sequence;
			sequence.bind('renderFrame',this.RenderFrame,this);
			sequence.bind('fadeOut',this.fadeOut,this);
			sequence.bind('start',this.StartClip,this);
		},
		fadeOut:function(fadeOut){
			this.$el.delay(fadeOut.delay).fadeOut(fadeOut.duration);
		},
		RenderFrame:function(frame){
			context.drawImage(frame.img, 0, 0);
		},
		OrientationChange:function(){
			this.cssRotation = $('.no-touch #stage').is('.landscape');
			this.Resize(true && !Modernizr.touch);
		}
	});
});