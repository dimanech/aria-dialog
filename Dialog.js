/*
*   DIALOG / ALERT DIALOG
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*   Please see full specifications at:
*   https://www.w3.org/TR/wai-aria-practices/examples/dialog-modal/dialog.html
*   https://www.w3.org/TR/wai-aria-practices/#alertdialog
*/

class Dialog {
	constructor(dialogManager, dialogId, focusAfterClosed, focusAfterOpen) {
		this.focusFirstDescendant = FocusUtils.focusFirstDescendant;
		this.focusLastDescendant = FocusUtils.focusLastDescendant;
		this.searchingFocusedElement = FocusUtils.searchingFocusedElement;

		this.dialogManager = dialogManager;
		this.dialogNode = document.getElementById(dialogId);
		this.focusAfterClosed = Dialog.setFocusAfterClose(focusAfterClosed);
		this.focusAfterOpen = Dialog.setFocusFirst(focusAfterOpen);
		this.isForcedToChoice = this.dialogNode.getAttribute('data-isForcedToChoice') || false; // allow close only by choice
		this.backdropNode = null;

		this.focusTrap = this.focusTrap.bind(this);
		this.handleClickOnBackdrop = this.handleClickOnBackdrop.bind(this);
	}

	open() {
		this.createBackdrop();
		this.createFocusTrap();
		this.addListeners();

		this.dialogNode.classList.add('is-open');
		this.dialogNode.setAttribute('aria-hidden', 'false');

		// handle animation/transition delay that could temporary modify a11y tree
		setTimeout(() => this.focusElementAfterOpen(), 50);

		this.afterOpen();
	}

	afterOpen() {
		// TODO: should be handled on implementation
		this.dialogNode.querySelectorAll('form').forEach(form =>
			form.addEventListener('submit', (event) => {
				event.preventDefault()
			})
		)
	}

	close() {
		this.beforeClose();
		this.dialogNode.setAttribute('aria-hidden', 'true');
		this.dialogNode.classList.remove('is-open');
		this.backdropNode.classList.remove('is-active');
		this.removeListeners();
		this.removeFocusTrap();
		this.removeBackdrop();
		this.focusElementAfterClose();
	}

	beforeClose() {}

	addListeners() {
		document.addEventListener('focus', this.focusTrap, true);
	}

	removeListeners() {
		document.removeEventListener('focus', this.focusTrap, true);
	}

	focusElementAfterOpen() {
		this.focusAfterOpen ? this.focusAfterOpen.focus() : this.focusFirstDescendant(this.dialogNode);
		this.lastFocus = document.activeElement;
	}

	focusElementAfterClose() {
		this.focusAfterClosed.focus();
	}

	focusTrap(event) {
		if (this.searchingFocusedElement) {
			return;
		}
		switch (true) {
			case (event.target === this.boundFocusNodeStart):
				this.focusLastDescendant(this.dialogNode);
				this.lastFocus = document.activeElement;
				break;
			case (event.target === this.boundFocusNodeEnd):
				this.focusFirstDescendant(this.dialogNode);
				this.lastFocus = document.activeElement;
				break;
			default: // currentDialog.dialogNode.contains(event.target)
				this.lastFocus = event.target;
		}
	}

	createFocusTrap() {
		// Enclose the dialog node with two invisible, focusable nodes.
		// While this dialog is open, we use these to make sure that focus never
		// leaves the document even if dialogNode is the first or last node.

		const start = document.createElement('div');
		start.tabIndex = 0;
		this.backdropNode.insertBefore(start, this.dialogNode);
		this.boundFocusNodeStart = start;

		const end = document.createElement('div');
		end.tabIndex = 0;
		this.backdropNode.insertBefore(end, this.dialogNode.nextSibling);
		this.boundFocusNodeEnd = end;
	}

	removeFocusTrap() {
		this.backdropNode.removeChild(this.boundFocusNodeStart);
		this.backdropNode.removeChild(this.boundFocusNodeEnd);
	}

	createBackdrop() {
		if (!this.backdropNode) {
			this.backdropNode = this.dialogNode.parentNode;
			this.backdropNode.addEventListener('click', this.handleClickOnBackdrop);
		}

		this.backdropNode.classList.add('is-active');
	}

	removeBackdrop() {
		this.backdropNode.classList.remove('is-active');
		this.backdropNode.removeEventListener('click', this.handleClickOnBackdrop);
	}

	handleClickOnBackdrop(event) {
		if (event.target !== this.backdropNode) {
			return;
		}

		this.dialogManager._closeDialogFromOutside();
	}

	static setFocusFirst(focusFirst) {
		let focusElement;
		if (typeof focusFirst === 'string') {
			focusElement = document.getElementById(focusFirst);
		} else if (typeof focusFirst === 'object') {
			focusElement = focusFirst;
		} else {
			focusElement = null;
		}

		return focusElement;
	}

	static setFocusAfterClose(focusAfterClosed) {
		let focusElement;
		if (typeof focusAfterClosed === 'string') {
			focusElement = document.getElementById(focusAfterClosed);
		} else if (typeof focusAfterClosed === 'object') {
			focusElement = focusAfterClosed;
		} else {
			throw new Error('the focusAfterClosed parameter is required for the aria.Dialog constructor.');
		}

		return focusElement;
	}

	static clearDialogForm(dialog) {
		Array.prototype.map.call(
				dialog.querySelectorAll('input'),
				function (input) {
					input.value = '';
				}
		);
	}
}
