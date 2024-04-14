import { DEFAULT_REQUIRED_STREAK, KANA_LENGTH } from './constants';
import * as fs from 'fs';
import * as readline from 'readline';
import getRandomKana from './utils/getRandomKana';

type History = {
  solvedIndices: {
    hiragana: number[];
    katakana: number[];
  };
  requiredStreak: number;
  showsCorrectAnswer: boolean;
};

const defaultHistory: History = {
  solvedIndices: {
    hiragana: [],
    katakana: [],
  },
  requiredStreak: DEFAULT_REQUIRED_STREAK,
  showsCorrectAnswer: true,
};

(async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let history: History;
  if (!fs.existsSync('history.json')) {
    fs.writeFileSync('history.json', JSON.stringify(defaultHistory, null, 2));
    history = defaultHistory;
  } else {
    history = JSON.parse(fs.readFileSync('history.json', 'utf8'));
  }
  const correctStreaks = {};

  const question = async (question: string) => {
    return new Promise<string>((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  };

  const isKatakana =
    (await question('Select hiragana(hi) or katakana(ka): ')) === 'ka';

  console.clear();

  let solvedIndices =
    history.solvedIndices[isKatakana ? 'katakana' : 'hiragana'];

  if (solvedIndices.length >= KANA_LENGTH) {
    solvedIndices = [];
  }

  while (true) {
    if (solvedIndices.length >= KANA_LENGTH) {
      console.log('All kana have been solved.');
      break;
    }
    const kana = getRandomKana({
      excludeIndices: solvedIndices,
      isKatakana,
    });

    const answer = await question(
      '\n' + kana?.kana + ': ' || 'All kana have been solved. Exit?(exit): ',
    );
    if (answer === 'exit') {
      break;
    }
    if (answer.startsWith('set')) {
      const command = answer.split(' ');
      if (command[1] === 'streak') {
        history.requiredStreak = parseInt(command[2] || '8');
        continue;
      } else if (command[1] === 'erase') {
        if (command[2] === 'hi') {
          history.solvedIndices.hiragana = [];
          continue;
        } else if (command[2] === 'ga') {
          history.solvedIndices.katakana = [];
          continue;
        }
        history.solvedIndices.hiragana = [];
        history.solvedIndices.katakana = [];
        continue;
      }
    }

    if (answer === kana?.romaji) {
      console.clear();
      if (!correctStreaks[kana.romaji]) {
        correctStreaks[kana.romaji] = 1;
      } else {
        correctStreaks[kana.romaji]++;
      }

      if (correctStreaks[kana.romaji] >= history.requiredStreak) {
        solvedIndices.push(kana.index);
        solvedIndices.sort((a, b) => a - b);
        console.log(
          kana?.kana + ' reached ' + history.requiredStreak + ' streak!',
        );
      } else {
        console.log(
          'Correct!(' +
            correctStreaks[kana.romaji] +
            '/ ' +
            history.requiredStreak +
            ')',
        );
      }
    } else {
      console.clear();
      delete correctStreaks?.[kana?.romaji || ''];
      if (history.showsCorrectAnswer) {
        console.log(
          'Correct answer for ' + kana?.kana + ' was ' + kana?.romaji,
        );
      }
    }
  }

  history.solvedIndices[isKatakana ? 'katakana' : 'hiragana'] = solvedIndices;

  rl.close();
  fs.writeFileSync('history.json', JSON.stringify(history, null, 2));
})();
