
import {Logger} from '../web/js/logger/Logger';
import {Capture} from '../web/js/capture/Capture';
import {Browsers} from '../web/js/capture/Browsers';
import {DiskDatastore} from '../web/js/datastore/DiskDatastore';
import {Args} from '../web/js/electron/capture/Args';

const electron = require('electron');
const app = electron.app;
const BrowserRegistry = require("../web/js/capture/BrowserRegistry");

const {Cmdline} = require("../web/js/electron/Cmdline");

const log = Logger.create();

let diskDatastore = new DiskDatastore();

let args = Args.parse(process.argv);

let browser = BrowserRegistry[args.browser];

if(! browser) {
    throw new Error("No browser defined for: " + args.browser);
}

if(args.profile) {
    log.info("Using browser profile: " + args.profile);
    browser = Browsers.toProfile(browser, args.profile);
}

app.on('ready', function() {

    (async () => {

        await diskDatastore.init();

        // TODO don't use directory logging now as it is broken.
        //await Logger.init(diskDatastore.logsDir);

        let url = Cmdline.getURLArg(process.argv);

        if(! url) {

            if(! url) {
                console.warn("URL is required.");
                app.quit();
                return;
            }

            url = "https://www.example.com"

        }

        console.log("Going to capture URL: " + url);

        // TODO: sync up args + CaptureOpts
        let captureOpts = {
            amp: args.amp
        };

        let capture = new Capture(url, browser, diskDatastore.stashDir, captureOpts);

        await capture.start();

        if(args.quit) {
            log.info("Capture finished.  Quitting now");
            app.quit();
        } else {
            log.info("Not quitting (yielding to --no-quit=true).")
        }

    })().catch(err => console.error(err));

});
