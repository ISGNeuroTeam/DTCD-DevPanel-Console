import { ExtensionPlugin, LogSystemAdapter } from './../../DTCD-SDK';
import pluginMeta from './Plugin.Meta';
import PluginComponent from './PluginComponent.vue';

export class DevConsoleTab extends ExtensionPlugin {

  static getRegistrationMeta () {
    return pluginMeta;
  }

  static getExtensionInfo () {}

  constructor (guid, selector) {
    super();

    const logSystem = new LogSystemAdapter(guid, pluginMeta.name);

    const VueJS = this.getDependence('Vue');
    const data = {
      logSystem,
      tabID: `${pluginMeta.name}-${guid}`,
    };

    new VueJS.default({
      data: () => data,
      render: h => h(PluginComponent),
    }).$mount(selector);
  }

}
