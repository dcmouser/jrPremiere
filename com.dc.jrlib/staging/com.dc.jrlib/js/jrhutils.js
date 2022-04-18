// more index helpers, generic



//---------------------------------------------------------------------------
function jrLibGetVersion() {
    // return float value denoting version which we can check requirement againsts
    return 2.0;
}
//---------------------------------------------------------------------------







//---------------------------------------------------------------------------
// LOTS of kludgey hacks here to circumvent startup initialization (asynchronous) problems..
var initTries = 0;
function doInitializeExtension() {
    //alert("IN doInitializeExtension.");



    // first run setup to load functions into global (keyed) context
    setupExtensionCallables();

    // kludge to try to fix this
    var initMode = "callback";
    //
    if (initMode == "simple") {
        jrEvalScript('doInitializeExtension()');
        jrEvalScript("about()", (result) => {ProcessResultAboutSimple(result)});
    } else if (initMode == "callback") {
        jrEvalScript('doInitializeExtension()',  (result) => {callbackInitializationCompletes(result)});
    } else {
        throw "Exception bad initMode.";
    }
}


function setupExtensionCallables() {
    // we call extendscript code function
    // setup extnsion which exposes it's functions in global namespace under myUniqueAppId
    //alert("IN setupExtensionCallables.");
    //alert("IN setupExtensionCallables: " + myUniqueAppId );

    var evalString = "setupCallables" + myUniqueAppId + "('" + myUniqueAppId + "');";
    //var evalString = "setupCallables" + myUniqueAppId + "(\"" + myUniqueAppId + "\")";
    jrInvokeEvalScript(evalString, (result) => {setupExtensionCallablesCallback(result)});
}


function setupExtensionCallablesCallback(result) {
    //alert("In setupExtensionCallablesCallback.");
    //alert("In setupExtensionCallablesCallback result = " + result);
}



function callbackInitializationCompletes(result) {
    //alert("In callbackInitializationCompletes.");
    var cbMode = "timeoutSimple";
    var delayTime = 100; // 1000 seemed to be good for testing bug
    //
    if (cbMode == "simple") {
        jrEvalScript("about()", (result) => {ProcessResultAboutSimple(result)});
    } else if (cbMode == "simpleThenComplex") {
        jrEvalScript("about()", (result) => {ProcessResultAboutComplex(result)});
    } else if (cbMode == "timeoutSimple") {
        window.setTimeout(function () {jrEvalScript("about()", (result) => {ProcessResultAboutSimple(result)});}, delayTime);
    } else if (cbMode == "timeoutComplex") {
        window.setTimeout(function () {jrEvalScript("about()", (result) => {ProcessResultAboutComplex(result)});}, delayTime);
    } else {
        throw "Exception bad cbMode.";
    }
}

function ProcessResultAboutSimple(result) {
    //alert("ProcessResultAboutSimple: " + result);
    setMainTextSimpleText(result);
}

function ProcessResultAboutComplex(result) {
    if (result == "") {
        // klude to handle weird init problem where on startup its not getting good values
        setMainTextSimpleText("Please click Reload Script link below (" + initTries.toString() + ")..");
        ++initTries;
        if (initTries<100) {
            // try again to initialize
            doInitializeExtension();
        }
        return;
    }  
    setMainTextSimpleText(result);
}
//---------------------------------------------------------------------------































//---------------------------------------------------------------------------
function setDivHtmlById(id, str) {
    $("#" + id).html(str);
}
//---------------------------------------------------------------------------


//---------------------------------------------------------------------------
function jrOpenLocal(filepath) {
    var uri = "file://" + decodeURI(filepath);
    var csInterface = new CSInterface();
    csInterface.openURLInDefaultBrowser(uri);
}
//---------------------------------------------------------------------------








