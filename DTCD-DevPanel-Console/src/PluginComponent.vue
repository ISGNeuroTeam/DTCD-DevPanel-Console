<template>
  <div class="container">
    <div class="content">
      <div class="messages" ref="messageBlock">
        <div
          v-if="messageList.length <= 0"
          class="message empty"
          v-text="'No messages here'"
        />
        <div
          v-for="(message, index) in messageList"
          :key="`msg-${index}`"
          :class="['message', message.type]"
        >
          <div class="icon"><i :class="messageIcons[message.type]"/></div>
          <div class="text" v-text="message.text"/>
        </div>
      </div>

      <transition name="slide-up">
        <div
          v-show="sentenceList.length > 0"
          class="autocomplete"
          ref="autocomplete"
          tabindex="-1"
        >
          <div
            v-if="sentenceList.length <= 0"
            class="empty"
            v-text="'No sentences'"
          />
          <div
            v-for="(sentence, index) in sentenceList"
            class="sentence"
            :ref="`sentence-${index}`"
            :key="`sentence-${index}`"
            :title="sentence"
            :class="{ selected: index === selectedSentenceIndex }"
            @click="applySentenceByClick(index)"
          >
            <div class="icon"><i class="fas fa-hashtag"/></div>
            <div class="text" v-text="sentence"/>
          </div>
        </div>
      </transition>
    </div>

    <div class="console">
      <div class="prefix">
        <i class="fas fa-chevron-right"/>
      </div>
      <div
        ref="terminal"
        class="terminal"
        contenteditable="true"
        data-placeholder="Enter your expression..."
        @input="onInput"
        @focus="isTerminalFocused = true"
        @blur="isTerminalFocused = false"
        @paste.prevent="onPaste"
        @keydown.up.prevent="onArrowPress('up')"
        @keydown.down.prevent="onArrowPress('down')"
        @keydown.tab.prevent="onTabPress"
        @keydown.enter.prevent="onEnterPress"
        @keydown.ctrl.l.exact.prevent="clearMessageList"
        @keydown.ctrl.b.exact.prevent
        @keydown.ctrl.i.exact.prevent
        @keydown.ctrl.u.exact.prevent
      />
    </div>
  </div>
</template>

<script>
import { setCaretToEndPosition } from './utils/setCaretToEndPosition';
import { createSentenceList } from './utils/createSentenceList';
import { ConsoleHistory } from './utils/ConsoleHistory';

