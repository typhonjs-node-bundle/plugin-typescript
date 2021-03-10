import PluginLoader from '../loader/PluginLoader.js';

/**
 * Oclif init hook to add PluginHandler to plugin manager.
 *
 * @param {object} options - options of the CLI action.
 *
 * @returns {Promise<void>}
 */
export default async function(options)
{
   try
   {
      await global.$$pluginManager.addAsync({ name: PluginLoader.packageName, instance: PluginLoader,
       options: { id: options.id, flagsModule: options.flagsModule } });

      global.$$eventbus.trigger('log:debug', `plugin-typescript init hook running '${options.id}'.`);
   }
   catch (error)
   {
      this.error(error);
   }
}
