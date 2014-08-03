// strophe
// 2014
// TutorialView Backbone View
//
define(['underscore', 'jquery', 'backbone','Timestamp','RequestAnimationFrame'], function (_, $, backbone, Timestamp) {
	var canvas,
		context,
		clips,
		view,
		stop=false;

	var SubClip = backbone.Model.extend({
		initialize:function(){
			view = this;
			this.img = new Image();
			$(this.img).on('load', $.proxy(this.ready,this))
			this.img.src = this.get('src');
			this.frame = 0;
			this.w = this.get('width');
			this.h = this.get('height');
			this.x = this.get('x');
			this.y = this.get('y');

		},
		ready:function(){
			this.loaded = true;
		},
		render:function(){
			this.frame++;
			if (this.frame > this.get('totalFrame')) {
				this.frame = 0;
			}
			context.drawImage(this.img, this.frame * this.w, 0, this.w, this.h, this.x, this.y, this.w, this.h);
		}
	})

	return backbone.View.extend({
		el:'#tutorial',
		initialize:function(){
			clips = _([
				new SubClip({src:'i/intro-background-sub1.jpg',totalFrame:46,width:130,height:171,x:45,y:0}),
				new SubClip({src:'i/intro-background-sub2.jpg',totalFrame:46,width:54,height:480,x:174,y:0})
			]);
			canvas = this.el;
			context = canvas.getContext('2d');

			this.Run();
		},
		Run:function(){

			var time = Timestamp();
			function _Run(){

				var currentTime = Timestamp();
				if (currentTime - time > 30) {

					clips.each(function(clip){
						clip.render();
					});

					time = currentTime;
				}
				if(stop){return;}
				window.requestAnimationFrame(_Run);
			}

			_Run();
		},
		kill:function(){
			$('#prologue .title').fadeOut(1000);
			this.$el.fadeOut(2000,function(){
				stop = true;
				view.destroy();
			});
		}
	});
});