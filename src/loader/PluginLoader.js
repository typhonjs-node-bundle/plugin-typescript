const typescript = require('@rollup/plugin-typescript');

const { FileUtil }   = require('@typhonjs-node-bundle/oclif-commons');

const s_SKIP_DIRS = ['deploy', 'dist', 'node_modules'];

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
         const hasTscConfig = await FileUtil.hasTscConfig(global.$$bundler_origCWD, s_SKIP_DIRS);

         if (hasTscConfig)
         {
            global.$$eventbus.trigger('log:verbose',
               `plugin-typescript: deferring to local Typescript configuration file(s).`);

            return typescript();
         }
         else
         {
            return typescript({
               lib: ["dom", "es6", "es2020"],
               target: "es2020",
               typescript: require('typescript')
            });
         }
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