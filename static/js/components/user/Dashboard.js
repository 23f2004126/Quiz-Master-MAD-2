import { apiService } from '../../services/api.js';

export const DashboardComponent = {
    template: `
        <div class="content-container" style="max-width: 900px;">
            <h2 class="page-title">Welcome, {{ userName }}!</h2>
            <p class="text-center text-muted mb-5">Here is a summary of your scholarly pursuits.</p>

            <!-- User Summary Statistics -->
            <div class="admin-section">
                <h3>At a Glance</h3>
                <div v-if="stats" class="row text-center g-3">
                    <div class="col-md-4"><div class="stat-card h-100"><div class="stat-card-title">Quizzes Taken</div><div class="stat-card-number">{{ stats.quizzes_taken }}</div></div></div>
                    <div class="col-md-4"><div class="stat-card h-100"><div class="stat-card-title">Average Score</div><div class="stat-card-number">{{ stats.average_score }}</div></div></div>
                    <div class="col-md-4"><div class="stat-card h-100">
                        <div class="stat-card-title">Highest Score</div>
                        <div class="stat-card-number">{{ stats.highest_score }}</div>
                        <small class="text-muted" v-if="stats.highest_score_quiz">on "{{ stats.highest_score_quiz }}"</small>
                    </div></div>
                </div>
                <div v-else class="text-center text-muted p-4">Loading your statistics...</div>
            </div>

            <!-- Actions Section -->
            <div class="admin-section text-center">
                <h3>Actions</h3>
                 <div class="d-flex justify-content-center flex-wrap gap-3">
                    <router-link to="/subjects" class="btn btn-primary">Take a New Quiz</router-link>
                    <button @click="exportScores" class="btn btn-info" :disabled="exporting">
                       <span v-if="exporting" class="spinner-border spinner-border-sm me-1"></span>
                        {{ exporting ? 'Generating Report...' : 'Export My Scores (CSV)' }}
                    </button>
                 </div>
                 <div v-if="exportMessage" class="alert alert-info mt-3 small">{{ exportMessage }}</div>
            </div>

            <!-- Performance Graph & Recent Attempts -->
            <div class="admin-section">
                <h3>Performance Overview</h3>
                <div v-if="loadingData" class="text-center p-5"><div class="spinner-border"></div><p class="mt-2">Loading performance data...</p></div>
                <div v-else-if="recentScores.length > 0" class="row mt-4 align-items-center">
                    <div class="col-md-7">
                        <h4>Scores on Recent Quizzes</h4>
                        <canvas id="scoresChart"></canvas>
                    </div>
                    <div class="col-md-5">
                        <h4>Latest Attempts</h4>
                        <ul class="list-group" style="max-height: 300px; overflow-y: auto;">
                            <li v-for="score in recentScores" :key="score.date" class="list-group-item d-flex justify-content-between align-items-center">
                               <span>{{ score.quiz_title }}<small class="text-muted d-block">{{ formatDate(score.date) }}</small></span>
                               <span class="badge bg-primary rounded-pill fs-6">{{ score.score }} pts</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div v-else class="text-center p-5">
                    <h4>You haven't attempted any quizzes yet.</h4>
                    <div class="mt-4">
                         <router-link to="/subjects" class="btn btn-primary">Take Your First Quiz!</router-link>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
      return { 
          userName: '', 
          stats: null, 
          recentScores: [], 
          scoresChart: null,
          loadingData: true,
          exporting: false,
          exportMessage: ''
      };
    },
    methods: {
        formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        },
        createChart() {
            if (this.scoresChart) this.scoresChart.destroy();
            const canvas = document.getElementById('scoresChart');
            if (!canvas || !this.recentScores || this.recentScores.length === 0) return;
            const ctx = canvas.getContext('2d');
            this.scoresChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.recentScores.map(s => s.quiz_title).reverse(),
                    datasets: [{
                        label: 'Score', data: this.recentScores.map(s => s.score).reverse(),
                        backgroundColor: 'rgba(139, 107, 82, 0.2)', borderColor: 'rgba(139, 107, 82, 1)',
                        borderWidth: 2, tension: 0.1, fill: true
                    }]
                },
                options: { 
                    responsive: true, 
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grace: '5%' } }, 
                    plugins: { legend: { display: false } } 
                }
            });
        },
        async fetchData() {
            this.loadingData = true;
            this.userName = localStorage.getItem('user_full_name')?.split(' ')[0] || 'Scholar';
            try {
                const [statsData, scoresData] = await Promise.all([
                    apiService.get('/user/stats'), apiService.get('/user/scores')
                ]);
                this.stats = statsData;
                this.recentScores = scoresData;
                this.$nextTick(() => { this.createChart(); });
            } catch (e) {
                console.error("Failed to load dashboard data:", e.message);
                alert(`Could not load your dashboard data: ${e.message}`);
            } finally {
                this.loadingData = false;
            }
        },
        async exportScores() {
            this.exporting = true;
            this.exportMessage = 'Triggering background job. The CSV will be emailed to you shortly...';
            try {
                const data = await apiService.post('/user/export/scores');
                this.exportMessage = data.message;
            } catch (err) {
                this.exportMessage = `Error: ${err.message}`;
            } finally {
                this.exporting = false;
            }
        }
    },
    created() {
        this.fetchData();
    }
};