//---------------------------------------------------------------------------
function loadUiOptions() {
    // get current saved options from the extension
    if (false) {
        // ask extendscript code to give us persistent options
        jrEvalScript("doGetGlobalOptions()", (result) => {processCallbackGetUiOptions(result)});
    } else {
        // get them from localstorage/cookie
        loadUiOptionsFromLocalStorage();
    }
    //
    // force stuff
    var resultFontSizeSelect = document.getElementById('resultFontsize');
    if (resultFontSizeSelect) {
        jrChangeResultFontSize(resultFontSizeSelect);
    }
}


function saveAndSendUiOptions() {
    //
    var options = {}
    collectAllInputValuesFromDoc(options);
    collectOtherUiState(options);
    //
    if (false) {
        // ask extendscript code to save persistent options
        // ATTN: nothing to do, they may save when we send if they know how
    } else {
        // save to localstorage/cookie
        saveOptionsToLocalStorage(options);
    } 

    // always send
    sendUiOptions(options);
}


function processCallbackGetUiOptions(optionsjsoned) {
    var options = JSON.parse(optionsjsoned);
    setAllInputValuesInDoc(options);
    setOtherUiState(options);
}
//---------------------------------------------------------------------------



//---------------------------------------------------------------------------
function loadUiOptionsFromLocalStorage() {
    var options = jrLoadVarFromLocalStorage("options");
    setAllInputValuesInDoc(options);
    setOtherUiState(options);
}


function saveOptionsToLocalStorage(options) {
    jrSaveVarToLocalStorage("options", options);
}
//---------------------------------------------------------------------------







//---------------------------------------------------------------------------
function clickReload() {
    saveAndSendUiOptions();
    history.go(0);
}

function clickDebug() {
    var csInterface = new CSInterface();
    csInterface.evalScript("app.documents.add();");
    //alert("ok.");
    //return;

    //evalScript("jrJsxTest()");
    saveAndSendUiOptions();
    jrEvalScript('debug()', (result) => {processResult(result)});
}


function clickGoTick(ticks) {
    jrEvalScript("playHeadGotoTick(" + ticks + ")");
}


function clickGoItemRoot(jlink) {
    jrEvalScript("playHeadGotoItemRoot('" + jlink + "')");
}
function clickGoItem(jlink) {
    jrEvalScript("playHeadGotoItem('" + jlink + "')");
}
//---------------------------------------------------------------------------












//---------------------------------------------------------------------------
function sendUiOptions(options) {
    // send current options to the extension
    var optionsJsoned = encodeURI(JSON.stringify(options));
    jrEvalScript("doSetGlobalOptions('" + optionsJsoned + "')");
}


function collectAllInputValuesFromDoc(options) {
    var inputs;
    //inputs = document.getElementsByTagName('input');
    inputs = document.querySelectorAll('input,textarea,select') 
    for (var index = 0; index < inputs.length; ++index) {
        // deal with inputs[index] element.
        var input = inputs[index];
        var id = input.id;
        var itype = input.type;
        //
        var ival;
        if (input.type == "checkbox") { 
             ival = input.checked;
        } else {
            ival = input.value;
        }
        options[id] = ival;
    }
}

function collectOtherUiState(options) {
    // save accordion state
    options["optionDivOpen"] = getAccordionState();
}



function setAllInputValuesInDoc(options) {
    if (options === undefined) {
        // error
        alert("error in setAllInputValuesInDoc, options passeed are undefined.");
        return;
    }

    try {
        var inputs;
        //
        //inputs = document.getElementsByTagName('input');
        inputs = document.querySelectorAll('input,textarea,select') 
        for (var index = 0; index < inputs.length; ++index) {
            // deal with inputs[index] element.
            var input = inputs[index];
            var id = input.id;
            var itype = input.type;
            if (options[id] !== undefined) {
                if (itype=="checkbox") {
                    input.checked = options[id];
                } else {
                    input.value = options[id];
                }
            }
        }
    } catch (e) {
        // error
        alert("error in setAllInputValuesInDoc: " + jrNiceExceptionDescription(e));
        return;
    }
}

function setOtherUiState(options) {
    var isOpen = options["optionDivOpen"];
    setAccordionState(isOpen);
    //alert("Setting accordion "+ isOpen);
}
//---------------------------------------------------------------------------














