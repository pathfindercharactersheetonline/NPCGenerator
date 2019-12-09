sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"NPCGen/NPCGen/model/formatter"
], function (Controller, formatter) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Characters", {

		formatter: formatter,

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