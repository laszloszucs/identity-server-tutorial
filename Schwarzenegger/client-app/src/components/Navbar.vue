<template>
  <div class="navbar">
    <div class="navs">
      <!-- TODO: Csere DxToolbar-ra? -->
      <DxButton
        @click="navigate('/home')"
        :text="isSmall('Home')"
        icon="home"
        stylingMode="outlined"
        :disabled="$route.matched.some(({ name }) => name === 'Home')"
      />
      <DxButton
        v-if="hasPermission('users.view')"
        @click="navigate('/users')"
        :text="isSmall('Users')"
        icon="group"
        stylingMode="outlined"
        :disabled="$route.matched.some(({ name }) => name === 'Users')"
      />
      <DxButton
        v-if="hasPermission('roles.view')"
        @click="navigate('/roles')"
        :text="isSmall('Roles')"
        icon="fieldchooser"
        stylingMode="outlined"
        :disabled="$route.matched.some(({ name }) => name === 'Roles')"
      />
      <DxButton
        v-if="hasPermission('about.view')"
        @click="navigate('/about')"
        :text="isSmall('About')"
        icon="info"
        stylingMode="outlined"
        :disabled="$route.matched.some(({ name }) => name === 'About')"
      />
    </div>
    <div :class="{ 'other-buttons': hasPermission('account.view') }">
      <DxButton
        id="adminButton"
        class="admin-button"
        @click="navigate('/account')"
        :text="isSmall(profile().userName)"
        icon="user"
        stylingMode="outlined"
        :disabled="$route.matched.some(({ name }) => name === 'Account')"
      />
      <DxButton
        id="logout"
        class="logout-button"
        @click="logout()"
        :text="logoutText"
        :icon="isNotSmall('runner')"
        type="danger"
        stylingMode="outlined"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { PermissionValues } from ".././models/permission.model";
import { Logout } from "../../src/store/actions/auth-actions";
import accountService from ".././services/account.service";
import { DxTabs, DxItem } from "devextreme-vue/tabs";
import { DxButton } from "devextreme-vue/button";
import { mapState } from "vuex";
import { LoginStatus } from "@/enums/login-status.enum";

@Component({
  components: {
    DxTabs,
    DxItem,
    DxButton,
    Navbar
  },
  props: {
    logoutText: null
  },
  computed: mapState({
    profile: (state: any) => () => {
      return state.auth.user;
    },
    hasLoadedOnce: (state: any) => {
      return state.auth.hasLoadedOnce;
    },
    isLoading: (state: any) => {
      return state.auth.loginStatus === LoginStatus.Loading;
    }
  })
})
export default class Navbar extends Vue {
  private breakPoint = 768;
  private isBig = window.innerWidth >= this.breakPoint;

  isNotSmall(text) {
    return this.isBig ? null : text;
  }

  isSmall(text) {
    return !this.isBig ? null : text;
  }

  navigate(to) {
    if (this.$route.path !== to) {
      this.$router.push(to);
    }
  }

  logout() {
    this.$store.dispatch(Logout);
  }

  hasPermission(permissionValue: string) {
    const hasPermission = accountService.userHasPermission(
      permissionValue as PermissionValues
    );
    return hasPermission;
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  background: #0375af;
  padding: 10px 45px 10px 45px;
  display: grid;
  grid-template-columns: 1fr max-content;
  .dx-widget {
    font-family: "Roboto", sans-serif !important;
    font-size: 16px !important;
  }
}

.navs {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-auto-flow: column;
}

.other-buttons {
  display: grid;
  grid-template-areas: "admin-button logout-button";
  @media (max-width: 767px) {
    grid-template-columns: 70px 120px; // repeat(2, 100px);
  }
  @media (min-width: 768px) {
    grid-template-columns: 105px 130px; // repeat(2, 150px);
  }
}

.admin-button {
  grid-area: admin-button;
}

.logout-button {
  grid-area: logout-button;
}

.userName {
  margin: auto;
}

::v-deep .dx-button {
  &.dx-button-normal {
    color: white;
  }
  border: none !important;
  // background: none;
  .dx-icon {
    opacity: 1 !important;
  }
  .dx-button-text {
    opacity: 1 !important;
  }
}

::v-deep .dx-button-danger .dx-button-text {
  color: #ff6d6a;
  font-size: 18px;
  &.dx-icon {
    color: #ff6d6a !important;
  }
}

.navbar .navs .dx-button {
  // border-bottom: 1px solid grey !important;
  // border-right: 1px solid #2c3e50 !important;
  // &:first-child {
  //   border-left: 1px solid #2c3e50 !important;
  // }
  // &:last-child {
  //   border-right: none !important;
  // }
  &.dx-state-disabled {
    border-radius: 0;
    border-bottom: 5px solid #55a3e1 !important;
  }
}

#adminButton {
  // border: none !important;
  // border-left: 1px solid grey !important;
  // border-bottom: 1px solid grey !important;
  &.dx-state-disabled {
    border-bottom: none !important;
  }
}

// .dx-button.dx-button-danger {
//   background-color: #fff !important;
//   color: #d9534f !important;
//   // border: 1px solid #d9534f !important;
//   &:hover {
//     background-color: #d9534f !important;
//     color: #fff !important;
//     // border: 1px solid #d9534f !important;
//   }
// }

::v-deep .dx-icon {
  color: white !important;
}

.dx-button.dx-state-disabled {
  border-bottom: 1px !important;
  opacity: 1;
}

.dx-state-active {
  border-radius: 0;
  border-bottom: 5px solid #55a3e1 !important;
}

.dx-button.dx-state-hover {
  // background-color: rgb(0, 165, 187) !important;
  // -webkit-box-shadow: 0px 0px 40px 5px rgba(0, 165, 187, 0.75);
  // -moz-box-shadow: 0px 0px 40px 5px rgba(0, 87, 187, 0.75);
  // box-shadow: 0px 0px 40px 5px rgba(0, 165, 187, 0.75);
  // color: red;
  background: #55a3e1 !important;
  &.dx-button-danger {
    background: rgba(255, 0, 0, 0.45) !important;
  }
}

// .dx-button.dx-button-danger {
//   ::v-deep .dx-icon-runner {
//     color: red !important;
//   }
//   &.dx-state-hover {
//     ::v-deep .dx-icon.dx-icon-runner {
//       color: #fff !important;
//     }
//   }
// }
</style>
