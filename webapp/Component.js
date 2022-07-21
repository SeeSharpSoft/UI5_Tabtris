/* global sap */

sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/UIComponent"
], function(jQuery, UIComponent) {
    "use strict";

    var oComponent = UIComponent.extend("seesharpsoft.tabtris.Component", {

        metadata: {
            "manifest": "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            this.getRouter().initialize();
        }

    });

    return oComponent;

}, true);
