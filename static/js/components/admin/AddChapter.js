import { apiService } from '../../services/api.js';
export const AddChapterComponent = {
    props: ['id'],
    template: `
     <div class="form-container">
        <h2 class="page-title">{{ isEditing ? 'Edit Chapter' : 'Add New Chapter' }}</h2>
        <div v-if="message" class="alert alert-success">{{ message }}</div>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <form @submit.prevent="saveChapter">
            <div class="mb-3">
                <label for="subject" class="form-label">Parent Subject</label>
                 <select id="subject" class="form-select" v-model="form.subject_id" required>
                    <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="name" class="form-label">Chapter Name</label>
                <input id="name" type="text" class="form-control" v-model="form.name" required>
            </div>
            <div class="mb-3">
                <label for="desc" class="form-label">Description</label>
                <textarea id="desc" class="form-control" rows="4" v-model="form.description"></textarea>
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                 <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEditing ? 'Update Chapter' : 'Save Chapter' }}
            </button>
            <div class="text-center mt-3"><router-link to="/admin/dashboard">Back to Admin Dashboard</router-link></div>
        </form>
     </div>
    `,
    data() {
      return { 
          form: this.getInitialForm(), 
          subjects: [], 
          message: null, 
          error: null, 
          loading: false 
      };
    },
    computed: {
        isEditing() { 
            return !!this.id; 
        }
    },
    methods: {
      getInitialForm() { 
          return { name: '', description: '', subject_id: null }; 
      },
      async saveChapter() {
        this.message = this.error = null; 
        this.loading = true;
        try {
            if (this.isEditing) {
                await apiService.put(`/admin/chapters/${this.id}`, this.form);
            } else {
                await apiService.post('/admin/chapters', this.form);
            }
            this.$router.push('/admin/dashboard');
        } catch(err) { 
            this.error = err.message; 
        } finally { 
            this.loading = false; 
        }
      },
      async loadDataForForm() {
          this.loading = true;
          this.error = null;
          try { 
              // Always fetch the list of subjects for the dropdown menu
              const contentData = await apiService.get('/admin/content');
              this.subjects = contentData.subjects;
              
              if (this.isEditing) {
                  // If editing, fetch this specific chapter's data
                  const chapterData = await apiService.get(`/admin/chapters/${this.id}`);
                  this.form = chapterData;
              } else {
                  // If adding, reset the form and pre-select the first subject if available
                  this.form = this.getInitialForm();
                  if (this.subjects.length > 0) {
                      this.form.subject_id = this.subjects[0].id;
                  }
              }
          } catch(e) { 
              this.error = `Failed to load data: ${e.message}`; 
          } finally {
              this.loading = false;
          }
      }
    },
    watch: {
        '$route.params.id': {
            immediate: true,
            handler() { 
                this.loadDataForForm(); 
            }
        }
    }
}