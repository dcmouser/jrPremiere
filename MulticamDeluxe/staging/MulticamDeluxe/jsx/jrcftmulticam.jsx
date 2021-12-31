/*
New steps based on what we can do with the API
1. Find the multicam sequence
2. Make a new sequence from 1st clip (frontview) in multicam src, call that InsetFront
3. Edit that (inset front) clip in that sequence to be scaled and positioned (according to options); Add Feathered crop to that the front clip in that InsetFront sequence
4. Make a new sequence called VirtualTop, which combines InsetFront sequence on top of a copy of (just the video of the) Top (clip 2 in multiscam src)
5a. Make a clone of the multicam seq to work in, lets call that MulticamSrcClone
5b. Delete all clips in that multicam seq clone
5c. Now add the clips in tracks in specific order (since we cant move tham around), from v1 to v3: original track v1 (front), then VirtualTop, then Top
6a. Now create a MainSeq with v1 = MulticamSrcClone
6b. add new track to this of front inset, at top, and MUTE the video of it (and no audio)
7. do some nice tweak to add some extra audio video tracks as we normally want
8. Put everything in a nice Bin structure
REMEMBER:
In all cases rememeber that the starting time of the front/top clips may be > 0 due to multicam sound alignment)
*/


$.jrcftmc = {

    // constants
    defVirtualTopName: "m_VirtualTop",
    defFrontInsetName: "m_FrontInset",
    defMulticamSeqNewName: "m_MulticamSrc",
    defMainSeqName: "MainSeq",
    defNewBinName: "Multicam components",
    defProcessedClipsName: "Processed Clips",
 
 
 
    //---------------------------------------------------------------------------
    jrInitializeExtensionMulticamDeluxe: function() {
        // common extension globals
        $.jrutils.jrSetGlobal("appname", "Multicam Deluxe");
        $.jrutils.jrSetGlobal("appversion", "1.5 (9/24/21)");
        $.jrutils.jrSetGlobal("appauthor", "Jesse Reichler <mouser@donationcoder.com>");
        //
        // options that can be set from front end gui index.html
        // not sure this is even needed
        $.jrutils.jrSetGlobalOptions({});
        //
        // APP SPECIFIC
        //
        // DEBUGGING global conflicts
        $.jrutils.jrIncrementGlobalCounter("MulticamDeluxe.Loads");
    
        return true;
    },


    jrDebugMulticamDeluxe: function() {
        var globals = $.jrutils.jrGetAppGlobal();
        var infoSummary = "App globals: " + $.jrutils.jstringify(globals);
        //
        var retObj = {
            "infoSummary": infoSummary,
        };
        return $.jrutils.jstringify(retObj);
    },
    //---------------------------------------------------------------------------
    
    
    
    
    
    
    
 
 
    //---------------------------------------------------------------------------
    doProcessMulticamDeluxe: function() {
        var infoSummary = "";
        var eol = "<br/>\n";
        var errorstr = "";

        // options
        var options = $.jrutils.jrGetGlobalOptions();

        // we need to use qe mode for these operations as they are not supported in official api unfortunately
        app.enableQE();

        // 1. Find the multicam sequence
        var multicamSrcSeq = this.findMulticamSrcSequence();
        if (typeof multicamSrcSeq == "string") {
            return $.jrutils.wrapResultInfoSummary(infoSummary + "ERROR: Failed at step 1: " + multicamSrcSeq);
        }
        infoSummary += "Step 1 complete: found multicam source sequence (" + multicamSrcSeq.name + ")." + eol;


        // 1b. Select this sequence (load it into timeline?) -- is this important?
        $.jrcep.jrSetActiveSequence(multicamSrcSeq);
    

        // 2. Make a new sequence from 1st clip (frontview) in multicam src, call that InsetFront
        var frontInsetSequence = this.makeInsetFrontSequenceFromMulticamSeq(multicamSrcSeq);
        if (typeof frontInsetSequence == "string") {
            return $.jrutils.wrapResultInfoSummary(infoSummary + "ERROR: Failed at step 2: " + frontInsetSequence);
        }
        infoSummary += "Step 2 complete: created FrontInset sequence (" + frontInsetSequence.name + ")." + eol;

        // 3. Apply an effect to the (solo) clip in new frontInsetSequence, so make it small upper left cropped
        errorstr = this.applyInsetEffectsToSequence(frontInsetSequence, options, 0, false)
        if (errorstr) {
            return $.jrutils.wrapResultInfoSummary(infoSummary + "ERROR: Failed at step 3: " + errorstr);
        }
        infoSummary += "Step 3 complete: added effects to front inset (" + frontInsetSequence.name + ")." + eol;

        // new split front inset
        frontInsetSequenceB = null;
        var insetPosition = options.insetPosition;
        if (insetPosition == "slc" || insetPosition == "suc") {

            var tryOtherWay = true;
            if (tryOtherWay) {
                var clipDupe = this.duplicateSplitInsetTrack(frontInsetSequence);
                // note that due to bug in adobe qe interface we have to pass true to bypass a sanity check
                errorstr = this.applyInsetEffectsToSequence(frontInsetSequence, options, 1, true)
                infoSummary += "Step 3b complete: added split effects to front inset (" + frontInsetSequence.name + ")." + eol;
            } else {
                // 2b. Make a new sequence from 1st clip (frontview) in multicam src, call that InsetFront
                var frontInsetSequenceB = this.makeInsetFrontSequenceFromMulticamSeq(multicamSrcSeq);
                var audioTrack = frontInsetSequenceB.audioTracks[0].setMute(1);
                //frontInsetSequence.name = frontInsetSequence.name+"_split1";
                frontInsetSequenceB.name = frontInsetSequenceB.name + "_split2";
                if (typeof frontInsetSequenceB == "string") {
                    return $.jrutils.wrapResultInfoSummary(infoSummary + "ERROR: Failed at step 2: " + frontInsetSequenceB);
                }
                infoSummary += "Step 2b complete: created split FrontInset sequence (" + frontInsetSequenceB.name + ")." + eol;

                // 3b. Apply an effect to the (solo) clip in new frontInsetSequence, so make it small upper left cropped
                errorstr = this.applyInsetEffectsToSequence(frontInsetSequenceB, options, 1, false)
                if (errorstr) {
                    return $.jrutils.wrapResultInfoSummary(infoSummary + "ERROR: Failed at step 3: " + errorstr);
                }
                infoSummary += "Step 3b complete: added effects to split front inset (" + frontInsetSequenceB.name + ")." + eol;

                // copy frontInsetSequenceB to frontInsetSequence then delete it
                var dclip = $.jrcep.findFirstVideoClipInSequence(frontInsetSequenceB);
                //this.insertClipCopyOnSequence(dclip, frontInsetSequence, 0);
                this.insertSequenceOnSequence(frontInsetSequenceB, frontInsetSequence, 1);

                var methods = dclip.reflect.methods;
                $.jrutils.consolelog("METHODS: " + methods);
            }
        }


        // 4. Make a new sequence called VirtualTop, which combines InsetFront sequence on top of a copy of (just the video of the) Top (clip 2 in multiscam src)
        // first make the virtual top with real top
        var virtualTopSequence = this.makeVirtualTopStartSequenceFromMulticamSeq(multicamSrcSeq);
        if (typeof virtualTopSequence == "string") {
            return $.jrutils.wrapResultInfoSummary(infoSummary + "ERROR: Failed at step 4: " + virtualTopSequence);
        }
        // now add front inset on top
        this.insertSequenceOnSequence(frontInsetSequence, virtualTopSequence, 1);
        //
        infoSummary += "Step 4 complete: created virtual top sequence which includes inset." + eol;;


        // 5. make a clone of multicam src and add the new virtual top as the THIRD multicam
        var newMulticamSrcSeq = this.cloneMulticamSequenceAddVirtualTop(multicamSrcSeq, virtualTopSequence);
        if (typeof newMulticamSrcSeq == "string") {
            return $.jrutils.wrapResultInfoSummary(infoSummary + "ERROR: Failed at step 5: " + newMulticamSrcSeq);
        }
        infoSummary += "Step 5 complete: created new 3-camera multicam sequence." + eol;;





        // 6. Create new main seq
        // 6b. add new track to this of front inset, at top, and MUTE the video of it (and no audio)
        var mainSequence = this.createMainSequenceFromMulticamAddFrontInset(newMulticamSrcSeq, frontInsetSequence);
        if (typeof mainSequence == "string") {
            return $.jrutils.wrapResultInfoSummary(infoSummary + "ERROR: Failed at step 6: " + mainSequence);
        }
        infoSummary += "Step 6 complete: created new multicam sequence with muted front inset: " + mainSequence.name + eol;


        // 7. New -- create more multicam src tracks for closeups
        var extraAngleSequenceList = this.makeCloseupSrcSequences(newMulticamSrcSeq, options)
        if (typeof extraAngleSequenceList == "string") {
            return $.jrutils.wrapResultInfoSummary(infoSummary + "ERROR: Failed at step 7: " + extraAngleSequenceList);
        }
        infoSummary += "Step 7a complete: If appropriate, added additional close-up camera angles to new multicam src (" + newMulticamSrcSeq.name + ")." + eol;



        // 7b. Add the new angles to main seq
        $.jrcep.addSequenceListVideoTracksToSequence(extraAngleSequenceList, newMulticamSrcSeq);

        

        // 8. some nice tweaks
        this.tweakMainSequence(mainSequence);
        infoSummary += "Step 8 complete: tweaked details of new main sequence: " + mainSequence.name + eol;


        // 9. organize into nice bins
        var newParentBin = this.organizeNewBins(this.defNewBinName, multicamSrcSeq, frontInsetSequence, frontInsetSequenceB, virtualTopSequence, newMulticamSrcSeq, mainSequence, extraAngleSequenceList, options);
        if (typeof newParentBin == "string") {
            return $.jrutils.wrapResultInfoSummary(infoSummary + "ERROR: Failed at step 9: " + newParentBin);
        }
        infoSummary += "Step 9 complete: organized content into a new bin structure undert: " + newParentBin.name + eol;;
    

        // result
        return $.jrutils.wrapResultInfoSummary(infoSummary);
    },
    //---------------------------------------------------------------------------





    //---------------------------------------------------------------------------
    findMulticamSrcSequence: function() {
        // find it by name (MulticamSrc) or by searching all sequence until we find the first multicam one?

        // walk all sequences
        var projectSequences = app.project.sequences;
        for (var i = 0; i < projectSequences.numSequences; ++i) {
            var seq = projectSequences[i];
            var pitem = seq.projectItem;
            if (!pitem) {
                continue;
            }
            var name = pitem.name;
            var isMulticam = pitem.isMulticamClip();
            if (isMulticam) {
                // we found a multicam sequence
                // does it have the right name?
                if (name == "MulticamSrc") {
                    // yes, then we found what we wanted
                    return seq;
                }
                // it doesn't have the right name.. should we keep on searching or complain or use this sequence
                // for now we ignore any sequence that does not match name
                //break;
            }
        }

        return "Could not locate multicam sequence (requires the name MulticamSrc)";
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    makeCloseupSrcSequences: function(srcSequence, options) {
        // return a string with error on failure

        // good
        var cz = 150;
        var cy = 0.75;
        //
        var sz = 200;
        var sx = 0.85;
        var sy = 1.0;

        // try 2
        var cz = 150;
        var cy = 0.75;
        //
        var sz = 200;
        var sx = (sz/100) * 0.425;
        var sy = (sz/100) * 0.50;

        var frontCopyZoomCenter = null;
        var frontCopyZoomLeft = null;
        var frontCopyZoomRight = null;

        if (options.makeZoomCenter) {
            frontCopyZoomCenter = this.makeFrontCopyZoomed(srcSequence, cz, "m_zoomCenter", 0.5, cy);
            if (typeof frontCopyZoomCenter == "string") {
                return frontCopyZoomCenter;
            }
        }
        //
        if (options.makeZoomSides) {
            frontCopyZoomLeft = this.makeFrontCopyZoomed(srcSequence, sz, "m_zoomLeft", sx, sy);
            if (typeof frontCopyZoomLeft == "string") {
                return frontCopyZoomLeft;
            }
            frontCopyZoomRight = this.makeFrontCopyZoomed(srcSequence, sz, "m_zoomRight", 1.0-sx, sy);
            if (typeof frontCopyZoomRight == "string") {
                return frontCopyZoomRight;
            }
        }
        //
        return [frontCopyZoomCenter, frontCopyZoomLeft, frontCopyZoomRight];
    },


    makeFrontCopyZoomed: function(srcSequence, zoomLevel, seqName, cx,cy) {
        var frontCopy = this.makeSubSequenceFromMulticamSeq(srcSequence, 0, seqName);
        if (typeof frontCopy == "string") {
            return frontCopy;
        }

        // now zoom and position
        var effectOptions = {
            "Scale": zoomLevel,
            "Position": [cx,cy],
        };
        var effectName = "Motion";
        retv = $.jrcep.customizeEffectForAllClipsOnSequence(frontCopy, effectName, effectOptions);

        // return it
        return frontCopy;
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    makeInsetFrontSequenceFromMulticamSeq: function(sequence) {
        // return a string with error on failure
        return this.makeSubSequenceFromMulticamSeq(sequence, 0, this.defFrontInsetName);
    },


    makeVirtualTopStartSequenceFromMulticamSeq: function(sequence) {
        // return a string with error on failure
        return this.makeSubSequenceFromMulticamSeq(sequence, 1, this.defVirtualTopName);
    },


    makeSubSequenceFromMulticamSeq: function (sequence, videoTrackIndex, newSequenceName) {

        // see Premiere.jsc line 2369-

        // sanity check
        app.project.activeSequence = sequence;
        var sequeneNodeId = sequence.projectItem.nodeId;
        if ($.jrcep.jrCalcActiveSequenceId() != sequeneNodeId) {
            return "Can't make front inset sequence if the multicam src sequence is not active.";
        }

        // sanity check
        var numVideoTracks = sequence.videoTracks.length;
        if (videoTrackIndex>=numVideoTracks) {
            return "The sequence '" + sequence.name + "' does not have the needed video track #" + videoTrackIndex.toString();
        }
        var track = sequence.videoTracks[videoTrackIndex];
        
        // select front first clip for some reason? no
        var flagSelectFirstClip = false;
        if (flagSelectFirstClip) {
            var firstClipItem = $.jrcep.findFirstClipItemOnTrack(track);
            if (typeof firstClipItem == "string") {
                return firstClipItem;
            }
            // select the clip visually (is this needed?)
            $.jrcep.unselectAllClipsOnSequence(sequence, 0);
            firstClipItem.setSelected(1, 1);
        }

        // ok now we are going to need the first clip offset time in case audio sync makes it not left aligned at 0
        var frontTrackStartOffset = this.calcSequenceFirstClipOffsetTicks(track);
        if (typeof frontTrackStartOffset == "string") {
            return frontTrackStartOffset;
        }

        // Target ONLY the video track we want to subsequence
        $.jrcep.soloTargetTrackOnSequence(sequence, videoTrackIndex, 0, true);
        //track.setTargeted(1, 1);

        // ok now make subsequence from it, by telling the ACTIVE sequence
        var frontInsetSequence = sequence.createSubsequence(false);
        frontInsetSequence.name = newSequenceName;

        // fix zeropoint of new sequnce?
        frontInsetSequence.setZeroPoint("0");

        // do we need to offset it temporally to match original?
        // ATTN: IMPORTANT - this is prone to bugginess and workaround in adobe -- it may be the cause to blame for future issues
        var flagShift = true;
        if (flagShift) {
            $.jrcep.shiftAllClipsOnSequenceByTicks(frontInsetSequence, frontTrackStartOffset);
        }

        // ATTN: cleanup by deleteing empty tracks?
        // ATTN: a kludge REQUIRES this to be called or some inserting of tracks fails
        $.jrqe.removeEmptyTracks(frontInsetSequence,true,true);

        // success
        return frontInsetSequence;
    },







    calcSequenceFirstClipOffsetTicks : function (track) {
        var startTime = this.calcSequenceFirstClipOffsetTime(track);
        if (typeof startTime == "string") {
            return startTime;
        }
        var startTicks = $.jrcep.jrConvertTicksToNumeric(startTime.ticks);
        //
        return startTicks;
    },

    calcSequenceFirstClipOffsetTime : function (track) {
        // get first clip
        var firstClip = $.jrcep.findFirstClipItemOnTrack(track);
        if (firstClip == undefined) {
            return "Found no clips on (assumed) front video track; expecting one and only.  Aborting.";
        }
        var startTime = firstClip.start;
        return startTime;
    },

    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    applyInsetEffectsToSequence: function(sequence, options, splitIndex, flagBypassSanityCheck) {
        // walk the sequence and do this for every clip on it
        // we need qe for this
        app.enableQE();

        // get qe sequence from sequence
        var qesequence = $.jrqe.forceActiveSequenceGetActiveSequenceQe(sequence);
        if (!qesequence) {
            return "Could not identify qe seqeunce " + sequence.name;
        }

        // get qe-based clip list
        var qeClipList = $.jrqe.getQeClipListInQeSequence(qesequence, undefined);
        // get standard clip list
        var retv = $.jrcep.getClipListInSequenceWithTracks(sequence);
        var clipList = retv.clipList;
        var clipTrackList = retv.clipTrackList;
        // sanity check
        if (qeClipList.length != clipList.length) {
            if (!flagBypassSanityCheck) {
                return "Unexpected mismatch of number of clips between qe and non-qe version of sequences for  " + sequence.name;
            }
        }
        // loop all clips and apply effects
        var numItems = qeClipList.length;
        for (var i=0; i<numItems; ++i) {
            var qeClip = qeClipList[i];
            var clip = clipList[i];
            var trackid = clipTrackList[i];
            //
            var errorstr = this.applyInsetEffectsToClip(sequence, clip, qeClip, options, splitIndex);
            if (errorstr) {
                return errorstr;
            }
        }

        // success
        return "";
    },




    applyInsetEffectsToClip: function(sequence, clip, qeClip, options, splitIndex) {
        // options
        var insetPosition = options.insetPosition;
        var scalePercent = $.jrutils.toFloat(options.scale);
        var paddingPixels = $.jrutils.toFloat(options.paddingPixels);
        var ocropLeftPercent = $.jrutils.toFloat(options.cropLeftPercent);
        var ocropRightPercent = $.jrutils.toFloat(options.cropRightPercent);
        var ocropTopPercent = $.jrutils.toFloat(options.cropTopPercent);
        var ocropBottomPercent = $.jrutils.toFloat(options.cropBottomPercent);
        var borderSize = $.jrutils.toFloat(options.borderSize);

        if (insetPosition == "slc" || insetPosition == "suc") {
            // left or right fixup based on what track the clip was found on
            if (splitIndex==0) {
                insetPosition = insetPosition[1]+"l";
                ocropRightPercent = 50;
                //ocropLeftPercent = 50;
            } else {
                insetPosition = insetPosition[1]+"r";
                ocropLeftPercent = 50;
                //ocropRightPercent = 50;
            }
        }

        return this.doApplyInsetEffectsToClip(sequence, clip, qeClip, insetPosition, borderSize, scalePercent, paddingPixels, ocropLeftPercent, ocropRightPercent, ocropTopPercent, ocropBottomPercent);
    },


    doApplyInsetEffectsToClip: function(sequence, clip, qeClip, insetPosition, borderSize, scalePercent, paddingPixels, ocropLeftPercent, ocropRightPercent, ocropTopPercent, ocropBottomPercent) {
        var errorstr = this.doApplyFeatheredCropEffectToClipOnSequenceSmallInset(clip, qeClip, borderSize, scalePercent, paddingPixels, ocropLeftPercent, ocropRightPercent, ocropTopPercent, ocropBottomPercent);
        if (errorstr) {
            return errorstr;
        }
        //
        var retv = this.doApplySmallInsetEffectOptionsToClip(sequence, clip, insetPosition, borderSize, scalePercent, paddingPixels, ocropLeftPercent, ocropRightPercent, ocropTopPercent, ocropBottomPercent)
        if (retv) {
            return retv;
        }
        return null;
    },





    doApplyFeatheredCropEffectToClipOnSequenceSmallInset: function(clip, qeclip, borderSize, scalePercent, paddingPixels, ocropLeftPercent, ocropRightPercent, ocropTopPercent, ocropBottomPercent) {
        // find first clip on sequence and apply effect to it
        var retv;

        // ok now how to apply effect to the clip

        // get the effect object
        // ATTN: in future get effect name from options?
        effectName = "CI Feathered Crop"
        var qeEffect = $.jrqe.getEffectByName(effectName);
        if (!qeEffect) {
            return "Could not find effect '" + effectName + "'";
        }
        // apply the effect!
        retv = qeclip.addVideoEffect(qeEffect);

        // i think we need NON-QE clip for this!

        var effectOptions = {
            "Crop left": ocropLeftPercent,
            "Crop right": ocropRightPercent,
            "Crop top": ocropTopPercent,
            "Crop bottom": ocropBottomPercent,
            "_1": false,
            "Border": true,
            "Fill border with": 1, // index 1 == COlor
            "Border color": "#FFFFFF",
            "_2": true,
            "_3": true,
            "Border left": borderSize, 
        };
        retv = $.jrcep.customizeEffectForClip(clip, effectName, effectOptions);

        if (!retv) {
            return "Could not find changeable options for effect: " + effectName;
        }

        // success
        return "";
    },





    doApplySmallInsetEffectOptionsToClip: function(sequence, clip, insetPosition, borderSize, scalePercent, paddingPixels, ocropLeftPercent, ocropRightPercent, ocropTopPercent, ocropBottomPercent) {
        var effectName = "Motion";

        // calculations
        var invertedScalePercent = 100.0 - scalePercent;
        //

        var sequenceFrameWidth = sequence.frameSizeHorizontal;
        var sequenceFrameHeight = sequence.frameSizeVertical;
        var paddingPercentX = (paddingPixels / sequenceFrameWidth);
        var paddingPercentY = (paddingPixels / sequenceFrameHeight);
        //
        var cropLeftPercent, cropTopPercent;
        var xPosOffset, yPosOffset;
        var leftOffset, topOffset;

        var halign, valign;
        if (insetPosition == "ul") {
            halign = -1;
            valign = -1;
        } else if (insetPosition == "uc") {
            halign = 0;
            valign = -1;
        } else if (insetPosition == "ur") {
            halign = 1;
            valign = -1;
        } else if (insetPosition == "ll") {
            halign = -1;
            valign = 1;
        } else if (insetPosition == "lc") {
            halign = 0;
            valign = 1;
        } else if (insetPosition == "lr") {
            halign = 1;
            valign = 1;
        } else if (insetPosition == "ml") {
            halign = -1;
            valign = 0;
        } else if (insetPosition == "mc") {
            halign = 0;
            valign = 0;
        } else if (insetPosition == "mr") {
            halign = 1;
            valign = 0;
        } else {
            return "Uknonwn inset position: "+insetPosition;
        }


        // latest good does padding and border
        cropLeftPercent = (ocropLeftPercent - paddingPercentX*100.0) * (scalePercent / 100.0);
        cropTopPercent = (ocropTopPercent - paddingPercentY*100.0) * (scalePercent / 100.0);
        cropRightPercent = (ocropRightPercent - paddingPercentX*100.0) * (scalePercent / 100.0);
        cropBottomPercent = (ocropBottomPercent - paddingPercentY*100.0) * (scalePercent / 100.0);


        //
        if (halign == -1) {
            xPosOffset = ((cropLeftPercent + invertedScalePercent/2.0) / 100.0);
            leftOffset = 0.5 - xPosOffset;
        } else if (halign == 0) {
            xPosOffset = ((cropLeftPercent + invertedScalePercent/2.0) / 100.0)/2.0 - ((cropRightPercent + invertedScalePercent/2.0) / 100.0)/2.0;
            leftOffset = 0.5 - xPosOffset;
            //leftOffset -= ((cropLeftPercent + invertedScalePercent/2.0) / 100.0) / 2;
            //leftOffset += ((cropRightPercent + invertedScalePercent/2.0) / 100.0) /2;
        } else if (halign == 1) {
            xPosOffset = ((cropRightPercent + invertedScalePercent/2.0) / 100.0);
            leftOffset = 0.5 + xPosOffset;
        }
        if (valign == -1) {
            yPosOffset = ((cropTopPercent + invertedScalePercent/2.0) / 100.0);
            topOffset = 0.5 - yPosOffset;
        } else if (valign == 0) {
            yPosOffset = ((cropTopPercent + invertedScalePercent/2.0) / 100.0)/2.0 - ((cropBottomPercent + invertedScalePercent/2.0) / 100.0)/2.0;
            topOffset = 0.5 - yPosOffset;
        } else if (valign == 1) {
            yPosOffset = ((cropBottomPercent + invertedScalePercent/2.0) / 100.0);
            topOffset = 0.5 + yPosOffset;
        }         
        
        leftOffset += paddingPercentX * (halign*-1);
        topOffset += paddingPercentY * (valign*-1);

        var effectOptions = {
            "Scale": scalePercent,
            "Position": [leftOffset, topOffset],
            //"Anchor Point": [0,0],
        };
        ret = $.jrcep.customizeEffectForClip(clip, effectName, effectOptions);

        // success
        return "";
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    insertSequenceOnSequence: function(sequenceToAdd, sequenceTarget, position) {

        // kludge fix test
        $.jrqe.removeEmptyTracks(sequenceToAdd,true,true);
        $.jrqe.removeEmptyTracks(sequenceTarget,true,true);

        // first get the target track
        var targetTrack;
        if (false && position<0) {
            targetTrack = sequenceTarget.videoTracks[position * -1];
        } else {
            targetTrack = this.addInsertTrack(sequenceTarget, position);
        }

        if (typeof targetTrack == "string") {
            return targetTrack;
        }
        // now insert
        var projectItem = sequenceToAdd.projectItem;
        targetTrack.insertClip(projectItem,0);

        // ATTN: cleanup by deleteing empty tracks?
        $.jrqe.removeEmptyTracks(sequenceTarget,true,true);

        return targetTrack;
    },


    addInsertTrack: function(sequence, position) {
        // make a new track which (position==1 means is at the TOP later index) of any existing
        var track = $.jrqe.makeNewVideoTrackReturnItNonQe(sequence, position, 1);
        return track;
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    insertClipCopyOnSequence: function(clipToAdd, sequenceTarget, position) {

        // a problem with this is that it uses the PROJECT item of the clip, and not any effects/modifications

        // kludge fix test
        //$.jrqe.removeEmptyTracks(sequenceTarget,true,true);

        // first get the target track
        var targetTrack;
        if (false && position<0) {
            targetTrack = sequenceTarget.videoTracks[position * -1];
        } else {
            targetTrack = this.addInsertTrack(sequenceTarget, position);
        }

        if (typeof targetTrack == "string") {
            return targetTrack;
        }
        // now insert
        var projectItem = clipToAdd.projectItem;
        var retv = targetTrack.insertClip(projectItem,0);
        //var retv = targetTrack.insertClip(clipToAdd,0);

        //var retv = targetTrack.insertClip(projectItem,1);
        var clip = $.jrcep.findFirstClipItemOnTrack(targetTrack)

        // ATTN: cleanup by deleteing empty tracks?
        //$.jrqe.removeEmptyTracks(sequenceTarget,true,true);


        return clip;
    },
    //---------------------------------------------------------------------------


    //---------------------------------------------------------------------------
    cloneMulticamSequenceAddVirtualTop: function (sequence, virtualTopSequence) {
        // ATTN: Because of a bug(?) in inserting tracks, the audio and video tracks here get kind of swapped.. but for our case since they all muted, it doesnt matter)
        // ATTN: IN future, especially if we want to support more than 2 cameras, we may have to rewrite this to make the new multicam src better

        // clone it
        sequence.clone();
        var newSeq = $.jrcep.guessNewlyClonedSequence(sequence);
        //var newSeq = multicamSequence.createSubsequence(true);
        if (!newSeq) {
            return "Could not find newly cloned copy of sequence " + sequence.name;
        }
        // found it; give it a better name and return it
        var foundName = newSeq.name;
        newSeq.name = this.defMulticamSeqNewName;

        // now insert virtual top
        // here is where our insertion bug shows up.
        // to fix it, we might delete all tracks in the new multicamsrc except the first, THEN add virtualTop, THEN add the rest
        this.insertSequenceOnSequence(virtualTopSequence, newSeq, 1);
        this.muteAudioTrackOfSequence(newSeq,1);
        this.muteAudioTrackOfSequence(newSeq,2);

        return newSeq;
    },


    muteAudioTrackOfSequence: function(sequence, audioTrackIndex) {
        sequence.audioTracks[audioTrackIndex].setMute(1);
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    createMainSequenceFromMulticamAddFrontInset: function(sequence, frontInsetSequence) {
        // first create new main sequence
        var mainName = $.jrcep.uniqueifyProjectItemName(this.defMainSeqName);
        var newSeq = app.project.createNewSequenceFromClips(mainName, [sequence.projectItem]);
        if (!newSeq) {
            return "Failed to createNewSequenceFromClips.";
        }


        // already room for it? stick new stuff on v2
        var targetTrack = newSeq.videoTracks[1];
        var projectItem = frontInsetSequence.projectItem;
        targetTrack.insertClip(projectItem,0);
        // mute it
        targetTrack.setMute(1);

        // delete the associated audio track of the front inset
        // $.jrqe.removeAudioTrack(newSeq, 1);
        // instead delete contents so we still have a good empty one
        $.jrcep.deleteAllCipsOnTrack(newSeq.audioTracks[1]);

        // ATTN: cleanup by deleteing empty tracks?
        //$.jrqe.removeEmptyTracks(newSeq,true,true);

        // return newly created sequence
        return newSeq;
    },
    //---------------------------------------------------------------------------



    //---------------------------------------------------------------------------
    organizeNewBins: function(tryBinName, multicamSourceSeq, frontInsetSequence, frontInsetSequenceB, virtualTopSequence, newMulticamSrcSeq, mainSequence, extraAngleSequenceList, options) {
        var flagMoveMulticamSrcToBin = options.moveMulticamSrcToBin;
        var flagMoveNewMainSeq = false;
        var flagMoveAllUnderProcessed = options.moveAllUnderProcessed;

        // bin where the MulticamSrc sequence lives
        var parentBin = $.jrcep.findParentProjectItemUnderRoot(multicamSourceSeq.projectItem);
        // figure out a unique bin name based on our name
        var newBinName = $.jrcep.uniqueifyProjectItemName(tryBinName);
        if (!newBinName) {
            return "Unable to find a suitable new bin name to organize under.";
        }

        // a Processed Clip bin?
        var processedClipsBin;
        if (flagMoveAllUnderProcessed) {
            var processedClipsName = this.defProcessedClipsName;
            processedClipsBin = $.jrcep.findMatchingBinNameUnderProjectItem(processedClipsName, parentBin);
            if (processedClipsBin) {
                parentBin = processedClipsBin;
            } else {
                // make processed clips bin if its not made
                var retv = parentBin.createBin(processedClipsName);
                processedClipsBin = $.jrcep.findMatchingBinNameUnderRoot(processedClipsName);
                if (processedClipsBin) {
                    parentBin = processedClipsBin;
                }
            }
        }

        // create the bin
        var retv = parentBin.createBin(newBinName);
        // now stupid adobe makes us manually find it
        var newBin = $.jrcep.findMatchingBinNameUnderRoot(newBinName);
        if (!newBin) {
            return "Failed to create new bin to organize under; tried '" + newBinName + " '.";
        }

        // ok now move things under it
        if (flagMoveMulticamSrcToBin) {
            if (processedClipsBin) {
                // if they asked us to move under ProcessedClips, put source in their instead of in our subdir
                multicamSourceSeq.projectItem.moveBin(processedClipsBin);
            } else {
                multicamSourceSeq.projectItem.moveBin(newBin);
            }
        }
        //
        frontInsetSequence.projectItem.moveBin(newBin);
        if (frontInsetSequenceB) {
            frontInsetSequenceB.projectItem.moveBin(newBin);
        }
        virtualTopSequence.projectItem.moveBin(newBin);
        newMulticamSrcSeq.projectItem.moveBin(newBin);
        if (flagMoveNewMainSeq) {
            mainSequence.projectItem.moveBin(newBin);
        }

        // extra angles
        for (var i=0;i<extraAngleSequenceList.length;++i) {
            var seq = extraAngleSequenceList[i];
            if (seq!=null) {
                seq.projectItem.moveBin(newBin);
            }
        }

        return newBin;
    },




    tweakMainSequence: function(mainSequence) {
        // clean up any unused tracks
        // ATTN: cleanup by deleteing empty tracks?
        //$.jrqe.removeEmptyTracks(mainSequence,true,true);

        // but now add some tracks
        //$.jrqe.makeSomeNewTrack(mainSequence, 1, 2, 2, 1);
        $.jrqe.makeSomeNewTracksAtEnd(mainSequence,1,0);

        // target the first audio and video track?
        $.jrcep.targetV1A1(mainSequence);

        // ATTN: im not sure if what we want instead is to set source patching tracks, which im not sure how to do
    },
    //---------------------------------------------------------------------------




    //---------------------------------------------------------------------------
    duplicateSplitInsetTrack: function(frontInsetSequence) {

        // test
        $.jrqe.makeSomeNewTrack(frontInsetSequence, 2, 1, 0, 0);

        // make a copy of front inset sequence
        var firstClip = $.jrcep.findFirstVideoClipInSequence(frontInsetSequence);
        var position = 0;
        var clipDupe = this.insertClipCopyOnSequence(firstClip, frontInsetSequence, position);

        var bname = firstClip.name;
        firstClip.name = bname+"_split1";
        clipDupe.name = bname+"_split2";

        // kludge
        //$.jrqe.makeSomeNewTrack(frontInsetSequence, 1, 2, 0, 0);
        //$.jrqe.removeEmptyTracks(frontInsetSequence, true,true);

        // mute audio track
        var audioTrack = frontInsetSequence.audioTracks[1].setMute(1);

        return clipDupe;
    },
    //---------------------------------------------------------------------------





}
