sap.ui.define([
	"NPCGen/NPCGen/controller/Base.controller",
	"sap/ui/core/UIComponent",
	"NPCGen/NPCGen/model/formatter"
], function (Controller, UIComponent, formatter) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Character", {
		formatter: formatter,
		onInit: function () {
			var oModel = this.getOwnerComponent().getModel("characters");
			this.getView().setModel(oModel);
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.getRoute("Character").attachPatternMatched(this._onObjectMatched, this);
		},
		onHandleLoadClass: function(oEvent){
			return;
		},
		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/Characters/" + oEvent.getParameter("arguments").Id
			});
	 
		}
	});
});