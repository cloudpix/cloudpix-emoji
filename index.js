'use strict';

const isDev = (process.env.NODE_ENV || 'dev').startsWith('dev');

const notoEmojiSVGs = (() => {
  try {
    return require.context('../noto-emoji/svg/', true, /^\.\/.*\.(svg)$/i);
  } catch (e) {
    isDev && console.error(e);
    return code => null;
  }
})();

const twemojiSVGs = (() => {
  try {
    return require.context('../twemoji/assets/svg/', true, /^\.\/.*\.(svg)$/i);
  } catch (e) {
    isDev && console.error(e);
    return code => null;
  }
})();

const emojis = require('./data/emoji.json');
const categories = [];

function getFromNotoEmoji(code) {
  try {
    return notoEmojiSVGs(`./emoji_u${(code || '').toLowerCase()}.svg`);
  } catch (e) {
    isDev && console.warn(`Couldn't find SVG in Noto for code: ${code}`);
    return null;
  }
}

function getFromTwemoji(code) {
  try {
    return twemojiSVGs(`./${(code || '').replace(/_/g, '-').toLowerCase()}.svg`);
  } catch (e) {
    isDev && console.warn(`Couldn't find SVG in Twemoji for code: ${code}`);
    return null;
  }
}

function getEmoji(code) {
  return getFromNotoEmoji(code) || getFromTwemoji(code);
}

function getCategories() {
  return categories.map(c => ({
    title: c.title,
    fa: c.fa,
    source: c.source
  }));
}

function getSources() {
  return categories
    .filter((c, pos, arr) => arr.map(c2 => c2['source']).indexOf(c['source']) === pos)
    .map(c => (c.source === 'noto-emoji' ? {
      title: 'Noto Color Emoji',
      code: c.source,
      fa: 'fa-google'
    } : c.source === 'twemoji' ? {
      title: 'Twemoji',
      code: c.source,
      fa: 'fa-twitter'
    } : {
      title: c.source,
      code: c.source,
      fa: 'fa-question-mark'
    }));
}

function getAllEmojiByCategoryAndSource(category, source) {
  const list = categories.filter(c => c.title === category && c.source === source).map(c => c.emojis);
  return list.length && list[0] || [];
}

function loadEmojis() {

  emojis.forEach(category => {

    const notoEmojiCategory = {
      title: category.category,
      fa: category.fa,
      source: 'noto-emoji',
      emojis: []
    };
    const twemojiCategory = {
      title: category.category,
      fa: category.fa,
      source: 'twemoji',
      emojis: []
    };

    category.emojis.forEach(emoji => {

      const ne = getFromNotoEmoji(emoji.code);
      ne && notoEmojiCategory.emojis.push({
        code: emoji.code,
        title: emoji.title,
        svg: ne
      });

      const tw = getFromTwemoji(emoji.code);
      tw && twemojiCategory.emojis.push({
        code: emoji.code,
        title: emoji.title,
        svg: tw
      });
    });

    notoEmojiCategory.emojis.length && categories.push(notoEmojiCategory);
    twemojiCategory.emojis.length && categories.push(twemojiCategory);
  });
}

loadEmojis();

function parseEmojione() {

  const emojione = require('./data/emojione.json');
  const categories = [];

  for (const prop in emojione) {

    const e = emojione[prop];

    const category = categories.find(c => c.category === e.category) || (() => {
      const newCategory = {
        category: e.category,
        emojis: []
      };
      categories.push(newCategory);
      return newCategory;
    })();

    const nemEmoji = {
      title: prop.replace(/:/g, '').replace(/_/g, ' '),
      code: e.uc_output.toLowerCase()
        .replace(/-/g, '_')
        // .replace(/_fe0f_/g, '_')
        .replace(/_fe0f/g, '')
    };
    category.emojis.push(nemEmoji);
  }

  const json = JSON.stringify(categories);
  isDev && console.debug(json);
  return json;
}

module.exports = {
  getEmojiByCode: getEmoji,
  getFromNotoEmojiByCode: getFromNotoEmoji,
  getFromTwemojiByCode: getFromTwemoji,
  getSources: getSources,
  getCategories: getCategories,
  getAllEmojiByCategoryAndSource: getAllEmojiByCategoryAndSource,
  //convert: parseEmojione
};
