const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Cache for counts to avoid repeated queries
let cachedCounts = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
let lastCacheTime = 0;

// Define valid kana units by script type
const hiraganaUnits = [
    // Basic hiragana
    'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'ん',
    // Dakuten/Handakuten hiragana
    'が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど',
    'ば', 'び', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
    // Digraphs (yoon) hiragana
    'きゃ', 'きゅ', 'きょ', 'ぎゃ', 'ぎゅ', 'ぎょ', 'しゃ', 'しゅ', 'しょ', 'じゃ', 'じゅ', 'じょ',
    'ちゃ', 'ちゅ', 'ちょ', 'にゃ', 'にゅ', 'にょ', 'ひゃ', 'ひゅ', 'ひょ', 'びゃ', 'びゅ', 'びょ',
    'ぴゃ', 'ぴゅ', 'ぴょ', 'みゃ', 'みゅ', 'みょ', 'りゃ', 'りゅ', 'りょ',
    // Small hiragana
    'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'っ', 'ゃ', 'ゅ', 'ょ'
];

const katakanaUnits = [
    // Basic katakana
    'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ',
    'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
    'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ン',
    // Dakuten/Handakuten katakana
    'ガ', 'ギ', 'グ', 'ゲ', 'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'ダ', 'ヂ', 'ヅ', 'デ', 'ド',
    'バ', 'ビ', 'ブ', 'ベ', 'ボ', 'パ', 'ピ', 'プ', 'ペ', 'ポ',
    // Digraphs (yoon) katakana
    'キャ', 'キュ', 'キョ', 'ギャ', 'ギュ', 'ギョ', 'シャ', 'シュ', 'ショ', 'ジャ', 'ジュ', 'ジョ',
    'チャ', 'チュ', 'チョ', 'ニャ', 'ニュ', 'ニョ', 'ヒャ', 'ヒュ', 'ヒョ', 'ビャ', 'ビュ', 'ビョ',
    'ピャ', 'ピュ', 'ピョ', 'ミャ', 'ミュ', 'ミョ', 'リャ', 'リュ', 'リョ',
    // Small katakana
    'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ッ', 'ャ', 'ュ', 'ョ',
    // Additional katakana for foreign sounds
    'ヴ', 'ヴァ', 'ヴィ', 'ヴェ', 'ヴォ', 'シェ', 'ジェ', 'チェ',
    'ツァ', 'ツィ', 'ツェ', 'ツォ', 'ファ', 'フィ', 'フェ', 'フォ',
    'ティ', 'トゥ', 'ディ', 'ドゥ', 'ウィ', 'ウェ', 'ウォ'
];


// Combined list for parsing
const validKanaUnits = [...hiraganaUnits, ...katakanaUnits];

// Function to determine script type of a character
function getScriptType(char) {
    if (hiraganaUnits.includes(char)) {
        return 'hiragana';
    } else if (katakanaUnits.includes(char)) {
        return 'katakana';
    } else {
        return 'other';
    }
}

// Generate unique random IDs
function generateRandomIds(min, max, count) {
    const randomIds = new Set();
    const maxAttempts = count * 5;
    let attempts = 0;
    
    while (randomIds.size < count && attempts < maxAttempts) {
        const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
        randomIds.add(Number(randomId));
        attempts++;
    }
    
    return Array.from(randomIds);
}

