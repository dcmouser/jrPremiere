////@include "../jsx/jrceputils.jsx"




$.jrcft = {

    //---------------------------------------------------------------------------
    jrInitializeExtensionCft: function() {
        // ceplog("In jrInitializeExtensionCft jsx with global extension context = " + $.jrutils.jrGetGlobalExtensionContextKey());
    
        // common extension globals
        $.jrutils.jrSetGlobal("appname", "CFT (Co-op For Two)");
        $.jrutils.jrSetGlobal("appversion", "1.7 (12/6/22)");
        $.jrutils.jrSetGlobal("appauthor", "Jesse Reichler <mouser@donationcoder.com>");
        //
        // options that can be set from front end gui index.html
        // not sure this is even needed
        $.jrutils.jrSetGlobalOptions({});
        //
        // APP SPECIFIC
        //
        // DEBUGGING global conflicts
        // $.jrutils.jrSetGlobalFlag("jrExtensions", "cft", true);
        $.jrutils.jrIncrementGlobalCounter("cft.Loads");
    
        return true;
    },
    //---------------------------------------------------------------------------
    
    
    
    
    //---------------------------------------------------------------------------
    jrDebugCft: function() {
        var globals = $.jrutils.jrGetAppGlobal();
        var infoSummary = "App globals: " + $.jrutils.jstringify(globals);
        // for debugging, have cft show us all jr globals
        var allglobals = $.jrutils.jrGetAllGlobal();
        infoSummary += "<br/>\n<br/>\nJrGlobals: " + $.jrutils.jstringify(allglobals);
        //
        var retObj = {
            "infoSummary": infoSummary,
        };
        return $.jrutils.jstringify(retObj);
    },
    //---------------------------------------------------------------------------
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    //---------------------------------------------------------------------------
    jrDoProcessMediaExport: function() {
        var infoSummary = "";
    
        // misc
        var eol = "<br/>\n";
    
        // options
        var options = $.jrutils.jrGetGlobalOptions();
        var autoStartEncoding = options["autoStartEncoding"];
        var exportPresetDir = options["exportPresetDir"];
        var exportPresetName = options["exportPresetName"];
        var overwriteExisting = options["overwriteExisting"];
        var addSequenceName = options["addSequenceName"];
        var saveThumbnailOnExport = options["saveThumbnailOnExport"];
        var launchEncoder = true;
    
        // launch encoder?
        if (launchEncoder) {
            app.encoder.launchEncoder();
            infoSummary += "Launching media encoder." + eol;
        }
    
        // computable values
        var extension = "mp4";
    
        // first get active sequence, 
        var sequence = $.jrcep.jrCalcActiveSequence();
        if (!sequence) {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequestResultSequenceNotFound("active"));
        }
    
        if ($.jrutils.jrGetFileExtension(exportPresetName).toLowerCase() != "epr") {
            exportPresetName += ".epr";
        }
    
        // export preset
        var exportPresetPath = exportPresetDir + $.jrutils.adobeGetSep() + exportPresetName;
        if (!$.jrutils.jrFileExists(exportPresetPath)) {
            // encoding file not found
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest("ERROR: Could not find export preset '" + exportPresetPath + "'.", false));
        }
    
        // set options for encoding
    
        // output file
        infoSummary += "Encoding export options:" + eol;
        var outFileDir = $.jrcep.jrCalcProjectDirectory();
        var outFileBasename = $.jrcep.jrCalcProjectFileBaseName();
        if (addSequenceName) {
            outFileBasename += "_" + sequence.name;
        }
        var outFileFullPath = outFileDir + $.jrutils.adobeGetSep() + outFileBasename + "." + extension;
        infoSummary += " * exporting to: " + outFileFullPath + eol;
    
        // overwrite? no way to tell encoder so we do it ourselves
        if (overwriteExisting) {
            var myFile = new File(outFileFullPath);
            if (myFile.exists) {
                myFile.remove();
                infoSummary += " * deleting existing file." + eol;
            }
        }
    
    
    
        // range
        var rangeToEncode = app.encoder.ENCODE_ENTIRE;
    
        // other stuff
        var removeUponCompletion = 0;
    
    
        // more info
        infoSummary += " * using encoding preset: " + exportPresetName + eol;
    
        // tell encoder to queue it
        infoSummary += "Enqueing project:" + eol;
        var jobid = app.encoder.encodeSequence(sequence, outFileFullPath, exportPresetPath, rangeToEncode, removeUponCompletion);
        //infoSummary += " * queued job id #" + jobid + eol;
        if (jobid) {
            infoSummary += " * queued job successfully." + eol;
        } else {
            infoSummary += " * ERROR: job queue id not returned as expeced." + eol; 
        }
    
    
        // start encoding?
        if (autoStartEncoding) {
            app.encoder.startBatch();
            infoSummary += "Auto-starting encoding process.." + eol;
        }


        // thumbnail?
        if (saveThumbnailOnExport) {
            var resultObj = this.jrThumbnailExport(false);
            if (resultObj.infoSummary) {
                infoSummary += resultObj.infoSummary;
            }
        }

    
        // result
        var resultObj = {
            infoSummary: infoSummary,
        };
        return $.jrutils.jstringify(resultObj);
    },
    //---------------------------------------------------------------------------
    
    
    
    
    
    
    
    
    
    //---------------------------------------------------------------------------
    jrDoProcessThumbnailExport: function(flagImportToProject) {
        var resultObj = this.jrThumbnailExport(flagImportToProject);
        return $.jrutils.jstringify(resultObj);
    },


    jrThumbnailExport: function(flagImportToProject) {
        var infoSummary = "";
        var errored = false;
    
        // first get active sequence, 
        // we need to use qe mode for exporting frame
        app.enableQE();
        var sequence = qe.project.getActiveSequence();
        if (!sequence) {
            return $.jrcep.jrMakeErrorRequestResultSequenceNotFound("active");
        }
    
        // misc
        var eol = "<br/>\n";
    
        // options
        var options = $.jrutils.jrGetGlobalOptions();
    
        // output file
        var thumbnailDir = $.jrcep.jrCalcProjectDirectory() + $.jrutils.adobeGetSep() + "Thumbnail";
        var outFileBasename = $.jrcep.jrCalcProjectFileBaseName();
        var extension = "png";
        //
        var time = sequence.CTI.timecode; 
        var removeThese = /:|;/ig; 				// Why? Because Windows chokes on colons in file names.
        var tidyTime = time.replace(removeThese, '');
        //
        var thumbnailPath = thumbnailDir + $.jrutils.adobeGetSep() + outFileBasename + "_snapshot_" + tidyTime + "." + extension;
        

        // make thumbnail directory if doesn't exist
        if (!$.jrutils.jrFolderExists(thumbnailDir)) {
            var bretv = $.jrutils.jrMakeFolder(thumbnailDir);
            if (bretv) {
                infoSummary += "Created subdirectory: " + thumbnailDir + eol;
            } else {
                return $.jrcep.jrMakeErrorRequest("ERROR: Faied to create subdirectory (" + thumbnailDir + ").", false);
            }
        }
    
        var retv = sequence.exportFramePNG(time, thumbnailPath);
    
        if (retv || true) {
            infoSummary += "Exported current snapshot image as: " + thumbnailPath + eol;
        } else {
            infoSummary += "ERROR: Failed (for unknown reasons) to exported current snapshot image as: " + thumbnailPath + eol;
        }

        // import into project?
        if (flagImportToProject) {
            // ok we saved it now we want to IMPORT it
            $.jrutils.sleepForNewFileAccess(thumbnailPath);
            //var parentBin = $.jrcep.findParentProjectItemUnderRoot(sequence.projectItem);
            var targetBin = app.project.rootItem;
            //
            var suppressWarnings = false;
            var retv = app.project.importFiles([thumbnailPath], suppressWarnings, targetBin, false);
            if (!retv) {
                infoSummary = "ERROR: Failed to import still image " + thumbnailPath + " to bin " + targetBin.name + ".";
            }
        }
    
        // result
        var resultObj = {
            infoSummary: infoSummary,
        };
        return resultObj;
    },
    //---------------------------------------------------------------------------
    
    
    
    
    
    
    
    
    
    
    
    //---------------------------------------------------------------------------
    jrDoProcessSavePlusVersion: function() {
        var infoSummary = "";
        var errored = false;
        var moveToBaseDirName = "OldJunk";
    
        // sanity check
        if (!app.project) {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest("No project open.", false));
        }
    
        // misc
        var eol = "<br/>\n";
    
        // options
        var options = $.jrutils.jrGetGlobalOptions();
        var movePreviousProject = options["movePreviousProject"];
    
        // output file
        var outFileDir = $.jrcep.jrCalcProjectDirectory();
        var outFileBasename = $.jrcep.jrCalcProjectFileBaseName();
    
        // ok now we want to REMOVE any # at end of basename, and increment it
        var outFileBasenameInc = $.jrutils.jrIncrementStringWithNumberAtEnd(outFileBasename);
        if (outFileBasename == outFileBasenameInc) {
            infoSummary += "ERROR: Could not figure out how to increment base filename(" + outFileBasename + "), nothing done.";
            errored = true;
        }
    
        if (!errored) {
            // full output filepath
            var extension = "prproj";
            var outFileFullPath = outFileDir + $.jrutils.adobeGetSep() + outFileBasenameInc + "." + extension;
            var origFileFullPath = app.project.path;
    
            if ($.jrutils.jrFileExists(outFileFullPath)) {
                infoSummary += "ERROR: Incremented file version already exists (" + outFileBasenameInc + "), nothing done.";
                errored = true;
            }
    
            if (!errored) {
                // save as
                var success = app.project.saveAs(outFileFullPath);
                if (success) {
                    infoSummary += "Saved project as: " + outFileFullPath + eol;
                    // we caall another save() right away to trick adobe to add us to recently opened list.
                    success = app.project.save();
                } else {
                    infoSummary += "ERROR: Failed to saved project as: " + outFileFullPath + " [ " + success + " result]." + eol;
                    errored = true;
                }
            }
            if (!errored && movePreviousProject) {
    
                var outDir = outFileDir + $.jrutils.adobeGetSep() + moveToBaseDirName;
                if (!$.jrutils.jrFolderExists(outDir)) {
                    var bretv = $.jrutils.jrMakeFolder(outDir);
                    if (bretv) {
                        infoSummary += "Created subdirectory: " + moveToBaseDirName + eol;
                    } else {
                        infoSummary += "ERROR: Failed to create directory: " + outDir + eol;
                        errored = true;
                    }
                }
                if (!errored) {
                    var bretv = $.jrutils.jrMoveFileToFolder(origFileFullPath, outDir);
                    if (bretv) {
                        infoSummary += "Moved previous project file (" + outFileBasename + ") to subdirectory: " + moveToBaseDirName + eol;
                    } else {
                        infoSummary += "ERROR: Failed to moved previous project file (" + outFileBasename + ") to subdirectory " + moveToBaseDirName + eol;
                        errored = true;
                    }
                }
            }
        }
    
    
        // result
        var resultObj = {
            infoSummary: infoSummary,
        };
        return $.jrutils.jstringify(resultObj);
    },
    //---------------------------------------------------------------------------







































    //---------------------------------------------------------------------------
    doInsertIntro: function(options) {
        var infoSummary = "";
        var errorstr = "";
        var eol = "<br/>\n";

        // options
        var options = $.jrutils.jrGetGlobalOptions();
        var insertionVideoItemName = options.introVideoName;

        // announce
        infoSummary += "Beginning split-insertion of intro video '" + insertionVideoItemName + "'." + eol;

        // get active sequence
        var activeSequence = $.jrcep.jrCalcActiveSequence();
        if (!activeSequence) {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest("No active sequence selected."),false);
        }

        // get intro video
        var introClipProjectItem = $.jrcep.jrLookupProjectItemByName(insertionVideoItemName);
        if (!introClipProjectItem) {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest("Couldn't find insert video project item by name" + insertionVideoItemName + "."),false);
        }


        // get time of playhead
        var playheadTime  = app.project.activeSequence.getPlayerPosition();
        //
        // first take snapshot image and save it to file and add it to project
        var imageName = "IntroFreezeFrame";
        // we want to add something to it to make it unique within a directory and project
        var projectName = $.jrcep.jrCalcProjectFileBaseName();
        var sequenceName = activeSequence.name;
        imageName = imageName + "_" + sequenceName + "_" + projectName;
        //
        var freezeFrameProjectItem = $.jrcep.takeStillAtPlayheadAddToProject(imageName);
        if (typeof freezeFrameProjectItem == "string") {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest("Error creating still image: " + freezeFrameProjectItem + "."), false);
        }
        infoSummary += "Step 1 complete: Saved freeze-frame still to file (" + imageName + ") and bin." + eol;

        // ensure we have an extra video track 
        var earlyVideoTrackIndex = $.jrcep.ensureEmptyTargetVideoTrackReturnIndex(activeSequence);
        //

        // insert it on track v1
        var mainVdeoTrackIndex = 0;
        var introClipOnMainTrack = $.jrcep.insertClipIntoSequenceSplittingItMoveEverythingOver(activeSequence, introClipProjectItem, playheadTime, mainVdeoTrackIndex);
        if (typeof newTrackItem == "string") {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest(newTrackItem),false);
        }
        infoSummary += "Step 2 complete: Inserted intro video into sequence." + eol;


        // adobe kludge bug fix for shifted markers -- doesnt seem to work
        var offsetTicks = $.jrcep.jrConvertTicksToNumeric(introClipOnMainTrack.duration.ticks);
        $.jrcep.bugFixKludgeShiftedTimers($.jrcep.jrConvertTicksToNumeric(introClipOnMainTrack.start.ticks), activeSequence, -1 * offsetTicks);
        infoSummary += "Step 3 complete: Fixed any shifted markers." + eol;


        var introClipOnTopTrack = $.jrcep.overwriteClipIntoSequenceVideoOnly(activeSequence, introClipProjectItem, playheadTime, earlyVideoTrackIndex);
        infoSummary += "Step 4 complete: Overwrote transparent intro section on track v3." + eol;

        // get the main video right before our insert
        var mainTrack = activeSequence.videoTracks[0];
        var mainClipBeforeIntro = $.jrcep.findClipOnTrackAtEndTime(mainTrack, playheadTime, undefined);
        if (!mainClipBeforeIntro) {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest("Failed to find main clip ending before split point."),false);
        }
        //
        // 5. ok now we want to tweak the durations and start points
        freezeClip = this.threeWayIntroAdjustSplit(mainTrack, introClipProjectItem, introClipOnMainTrack, introClipOnTopTrack, mainClipBeforeIntro, freezeFrameProjectItem, mainVdeoTrackIndex);
        if (typeof freezeClip == "string") {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest("Failed to dp 3way split: " + freezeClip),false);
        }
        infoSummary += "Step 5 complete: Did 3-way splitting of intro into initial part based on first marker in intro clip." + eol;

        // we want to create frame held main after mainClipBeforeIntro, called mainClipHeld

        // step 6: add effects to freeze clip
        var effectName = "uni.Grain16";
        errorstr = this.addVideoEffectToClip(freezeClip, mainVdeoTrackIndex, effectName);
        if (errorstr) {
            return errorstr;
        }
        infoSummary += "Step 6 complete: Added effect to frozen section of intro: " + effectName + "." + eol;

        // step 6: now add fade transition between end of introClipOnMainTrack and start of the NEXT clip after it
        var transitionName = "Dip to Black";
        errorstr = this.addTransitionToEndOfClip(introClipOnMainTrack, mainVdeoTrackIndex, transitionName);
        if (errorstr) {
            return errorstr;
        }
        infoSummary += "Step 7 complete: Added transition to end of intro: " + transitionName + "." + eol;

        /*
        // clean up empty tracks?
        $.jrqe.removeEmptyTracks(activeSequence,true,true);
        // add some extra tracks?
        $.jrqe.makeSomeNewTracksAtEnd(activeSequence, 2, 2);
        */

        // result info
        infoSummary += "Intro insertaion complete." + eol;

        // result
        var resultObj = {
            infoSummary: infoSummary,
        };
        return $.jrutils.jstringify(resultObj);
    },



    threeWayIntroAdjustSplit: function(track, clipProjectItem, introClipOnMainTrack, introClipOnTopTrack, mainClipBeforeIntro, freezeFrameProjectItem, freezeFrameVideoTrackIndex) {
        var errorstr;

        // step 1: get the marker in the intro that tells us where to split it
        // ATTN: test
        var markers = clipProjectItem.getMarkers();
        var introSplitDurationTicks;
        if (markers.numMarkers>0) {
            // first marker tells us where to split
            var firstMarker = markers[0];
            var firstMarkerTime = firstMarker.start;
            introSplitDurationTicks = firstMarkerTime.ticks;
        } else {
            // the intro clip has no marker telling us where to split off the transparent part
            // we want to split it; we could use an option or just pick an abitrary place, say at half way point
            introSplitDurationTicks = $.jrcep.jrConvertTicksToNumeric(introClipOnMainTrack.duration.ticks) / 2;
        }


        // step 2: shorten introSplitTicks to end after that amount of time.
        $.jrcep.shortenClipToTicks(introClipOnTopTrack, introSplitDurationTicks);

        // step 3: move the start time of introClipOnMainTrack forward that amount of time
        $.jrcep.offsetInPointTicksofClip(introClipOnMainTrack, introSplitDurationTicks);

        // step 4: create a frame hold and extend mainClipBeforeIntro that amount of time
        var freezeClip = $.jrcep.addFrameHoldAfterClip(track, mainClipBeforeIntro, introSplitDurationTicks, freezeFrameProjectItem);


        // success
        return freezeClip;
    },
    //---------------------------------------------------------------------------
    


    //---------------------------------------------------------------------------
    addVideoEffectToClip: function(clip, trackIndex, effectName) {
        //
        var qeclip = $.jrqe.findQeClipFromClip(clip, trackIndex);
        if (!qeclip) {
            return "Could not find qe clip from clip '" + clip.name + "'";
        }
        //
        var qeEffect = $.jrqe.getEffectByName(effectName);
        if (!qeEffect) {
            return "Could not find effect '" + effectName + "'";
        }
        // apply the effect!
        retv = qeclip.addVideoEffect(qeEffect);
    },


    addTransitionToEndOfClip: function(clip, trackIndex, transitionName) {
        //
        var qeclip = $.jrqe.findQeClipFromClip(clip, trackIndex);
        if (!qeclip) {
            return "Could not find qe clip from clip '" + clip.name + "'";
        }
        //

        // see https://community.adobe.com/t5/premiere-pro-discussions/premiere-pro-scripting-how-to-add-transition-to-clip/m-p/12311704


        var qeTransition = $.jrqe.getVideoTransitiontByName(transitionName);
        if (!qeTransition) {
            return "Could not find transition '" + qeTransition + "'";
        }
        // apply the transition
        //var mysteryVal = $.jrcep.jrConvertSecondsToTicks(3);
        //retv = qeclip.addTransition(qeTransition);
        var retv = qeclip.addTransition(qeTransition);
    },
    //---------------------------------------------------------------------------







