export class Token {
    constructor (type, value = null) {
        this.type = type,
        this.value = value
    }
}

const tokens = [];

const newToken = (tokenType, value = null) => {
    const token = new Token(tokenType, value);
    tokens.push(token);
}

export const tokenize = (input) => {
    const lines = input.split("\n");
    const linkPattern = /"([^"]+)"->(https?:\/\/[^\s]+)/;
    const headingPattern = /^(#{1,5})\s*(.*)$/;
    const imgPattern = /@img\s*(?:"([^"]+)")?\s*->\s*(.+)$/; // @img "alt text"->.\imgs\firebase-config.png the alt optional
    const videoPattern = /@video\s*->\s*(.+)$/;
    const audioPattern = /@audio\s*->\s*(.+)$/;
    const titlePattern = /@title\s*->\s*(.+)$/;

    for (let line of lines) {
        line = line.trimStart(); // remove leading space

        if (line.trim() === "") {
            newToken("Breakline");
        } else if (line.includes("@done")){
            newToken("EOF"); // define the end of file
        } else if (line.includes("@section starts")){
            newToken("SectionOpening", line);
        } else if (line.includes("@section ends")) {
            newToken("SectionClosing", line);
        } else if (line.includes("@example starts")) {
            newToken("ExampleOpening", line);
        } else if (line.includes("@example ends")) {
            newToken("ExampleClosing", line);
        } else if (line.includes("@code starts")) {
            newToken("CodeOpening", line);
        } else if (line.includes("@code ends")) {
            newToken("CodeClosing", line);
        } else {
            const linkMatch = line.match(linkPattern);
            if (linkMatch) {
                const [_, altText, url] = linkMatch;
                const preLinkText = line.slice(0, linkMatch.index).trim();
                if (preLinkText) {
                    newToken("Text", preLinkText);
                }
                newToken("Link", {alt: altText, url: url});

                const postLinkText = line.slice((linkMatch.index + linkMatch[0].length)).trim();
                if (postLinkText) {
                    newToken("Text", postLinkText)
                }
            } else {
                const headingMatch = line.match(headingPattern);
                if (headingMatch) {
                    const [_, hashes, headingText] = headingMatch;
                    const level = hashes.length;
                    newToken("Heading", {level, text: headingText});
                } else {
                    const imgMatch = line.match(imgPattern);
                    if (imgMatch) {
                        newToken("Img", { 
                            altText: imgMatch[1] ? imgMatch[1].trim() : "", 
                            filePath: imgMatch[2].trim() 
                        });
                    } else {
                        const videoMatch = line.match(videoPattern);
                        if (videoMatch) {
                            newToken("Video", videoMatch[1].trim());
                        } else {
                            const audioMatch = line.match(audioPattern);
                            if (audioMatch) {
                                newToken("Audio", audioMatch[1].trim());
                            } else {
                                const titleMatch = line.match(titlePattern);
                                if (titleMatch) {
                                    newToken("ProjectTitle", titleMatch[1].trim());
                                }
                                else {
                                    newToken("Text", line);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return tokens;
}

