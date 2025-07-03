module.exports = {
  apps: [
    {
      name: "image-host",
      script: "dist/server/node-build.mjs",
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080
      }
    }
  ]
}; 