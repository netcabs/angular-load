/* angular-load.js / v0.4.2 / (c) 2014, 2015, 2016 Uri Shaked / MIT Licence */

angular.module('angularLoad', [])
	.service('angularLoad', ['$document', '$q', '$timeout', function ($document, $q, $timeout) {
		var document = $document[0];
		var promises = {};

		function loader(createElement) {
			return function(url) {
				if (typeof promises[url] === 'undefined') {
					var deferred = $q.defer();
					var element = createElement(url);

					element.onload = element.onreadystatechange = function (e) {
						if (element.readyState && element.readyState !== 'complete' && element.readyState !== 'loaded') {
							return;
						}

						$timeout(function () {
							deferred.resolve(e);
						});
					};
					element.onerror = function (e) {
						$timeout(function () {
							deferred.reject(e);
						});
					};

					promises[url] = deferred.promise;
				}

				return promises[url];
			};
		}

		/**
		 * Dynamically loads the given script
		 * @param src The url of the script to load dynamically
		 * @returns {*} Promise that will be resolved once the script has been loaded.
		 */
		this.loadScript = loader(function (src) {
			var script = document.createElement('script');

			script.src = src;

			document.body.appendChild(script);
			return script;
		});

		/**
		 * Dynamically unloads the given JS file
		 * @param href The url of the JS to unload dynamically
		 * @returns boolean that will be true once the JS file has been unloaded successfully or otherwise false.
     * VERY IMPORTANT: If the JS successfully loaded, then unloading does NOT
     * remove the executed code, so global variables/functions etc will still
     * exist.  The intended purpose of this function is to allow another
     * attempt at loading JS on failure to load on a previous attempt.
		 */
		this.unloadScript = function (src) {
			delete promises[src];
			var docBody = document.body;
			if(docBody) {
				var targetJS = docBody.querySelector('[src="' + src + '"]');
				if(targetJS) {
					targetJS.remove();
					return true;
				}
			}
			return false;
		};


		/**
		 * Dynamically loads the given CSS file
		 * @param href The url of the CSS to load dynamically
		 * @returns {*} Promise that will be resolved once the CSS file has been loaded.
		 */
		this.loadCSS = loader(function (href) {
			var style = document.createElement('link');

			style.rel = 'stylesheet';
			style.type = 'text/css';
			style.href = href;

			document.head.appendChild(style);
			return style;
		});

		/**
		 * Dynamically unloads the given CSS file
		 * @param href The url of the CSS to unload dynamically
		 * @returns boolean that will be true once the CSS file has been unloaded successfully or otherwise false.
		 */
		this.unloadCSS = function (href) {
			delete promises[href];
			var docHead = document.head;
			if(docHead) {
				var targetCss = docHead.querySelector('[href="' + href + '"]');
				if(targetCss) {
					targetCss.remove();
					return true;
				}
			}
			return false;
		};

	}]);

