import { apiService } from '../../services/api.js';

export const AddSubjectComponent = {
    props: ['id'], // Receives 'id' from the router URL, e.g., /edit-subject/1
    template: `
     <div class="form-container">
        <h2 class="page-title">{{ isEditing ? 'Edit Subject' : 'Add New Subject' }}</h2>
        <div v-if="message" class="alert alert-success">{{ message }}</div>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <form @submit.prevent="saveSubject">
            <div class="mb-3">
                <label for="name" class="form-label">Subject Name</label>
                <input id="name" type="text" class="form-control" v-model="form.name" required>
            </div>
            <div class="mb-3">
                <label for="desc" class="form-label">Description</label>
                <textarea id="desc" class="form-control" rows="4" v-model="form.description"></textarea>
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                 <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEditing ? 'Update Subject' : 'Save Subject' }}
            </button>
            <div class="text-center mt-3">
                 <router-link to="/admin/dashboard">Back to Admin Dashboard</router-link>
            </div>
        </form>
     </div>
    `,
    data() {
      return { 
          form: this.getInitialForm(), 
          message: null, 
          error: null, 
          loading: false 
      };
    },
    computed: {
        isEditing() {
            // The component is in "edit" mode if an ID is passed as a prop
            return !!this.id;
        }
    },
    methods: {
      getInitialForm() { 
          return { name: '', description: '' }; 
      },
      async saveSubject() {
        this.message = this.error = null;
        this.loading = true;
        try {
            if (this.isEditing) {
                // If editing, send a PUT request to the update endpoint
                await apiService.put(`/admin/subjects/${this.id}`, this.form);
            } else {
                // If adding, send a POST request to the create endpoint
                await apiService.post('/admin/subjects', this.form);
            }
            this.$router.push('/admin/dashboard');
        } catch(err) { 
            this.error = err.message; 
        } finally { 
            this.loading = false; 
        }
      },
      async loadSubjectData() {
          // This method is called by the watcher
          if (this.isEditing) {
              this.loading = true;
              this.error = null;
              try {
                  const data = await apiService.get(`/admin/subjects/${this.id}`);
                  this.form = data;
              } catch (e) { 
                  this.error = "Failed to load subject data. It may have been deleted."; 
              } finally { 
                  this.loading = false; 
              }
          } else {
              // If not editing, reset the form to its initial blank state
              this.form = this.getInitialForm();
          }
      }
    },
    watch: {
        // This watcher is the crucial fix. It monitors the route's 'id' parameter.
        '$route.params.id': {
            immediate: true, // This makes the handler run immediately on component creation
            handler() {
                this.loadSubjectData();
            }
        }
    }
}