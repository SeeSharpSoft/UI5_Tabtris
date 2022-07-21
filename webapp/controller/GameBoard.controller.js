/* global sap */

sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/mvc/Controller",
    "../model/TrisModel",
    "sap/ui/model/json/JSONModel"
], function (jQuery, BaseController, TrisModel, JSONModel) {
    "use strict";

    jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("seesharpsoft.tabtris", "/themes/base/GameBoard.css"));

    var oController = BaseController.extend("seesharpsoft.tabtris.controller.GameBoard", {
        onInit: function() {
            this.getView().setModel(new TrisModel(), "tetris");

            var oModel = new JSONModel();
            this.getView().setModel(oModel, "highscore");
            oModel.setProperty("/", {
                scores: [
                    {
                        name: "Todo",
                        score: 1000,
                        lines: 42
                    }
                ]
            });

            document.addEventListener("keydown", this._keyPressed.bind(this), false);
        },

        onExit: function() {
            document.removeEventListener("keydown", this._keyPressed.bind(this), false);
        },

        onPressStart: function(oEvent) {
            this.getView().getModel("tetris").startGame();
        },

        onPressPause: function(oEvent) {
            var oModel = this.getView().getModel("tetris");

            if(oModel.getProperty("/state") === "Paused") {
                oModel.unpauseGame();
            } else {
                oModel.pauseGame();
            }
        },

        _keyPressed: function(e) {
            e = e || window.event;

            if (e.keyCode == '38') {
                this.getView().getModel("tetris").blockRotateLeft();
            }
            else if (e.keyCode == '40') {
                this.getView().getModel("tetris").blockDown();
            }
            else if (e.keyCode == '37') {
               this.getView().getModel("tetris").blockLeft();
            }
            else if (e.keyCode == '39') {
               this.getView().getModel("tetris").blockRight();
            }
        }
    });

    return oController;
});