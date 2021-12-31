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

//
// see also https://www.youtube.com/watch?v=OM60nix4d_s

////@include "../jsx/jrceputils.jsx"


$.jrpreflight = {



    //---------------------------------------------------------------------------
    jrInitializeExtensionPreflight: function () {
        // ceplog("In jrInitializeExtensionSoundFxAdder jsx with global extension context = " + $.jrutils.jrGetGlobalExtensionContextKey());

        // common extension globals
        $.jrutils.jrSetGlobal("appname", "Preflight");
        $.jrutils.jrSetGlobal("appversion", "1.2 (10/03/21)");
        $.jrutils.jrSetGlobal("appauthor", "Jesse Reichler <mouser@donationcoder.com>");
        //
        // options that can be set from front end gui index.html
        // not sure this is even needed
        $.jrutils.jrSetGlobalOptions({});
        //
        // APP SPECIFIC
        $.jrts.jrSetGlobalLastScannedSequenceId(undefined);
        //
        $.jrutils.jrIncrementGlobalCounter("Preflight.Loads");

        return true;
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    jrDebugPreflight: function () {
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
        return this.jrProcessActiveSequence();
    },
    //---------------------------------------------------------------------------






































    //---------------------------------------------------------------------------
    jrProcessActiveSequence: function () {
        // built array of results

        // parsed options
        var options = $.jrutils.jrGetGlobalOptions();
        var sequence = $.jrcep.jrCalcActiveSequence();
        var sequenceId = sequence.projectItem.nodeId;
        
        var resultObj = this.jrProcessResolveWorkOptions(sequence);
        var optionReferences = resultObj.references;

        // now using shared timestamper code
        $.jrts.jrResetGlobalSequenceTimeStampData();

        // get items
        var resultObj = $.jrtshelpers.jrDoExtractTimeStampsFromActiveSequence();
        var datalinks = resultObj.datalinks;

        // now do extra work on them
        this.scanDataItems(options, optionReferences, datalinks, resultObj);

        // cache results
        this.setCacheDatalinks(datalinks, sequenceId);

        // go to start of playhead
        sequence.setPlayerPosition("0");
    
        // return results
        return $.jrutils.jstringify(resultObj);
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    setCacheDatalinks: function(datalinks, seqId) {
        $.jrutils.jrSetGlobal("cachedActiveSeqDataLinks",datalinks);
        $.jrutils.jrSetGlobal("cachedActiveSeqDataLinksSeqId",seqId);
    },
    getCacheDatalinks: function() {
        return $.jrutils.jrGetGlobal("cachedActiveSeqDataLinks");
    },
    getCacheDatalinksForActiveSequnceOrRebuild: function() {
        var sequence = $.jrcep.jrCalcActiveSequence();
        var sequenceId = sequence.projectItem.nodeId;
        var cachedSeqId = $.jrutils.jrGetGlobal("cachedActiveSeqDataLinksSeqId");  
        //
        if (cachedSeqId != sequenceId) {
            // not yet cached, so run it
            this.jrProcessActiveSequence();
        }
        // return it
        return getCacheDatalinks();
    },

    setCacheCurrentTargetPlayheadTicks: function(ticks) {
        $.jrutils.jrSetGlobal("cachedCurrentTargetPlayheadTicks",ticks);
        this.setCachedCurrentFoundPlayheadTicks(0);
        this.setCachedCurrentFoundPlayheadTicksStuck(0);
    },
    getCacheCurrentTargetPlayheadTicks: function() {
        return $.jrutils.jrGetGlobal("cachedCurrentTargetPlayheadTicks");
    },
    setCachedCurrentFoundPlayheadTicks: function(ticks) {
        $.jrutils.jrSetGlobal("cachedCurrentFoundPlayheadTicks",ticks);
    },
    getCachedCurrentFoundPlayheadTicks: function(ticks) {
        return $.jrutils.jrGetGlobal("cachedCurrentFoundPlayheadTicks");
    },

    setCachedCurrentFoundPlayheadTicksStuck: function(counter) {
        $.jrutils.jrSetGlobal("cachedCurrentFoundPlayheadStuckCounter",counter);
    },
    getCachedCurrentFoundPlayheadTicksStuck: function() {
        return $.jrutils.jrGetGlobal("cachedCurrentFoundPlayheadStuckCounter");
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    scanDataItems: function(options, optionReferences, datalinks, resultObj) {
        var foundIncluded = 0;
        var foundMissing = 0;

        for (var i = 0; i < datalinks.length; i++) {
            var item = datalinks[i];
            if (item.hide) {
                continue;
            }
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
        var options = $.jrutils.jrGetGlobalOptions();

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
    // see https://vidjuheffex.github.io/ppro.api/
    // see https://autoedit.gitbook.io/documentation/adobe-panel/adobe-cep-jsx-functions-for-autoedit-adobe-panel
    // see https://community.adobe.com/t5/exchange-discussions/typescript-enabled-cep-development/m-p/9513313
    // see https://community.adobe.com/t5/premiere-pro-discussions/control-playback-in-cep/m-p/9915902
    // see https://community.adobe.com/t5/premiere-pro-discussions/control-playback-in-cep/td-p/9915902
    // see https://www.youtube.com/watch?v=Q7UTnEiUZ5o
    jrProcessPlayPoi: function(flagWrapAround) {
        // we want to walk through the found points of interest in timeline and play a bit before and after
        var sequence = $.jrcep.jrCalcActiveSequence();

        // get cached datalinks for active sequence
        var datalinks = this.getCacheDatalinks();

        // how much padding on either side?
        var options = $.jrutils.jrGetGlobalOptions();
        var paddingInSecondsLeft = $.jrutils.toFloat(options.poiPadLeft);
        var paddingInSecondsRight = $.jrutils.toFloat(options.poiPadRight);
        var paddingInTicksLeft = $.jrcep.jrConvertSecondsToTicks(paddingInSecondsLeft);
        var paddingInTicksRight = $.jrcep.jrConvertSecondsToTicks(paddingInSecondsRight);
        //
        var playbackSpeedMultiplier = $.jrutils.toFloat(options.playbackSpeedMultiplier);

        // find the next poi in timeline
        var datalink = this.findNextDatalinkPoi(sequence, datalinks, paddingInTicksLeft, paddingInTicksRight);
        if (!datalink && flagWrapAround) {
            sequence.setPlayerPosition("0");
            datalink = this.findNextDatalinkPoi(sequence, datalinks, paddingInTicksLeft, paddingInTicksRight);
        }

        if (!datalink) {
            var retobj = {
                "infoSummary": "No further POI found for active sequence beyond playhead position.",
            };
            return $.jrutils.jstringify(retobj);
        }

        // ok play it
        this.playPoiDatalink(sequence, datalinks, datalink, paddingInTicksLeft, paddingInTicksRight, playbackSpeedMultiplier);

        var retobj= {
            "infoSummary": "Played POI at " + $.jrcep.jrconvertAdobeTimeTicksToYoutubeFriendly(datalink.ticks),
        }
        return $.jrutils.jstringify(retobj);
    },

    jrProcessPlayAllPoi: function() {
        // now advance
        return this.jrProcessPlayPoi(true);
    },

    jrStopProcessPlayAllPoi: function() {
        app.enableQE();
        qe.stopPlayback();
        return;
        /*
        var qeSequence = qe.project.getActiveSequence(); // $.jrqe.forceActiveSequenceGetActiveSequenceQe(sequence);
        var qeSequencePlayer = qeSequence.player;
        // not sure what args to pass to play
        qeSequencePlayer.stop();
        */
    },




    findNextDatalinkPoi: function(sequence, datalinks, paddingInTicksLeft, paddingInTicksRight) {
        // return the datalink next to play head

        // get playhead position
        var playerPositionTicks = $.jrcep.jrConvertTicksToNumeric(sequence.getPlayerPosition().ticks);

        var safeTickGap = $.jrcep.jrConvertSecondsToTicks(0.1);

        // determind next datalink at that location
        for (var i=0; i<datalinks.length; ++i) {
            var datalink = datalinks[i];
            if (datalink.hide) {
                continue;
            }
            var dticks = datalink.ticks;
            var dtickspre = dticks - paddingInTicksLeft;
            var dtickspost = dticks + paddingInTicksRight;
            if (dtickspre<0) {
                dtickspre = 0;
            }
            //if (dtickspre >= playerPositionTicks || dtickspost> playerPositionTicks+safeTickGap) {
            if (dtickspre >= playerPositionTicks || dticks> playerPositionTicks+safeTickGap) {
                // found the next one
                return datalink;
            }
        }

        // not found
        this.clearSequenceInOutPoints();
        return undefined;
    },



    playPoiDatalink: function(sequence, datalinks, datalink, paddingInTicksLeft, paddingInTicksRight, playbackSpeedMultiplier) {
        // jump to area around this poi, set in and out, and play
        var startTicks = datalink.ticks;

        var inp = sequence.getInPoint();
        var outp = sequence.getOutPoint();

        var inPointTicks = startTicks - paddingInTicksLeft;
        var outPointTicks = startTicks + paddingInTicksRight;
        if (inPointTicks < 0) {
            inPointTicks = 0;
        }

        // what we'd like to do is advance past other POI that are close in proximity
        for (var i=0; i<datalinks.length; ++i) {
            var datalinknext = datalinks[i];
            if (datalink.hide) {
                continue;
            }
            if (datalinknext.ticks <= inPointTicks) {
                // this one is BEFORE (or same as) our INPOINT, so not relevant to this operation)
                continue;
            }
            else if (datalinknext.ticks < startTicks) {
                // this one starts AFTER our inpointTicks but BEFORE our startpoint of selected datapoint
                // this means that we moved our inPoint padding to before a PREVIOUS POI, which could be confusing, so lets reduce padding to start after this inpoint
                inPointTicks = datalinknext.ticks + 1;
                continue;
            }
            // ok so this is either US or stuff after us
            if (datalinknext.ticks >= outPointTicks) {
                // ok this one starts past where we want to stop, so we are done
                break;
            }

            // ok this new one starts after our planned inpoint, but before our outpoint our post play area, so we want to adjust our endpoint to include them and padding
            outPointTicks = datalinknext.ticks + paddingInTicksRight;
        }

        // ok we have an inpoint and outpoint to set
        var inPointTicksTime = $.jrcep.makeTimeFromTicks(inPointTicks);
        var outPointTicksTime = $.jrcep.makeTimeFromTicks(outPointTicks);
        // start playing
        //sequence.stop();
        app.enableQE();
        var qeSequence = qe.project.getActiveSequence(); // $.jrqe.forceActiveSequenceGetActiveSequenceQe(sequence);
        var qeSequencePlayer = qeSequence.player;
        // not sure what args to pass to play
        qeSequencePlayer.stop();

        // position it
        sequence.setInPoint(inPointTicks.toString());
        sequence.setOutPoint(outPointTicks.toString());
        sequence.setPlayerPosition(inPointTicks.toString());
        // remember our target end point so we can react when we hit the end
        this.setCacheCurrentTargetPlayheadTicks(outPointTicks);
        
        qeSequencePlayer.play(playbackSpeedMultiplier);

        //$.jrutils.consolelog(qe.reflect.methods);
        //$.jrutils.consolelog(qeSequencePlayer.reflect.methods);

        /*
        $.jrutils.consolelog(qe.reflect.methods);
        $.jrutils.consolelog(qe.reflect.properties);
        
        $.jrutils.consolelog(qeSequence.reflect.methods);

        $.jrutils.consolelog(qeSequencePlayer.reflect.methods);
        // captureAudioDeviceLoad,clearAudioDropoutStatus,disableStatistics,enableStatistics,endScrubbing,getPosition,play,scrubTo,setLoopPlayback,startScrubbing,step,stop
        //qeSequencePlayer.scrubTo($.jrcep.jrConvertTicksToSeconds(outPointTicks).toString());
        */

    },

    clearSequenceInOutPoints: function() {
        // doesnt work to clear, just sets markers at start.. oh well stupid *&%#$*%# adobe
        //sequence.setInPoint("999999999");
        //sequence.setOutPoint("999999999");
        /*
        var curpos = $.jrcep.jrConvertTicksToNumeric(sequence.getPlayerPosition().ticks);
        sequence.setInPoint((curpos-1).toString());
        sequence.setOutPoint((curpos+1).toString());
        //$.jrutils.consolelog(sequence.reflect.methods);

        */

        // see https://www.youtube.com/watch?v=Q7UTnEiUZ5o
        var qeSequence = qe.project.getActiveSequence();
        qeSequence.setInOutPoints("0","0",false);
        qeSequence.setInPoint("0",false, false);
        qeSequence.setOutPoint("0",false, false);
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    autoAdvancePoiPreviewIfAppropriate: function() {
        //$.jrutils.consolelog("in autoAdvancePoiPreviewIfAppropriate.");
        var minStayCountStopped = 20;
        var minStayCountAdvance = 3;
        var staycount;

        var sequence = $.jrcep.jrCalcActiveSequence();
        if (!sequence) {
            //alert("EARLY FALSE 1");
            return false;
        }
        
        var options = $.jrutils.jrGetGlobalOptions();
        var playbackSpeedMultiplier = $.jrutils.toFloat(options.playbackSpeedMultiplier);
        // kludges
        var safeTickGap = $.jrcep.jrConvertSecondsToTicks(0.2);
        var safeGoalRange = $.jrcep.jrConvertSecondsToTicks(0.3);
        var tooManyBackwardsTicks = $.jrcep.jrConvertSecondsToTicks(0.2);
        //
        if (playbackSpeedMultiplier>1) {
            safeTickGap *= playbackSpeedMultiplier;
            safeGoalRange *= playbackSpeedMultiplier;
            tooManyBackwardsTicks *= playbackSpeedMultiplier;
        }

        // ok get position of playhead
        var playerPositionTicks = $.jrcep.jrConvertTicksToNumeric(sequence.getPlayerPosition().ticks);
        //
        var lastCachedPlayheadPos = this.getCachedCurrentFoundPlayheadTicks();
        // keep track of last position we found ourselves at
        this.setCachedCurrentFoundPlayheadTicks(playerPositionTicks);

        if (lastCachedPlayheadPos == playerPositionTicks || lastCachedPlayheadPos>playerPositionTicks) {
            // it hasn't moved, from our last check, so abort the auto advance
            staycount = this.getCachedCurrentFoundPlayheadTicksStuck();
            this.setCachedCurrentFoundPlayheadTicksStuck(staycount+1);

            if (lastCachedPlayheadPos-playerPositionTicks > tooManyBackwardsTicks || staycount > minStayCountStopped) {
                // stayed still for too long, 
                //alert("EARLY FALSE 2, with staycount: " + staycount.toString());
                return false;
            }
        } else {
            this.setCachedCurrentFoundPlayheadTicksStuck(0);
        }

        // and where we are waiting to go to
        var ticksGoal = this.getCacheCurrentTargetPlayheadTicks();


        //
        if (playerPositionTicks >= ticksGoal-safeTickGap && Math.abs(ticksGoal-playerPositionTicks) < safeGoalRange) {
            // they are past the goal, but near enough, so advance
            staycount = this.getCachedCurrentFoundPlayheadTicksStuck();
            //$.jrutils.consolelog(staycount);
            if (staycount>minStayCountAdvance) {
                // stayed in place long enough to advance
                this.jrProcessPlayPoi(false);
                return true;
            } else {
                //alert("Staycount not good: " + staycount.toString());
            }
        }


        // not there (yet) -- return true to keep checking
        return true;
    }
    //---------------------------------------------------------------------------








}
