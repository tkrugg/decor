define(["intern",
    "intern!object",
    "intern/dojo/node!leadfoot/helpers/pollUntil",
	"intern/chai!assert",
	"require",
], function (intern, registerSuite, pollUntil, assert, require) {
	var PAGE = "./sniff.html";

	registerSuite({
		name: "Sniff tests",
		setup: function () {},
		beforeEach: function () {
			var remote = this.remote;
			return remote
				.get(require.toUrl(PAGE))
				.then(pollUntil("return ('ready' in window && ready) ? true : null;", [],
						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL));
		},
		"Checking browser names detection": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return remote
				.execute("return map(browserNames, has)")
				.then(function (mapBrowserNames) {
					// check number of messages on startup
					var realBrowserName = remote.environmentType.browserName;
					// realBrowserName (name given to the browser by intern) should be a known browser
					assert.property(mapBrowserNames, realBrowserName, "browser name is known");
					// realBrowserName shoud be correctly detected
					assert.ok(mapBrowserNames[realBrowserName], "browser " + realBrowserName + " was detected");

					return remote
						.execute("return swap(browserNames)")
						.then(function (swapBrowserNames) {
							// check other browsers are not detected and equivalent browsers are
							for (var sniffBrowser in swapBrowserNames) {
								if (swapBrowserNames[sniffBrowser].indexOf(realBrowserName) > -1) {
									swapBrowserNames[sniffBrowser].forEach(function (internName) {
										assert.ok(mapBrowserNames[internName],
											"sniff should detect " + internName + " as " + sniffBrowser);
									});
								} else {
									swapBrowserNames[sniffBrowser].forEach(function (internName) {
										assert.notOk(mapBrowserNames[internName],
											"sniff should NOT detect " + internName + " as " + sniffBrowser);
									});
								}
							}
						});
				})
				.end();
		},
	});
});
