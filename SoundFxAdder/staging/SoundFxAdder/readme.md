## SoundFxAdder
Scans the active sequence looking for MOGRTs and graphics/text itemes, and can add a configurable sound effect to a target audio track whenever one is found.
This can be useful to give the user an auditory "bleep/bloop" sound whenever something comes on screen.
Options include the ability to filter only on certain mogrts, check for possible audio conflicts, and report instances where the sound effect clip is found misaligned.
Shows a list of all candidate locations and let's you add the sound effect in a single batch operation, or quickly jump around to candidate locations and manually add the effect when desired.

## What Adobe host apps this sample supports
- Premier Pro

## How to install
### Move the `SoundFxAdder` folder to the extension folder
Note that the extension folder location is different depending on which OS you use. 
On Windows the directory is C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
See [CEP Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_8.x/Documentation/CEP%208.0%20HTML%20Extension%20Cookbook.md#extension-folders) for more details
See [AEScripts Guide](https://aescripts.com/knowledgebase/index/view/faq/zxp-installer-faq/) for more details

## How to use
Open the SoundFxAdder extension panel from the Adobe Premiere menu "Windows->Extensions".
Set options.
Press Run.
IMPORTANT: Backup your project before making changes, especially when using the "ADD ALL" function.
Until you understand how the extension works, use the manual "add now" button on individual items found instead of the "ADD ALL" button.
Hovering the mouser over an option will provide some extra information.

## More information
For support contact mouser@donationcoder.com
See https://www.donationcoder.com/forum/index.php?topic=51718.0