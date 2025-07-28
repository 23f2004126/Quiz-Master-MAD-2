import { apiService } from '../../services/api.js';

export const QuizTakeComponent = {
    props: ['quizId'],
    template: `
    <div class="content-container" style="max-width: 800px">
        <div v-if="!quizFinished">
            <div v-if="quiz" class="d-flex justify-content-between align-items-center mb-4">
                 <h3 style="font-family: 'Cormorant Garamond', serif;">{{ quiz.title }}</h3>
                 <h4 class="badge bg-danger p-2" style="font-family: 'Courier New', monospace;">Time: {{ formattedTimeLeft }}</h4>
            </div>
            <div v-if="currentQuestion">
                <p class="text-muted">Question {{ questionNumber }} of {{ totalQuestions }}</p>
                <p class="lead fs-4 my-4">{{ currentQuestion.question_statement }}</p>
                <div class="list-group">
                   <label v-for="(option, index) in currentQuestion.options" :key="index" class="list-group-item list-group-item-action py-3 fs-5">
                        <input class="form-check-input me-3" type="radio" :value="index + 1" v-model="answers[currentQuestion.id]"> {{ option }}
                   </label>
                </div>
                <hr class="my-4">
                <div class="d-flex justify-content-between">
                   <button class="btn btn-secondary" @click="prevQuestion" :disabled="questionNumber === 1">Previous</button>
                   <button v-if="questionNumber < totalQuestions" class="btn btn-primary" @click="nextQuestion">Next</button>
                   <button v-else class="btn btn-success" @click="confirmSubmission">Finish & Submit</button>
                </div>
            </div>
            <div v-else class="text-center p-5"><div class="spinner-border"></div><p class="mt-2">Loading Quiz...</p></div>
        </div>
        <div v-else class="text-center p-5">
            <h2 class="page-title">Quiz Complete!</h2>
            <h3>Your Score: {{ finalScore }} / {{ totalQuestions }}</h3>
            <p class="lead">{{ resultMessage }}</p>
            <router-link to="/dashboard" class="btn btn-primary mt-3">Back to Dashboard</router-link>
        </div>
    </div>
    `,
    data() {
      return { quiz: null, answers: {}, currentQuestionIndex: 0, timeLeft: 0, timer: null, quizFinished: false, finalScore: 0 }
    },
    computed: {
        currentQuestion() { return this.quiz ? this.quiz.questions[this.currentQuestionIndex] : null; },
        questionNumber() { return this.currentQuestionIndex + 1; },
        totalQuestions() { return this.quiz ? this.quiz.questions.length : 0; },
        formattedTimeLeft() {
            const minutes = Math.floor(this.timeLeft / 60); const seconds = this.timeLeft % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        },
        resultMessage() {
            const percentage = this.totalQuestions > 0 ? (this.finalScore / this.totalQuestions) * 100 : 0;
            if (percentage >= 80) return "Excellent work! You are a true master.";
            if (percentage >= 50) return "Good job! A little more practice and you'll be on top.";
            return "Keep practicing! Every attempt is a step forward.";
        }
    },
    methods: {
        nextQuestion() { if(this.questionNumber < this.totalQuestions) this.currentQuestionIndex++; },
        prevQuestion() { if(this.questionNumber > 1) this.currentQuestionIndex--; },
        startTimer() { this.timer = setInterval(() => { if (this.timeLeft > 0) this.timeLeft--; else this.submitQuiz(); }, 1000); },
        confirmSubmission(){ if(confirm('Are you sure you want to finish and submit your answers?')) { this.submitQuiz(); } },
        async submitQuiz() {
           clearInterval(this.timer);
           try {
                const result = await apiService.post(`/user/quiz/${this.quizId}/submit`, { answers: this.answers });
                this.finalScore = result.your_score;
                this.quizFinished = true;
           } catch(err) { alert(err.message || "Could not submit your quiz."); }
       }
    },
    async created() {
        this.quiz = await apiService.get(`/user/quiz/${this.quizId}`);
        if(this.quiz) { this.timeLeft = this.quiz.time_duration * 60; this.startTimer(); }
    },
    beforeUnmount() { clearInterval(this.timer); }
}