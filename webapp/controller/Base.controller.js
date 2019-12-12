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

		onNavToItem: function (oEvent, sTarget) {
			var oItemPath = oEvent.getParameter("listItem").getBindingContext().getPath();
			var oId = oItemPath.slice(oItemPath.lastIndexOf("/") + "/".length, oItemPath.length);
			UIComponent.getRouterFor(this).navTo(sTarget, {
				Id: oId
			});
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
		},

		onNew: function (oEvent, oMassivePath, oTemplateName) {
			var oPath = oMassivePath;
			var oMassive = this.getView().getModel().getProperty(oPath);
			var oNewLine = JSON.parse(JSON.stringify(this.getOwnerComponent().getModel("template").getProperty(oTemplateName)));
			oMassive.push(oNewLine);
			this.getView().getModel().refresh();
		},

		onDeleteAll: function (oEvent, oMassivePath) {
			var oMassive = this.getView().getModel().getProperty(oMassivePath);
			oMassive.splice(0, oMassive.length);
			this.getView().getModel().refresh();
		},

		onDelete: function (oEvent, oMassivePath) {
			if (!oEvent.getSource().getParent().getBindingContextPath)
				var oSourcePath = oEvent.getSource().getParent().getBindingContext().getPath();
			else
				oSourcePath = oEvent.getSource().getParent().getBindingContextPath();
			var oSourceArray = oSourcePath.split("/");
			var oDeleteIndex = oSourceArray[oSourceArray.length - 1];
			var oModidiers = this.getView().getModel().getProperty(oMassivePath);
			oModidiers.splice(oDeleteIndex, 1);
			this.getView().getModel().refresh();
		}

	});
});