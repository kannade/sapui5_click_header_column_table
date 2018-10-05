sap.ui.define([
	"jquery.sap.global",
	"./Formatter",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter"
], function (jQuery, Formatter, Controller, JSONModel, Sorter, Filter) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.Table.Table", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);

			//создадим всплывающее окошко
			if (!this._oResponsivePopover) {
				this._oResponsivePopover = sap.ui.xmlfragment("sap.m.sample.Table.TableSorter", this);
				//this._oResponsivePopover.setModel(this.getView().getModel());
			}
		},

		onAfterRendering: function () {
			var oTab = this.getView().byId("idProductsTable");
			
			//после отрисовки таблицы возьмем все колонки и добавим им событие click
			oTab.addEventDelegate({
				"onAfterRendering": function (id) {

					var that = this;
					var oHeader = this.getView().$().find(".sapMListTblHeaderCell"); //Get hold of table header elements

					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						that.onClick(oID);
					}

				}.bind(this)

			}, this);

		},

		onClick: function (oID) {
			var that = this;
			$("#" + oID).click(function (oEvent) { //добавим событие "click" к колонке
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oLabelText = oTarget.childNodes[0].textContent; //Get Column Header text
				var oIndex = oTarget.id.slice(-1); //Get the column Index
				var oView = that.getView();
				var oTable = oView.byId("idMyReqTable");
				//var oModel = oTable.getModel().getProperty("/ProductCollection"); //Get Hold of Table Model Values
				//var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
				//	oView.getModel().setProperty("/bindingValue", sap.ui.getCore().byId(oEvent.currentTarget.id).data("key")); //Save the key value to property
				oView._bindingValue = sap.ui.getCore().byId(oEvent.currentTarget.id).data("key"); // название поля в моделе
				that._oResponsivePopover.openBy(oEvent.target);

				// Можно добавить разные css стили для сортировок.
				// if (sap.ui.Device.browser.name === "cr") {
				// 	if ($("#" + oEvent.currentTarget.id).hasClass("descending")) {
				// 		$("#" + oEvent.currentTarget.id).removeClass("descending");
				// 		$("#" + oEvent.currentTarget.id).addClass("ascending");
				// 	} else if ($("#" + oEvent.currentTarget.id).hasClass("ascending")) {
				// 		$("#" + oEvent.currentTarget.id).removeClass("ascending");
				// 		$("#" + oEvent.currentTarget.id).addClass("descending");
				// 	} else {
				// 		$("#" + oEvent.currentTarget.id).addClass("ascending");
				// 	}
				// } else {
				// 	if ($("#" + oEvent.currentTarget.id).hasClass("descendingIe")) {
				// 		$("#" + oEvent.currentTarget.id).removeClass("descendingIe");
				// 		$("#" + oEvent.currentTarget.id).addClass("ascendingIe");
				// 	} else if ($("#" + oEvent.currentTarget.id).hasClass("ascendingIe")) {
				// 		$("#" + oEvent.currentTarget.id).removeClass("ascendingIe");
				// 		$("#" + oEvent.currentTarget.id).addClass("descendingIe");
				// 	} else {
				// 		$("#" + oEvent.currentTarget.id).addClass("ascendingIe");
				// 	}
				// }
			});
		},

		onChange: function (oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var oTable = this.getView().byId("idProductsTable");
			//var oBindingPath = this.getView().getModel().getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
			var oBindingPath = this.getView()._bindingValue;
			var aFilters = [];
			for (var i = 0; i < oMultipleValues.length; i++) {
				var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
				aFilters.push(oFilter);
			}
			var oItems = oTable.getBinding("items");
			oItems.filter(aFilters, "Application");
			this._oResponsivePopover.close();
		},

		onAscending: function (evt) {
			var oTable = this.getView().byId("idProductsTable");
			var oItems = oTable.getBinding("items");
			//	var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
			var oBindingPath = this.getView()._bindingValue;
			var oSorter = new Sorter(oBindingPath);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onDescending: function (evt) {
			var oTable = this.getView().byId("idProductsTable");
			var oItems = oTable.getBinding("items");
			//var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
			var oBindingPath = this.getView()._bindingValue;
			var oSorter = new Sorter(oBindingPath, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onOpen: function (oEvent) {
			//On Popover open focus on Input control
			var oPopover = sap.ui.getCore().byId(oEvent.getParameter("id"));
			var oPopoverContent = oPopover.getContent()[0];
			var oCustomListItem = oPopoverContent.getItems()[2];
			var oCustomContent = oCustomListItem.getContent()[0];
			var oInput = oCustomContent.getItems()[1];
			oInput.focus();
			oInput.$().find(".sapMInputBaseInner")[0].select();
		},

		onPopinLayoutChanged: function () {
			var oTable = this.byId("idProductsTable");
			var oComboBox = this.byId("idPopinLayout");
			var sPopinLayout = oComboBox.getSelectedKey();
			switch (sPopinLayout) {
			case "Block":
				oTable.setPopinLayout(sap.m.PopinLayout.Block);
				break;
			case "GridLarge":
				oTable.setPopinLayout(sap.m.PopinLayout.GridLarge);
				break;
			case "GridSmall":
				oTable.setPopinLayout(sap.m.PopinLayout.GridSmall);
				break;
			default:
				oTable.setPopinLayout(sap.m.PopinLayout.Block);
				break;
			}
		},

		onSelectionFinish: function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems");
			var oTable = this.byId("idProductsTable");
			var aSticky = aSelectedItems.map(function (oItem) {
				return oItem.getKey();
			});

			oTable.setSticky(aSticky);
		},

		onToggleInfoToolbar: function (oEvent) {
			var oTable = this.byId("idProductsTable");
			oTable.getInfoToolbar().setVisible(!oEvent.getParameter("pressed"));
		}
	});

	return TableController;

});