export const toSentenceCase = (str: string): string => {
    if (!str) return "";
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
};

export const toTitleCase = (str: string): string => {
    if (!str) return "";
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

export const removeExtraSpaces = (str: string): string => {
    if (!str) return "";
    return str.replace(/\s+/g, " ").trim();
};

export const getWordCount = (str: string): number => {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
};

export const getCharCount = (str: string): number => {
    if (!str) return 0;
    return str.length;
};
