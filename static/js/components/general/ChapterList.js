import { apiService } from '../../services/api.js';

export const ChapterListComponent = {
     template: `
    <div class="content-container text-center">
        <h2 class="page-title">Chapters</h2>
        <div v-if="loading" class="text-center p-5"><div class="spinner-border" role="status"></div></div>
        <div v-if="chapters.length">
            <div v-for="chap in chapters" :key="chap.id" class="item-card" @click="goToQuizzes(chap.id)">
                {{ chap.name }}
            </div>
        </div>
        <div v-if="!loading && !chapters.length" class="text-center p-4">
             <p>No chapters found for this subject yet. Please check back later.</p>
        </div>
    </div>
  `,
  data() { return { chapters: [], loading: true } },
  async created() {
      const subjectId = this.$route.params.subjectId;
      this.chapters = await apiService.get(`/user/subjects/${subjectId}/chapters`);
      this.loading = false;
  },
  methods: {
      goToQuizzes(id) {
          this.$router.push(`/chapters/${id}/quizzes`);
      }
  }
}