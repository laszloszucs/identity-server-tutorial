<template>
  <div class="container">
    <img src="..\..\src\assets\schwarzenegger.png">
    <form @submit.prevent="login">
      <DxForm id="form" :form-data="user" label-location="top">
        <DxSimpleItem data-field="username">
          <DxRequiredRule message="Username is required" />
        </DxSimpleItem>
        <DxSimpleItem :editor-options="passwordOptions" data-field="password">
          <DxRequiredRule message="Username is required" />
        </DxSimpleItem>
        <DxButtonItem
          :button-options="buttonOptions"
          horizontal-alignment="right"
        ></DxButtonItem>
      </DxForm>
    </form>
  </div>
  

  <!-- <form class="login" @submit.prevent="login">
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
  </form> -->
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AUTH_REQUEST } from "../store/actions/auth";
// import { DxForm } from 'devextreme-vue';
import DxForm, { DxButtonItem, DxSimpleItem, DxRequiredRule } from "devextreme-vue/form";
import { User } from "../models/UserModel";

@Component({
  components: {
    DxForm,
    DxButtonItem,
    DxSimpleItem,
    DxRequiredRule
  }
})
export default class Login extends Vue {
  private user: User = {
    username: "admin",
    password: "tempP@ss123"
  };

  private buttonOptions = {
    text: "Login",
    type: "success",
    useSubmitBehavior: true
  };

  private passwordOptions = {
    mode: "password"
  };

  async login() {
    await this.$store.dispatch(AUTH_REQUEST, this.user).then(() => {
      debugger;
      this.$router.push("/");
    }).catch((err: any) => {
      debugger;
      console.log(err);
    });
    debugger;
  }
}
</script>

<style lang="scss">
.container {
  padding: 200px;
  width: 40%;
  margin: auto;
}
</style>
