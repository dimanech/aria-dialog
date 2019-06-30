# aria-dialog

WAI ARIA AAA compatible dialogs/modal/alert windows implementation. That could be used to create offcanvas panels, alers, dialogs and modal windows.

Please see full specifications at:

* https://www.w3.org/TR/wai-aria-practices/#dialog_modal
* https://www.w3.org/TR/wai-aria-practices/#alertdialog

## Initialization

You could initialize this component in this way:

```js
import DialogManager from 'aria-dialog';
window.dialogManager = new DialogManager();

dialogManager.openDialog('controlledModalId', triggerButton);
```
