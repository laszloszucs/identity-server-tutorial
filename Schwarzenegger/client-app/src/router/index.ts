import Vue from "vue";
import VueRouter from "vue-router";
import Home from "./views/Home.vue";
import Account from "./views/Account.vue";
import Login from "./views/Login.vue";
import store from "../store";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/about",
      name: "About",
      meta: {
        requiresAuth: true
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
      component: Account,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/login",
      name: "Login",
      component: Login
    },
    { path: "*", redirect: { name: "Home" } }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isLoggedIn) {
      next("/login");
      return;
    }
  } else if (
    to.matched.some(record => record.name === "Login") &&
    store.getters.isLoggedIn
  ) {
    next("/");
    return;
  }

  next();
});

export default router;
