const fs = require("fs");

module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync("./certs/localhost-key.pem"),
      cert: fs.readFileSync("./certs/localhost.pem")
    },
    host: process.env.VUE_APP_HOST,
    port: process.env.VUE_APP_PORT,
    public: `https://${process.env.VUE_APP_HOST}:${process.env.VUE_APP_PORT}`
  },
  outputDir: "../wwwroot/", // /client-app/", // ASP.NET Core public folder
  filenameHashing: false // , // I'll let ASP.NET Core handle cache breaking
  //publicPath: "/client-app/" // almappa esetén be kell állítani?
};
