<template>
  <div :id="$root.tabID" class="container">
    <div class="content">
      <MessageList :messages="consoleMessages" />
      <AutocompleteTool
        ref="autocomplete"
        :visible="isAutocompleteVisible"
        :expression="consoleExpression"
        :sentences="autocompleteSentences"
        @close="isAutocompleteVisible = false"
        @apply-sentence="applyAutocompleteSentence"
      />
    </div>
    <ConsoleTerminal
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
import MessageList from './components/MessageList.vue';
import AutocompleteTool from './components/AutocompleteTool.vue';
import ConsoleTerminal from './components/ConsoleTerminal.vue';

export default {
  name: 'PluginComponent',
  components: {
    MessageList,
    AutocompleteTool,
    ConsoleTerminal,
  },
  data: () => ({
    isAutocompleteVisible: false,
    consoleMessages: [],
    consoleExpression: '',
    autocompleteSentence: '',
    autocompleteDirection: null,
  }),
  computed: {
    autocompleteSentences() {
      const autocompletePath = this.consoleExpression.split('.');

      if (autocompletePath.length == 1 && 'robot'.startsWith(autocompletePath[0])) {
        return ['robot'];
      } else if (autocompletePath.length == 2 && 'robot' === autocompletePath[0]) {
        return Object.getOwnPropertyNames(Application.autocomplete).filter(prop =>
          prop.toLowerCase().startsWith(autocompletePath[1].toLowerCase())
        );
      } else if (autocompletePath.length > 2 && 'robot'.startsWith(autocompletePath[0])) {
        let autocompleteObject = Application.autocomplete;
        let element;
        for (let i = 1; i < autocompletePath.length - 1; i++) {
          element = autocompletePath[i];
          if (element in autocompleteObject) {
            autocompleteObject = autocompleteObject[element];
            element = autocompletePath[i + 1];
          } else return [];
        }
        if (typeof autocompleteObject == 'function') return [];
        else if (autocompleteObject?.constructor.name == 'Object') {
          return Object.keys(autocompleteObject).filter(prop =>
            prop.toLowerCase().startsWith(element.toLowerCase())
          );
        } else if (autocompleteObject?.constructor.name != 'object') {
          return Object.getOwnPropertyNames(autocompleteObject?.__proto__)
            .filter(prop => prop !== 'constructor')
            .filter(prop => prop.toLowerCase().startsWith(element.toLowerCase()));
        } else return [];
      } else {
        return [];
      }
    },
  },
  watch: {
    autocompleteSentences() {
      this.isAutocompleteVisible = !!this.autocompleteSentences.length > 0;
    },
  },
  methods: {
    addConsoleMessage({ type, text }) {
      this.consoleMessages.push({ type, text: String(text) });
    },

    clearConsoleMessages() {
      this.consoleMessages.splice(0, this.consoleMessages.length);
    },

    consoleExpressionUpdate(expression) {
      this.consoleExpression = expression;
    },

    applyAutocompleteSentence(sentence) {
      const expression = this.consoleExpression;
      const splitted = expression.split('.');
      splitted.splice(-1, 1, sentence);
      const resultExpression = splitted.join('.');
      this.autocompleteSentence = resultExpression;
    },

    selectSentenceByConsoleArrowKey(mode) {
      this.$refs.autocomplete.selectSentence(mode);
    },

    applySentenceByConsoleTabKey() {
      const autocomplete = this.$refs.autocomplete;
      const sentence = this.autocompleteSentences[autocomplete.selectedIndex];
      this.applyAutocompleteSentence(sentence);
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
  }
}
</style>
