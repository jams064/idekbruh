(() => {
	// SCRIPT CONSTANTS

	const thisWindowElement = document.currentScript.parentElement;
	const thisWindowClass = WindowList.getWindowFromId(thisWindowElement.id);

	// REFERENCES

	const WindowCloseButton = thisWindowElement.querySelector("#btn_close");

	// HANDLERS

	function handleCloseButton() {
		thisWindowClass.destroy();
	}

	function handleMinimizeButton() {
		thisWindowClass.minimize();
	}

	// INIT

	WindowCloseButton?.addEventListener("click", handleCloseButton);
})();
