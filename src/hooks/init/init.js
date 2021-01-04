const typescript = require('@rollup/plugin-typescript');

/**
 * Handles interfacing with the plugin manager adding event bindings to pass back a configured
 * instance of `@rollup/plugin-typescript`.
 */
class PluginHandler
{
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
   static getInputPlugin(bundleData = {}, currentBundle = {}) // eslint-disable-line no-unused-vars
   {
      if (currentBundle.inputType === 'typescript')
      {
         return typescript({
            lib: ["dom", "es6", "es2017"],
            target: "es2017",
            typescript: require('typescript')
         });
      }
   }

   /**
    * Wires up PluginHandler on the plugin eventbus.
    *
    * @param {PluginEvent} ev - The plugin event.
    *
    * @see https://www.npmjs.com/package/typhonjs-plugin-manager
    *
    * @ignore
    */
   static onPluginLoad(ev)
   {
      ev.eventbus.on('typhonjs:oclif:bundle:plugins:main:input:get', PluginHandler.getInputPlugin, PluginHandler);
   }
}

/**
 * Oclif init hook to add PluginHandler to plugin manager.
 *
 * @param {object} opts - options of the CLI action.
 *
 * @returns {Promise<void>}
 */
module.exports = async function(opts)
{
   try
   {
      global.$$pluginManager.add({ name: '@typhonjs-node-rollup/plugin-typescript', instance: PluginHandler });

      global.$$eventbus.trigger('log:debug', `plugin-typescript init hook running '${opts.id}'.`);
   }
   catch (error)
   {
      this.error(error);
   }
};
