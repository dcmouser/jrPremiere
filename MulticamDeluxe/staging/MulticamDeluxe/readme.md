## MulticamDeluxe
An extension panel that creates a top-down with front inset virtual camera inside your multicamera setup.

## About the process
Adobe Premiere has great support for multi-camera editing, which lets your quickly switch between camera views when editing.
But when I make boardgame videos for the "Co-op For Two" channel, most of the time when we are in the top-down view we want to show an inset picture-in-picture overlay for the front camera in a corner.
This extension automates the process of creating this top-down-with-inset view as a kind of extra camera angle available when editing.
### Step 1
Before you trigger the extension you have to prepare your Multicam Src:
* You will begin the process by bringing your raw rootage into premiere.
* Then select first the front footage and then the top footage (order is important!).
* Then right-click on one of those and choose "Create Multi-Camera Source Sequence..", and give it the name of: "MulticamSrc".
* This is the standard process in Adobe Premiere for creating a multi-camera clip, which aligns the two videos by audio synchronization.
* See below for tips if your camera splits your video recordings into multiple files, or if you paused and resume recording.
* It is important that when you create the mutlicamera source clip sequence that you use the exact name "MulticamSrc" in order for the extension to find it (or rename it to this after).
* At this point you could (but don't) simply right-click on this and choose to create squence from clip, and you would have the standad multicamera sequence provided by Adobe Premiere; enable multic-camera toggle button and use # keys to switch between views.
* See youtube videos on the standard process of multicamera editing in Adobe Premiere.
### Step 2
Switch to the MulticamDeluxe extension window and hit the button labeled "Find and deluxify multicam sequence".
* The first thing the extension does is creates a new clip called "FrontInset", which consists of a scaled down version of the front camera angle, cropped to make it tighter according to the options, and bordered.
* This proccess uses the excellent and free 3rd party Adobe Premiere effect called "Feathered Crop" by Creative Impatience; you will need to install that: https://www.creativeimpatience.com/feathered-crop/
* The next thing that happens is that the extension creates a new sequence called VirtualTop.  This combines the top down view with the newly created FrontInset in front of it.
* The next thing that happens is that the extension inserts (and synchronizes timing of) this new view angle into a new MulticamSerc copy, as the second camera angle (pushing the original top-down view to 3rd camera angle.).
* The next thing that happens is that the extension creates a new sequence from this new 3-camera-angle multicam source, called MainSeq.
* The last thing that happens is that the extension adds the FrontInset to this new MainSeq as a MUTED (invisible) track above the main video track.  This step makes it possible to do some advanced editing (see below).
### Advanced top-down view editing
With the new virtual top camera angle, you can easily switch now between the front view and the top-view-with-pip-front-inset, and the original top-down view (if you ever want it uncluttered by the pip inset).
However, occasionally you may want to zoom and pan your top-down view with the pip front inset still visible.  In this case you cannot simply use the newly created VirtualTop angle with the inset, because it will zoom and pan the pip inset as well, which will not look right.
So instead, you will select the 3rd pure top-down angle and do your pan and zoom and other effects on that.
And then you will cut the associated section of the normally invlisible/muted track containing the coy of the standalone FrontInset video.  You then simply drag that section up to the video track above.
In this way, for this section of the sequence, the main camera angle has no pip overlay (and can thus be zoomed and panned), while an overlay of the pip front inset (which is not panned and zoom) will be rendered on top of it.

### NOTE: Dealing with split video or audio files
Note: If your video recordings are split by your camera because they are too long (or if you pause and resume recording), you have two options: If the split videos (e.g. Video1, Video2, etc.) contain no gaps, you can simply drag and drop these additional split videos into MulticamSrc sequence tracks to make one long video/audio track.  If the split videos contain gaps, you can repeat the process above to create secondary audio-synchronized MulticamSrc sequences and then copy and paste the tracks from those into the main MulticamSrc sequence.


## What Adobe host apps this sample supports
- Premier Pro

## How to install
### Move the `MulticamDeluxe` folder to the extension folder
Note that the extension folder location is different depending on which OS you use. 
On Windows the directory is C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
See [CEP Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_8.x/Documentation/CEP%208.0%20HTML%20Extension%20Cookbook.md#extension-folders) for more details
See [AEScripts Guide](https://aescripts.com/knowledgebase/index/view/faq/zxp-installer-faq/) for more details

## Requirements
IMPORTANT NOTE: All of these extensions make use of my shared helper extension, com.dc.jrlib, listed above -- so you NEED to install that in addition to whatever of my extensions you install.

### Installing Feathered Crop extension
This extension requires the installation of the excellent and free 3rd party Adobe Premiere effect called "Feathered Crop" by Creative Impatience; you will need to install that: https://www.creativeimpatience.com/feathered-crop/


## How to use
Open the MulticamDeluxe extension panel from the Adobe Premiere menu "Windows->Extensions".
Hovering the mouser over an option will provide some extra information.

## More information
For support contact mouser@donationcoder.com
See https://www.donationcoder.com/forum/index.php?topic=51718.0
