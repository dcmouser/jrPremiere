//debug.jsx
// helper for debugging with extendscript extension in Visual Code

//@include "../Preflight.jsx"

// normally indexHelpers.js would invoke this to load the extension functions into our callables from theadobe cep panel browser panel context; for debug we set it here
var myUniqueAppId = "Preflight";
setupCallablesPreflight(myUniqueAppId);

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
    "mogrtInclusions": "",
    //
    // timestamper options
    "showCompact": false,
    //
    "showVideoClips": true,
    "showAudioClips": false,
    //
    "showMogrt": true,
    "showTextGraphics": false,
    "showMarkers": false,
    "showSpecialFx": true,
    //
    "saveDebugInfo": false,
    //
    "poiPadLeft": 0.5,
    "poiPadRight": 2,
    "playbackSpeedMultiplier": 3,
});

// generate about call
$.jrutils.consolelog("ABOUT: " + jrCallable().about());

// and now a test call
var retv = jrCallable().doProcessActiveSequenceFind();
$.jrutils.consolelog($.jrutils.jrGetGlobal("appname") + " finished: " + $.jrutils.jstringify(retv));

var retv = jrCallable().doProcessPlayPoi();

// test
var iterations = 5000;
for (var i = 0;i<iterations;++i) {
    $.jrutils.consolelog("LOOPING: " + i.toString());
    var retv = jrCallable().autoAdvancePoiPreviewIfAppropriate();
    if (!retv) {
        $.jrutils.consolelog("Leaving early returned false.");
        break;
    }
    $.sleep(100);
}
$.jrutils.consolelog("DONE."); 

// test
//
