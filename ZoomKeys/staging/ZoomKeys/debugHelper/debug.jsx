//debug.jsx
// helper for debugging with extendscript extension in Visual Code

//@include "../ZoomKeys.jsx"

// normally indexHelpers.js would invoke this to load the extension functions into our callables from theadobe cep panel browser panel context; for debug we set it here
var myUniqueAppId = "ZoomKeys";
setupCallablesZoomKeys(myUniqueAppId);

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
    PushInDelayMs: 1000,
    PushInDurationMs: 500,
    PullOutDelayMs: 1000,
    PullOutDurationMs: 500,
    PushInPullOutDelayMs: 1000,
    PushInPullOutDurationMs: 500,
    PushInPullOutEndHoldMs: 1000,
    DramaticPushInDelayMs: 1000,
    DramaticPushInDurationMs: 1000,
    DramaticPushInSteps: 3,
});

// generate about call
$.jrutils.consolelog("ABOUT: " + jrCallable().about());

// and now a test call
var retv = jrCallable().doCleanKeyframes();
var retv = jrCallable().doProcessKeyframeEffect("PushInPullOut");
//var retv = jrCallable().doProcessKeyframeEffect("DramaticPushIn");
//var retv = jrCallable().doPlayCurrentClip();
$.jrutils.consolelog($.jrutils.jrGetGlobal("appname") + " finished: " + $.jrutils.jstringify(retv));

$.jrutils.consolelog("DONE."); 
