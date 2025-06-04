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
  ItemResources.renderItemResourceOptions(app, html, data);
})

Hooks.on("renderCharacterActorSheet", (app, html, data) => {
  ItemResources.alterCharacterSheet(app, html, data);
});

Hooks.on("updateItem", ItemResources.updateItemResources);
Hooks.on("createItem", ItemResources.createItemResources);
Hooks.on("preDeleteItem", ItemResources.preDeleteItemResources);
Hooks.on("preUpdateItem", ItemResources.preUpdateItemResources);