import { ResourcePopupConfig } from "./ResourcePopupConfig.js";
import { ITEM_RESOURCES_DEFAULTS } from "./main.js";

export function isset(variable) {
  return (typeof variable !== 'undefined');
}

export class ItemResources {
  /**
   * Render the item resource options in the item sheet.
   * @param {ItemSheet5e} app - The item sheet application.
   * @param {HTMLElement} html - The HTML element of the item sheet.
   * @param {Object} data - The data for the item.
   */
  static async renderItemResourceOptions(app, html, data) {
    const htmlElem = html instanceof HTMLElement ? html : html[0];
    const item = data.document;
    const actor = item.actor;

    if (isset(item.system.uses) && actor) {
      const itemId = item._id;
      let template_data = item;
      template_data.flags.dnd5eItemResources = item.flags?.dnd5eItemResources ?? ITEM_RESOURCES_DEFAULTS;

      let percent = item.system.uses.value / item.system.uses.max * 100 > 100 ? 100 : item.system.uses.value / item.system.uses.max * 100;
      template_data.percent = percent; 3
      template_data.animations = ITEM_RESOURCES_DEFAULTS.animations;

      const template_file = "/modules/dnd5e-item-resources/templates/item-resource-config.hbs";
      foundry.applications.handlebars.renderTemplate(template_file, template_data).then(function (html) {
        const detailsSection = htmlElem.querySelector('section.details');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        Array.from(tempDiv.childNodes).forEach(node => detailsSection.appendChild(node));

        // restore scroll position if it exists
        detailsSection.scrollTop = ItemResources.scroll;
        ItemResources.scroll = 0;
        detailsSection.addEventListener('change', function (e) {
          ItemResources.scroll = detailsSection.scrollTop;
        });
      })
    }
  }

  static scroll = 0;

  static preUpdateItemResources(item, updateData, options, userId) { }
  static createItemResources(item, updateData, options, userId) { }

  /**
 * Pre-delete hook to handle cleanup of item resource flags when an item is deleted.
 * @param {Item5e} item - The item being deleted.
 * @param {Object} options - Options for the deletion.
 * @param {string} userId - The ID of the user performing the deletion.
 */
  static async preDeleteItemResources(item, options, userId) {
    const actor = item.parent;
    if (!actor || !actor.flags?.dnd5eItemResources) return;

    const itemId = item.id;

    if (actor.flags.dnd5eItemResources.hasOwnProperty(itemId)) {
      await actor.update({
        [`flags.dnd5eItemResources.-=${itemId}`]: null
      });
    }
  }

  /**
   * Pre-update hook to handle item resource updates.
   * @param {Item5e} item - The item being updated.
   * @param {Object} updateData - The data being used to update the item.
   * @param {Object} options - Options for the update.
   * @param {string} userId - The ID of the user performing the update.
   */
  static async updateItemResources(item, updateData, options, userId) {
    if (isset(updateData.flags?.dnd5eItemResources) || isset(updateData.system?.uses)) {
      const actor = item.parent;
      if (actor) {
        if (item.flags.dnd5eItemResources.resourceBar) {
          // If the resource bar is enabled, update the actor's flags with the resource data
          await actor.update({
            [`flags.dnd5eItemResources`]: {
              [`${item._id}`]: {
                barFirstColor: item.flags.dnd5eItemResources?.barFirstColor,
                barSecondColor: item.flags.dnd5eItemResources?.barSecondColor,
                animation: item.flags.dnd5eItemResources?.animation,
                uses: {
                  max: item.system.uses.max,
                  spent: item.system.uses.spent,
                }
              }
            }
          });
        } else {
          // remove data from actor's flags
          await actor.update({
            [`flags.dnd5eItemResources.-=${item._id}`]: null
          });
        }
      }
    }
  }

  static async alterCharacterSheet(app, html, data) {
    if (isset(data.actor.flags.dnd5eItemResources)) {
      const itemResources = data.actor.flags.dnd5eItemResources;
      const resourceKeys = Object.keys(itemResources);
      if (resourceKeys.length > 0) {
        const template_file = "modules/dnd5e-item-resources/templates/item-resource-sheet-bar.hbs";
        for (const key of resourceKeys) {
          if (itemResources[key] === null) {
            continue; // Skip if the resource data is null
          }
          const Item = data.actor.items.get(key);
          const resourceData = itemResources[key];
          const template_data = {
            item: Item,
            itemId: key,
            editable: data.editable,
            barFirstColor: resourceData.barFirstColor || ITEM_RESOURCES_DEFAULTS.barFirstColor,
            barSecondColor: resourceData.barSecondColor || ITEM_RESOURCES_DEFAULTS.barSecondColor,
            animation: resourceData.animation || ITEM_RESOURCES_DEFAULTS.animation,
            value: resourceData.uses.max - resourceData.uses.spent,
            max: resourceData.uses.max,
            percent: (resourceData.uses.max - resourceData.uses.spent) / resourceData.uses.max * 100
          }
          const rendered_html = await foundry.applications.handlebars.renderTemplate(template_file, template_data);
          $('.sidebar .stats', html).append(rendered_html);
        }

        $('.sidebar .stats', html).on('click', '.resource-config', async (event) => {
          const itemId = event.currentTarget.dataset.id;
          let config = new ResourcePopupConfig({ document: data.actor.items.get(itemId) });
          config?.render(true);
        })
      }
    }
  }
}