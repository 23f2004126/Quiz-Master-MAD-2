import { apiService } from '../../services/api.js';

export const AdminSubjectListComponent = {
    props: ['subjects'],
    template: `
        <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>All Subjects ({{ subjects.length }})</h4>
                <router-link to="/admin/add-subject" class="btn btn-sm btn-primary">Add New Subject</router-link>
            </div>
            <table class="table table-hover table-sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="subject in subjects" :key="subject.id">
                        <td>{{ subject.id }}</td>
                        <td>{{ subject.name }}</td>
                        <td>{{ subject.description }}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-secondary me-2" disabled>Edit</button>
                            <button @click="deleteSubject(subject.id, subject.name)" class="btn btn-sm btn-danger">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    methods: {
        async deleteSubject(id, name) {
            if (confirm(`Are you sure you want to delete the subject "${name}"? This will delete all its chapters and quizzes.`)) {
                try {
                    const response = await apiService.delete(`/admin/subjects/${id}`);
                    alert(response.message);
                    this.$emit('refresh-data'); // Tell the parent to re-fetch
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
        }
    }
}