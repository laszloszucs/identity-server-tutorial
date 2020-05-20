<template>
  <div class="login-container">
    <div class="card-back">
      <div class="image-container">
        <img class="responsive" src="..\..\..\src\assets\schwarzenegger.png" />
      </div>
      <form @submit.prevent="login">
        <DxForm id="form" :form-data="loginUser" label-location="top">
          <DxSimpleItem data-field="username">
            <DxRequiredRule message="Username is required" />
          </DxSimpleItem>
          <DxSimpleItem :editor-options="passwordOptions" data-field="password">
            <DxRequiredRule message="Username is required" />
          </DxSimpleItem>
          <DxSimpleItem itemType="empty"></DxSimpleItem>
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
import startRefreshTokenTimer from "../../utils/loginRefresh";

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
    rememberMe: true
  };

  private checkBoxOptions = {
    text: "Remember Me"
  };

  private buttonOptions = {
    text: "Login",
    type: "default",
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
        startRefreshTokenTimer(this.$store);

        this.$router.push("/").then(() => {
          EventBus.$emit("LOGIN");
          EventBus.$emit("START_MAIN_WEBSOCKET_HUB");
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

<style lang="scss" scoped>
.login-container {
  padding: 40px 5% 5% 5%;
  width: 90%;
  max-width: 600px;
  margin: auto;
}

.card-back {
  border-radius: 0.3rem;
  // padding: 120px 90px 120px 90px;
  padding: 10% 5% 10% 5%;
  -webkit-box-shadow: 10px 10px 44px -12px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 10px 10px 44px -12px rgba(0, 0, 0, 0.75);
  box-shadow: 10px 10px 44px -12px rgba(0, 0, 0, 0.75);
  background: white;
}

.image-container {
  text-align: center;
}

.responsive {
  max-width: 200px;
  height: auto;
  @media (max-width: 767px) {
    width: 30vh;
  }
  @media (min-width: 768px) {
    width: 100%;
  }
}

::v-deep .dx-button.dx-button-default {
  background-color: #0375af;
}
</style>
