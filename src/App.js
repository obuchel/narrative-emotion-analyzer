

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import * as Papa from 'papaparse';
import _ from 'lodash';
import './styles.css';

// Extended emotion lexicon with more terms for better detection
const EMOTION_LEXICON = {
  "fear": [
    "afraid", "alarmed", "anxious", "apprehensive", "cautious", "concerned", "dread", "fearful",
    "frightened", "hesitant", "horrified", "insecure", "nervous", "panicked", "petrified", 
    "phobic", "scared", "suspicious", "terrified", "threatened", "timid", "uneasy", "worried",
    "shaking", "trembling", "danger", "threat", "escape", "hide", "protect", "defend", "secure",
    "safe", "vulnerable", "exposed", "helpless", "powerless", "weak", "fragile", "flee", "run"
  ],
  "anger": [
    "agitated", "angry", "annoyed", "bitter", "disgusted", "enraged", "exasperated", "furious", 
    "hostile", "indignant", "infuriated", "irritated", "livid", "mad", "outraged", "resentful",
"vexed", "heated", "fuming", "seething", "antagonized", "offended", "provoked", "aggravated",
"hate", "loathe", "despise", "fight", "attack", "conflict", "confront", "defy", "oppose",
"resist", "struggle", "violent", "aggressive", "force", "destroy", "damage", "hurt", "harm"
],
"joy": [
    "amused", "cheerful", "content", "delighted", "ecstatic", "elated", "excited", "glad",
    "gleeful", "happy", "joyful", "jubilant", "lively", "merry", "overjoyed", "pleased",
    "thrilled", "upbeat", "blissful", "euphoric", "radiant", "satisfied", "gratified", "carefree",
    "celebrate", "enjoy", "laugh", "smile", "play", "dance", "sing", "embrace", "love", "adore",
    "cherish", "treasure", "appreciate", "grateful", "thankful", "blessed", "hopeful", "optimistic"
],
"sadness": [
    "anguished", "depressed", "despairing", "despondent", "disappointed", "disheartened", "downcast",
    "gloomy", "grief", "heartbroken", "melancholy", "miserable", "mournful", "regretful", "sad",
    "somber", "sorrowful", "unhappy", "wistful", "desolate", "forlorn", "dejected", "dismal",
    "cry", "tears", "weep", "sob", "mourn", "grieve", "lament", "alone", "lonely", "isolated",
    "abandoned", "rejected", "hopeless", "lost", "empty", "numb", "heavy", "dark", "blue", "down"
],
"surprise": [
    "amazed", "astonished", "astounded", "bewildered", "dazed", "dumbfounded", "flabbergasted",
    "shocked", "startled", "stunned", "surprised", "taken aback", "confused", "perplexed",
    "puzzled", "baffled", "mystified", "unexpected", "sudden", "abrupt", "unpredictable",
    "wonder", "awe", "speechless", "gasp", "wow", "unbelievable", "incredible", "extraordinary",
    "remarkable", "unusual", "strange", "odd", "peculiar", "unexpected", "unforeseen", "unpredicted"
],
"tension": [
    "agitated", "anxious", "apprehensive", "distressed", "disturbed", "edgy", "frantic", "frenzied",
    "jittery", "nervous", "overwhelmed", "restless", "stressed", "tense", "troubled", "uncomfortable",
    "unsettled", "uptight", "worried", "pressured", "strained", "uneasy", "tormented", "tortured",
    "alert", "on edge", "vigilant", "watchful", "wary", "anticipate", "brace", "prepare", "ready",
    "suspense", "intensity", "urgency", "crisis", "pressure", "burden", "strain", "struggle", "conflict"
],
"trust": [
    "accepting", "assured", "believing", "confident", "faithful", "reliant", "secure", "trusting",
    "dependable", "honest", "loyal", "reliable", "responsible", "safe", "supportive", "trustworthy",
    "truthful", "committed", "dedicated", "devoted", "sincere", "genuine", "authentic", "real",
    "rely", "depend", "count on", "believe in", "faith", "confidence", "certainty", "assurance",
    "stability", "steady", "solid", "firm", "strong", "unshakable", "unwavering", "constant"
],
"disgust": [
    "appalled", "displeased", "disgusted", "horrified", "nauseous", "offended", "repelled", "revolted",
    "sickened", "contempt", "disdain", "loathing", "repulsion", "revulsion", "scorn", "aversion",
    "distaste", "unpleasant", "repugnant", "repulsive", "foul", "gross", "nasty", "vile",
    "dirty", "filthy", "rotten", "spoiled", "tainted", "corrupted", "contaminated", "impure",
    "offensive", "objectionable", "disagreeable", "unwelcome", "reject", "refuse", "avoid", "shun"
],
"anticipation": [
    "eager", "expectant", "forward-looking", "hopeful", "optimistic", "poised", "prepared", "ready",
    "waiting", "watchful", "anticipating", "looking forward", "excited", "enthusiastic", "keen",
    "interested", "curious", "intrigued", "fascinated", "engaged", "motivated", "inspired", "driven",
    "await", "expect", "predict", "foresee", "foretell", "plan", "prepare", "imagine", "envision",
    "future", "prospect", "possibility", "potential", "opportunity", "chance", "hope", "desire"
]
};

