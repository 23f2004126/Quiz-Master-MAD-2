import { apiService } from '../../services/api.js';

export const AdminDashboardComponent = {
    template: `
        <div class="content-container wide-container">
            <h2 class="page-title">Admin Dashboard</h2>

            <!-- Summary Statistics Section -->
            <div class="admin-section">
                <h3>Platform Overview</h3>
                <div v-if="stats" class="row text-center g-3">
                    <div class="col-md-3"><div class="stat-card h-100"><div class="stat-card-title">Total Users</div><div class="stat-card-number">{{ stats.total_users }}</div></div></div>
                    <div class="col-md-3"><div class="stat-card h-100"><div class="stat-card-title">Total Subjects</div><div class="stat-card-number">{{ stats.total_subjects }}</div></div></div>
                    <div class="col-md-3"><div class="stat-card h-100"><div class="stat-card-title">Total Quizzes</div><div class="stat-card-number">{{ stats.total_quizzes }}</div></div></div>
                    <div class="col-md-3"><div class="stat-card h-100"><div class="stat-card-title">Total Questions</div><div class="stat-card-number">{{ stats.total_questions }}</div></div></div>
                </div>
                <div v-else class="text-center text-muted p-4">Loading stats...</div>
                <div class="mt-4" style="max-width: 600px; margin: 2rem auto 0;">
                    <canvas id="adminChart"></canvas>
                </div>
            </div>
            
            <!-- Content Management Section -->
            <div class="admin-section">
                <h3>Content Management</h3>
                <div class="mb-4">
                    <input type="text" class="form-control" placeholder="Search content across all tabs..." v-model.trim="searchQuery">
                </div>
                <ul class="nav nav-tabs">
                    <li class="nav-item"><a class="nav-link" :class="{active: tab === 'subjects'}" @click="tab='subjects'">Subjects <span class="badge rounded-pill bg-secondary ms-1">{{ filteredSubjects.length }}</span></a></li>
                    <li class="nav-item"><a class="nav-link" :class="{active: tab === 'chapters'}" @click="tab='chapters'">Chapters <span class="badge rounded-pill bg-secondary ms-1">{{ filteredChapters.length }}</span></a></li>
                    <li class="nav-item"><a class="nav-link" :class="{active: tab === 'quizzes'}" @click="tab='quizzes'">Quizzes <span class="badge rounded-pill bg-secondary ms-1">{{ filteredQuizzes.length }}</span></a></li>
                </ul>
                <div class="tab-content p-3 border border-top-0 rounded-bottom" style="min-height: 400px;">
                    <div v-if="loading" class="text-center p-5"><div class="spinner-border" style="width: 3rem; height: 3rem;"></div><p class="mt-2">Loading Content...</p></div>
                    <div v-else>
                        <div v-show="tab === 'subjects'">
                            <div class="d-flex justify-content-between align-items-center mb-3"><h4 class="mb-0">Subjects</h4><router-link to="/admin/add-subject" class="btn btn-primary btn-sm">Add New Subject</router-link></div>
                            <table class="table table-sm table-hover"><thead><tr><th>ID</th><th>Name</th><th>Description</th><th class="text-end">Actions</th></tr></thead><tbody>
                                <tr v-for="s in filteredSubjects" :key="s.id"><td>{{s.id}}</td><td>{{s.name}}</td><td>{{s.description}}</td><td class="text-end"><router-link :to="'/admin/edit-subject/' + s.id" class="btn btn-sm btn-secondary me-2">Edit</router-link><button class="btn btn-sm btn-danger" @click="deleteContent('subjects', s.id, s.name)">Delete</button></td></tr>
                                <tr v-if="!filteredSubjects.length"><td colspan="4" class="text-center text-muted">No subjects found.</td></tr>
                            </tbody></table>
                        </div>
                        <div v-show="tab === 'chapters'">
                            <div class="d-flex justify-content-between align-items-center mb-3"><h4 class="mb-0">Chapters</h4><router-link to="/admin/add-chapter" class="btn btn-primary btn-sm">Add New Chapter</router-link></div>
                            <table class="table table-sm table-hover"><thead><tr><th>ID</th><th>Name</th><th>Subject</th><th class="text-end">Actions</th></tr></thead><tbody>
                                <tr v-for="c in filteredChapters" :key="c.id"><td>{{c.id}}</td><td>{{c.name}}</td><td><span class="badge bg-secondary">{{ c.subject_name }}</span></td><td class="text-end"><router-link :to="'/admin/edit-chapter/' + c.id" class="btn btn-sm btn-secondary me-2">Edit</router-link><button class="btn btn-sm btn-danger" @click="deleteContent('chapters', c.id, c.name)">Delete</button></td></tr>
                                <tr v-if="!filteredChapters.length"><td colspan="4" class="text-center text-muted">No chapters found.</td></tr>
                            </tbody></table>
                        </div>
                        <div v-show="tab === 'quizzes'">
                            <div class="d-flex justify-content-between align-items-center mb-3"><h4 class="mb-0">Quizzes</h4><router-link to="/admin/add-quiz" class="btn btn-primary btn-sm">Add New Quiz</router-link></div>
                            <table class="table table-sm table-hover"><thead><tr><th>ID</th><th>Title</th><th>Chapter</th><th class="text-end">Actions</th></tr></thead><tbody>
                                <tr v-for="q in filteredQuizzes" :key="q.id"><td>{{q.id}}</td><td>{{q.title}}</td><td><span class="badge bg-secondary">{{ q.chapter_name }}</span></td><td class="text-end"><router-link :to="'/admin/quiz/'+q.id+'/manage'" class="btn btn-sm btn-info me-2">Manage Questions</router-link><router-link :to="'/admin/edit-quiz/' + q.id" class="btn btn-sm btn-secondary me-2">Edit</router-link><button class="btn btn-sm btn-danger" @click="deleteContent('quizzes', q.id, q.title)">Delete</button></td></tr>
                                <tr v-if="!filteredQuizzes.length"><td colspan="4" class="text-center text-muted">No quizzes found.</td></tr>
                            </tbody></table>
                        </div>
                    </div>
                </div>
            </div>

             <!-- User Management & Export Section -->
            <div class="admin-section">
                <h3>User Management</h3>
                <div class="d-flex justify-content-center">
                    <button class="btn btn-info" @click="exportAllUsers" :disabled="exporting">
                        <span v-if="exporting" class="spinner-border spinner-border-sm me-1"></span>
                        {{ exporting ? 'Generating Report...' : 'Export All User Stats (CSV)' }}
                    </button>
                </div>
                <div v-if="exportMessage" class="alert alert-info mt-3 text-center small">{{ exportMessage }}</div>
            </div>
        </div>
    `,
    data() {
        return {
            loading: true,
            tab: 'subjects',
            content: { subjects: [], chapters: [], quizzes: [] },
            searchQuery: '',
            stats: null,
            adminChart: null,
            exporting: false,
            exportMessage: ''
        };
    },
    computed: {
        filteredSubjects() {
            if (!this.searchQuery) return this.content.subjects;
            const q = this.searchQuery.toLowerCase();
            return this.content.subjects.filter(s => 
                (s.name && s.name.toLowerCase().includes(q)) ||
                (s.description && s.description.toLowerCase().includes(q))
            );
        },
        filteredChapters() {
            if (!this.searchQuery) return this.content.chapters;
             const q = this.searchQuery.toLowerCase();
            return this.content.chapters.filter(c => 
                (c.name && c.name.toLowerCase().includes(q)) ||
                (c.subject_name && c.subject_name.toLowerCase().includes(q))
            );
        },
        filteredQuizzes() {
            if (!this.searchQuery) return this.content.quizzes;
             const q = this.searchQuery.toLowerCase();
            return this.content.quizzes.filter(quiz => 
                (quiz.title && quiz.title.toLowerCase().includes(q)) ||
                (quiz.chapter_name && quiz.chapter_name.toLowerCase().includes(q))
            );
        },
    },
    methods: {
        async fetchData() {
            this.loading = true;
            try {
                this.content = await apiService.get('/admin/content');
            } catch (e) {
                alert(`Error loading content: ${e.message}`);
            } finally {
                this.loading = false;
            }
        },
        async deleteContent(type, id, name) {
            if (confirm(`Are you sure you want to delete the ${type.slice(0,-1)} "${name}"? This action is irreversible and will delete all associated content (e.g., chapters, quizzes).`)) {
                try {
                    const response = await apiService.delete(`/admin/${type}/${id}`);
                    alert(response.message);
                    await this.fetchData();
                } catch (error) {
                    alert(`Error deleting: ${error.message}`);
                }
            }
        },
        async fetchStats() {
            try {
                this.stats = await apiService.get('/admin/stats');
                this.$nextTick(() => this.createAdminChart());
            } catch (e) {
                console.error("Could not fetch admin stats:", e.message);
            }
        },
        createAdminChart() {
            if (this.adminChart) this.adminChart.destroy();
            const canvas = document.getElementById('adminChart');
            if (!canvas || !this.stats) return;
            const ctx = canvas.getContext('2d');
            this.adminChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Users', 'Subjects', 'Quizzes', 'Questions'],
                    datasets: [{
                        label: 'Total Count',
                        data: [this.stats.total_users, this.stats.total_subjects, this.stats.total_quizzes, this.stats.total_questions],
                        backgroundColor: ['#8b6b52', '#a1866f', '#d2b48c', '#e9e1d5'],
                        borderColor: '#5a3e2b',
                        borderWidth: 1
                    }]
                },
                options: { 
                    responsive: true, 
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grace: '5%' } }, 
                    plugins: { legend: { display: false } } 
                }
            });
        },
        async exportAllUsers() {
            this.exporting = true;
            this.exportMessage = 'Triggering background job. The CSV will be emailed to you shortly...';
            try {
                const data = await apiService.post('/admin/export/users');
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
        this.fetchStats();
    }
}