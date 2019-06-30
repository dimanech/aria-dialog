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

* IE10 with babel
* Edge
* Chrome
* Safari
* FF

* MacOS VoiceOver with Safari
* Gnome Orca Screen Reader 3.32 with Firefox (Gecko) and Epiphany (WebKitGtk)

## Usage

You could initialize this component in this way:

```js
import DialogManager from 'aria-dialog';
window.dialogManager = new DialogManager();

document.querySelectorAll('[data-trigger="modal"]').forEach(button => 
	button.addEventListener('click', dialogManager.openDialog('controlledModalId', button)));
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
