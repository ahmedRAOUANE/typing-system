
class Part {
    constructor(kind, body = null) {
        this.kind = kind;
        this.body = body;
    }
}

class Project extends Part {
    constructor(kind, body, title = "Untitled", id) {
        super(kind, body);
        this.title = title;
        this.id = id;
    }
}

class Section extends Part {
    constructor(kind, body) {
        super(kind, body);
    }
}

class Example extends Part {
    constructor(kind, body, title = "Untled Example") {
        super(kind, body);
        this.title = title;
    }
}

class Code extends Part {
    constructor(kind, body, language = "Plaintext") {
        super(kind, body);
        this.language = language;
    }
}

class Text extends Part {
    constructor(kind, content) {
        super(kind);
        this.content = content;
    }
}

class Link extends Part {
    constructor(kind, altText, url) {
        super(kind);
        this.url = url;
        this.altText = altText;
    }
}

class Heading extends Part {
    constructor (kind, level, text) {
        super(kind);
        this.level = level;
        this.text = text;
    }
} 

class MediaFile extends Part {
    constructor(kind, altText = "", filePath) {
        super(kind);
        this.altText = altText;
        this.filePath = filePath;
        //? and maybe will add some alt and discreption or title later 
    }
}

class Breakline extends Part {
    constructor(kind) {
        super(kind);
    }
}

class EOF extends Part {
    constructor(kind) {
        super(kind);
    }
}


const createText = (val) => new Text("Text", val);

const createLink = (altText, url) => new Link("Link", altText, url);

const createHeading = (level, text) => new Heading("Heading", level, text);

const createMediaFile = (kind, altText, filePath) => new MediaFile(kind, altText, filePath);

const createBreakLine = () => new Breakline("Breakline");

// create a project id
const generateId = () => {
    let serialNumber = "";

    const chars = "123456789ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnopqrstuvwxyz";
    const serialNumsCount = 20;
    
    for(let count = 0; count < serialNumsCount; count++) {
        const random = Math.floor(Math.random() * chars.length);
        serialNumber+=chars[random];
    }

    return serialNumber;
} 

export const parseTokens = (tokens) => {
    let currentProject = new Project("Project", [], "untitled", generateId());
    let currentSection = null;
    let currentExample = null;
    let currentCode = null;

    const ast = currentProject.body;
    const stack = [];

    while (tokens.length > 0) {
        const token = tokens.shift();

        switch (token.type) {
            case "EOF":
                currentSection = new EOF("EOF");
                ast.push(currentSection);

                break;
            case "SectionOpening":
                currentSection = new Section("Section", []);
                if (stack.length > 0) {
                    stack[stack.length - 1].body.push(currentSection);
                } else {
                    ast.push(currentSection);
                }
                stack.push(currentSection);
                break;
            case "SectionClosing":
                stack.pop();
                currentSection = stack.length > 0 ? stack[stack.length - 1] : null;
                break;
            case "ExampleOpening":
                currentExample = new Example("Example", [], token.value ? token.value.split(" ")[2] : "Untitled Example");
                if (stack.length > 0) {
                    stack[stack.length - 1].body.push(currentExample);
                } else {
                    ast.push(currentExample);
                }
                stack.push(currentExample);
                break;
            case "ExampleClosing":
                stack.pop();
                currentExample = stack.length > 0 ? stack[stack.length - 1] : null;
                break;
            case "CodeOpening":
                currentCode = new Code("Code", [], token.value ? token.value.split(" ")[2] : "plaintext");

                if (stack.length > 0) {
                    stack[stack.length - 1].body.push(currentCode);
                } else {
                    ast.push(currentCode);
                }
                stack.push(currentCode);
                break;
            case "CodeClosing":
                stack.pop();
                currentCode = stack.length > 0 ? stack[stack.length - 1] : null;
                break;
            case "Link":
                if (stack.length > 0) {
                    stack[stack.length - 1].body.push(createLink(token.value.alt, token.value.url));
                } else {
                    ast.push(createLink(token.value.alt, token.value.url));
                }
                break;
            case "Heading":
                if (stack.length > 0) {
                    stack[stack.length - 1].body.push(createHeading(token.value.level, token.value.text));
                } else {
                    ast.push(createHeading(token.value.level, token.value.text));
                }
                break;
            case "Text":
                if (stack.length > 0) {
                    stack[stack.length - 1].body.push(createText(token.value));
                } else {
                    ast.push(createText(token.value));
                }
                break;
            case "ProjectTitle":
                currentProject.title = token.value;
                break;
            case "Img":
                if (stack.length > 0) {
                    stack[stack.length - 1].body.push(createMediaFile("Img", token.value.altText, token.value.filePath));
                } else {
                    ast.push(createMediaFile("Img", token.value.altText, token.value.filePath));
                }
                break;
            case "Video":
                if (stack.length > 0) {
                    stack[stack.length - 1].body.push(createMediaFile("Video", "", token.value));
                } else {
                    ast.push(createMediaFile("Video", "", token.value));
                }
                break;
            case "Audio":
                if (stack.length > 0) {
                    stack[stack.length - 1].body.push(createMediaFile("Audio","", token.value));
                } else {
                    ast.push(createMediaFile("Audio","", token.value));
                }
                break;
            case "Breakline":
                if (stack.length > 0) {
                    stack[stack.length - 1].body.push(createBreakLine());
                } else {
                    ast.push(createBreakLine());
                }
                break;
            default:
                console.error(`Unrecognized token type: ${token.type}`);
                break;
        }
    }

    return currentProject;
}

