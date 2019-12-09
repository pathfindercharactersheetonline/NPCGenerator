sap.ui.define([
	"NPCGen/NPCGen/controller/Base.controller",
	'sap/m/MessageToast'
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Home", {

		press: function (oEvent) {
			MessageToast.show("Tile is pressed.");
		}

	});
});