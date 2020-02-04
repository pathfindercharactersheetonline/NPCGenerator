sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"NPCGen/NPCGen/model/formatter",
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment",
	"sap/ui/core/util/File",
	"sap/ui/model/json/JSONModel"
], function (Controller, formatter, MessageToast, UIComponent, History, Fragment, File, JSONModel) {
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
		isArry: function (oArray, oElem, oValue) {
			for (var i = 0; i < oArray.length; i++) {
				if (oArray[i][oElem] === oValue) {
					return true;
				}
			}
		},
		onNavToItem: function (oEvent, sTarget) {
			var oItemPath = oEvent.getParameter("listItem").getBindingContext().getPath();
			var oId = oItemPath.slice(oItemPath.lastIndexOf("/") + "/".length, oItemPath.length);
			UIComponent.getRouterFor(this).navTo(sTarget, {
				Id: oId
			});
		},
		onNavToItemTempl: function (oEvent, sTarget) {
			var oItemPath = oEvent.getParameter("listItem").getBindingContext().getPath();
			var aPathSplit = oItemPath.split("/");
			var oTemplId = aPathSplit[2];
			var oId = aPathSplit[4];
			if (oTemplId !== undefined && oId !== undefined) {
				UIComponent.getRouterFor(this).navTo(sTarget, {
					TemplId: oTemplId,
					Id: oId
				});
			}
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
		onHandleUploadClose: function (oEvent) {
			this._oDialog.destroy();
			this._oDialog = undefined;
		},
		onHandleUploadPress: function (oEvent) {
			var oId = this.oView.getId() + "--fileUpload";
			var DomRef = sap.ui.getCore().byId(oId).getFocusDomRef();
			if (!DomRef) {
				MessageToast.show("Файл не определён");
				return;
			}
			var oFile = DomRef.files[0];
			if (!oFile) {
				MessageToast.show("Файл не определён");
				return;
			}

			var reader = new FileReader();
			reader.controller = this;
			reader.onload = function (oLoad) {
				var oMsg = undefined;
				var oViewName = this.controller.getView().getId().slice(19);
				var oData = JSON.parse(oLoad.target.result);
				if (oData) {
					var oFileData = Object.keys(oData).toLocaleString();
					if (oFileData === oViewName) {
						var oModel = this.controller.oView.getModel();
						if (oData.Characters || oData.Templates) {
							var oModelData = oModel.getProperty("/" + oViewName );
							for (var i = 0; i < oData[oFileData].length; i++) {
								oModelData.push(oData[oFileData][i]);
							}
							oModel.setProperty("/" + oViewName,oModelData);
							oModel.refresh();
						} else {
							oMsg = "Модель данных не инициализирована";
						}
					} else {
						oMsg = "Файл не совпадает с шаблоном";
					}
				} else {
					oMsg = "Не удалось преоброзовать JSON";
				}
				if (oMsg) {
					MessageToast.show(oMsg);
				}
			};
			reader.readAsText(oFile);
			this.onHandleUploadClose(oEvent);
		},
		onDownload: function (oEvent, oPath) {
			oPath = oPath.slice(1);
			var oModel = this.getView().getModel().oData;
			var sModel = JSON.stringify(oModel);
			File.save(sModel, oPath, "json", "application/json", undefined, true);
		},
		onOpenFragment: function (oEvent, oPath, oAction) {
			var oFragment = undefined;
			switch (oAction) {
			case "upload":
				oFragment = "uploadModelDialog";
				break;
			default:
				break;
			}
			if (oFragment) {
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment(this.getView().getId(), "NPCGen.NPCGen.fragment." + oFragment, this);
					this.getView().addDependent(this._oDialog);
					this._oDialog.open();
				} else {
					this._oDialog.open();
				}
			} else {
				MessageToast.show("Фрагмент не определён");
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
			if (!oEvent.getSource().getParent().getBindingContextPath) {
				var oSourcePath = oEvent.getSource().getParent().getBindingContext().getPath();
			} else {
				oSourcePath = oEvent.getSource().getParent().getBindingContextPath();
			}
			var oSourceArray = oSourcePath.split("/");
			var oDeleteIndex = oSourceArray[oSourceArray.length - 1];
			var oModidiers = this.getView().getModel().getProperty(oMassivePath);
			oModidiers.splice(oDeleteIndex, 1);
			this.getView().getModel().refresh();
		},
		// Generator

		getRandomObject: function (mObjects) { // у объектов есть вероятность
			var iMaxNum = 0;
			for (var i = 0; i < mObjects.length; i++) {
				mObjects[i].startNum = iMaxNum;
				iMaxNum += mObjects[i].Probability * 1;
				mObjects[i].endNum = iMaxNum;
			}
			var iRandomNumber = this.getRandomNumber.call(this, 0, iMaxNum);
			for (i = 0; i < mObjects.length; i++) {
				if (mObjects[i].startNum <= iRandomNumber && mObjects[i].endNum >= iRandomNumber) {
					return mObjects[i];
				}
			}
			return undefined;
		},
		getRandomNumber: function getRndInteger(min, max) {
			try {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			} catch (err) {
				return undefined;
			}
		},

		onGenerateCharacter: function (oEvent) {
			var oMassive = this.getOwnerComponent().getModel("characters").getProperty("/Characters");
			var oNewLine = JSON.parse(JSON.stringify(this.getOwnerComponent().getModel("template").getProperty("/Character")));
			if (!oEvent.getSource().getParent().getBindingContextPath) {
				var oSourcePath = oEvent.getSource().getParent().getBindingContext().getPath();
			} else {
				oSourcePath = oEvent.getSource().getParent().getBindingContextPath();
			}
			var oTemplate = this.getOwnerComponent().getModel("templates").getProperty(oSourcePath);

			oNewLine.Gender = this.getRandomObject.call(this, oTemplate.Gender).Name;
			switch (oNewLine.Gender) {
			case "Male":
				oNewLine.Name = this.getRandomObject.call(this, oTemplate.MaleName).Name;
				break;
			case "Female":
				oNewLine.Name = this.getRandomObject.call(this, oTemplate.FemaleName).Name;
				break;
			default:
				oNewLine.Name = this.getRandomObject.call(this, oTemplate.MaleName).Name;
			}
			oNewLine.Surname = this.getRandomObject.call(this, oTemplate.Surname).Name;
			oNewLine.Race = this.getRandomObject.call(this, oTemplate.Race).Name;

			for (var i = 0; i < oTemplate.Race.length; i++) {
				if (oTemplate.Race[i].Name === oNewLine.Race) {
					oNewLine.Combat.Size = oTemplate.Race[i].Combat.Size;
					oNewLine.Combat.Feet = oTemplate.Race[i].Combat.Feet;
					break;
				}
			}

			oNewLine.Deity = this.getRandomObject.call(this, oTemplate.Deity).Name;
			var sProfessionType = this.getRandomObject.call(this, oTemplate.ProfessionType).Name;
			oNewLine.Profession = this.getRandomObject.call(this, oTemplate.Profession[sProfessionType]).Name;
			oNewLine.Age = this.getRandomNumber.call(this, 20, 80);
			oNewLine.SubmissiveLeader = this.getRandomNumber.call(this, 1, 10);
			oNewLine.Motive.Love = this.getRandomNumber.call(this, 1, 10);
			oNewLine.Motive.Money = this.getRandomNumber.call(this, 1, 10);
			oNewLine.Motive.Ideology = this.getRandomNumber.call(this, 1, 10);
			oNewLine.Motive.Survival = this.getRandomNumber.call(this, 1, 10);
			oNewLine.Motive.InventionExploration = this.getRandomNumber.call(this, 1, 10);
			oNewLine.Wealth = this.getRandomNumber.call(this, 1, 10);
			oNewLine.Lvl = this.getRandomNumber.call(this, oTemplate.Lvl.From, oTemplate.Lvl.To);

			var oClass = Object.assign({}, this.getRandomObject.call(this, oTemplate.Class));
			oNewLine.Class.Name = oClass.Name;
			oNewLine.Class.Probability = oClass.Probability;
			oNewLine.Class.Description = oClass.Description;
			var oAbilities = Object.keys(oNewLine.Class.Abilities);
			for (var i = 0; i < oAbilities.length; i++) {
				oNewLine.Class.Abilities[oAbilities[i]] = this.getRandomNumber.call(this, parseInt(oClass.Abilities[oAbilities[i]].From),
					parseInt(oClass.Abilities[oAbilities[i]].To));
			}

			oMassive.push(oNewLine);
			this.getOwnerComponent().getModel("characters").refresh();
			MessageToast.show(oNewLine.Name + " created");
		}

	});
});