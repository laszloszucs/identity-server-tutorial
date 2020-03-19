import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: "hu-HU",
  //locale: "en-US",
  // formatter: new CustomFormatter(/* here the constructor options */),
  messages: {
    "en-US": {
      error: {
        invalid_username_or_password: "Invalid Username Or Password",
        "Network Error": "Network Error! Please try again later."
      }
    },
    "hu-HU": {
      error: {
        invalid_username_or_password: "Érvénytelen felhasználónév vagy jelszó",
        "Network Error": "Hálózati probléma! Kérem próbálja meg később."
      }
    }
  }
});

export default i18n;
