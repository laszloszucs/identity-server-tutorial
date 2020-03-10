<template>
  <div>
    <form class="login" @submit.prevent="login">
      <h1>Sign in</h1>
      <label>User name</label>
      <input required v-model="username" type="text" placeholder="Snoopy" />
      <label>Password</label>
      <input
        required
        v-model="password"
        type="password"
        placeholder="Password"
      />
      <hr />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AUTH_REQUEST } from "../store/actions/auth";

@Component
export default class Login extends Vue {
  private username = "admin";
  private password = "tempP@ss123";

  async login() {
    const { username, password } = this; // TODO Miért nem direktbe?
    this.$store.dispatch(AUTH_REQUEST, { username, password }).then(() => {
      this.$router.push("/");
    });
  }
}
</script>