//---------------------------------------------------------------------------
    doAddSoundProcessing: function() {
        var options = $.jrutils.jrGetGlobalOptions();

        var soundSet = options.soundProcessSet;
        if (soundSet=="none") {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest("Chosen sound set is 'none'; nothing to do."),false);
        }
 
        // settings to use
        var effectName = "RX 8 Voice De-noise";
        var effectOptions = {};

        // set effect options
        if (soundSet=="acquiet") {
            effectOptions = {
                "Threshold 1": this.convertEffectScaleTo01(-47.6,-120,-30),
                "Threshold 2": this.convertEffectScaleTo01(-53.5,-120,-30),
                "Threshold 3": this.convertEffectScaleTo01(-65.7,-120,-30),
                "Threshold 4": this.convertEffectScaleTo01(-72.8,-120,-30),
                "Threshold 5": this.convertEffectScaleTo01(-79.2,-120,-30),
                "Threshold 6": this.convertEffectScaleTo01(-90.6,-120,-30),
                "Master Threshold": this.convertEffectScaleTo01(8.03,-20,10),
                "Reduction": this.convertEffectScaleTo01(18.89,0,20),
                "Adaptive Mode": this.convertEffectScaleTo01(0,0,1),
                "Optimize for": this.convertEffectScaleTo01(0,0,1),
                "Filter type": this.convertEffectScaleTo01(1,0,1),
                "Input Gain": this.convertEffectScaleTo01(0,-20,10),
                "Output Gain": this.convertEffectScaleTo01(0,-20,10),
                //"Global bypass": this.convertEffectScaleTo01(0,0,1),
            };
        } else if (soundSet=="acfull") {
            effectOptions = {
                "Threshold 1": this.convertEffectScaleTo01(-47.6,-120,-30),
                "Threshold 2": this.convertEffectScaleTo01(-53.5,-120,-30),
                "Threshold 3": this.convertEffectScaleTo01(-65.7,-120,-30),
                "Threshold 4": this.convertEffectScaleTo01(-72.8,-120,-30),
                "Threshold 5": this.convertEffectScaleTo01(-79.2,-120,-30),
                "Threshold 6": this.convertEffectScaleTo01(-90.6,-120,-30),
                "Master Threshold": this.convertEffectScaleTo01(8.03,-20,10),
                "Reduction": this.convertEffectScaleTo01(18.89,0,20),
                "Adaptive Mode": this.convertEffectScaleTo01(0,0,1),
                "Optimize for": this.convertEffectScaleTo01(0,0,1),
                "Filter type": this.convertEffectScaleTo01(1,0,1),
                "Input Gain": this.convertEffectScaleTo01(0,-20,10),
                "Output Gain": this.convertEffectScaleTo01(0,-20,10),
            };
        } else if (soundSet=="acquiet_atem") {
            effectOptions = {
                "Threshold 1": this.convertEffectScaleTo01(-64.1,-120,-30),
                "Threshold 2": this.convertEffectScaleTo01(-62.4,-120,-30),
                "Threshold 3": this.convertEffectScaleTo01(-71.9,-120,-30),
                "Threshold 4": this.convertEffectScaleTo01(-82.5,-120,-30),
                "Threshold 5": this.convertEffectScaleTo01(-87.8,-120,-30),
                "Threshold 6": this.convertEffectScaleTo01(-191.0,-120,-30),
                "Master Threshold": this.convertEffectScaleTo01(8.03,-20,10),
                "Reduction": this.convertEffectScaleTo01(18.0,0,20),
                "Adaptive Mode": this.convertEffectScaleTo01(0,0,1),
                "Optimize for": this.convertEffectScaleTo01(0,0,1),
                "Filter type": this.convertEffectScaleTo01(1,0,1),
                "Input Gain": this.convertEffectScaleTo01(0,-20,10),
                "Output Gain": this.convertEffectScaleTo01(8,-20,10),
            };
        } else if (soundSet=="acquiet_wrong") {
            effectOptions = {
                "Threshold 1": this.convertEffectScaleTo01(-55.62,-120,-30),
                "Threshold 2": this.convertEffectScaleTo01(-61.56,-120,-30),
                "Threshold 3": this.convertEffectScaleTo01(-73.70,-120,-30),
                "Threshold 4": this.convertEffectScaleTo01(-80.80,-120,-30),
                "Threshold 5": this.convertEffectScaleTo01(-87.23,-120,-30),
                "Threshold 6": this.convertEffectScaleTo01(-98.63,-120,-30),
                "Master Threshold": this.convertEffectScaleTo01(8.03,-20,10),
                "Reduction": this.convertEffectScaleTo01(18.87,0,20),
                "Adaptive Mode": this.convertEffectScaleTo01(0,0,1),
                "Optimize for": this.convertEffectScaleTo01(0,0,1),
                "Filter type": this.convertEffectScaleTo01(1,0,1),
                "Input Gain": this.convertEffectScaleTo01(10,-20,10),
                "Output Gain": this.convertEffectScaleTo01(10,-20,10),
                //"Global bypass": this.convertEffectScaleTo01(0,0,1),
            };
        } else {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest("Sound processing options set is unknown: " + soundSet),false);            
        }

        // apply it to active sequence audio track v1 (or lowest nonmuted)
        var retv = $.jrqe.applySoundEffectToAllClipsOnLowestNonMutedTrackOfActiveSequence(effectName, effectOptions);
        if (retv) {
            return $.jrutils.jstringify($.jrcep.jrMakeErrorRequest(retv),false);
        }

        // success
        var resultObj = {
            infoSummary: "Audio proceessing applied to audio clips on active sequence: " + soundSet,
        };
        return $.jrutils.jstringify(resultObj);        
    },



    convertEffectScaleTo01: function(val, min, max) {
        var range = max-min;
        var pos = val - min;
        var rpos = pos/range;
        return rpos;
    },
