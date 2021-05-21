<template>
  <div class="console">
    <div class="prefix">
      <i class="fas fa-chevron-right"/>
    </div>
    <div
      ref="console"
      class="terminal"
      contenteditable="true"
      data-placeholder="Enter your expression..."
      @input="onInput"
      @paste.prevent="onPaste"
      @keydown.up.prevent="onArrowKeyPress('up')"
      @keydown.down.prevent="onArrowKeyPress('down')"
      @keydown.tab.prevent="onTabPress"
      @keydown.esc.prevent="openAutocompleteTool(false)"
      @keydown.enter.prevent="onEnterPress"
      @keydown.ctrl.l.exact.prevent="clearMessages"
      @keydown.ctrl.b.exact.prevent
      @keydown.ctrl.i.exact.prevent
      @keydown.ctrl.u.exact.prevent
    />
  </div>
</template>

<script>
import { ConsoleHistory } from '@/utils/ConsoleHistory';

export default {
  name: 'ConsoleTerminal',
  props: {
    autocompleteVisible: {
      type: Boolean,
      required: true,
    },
    autocompletedSentence: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    expression: '',
    history: new ConsoleHistory(),
  }),
  watch: {
    autocompletedSentence() {
      this.appplyAutocompleteSentence();
    },
  },
  methods: {
    addMessage(type, text) {
      this.$emit('add-message', { type, text });
    },

    clearMessages() {
      this.$emit('clear-messages');
    },

    clearConsoleInput() {
      this.expression = '';
      this.$refs.console.textContent = '';
    },

    onInput() {
      this.updateExpression();
      this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
    },

    onPaste(event) {
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    },

    onEnterPress() {
      if (this.expression === '') return;

      this.addExpressionToHistory();

      if (this.expression === 'clear') {
        this.clearMessages();
      } else {
        this.executeConsoleExpression();
      }

      this.clearConsoleInput();
      this.openAutocompleteTool(false);
    },

    onArrowKeyPress(key) {
      const direction = key === 'up' ? 'prev' : 'next';
      if (this.autocompleteVisible) {
        this.selectAutocompleteSentence(direction);
      } else {
        this.restoreExpressionFromHistory(direction);
      }
    },

    onTabPress() {
      if (this.autocompleteVisible) {
        this.$emit('apply-sentence', true);
      } else {
        this.openAutocompleteTool(true);
      }
    },

    updateExpression() {
      if (this.$refs.console.textContent.endsWith('(')) {
        this.$refs.console.textContent = this.$refs.console.textContent + ')';
        this.setCaretPosition(this.$refs.console.textContent.length - 1);
      }
      const caretPosition = this.getCaretIndex(this.$refs.console);
      const leftParenthesisPosition = this.$refs.console.textContent.lastIndexOf(
        '(',
        caretPosition
      );
      const rightParenthesisPosition = this.$refs.console.textContent.indexOf(')', caretPosition);
      if (leftParenthesisPosition != -1 || rightParenthesisPosition != -1) {
        if (caretPosition > leftParenthesisPosition && caretPosition <= rightParenthesisPosition) {
          const leftCommaPosition = this.$refs.console.textContent.lastIndexOf(
            ',',
            caretPosition - 1
          );
          const rightCommaPosition = this.$refs.console.textContent.indexOf(',', caretPosition);
          if (
            leftCommaPosition != -1 &&
            leftCommaPosition > leftParenthesisPosition &&
            leftCommaPosition < caretPosition &&
            rightCommaPosition == -1
          ) {
            this.expression = this.$refs.console.textContent
              .slice(leftCommaPosition + 1, rightParenthesisPosition)
              .trim();
          } else if (
            rightCommaPosition != -1 &&
            rightCommaPosition < rightParenthesisPosition &&
            rightCommaPosition >= caretPosition &&
            leftCommaPosition == -1
          ) {
            this.expression = this.$refs.console.textContent
              .slice(leftParenthesisPosition + 1, rightCommaPosition)
              .trim();
          } else if (
            rightCommaPosition != -1 &&
            leftCommaPosition != -1 &&
            rightCommaPosition < rightParenthesisPosition &&
            leftCommaPosition > leftParenthesisPosition &&
            leftCommaPosition < caretPosition &&
            rightCommaPosition >= caretPosition
          ) {
            this.expression = this.$refs.console.textContent
              .slice(leftCommaPosition + 1, rightCommaPosition)
              .trim();
          } else {
            this.expression = this.$refs.console.textContent
              .slice(leftParenthesisPosition + 1, rightParenthesisPosition)
              .trim();
          }
        } else {
          this.expression = this.$refs.console.textContent.trim();
        }
      } else {
        this.expression = this.$refs.console.textContent.trim();
      }
      this.$emit('expression-update', this.expression);
      this.expression = this.$refs.console.textContent.trim();
    },

    setCaretPosition(pos) {
      let sel = window.getSelection();
      sel?.setPosition(this.$refs.console.childNodes[0], pos);
    },

    getCaretIndex(element) {
      let position = 0;
      const isSupported = typeof window.getSelection !== 'undefined';
      if (isSupported) {
        const selection = window.getSelection();
        if (selection.rangeCount !== 0) {
          const range = window.getSelection().getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          position = preCaretRange.toString().length;
        }
      }
      return position;
    },

    createExpressionFunction() {
      // TODO: Update after console logic revision
      return new Function(`
        const robot = Application.autocomplete;
        return (${this.expression});
      `);
    },

    executeConsoleExpression() {
      try {
        const expression = this.createExpressionFunction();
        this.addMessage('command', this.expression);
        this.addMessage('log', expression());
      } catch (error) {
        this.addMessage('error', error.message);
      }
    },

    addExpressionToHistory() {
      this.history.add(this.expression);
    },

    restoreExpressionFromHistory(direction = 'prev') {
      const expression = this.history[direction]();
      if (expression) {
        this.$refs.console.textContent = expression;
        this.moveCaretToEndPosition();
      }
      this.updateExpression();
    },

    openAutocompleteTool(isOpen) {
      this.$emit(isOpen ? 'autocomplete-open' : 'autocomplete-close');
    },

    appplyAutocompleteSentence() {
      this.$refs.console.textContent = this.autocompletedSentence;
      this.updateExpression();
      this.$refs.console.focus();
      this.moveCaretToEndPosition();
    },

    selectAutocompleteSentence(direction) {
      this.$emit('select-sentence', direction);
    },

    moveCaretToEndPosition() {
      const range = document.createRange();
      range.selectNodeContents(this.$refs.console);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    },
  },
};
</script>

<style lang="scss" scoped>
@import './../styles/base';

.console {
  flex: 0 0;
  display: flex;
  background-color: #f5f5f5;
  box-shadow: 0 0 3px rgba(0, 0, 0, .5);

  $terminal-line-height: 16px;

  .prefix {
    flex: 0 0;
    display: flex;
    justify-content: center;
    padding: $terminal-line-height 20px;
  }

  .terminal {
    flex: 1 0;
    max-height: $terminal-line-height * 7;
    color: #424242;
    font-size: 14px;
    font-family: monospace;
    outline: none;
    padding: $terminal-line-height 0;
    padding-right: 20px;
    word-break: break-all;
    overflow-wrap: break-word;
    overflow-y: auto;

    &[contenteditable]:empty:before {
      content: attr(data-placeholder);
      color: #757575;
      pointer-events: none;
    }
  }
}
</style>
