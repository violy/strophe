({
	baseUrl: ".",
	name: "main",
	out: "main-built.js",

	paths: {

		//
		// RequireJS plugins
		'async': 'lib/requirejs-plugins/async',
		'text': 'lib/requirejs-plugins/text',
		'goog': 'lib/requirejs-plugins/goog',
		'propertyParser': 'lib/requirejs-plugins/propertyParser',

		//
		// Frameworks
		'jquery': 'lib/jquery-1.8.3.min',
		'underscore': 'lib/underscore-1.5.2.min',
		'backbone': 'lib/backbone-min',

		//
		// jQuery Plugins
		'RequestAnimationFrame': 'lib/RequestAnimationFrame',
		'ajaxProgress': 'lib/jquery.ajaxprogress',
		'cssTransform': 'lib/jquery-css-transform',

		//
		// shortcuts
		'router': 'models/Router',
		'contentModel': 'models/ContentModel',
		'Timestamp': 'utils/Timestamp',

		//
		'gzip': 'lib/gzip.min',
		'rawinflate': 'lib/rawinflate',
		//
		'modernizr': 'lib/modernizr.custom.30725',

		//
		'SITE_CONST':'empty:',
		'GoogleAnalytics':'empty:'

	},

	shim: {
		'jquery': {
			exports: '$'
		},
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: ["underscore", "jquery"],
			exports: "Backbone"
		},
		'ajaxProgress': ['jquery'],
		'cssTransform': ['jquery']
	}
})