//---------------------------------------------------------------------------













    //---------------------------------------------------------------------------
    doOpenProjectFolder: function() {
        var projDir = $.jrcep.jrCalcProjectDirectory();
        $.jrutils.doOpenFilePathInexplorer(projDir);
        // success
        var resultObj = {
            infoSummary: "Opened folder: " + projDir,
        };
        return $.jrutils.jstringify(resultObj); 
    },
    //---------------------------------------------------------------------------







    //---------------------------------------------------------------------------
    doAddCensorBleep: function() {
        //
        var infoSummary = "";

        // options
        var options = $.jrutils.jrGetGlobalOptions();
        var preTimeTicks = $.jrcep.jrConvertMsToTicks($.jrutils.toInt(options.censorBleepPreMs));
        var postTimeTicks = $.jrcep.jrConvertMsToTicks($.jrutils.toInt(options.censorBleepPostMs));
        var mogrtId = options.censorBleepSelect;
        var censorBleepDecreaseDb = $.jrutils.toFloat(options.censorBleepDecreaseDb);
        // get current time
        var sequence = $.jrcep.jrCalcActiveSequence();
        var playheadPosTicks = $.jrqe.getCurrentPlayheadTimeAsTicks(sequence);

        // lower volume around this time
        $.jrkeyframes.decreaseSoundAroundTime(sequence, playheadPosTicks, preTimeTicks, postTimeTicks, censorBleepDecreaseDb);
        infoSummary += "Decreased sound around playhead time.";

        // now add bleep mogrt with sound
        if (mogrtId!=="none") {
            var targetTimeTicks = playheadPosTicks - (preTimeTicks/2);
            var mogrtTrackItem = $.jrcep.addMogrtAtTime(sequence, mogrtId, targetTimeTicks, 2, 1);
            if (mogrtTrackItem) {          
                var flagForceEnd = true;
                if (flagForceEnd) {

                    if (false) {
                        // problem with this is the mogrt can't be enlarged after this, for some reason
                        // also it doesn't change the audio clip
                        var endTime = $.jrcep.makeTimeFromTicks(targetTimeTicks + postTimeTicks/2);
                        mogrtTrackItem.end =  endTime;
                    }

                    if (false) {
                        // doesn't work
                        var foundDuration = mogrtTrackItem.end - mogrtTrackItem.start;
                        var targetDuration = (postTimeTicks+preTimeTicks) / 2;
                        var foundOutPoint = mogrtTrackItem.outPoint;
                        //mogrtTrackItem.outPoint = $.jrcep.makeTimeFromTicks(targetDuration);
                        var nOutPoint = $.jrcep.makeTimeFromTicks(($.jrcep.jrConvertTicksToNumeric(foundOutPoint.ticks)/2));
                        mogrtTrackItem.outPoint = nOutPoint;
                    }

                    //mogrtTrackItem.end = mogrtTrackItem.start + 0.25;
                }
            }
            infoSummary += " Added censor bleep mogrt: " + mogrtId + ".";
        }

        // success
        var resultObj = {
            infoSummary: infoSummary,
        };
        return $.jrutils.jstringify(resultObj); 
    },
    //---------------------------------------------------------------------------





}
