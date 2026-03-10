/**
 * Query normalizer for Hindi, English, and Hinglish queries.
 * Converts mixed-language queries to a normalized form for better embedding matching.
 */

// Common Hinglish to English mappings
const HINGLISH_MAP: Record<string, string> = {
    'kya': 'what',
    'kaise': 'how',
    'kab': 'when',
    'kahan': 'where',
    'kyun': 'why',
    'kaun': 'who',
    'kitna': 'how much',
    'kitni': 'how much',
    'kitne': 'how many',
    'chahiye': 'required',
    'chahie': 'required',
    'zaruri': 'required',
    'zaroori': 'required',
    'jaruri': 'required',
    'lagta': 'needed',
    'lagti': 'needed',
    'lagte': 'needed',
    'ke liye': 'for',
    'ke lye': 'for',
    'keliye': 'for',
    'kaise kare': 'how to do',
    'kaise karein': 'how to do',
    'kaise karna': 'how to do',
    'kaise hota': 'how does it happen',
    'batao': 'tell me',
    'bataiye': 'tell me',
    'bata do': 'tell me',
    'documents': 'documents',
    'dastavez': 'documents',
    'kagaj': 'documents',
    'kya kya': 'what all',
    'scholarship': 'scholarship',
    'chhatravritti': 'scholarship',
    'naukri': 'job',
    'nokri': 'job',
    'form': 'form',
    'bhariye': 'fill',
    'bharna': 'fill',
    'bharo': 'fill',
    'bharein': 'fill',
    'bhar do': 'fill',
    'banwana': 'make',
    'banwao': 'make',
    'banana': 'make',
    'bana do': 'make',
    'karna hai': 'need to do',
    'karwana hai': 'need to get done',
    'paisa': 'money',
    'paise': 'money',
    'kitne paise': 'how much money',
    'fees': 'fee',
    'samay': 'time',
    'waqt': 'time',
    'din': 'days',
    'mahina': 'month',
    'saal': 'year',
    'sarkari': 'government',
    'sarkaari': 'government',
    'online': 'online',
    'apply': 'apply',
    'avedan': 'apply',
    'aavedan': 'apply',
    'last date': 'last date',
    'aakhiri tarikh': 'last date',
    'antim tithi': 'last date',
    'yogyata': 'eligibility',
    'eligibility': 'eligibility',
    'patra': 'eligible',
    'aadhar': 'aadhaar',
    'aadhaar': 'aadhaar',
    'pan card': 'pan card',
    'pan': 'pan',
    'income certificate': 'income certificate',
    'aay praman patra': 'income certificate',
    'caste certificate': 'caste certificate',
    'jati praman patra': 'caste certificate',
    'domicile': 'domicile',
    'niwas praman patra': 'domicile',
    'service': 'service',
    'seva': 'service',
    'suvidha': 'service',
    'madad': 'help',
    'sahayata': 'help',
    'help': 'help',
};

// Hindi/Hinglish stopwords to remove
const STOPWORDS = new Set([
    'hai', 'hain', 'tha', 'thi', 'the', 'ho', 'hota',
    'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'par', 'pe',
    'yeh', 'ye', 'woh', 'wo', 'is', 'us', 'iss', 'uss',
    'aur', 'ya', 'bhi', 'sirf', 'bas',
    'mera', 'meri', 'mere', 'tera', 'teri', 'tere',
    'apna', 'apni', 'apne', 'hamara', 'humara',
    'the', 'is', 'it', 'in', 'on', 'at', 'to', 'a', 'an',
    'and', 'or', 'of', 'do', 'i', 'me', 'my', 'we', 'you',
    'was', 'be', 'by', 'with', 'from', 'that', 'this',
    'are', 'has', 'have', 'will', 'can', 'sir', 'please', 'ji',
    'kya', // keep as question signal but remove as stopword for cleaner text
]);

/**
 * Normalize a user query:
 * 1. Lowercase
 * 2. Remove special chars (keep alphanumeric + spaces)
 * 3. Replace multi-word Hinglish phrases first
 * 4. Replace single-word Hinglish tokens
 * 5. Remove stopwords
 * 6. Trim excess whitespace
 */
export function normalizeQuery(query: string): string {
    let normalized = query.toLowerCase().trim();

    // Remove punctuation except hyphens within words
    normalized = normalized.replace(/[^\w\s-]/g, ' ');

    // Replace multi-word Hinglish phrases (longest first)
    const multiWordKeys = Object.keys(HINGLISH_MAP)
        .filter(k => k.includes(' '))
        .sort((a, b) => b.length - a.length);

    for (const phrase of multiWordKeys) {
        const regex = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'gi');
        normalized = normalized.replace(regex, HINGLISH_MAP[phrase]);
    }

    // Replace single-word Hinglish tokens
    const words = normalized.split(/\s+/);
    const translated = words.map(word => {
        const mapped = HINGLISH_MAP[word];
        return mapped || word;
    });

    // Remove stopwords
    const filtered = translated.filter(w => w.length > 1 && !STOPWORDS.has(w));

    // Collapse whitespace
    return filtered.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Prepare text for embedding generation.
 * Combines original and normalized forms for better matching.
 */
export function prepareForEmbedding(text: string): string {
    const normalized = normalizeQuery(text);
    // Use both original and normalized to capture meaning from both
    return `${text.toLowerCase()} ${normalized}`;
}
