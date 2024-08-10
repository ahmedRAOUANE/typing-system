import { parseTokens } from "./ast.mjs";
import { tokenize } from "./lexer.mjs";

export default class Parser {
    constructor(tokens) {
        this.tokens = tokens;
    }

    not_eol() {
        return this.tokens
    }

    createSection(body) {
        const container = document.createElement("div");
        container.classList.add("section");

        if (Array.isArray(body)) {
            body.forEach(part => {
                const childElement = this.createElement(part);
                container.appendChild(childElement);
            });
        }

        return container;
    }

    createExample(body) {
        //? examplearea template:
        // <div className="examplearea box column full-width outline">
        //     <div className="exampleInfo box full-width">
        //         <input type="text" className="exampleTitle transparent full-width small" defaultValue={"example"} />
        //         <button className='danger' type="button">Remove</button>
        //     </div>

        //     <div className='exampleContent full-width paper outline'>
        //         <p>content</p>
        //     </div>
        // </div>

        const container = document.createElement("div");
        container.className = "example box column full-width outline";

        // create and append example header
        const exampleHeader = document.createElement("div");
        exampleHeader.className = "exampleHeader box full-width";

        const headerText = document.createElement("p");
        headerText.innerHTML = "Example";

        exampleHeader.appendChild(headerText);
        container.appendChild(exampleHeader);

        // create and append example body
        const exampleBody = document.createElement("div");
        exampleBody.className = "exampleBody full-width paper outline";

        if (Array.isArray(body)) {
            body.forEach(part => {
                const childElement = this.createElement(part);
                exampleBody.appendChild(childElement);
            });
        }

        container.appendChild(exampleBody);

        return container;
    }

    createCode(body, language) {
        //? codearea template
        // <div className="codearea outline full-width">
        //     <div className="box full-width codeLang" style={{ flex: 0 }}>
        //         <p>{lang}</p>
        //         <input className='small' type="text" />
        //     </div>
        //     <div className='code paper outline'>
        //         <Textarea id={"codearea"} placeholder={"code here"} index={index} />
        //     </div>
        // </div>

        const container = document.createElement("div");
        container.className = "code box column full-width outline";

        // create and append code header
        const codeHeader = document.createElement("div");
        codeHeader.className = "codeHeader box full-width";
        codeHeader.style.flex = 0;

        const headerText = document.createElement("span");
        headerText.innerHTML = "Code";

        const codeLang = document.createElement("p");
        codeLang.className = "codeLang";
        codeLang.innerHTML = language;

        codeHeader.appendChild(headerText);
        codeHeader.appendChild(codeLang);
        container.appendChild(codeHeader);

        // create and append code body
        const codeBody = document.createElement("pre");
        codeBody.setAttribute("data-language", language);
        codeBody.className = "codeBody paper outline full-width";

        if (Array.isArray(body)) {
            body.forEach(part => {
                const childElement = this.createElement(part);
                codeBody.appendChild(childElement);
            });
        }

        container.appendChild(codeBody);

        return container;
    }

    createText(content) {
        const textEle = document.createElement("p");
        textEle.innerHTML = content;
        return textEle;
    }

    createLink(content, url) {
        const linkEle = document.createElement("a");
        linkEle.href = url;
        linkEle.innerHTML = content;
        return linkEle;
    }

    createHeading(level, text) {
        const headingEle = document.createElement(`h${level}`);
        headingEle.innerHTML = text;

        return headingEle;
    }

    createBreakline() {
        const breaklineEle = document.createElement("br");

        return breaklineEle;
    }

    createMedia(fileType ,altText, filePath) {
        const mediaEle = document.createElement(fileType.toLowerCase());
        mediaEle.src = filePath;

        if (altText) {
            mediaEle.alt = altText
        }

        return mediaEle;
    }

    createElement(part) {
        switch (part.kind) {
            case "Section":
                return this.createSection(part.body);
            case "Example":
                return this.createExample(part.body);
            case "Code":
                return this.createCode(part.body, part.language);
            case "Heading":
                return this.createHeading(part.level, part.text);
            case "Link":
                return this.createLink(part.altText, part.url);
            case "Text":
                return this.createText(part.content);
            case "Breakline":
                return this.createBreakline();
            case "Img":
                return this.createMedia(part.kind, part.altText, part.filePath);
            case "Video":
                return this.createMedia(part.kind, part.url);
            case "Audio":
                return this.createMedia(part.kind, part.url);
            default:
                return this.createText(part.content);
        }
    }

    produceAST(content) {
        this.tokens = tokenize(content);
        const ast = parseTokens(this.tokens);
        const parsedContent = [];
        const data = {title: ast.title, id: ast.id, kind: ast.kind};
        
        if (ast) {
            ast.body.forEach(part => {
                const element = this.createElement(part);
                console.log('Element: ', element);
                
                parsedContent.push(element);
            });
        }

        console.log('ast', JSON.stringify(ast, null, 2));

        // JSON.stringify(ast, null, 2); // need to stringify the ast when uoloading the content to database
        return {data, parsedContent};
    }
}

