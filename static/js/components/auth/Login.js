import { apiService } from '../../services/api.js';

export const LoginComponent = {
    template: `
    <div class="form-container" style="max-width: 450px;">
      <h2 class="page-title">Login</h2>
      <p class="text-center text-muted">Welcome back, scholar!</p>
       <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
       <form @submit.prevent="login">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="email" v-model="email" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="password" required>
          </div>
          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Login
          </button>
       </form>
       <div class="text-center mt-3">
         Don’t have an account? <router-link to="/register">Register here</router-link>
       </div>
    </div>
    `,
    data() {
      return { email: '', password: '', error: null, loading: false };
    },
    methods: {
      async login() {
        this.error = null;
        this.loading = true;
        try {
          const data = await apiService.post('/login', { email: this.email, password: this.password });
          localStorage.setItem('auth_token', data.access_token);
          localStorage.setItem('user_full_name', data.user.full_name);
          localStorage.setItem('user_role', data.user.role);
          
          window.dispatchEvent(new CustomEvent('auth-change'));
          
          if (data.user.role === 'admin') {
              this.$router.push('/admin/dashboard');
          } else {
              this.$router.push('/dashboard');
          }
        } catch (err) {
          this.error = err.message || "Invalid email or password.";
        } finally {
            this.loading = false;
        }
      }
    }
};


