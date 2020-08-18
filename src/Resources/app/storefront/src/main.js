/* eslint-disable import/no-unresolved */
import MappIntelligenceClientEvents from './mapp-intelligence-client-events';


const PluginManager = window.PluginManager;
PluginManager.register('MappIntelligenceClientEvents', MappIntelligenceClientEvents);



if (module.hot) {
    module.hot.accept();
}
