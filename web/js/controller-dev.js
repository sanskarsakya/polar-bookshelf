
function launchDev() {

    var datastore = new MemoryDatastore();
    var controller = new Controller(datastore);
    controller.startListeners();
    console.log("Controller started in dev mode");

}

function launch(launcherFunction) {

    if (document.readyState === "complete" || document.readyState === "loaded") {
        launcherFunction();
    } else {
        document.addEventListener('DOMContentLoaded', launcherFunction(), true);
    }

}

launch(launchDev);
