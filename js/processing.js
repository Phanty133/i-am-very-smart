/*
To Merriam-Webster,

API key domain-lock, please.

Thanks.
*/

const _KEY_THESAURUS = "798ab6e6-13d5-42d9-91ec-40d2c870632d"; // plz dont steal thank u
const _KEY_DICTIONARY = "160820cc-c00b-4dd4-ab27-d4959ff3cefe"; // plz dont steal thank u

function randInt(min, max) {
	return Math.round(Math.random() * (max - min)) + min;
}

async function getThesaurusDataForWord(word) {
	// eslint-disable-next-line max-len
	const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(word)}?key=${_KEY_THESAURUS}`;

	try {
		const req = await fetch(url);
		return req.json();
	} catch (err) {
		return null;
	}
}

async function getDictionaryDataForWord(word) {
	// eslint-disable-next-line max-len
	const url = `https://dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}?key=${_KEY_DICTIONARY}`;

	try {
		const req = await fetch(url);
		return req.json();
	} catch (err) {
		return null;
	}
}

// Parse only nouns, verbs, and adjectives

async function wordIsConverteable(word) {
	const dictData = await getDictionaryDataForWord(word);

	if (!dictData) return null;

	// Check if the most common definition is parseable
	return ["noun", "verb", "adjective"].includes(dictData[0].fl);
}

async function selectRandomSynonym(word) {
	const thesData = await getThesaurusDataForWord(word);

	if (!thesData) return null;

	const closest = thesData[0];
	const synLists = closest.meta.syns;
	const synList = synLists[0];

	return synList[randInt(0, synList.length - 1)];
}

async function parseWord(word) {
	if (await wordIsConverteable(word)) {
		return selectRandomSynonym(word);
	}

	return word;
}

async function parseText(text) {
	const splitText = text.trim().split(" ");
	const parsePromises = [];

	for (const word of splitText) {
		// Remember punctuation, capitalization

		const wordOutput = {
			startPunctuation: [],
			endPunctuation: [],
			capitalized: !(!word.charAt(0).match(/[A-Z]/)),
		};

		// Check for punctuation on both sides of the word

		const splitWord = word.split("");

		for (let i = 0; i < splitWord.length; i++) {
			if (!splitWord[i].match(/[a-zA-Z]/)) {
				wordOutput.startPunctuation.push(splitWord[i]);
				splitWord.splice(i, 1);
			} else { break; }
		}

		for (let i = splitWord.length - 1; i > 0; i--) {
			if (!splitWord[i].match(/[a-zA-Z]/)) {
				// The index is the number of characters from the end of the word
				wordOutput.endPunctuation.push(splitWord[i]);
				splitWord.splice(i, 1);
			} else { break; }
		}

		const parsedWord = parseWord(splitWord.join(""));

		parsePromises.push(new Promise((res, rej) => {
			parsedWord.then((val) => {
				res({ word: val, ...wordOutput });
			}).catch(rej);
		}));
	}

	const parsedPromises = await Promise.all(parsePromises);

	let parsedText = "";

	for (const wordData of parsedPromises) {
		let parsedWord = wordData.word;

		if (wordData.capitalized) {
			parsedWord = `${parsedWord.charAt(0).toUpperCase()}${parsedWord.substring(1)}`;
		}

		const startPunct = wordData.startPunctuation.join("");
		const endPunct = wordData.endPunctuation.reverse().join("");

		parsedText += `${startPunct}${parsedWord}${endPunct} `;
	}

	return parsedText.trim();
}

async function testConvertable(word) {
	console.log(await wordIsConverteable(word));
}

async function testRandSyn(word) {
	console.log(await selectRandomSynonym(word));
}

async function testParseWord(word) {
	console.log(await parseWord(word));
}

async function testParseText(text) {
	console.log(await parseText(text));
}
