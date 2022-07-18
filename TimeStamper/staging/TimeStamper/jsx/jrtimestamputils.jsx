// TimeStamper
// Adbe Premiere CEP Extendscript extension
// Helps you navigate your project deep into sequences, and creates YouTube timestamp listings for your videos
// 8/28/21 by mouser@donationcoder.com
//---------------------------------------------------------------------------


$.jrtsu = {

    //---------------------------------------------------------------------------
    jrInitializeExtensionTimeStamper: function () {
        //$.jrcep.ceplog("In jrInitializeExtensionTimeStamper jsx with global extension context = " + $.jrutils.jrGetGlobalExtensionContextKey());

        // common extension globals
        $.jrutils.jrSetGlobal("appname", "TimeStamper");
        $.jrutils.jrSetGlobal("appversion", "3.9 (7/17/22)");
        $.jrutils.jrSetGlobal("appauthor", "Jesse Reichler <mouser@donationcoder.com>");
        //
        // options that can be set from front end gui index.html
        // not sure this is even needed
        $.jrutils.jrSetGlobalOptions({});
        //
        // APP SPECIFIC
        // use global variable so we can cache results
        // this actually should not be needed -- we will initialize on first use
        $.jrts.jrResetGlobalSequenceTimeStampData();
        //
        // DEBUGGING global conflicts
        $.jrutils.jrIncrementGlobalCounter("TimeStamper.Loads");

        return true;
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    jrDebugTimeStamper: function () {
        // get COPY of globals
        var globals = $.jrutils.jrMakeJsonDeepCopyOfObject($.jrutils.jrGetAppGlobal());
        // cleanup this too big stuff
        var doSimplify = true;
        if (doSimplify) {
            globals.timeStampSequenceData = "[SKIPPED FOR DEBUG]";
        }

        var infoSummary = "App globals: " + $.jrutils.jstringify(globals);
        var retObj = {
            "infoSummary": infoSummary,
        };
        return $.jrutils.jstringify(retObj);
    },
    //---------------------------------------------------------------------------














    //---------------------------------------------------------------------------
    jrClearAllAndExtractTimeStampsFromActiveSequence: function (flagForceRebuildAll) {
        if (flagForceRebuildAll) {
            // clear all and rebuild all
            $.jrts.jrReBuildAllSequenceTimeStamps();
        } else {
            // clear all
            $.jrts.jrResetGlobalSequenceTimeStampData();
        }

        // now ask to build active seq
        return this.jrExtractTimeStampsFromActiveSequence();
    },


    jrExtractTimeStampsFromActiveSequence: function () {
        resultObj = $.jrtshelpers.jrDoExtractTimeStampsFromActiveSequence();
        return $.jrutils.jstringify(resultObj);
    },

    
    jrExtractTimeStampsFromActiveSequenceAndSave: function () {
        resultObj = $.jrtshelpers.jrDoExtractTimeStampsFromActiveSequence();

        // save file
        var seqid = $.jrcep.jrCalcActiveSequenceId();
        // don't rebuild if not needed
        var sequenceData = $.jrtshelpers.jrGetGlobalTimeStampDataBuildIfNeeded();
        //
        resultObjFileSave = this.jrSaveTimeStampsFromSequence(seqid, sequenceData);
        // add results
        if (!resultObj.datalinksSummary) {
            resultObj.datalinksSummary = "";            
        }
        resultObj.datalinksSummary += resultObjFileSave.infoSummary;

        return $.jrutils.jstringify(resultObj);
    },
    //---------------------------------------------------------------------------







































































    //---------------------------------------------------------------------------
    jrSaveTimeStampsFromSequence: function (seqid, sequenceData) {

        var sequence = $.jrcep.jrLookupSequnceById(seqid);

        // project directory
        var projDir = $.jrcep.jrCalcProjectDirectory();


        // open output file
        var seqName = sequence.name;
        var outFileName = seqName + '_timestamps.txt';
        var outFileFullPath = projDir + $.jrutils.adobeGetSep() + outFileName;
        var outFile = new File(outFileFullPath);
        outFile.encoding = "UTF8";
        outFile.open("w", "TEXT", "????");

        // we can write in different formats

        // display settings
        var displayOptions = $.jrutils.jrGetGlobalOptions();
        this.jrSaveResultsAsText(outFile, sequenceData, seqid, "DISPLAY", displayOptions);

        // simple
        var overideOptions = this.jrGetOptionsPresetSimple();
        if (!$.jrutils.jrAreObjectsEqual(overideOptions, displayOptions)) {
            this.jrSaveResultsAsText(outFile, sequenceData, seqid, "SIMPLE", overideOptions);
        }

        // elaborate
        overideOptions = this.jrGetOptionsPresetElaborate();
        if (!$.jrutils.jrAreObjectsEqual(overideOptions, displayOptions)) {
            this.jrSaveResultsAsText(outFile, sequenceData, seqid, "ELABORATE", overideOptions);
        }

        if ($.jrts.getIsDebugDataEnabled()) {
            // also write out raw data for debugging
            this.jrSaveRawSequenceTimeStampData(outFile, sequenceData, seqid);
        }

        // close output file
        outFile.close();

        // report results
        //var itemsFoundText = " " + numItemsFound ? "(" + numItemsFound + " items found)." : "(no items found).";
        var itemsFoundText = "";
        var infoSummaryPlain = "TimeStamps saved to " + outFileFullPath + itemsFoundText;
        var infoSummary = 'TimeStamps saved to <a href = "#/" onclick="jrOpenLocal(\'' + encodeURI(outFileFullPath) + '\')" target="_blank">' + outFileFullPath + '</a> ' + itemsFoundText;

        // show message in adobe event window and to debug log
        $.jrcep.ceplog(infoSummaryPlain);


        // open result file in default text editor?
        var flagOpenResultFileAfterwards = false;
        if (flagOpenResultFileAfterwards) {
            $.jrutils.doOpenFilePathInexplorer(outFileFullPath);
        }

        var resultObj = {
            "infoSummary": infoSummary,
        };

        return resultObj;
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    jrGetOptionsPresetSimple: function () {
        return {
            "showCompact": true,
            "showRecurse": true,
            "showPath": false,
            "showVideoClips": false,
            "showAudioClips": false,
            "showMarkers": true,
            "showTextGraphics": true,
            "showSpecialFx": true,
            "showDuration": false,
            "forceZeroItem": true,
        };
    },

    jrGetOptionsPresetElaborate: function () {
        return {
            "showCompact": false,
            "showRecurse": true,
            "showPath": true,
            "showVideoClips": true,
            "showAudioClips": true,
            "showMarkers": true,
            "showTextGraphics": true,
            "showSpecialFx": true,
            "showDuration": true,
            "forceZeroItem": true,
        };
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    jrSaveRawSequenceTimeStampData: function (outFile, sequenceTimeStamps, seqid) {
        // announce
        var seqname = $.jrcep.jrGetSequnceNameById(seqid);
        $.jrutils.jrAnnounceSectionToOutputFile(outFile, seqname + " TIME SHEET - RAW DATA");
        // output
        outFile.writeln($.jrutils.jstringify(sequenceTimeStamps, null, 4));
    },


    jrSaveResultsAsText: function (outFile, sequenceData, seqid, styleLabel, options) {
        // announce
        var seqname = $.jrcep.jrGetSequnceNameById(seqid);
        $.jrutils.jrAnnounceSectionToOutputFile(outFile, seqname + " TIME SHEET (" + styleLabel + ")");

        // combine listings for consecutive items with differen track types and same start time
        var datalinks = $.jrtshelpers.jrMakeResultsList(seqid, sequenceData, options);

        // now write to file
        for (var i = 0; i < datalinks.length; ++i) {
            var str = datalinks[i].label + " - " + datalinks[i].text;
            outFile.writeln(str);
        }
    },
    //---------------------------------------------------------------------------








    //---------------------------------------------------------------------------
    jrProcessResolveWorkOptions: function (sequence) {
        var errors = [];
        // inclusions and exclusions
        var mogrtInclusions = $.jrutils.parseOptionsFilter(options.mogrtInclusions, options.useFilterInclude);
        var mogrtExclusions = $.jrutils.parseOptionsFilter(options.mogrtExclusions, options.useFilterExclude);
        // results
        return {
            "references": {
                "mogrtInclusions": mogrtInclusions,
                "mogrtExclusions": mogrtExclusions,
            },
            "errors": errors,
        }
    },
    //---------------------------------------------------------------------------




};
