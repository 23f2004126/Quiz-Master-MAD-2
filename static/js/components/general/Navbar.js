export const NavbarComponent = {
  template: `
    <nav class="navbar navbar-expand-lg navbar-light shadow-sm" style="background-color: rgba(253, 246, 227, 0.95); border-bottom: 1px solid #d2b48c;">
      <div class="container-fluid px-4">
        <router-link class="navbar-brand fw-bold" style="font-family: 'Great Vibes', cursive; font-size: 2rem;" to="/">Quiz Master</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            
            <li class="nav-item" v-if="isUser">
              <router-link class="nav-link" to="/subjects">Take a Quiz</router-link>
            </li>
            
            <template v-if="!isLoggedIn">
              <li class="nav-item mx-2"><router-link class="btn btn-sm btn-secondary" to="/login">Login</router-link></li>
              <li class="nav-item"><router-link class="btn btn-sm btn-primary" to="/register">Register</router-link></li>
            </template>

            <template v-else>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Hi, {{ userName }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li><router-link class="dropdown-item" :to="dashboardUrl">Dashboard</router-link></li>
                  <li><router-link class="dropdown-item" to="/profile">My Profile</router-link></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="#" @click.prevent="logout">Logout</a></li>
                </ul>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  `,
  data() {
    return { isLoggedIn: false, userName: '', isUser: false, dashboardUrl: '/' };
  },
  methods: {
    updateAuthStatus() {
      this.isLoggedIn = !!localStorage.getItem('auth_token');
      this.userName = localStorage.getItem('user_full_name')?.split(' ')[0] || '';
      const role = localStorage.getItem('user_role');
      this.isUser = role === 'user';
      this.dashboardUrl = role === 'admin' ? '/admin/dashboard' : '/dashboard';
    },
    logout() {
      localStorage.clear();
      this.updateAuthStatus();
      this.$router.push('/login');
    },
  },
  created() {
    this.updateAuthStatus();
    window.addEventListener('auth-change', this.updateAuthStatus);
  },
  beforeUnmount() {
    window.removeEventListener('auth-change', this.updateAuthStatus);
  },
};