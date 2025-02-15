// TASKBAR

const Taskbar = document.querySelector(".taskbar");
const StartButton = document.querySelector("#btn_start");
const StartMenu = document.querySelector("#menu_start");
const TaskbarMenu = document.querySelector("#menu_taskbar");

// HANDLERS

function handleStartButtonClicked() {
    StartMenu.classList.toggle("hidden");

    if (StartMenu.classList.contains("hidden")) {
        StartButton.classList.remove("pressed");
    } else {
        StartButton.classList.add("pressed");
    }
}

function getTaskbarItemForWindowId(id) {
    return TaskbarMenu.querySelector(`#${id}`);
}

function createTaskbarItem(windowClass) {
    let container = document.createElement("button");

    container.setAttribute("id", `${windowClass.id}`);
    container.innerHTML = getInnerHtmlForTaskbarItem(windowClass);

    container.addEventListener("mousedown", () => {
        WindowList.focusWindow(windowClass);
    })

    return container;
}

function getInnerHtmlForTaskbarItem(window) {
    return `
        ${window ? `<img src="${window.icon}">` : ""}
        ${window.title}
    `
}

function updateTaskbar(e) {
    const window = e.detail?.window;
    const eventType = e.type;

    if (eventType === "windowregistered") {
        if (!getTaskbarItemForWindowId(window.id)) {
            const taskbarItem = createTaskbarItem(window);

            TaskbarMenu.appendChild(taskbarItem);
        }
    } else if (eventType === "windowderegistered") {
        const taskbarItem = getTaskbarItemForWindowId(window.id);
        // console.log(taskbarItem, window);

        if (taskbarItem) {
            taskbarItem.remove();
        }
    }
}

function rerenderTaskbar() {
    // console.log("rerender");
    WindowList.forEach(([id, window]) => {
        if (!window || !id) {
            return;
        }

        const taskbarItem = getTaskbarItemForWindowId(id);
        if (!taskbarItem) return;

        taskbarItem.innerHTML = getInnerHtmlForTaskbarItem(window);
        if (WindowList.getFocusedWindow() === window) {
            taskbarItem.classList.add("pressed");
        } else {
            taskbarItem.classList.remove("pressed");
        }
    });
}

function handleShouldStartMenuClose(e) {
    if (!StartMenu.contains(e.target)) {
        StartMenu.classList.add("hidden");

        StartButton.classList.remove("pressed");
    }
}

// INIT

StartButton.addEventListener("click", handleStartButtonClicked);
document.querySelector("#btn_start_writer")?.addEventListener("click", () => {
    const newWindow = new WindowClass(WindowWriterConfig);

    newWindow.register();
});
document.querySelector("#btn_start_about").addEventListener("click", () => {
    const newWindow = new WindowClass(AboutWindowConfig)

    newWindow.register();
})

document.addEventListener("mousedown", handleShouldStartMenuClose)

addEventListener("windowregistered", updateTaskbar);
addEventListener("windowderegistered", updateTaskbar);
addEventListener("windowfocuschanged", updateTaskbar);

addEventListener("windowsrerendered", rerenderTaskbar);
setInterval(rerenderTaskbar, 1000 / 30);