import unicode2ansi from '@codesigntheory/bnunicode2ansi';
import bijoy2unicode from '@codesigntheory/bnbijoy2unicode';

export const convertToBijoy = (text: string): string => {
    if (!text) return "";
    try {
        // The library might export a function directly or named export. 
        // Types might be missing, so we assume 'any' usage or direct function.
        // Based on common patterns for this author.
        return unicode2ansi(text);
    } catch (e) {
        console.error("Conversion to Bijoy failed", e);
        return text;
    }
};

export const convertToUnicode = (text: string): string => {
    if (!text) return "";
    try {
        return bijoy2unicode(text);
    } catch (e) {
        console.error("Conversion to Unicode failed", e);
        return text;
    }
};
