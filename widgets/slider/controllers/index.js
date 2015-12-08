'use strict';

module.exports = function (controller, component, application) {

    controller.settingWidget = function (widget) {
        // Get all widget layouts
        let layouts = component.getLayouts(widget.widget_name);

        // Create setting form
        let form = new ArrowHelper.WidgetForm(widget);
        form.addCheckbox('display_slider', 'Display');
        form.addSelect('layout', 'Layout', layouts);

        return new Promise(function (fullfill, reject) {
            fullfill(form.render());
        })
    };

    controller.renderWidget = function (widget) {
        // Get layouts
        let layout;
        try {
            layout = JSON.parse(widget.data).layout;
        } catch (err) {
            layout = component.getLayouts(widget.widget_name)[0];
        }

        if (JSON.parse(widget.data).display_slider == 1) {
            return application.models.product.findAll({
                limit: 4,
                order: 'created_at desc'
            }).then(function (products) {
                // Render view with layout
                return component.render(layout, {
                    slider: products
                })
            });
        }
    };
};

