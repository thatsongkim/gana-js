import { KANA_LENGTH } from '../constants';
import hiragana from '../hiragana.json';
import katakana from '../katakana.json';

type Kana = {
  romaji: string;
  kana: string;
};

type Params = {
  excludeIndices: number[];
  isKatakana?: boolean;
};

/**
 * excludeIndices must be sorted in ascending order.
 */
const getRandomKana = ({
  excludeIndices = [],
  isKatakana,
}: Params): object | undefined => {
  if (excludeIndices.length >= KANA_LENGTH) {
    return;
  }

  let randomIndex = Math.floor(Math.random() * KANA_LENGTH);

  for (const excludeIndex of excludeIndices) {
    if (randomIndex === excludeIndex) {
      randomIndex++;
    }
  }

  if (randomIndex >= KANA_LENGTH) {
    randomIndex = 0;
  }

  if (isKatakana) {
    return getKatakana(randomIndex);
  }
  return getHiragana(randomIndex);
};

const getHiragana = (index: number): Kana => {
  return hiragana[index] as Kana;
};

const getKatakana = (index: number): Kana => {
  return katakana[index] as Kana;
};

export default getRandomKana;
