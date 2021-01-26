import { ExtensionPlugin } from './../DTCD-SDK';
import pluginRegistrationMeta from './pluginRegistrationMeta';
import TabComponent from './TabComponent'

export class DataCADPlugin extends ExtensionPlugin {

  static getRegistrationMeta () {
    return pluginRegistrationMeta;
  }

  static getExtensionInfo () {

  }

  static register (pluginRegistrator) {
    pluginRegistrator.register(DataCADPlugin.getRegistrationMeta());
  }

  constructor (selector, workPlaceID, VueJS) {
    super();

    const pluginData = { workPlaceID };

    new VueJS.default({
      data: () => pluginData,
      render: (h) => h(TabComponent),
    }).$mount(selector);

    this.getRegistrationMeta = DataCADPlugin.getRegistrationMeta;
  }

}
