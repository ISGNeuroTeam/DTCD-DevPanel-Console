<template>
  <div :id="$root.workPlaceID" class="container">
    <div class="content">
      <MessageList :messages="consoleMessages"/>
      <AutocompleteTool
        ref="autocomplete"
        :visible="isAutocompleteVisible"
        :expression="consoleExpression"
        :sentences="autocompleteSentences"
        @close="isAutocompleteVisible = false"
        @apply-sentence="applyAutocompleteSentence"
      />
    </div>
    <ConsoleInputField
      :autocompleteVisible="isAutocompleteVisible"
      :autocompletedSentence="autocompleteSentence"
      @add-message="addConsoleMessage"
      @clear-messages="clearConsoleMessages"
      @expression-update="consoleExpressionUpdate"
      @autocomplete-open="isAutocompleteVisible = true"
      @autocomplete-close="isAutocompleteVisible = false"
      @select-sentence="selectSentenceByConsoleArrowKey"
      @apply-sentence="applySentenceByConsoleTabKey"
    />
  </div>
</template>

<script>
import autocompleteData from './utils/autocompleteData';
import MessageList from './components/MessageList';
import AutocompleteTool from './components/AutocompleteTool';
import ConsoleInputField from './components/ConsoleInputField';

export default {
  name: 'TabComponent',
  components: {
    MessageList,
    AutocompleteTool,
    ConsoleInputField,
  },
  data: () => ({
    isAutocompleteVisible: false,
    consoleMessages: [],
    consoleExpression: '',
    autocompleteSentence: '',
    autocompleteDirection: null,
  }),
  computed: {
    autocompleteSentences () {
      if (this.consoleExpression === '') return [];

      function find (value) {
        if (Array.isArray(value)) return value;
        if (typeof value === 'object') return Object.keys(value);
        return [value];
      }

      let tempValue = autocompleteData;
      const autocompletePath = this.consoleExpression.split('.');

      for (let index = 0; index < autocompletePath.length - 1; index++) {
        const item = autocompletePath[index];
        if (tempValue[item]) {
          tempValue = tempValue[item];
        } else {
          tempValue = [];
          break;
        }
      }

      let sentences = find(tempValue);

      const filteredSentences = sentences.filter(item => {
        const currentSentence = autocompletePath[autocompletePath.length - 1];
        return currentSentence === '' ? true : item.startsWith(currentSentence);
      });

      sentences = filteredSentences;

      return sentences;
    },
  },
  watch: {
    autocompleteSentences () {
      this.isAutocompleteVisible = !!this.autocompleteSentences.length > 0;
    },
  },
  methods: {
    addConsoleMessage ({ type, text }) {
      this.consoleMessages.push({ type, text: String(text) });
    },

    clearConsoleMessages () {
      this.consoleMessages.splice(0, this.consoleMessages.length);
    },

    consoleExpressionUpdate (expression) {
      this.consoleExpression = expression;
    },

    applyAutocompleteSentence (sentence) {
      const expression = this.consoleExpression;
      const splitted = expression.split('.');
      splitted.splice(-1, 1, sentence);
      const resultExpression = splitted.join('.');
      this.autocompleteSentence = resultExpression;
    },

    selectSentenceByConsoleArrowKey (mode) {
      this.$refs.autocomplete.selectSentence(mode);
    },

    applySentenceByConsoleTabKey () {
      const autocomplete = this.$refs.autocomplete;
      const sentence = this.autocompleteSentences[autocomplete.selectedIndex];
      this.applyAutocompleteSentence(sentence);
    },

  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/base';

.container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1 0;
    position: relative;
  }
}
</style>
