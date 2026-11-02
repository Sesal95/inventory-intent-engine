export const INVENTORY_INTENT_EXAMPLES = `
Spanish purchase with missing price:
Input: "Se compraron 10 kilos de papa y se quebraron 5 huevos."
Meaning: preserve increase 10 kg of "papa" (purchase, pending price) and decrease 5 units of "huevos" (waste, purchasePrice null). Ask in Spanish for purchase price; offer a supplied reference in the same question if available.

English fractional purchase:
Input: "I bought half pound of meet for 30k total."
Meaning: increase 0.5 lb of "meet", purchase, provided total price 30000 in configured currency. Preserve the spelling "meet".

Explicit pending price:
Input: "Compré 2 libras de carne, no tengo el precio."
Meaning: ready, increase 2 lb of "carne", pending price with user_unavailable.

Reference confirmation (only with a matching supplied reference):
Input: "Compré 10 kg de papa; usa el precio de referencia propuesto."
Meaning: confirmed_reference using the exact supplied price for "papa". Without a matching reference ask for price instead.

Ambiguous example:
Input: "Agrega papa."
Meaning: ask in Spanish for quantity, unit, and reason. Do not invent them.
`.trim();
