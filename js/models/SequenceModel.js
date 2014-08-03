// strophe
// 2014
// SequenceModel Backbone Model
//
define(['underscore', 'jquery', 'backbone', 'models/ClipModel', 'SITE_CONST'], function (_, $, backbone, ClipModel, SITE_CONST) {


	var ClipCollection = backbone.Collection.extend({
		model: ClipModel
	})

	return backbone.Model.extend({
		//
		//
		defaults:{},
		initialize:function(id){
			//
			this.imagesTotal = this.imagesComplete = 0;
			this.readyToLoad = false;
			this.loaded = false;
			this.bind('sync',this.setup,this);
			//
			this.bind('sequenceProgress', this.collection.progress, this.collection);
			this.bind('ready', this.collection.ready, this.collection);
			this.bind('jsonReady', this.collection.jsonReady, this.collection);
			this.bind('nextSequence',this.collection.nextSequence,this.collection);
			//
			this.url = require.toUrl('sequences/' + this.get('file') + '.json');
			this.fetch();
		},
		index:function(){
			return this.collection.indexOf(this);
		},
		load:function(){

			this.clipCollection.first().Preload();
		},
		setup:function(){
			//
			var model = this, clipCollection = new ClipCollection(this.get('clips'));
			this.clipCollection = clipCollection;
			clipCollection.each(function(clip){
				clip.bind('renderFrame', model.renderFrame, model);
				clip.bind('fadeOut', model.fadeOut, model);
				clip.bind('nextClip', model.nextClip, model);
				clip.bind('progress', model.progress, model);
				model.imagesTotal += clip.images().length;
			});
			//
			this.readyToLoad = true;
			this.trigger('jsonReady');
			clipCollection.bind('ready', this.ready, this);
			//
		},
		progress:function(){
			var imagesComplete = 0;
			this.clipCollection.each(function(clip){
				_(clip.images()).each(function(image){
					imagesComplete+= image.status;
				});
			})
			this.imagesComplete = imagesComplete;
			this.trigger('sequenceProgress');
		},
		ready:function(){
			this.loaded = true;
			this.progress();
			this.trigger('ready');
		},
		restart:function(){
			if (!_.isUndefined(this.currentClip)) {
				this.currentClip.Stop();
			}
			this.set('clipIndex',0);
			//
			$('.inter-titre').addClass('visible');
			$('.inter-titre .folio').text(this.index() + 1);
			//
			setTimeout($.proxy(this.start,this),4000);

			setTimeout(function(){
				$('.inter-titre').removeClass('visible');
			},2000);

		},
		start:function(){
			//
			if(!_.isUndefined(this.currentClip)){
				this.currentClip.Stop();
			}
			//
			//
			if(this.loaded){
				this.currentClip = this.clipCollection.models[this.get('clipIndex')];
				if (!_.isUndefined(this.currentClip)) {
					this.currentClip.Start();
				}
				this.trigger('start');
			}
		},
		renderFrame:function(frame){
			this.trigger('renderFrame',frame);
		},
		fadeOut:function(fadeOut){
			this.trigger('fadeOut', fadeOut);
		},
		nextClip:function(){
			var nextIndex = (this.get('clipIndex') + 1);
			if(nextIndex>= this.clipCollection.models.length){
				this.trigger('nextSequence');
				return;
			}
			this.set('clipIndex', nextIndex);
			this.start();
		},
		OrientationChange:function(orientation){
			if(!_.isUndefined(this.currentClip) && this.currentClip.get('end') == 'orientation_' + orientation){
				this.nextClip();
			}
		}
		//
	});
});