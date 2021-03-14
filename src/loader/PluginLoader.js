import typescript          from 'typescript';

import typescriptPlugin    from '@rollup/plugin-typescript';

import TypeScriptLoader    from '@endemolshinegroup/cosmiconfig-typescript-loader';

const s_CONFLICT_PACKAGES = ['@rollup/plugin-typescript'];
const s_PACKAGE_NAME = '@typhonjs-node-rollup/plugin-typescript';

const s_SKIP_DIRS = ['deploy', 'dist', 'node_modules'];

const s_DEFAULT_CONFIG = {
   lib: ["dom", "es6", "es2020"],
   target: "es2020",
   tsconfig: false,
   typescript
};

/**
 * Handles interfacing with the plugin manager adding event bindings to pass back a configured
 * instance of `@rollup/plugin-typescript`.
 */
export default class PluginLoader
{
   /**
    * Returns the any modules that cause a conflict.
    *
    * @returns {string[]}
    */
   static get conflictPackages() { return s_CONFLICT_PACKAGES; }

   /**
    * Returns the `package.json` module name.
    *
    * @returns {string}
    */
   static get packageName() { return s_PACKAGE_NAME; }

   /**
    * Provides support for `cosmiconfig` config loading for `.ts` files.
    *
    * Responds to FileUtil event for openConfig:
    * 'typhonjs:oclif:system:file:util:cosmic:support:get'
    *
    * @param {string} moduleName - The module name to configure for `.ts` file loading.
    *
    * @returns {{searchPlaces: string[], loaders: {".ts": function }}}
    */
   static getCosmiconfigSupport(moduleName)
   {
      if (typeof moduleName !== 'string')
      {
         throw new TypeError(
          `${PluginLoader.packageName} - getCosmiconfigSupport - expected 'moduleName' to be a 'string'.`);
      }

      return {
         searchPlaces: [
            `.${moduleName}rc.ts`,
            `${moduleName}.config.ts`
         ],
         loaders: {
            '.ts': TypeScriptLoader.default,
         }
      };
   }

   /**
    * Returns the configured input plugin for `rollup-plugin-terser`
    *
    * @param {object} bundleData - The CLI config
    *
    * @param {object} currentBundle - The current bundle config
    * @param {object} currentBundle.inputType - The type of file.
    *
    * @returns {object} Rollup plugin
    */
   static async getInputPlugin(bundleData = {}, currentBundle = {}) // eslint-disable-line no-unused-vars
   {
      if (currentBundle.inputType === 'typescript')
      {
         const config = await PluginLoader._loadConfig(bundleData.cliFlags);

         return typescriptPlugin(config);
      }
   }

   /**
    * Attempt to load a local configuration file or provide the default configuration.
    *
    * @param {object} cliFlags - The CLI flags.
    *
    * @returns {object} Either the default Typescript configuration or defer to locally provided configuration files.
    * @private
    */
   static async _loadConfig(cliFlags)
   {
      if (typeof cliFlags['ignore-local-config'] === 'boolean' && cliFlags['ignore-local-config'])
      {
         return s_DEFAULT_CONFIG;
      }

      const hasTSConfig = await globalThis.$$eventbus.triggerAsync(
       'typhonjs:oclif:system:file:util:config:typescript:has', globalThis.$$bundler_origCWD, s_SKIP_DIRS);

      if (hasTSConfig)
      {
         globalThis.$$eventbus.trigger('log:verbose',
          `${PluginLoader.packageName}: deferring to local Typescript configuration file(s).`);

         return {};
      }
      else
      {
         return s_DEFAULT_CONFIG;
      }
   }

   /**
    * Wires up PluginLoader on the plugin eventbus.
    *
    * @param {PluginEvent} ev - The plugin event.
    *
    * @see https://www.npmjs.com/package/typhonjs-plugin-manager
    *
    * @ignore
    */
   static async onPluginLoad(ev)
   {
      ev.eventbus.on(
       'typhonjs:oclif:system:file:util:cosmic:support:get', PluginLoader.getCosmiconfigSupport, PluginLoader);

      ev.eventbus.on('typhonjs:oclif:bundle:plugins:main:input:get', PluginLoader.getInputPlugin, PluginLoader);
   }
}
