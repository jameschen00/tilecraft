define([
    "jquery",
    "backbone",
    "tmxjs/map",
    "tmxjs/tile-layer"
], function (
    $,
    Backbone,
    Map,
    TileLayer
) {
    return Backbone.View.extend({
        events: {
            "mousedown #main-menu-toggle": "toggle",
            "click .main-menu-new-button": "newMap",
            "click .main-menu-download-button": "downloadMap",
            "click .main-menu-undo-button": "undo"
        },

        aggregator: null,
        templates: {},

        /* A stack containing the actions recorded. */
        actions: [],

        initialize: function (options) {
            this.aggregator = options.aggregator;

            this.record(this.model, "change:cells");
            this.record(this.model, "change:layers:set-layer-name");
            this.record(this.model, "change:layers:set-layer-visible");
            this.record(this.model, "change:layers:insert-layer");
        },
        render: function () {
        },

        toggle: function () {
            var up = this.$el.hasClass("up");
            this.$el.toggleClass("up").animate({ top: up ? -1 : -34 });
        },
        newMap: function () {
            if (confirm("Are you sure you want to create a new map?")) {
                var map = this.model.get("map");
                var newMap = new Map(
                    Map.Orientation.ORTHOGONAL,
                    map.bounds.w,
                    map.bounds.h,
                    map.tileInfo.w,
                    map.tileInfo.h
                );
                var layer = new TileLayer("Tile Layer 1", newMap.bounds.clone());
                newMap.addLayer(layer);
                this.model.set("map", newMap);
            }
        },
        downloadMap: function () {
            var view = this;
            this.model.save()
                .done(function (response) {
                    if (response.successful) {
                        location.href = 'endpoint.php?r=map/' + view.model.id + '/download';
                    } else {
                        alert(response.message + ".");
                    }
                })
                .fail(function () {
                    alert("Failed to save map.");
                });
        },

        record: function (other, actionType) {
            this.listenTo(other, actionType, function () {
                this.actions.push(actionType);
            });
        },
        undo: function () {
            if (this.actions.length) {
                this.aggregator.trigger("undo:" + this.actions.pop());
            }
        },
        redo: function () {
        }
    });
});
