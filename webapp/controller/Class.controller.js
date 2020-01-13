sap.ui.define([
	"NPCGen/NPCGen/controller/Base.controller",
	"sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Character", {

		onInit: function () {
			var oModel = sap.ui.getCore().byId("container-NPCGen---Template").getModel();//this.getOwnerComponent().getModel("class");
			this.getView().setModel(oModel);
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.getRoute("Class").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/Templates/" + oEvent.getParameter("arguments").TemplId + "/Class/" + oEvent.getParameter("arguments").ClassId
			});

		}
	});
});