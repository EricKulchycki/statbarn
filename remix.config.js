// remix.config.js

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // ... your other configurations might be here
  ignoredRouteFiles: ['**/.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",

  // Add this line:
  dev: {
    port: 8002, // Change this to your desired port number
  },
}
