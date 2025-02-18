// Windows.js
// Holds window related classes and methods, controls window rendering and 

// REFERENCES

const WindowLayer = document.querySelector(".windowlayer");

// VALUES

let highestWindowZIndex = 0;

// CLASSES

class WindowType {
    static Window = 0;
    static Menu = 1;
}

class WindowList {
    static windows = {};

    static #focusedWindow;
    static mousedOverWindow;

    static get length() {
        return Object.entries(this.windows).length;
    }

    static forEach(callback) {
        Object.entries(this.windows).forEach(callback)
    }

    static getWindowFromId(id) {
        return this.windows[id];

        // return this.windows.filter((window) => {
        // 	return window.id == id;
        // })?.[0];
    }

    static registerWindow(windowClass) {
        if (!windowClass) return;

        if (!this.getWindowFromId(windowClass.id)) {
            this.windows[windowClass.id] = windowClass;
        }

        rerenderWindows();

        this.focusWindow(windowClass);

        dispatchEvent(new CustomEvent("windowregistered", {
            detail: { window: windowClass }
        }));
    }

    static deregisterWindow(windowClass) {
        if (!windowClass) return;

        if (this.getWindowFromId(windowClass.id)) {
            delete this.windows[windowClass.id];
        }

        rerenderWindows();

        dispatchEvent(new CustomEvent("windowderegistered", {
            detail: { window: windowClass }
        }));
    }

    static getFocusedWindow() {
        return this.#focusedWindow;
    }

    static focusWindow(windowClass) {
        this.#focusedWindow = windowClass;

        windowClass.zindex = highestWindowZIndex + 100;
        highestWindowZIndex = windowClass.zindex;

        if (windowClass.minimized) {
            windowClass.unminimize();
        }

        this.unfocusAllWindowsExcept(windowClass);

        dispatchEvent(new CustomEvent("windowfocuschanged", {
            detail: { window: windowClass }
        }))
    }

    static unfocusWindow(windowClass) {
        if (this.#focusedWindow == windowClass) {
            this.#focusedWindow = undefined;
        }

        dispatchEvent(new CustomEvent("windowfocuschanged", {
            detail: { window: windowClass }
        }))
    }

    static unfocusAllWindowsExcept(outlier) {
        this.forEach(([_, window]) => {
            if (window != outlier) {
                this.unfocusWindow(window);
            }
        })
    }
}

class WindowClass {
    title = "";
    body = "";
    icon = "";

    type = WindowType.Window;
    id = undefined;

    width = 300;
    height = 250;

    x = WindowList.length * 8;
    y = WindowList.length * 8;

    minimized = false;
    maximized = false;

    handler = undefined;
    parent = undefined;

    menuBarItems = [];
    cleanupTasks = [];

