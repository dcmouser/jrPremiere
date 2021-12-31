// helpers for running the index.html extension panel ui communication with jsx extendscript code

//---------------------------------------------------------------------------
// this MUST match the value set in appName.jsx
var myUniqueAppId = "ZoomKeys";
//---------------------------------------------------------------------------

//---------------------------------------------------------------------------
var globalAutoAdvanceTimer = undefined;
//---------------------------------------------------------------------------




//---------------------------------------------------------------------------
function onLoadJrExtension() {
    // normal ext.js setup code
    onLoaded();

    // now our stuff
    setupAccordionGui(true);
    loadUiOptions();

    // check requirements
    checkJrLibRequirement(2.0);

    // init
    doInitializeExtension();
    }
//---------------------------------------------------------------------------















//---------------------------------------------------------------------------
function clickProcessKeyframeEffect(effectName) {
    setResultSimpleTextPleaseWait();
    saveAndSendUiOptions();
    jrEvalScript('doProcessKeyframeEffect("' + effectName + '")', (result) => {processResult(result)});
}
//---------------------------------------------------------------------------



//---------------------------------------------------------------------------
function clickCleanKeyframes() {
    saveAndSendUiOptions();
    jrEvalScript('doCleanKeyframes()', (result) => {processResult(result)});
}
//---------------------------------------------------------------------------


//---------------------------------------------------------------------------
function clickPlayCurrentClip() {
    saveAndSendUiOptions();
    jrEvalScript('doPlayCurrentClip()', (result) => {processResult(result)});
}
//---------------------------------------------------------------------------



//---------------------------------------------------------------------------
function setResultSimpleTextPleaseWait() {
    setResultSimpleText("<p>Please wait while current clip is processed...</p>");
}
//---------------------------------------------------------------------------
