<template>
  <div class="messages" ref="messages">
    <div
      v-if="messages.length <= 0"
      class="message empty"
      v-text="'No messages here'"
    />
    <div
      v-for="(message, index) in messages"
      :key="`msg-${index}`"
      :class="['message', message.type]"
    >
      <div class="icon"><i :class="icons[message.type]"/></div>
      <div class="text" v-text="message.text"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageList',
  props: {
    messages: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    icons: {
      command: 'fas fa-chevron-right',
      log: 'fas fa-chevron-left',
      info: 'fas fa-info-circle',
      warn: 'fas fa-exclamation-triangle',
      error: 'far fa-times-circle',
    },
  }),
  watch: {
    messages () {
      this.$nextTick(() => {
        const container = this.$refs.messages;
        container.scrollTop = container.scrollHeight;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import './../styles/base';

.messages {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow-y: auto;

  .message {
    display: flex;
    align-items: center;
    min-height: 42px;
    color: #757575;
    border-top: thin solid #E0E0E0;

    &:first-child {
      border-top: none;
    }

    &.empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: 20px;
    }

    &.log {
      color: #757575;
    }

    &.command {
      color: #757575;
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
      flex: 0 0 56px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
    }

    .text {
      font-size: 14px;
      font-family: monospace;
    }
  }
}
</style>
