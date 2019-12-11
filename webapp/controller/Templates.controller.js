sap.ui.define([
	"NPCGen/NPCGen/controller/Base.controller"
], function (Controller) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Templates", {

		onInit: function () {
			var oModel = this.getOwnerComponent().getModel("templates");
			this.getView().setModel(oModel);
		}
	});
});