// Contextual emotion intensifiers and diminishers
const INTENSITY_MODIFIERS = {
    "intensifiers": [
	"very", "extremely", "incredibly", "tremendously", "utterly", "completely", "absolutely",
	"totally", "deeply", "profoundly", "immensely", "exceptionally", "extraordinarily",
	"remarkably", "particularly", "especially", "surprisingly", "intensely", "powerfully",
	"desperately", "wildly", "fiercely", "violently", "severely", "acutely"
    ],
    "negation": [
	"not", "never", "no", "none", "neither", "nor", "hardly", "barely", "scarcely", "seldom",
	"rarely", "nothing", "nobody", "nowhere", "without", "lack", "absence", "missing"
    ]
};

// Emotional phrases and multi-word expressions
const EMOTION_PHRASES = {
    "fear": [
	"scared to death", "afraid of", "terrified of", "frightened by", "in fear of",
	"filled with dread", "paralyzed with fear", "frozen with terror", "scared stiff",
	"heart racing", "cold sweat", "breaking out in sweat", "heart pounding"
    ],
    "anger": [
	"blood boiling", "lost temper", "flew into a rage", "blew up", "saw red",
	"hit the roof", "went ballistic", "exploded with anger", "lashed out",
	"clenched fists", "grinding teeth", "face reddened", "fuming with rage"
    ],
    "joy": [
	"over the moon", "on cloud nine", "walking on air", "jumping for joy",
	"beaming with happiness", "grinning from ear to ear", "tickled pink",
	"heart swelled", "face lit up", "eyes sparkled", "burst with happiness"
    ],
    "sadness": [
	"broken heart", "heavy heart", "heart sank", "brought to tears", "choked up",
	"down in the dumps", "feeling blue", "lost hope", "in despair", "world collapsed",
	"shoulders slumped", "eyes welled up", "fought back tears", "couldn't stop crying"
    ],
    "surprise": [
	"jaw dropped", "eyes widened", "taken by surprise", "out of the blue",
	"caught off guard", "stopped in tracks", "couldn't believe eyes",
	"mouth fell open", "struck speechless", "lost for words", "rendered speechless"
    ],
    "tension": [
	"on edge", "on pins and needles", "walking on eggshells", "holding breath",
	"nerve wracking", "under pressure", "at breaking point", "at wit's end",
	"stomach in knots", "heart in throat", "hair standing on end"
    ]
};

// Narrative arc structure
const DEFAULT_ARC_STRUCTURE = {
    "exposition": { "position": 0.0, "tension_weight": 0.5 },
    "inciting_incident": { "position": 0.12, "tension_weight": 0.8 },
    "rising_action": { "position": 0.4, "tension_weight": 1.2 },
    "climax": { "position": 0.75, "tension_weight": 2.0 },
    "falling_action": { "position": 0.87, "tension_weight": 1.2 },
    "resolution": { "position": 1.0, "tension_weight": 0.6 }
};

// Action verbs for pace indicators
const ACTION_VERBS = new Set([
    "run", "jump", "fight", "hit", "dash", "race", "chase", "escape", "flee",
    "attack", "defend", "shoot", "throw", "grab", "smash", "crash", "explode",
    "rush", "hurry", "sprint", "surge", "blast", "strike", "punch", "kick",
    "slam", "thrust", "dodge", "duck", "dive", "swing", "lunge", "charge"
]);

