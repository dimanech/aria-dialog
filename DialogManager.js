class DialogManager {
	constructor() {
		this.keyCode = Object.freeze({
			ESC: 27
		});

		this.openDialogsStack = [];

		this.handleEscape = this._handleEscape.bind(this);
		this.handleClose = this._handleClose.bind(this);

		this._addEventListeners();
	}

	_addEventListeners() {
		document.addEventListener('keyup', this.handleEscape);
		document.addEventListener('click', this.handleClose);
	}

	_handleEscape(event) {
		if (event.keyCode === this.keyCode.ESC && this._closeDialogFromOutside()) {
			event.stopPropagation();
		}
	}

	_handleClose(event) {
		if (event.target.getAttribute('data-js-close') !== null && this._closeDialogFromOutside()) {
			event.stopPropagation();
		}
	}

	openDialog(dialogId, focusAfterClose, focusAfterOpen) {
		document.body.classList.add('has-dialog');
		DialogManager.validateStructure(dialogId);

		if (this.openDialogsStack.length > 0) { // If we open dialog was over the last one, remove its listeners
			const prevDialog = this._getCurrentDialog();
			prevDialog.removeListeners(); // TODO
			prevDialog.backdropNode.classList.remove('is-top-dialog');
		}

		const dialog = new Dialog(this, dialogId, focusAfterClose, focusAfterOpen);
		dialog.open();
		this.openDialogsStack.push(dialog);
		dialog.backdropNode.classList.add('is-top-dialog');
	};

	closeDialog() {
		const currentDialog = this._getCurrentDialog();
		if (!currentDialog) {
			return false;
		}

		this._popDialog(currentDialog);

		if (this.openDialogsStack.length > 0) { // If a dialog was open underneath the last one, restore its listeners
			const prevDialog = this._getCurrentDialog();
			prevDialog.addListeners(); // TODO
			prevDialog.backdropNode.classList.add('is-top-dialog');
		} else {
			document.body.classList.remove('has-dialog');
		}

		return true;
	}

	replaceDialog(newDialogId, newFocusAfterClosed, newFocusFirst) {
		const topDialog = this._getCurrentDialog();
		const focusAfterClosed = newFocusAfterClosed || topDialog.focusAfterClosed;

		this._popDialog(topDialog);
		this.openDialog(newDialogId, focusAfterClosed, newFocusFirst);
	};

	_popDialog(dialog) {
		dialog.backdropNode.classList.remove('is-top-dialog');
		dialog.close();
		this.openDialogsStack.pop();
	}

	_closeDialogFromOutside() {
		const currentDialog = this._getCurrentDialog();

		if (currentDialog.isForcedToChoice) {
			this._createAlert(currentDialog, 'Please make a choice in modal window');
			return false;
		}

		this.closeDialog();
	}

	_getCurrentDialog() {
		if (this.openDialogsStack.length) {
			return this.openDialogsStack[this.openDialogsStack.length - 1];
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

	static validateStructure(dialogId) {
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
			throw new Error('Dialog() requires a DOM element with ARIA role of dialog or alertdialog.');
		}
	}
}
