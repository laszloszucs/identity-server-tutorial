<template>
  <div class="vld-parent">
    <loading :active="isLoading || load" :opacity="isFull ? 1 : 0.5" background-color="linear-gradient(17deg, rgba(0,0,0,1) 0%, rgba(1,29,44,1) 44%, rgba(3,117,175,1) 100%)" color="#55a3e1"></loading>
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
