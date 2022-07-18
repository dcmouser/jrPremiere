## Preflight
This extension helps facilitate doing manual preflight checks of your sequence to look for problems.
Scans the active sequence according to your options and makes a list of timestamps of potentially interesting items, that you can easily jump to and select, and preview.
In essence, this extension reuses the code from my Timestamper extension but with it's own independent options to make it easier for you to configure it to list only timeline objects that are important to you.
The list of timeline events makes it easier to jump around and check for any problems.
For example, I find that I occasionally have mistakes in my multicamera edits where I zoom in on a clip and erroneously switch to a different camera; I can use the Preflight extension to find all clips with special effects (including zooms), and then rapidly select them each in turn to check that they are correct.
Pressing the preview POI button will jump to the next interesting timestamp in the list and play a section around this timestamp.  In this way you can very quickly preview all of the transitions, mogrts, etc. without having to rewatch the entire video.


## What Adobe host apps this sample supports
- Premier Pro

## How to install
### Move the `Preflight` folder to the extension folder
Note that the extension folder location is different depending on which OS you use. 
On Windows the directory is C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
See [CEP Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_8.x/Documentation/CEP%208.0%20HTML%20Extension%20Cookbook.md#extension-folders) for more details
See [AEScripts Guide](https://aescripts.com/knowledgebase/index/view/faq/zxp-installer-faq/) for more details

## Requirements
IMPORTANT NOTE: All of these extensions make use of my shared helper extension, com.dc.jrlib, listed above -- so you NEED to install that in addition to whatever of my extensions you install.

## How to use
Open the Preflight extension panel from the Adobe Premiere menu "Windows->Extensions".
Set options.
Press Run.

## Notes
The preflight preview of POI is smart enough to know when a bunch of consecutive POI are within range of each others left and right padding, and will play them as a single section.

## More information
For support contact mouser@donationcoder.com
See https://www.donationcoder.com/forum/index.php?topic=51718.0