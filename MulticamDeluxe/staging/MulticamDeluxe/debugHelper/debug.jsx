//debug.jsx
// helper for debugging with extendscript extension in Visual Code

//@include "../MulticamDeluxe.jsx"

// normally indexHelpers.js would invoke this to load the extension functions into our callables from theadobe cep panel browser panel context; for debug we set it here
var myUniqueAppId = "MulticamDeluxe";
setupCallablesMulticamDeluxe(myUniqueAppId);

// debug helper shorthand function -- this only works because we can be sure when running this that var myUniqueAppId has been just set in APPNAME.jsx
function jrCallable() {
    // important to set global context first, since we are not being initialized from adobe panel, which would normally call this
    $.jrutils.jrSetGlobalExtensionContextString(myUniqueAppId);
    // now return function reference
    return $._jrcallables[myUniqueAppId];
}


// app specific initialize code
jrCallable().doInitializeExtension();

// set options; see index.html for options used in this app
$.jrutils.jrSetGlobalOptions({
    "cropLeftPercent": 18,
    "cropRightPercent": 18,
    "cropTopPercent": 3,
    "cropBottomPercent": 35,
    "scale": 45,
    "paddingPixels": 10,
    "borderSize": 20,
    "insetPosition": "slc",
    //
    "makeZoomCenter": false,
    "makeZoomSides": false,
    //
    "moveMulticamSrcToBin": false,
    "moveAllUnderProcessed": false,
});


// generate about call
$.jrutils.consolelog("ABOUT: " + jrCallable().about());

// and now a test call
var flagRunDeluxeMulticam = true;
if (flagRunDeluxeMulticam) {
    var retv = jrCallable().doProcessMulticamDeluxe();
    $.jrutils.consolelog($.jrutils.jrGetGlobal("appname") + " finished: " + $.jrutils.jstringify(retv));
}

$.jrutils.consolelog("Debug test done.");
