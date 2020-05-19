const fs = require("fs");

module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync("./certs/localhost-key.pem"),
      cert: fs.readFileSync("./certs/localhost.pem")
    },
    host: "localhost",
    port: 44301,
    public: "https://localhost:44301"
  },
  outputDir: "../wwwroot/", // /client-app/", // ASP.NET Core public folder
  filenameHashing: false // , // I'll let ASP.NET Core handle cache breaking
  //publicPath: "/client-app/" // almappa esetén be kell állítani?
};
