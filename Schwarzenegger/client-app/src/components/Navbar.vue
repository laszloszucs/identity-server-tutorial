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
    <div></div>
    <div :class="{ 'other-buttons': hasPermission('account.view') }">
      <DxButton
        id="adminButton"
        class="admin-button"
        @click="navigate('/account')"
        :text="isSmall(user.userName)"
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

@Component({
  components: {
    DxTabs,
    DxItem,
    DxButton,
    Navbar
  },
  props: {
    logoutText: null
  }
})
export default class Navbar extends Vue {
  private breakPoint = 768;
  private isBig = window.innerWidth >= this.breakPoint;

  get user() {
    return this.$store.state.auth.user;
  }

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
@import "public/variables";
.navbar {
  background: $dark-color;
  padding: 5px 45px 5px 45px;
  display: grid;
  grid-template-columns: 8fr 1fr 2fr;
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
  border-top: 5px solid transparent !important;
  border-bottom: 5px solid transparent !important;
  .dx-icon {
    opacity: 1 !important;
  }
  .dx-button-text {
    opacity: 1 !important;
  }
}

::v-deep .dx-button-danger .dx-button-text {
  color: $attention-color;
  font-size: 18px;
  &.dx-icon {
    color: $attention-color !important;
  }
}

.navbar .navs .dx-button {
  &.dx-state-disabled {
    border-radius: 0;
    border-bottom: 5px solid $light-color !important;
  }
}

#adminButton {
  &.dx-state-disabled {
    border-radius: 0;
    border-bottom: 5px solid $light-color !important;
  }
}

::v-deep .dx-icon {
  color: white !important;
}

.dx-button.dx-state-disabled {
  border-bottom: 1px !important;
  opacity: 1;
}

.dx-state-active {
  background: none;
  border-radius: 0;
  border-bottom: 5px solid $light-color !important;
}

.dx-button.dx-state-hover {
  background: none;
  border-radius: 0;
  border-bottom: 5px solid $light-color !important;
  &.dx-button-danger {
    background: none;
    border-radius: 0;
    border-bottom: 5px solid $attention-color !important;
  }
}

</style>
