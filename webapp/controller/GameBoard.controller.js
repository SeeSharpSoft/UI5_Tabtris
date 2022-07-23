/* global sap */

sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/mvc/Controller",
    "../model/TrisModel",
    "../constants/GameState"
], function (jQuery, BaseController, TrisModel, GameState) {
    "use strict";

    jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("seesharpsoft.tabtris", "/themes/base/GameBoard.css"));

    var oController = BaseController.extend("seesharpsoft.tabtris.controller.GameBoard", {
        onInit: function() {
            this.getView().setModel(new TrisModel(), "tetris");

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

            if(oModel.getProperty("/state") === GameState.PAUSED) {
                oModel.unpauseGame();
            } else {
                oModel.pauseGame();
            }
        },

        _keyPressed: function(e) {
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