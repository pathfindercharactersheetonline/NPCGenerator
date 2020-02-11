sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return {
		getRandomObject: function (mObjects) { // у объектов есть вероятность
			let iMaxNum = 0;
			for (let i = 0; i < mObjects.length; i++) {
				mObjects[i].startNum = iMaxNum;
				iMaxNum += mObjects[i].Probability;
				mObjects[i].endNum = iMaxNum;
			}
			let iRandomNumber = Math.random(iMaxNum);
			for (let i = 0; i < mObjects.length; i++) {
				if (mObjects[i].startNum <= iRandomNumber && mObjects[i].endNum >= iRandomNumber)
					return mObjects[i];
			}
			return undefined;
		},
		getRandomNumber: function (iMaxNum) {
			try {
				return Math.random(iMaxNum);
			} catch (err) {
				return undefined;
			}
		},
		CombatFeet: function (oValue) {
			switch (oValue) {
			case null:
				return null;
			case undefined:
				return undefined;
			default:
				return oValue + " " + "ft.";
			}
		},
		abilitiesMod: function (oValue) {
				/*if (oValue != nill) {
					var oPath = this.oView.mObjectBindingInfos.undefined.binding.getPath();
					var aPath = oPath.split("/");
					var oModel = this.oView.mObjectBindingInfos.undefined.binding.getModel().oData[aPath[1]][aPath[2]];
					var oLvl = oModel.Lvl;
					return;
				}
				return 0;
				*/
				switch (oValue) {
				case null:
					return null;
				case undefined:
					return undefined;
				default:
					return Math.floor((oValue - 10) / 2);
				}
			}
			// + привычки
	};
});