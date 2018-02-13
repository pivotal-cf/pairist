<template>
  <div class="editable">
    <div class="accent--text placeholder" v-if="contentText === ''">
      {{ placeholder }}
    </div>
    <div contenteditable="true" @input="input" @keyup.enter="update"
         ref="contentWrapper" @keydown.enter="disableEvent" @keypress.enter="disableEvent" />
  </div>
</template>

<script>
export default  {
  props: {
    content: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: "",
    },
    saveOnInput: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      contentText: "",
    }
  },

  watch: {
    content(value) {
      if (document.activeElement != this.$refs.contentWrapper) {
        this.contentText = value
        this.$refs.contentWrapper.innerText = this.contentText
      }
    },
  },

  mounted() {
    this.contentText = this.content
    this.$refs.contentWrapper.innerText = this.contentText
  },

  methods: {
    input(event) {
      this.contentText = event.target.innerText
      if (this.saveOnInput) {
        this.$emit("update", event.target.innerText)
      }
    },

    update(event) {
      event.preventDefault()
      this.$emit("update", event.target.innerText)
      if (this.saveOnInput) {
        this.$refs.contentWrapper.blur()
      } else {
        this.$refs.contentWrapper.innerText = ""
      }
    },

    disableEvent(event) {
      event.preventDefault()
    },

    clear() {
      this.contentText = ""
      this.$refs.contentWrapper.innerText = this.contentText
    },
  },
}
</script>

<style lang="scss">
.editable {
  position: relative;
  width: 100%;
  display: inline-block;

  .placeholder {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.5;
  }
}
</style>