// Term category weights for tension calculation
const TERM_CATEGORY_WEIGHTS = {
    "fear": 1.5,
    "anger": 0.8,
    "joy": -0.7,
    "sadness": 0.3,
    "surprise": 0.6,
    "tension": 1.7,
    "disgust": 1.2,
    "trust": -0.8,
    "anticipation": 0.5
};

// Colors for emotion visualization
const EMOTION_COLORS = {
    'fear': '#4e79a7',
    'anger': '#e15759',
    'joy': '#59a14f',
    'sadness': '#79706e',
    'surprise': '#edc948',
    'tension': '#f28e2b',
    'trust': '#76b7b2',
    'disgust': '#b07aa1',
    'anticipation': '#bab0ac'
};

function App() {
    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [numSegments, setNumSegments] = useState(6);
    const [segments, setSegments] = useState([]);
    const [emotionProfiles, setEmotionProfiles] = useState([]);
    const [narrativeTension, setNarrativeTension] = useState([]);
    const [storySpecificTerms, setStorySpecificTerms] = useState({});
    const [storySpecificInput, setStorySpecificInput] = useState('');
    const [segmentationMethod, setSegmentationMethod] = useState('auto');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isCustomSegmentation, setIsCustomSegmentation] = useState(false);
    const [customSegments, setCustomSegments] = useState([{ name: 'exposition', content: '' }]);
    const [showHelp, setShowHelp] = useState(false);
    const [useCustomTerms, setUseCustomTerms] = useState(false);
    const [visualizationType, setVisualizationType] = useState('stacked');

    // Function to tokenize text (improved with n-gram support)
    const tokenize = (text, includeNgrams = true) => {
	// Basic tokenization
	const tokens = text.toLowerCase()
	      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
	      .replace(/\s{2,}/g, ' ')
	      .split(/\s+/)
	      .filter(word => word.length > 0);

	if (!includeNgrams) return tokens;

	// Add bigrams and trigrams for phrase detection
	const bigrams = [];
	const trigrams = [];

	for (let i = 0; i < tokens.length - 1; i++) {
	    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);

	    if (i < tokens.length - 2) {
		trigrams.push(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
	    }
	}

	return [...tokens, ...bigrams, ...trigrams];
    };

    // Function to split text into sentences (improved)
    const sentenceTokenize = (text) => {
	// Handle common abbreviations and edge cases
	const preparedText = text
	      .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
	      .replace(/(\b[A-Z][a-z]{1,2})\./g, "$1|") // Handle abbreviations like Mr. Dr. etc.
	      .replace(/\.\.\./g, "…"); // Handle ellipsis

	return preparedText.split(/[|]/).filter(sentence => sentence.trim().length > 0);
    };

    // Function to detect emotional content in text with context awareness
    const detectEmotions = (text) => {
	const tokens = tokenize(text, true);
	const scores = {};

	// Initialize scores for all emotions to zero
	Object.keys(EMOTION_LEXICON).forEach(emotion => {
	    scores[emotion] = 0;
	});

	// Process tokens with a sliding window for context
	for (let i = 0; i < tokens.length; i++) {
	    const token = tokens[i];

	    // Check for emotion words
	    for (const [emotion, words] of Object.entries(EMOTION_LEXICON)) {
		if (words.includes(token)) {
		    // Base score
		    let scoreModifier = 1.0;

		    // Look for intensifiers in context (looking back 2 words)
		    for (let j = Math.max(0, i - 2); j < i; j++) {
			if (INTENSITY_MODIFIERS.intensifiers.includes(tokens[j])) {
			    scoreModifier *= 1.5;
			}
			if (INTENSITY_MODIFIERS.negation.includes(tokens[j])) {
			    scoreModifier *= -0.5; // Negation reverses the emotion
			}
		    }

		    scores[emotion] += scoreModifier;
		}
	    }

	    // Check for emotional phrases
	    for (const [emotion, phrases] of Object.entries(EMOTION_PHRASES)) {
		if (phrases.some(phrase => token.includes(phrase))) {
		    scores[emotion] += 2.0; // Phrases are stronger indicators
		}
	    }
	}

	// Check for sentence structures that suggest emotions (question marks, exclamations)
	if (text.includes('!')) {
	    // Exclamation points suggest intensity - boost the highest emotion
	    const highestEmotion = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
	    scores[highestEmotion] += text.split('!').length - 1;

	    // Also boost surprise and tension
	    scores.surprise += (text.split('!').length - 1) * 0.5;
	    scores.tension += (text.split('!').length - 1) * 0.3;
	}

	if (text.includes('?')) {
	    // Questions often indicate uncertainty, tension, or anticipation
	    scores.tension += (text.split('?').length - 1) * 0.3;
	    scores.anticipation += (text.split('?').length - 1) * 0.3;
	}

	// Normalize scores based on text length to prevent longer texts from dominating
	const textLength = tokens.filter(t => !t.includes(' ')).length; // Only count original tokens
	if (textLength > 20) {
	    const normalizationFactor = Math.sqrt(textLength) / 5;
	    for (const emotion in scores) {
		scores[emotion] = scores[emotion] / normalizationFactor;
	    }
	}

	return scores;
    };

    // Function to analyze emotional content of a text segment
    const analyzeTextSegment = (text, stage = null) => {
	// Get automatically detected emotions
	const automaticScores = detectEmotions(text);
	let scores = { ...automaticScores };

	// If using custom terms, apply story-specific term detection
	if (useCustomTerms && Object.keys(storySpecificTerms).length > 0) {
	    const tokens = tokenize(text, false);

	    for (const [emotion, terms] of Object.entries(storySpecificTerms)) {
		for (const token of tokens) {
		    if (terms.includes(token)) {
			scores[emotion] = (scores[emotion] || 0) + 1.5;
		    }
		}
	    }
	}

	// Apply narrative stage weighting if available
	if (stage && DEFAULT_ARC_STRUCTURE[stage]) {
	    const stageWeight = DEFAULT_ARC_STRUCTURE[stage].tension_weight;

	    // Scale emotions based on narrative position
	    for (const emotion in scores) {
		// Different emotions get different scaling at different points
		if (["fear", "tension", "disgust", "surprise"].includes(emotion)) {
		    // These emotions peak at climax
		    scores[emotion] *= stageWeight;
		} else if (["trust", "joy"].includes(emotion) &&
			   ["falling_action", "resolution"].includes(stage)) {
		    // These emotions peak at resolution
		    scores[emotion] *= stageWeight * 1.5;
		}
	    }
	}

	// Ensure minimum readable values for visualization
	for (const emotion in scores) {
	    if (scores[emotion] < 0.1) {
		scores[emotion] = 0; // Filter out very low values for cleaner charts
	    }
	}

	return scores;
    };

    // Function to calculate narrative tension
    const calculateNarrativeTension = (emotionScores, stage = null) => {
	// Calculate based on emotional weights
	let baseTension = 0;

	for (const [emotion, score] of Object.entries(emotionScores)) {
	    if (TERM_CATEGORY_WEIGHTS[emotion]) {
		baseTension += score * TERM_CATEGORY_WEIGHTS[emotion];
	    }
	}

	// Apply stage-specific modifiers if available
	if (stage && DEFAULT_ARC_STRUCTURE[stage]) {
	    const stageModifier = DEFAULT_ARC_STRUCTURE[stage].tension_weight;
	    return Math.max(0, baseTension * stageModifier);
	}

	return Math.max(0, baseTension);
    };

    // Function to divide text into segments automatically
    const divideTextIntoSegments = (text, numSegments) => {
	const sentences = sentenceTokenize(text);
	const segmentSize = Math.max(1, Math.floor(sentences.length / numSegments));
	const segmentsArray = [];

	for (let i = 0; i < numSegments; i++) {
	    const startIdx = i * segmentSize;
	    const endIdx = i < numSegments - 1 ? startIdx + segmentSize : sentences.length;

	    // Skip if we've run out of sentences
	    if (startIdx >= sentences.length) break;

	    // Determine narrative stage based on relative position
	    const position = numSegments > 1 ? i / (numSegments - 1) : 0.5;
	    const stage = positionToStage(position);

	    segmentsArray.push({
		name: stage,
		content: sentences.slice(startIdx, endIdx).join('. '),
		index: i
	    });
	}

	return segmentsArray;
    };

    // Function to convert position to narrative stage
    const positionToStage = (position) => {
	// Find the closest stage by position
	let closestStage = null;
	let closestDistance = Infinity;

	for (const [stage, data] of Object.entries(DEFAULT_ARC_STRUCTURE)) {
	    const distance = Math.abs(data.position - position);
	    if (distance < closestDistance) {
		closestDistance = distance;
		closestStage = stage;
	    }
	}

	return closestStage;
    };

    // Function to analyze the text
    const analyzeText = () => {
	setIsAnalyzing(true);
	setErrorMessage('');

	try {
	    // Divide text into segments
	    let segmentsArray;
	    if (segmentationMethod === 'auto') {
		segmentsArray = divideTextIntoSegments(text, numSegments);
	    } else {
		segmentsArray = customSegments.map((segment, index) => ({
		    ...segment,
		    index
		}));
	    }

	    // Analyze each segment
	    const emotionProfilesArray = [];
	    const narrativeTensionArray = [];

	    segmentsArray.forEach(segment => {
		const emotionProfile = analyzeTextSegment(segment.content, segment.name);
		emotionProfilesArray.push({
		    ...emotionProfile,
		    stage: segment.name,
		    stageIndex: segment.index,
		    stageName: segment.name.replace('_', ' ')
		});

		const tension = calculateNarrativeTension(emotionProfile, segment.name);
		narrativeTensionArray.push({
		    tension,
		    stage: segment.name,
		    stageIndex: segment.index,
		    stageName: segment.name.replace('_', ' ')
		});
	    });

	    setSegments(segmentsArray);
	    setEmotionProfiles(emotionProfilesArray);
	    setNarrativeTension(narrativeTensionArray);
	} catch (error) {
	    console.error('Error analyzing text:', error);
	    setErrorMessage('Error analyzing text: ' + error.message);
	} finally {
	    setIsAnalyzing(false);
	}
    };

    // Function to parse story-specific terms
    const parseStorySpecificTerms = (input) => {
	try {
	    const lines = input.split('\n');
	    const terms = {};

	    let currentEmotion = null;

	    for (const line of lines) {
		const trimmedLine = line.trim();
		if (!trimmedLine) continue;

		// Check if this is an emotion category line
		if (trimmedLine.endsWith(':')) {
		    currentEmotion = trimmedLine.slice(0, -1).trim().toLowerCase();
		    terms[currentEmotion] = [];
		} else if (currentEmotion) {
		    // Add terms to the current emotion
		    const lineTerms = trimmedLine.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
		    terms[currentEmotion].push(...lineTerms);
		}
	    }

	    setStorySpecificTerms(terms);
	    return true;
	} catch (error) {
	    console.error('Error parsing story-specific terms:', error);
	    setErrorMessage('Error parsing story-specific terms: ' + error.message);
	    return false;
	}
    };

    // Calculate the emotional dominance for each segment
    const calculateDominantEmotions = (emotionProfile) => {
	if (!emotionProfile) return [];

	return Object.entries(emotionProfile)
	    .filter(([key]) => !['stage', 'stageIndex', 'stageName'].includes(key))
	    .filter(([, value]) => value > 0)
	    .sort((a, b) => b[1] - a[1])
	    .slice(0, 3);
    };

    // Function to export analysis as CSV
    const exportAnalysisCSV = () => {
	if (segments.length === 0 || emotionProfiles.length === 0) {
	    setErrorMessage('No analysis data to export.');
	    return;
	}

	try {
	    // Prepare CSV data
	    const csvData = emotionProfiles.map((profile, index) => {
		const segment = segments[index];
		const tension = narrativeTension[index]?.tension || 0;

		const row = {
		    Stage: segment.name.replace('_', ' '),
		    Tension: tension.toFixed(2),
		};

		// Add emotion scores
		Object.entries(profile).forEach(([key, value]) => {
		    if (!['stage', 'stageIndex', 'stageName'].includes(key)) {
			row[key] = value.toFixed(2);
		    }
		});

		return row;
	    });

	    // Convert to CSV string
	    const csvString = Papa.unparse(csvData);

	    // Create and download file
	    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
	    const url = URL.createObjectURL(blob);
	    const link = document.createElement('a');
	    link.setAttribute('href', url);
	    link.setAttribute('download', `${title || 'narrative'}_analysis.csv`);
	    document.body.appendChild(link);
	    link.click();
	    document.body.removeChild(link);
	} catch (error) {
	    console.error('Error exporting CSV:', error);
	    setErrorMessage('Error exporting data: ' + error.message);
	}
    };

    // Handle form submission
    const handleSubmit = (e) => {
	e.preventDefault();

	// Check if we have text to analyze
	if (!text.trim()) {
	    setErrorMessage('Please enter text to analyze.');
	    return;
	}

	// Parse story-specific terms if provided and enabled
	if (useCustomTerms && storySpecificInput.trim()) {
	    const success = parseStorySpecificTerms(storySpecificInput);
	    if (!success) return;
	}

	// Analyze the text
	analyzeText();
    };

    // Handle adding a new custom segment
    const handleAddSegment = () => {
	setCustomSegments([...customSegments, { name: '', content: '' }]);
    };

    // Handle removing a custom segment
    const handleRemoveSegment = (index) => {
	if (customSegments.length > 1) {
	    const newSegments = [...customSegments];
	    newSegments.splice(index, 1);
	    setCustomSegments(newSegments);
	}
    };

    // Handle changing custom segment details
    const handleSegmentChange = (index, field, value) => {
	const newSegments = [...customSegments];
	newSegments[index] = { ...newSegments[index], [field]: value };
	setCustomSegments(newSegments);
    };

    // Toggle segmentation method
    const toggleSegmentationMethod = (method) => {
	setSegmentationMethod(method);
	setIsCustomSegmentation(method === 'custom');
    };

    // Custom tooltip for the stacked area chart
    const CustomTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
	    return (
		    <div className="custom-tooltip">
		    <p className="tooltip-title">{`${label}`}</p>
		    <div className="tooltip-content">
		    {payload.filter(entry => entry.value > 0).map((entry, index) => (
			    <div key={index} className="tooltip-item">
			    <span className="tooltip-color" style={{ backgroundColor: entry.color }}></span>
			    <span className="tooltip-name">{entry.name}: </span>
			    <span className="tooltip-value">{entry.value.toFixed(2)}</span>
			    </div>
		    ))}
		</div>
		    </div>
	    );
	}
	return null;
    };

    return (
	    <div className="app">
	    <header className="header">
	    <div className="container">
	    <h1 className="header-title">Narrative Emotion Analyzer</h1>
	    <p className="header-subtitle">Analyze emotional arcs in text narratives</p>
	    </div>
	    </header>

	    <main className="main container">
	    <div className="card input-card">
	    <div className="card-header">
	    <h2 className="section-title">Input</h2>
	    <button
	onClick={() => setShowHelp(!showHelp)}
	className="help-button"
	    >
	    {showHelp ? 'Hide Help' : 'Show Help'}
	</button>
	    </div>

	{showHelp && (
	        <div className="help-box">
		<h3 className="help-title">How to use this analyzer:</h3>
		<ol className="help-list">
		<li>Enter your text in the main textarea</li>
		<li>Choose whether to split the text automatically or define your own segments</li>
		<li>Optionally add story-specific emotional terms to enhance the analysis</li>
		<li>Select visualization type (stacked area or bar chart)</li>
		<li>Click "Analyze" to see the emotional arcs</li>
		</ol>
		<p className="help-text"><strong>New Feature:</strong> The analyzer now automatically detects emotions without requiring manual word input.</p>
		<p className="help-text"><strong>Story-specific terms format:</strong> Enter each emotion category followed by a colon, then list terms separated by commas.</p>
		<p className="help-example">Example:<br />
		Fear: terrified, horrified<br />
		Joy: ecstatic, delighted</p>
		</div>
	)}

	    <form onSubmit={handleSubmit}>
	    <div className="form-group">
	    <label htmlFor="title" className="form-label">
	    Story Title
	</label>
	    <input
	type="text"
	id="title"
	value={title}
	onChange={(e) => setTitle(e.target.value)}
	className="form-input"
	placeholder="Enter story title"
	    />
	    </div>

	    <div className="form-group">
	    <label htmlFor="text" className="form-label">
	    Text to Analyze
	</label>
	    <textarea
	id="text"
	value={text}
	onChange={(e) => setText(e.target.value)}
	className="form-textarea"
	placeholder="Enter your narrative text here..."
	rows="10"
	    />
	    </div>

	    <div className="form-group">
	    <label className="form-label">Text Segmentation Method</label>
	    <div className="segmentation-options">
	    <button
	type="button"
	className={`segmentation-button ${segmentationMethod === 'auto' ? 'active' : ''}`}
	onClick={() => toggleSegmentationMethod('auto')}
	    >
	    Auto Segment
	</button>
	    <button
	type="button"
	className={`segmentation-button ${segmentationMethod === 'custom' ? 'active' : ''}`}
	onClick={() => toggleSegmentationMethod('custom')}
	    >
	    Custom Segments
	</button>
	    </div>
	    </div>

	{segmentationMethod === 'auto' ? (
	        <div className="form-group">
		<label htmlFor="numSegments" className="form-label">
		Number of Segments
	    </label>
		<input
	    type="number"
	    id="numSegments"
	    value={numSegments}
	    onChange={(e) => setNumSegments(Math.max(2, parseInt(e.target.value) || 2))}
	    className="form-input"
	    min="2"
	    max="20"
	        />
		</div>
	) : (
	        <div className="custom-segments-container">
		<h3 className="segment-section-title">Custom Segments</h3>
		{customSegments.map((segment, index) => (
		        <div key={index} className="custom-segment">
			<div className="segment-header">
			<select
		    value={segment.name}
		    onChange={(e) => handleSegmentChange(index, 'name', e.target.value)}
		    className="segment-name-select"
		        >
			<option value="">Select stage</option>
			<option value="exposition">Exposition</option>
			<option value="inciting_incident">Inciting Incident</option>
			<option value="rising_action">Rising Action</option>
			<option value="climax">Climax</option>
			<option value="falling_action">Falling Action</option>
			<option value="resolution">Resolution</option>
			</select>
			<button
		    type="button"
		    onClick={() => handleRemoveSegment(index)}
		    className="remove-segment-button"
		    disabled={customSegments.length <= 1}
		        >
			Remove
		    </button>
			</div>
			<textarea
		    value={segment.content}
		    onChange={(e) => handleSegmentChange(index, 'content', e.target.value)}
		    placeholder="Enter text for this segment..."
		    className="segment-content-textarea"
		    rows="4"
		        />
			</div>
		))}
	        <button
	    type="button"
	    onClick={handleAddSegment}
	    className="add-segment-button"
	        >
		Add Segment
	    </button>
		</div>
	)}

	    <div className="form-group">
	    <div className="checkbox-group">
	    <input
	type="checkbox"
	id="useCustomTerms"
	checked={useCustomTerms}
	onChange={(e) => setUseCustomTerms(e.target.checked)}
	className="form-checkbox"
	    />
	    <label htmlFor="useCustomTerms" className="checkbox-label">
	    Use custom story-specific emotional terms
	</label>
	    </div>

	{useCustomTerms && (
	        <div className="story-specific-terms">
		<label htmlFor="storySpecificInput" className="form-label">
		Story-specific emotion terms (optional)
	    </label>
		<textarea
	    id="storySpecificInput"
	    value={storySpecificInput}
	    onChange={(e) => setStorySpecificInput(e.target.value)}
	    className="form-textarea"
	    placeholder="Fear: monster, darkness, shadow&#10;Joy: treasure, victory, achievement&#10;..."
	    rows="6"
	        />
		<p className="helper-text">
		Format: Emotion category followed by colon, then comma-separated terms
	    </p>
		</div>
	)}
	</div>

	    <div className="form-group">
	    <label className="form-label">Visualization Type</label>
	    <div className="vis-options">
	    <button
	type="button"
	className={`vis-button ${visualizationType === 'stacked' ? 'active' : ''}`}
	onClick={() => setVisualizationType('stacked')}
	    >
	    Stacked Area
	</button>
	    <button
	type="button"
	className={`vis-button ${visualizationType === 'bar' ? 'active' : ''}`}
	onClick={() => setVisualizationType('bar')}
	    >
	    Bar Chart
	</button>
	    </div>
	    </div>

	    <div className="form-actions">
	    <button type="submit" className="button primary" disabled={isAnalyzing}>
	    {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
	</button>
	    </div>

	{errorMessage && <div className="error-message">{errorMessage}</div>}
	</form>
	    </div>

	{(emotionProfiles.length > 0 && segments.length > 0) && (
	        <div className="card results-card">
		<h2 className="section-title">Analysis Results</h2>

	        <div className="results-header">
		<h3 className="results-title">{title || 'Narrative'} Emotional Arc</h3>
		<button
	    onClick={exportAnalysisCSV}
	    className="export-button"
	        >
		Export CSV
	    </button>
		</div>

	        <div className="visualization-container">
		<h4 className="chart-title">Emotional Profile</h4>

	    {visualizationType === 'stacked' ? (
		    <ResponsiveContainer width="100%" height={400}>
		    <AreaChart
		data={emotionProfiles}
		margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
		    >
		    <CartesianGrid strokeDasharray="3 3" />
		    <XAxis
		dataKey="stageName"
		tick={{ fontSize: 12 }}
		interval={0}
		    />
		    <YAxis />
		    <Tooltip content={<CustomTooltip />} />
		    <Legend />
		    {Object.keys(EMOTION_LEXICON).map((emotion) => (
			    <Area
			key={emotion}
			type="monotone"
			dataKey={emotion}
			stackId="1"
			stroke={EMOTION_COLORS[emotion]}
			fill={EMOTION_COLORS[emotion]}
			    />
		    ))}
		</AreaChart>
		    </ResponsiveContainer>
	    ) : (
		    <ResponsiveContainer width="100%" height={400}>
		    <BarChart
		data={emotionProfiles}
		margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
		    >
		    <CartesianGrid strokeDasharray="3 3" />
		    <XAxis
		dataKey="stageName"
		tick={{ fontSize: 12 }}
		interval={0}
		    />
		    <YAxis />
		    <Tooltip />
		    <Legend />
		    {Object.keys(EMOTION_LEXICON).map((emotion) => (
			    <Bar
			key={emotion}
			dataKey={emotion}
			fill={EMOTION_COLORS[emotion]}
			    />
		    ))}
		</BarChart>
		    </ResponsiveContainer>
	    )}
	    </div>

	        <div className="visualization-container">
		<h4 className="chart-title">Narrative Tension</h4>
		<ResponsiveContainer width="100%" height={300}>
		<AreaChart
	    data={narrativeTension}
	    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
	        >
		<CartesianGrid strokeDasharray="3 3" />
		<XAxis
	    dataKey="stageName"
	    tick={{ fontSize: 12 }}
	    interval={0}
	        />
		<YAxis />
		<Tooltip />
		<Area
	    type="monotone"
	    dataKey="tension"
	    stroke="#8884d8"
	    fill="#8884d8"
	        />
		</AreaChart>
		</ResponsiveContainer>
		</div>

	        <div className="segments-breakdown">
		<h4 className="breakdown-title">Segment Analysis</h4>
		<div className="segments-list">
		{segments.map((segment, index) => {
		    const emotionProfile = emotionProfiles[index];
		    const dominantEmotions = calculateDominantEmotions(emotionProfile);

		    return (
			    <div key={index} className="segment-analysis">
			    <h5 className="segment-name">
			    {segment.name.replace('_', ' ')}
			</h5>
			    <div className="segment-content">
			    <p>{segment.content}</p>
			    </div>
			    <div className="segment-emotions">
			    <h6>Dominant Emotions:</h6>
			    <ul className="emotions-list">
			    {dominantEmotions.map(([emotion, value], i) => (
				    <li key={i}>
				    <span
				className="emotion-dot"
				style={{ backgroundColor: EMOTION_COLORS[emotion] }}
				    ></span>
				    <span className="emotion-name">{emotion}</span>
				    <span className="emotion-value">({value.toFixed(2)})</span>
				    </li>
			    ))}
			</ul>
			    </div>
			    </div>
		    );
		})}
	    </div>
		</div>
		</div>
	)}
	</main>

	    <footer className="footer">
	    <div className="container">
	    <p>&copy; {new Date().getFullYear()} Narrative Emotion Analyzer</p>
	    </div>
	    </footer>
	    </div>
    );
}

export default App;
                
