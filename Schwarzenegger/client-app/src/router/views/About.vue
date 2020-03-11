<template>
  <div class="about">
    <HelloWorld msg="Welcome to Schwarzenegger project" />
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    HelloWorld
  }
})
export default class About extends Vue {}
</script>
