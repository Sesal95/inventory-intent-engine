export const INVENTORY_INTENT_EXAMPLES = `
Spanish example:
Input: "Se compraron 10 kilos de papa y se quebraron 5 huevos."
Meaning: increase 10 kg of "papa" because of purchase; decrease 5 units of "huevos" because of waste.

English example:
Input: "We received 8 kg of rice and spilled 2 liters of milk."
Meaning: increase 8 kg of "rice" because of purchase; decrease 2 liters of "milk" because of waste.

Ambiguous example:
Input: "Agrega papa."
Meaning: ask in Spanish for the missing quantity and unit. Do not invent them.
`.trim();
