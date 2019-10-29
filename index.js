'use strict';

const notoEmojiSVGs = require.context('../noto-emoji/svg/', true, /^\.\/.*\.(jpe?g|png|gif|svg|ico)$/i);
const twemojiSVGs = require.context('../twemoji/assets/svg/', true, /^\.\/.*\.(jpe?g|png|gif|svg|ico)$/i);

const emojis = require('./data/emoji.json');

function getEmoji(code) {
  let svg;
  try {
    svg = notoEmojiSVGs('./emoji_u' + (code || '').toLowerCase() + '.svg');
  } catch (e) {
    try {
      svg = twemojiSVGs('./' + (code || '').replace(/-/g, '-').toLowerCase() + '.svg');
    } catch (e2) {

    }
  }
  return svg;
}

function getCategories() {
  return (emojis || []).filter(c => c.category).map(c => ({
    title: c.category,
    fa: c.fa
  }));
}

function getAllEmojiByCategory(category) {
  const list = emojis.filter(c => c.category === category).map(c => c.emojis);
  return list.length && list[0] || [];
}

function init() {
  emojis.forEach(c => c.emojis.forEach(e => {
    try {
      e.svg = getEmoji(e.code);
    } catch (e) {
      e.invalid = true;
      e.error = e;
      console.error(e);
    }
  }));
}

init();

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
  console.debug(json);
}

module.exports = {
  getEmojiByCode: getEmoji,
  getCategories: getCategories,
  getAllEmojiByCategory: getAllEmojiByCategory,
  convert: parseEmojione
};
