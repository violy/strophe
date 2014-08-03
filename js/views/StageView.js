// strophe
// 2014
// StageView Backbone View
//
define(['underscore', 'jquery', 'backbone','views/PictureView','views/TutorialView','models/SequenceCollection','modernizr','cssTransform'], function (_, $, backbone, PictureView, TutorialView, SequenceCollection) {
	return backbone.View.extend({
		el:'#stage',
		events:{
			'touchstart': 'preventTouch',
			'click':'ToggleRotation',
			'touchstart h3': 'endTutorial',
			'click h3':'endTutorial'
		},
		preventTouch: function (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		,
		initialize:function(){
			//
			if(Modernizr.touch){
				// on Touch device, detect initial orientation
				this.orientation = $(window).width() < $(window).height() ? 'portrait':'landscape';
			}
			//
			this.tutorialView = new TutorialView();
			this.pictureView = new PictureView();
			this.sequences = new SequenceCollection([
				{file:'seq1',title:'plante'},
				{file:'seq2',title:'fontaine'},
				{file:'seq3',title:'sake'}
			]);
			this.sequences.bind('progress',this.progress,this);
			this.sequences.bind('sequencesReady',this.ready,this);
			this.sequences.bind('nextSequence',this.nextSequence,this);
			this.sequences.load();
			this.smoothRotation = 90,
			this.smoothRotationTarget = this.smoothRotation;
			this.smoothRotationAnimate = false;
			this.$el.addClass('portrait');
			this.status = 0; //preload
			this.progress = this.$el.find('.progress');
			this.i = 0;
			//
			bandeSon = new Audio('mp3/audio_plante_fontaine.mp3');
			bandeSon.preload = true;
			bandeSon.volume = 0;
			bandeSon.loop = false;
			//
			var supportsOrientationChange = "onorientationchange" in window,
				orientationEvent = (supportsOrientationChange||!Modernizr.touch) ? "orientationchange" : "resize";
			$(window).on(orientationEvent, $.proxy(this.OrientationChange,this));
		},
		progress:function(progress){
			this.progress.css({width:(progress.complete/progress.total)*100+'%'})
			//console.log(90 * (1 - (progress.complete / progress.total)));
			this.smoothRotationTarget = 180 * (1 - (progress.complete / progress.total))-90;
			$('#prologue .title').css({transform: 'rotate(' + this.smoothRotationTarget + 'deg)'});
			/*
			if(!this.smoothRotationAnimate){
				this.smoothRotate();
			}
			*/
		},
		smoothRotate:function(){
			this.smoothRotation = this.smoothRotation*.9999+ this.smoothRotationTarget*.0001;
			//
			$('#prologue .title').css({transform: 'rotate(' + this.smoothRotation + 'deg)'});
			if(Math.abs(this.smoothRotation- this.smoothRotationTarget)>.5){
				window.requestAnimationFrame($.proxy(this.smoothRotate,this));
			}
		},
		ready:function(){
			this.startTutorial();
			//this.pictureView.SetSequence(this.sequences.currentSequence());
			//this.sequences.currentSequence().start();
		},
		startTutorial:function(){
			this.status = 1; // tutorial;
			this.progress.css({width: '100%'});
			$('#prologue .title').css({transform: 'rotate(-90deg)'});
			this.$el.find('#prologue').addClass('tutorial');
			this.$el.find('#loader').delay(1000).fadeOut();
		},
		endTutorial:function(e){
			e.stopPropagation();
			e.preventDefault();
			this.status = 2; // sequence;
			var view = this;
			this.tutorialView.kill();
			//
			setTimeout($.proxy(this.beginSequences,this),1000);
			//
			bandeSon.play();
			$(bandeSon).animate({volume:1});
		},
		analytics:function(category, action,label){
			ga('send', 'event', category, action, label, this.sequences.index);
		},
		beginSequences:function(){
			this.analytics('sequence', 'beginSequences', this.sequences.currentSequence().get('title'));
			this.pictureView.SetSequence(this.sequences.currentSequence());
			this.sequences.currentSequence().restart();
		},
		nextSequence:function(){
			//
			this.pictureView.Black();
			this.sequences.index++;
			if(this.sequences.index == this.sequences.size()){
				setTimeout(function(){
					$('.generique').addClass('visible');
				},500);
			}else{
				this.pictureView.SetSequence(this.sequences.currentSequence());
				this.sequences.currentSequence().restart();
			}
		},
		orientation:'portrait',
		OrientationChange:function(e){
			this.orientation = this.orientation =='portrait'?'landscape':'portrait';
			this.analytics('orientation', 'change', this.orientation);
			this.pictureView.OrientationChange(this.orientation);
			switch(this.status){
				case 1 :
					break;
				case 2 :
					this.sequences.currentSequence().OrientationChange(this.orientation);
				break;
			}
		},
		ToggleRotation:function(e){
			if(!this.$el.is('.transition')){
				this.$el.toggleClass('portrait');
				this.$el.toggleClass('landscape');
				this.i++;
				if(this.i%3==0){
					this.$el.find('#picture').toggleClass('bottom');
				}
				if (this.i %3 == 2) {
					this.$el.find('#picture').toggleClass('top');
				}
				this.OrientationChange(e);
			}
		}
	});
});