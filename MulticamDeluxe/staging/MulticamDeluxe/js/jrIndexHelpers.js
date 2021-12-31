// helpers for running the index.html extension panel ui communication with jsx extendscript code

//---------------------------------------------------------------------------
// this MUST match the value set in appName.jsx
var myUniqueAppId = "MulticamDeluxe";
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
function clickProcessMulticamDeluxe() {
    setInfoSimpleText("<p>Initiating deluxification...</p>");
    saveAndSendUiOptions();
    jrEvalScript('doProcessMulticamDeluxe()', (result) => {processResult(result)}); 
}
//---------------------------------------------------------------------------
















