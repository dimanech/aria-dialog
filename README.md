# aria-dialog

WAI ARIA AAA compliance implementation of dialogs/modal/alert windows. 

This class could be used to create offcanvas panels, alerts, dialogs and modal windows. 
It handles multiple stacked modal window/panels with overlaying or replacing previous dialog 
and proper focus chain between all modals and root page.

This module designed as library that could be used as starting point on the project. It is not
"just add the water" ready made component.

## Specs

Please see full specifications at:

* https://www.w3.org/TR/wai-aria-practices/#dialog_modal
* https://www.w3.org/TR/wai-aria-practices/#alertdialog

## Supporting browsers

* IE10 (with Babel + DOM Collections forEach)
* Edge 44.18362.1.0
* Chrome 75.0.3770.100
* Safari 12.1.1
* Firefox 67.0.4


* Windows Narrator with MS Edge
* MacOS VoiceOver Utiltiy (v9 562.858) with Safari, Google Chrome
* Gnome Orca Screen Reader 3.32 with Firefox (Gecko) and Epiphany (WebKitGtk)

### Known issues

* Windows Narrator with MS Edge and Orca with Epiphany not announce alert content in "force modal" dialog 

## API

### DialogManager

Control the dialog stack. All dialogs manipulations should be through the magager.

#### DialogManager.openDialog(dialogId, focusAfterClose, focusAfterOpen)

Create new dialog

* `dialogId` `String` - Mandatory. The id of dialog
* `focusAfterClose` `String|Object` - Mandatory. The id of element that should be focused after dialog is closed. As usual this is dialog trigger button.
* `focusAfterOpen` `String|Object` - Optional. The id of element that should be focused inside the new dialog. If not provided the first focusable element will be selected.

#### DialogManager.replaceDialog(dialogId, focusAfterClose, focusAfterOpen)

Replace current top dialog with new dialog. Accept same options as `openDialog`

#### DialogManager.closeDialog()

Close top dialog

#### DialogManager.closeDialogFromOutside()

Create to bind close function and check is dialog closable from outside or force user to make a choice from one of options

## Usage

You could initialize this component in this way:

```js
import DialogManager from 'aria-dialog';

window.dialogManager = new DialogManager();

document.querySelectorAll('[data-trigger="modal"]').forEach(button => 
	button.addEventListener('click', dialogManager.openDialog('controlledModalId', button)));

document.querySelectorAll('[data-dismiss="modal"]').forEach(button => 
	button.addEventListener('click', dialogManager.closeDialog()));
```

```html
<button data-trigger="modal">Open dialog</button>

Alternativlly:
<button onclick="dialogManager.openDialog('dialog-2', this, 'dialog2_para1')">Close</button>
<button onclick="dialogManager.closeDialog()">Close</button>
```

## License

This software or document includes material copied from or derived from
https://www.w3.org/TR/wai-aria-practices/examples/dialog-modal/dialog.html.
Copyright ©2019 W3C® (MIT, ERCIM, Keio, Beihang).

All Rights Reserved. This work is distributed under the
W3C® Software License http://www.w3.org/Consortium/Legal/copyright-software
in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.

Copyright © 2019, D. Nechepurenko. Published under MIT license.
