sap.ui.define([
	"NPCGen/NPCGen/controller/Base.controller",
	"sap/ui/core/UIComponent",
	"NPCGen/NPCGen/model/formatter",
	"sap/m/MessageToast"
], function (Controller, UIComponent, formatter, MessageToast) {
	"use strict";

	return Controller.extend("NPCGen.NPCGen.controller.Character", {
		formatter: formatter,
		onInit: function () {
			var oModel = this.getOwnerComponent().getModel("characters");
			this.getView().setModel(oModel);
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.getRoute("Character").attachPatternMatched(this._onObjectMatched, this);
		},
		fillClassModel: function (oController) {
			var oClass = oController.getOwnerComponent().getModel("class").getData();
			var oTemplates = this.getOwnerComponent().getModel("templates").getData();
			for (var i = 0; i < oTemplates.Templates.length; i++) {
				var sClass = undefined;
				for (var j = 0; j < oTemplates.Templates[i].Class.length; j++) {
					sClass = oTemplates.Templates[i].Class[j].Name;
					if (!oController.isArray(oClass.Class, "Name", sClass)) {
						oClass.Class.push({
							"Name": sClass
						});
					}
				}
			}
			oController.getOwnerComponent().getModel("class").refresh();
		},
		handleChangeClass: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();
			var oClass = this.getOwnerComponent().getModel("class").getData();

			if ((sSelectedKey && sValue) || this.isArray(oClass.Class, "Name", sValue)) {
				oValidatedComboBox.setValueState("None");
				this.byId("backCharacter").setEnabled(true);
			} else {
				oValidatedComboBox.setValueState("Error");
				oValidatedComboBox.setValueStateText("Please enter a valid Class!");
				MessageToast.show("Please enter a valid Class!");
				this.byId("backCharacter").setEnabled(false);
			}
		},
		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/Characters/" + oEvent.getParameter("arguments").Id
			});
			this.fillClassModel(this);
		}
	});
});