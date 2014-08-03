// strophe
// 2014
// SequenceCollection Backbone Model
//
define(['underscore', 'jquery', 'backbone','models/SequenceModel'], function (_, $, backbone, SequenceModel) {
	return backbone.Collection.extend({

		model:SequenceModel,
		index:0,
		sequencesReady:0,
		sequencesLoaded:0,
		initialize:function(){
		},
		load:function(){
		},
		progress:function(){
			var total = 0, complete = 0;
			this.each(function(sequence){
				total+=sequence.imagesTotal;
				complete+=sequence.imagesComplete;
			});
			this.trigger('progress',{complete: complete ,total:total});
		},
		ready:function(){
			this.sequencesLoaded++;
			var sequenceToLoad = this.models[this.sequencesLoaded];
			if(_.isUndefined(sequenceToLoad)){
				this.trigger('sequencesReady');
			}else{
				sequenceToLoad.load();
			}
		},
		jsonReady:function(){
			var readyToLoadTotal = 0;
			this.each(function(sequence){
				readyToLoadTotal+= sequence.readyToLoad ? 1:0;
			});
			if(readyToLoadTotal>0 && readyToLoadTotal==this.size()){
				this.first().load();
			}
		},
		currentSequence:function(){
			return this.models[this.index];
		}

	});
});