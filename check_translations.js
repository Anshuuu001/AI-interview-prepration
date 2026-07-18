import { translations } from './src/utils/translations.js';

const englishKeys = Object.keys(translations.english);
const hindiKeys = Object.keys(translations.hindi);
const marathiKeys = Object.keys(translations.marathi);

console.log('English keys count:', englishKeys.length);
console.log('Hindi keys count:', hindiKeys.length);
console.log('Marathi keys count:', marathiKeys.length);

const findMissing = (keys1, keys2, name1, name2) => {
  const missing = keys1.filter(k => !keys2.includes(k));
  if (missing.length > 0) {
    console.log(`Keys in ${name1} but missing in ${name2}:`, missing);
  } else {
    console.log(`No keys missing in ${name2} compared to ${name1}`);
  }
};

findMissing(englishKeys, hindiKeys, 'English', 'Hindi');
findMissing(englishKeys, marathiKeys, 'English', 'Marathi');
findMissing(hindiKeys, englishKeys, 'Hindi', 'English');
findMissing(marathiKeys, englishKeys, 'Marathi', 'English');
