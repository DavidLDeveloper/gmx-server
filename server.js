const { readFileSync, existsSync } = require("fs");
const gemini = require("gemini-server").default;
const gmxTools = require("./gmxTools/gmxTools");
const componentsList = require("./componentsList");
const options = {
  cert: readFileSync("cert.pem"),
  key: readFileSync("key.pem"),
};

const app = gemini(options);
const parser = new gmxTools.CreasteGmxCompiler(componentsList);

// Logging middleware
app.use((req, res, next) => {
  console.log("Handling path:", req.path);
  next();
});

// Testing Routes.
app.on("/rendered", (req, res) => {
  res.data("SSR Content is here.", (mimeType = "text/gemini"));
});

app.on("/testrenderelement", (req, res) => {
  try {
    const data = [
      gmxTools.renderElement("heading1", "This is a test."),
      gmxTools.renderElement("heading2", "This is a test."),
      gmxTools.renderElement("heading3", "This is a test."),
      gmxTools.renderElement("list", "This is another test test."),
      gmxTools.renderElement("link", "/ home."),
      gmxTools.renderElement("paragraph", "This is a test paragraph."),
      gmxTools.renderElement("quote", "Hello quote."),
    ];
    res.data(data.join(""), (mimeType = "text/gemini"));
  } catch (err) {
    console.log(err);
    res.data("error", (mimeType = "text/gemini"));
  }
});

// Dynamic Route Handling.
app.on("*", (req, res) => {
  s;
  try {
    try {
      res.file(`pages${req.path}/index.gmi`);
    } catch (err) {
      if (existsSync(`./pages${req.path}/index.gmx`)) {
        const file = readFileSync(`./pages${req.path}/index.gmx`);
        res.data(parser.compileGmx(file), (mimeType = "text/gemini"));
        return;
      }
      res.data(`Page not found: ${req.path}`);
    }
  } catch (err) {
    console.log(err);
    res.data(`Page not found: ${req.path}`);
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000...");
});
