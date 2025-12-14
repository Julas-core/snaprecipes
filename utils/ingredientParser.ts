
/**
 * Common cooking units to strip from ingredient strings.
 * Includes abbreviations and full words.
 */
const COMMON_UNITS = [
    'cup', 'cups',
    'tbsp', 'tbsps', 'tablespoon', 'tablespoons',
    'tsp', 'tsps', 'teaspoon', 'teaspoons',
    'oz', 'ounce', 'ounces',
    'lb', 'lbs', 'pound', 'pounds',
    'g', 'gram', 'grams',
    'kg', 'kilogram', 'kilograms',
    'ml', 'milliliter', 'milliliters',
    'l', 'liter', 'liters',
    'pinch', 'pinches',
    'dash', 'dashes',
    'clove', 'cloves',
    'handful', 'handfuls',
    'slice', 'slices',
    'piece', 'pieces',
    'can', 'cans',
    'bottle', 'bottles',
    'jar', 'jars',
    'package', 'packages',
    'stick', 'sticks',
    'bunch', 'bunches',
    'sprig', 'sprigs'
];

/**
 * Strictly excluded items (household staples that are not purchased).
 * As per user request: Water variants only. Salt/Seasonings are INCLUDED.
 */
const EXCLUDED_ITEMS = new Set([
    'water',
    'boiled water',
    'hot water',
    'cold water',
    'warm water',
    'tap water',
    'ice',
    'ice cubes',
    'crushed ice'
]);

/**
 * Parses a raw ingredient string to produce a clean shopping list item.
 * 
 * Logic:
 * 1. Checks if strictly excluded (e.g. "boiled water") -> Returns null
 * 2. Strips leading quantities (numbers, fractions, ranges)
 * 3. Strips units of measurement
 * 4. Cleans up whitespace/punctuation
 * 
 * @param rawIngredient The raw string from the recipe (e.g., "1/2 cup chopped onions")
 * @returns The cleaned ingredient name (e.g., "chopped onions") or null if it should be skipped
 */
export function parseIngredient(rawIngredient: string): string | null {
    if (!rawIngredient) return null;

    const lowerRaw = rawIngredient.toLowerCase().trim();

    // 1. Check strict exclusion first (exact match or simple containment for water)
    // Using simple check: if the *entire* cleaned string matches an excluded item, or if it's just "Water"
    if (EXCLUDED_ITEMS.has(lowerRaw)) {
        return null;
    }

    // specific check: if it's just a quantity of water (e.g. "1 cup water") we handle it after stripping

    // 2. Strip Quantities
    // Matches: 
    // - "1/2" or "1 1/2"
    // - "1-2"
    // - "1.5"
    // - "1"
    let clean = rawIngredient.replace(/^[\d\s\/\.\-\u00BC-\u00BE\u2150-\u215E]+/, '').trim();

    // 3. Strip Units
    // We iterate specific units to remove them from the start of the string
    // e.g. "cup of flour", "cups flour"
    // Regex logic: ^(unit)(s?)( of)?\s+

    // Sort units by length (descending) to match "tablespoon" before "table" if that was a unit
    const sortedUnits = COMMON_UNITS.sort((a, b) => b.length - a.length);

    // Create a giant regex for units OR check individually? 
    // Regex is cleaner: ^(cup|tbsp|...)(s?)\b(\s*of\b)?\s*
    const unitsPattern = sortedUnits.join('|');
    const unitRegex = new RegExp(`^(${unitsPattern})s?\\b(\\s*of\\b)?\\s*`, 'i');

    clean = clean.replace(unitRegex, '').trim();

    // 4. Final Cleanup
    // Remove specific punctuation that might linger (parentheses details?)
    // E.g. "Flour (all-purpose)" -> Maybe we want to keep "(all-purpose)"?
    // User asked to remove "measurements like 1/2...".

    // Check exclusion again on the CLEANED string
    // e.g. "1 cup water" -> "water" -> Exclude
    if (EXCLUDED_ITEMS.has(clean.toLowerCase())) {
        return null;
    }

    return clean;
}
