import { DEFAULT_REQUIRED_STREAK } from './constants';
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

  while (true) {
    const kana = getRandomKana({
      excludeIndices:
        history.solvedIndices[isKatakana ? 'katakana' : 'hiragana'],
      isKatakana,
    });

    const answer = await question(
      '\n' + kana?.kana + ': ' || 'All kana have been solved. Exit?(exit): ',
    );
    if (answer === 'exit') {
      break;
    }
    if (answer.startsWith('set')) {
      const [_, command, ...args] = answer.split(' ');
      if (command === 'streak') {
        history.requiredStreak = parseInt(args?.[0] || '8');
        continue;
      } else if (command === 'erase') {
        if (args?.[0] === 'hi') {
          history.solvedIndices.hiragana = [];
          continue;
        } else if (args?.[0] === 'ga') {
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
        history.solvedIndices[isKatakana ? 'katakana' : 'hiragana'].push(
          kana.index,
        );
        delete correctStreaks[kana.romaji];
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
      if (history.showsCorrectAnswer) {
        console.clear();
        console.log(
          'Correct answer for ' + kana?.kana + ' was ' + kana?.romaji,
        );
      }
    }
  }

  rl.close();
  fs.writeFileSync('history.json', JSON.stringify(history, null, 2));
})();
