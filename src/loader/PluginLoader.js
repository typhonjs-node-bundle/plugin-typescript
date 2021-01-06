const typescript = require('@rollup/plugin-typescript');

const s_SKIP_DIRS = ['deploy', 'dist', 'node_modules'];

const s_DEFAULT_CONFIG = {
   lib: ["dom", "es6", "es2020"],
   target: "es2020",
   typescript: require('typescript')
};

/**
 * Handles interfacing with the plugin manager adding event bindings to pass back a configured
 * instance of `@rollup/plugin-typescript`.
 */
class PluginLoader
{
   /**
    * Returns the `package.json` module name.
    *
    * @returns {string}
    */
   static get pluginName() { return '@typhonjs-node-rollup/plugin-typescript'; }

   /**
    * Returns the rollup plugins managed.
    *
    * @returns {string[]}
    */
   static get rollupPlugins() { return ['@rollup/plugin-typescript']; }

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

         return typescript(config);
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

      const hasTSConfig = await global.$$eventbus.triggerAsync(
       'typhonjs:oclif:system:file:util:config:typescript:has', global.$$bundler_origCWD, s_SKIP_DIRS);

      if (hasTSConfig)
      {
         global.$$eventbus.trigger('log:verbose',
          `${PluginLoader.pluginName}: deferring to local Typescript configuration file(s).`);

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
   static onPluginLoad(ev)
   {
      ev.eventbus.on('typhonjs:oclif:bundle:plugins:main:input:get', PluginLoader.getInputPlugin, PluginLoader);
   }
}

module.exports = PluginLoader;