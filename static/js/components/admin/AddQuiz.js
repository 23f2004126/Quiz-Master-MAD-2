import { apiService } from '../../services/api.js';

export const AddQuizComponent = {
    props: ['id'],
    template: `
     <div class="form-container">
        <h2 class="page-title">{{ isEditing ? 'Edit Quiz' : 'Add New Quiz' }}</h2>
        <div v-if="message" class="alert alert-success">{{ message }}</div>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <form @submit.prevent="saveQuiz">
            <div class="mb-3">
                <label class="form-label">Chapter</label>
                 <select class="form-select" v-model="form.chapter_id" required>
                    <optgroup v-for="s in content.subjects" :key="s.id" :label="s.name">
                        <option v-for="c in chaptersBySubject(s.id)" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </optgroup>
                </select>
            </div>
             <div class="mb-3">
                <label for="title" class="form-label">Quiz Title</label>
                <input id="title" type="text" class="form-control" v-model="form.title" required>
            </div>
             <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="date" class="form-label">Date of Quiz</label>
                    <input id="date" type="date" class="form-control" v-model="form.date" required>
                </div>
                 <div class="col-md-6 mb-3">
                    <label for="duration" class="form-label">Duration (minutes)</label>
                    <input id="duration" type="number" class="form-control" v-model.number="form.time_duration" required>
                </div>
             </div>
            <div class="mb-3">
                <label for="remarks" class="form-label">Remarks</label>
                <input id="remarks" type="text" class="form-control" v-model="form.remarks">
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEditing ? 'Update Quiz' : 'Save Quiz' }}
            </button>
            <div class="text-center mt-3"><router-link to="/admin/dashboard">Back to Admin Dashboard</router-link></div>
        </form>
     </div>
    `,
    data() {
      return { 
          form: this.getInitialForm(), 
          content: { subjects:[], chapters:[] }, 
          message: null, error: null, loading: false 
      };
    },
    computed: {
        isEditing() { 
            return !!this.id; 
        }
    },
    methods: {
        getInitialForm() { 
            const today = new Date().toISOString().split('T')[0]; // Default date to today
            return { title: '', remarks: '', chapter_id: null, date: today, time_duration: 10 }; 
        },
        chaptersBySubject(subjectId){ 
            return this.content.chapters.filter(c => c.subject_id === subjectId); 
        },
        async saveQuiz() {
            this.message = this.error = null; 
            this.loading = true;
            try {
                if (this.isEditing) {
                    await apiService.put(`/admin/quizzes/${this.id}`, this.form);
                } else {
                    const response = await apiService.post('/admin/quizzes', this.form);
                    // On successful creation, go directly to the question manager for the new quiz
                    this.$router.push(`/admin/quiz/${response.id}/manage`);
                    return; // Prevent the default redirect
                }
                this.$router.push('/admin/dashboard');
            } catch(e) { 
                this.error = e.message; 
            } finally { 
                this.loading = false; 
            }
        },
        async loadDataForForm() {
            this.loading = true;
            this.error = null;
            try { 
                this.content = await apiService.get('/admin/content'); 
                
                if (this.isEditing) {
                    const data = await apiService.get(`/admin/quizzes/${this.id}`);
                    this.form = data;
                } else {
                    this.form = this.getInitialForm();
                    // Pre-select the first chapter of the first subject
                    if(this.content.chapters.length > 0){
                        this.form.chapter_id = this.content.chapters[0].id;
                    }
                }
            } catch (e) { 
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