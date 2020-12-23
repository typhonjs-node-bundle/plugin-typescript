/**
 * Handles interfacing with the plugin manager adding event bindings to pass back a configured
 * instance of `@rollup/plugin-typescript`.
 */
class PluginHandler
{
   /**
    * @returns {string}
    */
   static test() { return 'some testing'; }

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
      // TODO: ADD EVENT REGISTRATION
      // eventbus.on(`${eventPrepend}test`, PluginHandler.test, PluginHandler);
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
      process.pluginManager.add({ name: 'plugin-typescript', instance: PluginHandler });

      // TODO REMOVE
      process.stdout.write(`plugin-typescript init hook running ${opts.id}\n`);
   }
   catch (error)
   {
      this.error(error);
   }
};
