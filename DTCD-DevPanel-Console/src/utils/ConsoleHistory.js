export class ConsoleHistory {

  constructor () {
    this.counter = 1;
    this.items = {};
    this.prevItem = null;
    this.currentItem = null;
  }

  setCurrentExpression (expression) {
    this.newExpression = expression;
  }

  add (item) {
    this.items[this.counter] = item;
    this.currentItem = ++this.counter;
  }

  prev () {
    const item = this.items[this.currentItem - 1];

    if (!item) return this.prevItem;

    this.prevItem = item;
    this.currentItem -= 1;
    return item;
  }

  next () {
    const item = this.items[this.currentItem + 1];

    if (!item) return null;

    this.currentItem += 1;
    return item;
  }

}
