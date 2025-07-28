import { apiService } from '../../services/api.js';

export const QuizListComponent = {
     template: `
    <div class="content-container text-center">
      <h2 class="page-title">Available Quizzes</h2>
       <div v-if="loading" class="text-center p-5"><div class="spinner-border" role="status"></div></div>
       <div v-if="quizzes.length">
          <div v-for="quiz in quizzes" :key="quiz.id" class="item-card" @click="startQuiz(quiz.id)">
            <div class="item-card-title">{{ quiz.title }}</div>
            <div class="item-card-meta mt-2">📅 {{ formatDate(quiz.date_of_quiz) }}</div>
          </div>
        </div>
        <div v-if="!loading && !quizzes.length" class="text-center p-4">
             <p>No quizzes available for this chapter yet. Please check back later.</p>
        </div>
    </div>
    `,
    data() { return { quizzes: [], loading: true } },
    async created() {
        const chapterId = this.$route.params.chapterId;
        this.quizzes = await apiService.get(`/user/chapters/${chapterId}/quizzes`);
        this.loading = false;
    },
    methods: {
        startQuiz(id) {
            this.$router.push(`/quiz/${id}`);
        },
        formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    }
}