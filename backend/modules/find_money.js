const CyrillicToTranslit = require('cyrillic-to-translit-js');
const cyrillicToTranslit = new CyrillicToTranslit();

const find_money = (name) => {
    name = name.replaceAll('0', 'o');
    name = name.replaceAll('4', 'ch');
    if (name == 'Монеточка' || cyrillicToTranslit.reverse(name) == 'Монеточка')
        return true
    return false
};
  
module.exports = { find_money };