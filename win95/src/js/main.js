// REFERENCES

const StartButton = document.querySelector("#btn_start");
const StartMenu = document.querySelector("#menu_start");

const WindowLayer = document.querySelector(".windowlayer");

// VALUES

const WindowType = {
	Window: 1,
	Menu: 2,
};

// CLASSES

class WindowList {
	static windows = [];

	static getWindowFromId(id) {
		return this.windows.filter((window) => {
			return window.id == id;
		})?.[0];
	}

	static registerWindow(windowClass) {
		if (!windowClass) return;

		if (!this.getWindowFromId(windowClass.id)) {
			this.windows.push(windowClass);
		}

		rerenderWindows();
	}

	static deregisterWindow(windowClass) {
		if (!windowClass) return;

		if (this.getWindowFromId(windowClass.id)) {
			this.windows.splice(this.windows.indexOf(windowClass));
		}

		rerenderWindows();
	}
}

class WindowClass {
	title = "";
	body = "";
	icon = "";

	type = WindowType.Window;
	id = undefined;

	width = "";
	height = "";

	x = "";
	y = "";

	minimized = false;

	menuBarItems = [];

	constructor(props) {
		this.id = "WINDOW-" + crypto.randomUUID();

		Object.entries(props).forEach(([key, value]) => {
			this[key] = value;
		});
	}

	render() {
		if (this.minimized) {
			return "";
		}
		if (this.type == WindowType.Window) {
			return `
                <div class="window" id="${this.id}" data-w-width="${
				this.width
			}" data-w-height="${this.height}" data-w-posx="${
				this.x
			}" data-w-posx="${this.y}">
                    <div class="topbar">
                        <div class="title">
                            ${this.icon ? `<img src="${this.icon}" />` : ""}
                            <p>${this.title}</p>
                        </div>
                        <div class="controls">
                            <button id="btn_minimize">_</button>
                            <button id="btn_maximize">□</button>
                            <button id="btn_close">x</button>
                        </div>
                    </div>
                    <div class="controlbar">
                        <button class="controlitem">File</button>
                        <button class="controlitem">Edit</button>
                        <button class="controlitem">Search</button>
                    </div>
                    <div class="body">${this.body}</div>
                </div>
            `;
		} else if (this.type == WindowType.Menu) {
		}
	}

	register() {
		WindowList.registerWindow(this);
	}

	destroy() {
		WindowList.deregisterWindow(this);
	}

	isRegistered() {
		return WindowList.getWindowFromId(this.id);
	}

	isRendered() {
		return WindowLayer.querySelector(`#${this.id}`);
	}

	minimize() {
		this.minimized = true;
		rerenderWindows();
	}

	unminimize() {
		this.minimized = false;
		rerenderWindows();
	}
}

// HANDLERS

function handleStartButtonClicked() {
	StartMenu.classList.toggle("hidden");

	if (StartMenu.classList.contains("hidden")) {
		StartButton.classList.remove("pressed");
	} else {
		StartButton.classList.add("pressed");
	}
}

function rerenderWindows() {
	const renderedWindows = WindowLayer.children;

	for (let i = 0; i < renderedWindows.length; i++) {
		const window = renderedWindows.item(i);

		if (window) {
			const windowClass = WindowList.getWindowFromId(window.id);
			if (!windowClass || windowClass.minimized) {
				window.remove();
			}
		}
	}

	WindowList.windows.forEach((window) => {
		if (!window.isRendered() && !window.minimized) {
			let containerDiv = document.createElement("div");
			WindowLayer.append(containerDiv);
			containerDiv.outerHTML = window.render();

			containerDiv = WindowLayer.querySelector(`#${window.id}`);

			const windowHandler = document.createElement("script");
			windowHandler.setAttribute("src", "./js/window_handler.js");

			containerDiv.append(windowHandler);
		}
	});
}

// INIT
StartButton.addEventListener("click", handleStartButtonClicked);
document.querySelector("#btn_start_pages")?.addEventListener("click", () => {
	const newWindow = new WindowClass({
		body: "Hiii!",
		title: "This is a window!",
		type: WindowType.Window,
	});

	newWindow.register();
});
