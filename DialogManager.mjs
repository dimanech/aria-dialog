import Dialog from './Dialog.mjs';

export default class DialogManager {
	constructor() {
		this.keyCode = Object.freeze({
			ESC: 27
		});

		this.dialogsStack = [];
	}

	openDialog(dialogId, focusAfterClose, focusAfterOpen) {
		if (this.dialogsStack.length > 0) { // If we open dialog over the last one
			this._bringCurrentDialogDown();
		} else { // If this is first opened dialog
			document.body.classList.add('has-dialog');
			this._addEventListeners();
		}

		this._createDialog(dialogId, focusAfterClose, focusAfterOpen);
	}

	closeDialog() {
		const currentDialog = this._getCurrentDialog();
		if (!currentDialog) {
			return false;
		}

		this._destroyCurrentDialog();

		if (this.dialogsStack.length > 0) {
			this._bringCurrentDialogToTop(); // after destroy previous one is currentDialog
		} else { // if this the last opened dialog
			document.body.classList.remove('has-dialog');
			this._removeEventListeners();
		}

		return true;
	}

	closeDialogFromOutside() {
		// This method is designed to close last dialog, but only in case if it not specific button, like
		// close modal button, backdrop click or ESC, that do not know if particular dialog is try to force
		// user to make a choice.
		const currentDialog = this._getCurrentDialog();
		if (!currentDialog) {
			return false;
		}

		if (currentDialog.isForcedToChoice) {
			this._createAlert(currentDialog, 'Please make a choice in modal window');
			return false;
		}

		return this.closeDialog();
	}

	replaceDialog(newDialogId, newFocusAfterClosed, newFocusFirst) {
		const topDialog = this._getCurrentDialog();
		const focusAfterClosed = newFocusAfterClosed || topDialog.focusAfterClose;

		this._destroyCurrentDialog();
		this.openDialog(newDialogId, focusAfterClosed, newFocusFirst);
	}

	_addEventListeners() {
		this.handleEscape = this._handleEscape.bind(this);
		this.handleClose = this._handleCloseButton.bind(this);

		document.addEventListener('keyup', this.handleEscape);
		document.addEventListener('click', this.handleClose);
	}

	_removeEventListeners() {
		document.removeEventListener('keyup', this.handleEscape);
		document.removeEventListener('click', this.handleClose);
	}

	_handleEscape(event) {
		if (event.keyCode === this.keyCode.ESC && this.closeDialogFromOutside()) {
			event.stopPropagation();
		}
	}

	_handleCloseButton(event) {
		if (event.target.getAttribute('data-dismiss') !== null && this.closeDialogFromOutside()) {
			event.stopPropagation();
		}
	}

	_getCurrentDialog() {
		if (this.dialogsStack.length) {
			return this.dialogsStack[this.dialogsStack.length - 1];
		}
	}

	_createDialog(dialogId, focusAfterClose, focusAfterOpen) {
		const dialog = new Dialog(this, dialogId, focusAfterClose, focusAfterOpen);
		dialog.create();
		this.dialogsStack.push(dialog);
	}

	_destroyCurrentDialog() {
		this._getCurrentDialog().destroy();
		this.dialogsStack.pop();
	}

	_bringCurrentDialogToTop() {
		this._getCurrentDialog().bringOnTop();
	}

	_bringCurrentDialogDown() {
		this._getCurrentDialog().bringDown();
	}

	_createAlert(dialog, message) {
		if (!this.alert) {
			this.alert = document.createElement('div');
			this.alert.setAttribute('role', 'alert');
		}

		this.alert.textContent = message;
		dialog.dialogNode.appendChild(this.alert);

		clearTimeout(this.alertTimout);
		this.alertTimout = setTimeout(() => {
			if (this.alert) {
				dialog.dialogNode.removeChild(this.alert);
			}
			this.alert = null;
		}, 1000);
	}
}
