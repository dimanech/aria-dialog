import FocusUtils from './FocusUtils.mjs';

export default class Dialog {
	/*
	* Dialog / Alert dialog / Modal window / Modal panel
	*
	* Please see full specifications at:
	* https://www.w3.org/TR/wai-aria-practices/#dialog_modal
	* https://www.w3.org/TR/wai-aria-practices/#alertdialog
	*
	* This software or document includes material copied from or derived from
	* https://www.w3.org/TR/wai-aria-practices/examples/dialog-modal/dialog.html.
	* Copyright ©2019 W3C® (MIT, ERCIM, Keio, Beihang).
	* All Rights Reserved. This work is distributed under the
	* W3C® Software License http://www.w3.org/Consortium/Legal/copyright-software
	* in the hope that it will be useful, but WITHOUT ANY WARRANTY;
	* without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
	* PARTICULAR PURPOSE.
	*/
	constructor(dialogManager, dialogId, focusAfterClose, focusAfterOpen) {
		Dialog.validateDialogStructure(dialogId);
		this.dialogManager = dialogManager;
		this.dialogNode = document.getElementById(dialogId);
		this.focusAfterClose = Dialog.setFocusAfterCloseElement(focusAfterClose);
		this.focusAfterOpen = Dialog.setFocusAfterOpenElement(focusAfterOpen);
		this.isForcedToChoice = this.dialogNode.getAttribute(
			'data-isForcedToChoice') || false; // allow close only by choice
		this.backdropNode = null;

		// Additional methods
		this.focusFirstDescendant = FocusUtils.focusFirstDescendant;
		this.focusLastDescendant = FocusUtils.focusLastDescendant;
		this.searchingFocusedElement = FocusUtils.searchingFocusedElement;
	}

	create() {
		this.initBackdrop();
		this.createFocusTrap();
		this.initEventListeners();

		this.dialogNode.classList.add('is-open');
		this.dialogNode.setAttribute('aria-hidden', 'false');

		// handle animation/transition delay that could temporary modify a11y tree
		// focus could not trap into modal if user tab before this timeout
		// please see tab handler
		setTimeout(() => this.focusElementAfterOpen(), 50);

		this.afterOpen();
	}

	destroy() {
		this.beforeClose();

		this.removeEventListeners();
		this.removeFocusTrap();
		this.removeBackdrop();

		this.dialogNode.classList.remove('is-open');
		this.dialogNode.setAttribute('aria-hidden', 'true');

		this.focusElementAfterClose();
	}

	bringDown() {
		this.removeEventListeners();
		this.backdropNode.classList.remove('is-top-dialog');
	}

	bringOnTop() {
		this.initEventListeners();
		this.backdropNode.classList.add('is-top-dialog');
	}

	focusElementAfterOpen() {
		this.focusAfterOpen ? this.focusAfterOpen.focus() : this.focusFirstDescendant(this.dialogNode);
	}

	focusElementAfterClose() {
		this.focusAfterClose.focus();
	}

	initEventListeners() {
		this.handleFocus = this.handleFocus.bind(this);

		document.addEventListener('focus', this.handleFocus, true);
	}

	removeEventListeners() {
		document.removeEventListener('focus', this.handleFocus, true);
	}

	handleFocus(event) {
		if (this.searchingFocusedElement) {
			return;
		}

		switch (true) {
			case (event.target === this.boundFocusNodeStart):
				this.focusLastDescendant(this.dialogNode);
				break;
			case (event.target === this.boundFocusNodeEnd):
				this.focusFirstDescendant(this.dialogNode);
				break;
			case (!this.dialogNode.contains(event.target)):
				this.focusFirstDescendant(this.dialogNode); // in case when window is animated and user tab
				break;
			default:
		}
	}

	createFocusTrap() {
		// Enclose the dialog node with two invisible, focusable nodes.
		// While this dialog is open, we use these to make sure that focus never
		// leaves the document even if dialogNode is the first or last node.
		// This start to work only when some element inside dialog is focused so
		// please see focusElementAfterOpen

		const firstFocusable = document.createElement('div');
		firstFocusable.tabIndex = 0;
		this.backdropNode.insertBefore(firstFocusable, this.dialogNode);
		this.boundFocusNodeStart = firstFocusable;

		const lastFocusable = document.createElement('div');
		lastFocusable.tabIndex = 0;
		this.backdropNode.insertBefore(lastFocusable, this.dialogNode.nextSibling);
		this.boundFocusNodeEnd = lastFocusable;
	}

	removeFocusTrap() {
		this.backdropNode.removeChild(this.boundFocusNodeStart);
		this.backdropNode.removeChild(this.boundFocusNodeEnd);
	}

	initBackdrop() {
		const backdropClass = 'dialog-backdrop';

		let parent = this.dialogNode.parentNode;
		if (parent.classList.contains(backdropClass)) {
			this.backdropNode = parent;
		} else {
			this.encloseModalWithBackdrop(backdropClass);
		}

		this.handleBackdropClick = this.handleBackdropClick.bind(this);
		this.backdropNode.addEventListener('click', this.handleBackdropClick);
		this.backdropNode.classList.add('is-active');
		this.backdropNode.classList.add('is-top-dialog');
	}

	removeBackdrop() {
		this.backdropNode.removeEventListener('click', this.handleBackdropClick);
		this.backdropNode.classList.remove('is-active');
		this.backdropNode.classList.remove('is-top-dialog');
	}

	encloseModalWithBackdrop(backdropClass) {
		this.backdropNode = document.createElement('div');
		this.backdropNode.className = backdropClass;
		this.dialogNode.parentNode.insertBefore(this.backdropNode, this.dialogNode);
		this.backdropNode.appendChild(this.dialogNode);
	}

	handleBackdropClick(event) {
		if (event.target !== this.backdropNode) {
			return;
		}

		this.dialogManager.closeDialogFromOutside();
	}

	afterOpen() {
		// TODO: should be handled on implementation
		this.dialogNode.querySelectorAll('form').forEach(form =>
			form.addEventListener('submit', (event) => {
				event.preventDefault();
			})
		);
	}

	beforeClose() {}

	static setFocusAfterOpenElement(focusFirst) {
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

	static setFocusAfterCloseElement(focusAfterClosed) {
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
