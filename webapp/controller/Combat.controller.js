sap.ui.define([
	"NPCGen/NPCGen/controller/Base.controller",
	"sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Character", {

		onInit: function () {
			var oModel = this.getOwnerComponent().getModel("templates");
			this.getView().setModel(oModel);
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.getRoute("Combat").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/Templates/" + oEvent.getParameter("arguments").TemplId + "/Race/" + oEvent.getParameter("arguments").Id
			});

		}
	});
});