/* global sap, window */

sap.ui.define([
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel"
], function (jQuery, BaseModel) {
    "use strict";

    if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        window.requestAnimationFrame =  window.webkitRequestAnimationFrame ||
                                        window.mozRequestAnimationFrame    ||
                                        window.oRequestAnimationFrame      ||
                                        window.msRequestAnimationFrame     ||
                                        function(callback) {
                                            window.setTimeout(callback, 1000 / 60);
                                        };
    }

    var oTrisModel = BaseModel.extend("seesharpsoft.tabtris.model.TrisModel", {

        NO_OF_ROWS: 20,
        NO_OF_COLUMNS: 10,

        INITIAL_SPEED: 800.0,

        GAME_STATE: {
            NEW: "New",
            RUNNING: "Running",
            PAUSED: "Paused",
            ENDED: "Ended"
        },

        BLOCK: {
            EMPTY: "0",
            I: "I",
            O: "O",
            T: "T",
            J: "J",
            L: "L",
            S: "S",
            Z: "Z"
        },

        BLOCK_POSITION: {
            I: {
                0: 0x159D,
                1: 0x4567,
                2: 0x159D,
                3: 0x4567
            },
            O: {
                0: 0x569A,
                1: 0x569A,
                2: 0x569A,
                3: 0x569A
            },
            T: {
                0: 0x1456,
                1: 0x1569,
                2: 0x4569,
                3: 0x1459
            },
            J: {
                0: 0x1589,
                1: 0x0456,
                2: 0x0148,
                3: 0x0126
            },
            L: {
                0: 0x0489,
                1: 0x0124,
                2: 0x0159,
                3: 0x2456
            },
            S: {
                0: 0x1245,
                1: 0x0459,
                2: 0x1245,
                3: 0x0459
            },
            Z: {
                0: 0x0156,
                1: 0x1458,
                2: 0x0156,
                3: 0x1458
            }
        },

        constructor: function() {
            var vResult = BaseModel.call(this, arguments);
            
			this.setDefaultBindingMode("OneWay");
            this.init();

            return vResult;
        },

        init: function() {
            var oData = {
                board: {
                    rows: []
                },
                score: 0,
                lines: 0,
                block: this.createNewBlock(),
                state: this.GAME_STATE.NEW
            };

            for(var rows = 0; rows < this.NO_OF_ROWS; ++rows) {
                oData.board.rows.push({ columns: this._getEmptyRow() });
            }

            this.setData(oData);
        },

        _getEmptyRow: function() {
            var aResult = [];
            for(var columns = 0; columns < this.NO_OF_COLUMNS; ++columns) {
                aResult.push({
                    type: this.BLOCK.EMPTY
                });
            }
            return aResult;
        },

        getBoard: function(bOriginal) {
            var oBoard = this.getProperty("/board");
            if(!bOriginal) {
                oBoard = jQuery.extend(true, {}, oBoard);
            }
            return oBoard;
        },

        getBlock: function(bOriginal) {
            var oBlock = this.getProperty("/block");
            if(!bOriginal) {
                oBlock = jQuery.extend(true, {}, oBlock);
            }
            return oBlock;
        },

        createNewBlock: function() {
            var oBlock = {
                type: this.BLOCK[Object.keys(this.BLOCK)[Math.floor(Math.random() * 7 + 1)]],
                posX: this.NO_OF_COLUMNS / 2 - 1,
                posY: 0,
                rotation: 0
            };

            return oBlock;
        },

        removeFullLines: function() {
            var oBoard = this.getBoard(),
                iRemovedLines = 0;

            for(var rows = 0; rows < this.NO_OF_ROWS; ++rows) {
                var oRow = oBoard.rows[rows],
                    bHasGap = false;
                for(var columns = 0; columns < this.NO_OF_COLUMNS; ++columns) {
                    if(oRow.columns[columns].type == this.BLOCK.EMPTY) {
                        bHasGap = true;
                        break;
                    };
                }
                // full line
                if(!bHasGap) {
                    oBoard.rows.splice(rows, 1);
                    oBoard.rows.unshift({ columns: this._getEmptyRow()});
                    ++iRemovedLines;
                }
            }

            this.setProperty("/board", oBoard);
            this.setProperty("/lines", this.getProperty("/lines") + iRemovedLines);
            // it is better to remove more lines at once
            // if no line was removed, still give score for placing a stone
            this.setProperty("/score", this.getProperty("/score") + Math.pow(5, iRemovedLines));

            this._fSpeed-= 20*iRemovedLines;
        },

        _tick: function() {
            var iTick = Date.now();
            if(!this._iLastTick) {
                this._iLastTick = iTick;
            }
            if((iTick - this._iLastTick) > this._fSpeed) {
                this._iLastTick = iTick;
                if(!this.blockDown()) {
                    if(!this.nextBlock()) {
                        this.endGame();
                        return;
                    }
                }
            }
            if(!this._bStop) {
                window.requestAnimationFrame(this._tick.bind(this));
            }
        },

        nextBlock: function() {
            this.removeFullLines();
            var oBoard = this.getBoard(),
                oBlock = this.createNewBlock();

            if(!this._setBlockOnBoard(oBoard, oBlock)) {
                return false;
            }

            this.setProperty("/board", oBoard);
            this.setProperty("/block", oBlock);
            return true;
        },

        startGame: function() {
            this._bStop = false;
            this.init();
            this.setProperty("/state", this.GAME_STATE.RUNNING);
            this.nextBlock();
            this._fSpeed = this.INITIAL_SPEED;
            this._tick();
        },

        endGame: function() {
            this._bStop = true;
            this.setProperty("/state", this.GAME_STATE.ENDED);
        },

        pauseGame: function() {
            if(this.getProperty("/state") !== this.GAME_STATE.RUNNING) {
                return;
            }
            this._bStop = true;
            this.setProperty("/state", this.GAME_STATE.PAUSED);
        },

        unpauseGame: function() {
            if(this.getProperty("/state") !== this.GAME_STATE.PAUSED) {
                return;
            }
            this._bStop = false;
            this.setProperty("/state", this.GAME_STATE.RUNNING);
            this._tick();
        },

        _removeBlockFromBoard: function(oBoard, oBlock) {
            if(!oBlock || oBlock.type == this.BLOCK.EMPTY) {
                return false;
            }
            var x, y, iBlockRotation, iSingleBlockPosition;
            for(var i=0; i < 4; ++i) {
                iBlockRotation = this.BLOCK_POSITION[oBlock.type][oBlock.rotation];
                iSingleBlockPosition = (0xF & (iBlockRotation >> 4*i));
                x = oBlock.posX + (iSingleBlockPosition % 4);
                y = oBlock.posY + Math.floor(iSingleBlockPosition / 4);

                if(x < 0 || x >= this.NO_OF_COLUMNS ||
                    y < 0 || y >= this.NO_OF_ROWS ||
                    oBoard.rows[y].columns[x].type != oBlock.type)
                {
                    jQuery.sap.log.error("inconsistent board in _removeBlockFromBoard");
                    return false;
                }

                oBoard.rows[y].columns[x].type = this.BLOCK.EMPTY;
            }
            return true;
        },

        _setBlockOnBoard: function(oBoard, oBlock) {
            if(!oBlock || oBlock.type == this.BLOCK.EMPTY) {
                jQuery.sap.log.error("block is EMPTY");
                return false;
            }
            var x, y, iBlockRotation, iSingleBlockPosition;
            for(var i=0; i < 4; ++i) {
                iBlockRotation = this.BLOCK_POSITION[oBlock.type][oBlock.rotation];
                iSingleBlockPosition = (0xF & (iBlockRotation >> 4*i));
                x = oBlock.posX + (iSingleBlockPosition % 4);
                y = oBlock.posY + Math.floor(iSingleBlockPosition / 4);

                if(x < 0 || x >= this.NO_OF_COLUMNS ||
                   y < 0 || y >= this.NO_OF_ROWS ||
                   oBoard.rows[y].columns[x].type != this.BLOCK.EMPTY)
               {
                   jQuery.sap.log.debug("field " + x + ";" + y + " outside range or occupied");
                   return false;
               }

                oBoard.rows[y].columns[x].type = oBlock.type;
            }
            return true;
        },

        _tryChangeBlock: function(fnBlockCallback) {
            var oBlock = this.getBlock();

            if(oBlock == this.BLOCK.EMPTY) {
                return false;
            }

            var oBoard = this.getBoard();

            if(!this._removeBlockFromBoard(oBoard, oBlock)) {
                return false;
            }

            fnBlockCallback(oBlock);

            if(!this._setBlockOnBoard(oBoard, oBlock)) {
                return false;
            }

            this.setProperty("/board", oBoard);
            this.setProperty("/block", oBlock);

            return true;
        },

        blockDown: function() {
            return this._tryChangeBlock(function(oBlock) {
                oBlock.posY++;
            });
        },

        blockRotateLeft: function() {
            return this._tryChangeBlock(function(oBlock) {
                oBlock.rotation = (oBlock.rotation + 1) % 4;
            });
        },

        blockRotateRight: function() {
            return this._tryChangeBlock(function(oBlock) {
                oBlock.rotation = (oBlock.rotation -1) % 4;
            });
        },

        blockLeft: function() {
            return this._tryChangeBlock(function(oBlock) {
                oBlock.posX--;
            });
        },

        blockRight: function() {
            return this._tryChangeBlock(function(oBlock) {
                oBlock.posX++;
            });
        }
    });

    return oTrisModel;

});