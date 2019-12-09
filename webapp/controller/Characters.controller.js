sap.ui.define([
	"NPCGen/NPCGen/controller/Base.controller"
], function (Controller) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Characters", {

		onInit: function () {
			var oModel = this.getOwnerComponent().getModel("characters");
			this.getView().setModel(oModel);
		},

		onGenerateCharacter: function (oEvent) {
			var oTemplateModel = this.getOwnerComponent().getModel("templates");
			var oModel = this.getView().getModel();
		}
	});
});