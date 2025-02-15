(() => {
	// SCRIPT CONSTANTS

	const thisWindowElement = document.currentScript.parentElement;
	const thisWindowClass = WindowList.getWindowFromId(thisWindowElement.id);

	// REFERENCES

	const WindowTitleBar = thisWindowElement.querySelector("#section_titlebar")

	const WindowCloseButton = thisWindowElement.querySelector("#btn_close");
	const WindowMaximizeButton = thisWindowElement.querySelector("#btn_maximize");
	const WindowMinimizeButton = thisWindowElement.querySelector("#btn_minimize");

	// VALUES

	let dragging = false;

	let dragStartX = 0;
	let dragStartY = 0;

	let totalDragMovementX = 0;
	let totalDragMovementY = 0;

	let hasMoved = false;

	// HANDLERS

	function handleCloseButton() {
		thisWindowClass.destroy();
	}

	function handleMinimizeButton() {
		thisWindowClass.minimize();
	}

	function handleWindowDragStart(e) {
		if (dragging) return;
		// console.log(e);

		dragStartX = e.clientX - e.layerX;
		dragStartY = e.clientY - e.layerY;

		totalDragMovementX = 0;
		totalDragMovementY = 0;

		dragging = true;
		hasMoved = false;

		document.addEventListener("mousemove", handleWindowDragStep);
	}

	function handleWindowDragStep(e) {
		totalDragMovementX += e.movementX;
		totalDragMovementY += e.movementY;

		if (hasMoved || Math.sqrt(totalDragMovementX ** 2 + totalDragMovementY ** 2) > 32) {
			if (thisWindowClass.maximized) {
				thisWindowClass.unmaximize();

				dragStartX = e.clientX - thisWindowClass.width;
				dragStartY = e.clientY - e.layerY * 2;
			}

			hasMoved = true;

			thisWindowClass.x = dragStartX + totalDragMovementX;
			thisWindowClass.y = dragStartY + totalDragMovementY;
		}
	}

	function handleWindowDragStop() {
		if (!dragging) return;

		dragStartX = undefined;
		dragStartY = undefined;

		totalDragMovementX = undefined;
		totalDragMovementY = undefined;

		dragging = false;
		document.removeEventListener("mousemove", handleWindowDragStep);
	}

	function handleMaximizeButton() {
		if (thisWindowClass.maximized) {
			thisWindowClass.unmaximize();
		} else {
			thisWindowClass.maximize();
		}
	}

	// INIT

	thisWindowClass.addCleanupTask(
		"interval",
		setInterval(() => {
			thisWindowClass.rerenderThisWindow(thisWindowElement)
		}, 1000 / 60)
	);
	thisWindowClass.rerenderThisWindow(thisWindowElement);

	// Register drag callbacks

	WindowTitleBar.addEventListener("mousedown", handleWindowDragStart);
	document.addEventListener("mouseup", handleWindowDragStop);

	// Register button callbacks

	WindowCloseButton?.addEventListener("click", handleCloseButton);
	WindowMinimizeButton?.addEventListener("click", handleMinimizeButton)
	WindowMaximizeButton?.addEventListener("click", handleMaximizeButton)

	// Try to run window handler

	try {
		thisWindowClass?.handler?.(thisWindowClass, thisWindowElement)
	} catch (err) {
		console.warn(err);
	}

	// Make the window visible

	thisWindowElement.classList.remove("hidden");
})();
