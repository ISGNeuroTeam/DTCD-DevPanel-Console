<template>
  <div class="wrapper">
    <div class="console-prefix">
      <i class="fas fa-chevron-right icon"/>
    </div>
    <div
      ref="console"
      class="console"
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
  name: 'ConsoleInputField',
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
    customConsoleCommands: ['log', 'info', 'warn', 'error'],
  }),
  watch: {
    autocompletedSentence () {
      this.appplyAutocompleteSentence();
    },
  },
  mounted () {
    this.customConsoleCommands.forEach(command => {
      const defaultCommand = console[command].bind(console);
      console[command] = (...args) => {
        defaultCommand(...args);
        this.addMessage(command, args);
      };
    });
  },
  methods: {

    addMessage (type, text) {
      this.$emit('add-message', { type, text });
    },

    clearMessages () {
      this.$emit('clear-messages');
    },

    clearConsoleInput () {
      this.expression = '';
      this.$refs.console.textContent = '';
    },

    onInput () {
      this.updateExpression();
    },

    onPaste (event) {
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    },

    onEnterPress () {
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

    onArrowKeyPress (key) {
      const direction = key === 'up' ? 'prev' : 'next';
      if (this.autocompleteVisible) {
        this.selectAutocompleteSentence(direction);
      } else {
        this.restoreExpressionFromHistory(direction);
      }
    },

    onTabPress () {
      if (this.autocompleteVisible) {
        this.$emit('apply-sentence', true);
      } else {
        this.openAutocompleteTool(true);
      }
    },

    updateExpression () {
      this.expression = this.$refs.console.textContent.trim();
      this.$emit('expression-update', this.expression);
    },

    createExpressionFunction () {
      // TODO: Update after console logic revision
      return new Function(`
        const robot = document._DataCAD;
        robot.panelLiveDash = robot.systemGUID.getInstanceByName('PanelLiveDash');
        return (${this.expression});
      `);
    },

    executeConsoleExpression () {
      console.warn('Console disabled for revision');
      // try {
      //   const expression = this.createExpressionFunction();
      //   this.addMessage('command', this.expression);
      //   this.addMessage('log', expression());
      // } catch (error) {
      //   this.addMessage('error', error.message);
      // }
    },

    addExpressionToHistory () {
      this.history.add(this.expression);
    },

    restoreExpressionFromHistory (direction = 'prev') {
      const expression = this.history[direction]();
      if (expression) {
        this.$refs.console.textContent = expression;
        this.moveCaretToEndPosition();
      }
      this.updateExpression();
    },

    openAutocompleteTool (isOpen) {
      this.$emit(isOpen ? 'autocomplete-open' : 'autocomplete-close');
    },

    appplyAutocompleteSentence () {
      this.$refs.console.textContent = this.autocompletedSentence;
      this.updateExpression();
      this.$refs.console.focus();
      this.moveCaretToEndPosition();
    },

    selectAutocompleteSentence (direction) {
      this.$emit('select-sentence', direction);
    },

    moveCaretToEndPosition () {
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
@import '@/styles/base';

.wrapper {
  display: flex;
  background-color: #F5F5F5;
  box-shadow: 0 0 3px rgba(0, 0, 0, .5);
  position: relative;

  .console-prefix {
    flex: 0 0 56px;
    display: flex;
    justify-content: center;
    padding: 20px 0;

    .icon {
      font-size: 15px;
    }
  }

  .console {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    max-height: 104px;
    color: #424242;
    font-size: 14px;
    font-family: monospace;
    outline: none;
    padding: 20px 0;
    padding-right: 20px;
    word-break: break-all;
    overflow-wrap: break-word;
    white-space: normal;
    overflow-y: auto;

    &[contenteditable]:empty:before {
      content: attr(data-placeholder);
      cursor: text;
      color: #757575;
      position: absolute;
    }
  }
}
</style>
