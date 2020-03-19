<template>
  <div class="vld-parent">
    <loading :active="isLoading"></loading>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import EventBus from "../helpers/event-bus";

@Component({
  components: {
    Loading
  }
})
export default class Loader extends Vue {
  mounted() {
    EventBus.$on("LOADING", () => this.loaders++);
    EventBus.$on("DONE-LOADING", () => this.loaders--);
  }

  private loaders = 0;

  get isLoading() {
    return this.loaders > 0;
  }
}
</script>
