import { apiService } from '../../services/api.js';

export const ProfileComponent = {
    template: `
        <div class="content-container" style="max-width: 700px;">
            <h2 class="page-title">My Profile</h2>
            <div v-if="loading" class="text-center p-5"><div class="spinner-border"></div></div>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-if="profile" class="profile-details mt-4">
                <dl class="row">
                    <dt class="col-sm-4 text-muted">Full Name</dt>
                    <dd class="col-sm-8">{{ profile.full_name }}</dd>

                    <dt class="col-sm-4 text-muted">Email Address</dt>
                    <dd class="col-sm-8">{{ profile.email }}</dd>

                    <dt class="col-sm-4 text-muted">Qualification</dt>
                    <dd class="col-sm-8">{{ profile.qualification }}</dd>
                    
                    <dt class="col-sm-4 text-muted">Date of Birth</dt>
                    <dd class="col-sm-8">{{ formatDate(profile.dob) }}</dd>
                </dl>
                <div class="text-center mt-5">
                    <router-link :to="dashboardUrl" class="btn btn-secondary">Back to Dashboard</router-link>
                </div>
            </div>
        </div>
    `,
    data() {
        return { profile: null, loading: true, error: null, dashboardUrl: '/' }
    },
    methods: {
        formatDate(dateStr) {
            if (!dateStr) return 'Not Provided';
            return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    },
    async created() {
        this.dashboardUrl = localStorage.getItem('user_role') === 'admin' ? '/admin/dashboard' : '/dashboard';
        try {
            this.profile = await apiService.get('/user/profile');
        } catch(e) { this.error = e.message; } 
        finally { this.loading = false; }
    }
}