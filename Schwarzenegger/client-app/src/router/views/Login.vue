<template>
  <div class="container">
    <div class="image-container">
      <img src="..\..\..\src\assets\schwarzenegger.png" />
    </div>
    <form @submit.prevent="login">
      <DxForm id="form" :form-data="loginUser" label-location="top">
        <DxSimpleItem data-field="username">
          <DxRequiredRule message="Username is required" />
        </DxSimpleItem>
        <DxSimpleItem :editor-options="passwordOptions" data-field="password">
          <DxRequiredRule message="Username is required" />
        </DxSimpleItem>
        <DxSimpleItem
          :editor-options="checkBoxOptions"
          data-field="rememberMe"
          editor-type="dxCheckBox"
        >
        <DxLabel :visible="false" />
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
  DxRequiredRule,
  DxLabel
} from "devextreme-vue/form";
import { LoginUser } from "@/models/login-user.model";
import notify from "devextreme/ui/notify";
import EventBus from "../../helpers/event-bus";

@Component({
  components: {
    DxForm,
    DxButtonItem,
    DxSimpleItem,
    DxRequiredRule,
    DxLabel
  }
})
export default class Login extends Vue {
  private loginUser: LoginUser = {
    username: "admin",
    password: "tempP@ss123",
    rememberMe: false
  };

  private checkBoxOptions = {
    text: "Remember Me",
    value: false,
    // rtlEnabled: true
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
    EventBus.$emit("LOADING");
    this.$store
      .dispatch(LoginWithPassword, this.loginUser)
      .then(() => {
        this.$router.push("/").then(() => {
          EventBus.$emit("LOGIN");
        });
      })
      .catch(error => {
        let errorMessage = null;
        if (error.isAxiosError) {
          errorMessage = error.message;
        } else {
          errorMessage = error.response.data.error_description;
        }
        notify(
          {
            message: this.$t("error." + errorMessage),
            position: {
              at: "top",
              offset: "0 40"
            }
          },
          "error",
          3000
        );
      })
      .finally(() => EventBus.$emit("DONE-LOADING"));
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
