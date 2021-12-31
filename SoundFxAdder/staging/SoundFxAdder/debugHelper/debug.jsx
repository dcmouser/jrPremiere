//debug.jsx
// helper for debugging with extendscript extension in Visual Code

//@include "../SoundFxAdder.jsx"

// normally indexHelpers.js would invoke this to load the extension functions into our callables from theadobe cep panel browser panel context; for debug we set it here
var myUniqueAppId = "SoundFxAdder";
setupCallablesSoundFxAdder(myUniqueAppId);

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
    "audioClipName": "JrPopUpBubble1.wav",
    "audioTrackName": "A2",
    "mogrtInclusions": "*",
    "misalignCheck": true,
    //
    // timestamper options
    "showCompact": false,
    //
    "showVideoClips": true,
    "showAudioClips": false,
    //
    "showMogrt": true,
    "showTextGraphics": true,
    "showMarkers": true,
    "showSpecialFx": true,
    //
    "saveDebugInfo": false,
});

// generate about call
$.jrutils.consolelog("ABOUT: " + jrCallable().about());

// and now a test call
var retv = jrCallable().doProcessActiveSequenceFind();
$.jrutils.consolelog($.jrutils.jrGetGlobal("appname") + " finished: " + $.jrutils.jstringify(retv));


