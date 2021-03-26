<template>
  <transition name="slide-up">
    <div
      v-show="visible"
      class="autocomplete"
      ref="container"
      tabindex="-1"
      @keydown.up.prevent="selectSentence('prev')"
      @keydown.down.prevent="selectSentence('next')"
      @keydown.esc.prevent="$emit('close')"
      @keydown.tab.prevent="applySelectedSentence()"
      @keydown.enter.prevent="applySelectedSentence()"
    >
      <div v-if="sentences.length <= 0" class="empty">No sentences</div>
      <div
        v-for="(sentence, index) in sentences"
        class="sentence"
        :id="`sentence-${index}`"
        :ref="`sentence-${index}`"
        :key="`sentence-${index}`"
        :class="{ selected: index === selectedIndex }"
        @click="applySelectedSentence(index)"
      >
        <div class="icon"><i class="fas fa-hashtag"/></div>
        <div class="text" v-text="sentence"/>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AutocompleteTool',
  props: {
    visible: {
      type: Boolean,
    },
    expression: {
      type: String,
      required: true,
    },
    sentences: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    selectedIndex: 0,
  }),
  watch: {
    sentences () {
      this.selectedIndex = 0;
    },
  },
  methods: {

    focusOnContainer () {
      this.$refs.container.focus();
    },

    applySelectedSentence (sentence = null) {
      const index = sentence !== null ? sentence : this.selectedIndex;
      this.$emit('apply-sentence', this.sentences[index]);
    },

    selectSentence (newIndex = 'next') {
      const curIndex = this.selectedIndex;
      const maxIndex = this.sentences.length - 1;

      const indexes = {
        prev: curIndex === 0 ? maxIndex : curIndex - 1,
        next: curIndex === maxIndex ? 0 : curIndex + 1,
      };

      this.selectedIndex = indexes[newIndex];
      this.scrollToSelectedSentence();
    },

    scrollToSelectedSentence () {
      const refID = `sentence-${this.selectedIndex}`;
      const block = this.$refs[refID][0];
      block.scrollIntoView({ block: 'nearest' });
    },

  },
};
</script>

<style lang="scss" scoped>
@import './../styles/base';

$autocomplete-item-height: 35px;

.autocomplete {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: $autocomplete-item-height * 4;
  background-color:#EEE;
  box-shadow: 0 0 6px rgba(0, 0, 0, .5);
  overflow-y: auto;
  outline: none;
  z-index: 1;

  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #757575;
  }

  .sentence {
    display: flex;
    align-items: center;
    height: $autocomplete-item-height;
    cursor: pointer;
    color: #757575;
    font-size: 12px;

    &.selected,
    &:hover {
      color: #607D8B;
      background-color: #CFD8DC;
    }

    .icon {
      flex: 0 0 56px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .text {
      font-family: monospace;
    }
  }
}
</style>
