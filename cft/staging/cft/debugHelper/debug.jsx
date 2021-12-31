//debug.jsx
// helper for debugging with extendscript extension in Visual Code

//@include "../cft.jsx"

// normally indexHelpers.js would invoke this to load the extension functions into our callables from theadobe cep panel browser panel context; for debug we set it here
var myUniqueAppId = "Cft";
setupCallablesCft(myUniqueAppId);

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
    "exportPresetDir": "C:\\Users\\jesse\\Documents\\Adobe\\Adobe Media Encoder\\15.0\\Presets",
    "exportPresetName": "Jr Youtube 4k 3060 H264.epr",
    "autoStartEncoding": false,
    "overwriteExisting": true,
    "movePreviousProject": true,
    "introVideoName": "Intro_N10.mov",
    "soundProcessSet": "acquiet",
    //
    "censorBleepSelect": "H:/Premiere/Mogrts/JrCustom/JrCensorBleep/JrCensorBleepLong.mogrt",
    "censorBleepPreMs": "250",
    "censorBleepPostMs": "250",
    "censorBleepDecreaseDb": "15",
});


// generate about call
$.jrutils.consolelog("ABOUT: " + jrCallable().about());

// and now a test call
var flagRunEncoding = false;
if (flagRunEncoding) {
    var retv = jrCallable().doProcessMediaExport();
    $.jrutils.consolelog($.jrutils.jrGetGlobal("appname") + " finished: " + $.jrutils.jstringify(retv));
}

// and now a test call
var flagRunSaveAs = false;
if (flagRunSaveAs) {
    var retv = jrCallable().doProcessSavePlusVersion();
    $.jrutils.consolelog($.jrutils.jrGetGlobal("appname") + " finished: " + $.jrutils.jstringify(retv));
}

// and now a test call
var flagRunThumbnail = false;
if (flagRunThumbnail) {
    var retv = jrCallable().doProcessThumbnailExport();
    $.jrutils.consolelog($.jrutils.jrGetGlobal("appname") + " finished: " + $.jrutils.jstringify(retv));
}

// and now a test call
var flagRunSplitInsert = false;
if (flagRunSplitInsert) {
    var retv = jrCallable().doInsertIntro();
    $.jrutils.consolelog($.jrutils.jrGetGlobal("appname") + " finished: " + $.jrutils.jstringify(retv));
}


var flagRunAudioProcess = false;
if (flagRunAudioProcess) {
    var retv = jrCallable().doAddSoundProcessing();
    $.jrutils.consolelog($.jrutils.jrGetGlobal("appname") + " finished: " + $.jrutils.jstringify(retv));
}

var flagRunCensorBleep = true;
if (flagRunCensorBleep) {
    var retv = jrCallable().doAddCensorBleep();
    $.jrutils.consolelog($.jrutils.jrGetGlobal("appname") + " finished: " + $.jrutils.jstringify(retv));
}

$.jrutils.consolelog("Debug test done.");
