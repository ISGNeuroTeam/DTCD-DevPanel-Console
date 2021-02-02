import { ExtensionPlugin } from './../../../DTCD-SDK';
import pluginMeta from './Plugin.Meta';
import TabComponent from './TabComponent';

export class Plugin extends ExtensionPlugin {

  static getRegistrationMeta () {
    return pluginMeta;
  }

  static getExtensionInfo () {

  }

  constructor (guid, selector) {
    super();

    const VueJS = this.getDependence('Vue');
    const data = {
      tabID: `${pluginMeta.name}-${guid}`,
    };

    new VueJS.default({
      data: () => data,
      render: (h) => h(TabComponent),
    }).$mount(selector);
  }

}
