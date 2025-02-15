const AboutWindowConfig = {
    title: "About",
    icon: "./assets/help_icon.png",

    body: `
        <h2>About</h2>

        <p>
            
        Final project for Web Development 2!<br>
        Also just a project to test skills and it was fun.<br>
        Hope you found it cool!

        </p>

        <a href="https://www.github.com/jams064/idekbruh" target="_blank">Github Repo (opens in new tab)</a>

        <p style="font-size: 1em; position: absolute; right: 0; bottom: 0;">Joshua (jams064)</p>
    `
}

const WindowWriterConfig = {
    title: "Window Writer",
    icon: "./assets/run_icon.png",

    body: `
        <p>Window Creator</p>

        <div class="bulge">
            <p>Title</p>
            <input type="text" id="title_input" placeholder="Window Title">

            <p>Icon (url)</p>
            <input type="text" id="icon_input" placeholder="Window Icon">

            <p>Body</p>
            <textarea id="body_textarea" placeholder="Window Body"></textarea>

            <button id="launch_button">Launch</button>
        </div>
    `,

    handler: (window, element) => {
        const titleInput = element.querySelector("#title_input");
        const iconInput = element.querySelector("#icon_input");
        const bodyTextArea = element.querySelector("#body_textarea");

        const launchButton = element.querySelector("#launch_button");

        launchButton.addEventListener("click", () => {
            const newWindow = new window.constructor({
                title: titleInput.value,
                icon: iconInput.value,

                body: bodyTextArea.value
            });

            newWindow.register();
        });
    }
}