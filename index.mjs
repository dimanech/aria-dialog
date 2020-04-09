import DialogManager from './DialogManager.js';
import DialogButton from './DialogButton.js';

const dialogManager = new DialogManager().init();

document.querySelectorAll('[data-component="DialogButton"]')
	.forEach(item => new DialogButton(item, dialogManager).init());
