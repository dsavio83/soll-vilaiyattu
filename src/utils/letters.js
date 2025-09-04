const TAMIL_POOL = [
  // உயிரெழுத்துகள் (12)
  'அ','ஆ','இ','ஈ','உ','ஊ','எ','ஏ','ஐ','ஒ','ஓ','ஔ',

  // மெய்யெழுத்துகள் (18)
  'க்','ங்','ச்','ஞ்','ட்','ண்','த்','ந்','ப்','ம்','ய்','ர்','ல்','வ்','ழ்','ள்','ற்','ன்',

  // ஆய்த எழுத்து
  'ஃ',

  // Grantha எழுத்துகள் (வடமொழி எழுத்துகள்)
  'ஜ','ஷ','ஸ','ஹ','க்ஷ','ஶ','ஶ்ரீ',

  // உயிர்மெய்யெழுத்துகள் (216)
  'க','கா','கி','கீ','கு','கூ','கெ','கே','கை','கொ','கோ','கௌ',
  'ங','ஙா','ஙி','ஙீ','ஙு','ஙூ','ஙெ','ஙே','ஙை','ஙொ','ஙோ','ஙௌ',
  'ச','சா','சி','சீ','சு','சூ','செ','சே','சை','சொ','சோ','சௌ',
  'ஞ','ஞா','ஞி','ஞீ','ஞு','ஞூ','ஞெ','ஞே','ஞை','ஞொ','ஞோ','ஞௌ',
  'ட','டா','டி','டீ','டு','டூ','டெ','டே','டை','டொ','டோ','டௌ',
  'ண','ணா','ணி','ணீ','ணு','ணூ','ணெ','ணே','ணை','ணொ','ணோ','ணௌ',
  'த','தா','தி','தீ','து','தூ','தெ','தே','தை','தொ','தோ','தௌ',
  'ந','நா','நி','நீ','நு','நூ','நெ','நே','நை','நொ','நோ','நௌ',
  'ப','பா','பி','பீ','பு','பூ','பெ','பே','பை','பொ','போ','பௌ',
  'ம','மா','மி','மீ','மு','மூ','மெ','மே','மை','மொ','மோ','மௌ',
  'ய','யா','யி','யீ','யு','யூ','யெ','யே','யை','யொ','யோ','யௌ',
  'ர','ரா','ரி','ரீ','ரு','ரூ','ரெ','ரே','ரை','ரொ','ரோ','ரௌ',
  'ல','லா','லி','லீ','லு','லூ','லெ','லே','லை','லொ','லோ','லௌ',
  'வ','வா','வி','வீ','வு','வூ','வெ','வே','வை','வொ','வோ','வௌ',
  'ழ','ழா','ழி','ழீ','ழு','ழூ','ழெ','ழே','ழை','ழொ','ழோ','ழௌ',
  'ள','ளா','ளி','ளீ','ளு','ளூ','ளெ','ளே','ளை','ளொ','ளோ','ளௌ',
  'ற','றா','றி','றீ','று','றூ','றெ','றே','றை','றொ','றோ','றௌ',
  'ன','னா','னி','னீ','னு','னூ','னெ','னே','னை','னொ','னோ','னௌ'
];

// பிரித்தெடுக்கும்போது whitespace-ஐ நீக்குவது
// comma-separated string-ஐ சரியாக 6 எழுத்துக்களாக பிரிக்கும்
export function splitSurrounding(input) {
  if (!input) return [];
  const letters = input.split(',').map(s => s.trim()).filter(Boolean);
  // duplicate எழுத்துக்களை நீக்கும்
  return [...new Set(letters)];
}

// 6 எழுத்துக்கள் இல்லையென்றால் புதிய தொகுப்பு உருவாக்கும்
// duplicate எழுத்துக்களை தவிர்க்கும்
export function generateRandomLetters() {
  const pick = () => TAMIL_POOL[Math.floor(Math.random() * TAMIL_POOL.length)];
  const center = pick();
  const surrounding = [];
  const usedLetters = new Set([center]); // center எழுத்தையும் சேர்க்கிறோம்
  
  while (surrounding.length < 6) {
    const letter = pick();
    if (!usedLetters.has(letter)) {
      surrounding.push(letter);
      usedLetters.add(letter);
    }
  }
  
  return { center, surrounding };
}

// validate செய்; சரியில்லை என்றால் auto-fix செய்து result-ஐ திருப்பு
// center: string, surroundingInput: comma-separated string
export function validateAndAutoFix(center, surroundingInput) {
  const surroundingArr = splitSurrounding(surroundingInput);
  const centerTrimmed = center ? center.trim() : '';
  
  // center எழுத்து valid ஆக இருக்கிறதா மற்றும் சுற்றெழுத்துக்கள் சரியாக 6 ஆக இருக்கிறதா
  const validCenter = centerTrimmed.length > 0;
  const validSurrounding = surroundingArr.length === 6;
  
  // center எழுத்து surrounding-ல் இல்லை என்பதை உறுதிப்படுத்தும்
  const noDuplicateWithCenter = !surroundingArr.includes(centerTrimmed);
  
  const valid = validCenter && validSurrounding && noDuplicateWithCenter;
  
  if (valid) {
    return { center: centerTrimmed, surrounding: surroundingArr, fixed: false };
  }
  
  // not valid -> generate new set
  const generated = generateRandomLetters();
  return { center: generated.center, surrounding: generated.surrounding, fixed: true };
}