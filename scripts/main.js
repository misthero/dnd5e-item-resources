/* Main Item Resource module file */
import { ItemResources } from "./ItemResources.js";

export const ITEM_RESOURCES_DEFAULTS = {
  barFirstColor: "#3a0e5f",
  barSecondColor: "#8a40c7",
  animations: {
    'scroll': 'Scroll',
    'img-energy': 'dnd5e-item-resources.energyAnimation',
    'img-energy-h': 'dnd5e-item-resources.energyHAnimation',
    'img-bubbles': 'dnd5e-item-resources.bubblesAnimation',
    'img-star': 'dnd5e-item-resources.starAnimation',
    'img-fire': 'dnd5e-item-resources.fireAnimation',
    'img-blood': 'dnd5e-item-resources.bloodAnimation',
    'img-matrix': 'dnd5e-item-resources.matrixAnimation',
    'img-particles': 'dnd5e-item-resources.particlesAnimation',
    'img-alien': 'dnd5e-item-resources.alienAnimation',
    'img-waves': 'dnd5e-item-resources.wavesAnimation',
    'img-snow': 'dnd5e-item-resources.snowAnimation',
    'img-liquid': 'dnd5e-item-resources.liquidAnimation',
    'img-cyber': 'dnd5e-item-resources.cyberAnimation',
    'img-smoke': 'dnd5e-item-resources.smokeAnimation',
    'img-vortex': 'dnd5e-item-resources.vortexAnimation',
    'img-flux': 'dnd5e-item-resources.fluxAnimation',
  },
  animation: 'none',
  animate: false
};

Hooks.once("i18nInit", () => {
  // Localize the default animations after i18n is initialized
  ITEM_RESOURCES_DEFAULTS.animations = Object.fromEntries(
    Object.entries(ITEM_RESOURCES_DEFAULTS.animations).map(([key, label]) => [key, game.i18n.localize(label)])
  );
});

// Register the ItemResources class to handle item resource rendering and updates
Hooks.on("renderItemSheet5e", async (app, html, data) => {
  console.log("Rendering Item Sheet:", app.item.name);
  ItemResources.renderItemResourceOptions(app, html, data);
})

Hooks.on("renderTidy5eItemSheetQuadrone", async (app, html, data) => {
  console.log("Rendering Item Sheet Tidy:", app.item.name);
  ItemResources.renderItemResourceOptions(app, html, data);
})

Hooks.on("renderActorSheetV2", (app, html, data) => {
  ItemResources.alterCharacterSheet(app, html, data);
});

Hooks.on("updateItem", ItemResources.updateItemResources);
//Hooks.on("createItem", ItemResources.createItemResources);
Hooks.on("preDeleteItem", ItemResources.preDeleteItemResources);
//Hooks.on("preUpdateItem", ItemResources.preUpdateItemResources);