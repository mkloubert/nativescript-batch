var ViewModel = require("./main-view-model");


function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = ViewModel.createViewModel();
}
exports.onNavigatingTo = onNavigatingTo;
