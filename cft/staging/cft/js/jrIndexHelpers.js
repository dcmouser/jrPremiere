// helpers for running the index.html extension panel ui communication with jsx extendscript code

//---------------------------------------------------------------------------
// this MUST match the value set in appName.jsx
var myUniqueAppId = "Cft";
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
function clickProcessMediaExport() {
    setResultSimpleText("<p>Exporting media encoder task...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doProcessMediaExport()', (result) => {processResult(result)});
}

function clickProcessThumbnailExport() {
    setInfoSimpleText("<p>Exporting thumbnail still...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doProcessThumbnailExport(false)', (result) => {processResult(result)});
}

function clickProcessSavePlusVersion() {
    setInfoSimpleText("<p>Saving project and increasing version number in filename...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doProcessSavePlusVersion()', (result) => {processResult(result)}); 
}
//---------------------------------------------------------------------------




//---------------------------------------------------------------------------
function clickInsertIntro() {
    setInfoSimpleText("<p>Initiating split-insertion of intro video...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doInsertIntro()', (result) => {processResult(result)}); 
}
//---------------------------------------------------------------------------


//---------------------------------------------------------------------------
function clickAddSoundProcessing() {
    setInfoSimpleText("<p>Adding sound reduction processing to lowest (non-muted) track on active sequence...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doAddSoundProcessing()', (result) => {processResult(result)}); 
}
//---------------------------------------------------------------------------



//---------------------------------------------------------------------------
function clickAddCensorBleep() {
    setInfoSimpleText("<p>Decreasing volume at playhead and adding censor bleep...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doAddCensorBleep()', (result) => {processResult(result)}); 
}
//---------------------------------------------------------------------------



//---------------------------------------------------------------------------
function clickOpenProjectFolder() {
    saveAndSendUiOptions();
    jrEvalScript('doOpenProjectFolder()'); 
}








