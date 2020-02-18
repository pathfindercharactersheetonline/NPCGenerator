sap.ui.define([
	"NPCGen/NPCGen/controller/Base.controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast"
], function (Controller, UIComponent, MessageToast) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Template", {

		onInit: function () {
			var oModel = this.getOwnerComponent().getModel("templates");
			this.getView().setModel(oModel);
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.getRoute("Template").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/Templates/" + oEvent.getParameter("arguments").Id
			});
		},
		handleLiveChangeLvl: function (oEvent) {
			var oValue = parseInt(oEvent.getParameter("value"));
			var oId = oEvent.getParameter("id");
			var msg = undefined;
			var oLvlFrom = parseInt(this.byId("lvlFrom").getValue());
			var oLvlTo   = parseInt(this.byId("lvlTo"  ).getValue());

			if (isNaN(oValue)) { //Не число
				msg = "Значение не число";
			} else if (oValue < 1) { //Меньше нуля
				msg = oValue + " " + "меньше единицы";
			}

			if (oLvlFrom >= oLvlTo) {
				msg = "начало диапазона меньше или равно окончания";
			} else if (oLvlFrom < oLvlTo) {
				this.byId("lvlTo"  ).setValueState();
				this.byId("lvlFrom").setValueState();
			}

			if (msg !== undefined) {
				MessageToast.show(msg);
				this.byId(oId).setValueState("Error");
				return;
			}
			this.byId(oId).setValueState();
		}

	});
});