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
		isArray: function (oArray, oElem, oValue) {
			for (var i = 0; i < oArray.length; i++) {
				if (oArray[i][oElem] === oValue) {
					return true;
				}
			}
			return false;
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
		onHandleUploadPress: function (oEvent) { //ds
			var oId = this.oView.getId() + "--fileUpload";
			var DomRef = sap.ui.getCore().byId(oId).getFocusDomRef();
			if (!DomRef) {
				MessageToast.show("Файл не определён");
				return;
			}
			var oFile = DomRef.files[0]; //
			if (!oFile) {
				MessageToast.show("Файл не определён");
				return;
			} //
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
							var oModelData = oModel.getProperty("/" + oViewName);
							for (var i = 0; i < oData[oFileData].length; i++) {
								oModelData.push(oData[oFileData][i]);
							}
							oModel.setProperty("/" + oViewName, oModelData);
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
			var oData = this.getView().getModel().getProperty("/");
			var sData = JSON.stringify(oData);
			File.save(sData, oPath, "json", "application/json", undefined, true);
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

		getDeleteRandomObject: function (mObjects) { // копипаста по говну
			var iMaxNum = 0;
			for (var i = 0; i < mObjects.length; i++) {
				mObjects[i].startNum = iMaxNum;
				iMaxNum += mObjects[i].Probability * 1;
				mObjects[i].endNum = iMaxNum;
			}
			var iRandomNumber = this.getRandomNumber.call(this, 0, iMaxNum);
			for (i = 0; i < mObjects.length; i++) {
				if (mObjects[i].startNum <= iRandomNumber && mObjects[i].endNum >= iRandomNumber) {
					var oResult = mObjects[i];
					mObjects.splice(i, 1);
					return oResult;
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

			// делаем по говну
			// oTemplate.TagsNumFrom до oTemplate.TagsNumTo

			var mTags = JSON.parse(JSON.stringify(oTemplate.Tags));
			var oTagsNum = this.getRandomNumber.call(this, oTemplate.TagsNumFrom * 1, oTemplate.TagsNumTo * 1) * 1;

			if (oTagsNum > mTags.length) oTagsNum = mTags.length;
			oNewLine.Tags = [];
			for (var i = 0; i < oTagsNum; i++) {
				oNewLine.Tags.push(this.getDeleteRandomObject.call(this, mTags).Name);
			}

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

			for (i = 0; i < oTemplate.Race.length; i++) {
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
			for (i = 0; i < oAbilities.length; i++) {
				oNewLine.Class.Abilities[oAbilities[i]] = this.getRandomNumber.call(this, parseInt(oClass.Abilities[oAbilities[i]].From),
					parseInt(oClass.Abilities[oAbilities[i]].To));
			}

			// погнали ебошить статы. Надо посчитать и записать их стрингой чтобы можно было подкрутить
			oNewLine.Initiative = formatter.abilitiesMod(oNewLine.Class.Abilities["Dexterity"]) + ""; // Init = DexMod
			oNewLine.Health = 0;
			for (i = 0; i < oNewLine.Lvl; i++) {
				oNewLine.Health += formatter.abilitiesMod(oNewLine.Class.Abilities["Constitution"]) * 1 + //
					this.getRandomNumber.call(this, 1, oClass.HD * 1) * 1;
			}
			oNewLine.Health += ""; // hp = sum(class HD, level) + CON*oLevel

			oNewLine.Fortitude = formatter.abilitiesMod(oNewLine.Class.Abilities["Constitution"]) * 1;
			if (oClass.FortForm === "1") oNewLine.Fortitude += Math.floor(oNewLine.Lvl / 3);
			else if (oClass.FortForm === "2") oNewLine.Fortitude += Math.floor(2 + oNewLine.Lvl / 2);
			oNewLine.Fortitude += ""; // Con + Fort(class) или floor(classLVL/3) или floor(2 + classLVL/2), значение заполнить при генерации персонажа

			oNewLine.Reflex = formatter.abilitiesMod(oNewLine.Class.Abilities["Dexterity"]) * 1;
			if (oClass.RefForm === "1") oNewLine.Reflex += Math.floor(oNewLine.Lvl / 3);
			else if (oClass.RefForm === "2") oNewLine.Reflex += Math.floor(2 + oNewLine.Lvl / 2);
			oNewLine.Reflex += ""; // Dex + Ref(class) или floor(classLVL/3) или floor(2 + classLVL/2), значение заполнить при генерации персонажа

			oNewLine.Will = formatter.abilitiesMod(oNewLine.Class.Abilities["Wisdom"]) * 1;
			if (oClass.WillForm === "1") oNewLine.Will += Math.floor(oNewLine.Lvl / 3);
			else if (oClass.WillForm === "2") oNewLine.Will += Math.floor(2 + oNewLine.Lvl / 2);
			oNewLine.Will += ""; // Wis + Will(class) или floor(classLVL/3) или floor(2 + classLVL/2), значение заполнить при генерации персонажа

			oNewLine.BAB = 0; // От уровня по настраиваемой формуле 0,5 или 1 или 0,75 от ур-ня
			if (oClass.BABForm === "1") oNewLine.BAB = Math.floor(oNewLine.Lvl * 0.5);
			else if (oClass.BABForm === "2") oNewLine.BAB = Math.floor(oNewLine.Lvl * 0.75);
			else if (oClass.BABForm === "3") oNewLine.BAB = Math.floor(oNewLine.Lvl * 1);

			oNewLine.AttackSTR = (oNewLine.BAB //
					+ formatter.abilitiesMod(oNewLine.Class.Abilities["Strength"]) * 1) //
				+ ""; // STR/DEX + Base Atk(level, class) + 0,5 или 1 или 0,75 от ур-ня

			oNewLine.AttackDEX = (oNewLine.BAB //
					+ formatter.abilitiesMod(oNewLine.Class.Abilities["Dexterity"]) * 1) //
				+ ""; // STR/DEX + Base Atk(level, class) + 0,5 или 1 или 0,75 от ур-ня

			oNewLine.DamageSTR1H = //
				Math.floor(formatter.abilitiesMod(oNewLine.Class.Abilities["Strength"])) + ""; // STR/DEX + DMG(weapon)
			oNewLine.DamageDEX1H = //
				Math.floor(formatter.abilitiesMod(oNewLine.Class.Abilities["Dexterity"])) + ""; // STR/DEX + DMG(weapon)
			oNewLine.DamageSTR2H = //
				Math.floor(formatter.abilitiesMod(oNewLine.Class.Abilities["Strength"]) * 1.5) //
				+ ""; // 1,5*STR/DEX + DMG(weapon)
			oNewLine.DamageDEX2H = //
				Math.floor(formatter.abilitiesMod(oNewLine.Class.Abilities["Dexterity"]) * 1.5) //
				+ ""; // 1,5*STR/DEX + DMG(weapon)
			oNewLine.DamageSTRoffH = //
				Math.floor(formatter.abilitiesMod(oNewLine.Class.Abilities["Strength"]) * 0.5) //
				+ ""; // 0,5*STR/DEX + DMG(weapon)
			oNewLine.DamageDEXoffH = //
				Math.floor(formatter.abilitiesMod(oNewLine.Class.Abilities["Dexterity"]) * 0.5) //
				+ ""; // 0,5*STR/DEX + DMG(weapon)

			oNewLine.Combat.SizeBonus = 0;
			if (oNewLine.Combat.Size === "Small") oNewLine.Combat.SizeBonus = 1;

			oNewLine.CMB = (formatter.abilitiesMod(oNewLine.Class.Abilities["Strength"]) //
				+ oNewLine.BAB - oNewLine.Combat.SizeBonus) + ""; // Base Attack Bonus + Str - SizeBonus
			oNewLine.CMD = (10 + oNewLine.BAB + //
				formatter.abilitiesMod(oNewLine.Class.Abilities["Strength"]) + //
				formatter.abilitiesMod(oNewLine.Class.Abilities["Dexterity"]) - //
				oNewLine.Combat.SizeBonus) + ""; // 10 + Base Attack Bonus + Str + Dex - SizeBonus
			oNewLine.TouchAC = oNewLine.AC = (10 + formatter.abilitiesMod(oNewLine.Class.Abilities["Dexterity"]) + //
				oNewLine.Combat.SizeBonus) + ""; // 10 + Dex + SizeBonus
			oNewLine.FlatFootedAC = oNewLine.Combat.SizeBonus + ""; // SizeBonus

			oMassive.push(oNewLine);
			this.getOwnerComponent().getModel("characters").refresh();
			MessageToast.show(oNewLine.Name + " created");
		}

	});
});