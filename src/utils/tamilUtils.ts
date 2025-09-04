
// Utility function to get proper Tamil character grouping
export const getGraphemeClusters = (text: string): string[] => {
  // Check if Intl.Segmenter is available
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new (Intl as any).Segmenter('ta', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (segment: any) => segment.segment);
    } catch (error) {
      // Fallback if segmenter fails
    }
  }
  
  // Fallback: Simple character splitting for Tamil
  // This handles basic Tamil characters but may not be perfect for all combinations
  const chars = [];
  let i = 0;
  while (i < text.length) {
    let char = text[i];
    
    // Check for combining characters (Tamil vowel signs, etc.)
    if (i + 1 < text.length) {
      const nextChar = text[i + 1];
      const combined = char + nextChar;
      
      // Tamil vowel signs and other combining marks
      if (nextChar >= '\u0BBE' && nextChar <= '\u0BCC') {
        char = combined;
        i++;
      }
    }
    
    chars.push(char);
    i++;
  }
  
  return chars;
};

// Function to validate a Tamil word
export const isValidTamilWord = (
  word: string,
  centerLetter: string,
  requiredLength: number
): { isValid: boolean; error?: string } => {
  // 1. Check for valid Tamil characters (using a simple regex for the Tamil block)
  const tamilRegex = /^[\u0B80-\u0BFF]+$/;
  if (!tamilRegex.test(word)) {
    return {
      isValid: false,
      error: 'Only Tamil letters are allowed.',
    };
  }

  // 2. Check if the word includes the center letter
  if (!word.includes(centerLetter)) {
    return {
      isValid: false,
      error: `The word must include the center letter: ${centerLetter}`,
    };
  }

  // 3. Check for the exact length using grapheme clusters
  const graphemes = getGraphemeClusters(word);
  if (graphemes.length !== requiredLength) {
    return {
      isValid: false,
      error: `The word must be exactly ${requiredLength} letters long.`,
    };
  }

  return { isValid: true };
};
