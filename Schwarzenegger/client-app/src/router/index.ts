import Vue from "vue";
import VueRouter from "vue-router";
import { NavigationGuard } from "vue-router";
import Home from "../views/Home.vue";
import Account from "../components/Account.vue";
import Login from "../components/Login.vue";
import store from "../store";

Vue.use(VueRouter);

const ifNotAuthenticated: NavigationGuard = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next();
    return;
  }
  next("/");
};

const ifAuthenticated: NavigationGuard = (to, from, next) => {
  if (store.getters.isAuthenticated) {
    next();
    return;
  }
  next("/login");
};

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    meta: {
      requiresAuth: true
    },
    beforeEnter: ifAuthenticated,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/account",
    name: "Account",
    component: Account,
    beforeEnter: ifAuthenticated
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: ifNotAuthenticated
  }
];

export default new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});
