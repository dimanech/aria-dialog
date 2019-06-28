# ARIA Dialog

WAI ARIA AAA compatible dialogs/modal/alert windows implementation.

Please see full specifications at:

* https://www.w3.org/TR/wai-aria-practices/examples/dialog-modal/dialog.html
* https://www.w3.org/TR/wai-aria-practices/#alertdialog

## Initialization

You could initialize this component in this way:

```js
import DialogManager from './DialogManager.js';
window.dialogManager = new DialogManager();

dialogManager.openDialog('controlledModalId', triggerButton);
```
