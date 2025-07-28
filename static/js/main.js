const { createApp } = Vue;

import { NavbarComponent } from './components/general/Navbar.js';
import router from './router/index.js';

// The root Vue app instance. It doesn't need much logic itself.
const app = createApp({});

// Register components that are used outside the <router-view> like the navbar
app.component('navbar-component', NavbarComponent);

// Tell the app to use the router
app.use(router);

// Mount the app to the DOM
app.mount('#app');