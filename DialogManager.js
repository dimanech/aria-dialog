class DialogManager {
	constructor() {
		this.keyCode = Object.freeze({
			ESC: 27
		});

		this.dialogsStack = [];

		this.handleEscape = this._handleEscape.bind(this);
		this.handleClose = this._handleCloseButton.bind(this);
	}

	openDialog(dialogId, focusAfterClose, focusAfterOpen) {
		DialogManager.validateDialogStructure(dialogId);

		if (this.dialogsStack.length > 0) { // If we open dialog over the last one
			this._bringCurrentDialogDown();
		} else {
			document.body.classList.add('has-dialog');
			this._addEventListeners();
		}

		const dialog = new Dialog(this, dialogId, focusAfterClose, focusAfterOpen);
		dialog.create();
		dialog.backdropNode.classList.add('is-top-dialog');
		this.dialogsStack.push(dialog);
	};

	closeDialog() {
		const currentDialog = this._getCurrentDialog();
		if (!currentDialog) {
			return false;
		}

		this._destroyCurrentDialog();

		if (this.dialogsStack.length > 0) {
			this._bringCurrentDialogToTop(); // after destroy previous one is currentDialog
		} else {
			document.body.classList.remove('has-dialog');
			this._removeEventListeners();
		}

		return true;
	}

	replaceDialog(newDialogId, newFocusAfterClosed, newFocusFirst) {
		const topDialog = this._getCurrentDialog();
		const focusAfterClosed = newFocusAfterClosed || topDialog.focusAfterClose;

		this._destroyCurrentDialog();
		this.openDialog(newDialogId, focusAfterClosed, newFocusFirst);
	};

	_addEventListeners() {
		document.addEventListener('keyup', this.handleEscape);
		document.addEventListener('click', this.handleClose);
	}

	_removeEventListeners() {
		document.removeEventListener('keyup', this.handleEscape);
		document.removeEventListener('click', this.handleClose);
	}

	_handleEscape(event) {
		if (event.keyCode === this.keyCode.ESC && this._closeDialogFromOutside()) {
			event.stopPropagation();
		}
	}

	_handleCloseButton(event) {
		if (event.target.getAttribute('data-dismiss') !== null && this._closeDialogFromOutside()) {
			event.stopPropagation();
		}
	}

	_bringCurrentDialogToTop () {
		const prevDialog = this._getCurrentDialog();
		prevDialog.bringOnTop();
		prevDialog.backdropNode.classList.add('is-top-dialog');
	}

	_bringCurrentDialogDown () {
		const prevDialog = this._getCurrentDialog();
		prevDialog.bringDown();
		prevDialog.backdropNode.classList.remove('is-top-dialog')
	}

	_destroyCurrentDialog() {
		const currentDialog = this._getCurrentDialog();
		currentDialog.backdropNode.classList.remove('is-top-dialog');
		currentDialog.destroy();
		this.dialogsStack.pop();
	}

	_closeDialogFromOutside() {
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

	_getCurrentDialog() {
		if (this.dialogsStack.length) {
			return this.dialogsStack[this.dialogsStack.length - 1];
		}
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

	static validateDialogStructure(dialogId) {
		if (dialogId === null || document.getElementById(dialogId) === null) {
			throw new Error(`No element found with id="${dialogId}".`);
		}

		const validRoles = ['dialog', 'alertdialog'];
		const isDialog = (document.getElementById(dialogId).getAttribute('role') || '')
				.trim()
				.split(/\s+/g)
				.some(token => validRoles.some((role) => {
					return token === role;
				}));
		if (!isDialog) {
			throw new Error('Dialog() requires a DOM element with ARIA role of "dialog" or "alertdialog".');
		}
	}
}
