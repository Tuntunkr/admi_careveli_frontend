/** Convert string to Title Case (e.g. "KOJIC ACID" → "Kojic Acid") */
export const toTitleCase = (str = '') =>
    String(str)
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
