sap.ui.define([
	"NPCGen/NPCGen/controller/Base.controller",
	"sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Character", {

		onInit: function () {
			var oModel = this.getOwnerComponent().getModel("characters");
			this.getView().setModel(oModel);
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.getRoute("Character").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/Characters/" + oEvent.getParameter("arguments").Id
			});

		}
	});
});