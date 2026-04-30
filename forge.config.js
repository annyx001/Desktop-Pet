const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    extraResources:[
      {
        from: 'src/credentials.json',
        to: 'credentials.json'
      }
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
      format: 'ULFO'
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
  name: '@electron-forge/plugin-webpack',
  config: {
    mainConfig: './webpack.main.config.js',
    renderer: {
      config: './webpack.renderer.config.js',
      nodeIntegration: false,
      entryPoints: [
        {
          html: './src/index.html',
          js: './src/renderer.js',
          name: 'main_window',
          preload: {
            js: './src/preload.js',
            config: {
              node: {
                __dirname: true,
                __filename: true,
              },
            },
          },
        },
      ],
    },
    devContentSecurityPolicy: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:",
  },
},
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
