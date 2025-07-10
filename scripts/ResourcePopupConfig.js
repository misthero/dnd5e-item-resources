
import { ITEM_RESOURCES_DEFAULTS } from "./main.js";
/**
 * Resource Configuration
 * @extends {dnd5e.applications.actor.BaseConfigSheetV2}
 */
export class ResourcePopupConfig extends dnd5e.applications.actor.BaseConfigSheetV2 {
  constructor(options) {
    foundry.utils.mergeObject(options ?? {}, {
      classes: [
        "standard-form", "config-sheet", "themed",
        "sheet", "dnd5e2", "resource-popup", "application"
      ],
      position: { width: 420 },
      submitOnClose: true,
      editable: true,
      submitOnChange: true,
      closeOnSubmit: false,
      actions: {
        deleteRecovery: ResourcePopupConfig._deleteRecovery,
        addRecovery: ResourcePopupConfig._addRecovery,
      },
    });
    super(options);
  }

  /** @override */
  static PARTS = {
    config: {
      template: "modules/dnd5e-item-resources/templates/item-resources-popup-config.hbs",
      templates: ["modules/dnd5e-item-resources/templates/item-resource-config.hbs"],
    }
  };

  /** Build the data context for resource-popup-config template */
  /** @override */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);


    const actor = this.document.parent;

    context.system = this.document.system;
    context.flags = this.document.flags;
    context.flags.dnd5eItemResources = this.document.flags?.dnd5eItemResources ?? ITEM_RESOURCES_DEFAULTS;
    context.percent = this.document.system.uses.value / this.document.system.uses.max * 100 > 100 ? 100 : this.document.system.uses.value / this.document.system.uses.max * 100;

    context.animations = ITEM_RESOURCES_DEFAULTS.animations;

    context.uses = this.document.system.uses;
    context.img = this.document.img;
    context.name = this.document.name;
    context.recovery = game.system.config.limitedUsePeriods;

    // Limited Uses
    context.recoveryPeriods = [
      ...Object.entries(CONFIG.DND5E.limitedUsePeriods)
        .filter(([, { deprecated }]) => !deprecated)
        .map(([value, { label }]) => ({ value, label, group: game.i18n.localize("DND5E.DurationTime") })),
      { value: "recharge", label: game.i18n.localize("DND5E.USES.Recovery.Recharge.Label") }
    ];
    context.recoveryTypes = [
      { value: "recoverAll", label: game.i18n.localize("DND5E.USES.Recovery.Type.RecoverAll") },
      { value: "loseAll", label: game.i18n.localize("DND5E.USES.Recovery.Type.LoseAll") },
      { value: "formula", label: game.i18n.localize("DND5E.USES.Recovery.Type.Formula") }
    ];

    let recovery = this.document.system.uses.recovery ?? [];
    if (!Array.isArray(recovery)) recovery = Object.values(recovery ?? {});
    context.usesRecovery = recovery.map((data, index) => ({
      data,
      prefix: `uses.recovery.${index}.`,
      source: context.uses?.recovery[index] ?? data,
      formulaOptions: data.period === "recharge" ? data.recharge?.options : null
    }));

    return context;
  }

  /** @override */
  _processSubmitData(event, form, submitData) {
    const actor = this.document.parent;
    const item = this.document;

    const FormDataExtended = new foundry.applications.ux.FormDataExtended(this.element);
    const data = foundry.utils.expandObject(FormDataExtended.object);

    data.uses.spent = data.uses.max > data.uses.value ? data.uses.max - data.uses.value : 0;
    const changedUses = foundry.utils.mergeObject(item.system.uses, data.uses);
    const flags = foundry.utils.mergeObject(item.flags, data.flags);
    // Check if the uses object has changed
    this.document.system.uses = changedUses;
    //item.update({ [`system.uses`]: changedUses });
    super._processSubmitData(event, form, { [`system.uses`]: changedUses, "flags": flags });
  }

  /** Dispatch custom actions */
  _onSheetAction(event) {
    const action = event.currentTarget.dataset.action;
    switch (action) {
      case "addRecovery": return this._onAddRecovery();
      case "deleteRecovery": return this._onDeleteRecovery(event.currentTarget);
    }
  }

  static async _addRecovery(event, target) {
    const uses = foundry.utils.duplicate(this.document.system.uses);
    uses.recovery = [...(uses.recovery || []), {}];
    this.document.update({ [`system.uses.recovery`]: uses.recovery });
  }


  static async _deleteRecovery(event, target) {
    const idx = Number(target.closest("[data-index]").dataset.index);
    const uses = foundry.utils.duplicate(this.document.system.uses);
    // Convert object to array if necessary
    if (!Array.isArray(uses.recovery)) {
      uses.recovery = Object.values(uses.recovery || {});
    }
    uses.recovery.splice(idx, 1);
    this.document.update({ [`system.uses.recovery`]: uses.recovery });
  }
}