exports.handler = async (event) => {
    const jlptLevel = event.queryStringParameters?.jlptLevel || 'N5';
    const targetWords = 10;

    try {
        let selectedWords = [];
        
        if (jlptLevel.toLowerCase() === 'all') {
            // Use the new simple table for all levels
            selectedWords = await getRandomWordsByIds(targetWords, 'JapaneseWords_All');
        } else {
            // Use specific level table
            const tableName = `JapaneseWords_${jlptLevel}`;
            selectedWords = await getRandomWordsByIds(targetWords, tableName);
        }

        // Helper function to parse reading into units (include ALL characters)
        const parseKanaUnits = (reading) => {
            const units = [];
            let i = 0;
            while (i < reading.length) {
                const twoChar = reading.slice(i, i + 2);
                if (validKanaUnits.includes(twoChar)) {
                    units.push(twoChar);
                    i += 2;
                } else {
                    const singleChar = reading[i];
                    // Include ALL characters, even if not in validKanaUnits
                    units.push(singleChar);
                    i += 1;
                }
            }
            return units;
        };

        // For each word, hide a random kana unit and generate options
        const gameWords = selectedWords.slice(0, targetWords).map(word => {
            const reading = word.reading;
            const kanaUnits = parseKanaUnits(reading);
            if (kanaUnits.length === 0) {
                return { ...word, hiddenReading: reading, correctChar: '', options: [] };
            }

            // Only hide characters that are in validKanaUnits (hiragana/katakana)
            const hideableUnits = kanaUnits
                .map((unit, index) => ({ unit, index }))
                .filter(item => validKanaUnits.includes(item.unit));
            
            if (hideableUnits.length === 0) {
                return { ...word, hiddenReading: reading, correctChar: '', options: [] };
            }
            
            const randomHideable = hideableUnits[Math.floor(Math.random() * hideableUnits.length)];
            const hideIndex = randomHideable.index;
            const hiddenUnit = randomHideable.unit;
            
            // Create hidden reading by replacing the unit with single underscore
            let hiddenReading = '';
            
            for (let i = 0; i < kanaUnits.length; i++) {
                if (i === hideIndex) {
                    // Always use single underscore regardless of unit length
                    hiddenReading += '_';
                } else {
                    hiddenReading += kanaUnits[i];
                }
            }

            // Generate options based on script type of hidden character
            const scriptType = getScriptType(hiddenUnit);
            let optionPool;
            
            if (scriptType === 'hiragana') {
                optionPool = hiraganaUnits;
            } else {
                optionPool = katakanaUnits;
            } 
            
            const options = [hiddenUnit];
            while (options.length < 4) {
                const randomUnit = optionPool[Math.floor(Math.random() * optionPool.length)];
                if (!options.includes(randomUnit)) {
                    options.push(randomUnit);
                }
            }
            options.sort(() => Math.random() - 0.5);

            return {
                ...word,
                hiddenReading: hiddenReading,
                correctChar: hiddenUnit,
                options
            };
        });

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                count: gameWords.length,
                level: jlptLevel,
                words: gameWords
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                error: 'Failed to fetch words',
                details: error.message
            })
        };
    }
};

// Function to get total count from table
async function getTableCount(tableName) {
    const now = Date.now();
    const cacheKey = tableName;
    
    // Use cached count if recent
    if (cachedCounts && cachedCounts[cacheKey] && 
        (now - lastCacheTime) < CACHE_DURATION) {
        return cachedCounts[cacheKey];
    }
    
    try {
        const params = {
            TableName: tableName,
            Select: 'COUNT'
        };
        
        const result = await dynamodb.scan(params).promise();
        const totalCount = result.Count;
        
        if (totalCount === 0) {
            throw new Error(`No items found in table ${tableName}`);
        }
        
        // Initialize cache object if it doesn't exist
        if (!cachedCounts) {
            cachedCounts = {};
        }
        
        // Cache the count
        cachedCounts[cacheKey] = totalCount;
        lastCacheTime = now;
        
        return totalCount;
        
    } catch (error) {
        // Fallback to known counts
        const fallbacks = {
            'JapaneseWords_All': 7904,
            'JapaneseWords_N1': 2685,
            'JapaneseWords_N2': 1741,
            'JapaneseWords_N3': 2102,
            'JapaneseWords_N4': 666,
            'JapaneseWords_N5': 710
        };
        return fallbacks[tableName] || 1000;
    }
}

// Simple random ID generation for any table
async function getRandomWordsByIds(targetCount, tableName) {
    // Get total count for this table
    const totalCount = await getTableCount(tableName);
    
    // Generate random IDs from 1 to totalCount (get extra in case some don't exist)
    const randomIds = generateRandomIds(1, totalCount, targetCount * 2);
    
    // Batch get all items from specified table
    const params = {
        RequestItems: {
            [tableName]: {
                Keys: randomIds.map(id => ({ id: Number(id) }))
            }
        }
    };
    
    const result = await dynamodb.batchGet(params).promise();
    const items = result.Responses?.[tableName] || [];
    
    // Return up to targetCount items
    return items.slice(0, targetCount);
}