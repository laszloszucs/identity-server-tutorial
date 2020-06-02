import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Account from "./views/Account.vue";
// import Login from "./views/Login.vue";
import Users from "./views/Users.vue";
import Roles from "./views/Roles.vue";
import store from "../store";
import accountService from "../services/account.service";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: `https://${process.env.VUE_APP_HOST}:${process.env.VUE_APP_PORT}`,
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home
    },
    {
      path: "/about",
      name: "About",
      meta: {
        permissions: ["about.view"]
      },
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    },
    {
      path: "/account",
      name: "Account",
      component: Account
    },
    {
      path: "/users",
      name: "Users",
      component: Users,
      meta: {
        permissions: ["users.view"]
      }
    },
    {
      path: "/roles",
      name: "Roles",
      component: Roles,
      meta: {
        permissions: ["roles.view"]
      }
    },
    // {
    //   path: "/login",
    //   name: "Login",
    //   component: Login
    // },
    { path: "*", redirect: { name: "Home" } }
  ]
});

const originalPush = Router.prototype.push;
Router.prototype.push = function push(
  location: any,
  onComplete?: any,
  onAbort?: any
): Promise<any> {
  if (onComplete || onAbort)
    return originalPush.call(this, location, onComplete, onAbort);
  return originalPush.call(this, location).catch((err: any) => err);
};

router.beforeEach(async (to, from, next) => {
  to.matched.forEach(record => {
    if (record.meta.permissions) {
      if (
        store.getters.isSessionExpired ||
        !accountService.userHasPermissions(record.meta.permissions)
      ) {
        next("/");
        return;
      }
    }
  });

  // if (
  //   to.matched.some(record => record.name === "Login") &&
  //   !store.getters.isSessionExpired()
  // ) {
  //   next("/");
  //   return;
  // }

  next();
});

export default router;
