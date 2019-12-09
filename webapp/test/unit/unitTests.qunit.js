/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"NPCGen/NPCGen/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});