// cep related helpers

////@include "jrutils.jsx"

$.jrkeyframes = {


    clearMotionKeys: function(sequence, clip) {
        //$.jrutils.consolelog("ATTN: in clearMotionKeys.");
        var pPosition = $.jrcep.getClipProperty(clip,"Motion", "Position");
        var pScale = $.jrcep.getClipProperty(clip,"Motion", "Scale");

        // get playhead position in active sequence
        var doRestore = false;
        var saveKeypos = 0;
        var saveVal;
        var saveTime;
        var qesequence = $.jrqe.forceActiveSequenceGetActiveSequenceQe(sequence);
        if (qesequence) {
            var playheadPosTicks = qesequence.CTI.ticks;
            if (playheadPosTicks) {
                if (playheadPosTicks >= $.jrcep.jrConvertTicksToNumeric(clip.start.ticks) && playheadPosTicks <= $.jrcep.jrConvertTicksToNumeric(clip.end.ticks)) {
                    // play head is within clip, so get the values where it is
                    saveKeypos = $.jrcep.jrConvertTicksToNumeric(clip.inPoint.ticks) + (playheadPosTicks - $.jrcep.jrConvertTicksToNumeric(clip.start.ticks));
                    //saveTime = $.jrcep.makeTimeFromTicks(playheadPosTicks);
                    saveTime = $.jrcep.makeTimeFromTicks(saveKeypos);
                    doRestore = true;
                }
            }
                
        }

        if (pPosition) {
            // get
            if (doRestore) {
                saveVal = pPosition.getValueAtTime(saveTime);
            }
            // turn off time varying
            pPosition.setTimeVarying(false);
            if (doRestore) {
                // set
                if (saveVal!=null) {
                    pPosition.setValue(saveVal);
                }
            }
        }
        if (pScale) {
            if (doRestore) {
                // get
                saveVal = pScale.getValueAtTime(saveTime);
            }
            // turn off time varying
            pScale.setTimeVarying(false);
            if (doRestore) {
                // set
                if (saveVal!=null) {
                    pScale.setValue(saveVal);
                }
            }
        }


    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    addKeyEffectPushIn: function(sequence, clip, initialDelayMs, durationMs) {
        // setup and get vals
        var keyframesAdded = 0;
        var evals = this.setupForKeyframingMotion(clip);

        // fixup effect duration if too long
        var fixProportion = this.getFixupDurationProportion();
        while (evals.clipDurationTicks > 0 && evals.clipDurationTicks/2.0 < initialDelayMs+durationMs) {
            initialDelayMs /= fixProportion;
            durationMs /= fixProportion;
        }

        // add keyframs
        //
        // start at original size
        this.addScalePositionKeyframe(evals.inPointTicks, 0, evals.pScale, 100.0, evals.pPosition, [0.5,0.5], this.getKeyframeIntepType("hold"));
        ++keyframesAdded;
        //
        // hold until start time
        var initialDelayTicks = $.jrcep.jrConvertMsToTicks(initialDelayMs);
        this.addScalePositionKeyframe(evals.inPointTicks, initialDelayTicks, evals.pScale, 100.0, evals.pPosition, [0.5,0.5], this.getKeyframeIntepType("easeOut"));
        ++keyframesAdded;
        //
        // next move to target over some duration
        var durationTicks = $.jrcep.jrConvertMsToTicks(durationMs);
        this.addScalePositionKeyframe(evals.inPointTicks, initialDelayTicks + durationTicks, evals.pScale, evals.targetScale, evals.pPosition, evals.targetPosition, this.getKeyframeIntepType("easeIn"));
        ++keyframesAdded;

        return keyframesAdded;
    },


    addKeyEffectPullOut: function(sequence, clip, initialDelayMs, durationMs) {
        // setup and get vals
        var keyframesAdded = 0;
        var evals = this.setupForKeyframingMotion(clip);

        // fixup effect duration if too long
        var fixProportion = this.getFixupDurationProportion();
        while (evals.clipDurationTicks > 0 && evals.clipDurationTicks/2.0 < initialDelayMs+durationMs) {
            initialDelayMs /= fixProportion;
            durationMs /= fixProportion;
        }

        // add keyframs
        //
        // start at target size
        this.addScalePositionKeyframe(evals.inPointTicks, 0, evals.pScale, evals.targetScale, evals.pPosition, evals.targetPosition, this.getKeyframeIntepType("hold"));
        ++keyframesAdded;
        //
        // hold until start time
        var initialDelayTicks = $.jrcep.jrConvertMsToTicks(initialDelayMs);
        this.addScalePositionKeyframe(evals.inPointTicks, initialDelayTicks, evals.pScale, evals.targetScale, evals.pPosition, evals.targetPosition, this.getKeyframeIntepType("easeOut"));
        ++keyframesAdded;
        //
        // next move to orig over some duration
        var durationTicks = $.jrcep.jrConvertMsToTicks(durationMs);
        this.addScalePositionKeyframe(evals.inPointTicks, initialDelayTicks + durationTicks, evals.pScale, 100.0, evals.pPosition, [0.5,0.5], this.getKeyframeIntepType("easeIn"));
        ++keyframesAdded;

        return keyframesAdded;
    },


    addKeyEffectPushInPullOut: function(sequence, clip, initialDelayMs, durationMs, endHoldMs) {
        // setup and get vals
        var keyframesAdded = 0;
        var evals = this.setupForKeyframingMotion(clip);

        // if endhold is -1 then set it to initialdelay
        if (endHoldMs==-1) {
            endHoldMs = initialDelayMs;
        }

        // fixup effect duration if too long
        var fixProportion = this.getFixupDurationProportion();
        while (evals.clipDurationTicks > 0 && evals.clipDurationTicks/2.0 < initialDelayMs+durationMs) {
            initialDelayMs /= fixProportion;
            durationMs /= fixProportion;
            endHoldMs /= fixProportion;
        }

        // add keyframs
        //
        // start at orig size
        this.addScalePositionKeyframe(evals.inPointTicks, 0, evals.pScale, 100.0, evals.pPosition, [0.5,0.5], this.getKeyframeIntepType("hold"));
        ++keyframesAdded;
        //
        // hold until start time
        var initialDelayTicks = $.jrcep.jrConvertMsToTicks(initialDelayMs);
        this.addScalePositionKeyframe(evals.inPointTicks, initialDelayTicks, evals.pScale, 100.0, evals.pPosition, [0.5,0.5], this.getKeyframeIntepType("easeOut"));
        ++keyframesAdded;
        //
        // next move to target over some duration
        var durationTicks = $.jrcep.jrConvertMsToTicks(durationMs);
        this.addScalePositionKeyframe(evals.inPointTicks, initialDelayTicks + durationTicks, evals.pScale, evals.targetScale, evals.pPosition, evals.targetPosition, this.getKeyframeIntepType("easeIn"));
        ++keyframesAdded;

        // now hold that till near the end
        var endHoldTicks = $.jrcep.jrConvertMsToTicks(endHoldMs);
        var endPhaseStartTicks = evals.clipDurationTicks - (durationTicks + endHoldTicks);
        this.addScalePositionKeyframe(evals.inPointTicks, endPhaseStartTicks, evals.pScale, evals.targetScale, evals.pPosition, evals.targetPosition, this.getKeyframeIntepType("easeOut"));
        ++keyframesAdded;

        // begin end transition back to original
        this.addScalePositionKeyframe(evals.inPointTicks, endPhaseStartTicks + durationTicks, evals.pScale, 100.0, evals.pPosition, [0.5,0.5], this.getKeyframeIntepType("easeIn"));
        ++keyframesAdded;

        // final hold to original
        this.addScalePositionKeyframe(evals.inPointTicks, evals.clipDurationTicks, evals.pScale, 100.0, evals.pPosition, [0.5,0.5], this.getKeyframeIntepType("hold"));
        ++keyframesAdded;

        return keyframesAdded;
    },


    addKeyEffectDramaticPushIn: function(sequence, clip, initialDelayMs, durationMs, steps) {
        // what we want here is a multi-step push in instant stepwise fashion

        // setup and get vals
        var keyframesAdded = 0;
        var evals = this.setupForKeyframingMotion(clip);

        // fixup effect duration if too long
        var fixProportion = this.getFixupDurationProportion();
        while (evals.clipDurationTicks > 0 && evals.clipDurationTicks/2.0 < initialDelayMs+durationMs) {
            initialDelayMs /= fixProportion;
            durationMs /= fixProportion;
        }

        // add keyframs
        //
        // start at orig size
        this.addScalePositionKeyframe(evals.inPointTicks, 0, evals.pScale, 100.0, evals.pPosition, [0.5,0.5], this.getKeyframeIntepType("hold"));
        ++keyframesAdded;

        // and now we will purform steps push ins, over the course of duration
        var durationTicks = $.jrcep.jrConvertMsToTicks(durationMs);
        var stepDurationTicks = durationTicks/steps;
        var initialDelayTicks = $.jrcep.jrConvertMsToTicks(initialDelayMs);
        var curTimeTicks = initialDelayTicks
        var scaleRange = evals.targetScale - 100.0;
        var positionRangeX = evals.targetPosition[0] - 0.5;
        var positionRangeY = evals.targetPosition[1] - 0.5;
        for (var i=1;i<=steps; ++i) {
            // relmult goes from 0 to 1 as we push in
            var relmult = i/(steps);
            this.addScalePositionKeyframe(evals.inPointTicks, curTimeTicks, evals.pScale, 100.0 + (relmult*scaleRange), evals.pPosition, [0.5 + (relmult*positionRangeX) ,0.5 + (relmult*positionRangeY)], this.getKeyframeIntepType("hold"));
            curTimeTicks += stepDurationTicks;
            ++keyframesAdded;
        }

        return keyframesAdded;
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    setupForKeyframingMotion: function(clip) {
        evals = {};

        // get props
        evals.pPosition = $.jrcep.getClipProperty(clip, "Motion", "Position");
        evals.pScale = $.jrcep.getClipProperty(clip, "Motion", "Scale");

        // get value of position and scale (un timevarying)
        evals.targetScale = evals.pScale.getValue();
        evals.targetPosition = evals.pPosition.getValue();

        // make position and scale time varying
        evals.pPosition.setTimeVarying(true);
        evals.pScale.setTimeVarying(true);

        // clip in point (needed for keyframe setting)
        evals.inPointTicks = $.jrcep.jrConvertTicksToNumeric(clip.inPoint.ticks);

        // start and end of clip
        evals.startTicks = $.jrcep.jrConvertTicksToNumeric(clip.start.ticks);
        evals.endTicks = $.jrcep.jrConvertTicksToNumeric(clip.end.ticks);
        evals.clipDurationTicks = (evals.endTicks - evals.startTicks);

        // return it
        return evals;
    },


    getKeyframeIntepType: function(itype) {
        if (itype == "none") {
            return null;
        }
        if (itype == "hold") {
            return 4;
        }

        if (itype == "easeIn") {
            return 1;
        }
        if (itype == "easeOut") {
            return 2;
        }
        return null;
    },


    getFixupDurationProportion: function() {
        return 1.5;
    },
    //---------------------------------------------------------------------------







    //---------------------------------------------------------------------------
    addScalePositionKeyframe: function (inpointTicks, ticks, pScale, scale, pPosition, position, interpretationType) {
        var bretv;
        var tp = $.jrcep.makeTimeFromTicks(inpointTicks + ticks);
        bretv = pScale.addKey(tp);
        bretv = pPosition.addKey(tp);
        bretv = pPosition.setValueAtKey(tp, position, 1);
        bretv = pScale.setValueAtKey(tp, scale, 1);
        var flagSupportsInterpolation = this.calcSupportsInterpolation();
        if (interpretationType!=null && flagSupportsInterpolation) {
            // does not work;
            // some hint that it may be fixed in beta 22
            // see https://ppro-scripting.docsforadobe.dev/sequence/componentparam.html?highlight=setInterpolationTypeAtKey#componentparam-setinterpolationtypeatkey
            // see https://community.adobe.com/t5/premiere-pro-discussions/what-are-valid-parameters-for-setinterpolationtypeatkey-in-premiere-pro-extendscript/m-p/10987274
            /* Must be one of the following:
            • 0
            kfInterpMode_Linear
            • 1
            kfInterpMode_EaseIn_Obsolete
            • 2
            kfInterpMode_EaseOut_Obsolete
            • 3
            kfInterpMode_EaseInEaseOut_Obsole
            • 4 kfInterpMode_Hold
            • 5
            kfInterpMode_Bezier
            • 6 kfInterpMode_Time
            • 7
            kfInterpMode_TimeTransitionStart
            • 8
            kfInterpMode_TimeTransitionEnd
            updateUI boolean Whether to update UI afterward.
            */

            // bugs
            /*
            if (interpretationType==2 || interpretationType==4) {
                return;
            }
            */


            bretv = pPosition.setInterpolationTypeAtKey(tp,interpretationType, true);
            bretv = pScale.setInterpolationTypeAtKey(tp, interpretationType, true);
        }
    },



    addSetKeyframe: function (prop, timeTicks, val) {
        var tp = $.jrcep.makeTimeFromTicks(timeTicks);
        bretv = prop.addKey(tp);
        bretv = prop.setValueAtKey(tp, val, 1);
        return bretv;
    },


    calcSupportsInterpolation: function() {
        var version = app.version;
        var versionFloat = $.jrutils.toFloat(version);
        if (versionFloat>20) {
            return true;
        }
        return false;
    },





    decreaseSoundAroundTime: function(sequence, posTicks, preTimeTicks, postTimeTicks, censorBleepDecreaseDb) {
        // we need to find the audio clip where this time is, and convert begin/end times to keyframe times

        // now we want to add keyframes to DROP the volume at begin and put it back and end, enabling time varying on clips if needed
        var clip = $.jrcep.getClipFromTrackAtTime(sequence.audioTracks, posTicks);
        if (!clip) {
            return;
        }

        // convert to keyframe times
        var inPointTicks = $.jrcep.jrConvertTicksToNumeric(clip.inPoint.ticks)
        var clipStartTicks = $.jrcep.jrConvertTicksToNumeric(clip.start.ticks);
        var clipEndTicks = $.jrcep.jrConvertTicksToNumeric(clip.end.ticks);
        //

        var midKeyTime = (posTicks - clipStartTicks) + inPointTicks;

        var beginKeyTime = midKeyTime - preTimeTicks;
        var endKeyTime = midKeyTime + postTimeTicks;

        // get component for volume
        var pVolume = $.jrcep.getClipProperty(clip,"Volume", "Level");        
        // force time varying
        pVolume.setTimeVarying(true);
        // remember orig volume
        var origVolume = pVolume.getValueAtTime(beginKeyTime-1);
        // compute new volume?
        lowVolume = origVolume / censorBleepDecreaseDb;
        //lowVolume = -12;

        // now put keyframes at start and end at orig volume
        this.addSetKeyframe(pVolume, beginKeyTime, origVolume);
        this.addSetKeyframe(pVolume, endKeyTime, origVolume);
        // and at middle with low vol
        if (true) {
            this.addSetKeyframe(pVolume, (beginKeyTime+midKeyTime)/2, lowVolume);
            this.addSetKeyframe(pVolume, (endKeyTime+midKeyTime)/2, lowVolume);
            this.addSetKeyframe(pVolume, midKeyTime, lowVolume);
        } else if (true) {
            this.addSetKeyframe(pVolume, midKeyTime, lowVolume);

        } else {
            this.addSetKeyframe(pVolume, beginKeyTime+1, lowVolume);
            this.addSetKeyframe(pVolume, endKeyTime-1, lowVolume);
        }
        

        //$.jrutils.consolelog("origVolume = " + origVolume.toString());
    },










};

