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


$.jrzoomkeys = {



    //---------------------------------------------------------------------------
    jrInitializeExtensionZoomKeys: function () {
        // ceplog("In jrInitializeExtensionSoundFxAdder jsx with global extension context = " + $.jrutils.jrGetGlobalExtensionContextKey());

        // common extension globals
        $.jrutils.jrSetGlobal("appname", "ZoomKeys");
        $.jrutils.jrSetGlobal("appversion", "1.2 (7/17/22)");
        $.jrutils.jrSetGlobal("appauthor", "Jesse Reichler <mouser@donationcoder.com>");
        //
        // options that can be set from front end gui index.html
        // not sure this is even needed
        $.jrutils.jrSetGlobalOptions({});
        //
        // APP SPECIFIC
        $.jrts.jrSetGlobalLastScannedSequenceId(undefined);
        //
        $.jrutils.jrIncrementGlobalCounter("jrzoomkeys.Loads");

        return true;
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    jrDebugZoomKeys: function () {
        var globals = $.jrutils.jrGetAppGlobal();
        var infoSummary = "App globals: " + $.jrutils.jstringify(globals);
        var retObj = {
            "infoSummary": infoSummary,
        };
        return $.jrutils.jstringify(retObj);
    },
    //---------------------------------------------------------------------------

























    //---------------------------------------------------------------------------
    jrProcessKeyframeEffect: function (effectName) {
        var infoSummary = "";
        var tipstr = "";
        var sequence = $.jrcep.jrCalcActiveSequence();
        if (!sequence) {
            return null;
        }

        // get the clip at the current location
        var clip = this.getCurrentVideoClip();
        if (!clip) {
            // result
            var resultObj = {
                "infoSummary": "Could not find current clip at timeline position; you need to select a clip OR move timeline play head to the clip location first.",
            };
        return $.jrutils.jstringify(resultObj);
        }
    
        // options
        var options = $.jrutils.jrGetGlobalOptions();

        // remove other keyframes first
        var flagCleanFirst = true;
        if (flagCleanFirst) {
            infoSummary += "Clearing existing keyframes.";
            this.doCleanKeyframes();
        }


        // now process it
        var keyframesAdded = 0;
        if (effectName == "PushIn") {
            keyframesAdded += $.jrkeyframes.addKeyEffectPushIn(sequence, clip, $.jrutils.toInt(options.PushInDelayMs), $.jrutils.toInt(options.PushInDurationMs));
            tipstr+="Switch to the Effect Controls panel, then drag select all keyframes. Right-click, choose Temporal Interpolation -> Ease In.";
        } else if (effectName == "PullOut") {
            keyframesAdded += $.jrkeyframes.addKeyEffectPullOut(sequence, clip, $.jrutils.toInt(options.PullOutDelayMs), $.jrutils.toInt(options.PullOutDurationMs));
            tipstr+="Switch to the Effect Controls panel, then drag select all keyframes. Right-click, choose Temporal Interpolation -> Ease In.";
        } else if (effectName == "PushInPullOut") {
            keyframesAdded += $.jrkeyframes.addKeyEffectPushInPullOut(sequence, clip, $.jrutils.toInt(options.PushInPullOutDelayMs), $.jrutils.toInt(options.PushInPullOutDurationMs), $.jrutils.toInt(options.PushInPullOutEndHoldMs));
            tipstr+="Switch to the Effect Controls panel, then drag select all keyframes. Right-click, choose Temporal Interpolation -> Ease In.";
        } else if (effectName == "DramaticPushIn") {
            keyframesAdded += $.jrkeyframes.addKeyEffectDramaticPushIn(sequence, clip, $.jrutils.toInt(options.DramaticPushInDelayMs), $.jrutils.toInt(options.DramaticPushInDurationMs), $.jrutils.toInt(options.DramaticPushInSteps));
            tipstr+="Switch to the Effect Controls panel, then drag select all keyframes. Right-click, choose Temporal Interpolation -> Hold.";
        } else {
            return $.jrutils.jstringify({"infoSummary": "Unknown effect '" + effectName + "'."});
        }

        // info
        infoSummary += " Added " + keyframesAdded.toString() + " keyframes for " + effectName + " effect.";

        if (tipstr!="") {
            infoSummary += "<br/>Because Adobe Premiere api does not yet support setting keyframe interpolation, to optimize the effect do the following: " + tipstr;
        }

        // ATTN: test
        //$.jrkeyframes.studyClip(sequence, clip, options);


        // REselect it?
        $.jrcep.selectOnlyClip(sequence, clip, true);

        // result
        var resultObj = {
            "infoSummary": infoSummary,
        };

        return $.jrutils.jstringify(resultObj);
    },
    //---------------------------------------------------------------------------    
    


    //---------------------------------------------------------------------------
    jrCleanKeyframes: function() {
        // get the clip at the current location
        this.doCleanKeyframes();

        // REselect it?
        $.jrcep.reselectCurrentClip();

        var resultObj = {
            "infoSummary": "Cleared any motion keyframes.",
        };
    return $.jrutils.jstringify(resultObj);
    },


    doCleanKeyframes: function() {
        var sequence = $.jrcep.jrCalcActiveSequence();
        if (!sequence) {
            return null;
        }
        var clip = this.getCurrentVideoClip();
        if (!clip) {
            // result
            var resultObj = {
                "infoSummary": "Could not find current clip at timeline position; you need to select a clip OR move timeline play head to the clip location first.",
            };
        return $.jrutils.jstringify(resultObj);
        }

        $.jrkeyframes.clearMotionKeys(sequence, clip);
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    jrPlayCurrentClip: function () {
        // get active sequence
        var sequence = $.jrcep.jrCalcActiveSequence();
        if (!sequence) {
            return null;
        }
        var clip = $.jrcep.getCurrentClipOnSequence(sequence, false, true);
        if (!clip) {
            return null;
        }
        //
        var inPointTicks = $.jrcep.jrConvertTicksToNumeric(clip.start.ticks);
        var outPointTicks = $.jrcep.jrConvertTicksToNumeric(clip.end.ticks);
        //
        var playbackSpeedMultiplier = 1;
        $.jrqe.playNonQeSequence(sequence, inPointTicks, outPointTicks, playbackSpeedMultiplier);
    },
    //---------------------------------------------------------------------------









    //---------------------------------------------------------------------------
    getCurrentVideoClip: function() {
        // get active sequence
        var sequence = $.jrcep.jrCalcActiveSequence();
        if (!sequence) {
            return null;
        }

        var clip = $.jrcep.getCurrentClipOnSequence(sequence, false, true);
        return clip;
    },
    //---------------------------------------------------------------------------






}
