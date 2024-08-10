import Parser from "./parser.mjs";

const input = document.getElementById("typingarea");
const title = document.getElementById("title");
const output = document.getElementById("output");

window.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // Prevent the default save behavior

        const content = new Parser();
        const project = content.produceAST(input.value);

        title.value = project.data.title;

        // Clear the output before appending new content
        output.innerHTML = '';
        project.parsedContent.forEach(ele => {
            output.appendChild(ele);
        });
    }
})