//---------------------------------------------------------------------------
function jrLoadVarFromLocalStorage(varname) {
    var options;
    try {
        var optionsjsoned = localStorage.getItem(jrGetAppRegistryPath(varname));
        options = JSON.parse(optionsjsoned);
    } catch (e) {
        alert("Exception in jrLoadVarFromLocalStorage: " + jrNiceExceptionDescription(e));
    }

    if (options === undefined || options == null) {
        options = {};
    }

    return options;
}

function jrSaveVarToLocalStorage(varname, options) {
    try {
        localStorage.setItem(jrGetAppRegistryPath(varname), JSON.stringify(options));
    } catch (e) {
        alert("Exception in jrSaveVarToLocalStorage: " + jrNiceExceptionDescription(e));
    }
}

function jrGetAppRegistryPath(varname) {
    return getLongExtensionIdString() + "." + varname;
}


function getLongExtensionIdString() {
    var csInterface = new CSInterface();
    var extensionIdString = csInterface.getExtensionID();
    return extensionIdString;
}
//---------------------------------------------------------------------------






//---------------------------------------------------------------------------
function setupAccordionGui(flagStartAccordionOpen) {

    // ACCORDION BUTTON ACTION (ON CLICK DO THE FOLLOWING)
    $('.accordionButtonLink').click(function () {
        //REMOVE THE ON CLASS FROM ALL BUTTONS
        $('.accordionButtonLink').removeClass('on');
        //IF THE NEXT SLIDE WASN'T OPEN THEN OPEN IT
        if ($('#accordionDiv').is(':hidden') == true) {
            //ADD THE ON CLASS TO THE BUTTON
            $(this).addClass('on');
            //OPEN THE SLIDE
            $('#accordionDiv').slideDown('normal');
        } else {
            $(this).removeClass('on');
            //OPEN THE SLIDE
            $('#accordionDiv').slideUp('normal');
        }
    });

    // ADDS THE .OVER CLASS FROM THE STYLESHEET ON MOUSEOVER 
    $('.accordionButton').mouseover(function () {
        $(this).addClass('over');

    // ON MOUSEOUT REMOVE THE OVER CLASS
    }).mouseout(function () {
        $(this).removeClass('over');
    });

    // start by closing the options panel?
    setAccordionState(flagStartAccordionOpen);
}


function setAccordionState(flagOpenState) {
    if (flagOpenState) {
        $('.accordionButtonLink').addClass('on');
        $('#accordionDiv').slideDown('fast');
        //$('.accordionDiv').show();
    } else {
        $('.accordionButtonLink').removeClass('on');
        $('#accordionDiv').slideUp('fast');
        //$('.accordionDiv').hide();
    }
}

function getAccordionState() {
    if ($('#accordionDiv').is(':hidden') == true) {
        return false;
    }
    return true;
}
//---------------------------------------------------------------------------















//---------------------------------------------------------------------------
function jrChangeResultFontSize(input) {
  var el = document.getElementById("resultlist");
  if (el) {
    el.style.fontSize = input.value;
  }
  el = document.getElementById("resultinfo");
  if (el) {
    el.style.fontSize = input.value;
  }
}
//---------------------------------------------------------------------------





//---------------------------------------------------------------------------
function setResultSimpleText(str) {
    setResultHtml(undefined, [], "", str);
}
function setInfoSimpleText(str) {
    setResultHtml(undefined, undefined, undefined, str);
}
function setMainTextSimpleText(str) {
    setResultHtml(str, undefined, undefined, undefined);
}
//---------------------------------------------------------------------------



//---------------------------------------------------------------------------    
function jrCleanDatalinkForClickEmbed(datalink) {
    var dlink = {
        "nodeId": datalink.nodeId,
        "guid": datalink.guid,
        "ticks": datalink.ticks,
        "eticks": datalink.eticks,
        "sid": datalink.sid,
        "oticks": datalink.oticks,
        "asid": datalink.asid,
        "guid": datalink.guid,
        "goSource": datalink.goSource,
        "noadd": datalink.noadd,
        "subtext": datalink.subtext,
    };
    return dlink;
}
//---------------------------------------------------------------------------













