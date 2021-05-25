function getProperties (obj) {
  return Object.getOwnPropertyNames(obj);
}

function isStringStartsWith (str, start) {
  return str.toLowerCase().startsWith(start.toLowerCase());
}

export function createSentenceList (expression = '') {
  if (!expression) return [];

  const initKeyword = 'robot';
  const path = expression.split('.');

  if (path.length === 1 && initKeyword.startsWith(path[0].toLowerCase())) {
    return [initKeyword];
  }

  if (path.length === 2 && path[0] === initKeyword) {
    return getProperties(Application.autocomplete).filter(
      prop => isStringStartsWith(prop, path[1])
    );
  }

  if (path.length > 2) {
    let autocompleteObject = Application.autocomplete;
    let element = '';

    for (let i = 1; i < path.length - 1; i++) {
      element = path[i];
      if (element in autocompleteObject) {
        autocompleteObject = autocompleteObject[element];
        element = path[i + 1];
      } else return [];
    }

    if (typeof autocompleteObject === 'function') return [];

    if (autocompleteObject?.constructor.name === 'Object') {
      return getProperties(autocompleteObject).filter(
        prop => isStringStartsWith(prop, element)
      );
    } else {
      return getProperties(autocompleteObject?.__proto__).filter(
        prop => prop !== 'constructor' && isStringStartsWith(prop, element)
      );
    }
  }

  return [];
};
