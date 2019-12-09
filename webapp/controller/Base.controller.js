sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"NPCGen/NPCGen/model/formatter",
	'sap/m/MessageToast',
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History"
], function (Controller, formatter, MessageToast, UIComponent, History) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Base", {

		formatter: formatter,

		onInit: function () {},

		onNavTo: function (oEvent, sTarget) {
			try {
				UIComponent.getRouterFor(this).navTo(sTarget);
			} catch (err) {
				MessageToast.show(err.message);
			}
		},

		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Home", true);
			}
		}

	});
});