    list = WindowList;

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
                <div class="window hidden" id="${this.id}">
                    <div class="topbar" id="section_titlebar">
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
                    <div class="body">${this.body}</div>
                </div>
            `;
        } else if (this.type == WindowType.Menu) {
            return `
                <div class="window hidden" id="${this.id}">
                    <div class="body">${this.body}</div>
                </div>
            `
        }
    }

    getParentElementsRecursive() {
        if (this.parent) {
            const parentClass = WindowList.getWindowFromId(this.parent.id);
            if (parentClass) {
                return [
                    ...parentClass.getParentElementsRecursive(),
                    this.parent
                ]
            } else {
                return [
                    this.parent
                ]
            }
        }

        return [];
    }

    register() {
        WindowList.registerWindow(this);
    }

    getElementIfExists() {
        return WindowLayer.querySelector(`#${this.id}`)
    }

    rerenderThisWindow(thisWindowElement) {
        if (!thisWindowElement) { thisWindowElement = this.getElementIfExists() };
        if (!thisWindowElement) return;
        // data-w-width="${
        // 	this.width
        // }" data-w-height="${this.height}" data-w-posx="${
        // 	this.x
        // }" data-w-posx="${this.y}"

        thisWindowElement.style.setProperty("--width", this.width + "px");
        thisWindowElement.style.setProperty("--height", this.height + "px");

        if (this.type == WindowType.Window || !this.parent) {
            thisWindowElement.style.setProperty("--x", this.x + "px");
            thisWindowElement.style.setProperty("--y", this.y + "px");
        } else if (this.type == WindowType.Menu) {
            const [poffx, poffy] = getElementPositionRecursive(this.parent);
            console.log(poffx, poffy)

            thisWindowElement.style.setProperty("--x", `${this.parent.clientWidth + poffx}px`);
            thisWindowElement.style.setProperty("--y", `${poffy}px`);
        }

        thisWindowElement.style.setProperty("z-index", this.type == WindowType.Window ? this.zindex : 1000000);
        thisWindowElement.setAttribute("data-type", this.type);

        if (this.type == WindowType.Window) {
            thisWindowElement.querySelector(".title").innerHTML = `
                ${this.icon ? `<img src="${this.icon}" />` : ""}
                                <p>${this.title}</p>
            `;
        }

        if (WindowList.getFocusedWindow() === this) {
            thisWindowElement.setAttribute("data-focused", "");
        } else {
            thisWindowElement.removeAttribute("data-focused");
        }

        if (this.maximized) {
            thisWindowElement.setAttribute("data-maximized", "");
        } else {
            thisWindowElement.removeAttribute("data-maximized");
        }
    }

    addCleanupTask(taskType, value) {
        this.cleanupTasks.push([taskType, value]);
    }

    destroy() {
        WindowList.deregisterWindow(this);

        this.cleanupTasks.forEach(([type, value]) => {
            if (type == "interval" || typeof value === "number") {
                clearInterval(value);
            } else if (type == "function" || typeof value == "function") {
                value();
            }
        })
    }

    isRegistered() {
        return WindowList.getWindowFromId(this.id);
    }

    minimize() {
        this.minimized = true;

        this.unfocus();
        rerenderWindows();
    }

    unminimize() {
        this.minimized = false;
        rerenderWindows();
    }

    maximize() {
        this.maximized = true;
    }

    unmaximize() {
        this.maximized = false;
    }

    focus() {
        WindowList.focusWindow(this);
    }

    unfocus() {
        WindowList.unfocusWindow(this);
    }
}

// FUNCTIONS

function getWindowWithMouseContact() {
    return mouseContactedElement;
}

function getElementPositionRecursive(element) {
    if (element.offsetParent) {
        const [pOffsetX, pOffsetY] = getElementPositionRecursive(element.offsetParent);

        return [element.offsetLeft + pOffsetX, element.offsetTop + pOffsetY];
    } else {
        return [element.offsetLeft, element.offsetTop];
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

    WindowList.forEach(([id, window]) => {
        if (!window || !id) {
            return;
        }

        if (!window.getElementIfExists() && !window.minimized) {
            let containerDiv = document.createElement("div");
            WindowLayer.append(containerDiv);
            containerDiv.outerHTML = window.render();

            containerDiv = WindowLayer.querySelector(`#${id}`);

            const windowHandler = document.createElement("script");
            windowHandler.setAttribute("src", "./js/window_handler.js");

            containerDiv.append(windowHandler);
        }
    });

    dispatchEvent(new CustomEvent("windowsrerendered"));
}

function getWindowFromMouseEvent(e) {
    const windows = Object.entries(WindowList.windows);

    for (let i = 0; i < windows.length; i++) {
        const [_, window] = windows[i];

        const element = window.getElementIfExists();
        if (!element) continue;

        if (element.contains(e.target)) return window;
    }
}

function handleDocumentClick(e) {
    const clickedWindow = getWindowFromMouseEvent(e);

    clickedWindow?.focus();
}

function showMenu(menuConfig, parent) {
    // console.log(menuConfig);

    const newMenu = new WindowClass({
        ...menuConfig,

        type: WindowType.Menu,
        parent: parent ?? undefined,
    })

    newMenu.register();
}

// INIT

rerenderWindows();
document.addEventListener("mousedown", handleDocumentClick);