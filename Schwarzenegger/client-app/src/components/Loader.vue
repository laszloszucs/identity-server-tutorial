<template>
  <div class="vld-parent">
    <loading
      :active="isLoading || !!load"
      :opacity="isFull ? 1 : 0.5"
    ></loading>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import EventBus from "../helpers/event-bus";

@Component({
  components: {
    Loading
  }
})
export default class Loader extends Vue {
  created() {
    EventBus.$on("LOADING", () => this.loaders++);
    EventBus.$on("DONE-LOADING", () => this.loaders--);
  }

  private loaders = 0;

  @Prop({ default: false })
  load: boolean;

  @Prop({ default: false })
  isFull: boolean;

  get isLoading() {
    return this.loaders > 0;
  }
}
</script>

<style lang="scss" scoped>
@import "public/variables";

::v-deep .vld-background {
  background: $light-color;
}
::v-deep .vld-icon {
  svg {
    stroke: $dark-color;
  }
}
</style>
