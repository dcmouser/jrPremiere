## TimeStamper
Scans your active sequence and builds a timestamp list of "notable" clips and mogrt item times in your active sequence.
Mogrt items are listed with text field values.
The timestamp list is presented on the extension panel as a clickable list to quickly jump to locations.
The timestamp list is exported to a timestamp text file in your project directory in YouTube timestamp format, for easy copy+paste into a YouTube video description to provide clickable timestamp links for your video.

## Other uses
While the original intent of TimeStamper was to help you generate YouTube timestamp listings, it can also be useful in helping you check your sequences for problems,
by allowing you to generate a list of incidents where certain things are happening (special fx, non-100% zoom scale, graphics, etc.) and then letting you easily jump to (or select) these items for previewing.

## What Adobe host apps this sample supports
- Premier Pro

## How to install
### Move the `TimeStamper` folder to the extension folder
Note that the extension folder location is different depending on which OS you use. 
On Windows the directory is C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
See [CEP Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_8.x/Documentation/CEP%208.0%20HTML%20Extension%20Cookbook.md#extension-folders) for more details
See [AEScripts Guide](https://aescripts.com/knowledgebase/index/view/faq/zxp-installer-faq/) for more details

## Requirements
IMPORTANT NOTE: All of these extensions make use of my shared helper extension, com.dc.jrlib, listed above -- so you NEED to install that in addition to whatever of my extensions you install.

## How to use
Open the TimeStamper extension panel from the Adobe Premiere menu "Windows->Extensions".
Open your sequence in the timeline view.
Press the "Extract" button.
TimeStamps will be listed in the extension panel and saved to a .txt file in your project directory (which should be opened automatically after extraction).
Hovering the mouser over an option will provide some extra information.

## More information
For support contact mouser@donationcoder.com
See https://www.donationcoder.com/forum/index.php?topic=51718.0