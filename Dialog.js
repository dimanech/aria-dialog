/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*   Please see full specifications at
*   https://www.w3.org/TR/wai-aria-practices/examples/dialog-modal/dialog.html
*/

class Dialog {
	constructor(dialogManager, dialogId, focusAfterClosed, focusAfterOpen) {
		this.focusFirstDescendant = FocusUtils.focusFirstDescendant;
		this.focusLastDescendant = FocusUtils.focusLastDescendant;

		this.dialogManager = dialogManager;
		this.dialogNode = document.getElementById(dialogId);
		this.focusAfterClosed = Dialog.setFocusAfterClose(focusAfterClosed);
		this.focusFirst = Dialog.setFocusFirst(focusAfterOpen);
		this.isForceChoice = this.dialogNode.getAttribute('data-isForceChoice') || false; // allow close only by choice
		this.backdropNode = null;

		this.createBackdrop();

		this.focusTrap = this.focusTrap.bind(this);
	}

	open() {
		this.createFocusTrap(this.dialogNode);
		this.addListeners();
		this.dialogNode.classList.add('is-open');

		if (this.focusFirst) {
			this.focusFirst.focus();
		} else {
			this.focusFirstDescendant(this.dialogNode);
		}
		this.lastFocus = document.activeElement;

		// TODO: should be handled on implementation
		this.dialogNode.querySelectorAll('form').forEach(form =>
			form.addEventListener('submit', (event) => {
				event.preventDefault()
			})
		)
	}

	close() {
		this.removeListeners();
		this.removeFocusTrap();
		this.dialogNode.classList.remove('is-open');
		this.removeBackdrop();
		this.focusAfterClosed.focus();
	};

	addListeners() {
		document.addEventListener('focus', this.focusTrap, true);
	};

	removeListeners() {
		document.removeEventListener('focus', this.focusTrap, true);
	};

	focusTrap(event) {
		if (this.dialogManager.ignoreFocusChange) {
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

	createFocusTrap(dialogNode) {
		// Enclose the dialog node with two invisible, focusable nodes.
		// While this dialog is open, we use these to make sure that focus never
		// leaves the document even if dialogNode is the first or last node.

		const preDiv = document.createElement('div');
		this.boundFocusNodeStart = dialogNode.parentNode.insertBefore(preDiv, dialogNode);
		this.boundFocusNodeStart.tabIndex = 0;

		const postDiv = document.createElement('div');
		this.boundFocusNodeEnd = dialogNode.parentNode.insertBefore(postDiv, dialogNode.nextSibling);
		this.boundFocusNodeEnd.tabIndex = 0;
	}

	removeFocusTrap() {
		this.boundFocusNodeStart.parentNode.removeChild(this.boundFocusNodeStart);
		this.boundFocusNodeEnd.parentNode.removeChild(this.boundFocusNodeEnd);
	}

	createBackdrop() {
		// Wrap modal in an individual backdrop element if one doesn't exist
		// this approach mimic native dialog implementation with `::backdrop` pseudo-element
		// and help handle several dialogs on top of each other
		const backdropClass = 'dialog-backdrop';

		if (this.dialogNode.parentNode && this.dialogNode.parentNode.classList.contains(backdropClass)) {
			this.backdropNode = this.dialogNode.parentNode;
		} else {
			this.backdropNode = document.createElement('div');
			this.backdropNode.className = backdropClass;
			this.dialogNode.parentNode.insertBefore(this.backdropNode, this.dialogNode);
			this.backdropNode.appendChild(this.dialogNode);

			if (!this.isForceChoice) {
				this.handleClickOnBackdrop();
			}
		}

		this.backdropNode.classList.add('is-active');
	}

	removeBackdrop() {
		this.backdropNode.classList.remove('is-active');
	}

	handleClickOnBackdrop() {
		const handleClose = (event) => {
			if (event.target !== this.backdropNode) {
				return;
			}

			this.dialogManager.closeDialog()
		};
		this.backdropNode.addEventListener('click', handleClose);
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
	};
}
