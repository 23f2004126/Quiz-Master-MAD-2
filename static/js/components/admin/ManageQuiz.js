import { apiService } from '../../services/api.js';

export const ManageQuizComponent = {
    props: ['quizId'],
    template: `
        <div class="content-container">
            <h2 class="page-title">Manage Questions</h2>
             <div class="admin-section">
                <h3>{{ isEditing ? 'Edit Question' : 'Add New Question' }}</h3>
                <form @submit.prevent="saveQuestion">
                     <div class="mb-3">
                        <label class="form-label">Question Statement</label>
                        <textarea class="form-control" v-model="form.question_statement" required rows="3"></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Option 1</label>
                            <input type="text" class="form-control" v-model="form.option1" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Option 2</label>
                            <input type="text" class="form-control" v-model="form.option2" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Option 3</label>
                            <input type="text" class="form-control" v-model="form.option3" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Option 4</label>
                            <input type="text" class="form-control" v-model="form.option4" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Correct Option</label>
                        <select class="form-select" v-model.number="form.correct_option" required>
                            <option :value="1">Option 1</option>
                            <option :value="2">Option 2</option>
                            <option :value="3">Option 3</option>
                            <option :value="4">Option 4</option>
                        </select>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                           <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                           {{ isEditing ? 'Update Question' : 'Add Question' }}
                        </button>
                        <button type="button" class="btn btn-secondary" v-if="isEditing" @click="resetForm">Cancel Edit</button>
                    </div>
                </form>
             </div>
             
             <div class="admin-section">
                <h3>Existing Questions ({{ questions.length }})</h3>
                 <ul v-if="questions.length" class="list-group">
                    <li v-for="q in questions" :key="q.id" class="list-group-item">
                        <p class="mb-2"><strong>Q:</strong> {{ q.question_statement }}</p>
                        <div class="mb-2">
                           <span v-for="i in 4" class="badge me-1" :class="q.correct_option === i ? 'bg-success' : 'bg-secondary'">
                               Opt {{i}}: {{ q['option'+i] }}
                           </span>
                        </div>
                        <div>
                           <button class="btn btn-sm btn-outline-primary me-2" @click="editQuestion(q)">Edit</button>
                           <button class="btn btn-sm btn-outline-danger" @click="deleteQuestion(q.id)">Delete</button>
                        </div>
                    </li>
                </ul>
                <p v-else class="text-muted text-center">No questions have been added to this quiz yet.</p>
             </div>
              <div class="text-center mt-4">
                  <router-link to="/admin/dashboard">Back to Admin Dashboard</router-link>
              </div>
        </div>
    `,
    data(){ 
        return { 
            questions: [], 
            form: this.getInitialForm(), 
            isEditing: false, 
            loading: false 
        } 
    },
    methods: {
        getInitialForm() { 
            return { 
                question_statement: '', 
                option1: '', 
                option2: '', 
                option3: '', 
                option4: '', 
                correct_option: 1 
            } 
        },
        async fetchQuestions() { 
            try {
                this.questions = await apiService.get(`/admin/quizzes/${this.quizId}/questions`); 
            } catch (e) {
                alert(`Could not fetch questions: ${e.message}`);
            }
        },
        resetForm() { 
            this.form = this.getInitialForm(); 
            this.isEditing = false; 
        },
        async saveQuestion(){
            this.loading = true;
            try {
                const payload = { ...this.form, quiz_id: parseInt(this.quizId) };
                if(this.isEditing){
                    await apiService.put(`/admin/questions/${this.form.id}`, payload);
                } else {
                    await apiService.post(`/admin/questions`, payload);
                }
                this.resetForm();
                await this.fetchQuestions();
            } catch (e) { 
                alert(e.message) 
            }
            finally { 
                this.loading = false; 
            }
        },
        editQuestion(question) { 
            this.form = { ...question }; 
            this.isEditing = true; 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        async deleteQuestion(id) {
            if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
                try { 
                    await apiService.delete(`/admin/questions/${id}`); 
                    await this.fetchQuestions(); 
                    this.resetForm(); // Reset form in case the deleted question was being edited
                }
                catch(e) { 
                    alert(e.message); 
                }
            }
        },
    },
    async created() { 
        await this.fetchQuestions(); 
    }
};