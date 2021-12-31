// for adding sound effect clips to tracks based on presence of mogrts, etc.
// something like app.project.sequences[index].audioTracks[index].overwriteClip(projectItem, time)
// time is in ticks

// take as options
// 1. name of audio clip project item name
// 2. audio track # (default to 2nd audio track, index 1)
// 3. mogrt name patterns to TRIGGER ON (can be wildcard *)
// 4. mogrt name patterns to IGNORE (can be blank)

// operation
// a) finds audio clip projec item
// b) scans all video tracks, when it finds a MOGRT, it checks if its an excluded name, if not:
// b) inserts the audio project item at the start time of the mogrt, with app.project.sequences[index].audioTracks[index].overwriteClip(projectItem, time)
// c) logs a report

////@include "../jsx/jrceputils.jsx"


$.jrsfx = {



    //---------------------------------------------------------------------------
    jrInitializeExtensionSoundFxAdder: function () {
        // ceplog("In jrInitializeExtensionSoundFxAdder jsx with global extension context = " + $.jrutils.jrGetGlobalExtensionContextKey());

        // common extension globals
        $.jrutils.jrSetGlobal("appname", "SoundFxAdder");
        $.jrutils.jrSetGlobal("appversion", "2.4 (11/1/21)");
        $.jrutils.jrSetGlobal("appauthor", "Jesse Reichler <mouser@donationcoder.com>");
        //
        // options that can be set from front end gui index.html
        // not sure this is even needed
        $.jrutils.jrSetGlobalOptions({});
        //
        // APP SPECIFIC
        $.jrts.jrSetGlobalLastScannedSequenceId(undefined);
        //
        $.jrutils.jrIncrementGlobalCounter("SoundFxAdder.Loads");

        return true;
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    jrDebugSoundFxAdder: function () {
        var globals = $.jrutils.jrGetAppGlobal();
        var infoSummary = "App globals: " + $.jrutils.jstringify(globals);
        var retObj = {
            "infoSummary": infoSummary,
        };
        return $.jrutils.jstringify(retObj);
    },
    //---------------------------------------------------------------------------

























    //---------------------------------------------------------------------------
    jrProcessActiveSequenceFind: function () {
        return this.jrProcessActiveSequence(false);
    },


    jrProcessActiveSequenceAddAll: function () {

        // first a sanity check
        if ($.jrts.jrGetGlobalLastScannedSequenceId() != $.jrcep.jrCalcActiveSequenceId()) {
            // error -- they did not explicitly find all first on this new sequence
            var retObj = {
                "infoSummary": "ERROR: You need to rescan and list items for the active sequence first.",
            };
            return $.jrutils.jstringify(retObj);
        }

        return this.jrProcessActiveSequence(true);
    },


    jrProcessAddToItemJsoned: function (jlinkjsoned) {
        // manually add item at location

        // resolve references etc
        var sequence = $.jrcep.jrCalcActiveSequence();
        var resultObj = this.jrProcessResolveWorkOptions(sequence);
        if (resultObj.errors.length > 0) {
            // stop if we have errors
            var infoSummary = "ERRORS: " + resultObj.errors.join("; ");
            //alert(infoSummary);
            //
            return $.jrutils.jstringify({
                "infoSummary": infoSummary,
            });
        }
        var optionReferences = resultObj.references;

        var item = JSON.parse(decodeURI(jlinkjsoned));


        //alert("ATTN: ADD TEST" + $.jrutils.jstringify(item));

        var restr = this.jrAddAtItem(item, optionReferences);
        var retObj = {
            "infoSummary": restr,
        };
        return $.jrutils.jstringify(retObj);
    },
    //---------------------------------------------------------------------------






































    //---------------------------------------------------------------------------
    jrProcessActiveSequence: function (flagAutoAdd) {
        // built array of results

        // parsed options
        var options = $.jrutils.jrGetGlobalOptions();

        var sequence = $.jrcep.jrCalcActiveSequence();
        var resultObj = this.jrProcessResolveWorkOptions(sequence);
        var optionReferences = resultObj.references;

        // now using shared timestamper code
        $.jrts.jrResetGlobalSequenceTimeStampData();

        // get items
        var resultObj = $.jrtshelpers.jrDoExtractTimeStampsFromActiveSequence();
        var datalinks = resultObj.datalinks;

        // now do extra work on them
        this.scanDataItemsForSoundFxAdds(options, optionReferences, datalinks, resultObj);

        // auto add?
        if (flagAutoAdd) {
            // add all items
            resultObj = this.jrProcessAddToAllItems(datalinks);
        }

        // return results
        return $.jrutils.jstringify(resultObj);
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    scanDataItemsForSoundFxAdds: function(options, optionReferences, datalinks, resultObj) {
        var audioClipProjectItem = optionReferences.audioClipProjectItem;
        var targetAudioTrack = optionReferences.targetAudioTrack;
        var foundIncluded = 0;
        var foundMissing = 0;
        var foundIntereference = 0;

        for (var i = 0; i < datalinks.length; i++) {
            var item = datalinks[i];
            if (item.hide) {
                continue;
            }
            // ignore audio clips themselves; we will have separate report for abandoned audio clips
            if (item.itype=="audio") {
                // by default we hide all clips in this soundfx videw (we will re-enable any misaligned later)
                item.hide = true;
                continue;
            }
            // keep track of how many non-audio items found that we can add to
            ++foundIncluded;
            // check if audio clip is already there?
            var startTicks = item.ticks;
            var existingClip = $.jrcep.JrCheckForClipInterference(targetAudioTrack, audioClipProjectItem, startTicks);
            if (existingClip === false) {
                // already there
                item["subtext"] = "[AUDIOCLIP&nbsp;PRESENT]";
            } else if (existingClip) {
                // intereference there
                item["subtext"] = "[AUDIO&nbsp;INTERFERENCE]";
                ++foundIntereference;
            } else {
                ++foundMissing;
            }
        }

        // do a misalignment check?
        var misalignCheck = options["misalignCheck"];
        if (misalignCheck) {
            var sequence = $.jrcep.jrCalcActiveSequence();
            var foundMisaligned = this.jrDoMisalignClipReport(sequence, audioClipProjectItem, datalinks);
            // summary
            var extraSummaries = [];
            if (foundMissing) {
                extraSummaries.push(foundMissing.toString() + " need adding");
            }
            if (foundMisaligned) {
                extraSummaries.push(foundMisaligned.toString() + " misaligned");
            }
            if (foundIntereference) {
                extraSummaries.push(foundIntereference.toString() + " interefered with");
            }
            var extraSummary = "";
            if (extraSummaries.length>0) {
                extraSummary = " (" + extraSummaries.join(";") + ")";
            }
            var datalinksSummary = foundIncluded.toString() + " qualifying clips found" + extraSummary + ".";
            if (!resultObj.datalinksSummary) {
                resultObj.datalinksSummary = "";
            }
            resultObj.datalinksSummary += datalinksSummary;
        }
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    jrProcessResolveWorkOptions: function (sequence) {
        var errors = [];
        //
        var audioClipProjectItem;
        var targetAudioTrack;

        if (!sequence) {
            errors.push("No active sequence loaded in the timeline.");
        }

        // ok first locate the audio clip
        var options = $.jrutils.jrGetGlobalOptions();

        var audioClipName = options.audioClipName;
        if (!audioClipName) {
            errors.push("Option audioClipName is missing.");
        }
        if (audioClipName) {
            audioClipProjectItem = $.jrcep.jrLookupProjectItemByName(audioClipName);
            if (!audioClipProjectItem) {
                errors.push("Could not find specified audio clip projectItem named '" + audioClipName + "'.");
            } else {
                // check its an audio clip
                var mediaType = $.jrcep.jrCalculateMediaTypeFromProjectItem(audioClipProjectItem);
                if (mediaType != "audio") {
                    errors.push("Item specified by option audioClipName '" + audioClipName + "' did not map to an 'audio' clip  (was of type '" + mediaType + "' instead).");
                }
            }
        }

        // ok find the targetAudioTrack
        if (sequence) {
            var audioTrackName = options.audioTrackName;
            if (!audioTrackName) {
                errors.push("Option audioTrackName is missing.");
            } else {
                targetAudioTrack = $.jrcep.jrLookupTrackInSequenceByName(sequence, audioTrackName, "audio");
                if (!targetAudioTrack) {
                    errors.push("Audio track specified by option audioTrackName '" + audioTrackName + "' could not be found on active sequence (" + sequence.name + ").");
                }
            }
        }

        // inclusions and exclusions

        var mogrtInclusions = $.jrutils.parseOptionsFilter(options.mogrtInclusions, options.useFilterInclude);
        var mogrtExclusions = $.jrutils.parseOptionsFilter(options.mogrtExclusions, options.useFilterExclude);

        // results
        return {
            "references": {
                "audioClipProjectItem": audioClipProjectItem,
                "targetAudioTrack": targetAudioTrack,
                "mogrtInclusions": mogrtInclusions,
                "mogrtExclusions": mogrtExclusions,
            },
            "errors": errors,
        }
    },
    //---------------------------------------------------------------------------
























    //---------------------------------------------------------------------------
    jrProcessAddToAllItems: function (items) {
        //
        // resolve references etc
        var sequence = $.jrcep.jrCalcActiveSequence();
        var resultObj = this.jrProcessResolveWorkOptions(sequence);
        if (resultObj.errors.length > 0) {
            // stop if we have errors
            var infoSummary = "ERRORS: " + resultObj.errors.join("; ");
            //alert(infoSummary);
            //
            return $.jrutils.jstringify({
                "infoSummary": datalinksSummary,
            });
        }
        var optionReferences = resultObj.references;


        var infoSummary = "";
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];

            if (item.noadd) {
                continue;
            }
            if (item.hide) {
                continue;
            }

            if (infoSummary != "") {
                infoSummary += "<br/>\n";
            }
            infoSummary += this.jrAddAtItem(item, optionReferences);
        }

        if (infoSummary == "") {
            infoSummary = "Nothing to do.";
        }

        return {
            "infoSummary": infoSummary,
        };
    },
    //---------------------------------------------------------------------------


































    //---------------------------------------------------------------------------
    jrAddAtItem: function (item, optionReferences) {
        // we have these values
        var ticks = item.ticks;

        var options = $.jrutils.jrGetGlobalOptions();
        var safetyCheckOverwrite = options["safetyCheckOverwrite"];

        // resolve references etc
        var sequence = $.jrcep.jrCalcActiveSequence();

        // sanity check complain if item sequence is not targeted sequence
        // ATTN: this can cause problems if we allow recursive discovery of places to add
        /*
        var sequenceid = sequence.projectItem.nodeId;
        if (sequenceid != item.sid) {
            return ("ERROR: Active sequence does not match item sequence; canceling operation.  Rescan the current active sequence to update result list.");
        }
        */

        // references
        var audioClipProjectItem = optionReferences.audioClipProjectItem;
        var targetAudioTrack = optionReferences.targetAudioTrack;

        // init
        var iserror = false;

        // ATTN: Ideally we would like to add a sanity check here, to make sure that no existing audio will be overwritten
        // by checking for any clips on the target audio space at the target interval (start to end)
        // though not complaining if its an instance already of our audio clip already there that we would replace
        var warn = "";
        if (safetyCheckOverwrite) {
            var existingClip = $.jrcep.JrCheckForClipInterference(targetAudioTrack, audioClipProjectItem, ticks);
            if (existingClip === false) {
                // it's a message saying ok go ahead but add this warning
                warn = " (replacing identical audio clip)";
            } else if (existingClip) {
                msg = "Skipped overwriting audio clip " + audioClipProjectItem.name + " into track " + targetAudioTrack.name + " @ " + $.jrcep.jrconvertAdobeTimeTicksToYoutubeFriendly(ticks) + ", because option 'safetyCheckOverwrite' is enabled and some other clip (" + existingClip.name + ") is already in this location.";
                iserror = true;
            }
        }


        if (!iserror) {
            // overwrite it in
            var msg = "";
            try {
                targetAudioTrack.overwriteClip(audioClipProjectItem, ticks.toString());
                msg = "Added audio clip " + audioClipProjectItem.name + " to sequence " + sequence.name + " on track " + targetAudioTrack.name + " @ " + $.jrcep.jrconvertAdobeTimeTicksToYoutubeFriendly(ticks) + (warn ? warn : "") + ".";
            } catch (e) {
                iserror = true;
                msg = "ERROR trying to insert audioclip: " + $.jrutils.jrNiceExceptionDescription(e) + ".";
            }
        }


        // go to location in timeline to help user see
        $.jrcep.jrPlayHeadGotoTick(ticks);

        // log it
        $.jrutils.consolelog(msg);

        // log it with adobe?
        //app.setSDKEventMessage("SoundFxAdder: " + msg, "info");

        return msg;
    },
    //---------------------------------------------------------------------------












    //---------------------------------------------------------------------------
    jrDoMisalignClipReport: function (sequence, projectItem, datalinks) {
        // look for ANY clip instance of this projectItem that is NOT aligned with another clip
        var startTimes = {};
        var audioProjectNodeid = projectItem.nodeId;
        var numMisaligned = 0;

        // build list of all clip start times that are NOT instances of us
        var sequenceid = sequence.projectItem.nodeId;

        for (var i = 0; i < datalinks.length; i++) {
            var item = datalinks[i];
            var startTicks = item.ticks;
            if (item.projectId == audioProjectNodeid) {
                // its one of us, skip it
                continue;
            }
            if (item.itype=="audio") {
                // audio events we ignore
                continue;
            }
            // record start time
            var iid = "T" + startTicks;
            startTimes[iid] = true;
        }


        // now walk and find all instances of us and look for ones without a match
        for (var i = 0; i < datalinks.length; i++) {
            var item = datalinks[i];
            var startTicks = item.ticks;
            if (item.projectId != audioProjectNodeid) {
                // its not of us, skip it
                continue;
            }
            // record start time
            var iid = "T" + startTicks;
            if (!startTimes[iid]) {
                // abandonded
                if (!item.subtext) {
                    item.subtext = "";
                }
                item.subtext += "[MISALIGNED&nbsp;AUDIOCLIP]";
                item.noadd = true;
                item.hide = null;
                ++numMisaligned;
            }
        }

        return numMisaligned;
    },


}
//---------------------------------------------------------------------------
