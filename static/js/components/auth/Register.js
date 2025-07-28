import { apiService } from '../../services/api.js';

export const RegisterComponent = {
    template: `
    <div class="form-container" style="max-width: 600px;">
        <h2 class="page-title">Create Your Account</h2>
        <p class="text-center text-muted tagline">Join our community of learners.</p>
        
        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>

        <form @submit.prevent="register">
            <div class="mb-3">
                <label for="fullName" class="form-label">Full Name</label>
                <input type="text" class="form-control" id="fullName" v-model="form.full_name" required>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" v-model="form.email" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" v-model="form.password" required>
            </div>
            <div class="mb-3">
                <label for="qualification" class="form-label">Qualification</label>
                <input type="text" class="form-control" id="qualification" v-model="form.qualification" required>
            </div>
             <div class="mb-3">
                <label for="dob" class="form-label">Date of Birth</label>
                <input type="date" class="form-control" id="dob" v-model="form.dob" required>
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                Register
            </button>
        </form>
        <div class="text-center mt-3">
         Already have an account? <router-link to="/login">Log in</router-link>
       </div>
    </div>
    `,
    data() {
      return {
        form: { full_name: '', email: '', password: '', qualification: '', dob: '' },
        error: null, success: null, loading: false,
      }
    },
    methods: {
      async register() {
          this.error = null;
          this.success = null;
          this.loading = true;
          try {
              const data = await apiService.post('/register', this.form);
              this.success = data.message + " You will be redirected to the login page.";
              setTimeout(() => this.$router.push('/login'), 3000);
          } catch(err) {
              this.error = err.message || "Registration failed. Please check your details.";
          } finally {
              this.loading = false;
          }
      }
    }
}