export default {
  name: 'PluginComponent',
  data: (self) => ({
    // root
    logSystem: self.$root.logSystem,
    // component
    isTerminalFocused: false,
    history: new ConsoleHistory(),
    expression: '',
    autocompletePath: '',
    leftExpressionPart: '',
    rightExpressionPart: '',
    previousCaretPosition: 0,
    selectedSentenceIndex: 0,
    messageList: [],
    messageIcons: {
      command: 'fas fa-chevron-right',
      log: 'fas fa-chevron-left',
      info: 'fas fa-info-circle',
      warn: 'fas fa-exclamation-triangle',
      error: 'far fa-times-circle',
    },
  }),
  computed: {
    sentenceList () {
      return createSentenceList(this.autocompletePath);
    },
  },
  watch: {
    sentenceList () {
      this.selectedSentenceIndex = 0;
    },
  },
  methods: {
    onInput () {
      this.expression = this.$refs.terminal.textContent;
      this.checkExpression();
    },

    onPaste (event) {
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    },

    onTabPress () {
      this.applySentenceBySelectedIndex();
    },

    onEnterPress () {
      if (this.expression === '') return;

      this.history.add(this.expression);
      this.logSystem.debug(`Added expression to history: "${this.expression}"`);
      this.logSystem.info(`Added expression to history: "${this.expression}"`);

      if (this.expression.trim() === 'clear') {
        this.clearMessageList();
      } else {
        this.executeExpression();
      }

      this.updateConsoleInput('');
    },

    onArrowPress (key) {
      const dir = key === 'up' ? 'prev' : 'next';
      if (this.sentenceList.length <= 0) {
        this.restoreExpressionFromHistory(dir);
      } else {
        this.selectSentence(dir);
      }
    },

    updateConsoleInput (value) {
      this.expression = value;
      this.$refs.terminal.textContent = value;
    },

    addMessage (type, text) {
      const msg = String(text);
      this.messageList.push({ type, text: msg });
      this.logSystem.debug(`Added message: { type: ${type}, text: ${msg} }`);
      this.logSystem.info(`Added "${type}" message: "${msg}"`);
      this.$nextTick(() => {
        const block = this.$refs.messageBlock;
        block.scrollTop = block.scrollHeight;
      });
    },

    clearMessageList () {
      this.messageList = [];
      this.logSystem.debug(`Cleared message list`);
      this.logSystem.info(`Cleared message list`);
    },

    createExpressionFunction () {
      return new Function(`
        const robot = Application.autocomplete;
        return (${this.expression});
      `);
    },

    executeExpression () {
      try {
        const func = this.createExpressionFunction();
        this.logSystem.debug(`Executed expression: "${this.expression}"`);
        this.logSystem.info(`Executed expression: "${this.expression}"`);
        this.addMessage('command', this.expression);
        this.addMessage('log', func());
      } catch (error) {
        this.logSystem.debug(`Expression runtime error: "${error.message}"`);
        this.logSystem.info(`Expression runtime error: "${error.message}"`);
        this.addMessage('error', error.message);
      }
    },

    restoreExpressionFromHistory (dir = 'prev') {
      const expression = this.history[dir]();
      if (expression) {
        this.updateConsoleInput(expression);
        setCaretToEndPosition(this.$refs.terminal);
      }
    },

    checkExpression () {
      const caretPosition = this.getCaretPosition(this.$refs.terminal);
      const left = this.expression.substring(0, caretPosition);
      const right = this.expression.substring(caretPosition);

      const separatorIndex = Math.max(
        left.lastIndexOf(' '),
        left.lastIndexOf(','),
        left.lastIndexOf('('),
      );

      const base = separatorIndex < 0 ? '' : left.substring(0, separatorIndex + 1);
      this.autocompletePath = this.expression.slice(separatorIndex + 1, caretPosition);
      this.leftExpressionPart = base;
      this.rightExpressionPart = right;
    },

    applySentenceByClick (index) {
      const caretPosition = this.getCaretPosition(this.$refs.terminal);
      this.setCaretPosition(this.$refs.terminal, caretPosition);
      this.selectedSentenceIndex = index;
      this.applySentenceBySelectedIndex();
    },

    applySentenceBySelectedIndex () {
      this.checkExpression();

      const index = this.selectedSentenceIndex;
      const sentence = !this.sentenceList[index] ? '' : this.sentenceList[index];

      const splitted = this.autocompletePath.split('.');
      splitted.splice(-1, 1, sentence);

      const base = this.leftExpressionPart;
      const end = this.rightExpressionPart;
      const joined = splitted.join('.');
      const result = base + joined + end;
      const caretPosition = base.length + joined.length;

      this.logSystem.debug(
        `Sentence applied: "${sentence}", joined sentence: "${joined}"`
      );
      this.logSystem.info(`Sentence applied: "${sentence}"`);

      this.updateConsoleInput(result);
      this.setCaretPosition(this.$refs.terminal, caretPosition);
    },

    selectSentence (newIndex = 'next') {
      if (this.sentenceList.length <= 0) return;

      const cur = this.selectedSentenceIndex;
      const max = this.sentenceList.length - 1;

      const indexes = {
        prev: cur === 0 ? max : cur - 1,
        next: cur === max ? 0 : cur + 1,
      };

      const index = indexes[newIndex];

      const refID = `sentence-${index}`;
      const block = this.$refs[refID][0];
      block.scrollIntoView({ block: 'nearest' });
      this.selectedSentenceIndex = index;
    },

    setCaretPosition (el, pos) {
      const selelction = window.getSelection();
      selelction.setPosition(el.childNodes[0], pos);
    },

    getCaretPosition (el) {
      let position = 0;

      if (!this.isTerminalFocused) {
        return this.previousCaretPosition;
      }

      if (typeof window.getSelection !== 'undefined') {
        const selection = window.getSelection();
        if (selection.rangeCount !== 0) {
          const range = window.getSelection().getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(el);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          position = preCaretRange.toString().length;
        }
      }

      this.previousCaretPosition = position;
      return position;
    },
  },
};
</script>

<style lang="scss" scoped>
@import './styles/base';

.container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1 0;
    position: relative;
    overflow: hidden;

    .messages {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow-y: auto;

      .message {
        display: flex;
        color: #757575;
        padding: 16px 0;
        padding-right: 16px;

        &:not(:first-child) {
          border-top: thin solid #E0E0E0;
        }

        &.empty {
          justify-content: center;
          align-items: center;
          height: 100%;
          font-size: 20px;
        }

        &.info {
          color: #2196F3;
          background-color: #E3F2FD;
        }

        &.warn {
          color: #FF9800;
          background-color: #FFF3E0;
        }

        &.error {
          color: #F44336;
          background-color: #FFEBEE;
        }

        .icon {
          flex: 0 0 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
        }

        .text {
          font-size: 14px;
          font-family: monospace;
          word-break: break-all;
          overflow-wrap: break-word;
        }
      }
    }

    $autocomplete-item-height: 35px;

    .autocomplete {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: $autocomplete-item-height * 4;
      background-color:#eee;
      color: #757575;
      box-shadow: 0 0 4px rgba(0, 0, 0, .5);
      outline: none;
      overflow-y: auto;

      .empty {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
      }

      .sentence {
        display: flex;
        align-items: center;
        height: $autocomplete-item-height;
        cursor: pointer;
        font-size: 12px;

        &.selected, &:hover {
          color: #607D8B;
          background-color: #CFD8DC;
        }

        .icon {
          flex: 0 0 50px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .text {
          font-family: monospace;
        }
      }
    }
  }

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
}
</style>