//---------------------------------------------------------------------------
function processResult(resultjson) {
    // extract datalinks object
    var datalinks;
    var datalinksSummary;
    var infoSummary;
    var mainText;
    try {
        resultObj = JSON.parse(resultjson);
        // summary info
        datalinks = resultObj.datalinks;
        datalinksSummary = resultObj.datalinksSummary;
        infoSummary = resultObj.infoSummary;
        mainText = resultObj.mainText;
    } catch (e) {
        if (infoSummary === undefined) {
            infoSummary = "";
        }
        infoSummary = infoSummary += "Error processing results [" + e.message + "] - (" + resultjson +")";
    }

    // for debugging
    var flagDebugResults = false;
    if (flagDebugResults) {
        if (infoSummary === undefined) {
            infoSummary = "";
        }
        infoSummary += "<br/>\n<br/>\nDEBUGGING RAW RESULT OBJECT: <br/>\n" + JSON.stringify(resultjson);
    }

    // now display
    setResultHtml(mainText, datalinks, datalinksSummary, infoSummary);
}




function setResultHtml(mainText, datalinks, datalinksSummary, infoSummary) {
    var resultHtml = "";
    var infoHtml = "";

    // datalinks, main results
    if (datalinks) {
        // display something in main results
        var datalinksHtml;
        if (datalinks.length==0) {
            datalinksHtml = "";
        } else {
            try {
                datalinksHtml = convertDatalinksToHtml(datalinks);
            } catch(e) {
                datalinksHtml = "Error converting datalinks [" + e.message + "] - (" + JSON.stringify(datalinks) +")";
            }
        }

        // display
        if (datalinksSummary !== undefined) {
            resultHtml += "<p>" + datalinksSummary + "</p>\n\n";
         }
         if (datalinksHtml !== undefined) {
            resultHtml += datalinksHtml;
         }
         //
        setDivHtmlById("resultlist", resultHtml);
    } else {
        if (datalinksSummary) {
            // this shouldnt happen, blank datalinks and nonblank datalinks summary.. but we could still display it
            resultHtml += "<p>" + datalinksSummary + "</p>\n\n";
            setDivHtmlById("resultlist", resultHtml);
        }
    }

    if (infoSummary) {
        infoHtml += "<p>" + infoSummary + "</p>";
    }

    // always info (typically to blank it), unlesss we are only setting mainText (about info) in which case we would like to leave it
    if (!mainText || infoHtml!="") {
        setDivHtmlById("resultinfo", infoHtml);
    }


    if (mainText) {
        setDivHtmlById("mainText", mainText);
    }
}
//---------------------------------------------------------------------------
















//---------------------------------------------------------------------------
function jrEvalScript(evalString, callback) {
    var evalToRun;

    // this version tries to combine into one evalscript call
    //alert("About to eval for "+myUniqueAppId+": " + evalString);

    // ATTN: note that we never trigger these exception when there is a callback
    //var evalToRunPre = "alert('evalfor " + myUniqueAppId + "');";
    var evalToRunPre = "$._jrcallables['" + myUniqueAppId + "']." + "jrSetGlobalContext('" + myUniqueAppId + "')";
    evalToRun = evalToRunPre + ";" + "$._jrcallables['" + myUniqueAppId + "']." + evalString;

    jrInvokeEvalScript(evalToRun, callback);
}

function jrInvokeEvalScript(evalToRun, callback) {
    //alert("About to INVOKE: " + evalToRun);
    
    try {
        evalScript(evalToRun, callback);
    } catch (e) {
        var msg = "Error invoking function (" + evalToRun + ") in extension jsx code, using appid '" + myUniqueAppId + "': " + e.message + ".";
        //alert(msg);
        setResultSimpleText(msg);
        return;
    }
}
//---------------------------------------------------------------------------

