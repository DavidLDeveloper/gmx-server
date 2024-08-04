const renderElement = (name, value = "") => {
  // return rendered gemtext: element <value>
  // e.g. (heading, "My stuff") returns "# My Stuff"
  const elements = {
    paragraph: "",
    heading1: "#",
    heading2: "##",
    heading3: "###",
    link: "=>",
    list: "*",
    quote: ">",
  };

  if (Object.keys(elements).includes(elements[name])) {
    throw (
      "renderElement function frequires variable name<string>  to be one of: heading1, heading2, heading3, link, list, or paragraph. Received: " +
      name
    );
  }

  if (typeof name !== "string" || typeof value !== "string") {
    throw "renderElement function requires variable name<string> and value<string> to be of type <string>.";
  }

  return `${elements[name]}${name === "paragraph" ? "" : " "}${value}\n`;
};
class CreateGmxCompiler {
  constructor(elements = []) {
    // custom elementsArray
    this.elements = elements.reduce(
      (obj, item) => ({ ...obj, [item.name]: item }),
      {}
    );
  }

  compileElement = (customElementName, props = {}) => {
    // comple custom element in stored array to rendred text.
    return this.elements[customElementName](props);
  };

  compileGmx = (buffer) => {
    // convert .gmx buffer to string, parse, compile custom elements then return joined .gmi document.
    const data = this.parseGmx(buffer).map((row) => {
      if (row.type === "gmx") {
        // return renderElement("paragraph", `<<< ${row.element} goes here. >>>`)
        return `${this.compileElement(row.element, row.props)}\n`;
      } else {
        // gmi
        return renderElement(row.element, row.value);
      }
    });
    return data.join("");
  };

  identifyElement = (string) => {
    const flippedMap = {
      "#": "heading1",
      "##": "heading2",
      "###": "heading3",
      "=>": "link",
      "*": "list",
      ">": "quote",
    };

    const element = string.split(" ")[0];
    if (flippedMap[element]) {
      // is gmi except paragraph
      return {
        type: "gmi",
        element: flippedMap[element],
        value: string.replace(`${element} `, ""),
      };
    } else if (string.match(/^<.+\/>$/g)) {
      // Is gmx
      const props = {};

      // const propsArray =  string.match(/(\b\S+\b)=['`"](\b\S+\b)['`"]/g)
      const propsArray = string.match(
        /((\b\S+\b)="[^"]+")|((\b\S+\b)='[^']+')|((\b\S+\b)=`[^`]+`)/g
      );
      console.log(propsArray);
      if (propsArray)
        propsArray.forEach((prop) => {
          const split = prop.split("=");
          props[split[0]] = String(prop).slice(
            prop.indexOf("=") + 2,
            prop.length - 1
          );
        });
      console.log("props:", props);
      return {
        type: "gmx",
        element: element.replace("<", ""),
        props: props,
      };
    } else {
      // else return paragraph
      return { type: "gmi", element: "paragraph", value: string };
    }
  };

  parseGmx = (buffer) => {
    // parse uncompiled gmx string to array of gmx : {customElement, props, type: 'gmx'} and gmi: {element, value, type: 'gmi'}
    const data = buffer.toString().split("\n");
    return data.map((row) => this.identifyElement(row));
  };
}

module.exports = { CreateGmxCompiler, renderElement };
