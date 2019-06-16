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
		if (event.keyCode === this.keyCode.ESC && this._closeCurrentDialog()) {
			event.stopPropagation();
		}
	}

	_handleClose(event) {
		if (event.target.getAttribute('data-js-close') !== null && this.closeDialog()) {
			event.stopPropagation();
		}
	}

	openDialog(dialogId, focusAfterClose, focusAfterOpen) {
		document.body.classList.add('has-dialog');
		DialogManager.validateStructure(dialogId);

		if (this.openDialogsStack.length > 0) { // If we open dialog was over the last one, remove its listeners
			this._getCurrentDialog().removeListeners();
			this._getCurrentDialog().backdropNode.classList.remove('is-last-dialog');
		}

		const dialog = new Dialog(this, dialogId, focusAfterClose, focusAfterOpen);
		dialog.open();
		dialog.backdropNode.classList.add('is-last-dialog');
		this.openDialogsStack.push(dialog);
	};

	closeDialog() {
		this._getCurrentDialog().close();
		this._getCurrentDialog().backdropNode.classList.add('is-last-dialog');
		this.openDialogsStack.pop();

		if (this.openDialogsStack.length > 0) { // If a dialog was open underneath the last one, restore its listeners
			this._getCurrentDialog().addListeners();
			this._getCurrentDialog().backdropNode.classList.add('is-last-dialog');
		} else {
			document.body.classList.remove('has-dialog');
		}
	};

	replaceDialog(newDialogId, newFocusAfterClosed, newFocusFirst) {
		const topDialog = this._getCurrentDialog();
		if (!topDialog.dialogNode.contains(document.activeElement)) {
			return;
		}

		const focusAfterClosed = newFocusAfterClosed || topDialog.focusAfterClosed;
		topDialog.backdropNode.classList.remove('is-last-dialog');
		topDialog.close();
		this.openDialogsStack.pop();
		this.openDialog(newDialogId, focusAfterClosed, newFocusFirst);
	};

	_getCurrentDialog() {
		if (this.openDialogsStack.length) {
			return this.openDialogsStack[this.openDialogsStack.length - 1];
		}
	}

	_closeCurrentDialog() {
		const currentDialog = this._getCurrentDialog();
		if (currentDialog && !currentDialog.isForceChoice) {
			currentDialog.close();
			this.openDialogsStack.pop();
			return true;
		}

		return false;
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
