// Initialization

window.dialogManager = new DialogManager();

document.querySelectorAll('[data-js-open-dialog]').forEach(button => {
	const controlledModalId = button.getAttribute('data-js-open-dialog');
	if (controlledModalId === null) {
		return;
	}

	const openModal = () => {
		dialogManager.openDialog(controlledModalId, button);
	};

	button.addEventListener('click', openModal)
});

// Make bootstrap basic compatibility

document.querySelectorAll('[data-toggle="modal"]').forEach(button => {
	const controlledModalId = button.getAttribute('data-target');
	if (controlledModalId === null) {
		return;
	}

	const openModal = () => {
		dialogManager.openDialog(controlledModalId, button)
	};

	button.addEventListener('click', openModal)
});
