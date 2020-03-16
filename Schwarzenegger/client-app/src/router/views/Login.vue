<template>
  <div class="container">
    <div class="image-container">
      <img src="..\..\..\src\assets\schwarzenegger.png" />
    </div>
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
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { LoginWithPassword } from "../../store/actions/auth-actions";
import DxForm, {
  DxButtonItem,
  DxSimpleItem,
  DxRequiredRule
} from "devextreme-vue/form";
import { LoginUser } from "@/models/LoginUser";

@Component({
  components: {
    DxForm,
    DxButtonItem,
    DxSimpleItem,
    DxRequiredRule
  }
})
export default class Login extends Vue {
  private user: LoginUser = {
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
    await this.$store
      .dispatch(LoginWithPassword, this.user)
      .then(() => {
        this.$router.push("/");
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
}
</script>

<style lang="scss">
.container {
  padding: 200px;
  width: 40%;
  margin: auto;
}
.image-container {
  text-align: center;
}
</style>
