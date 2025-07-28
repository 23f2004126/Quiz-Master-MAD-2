import { apiService } from '../../services/api.js';

export const QuizFlowComponent = {
    template: `
        <div>
            <!-- Step 1: Show Subjects -->
            <div class="content-container" v-if="step === 'subjects'">
                <h2 class="page-title">Choose Your Subject</h2>
                <div v-if="loading" class="text-center p-5"><div class="spinner-border"></div></div>
                <div v-else-if="subjects.length">
                     <div v-for="subject in subjects" :key="subject.id" class="item-card" @click="selectSubject(subject)">
                        <div class="item-card-title">{{ subject.name }}</div>
                        <p class="item-card-desc mt-2">{{ subject.description || 'Embark on a new learning journey.' }}</p>
                    </div>
                </div>
                <div v-else class="text-center p-4"><p>No subjects found. Please check back later.</p></div>
            </div>

            <!-- Step 2: Show Chapters -->
            <div class="content-container text-center" v-if="step === 'chapters'">
                <h2 class="page-title">Chapters in {{ selectedSubject.name }}</h2>
                <button class="btn btn-sm btn-outline-secondary mb-4" @click="goBackToSubjects">← Back to Subjects</button>
                <div v-if="loading" class="text-center p-5"><div class="spinner-border"></div></div>
                <div v-else-if="chapters.length">
                    <div v-for="chap in chapters" :key="chap.id" class="item-card" @click="selectChapter(chap)">{{ chap.name }}</div>
                </div>
                <div v-else class="text-center p-4"><p>No chapters found for this subject yet.</p></div>
            </div>

            <!-- Step 3: Show Quizzes -->
             <div class="content-container text-center" v-if="step === 'quizzes'">
                <h2 class="page-title">Quizzes for {{ selectedChapter.name }}</h2>
                <button class="btn btn-sm btn-outline-secondary mb-4" @click="goBackToChapters">← Back to Chapters</button>
                <div v-if="loading" class="text-center p-5"><div class="spinner-border"></div></div>
                <div v-else-if="quizzes.length">
                  <div v-for="quiz in quizzes" :key="quiz.id" class="item-card" @click="startQuiz(quiz.id)">
                    <div class="item-card-title">{{ quiz.title }}</div>
                    <div class="item-card-meta mt-2">📅 {{ formatDate(quiz.date_of_quiz) }}</div>
                  </div>
                </div>
                <div v-else class="text-center p-4"><p>No quizzes available for this chapter yet.</p></div>
            </div>
        </div>
    `,
    data() {
        return { step: 'subjects', subjects:[], chapters:[], quizzes:[], selectedSubject: null, selectedChapter: null, loading: true };
    },
    methods: {
        async selectSubject(subject){
            this.selectedSubject = subject; this.loading = true; this.step = 'chapters';
            this.chapters = await apiService.get(`/user/subjects/${subject.id}/chapters`); this.loading = false;
        },
        async selectChapter(chapter){
            this.selectedChapter = chapter; this.loading = true; this.step = 'quizzes';
            this.quizzes = await apiService.get(`/user/chapters/${chapter.id}/quizzes`); this.loading = false;
        },
        goBackToSubjects(){ this.step = 'subjects'; this.selectedSubject = null; },
        goBackToChapters(){ this.step = 'chapters'; this.selectedChapter = null; },
        startQuiz(quizId) { this.$router.push(`/quiz/${quizId}`); },
        formatDate(dateStr) { return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); },
    },
    async created() {
        this.subjects = await apiService.get('/user/subjects'); this.loading = false;
    }
};