// strophe
// 2014
//  Backbone Model
//
define(['underscore', 'jquery', 'backbone', 'Timestamp', 'RequestAnimationFrame','ajaxProgress'], function (_, $, backbone, Timestamp) {
	//
	var ucount = 0;
	//
	return backbone.Model.extend({
		defaults:{
			path:'',
			id:'seq-'+(ucount++),
			name:'sequence '+ucount,
			temporal_mode:'time',
			run_mode:'linear',
			end:'next',
			fps:30,
			fileType:'.jpg',
			images:0,
			frame:0,
			loops:1,
			align_horizontal:.5,
			align_vertical:.5,
			yoyo_direction:1
		},
		initialize:function(options){
			var model = this;
			this.playing = false;
			_(options).each(function(v,k){
				model.set(k,v);
			});
			model.frameTime(1000/model.get('fps'));
			//
			var totalImages = model.images();
			if (totalImages > 0) {
				var images = [];
				for (var i = 0; i < totalImages; i++) {
					var image = {
						index: i,
						img: new Image(),
						src: this.get('path') + i + this.get('fileType'),
						status: 0,
						model: this
						/*
						,load: function () {
							$(this.img).on('load', $.proxy(this.complete, this));
							$(this.img).on('error', $.proxy(this.error, this));
							this.img.src = this.src;
						},
						error:function(){
						},
						complete: function () {
							this.status = 1;
							var nextImage = _.where(images, {status: 0})[0];
							if (_.isUndefined(nextImage)) {
								if (model.collection) {
									var nextClip = model.collection.at(model.index() + 1);
									if (_.isUndefined(nextClip)) {
										model.collection.trigger('ready');
									} else {
										nextClip.Preload();
									}
								}
							} else {
								model.trigger('progress');
								nextImage.load()
							}
						}
						//*/
					};
					images.push(image)
				}
				//
				model.images(images);
			}
		},
		index:function(){
			return this.collection ? this.collection.indexOf(this) : -1;
		},
		frame:function(f){
			if(!_.isUndefined(f) && _.isNumber(f)){
				f = f%this.images().length;
				this.set('frame',f);
			}
			return this.get('frame');
		},
		frameTime:function(time){
			if(_.isNumber(time)){
				this.set('frameTime',time);
			}
			return this.get('frameTime');
		},
		images:function(a){
			if(_.isArray(a)){
				this.set('images',a);
			}
			return this.get('images');
		},
		currentFrame:function(){
			return this.images()[this.frame()];
		},
		Preload:function(){
			//this.images()[0].load();
			//
			var model = this;
			//
			function DecodeBase64File(index,file){
				var image = model.images()[index];
				if (image.status == 0) {
					image.status = 1;
					image.img.src = 'data:image/jpeg;base64,' + file;
					model.trigger('progress');
				}
			}
			//
			$.ajax({
				url:'base64.php',
				method:'GET',
				data:{
					'path': model.get('path'),
					'count': model.images().length
				},
				progress: function(jqXHR, progressEvent){
					var _endFile = String(progressEvent.target.response).split('\n__END__');
					_endFile.pop();
					$(_endFile).each(DecodeBase64File);
				},
				complete:function (data) {
					var _endFile = data.responseText.split("\n__END__");
					_endFile.pop();
					$(_endFile).each(DecodeBase64File);
					//
					model.trigger('progress');

					var nextClip = model.collection.at(model.index() + 1);
					if (nextClip) {
						nextClip.Preload();
					} else {
						model.collection.trigger('ready');
					}
				}
			})
			//*/
		},
		Start:function(){
			this.playing = true;
			this.frameCount = 0;
			this.loop = 0;
			this.frame(0);
			this.renderTime = Timestamp();
			this.needInteraction = this.get('end').split('_').shift() == 'orientation';
			this.RunFrame();
			if(this.get('fadeOut')){
				this.trigger('fadeOut',this.get('fadeOut'));
			}
		},
		Stop:function(){
			this.playing = false;
		},
		RunFrame:function(){
			//
			if(!this.playing) return;
			//
			var time = Timestamp(),
				timeDiff = time - this.renderTime,
				currentFrameWithLoop;
			//
			//
			//
			switch (this.get('run_mode')){
				//
				//
				//
				case "linear":
				case "yoyo" :



					if (timeDiff >= this.frameTime()) {
						var frameDiff = Math.round(timeDiff / this.frameTime());
						//
						var isEndOfClip = this.NextFrame(frameDiff);
						//
						this.TriggerRender();
						//
						if(isEndOfClip){
							if(this.get('run_mode')=='yoyo'){
								this.YoyoLoop();
							}else
							if (this.get('end') == 'loop'){
								this.NextLoop();
							}else{
								return this.NextClip();
								break;
							}
						}
						this.renderTime = time;
					}
					//
					//
					window.requestAnimationFrame($.proxy(this.RunFrame, this));
				//
				//
				break;
				//
				//
				case "random":

					if (timeDiff >= this.frameTime()) {
						this.frameCount ++;
						this.frame(Math.floor(Math.random() * this.images().length));
						this.TriggerRender();
						this.renderTime = time;

						if((this.frameCount%this.images().length==0) && this.get('end') == 'loop'){
							this.NextLoop();
						}
					}
					//
					//
					window.requestAnimationFrame($.proxy(this.RunFrame, this));
			}

		},
		TriggerRender:function(){
			this.trigger('renderFrame', this.currentFrame());
		},
		YoyoLoop:function(){
			//invert yoyo
			this.set('yoyo_direction',this.get('yoyo_direction')*-1);
			this.NextLoop();
		},
		NextLoop:function(){
			this.loop++;
			if(this.loop>this.get('loops') && !this.needInteraction){
				this.NextClip();
			}
		},
		NextFrame:function(diff){
			//
			if(!_.isNumber(diff)){
				diff=1
			}
			//
			//
			diff*=this.get('yoyo_direction'); // yoyo
			//
			if((this.frame()+diff>=this.images().length) || // normal
				(this.frame()+diff<0) // yoyo
				){
				return true; // looping Moment
			}
			// add a frame Difference
			this.frame(this.frame()+diff);
			//
			// not looping
			return false;
		},
		NextClip:function(){
			this.trigger('nextClip');
		}
	});
});