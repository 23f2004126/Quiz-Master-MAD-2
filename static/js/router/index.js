import { HomeComponent } from '../components/general/Home.js';
import { NavbarComponent } from '../components/general/Navbar.js';
import { ProfileComponent } from '../components/general/Profile.js';
import { LoginComponent } from '../components/auth/Login.js';
import { RegisterComponent } from '../components/auth/Register.js';
import { DashboardComponent as UserDashboardComponent } from '../components/user/Dashboard.js';
import { QuizFlowComponent } from '../components/user/QuizFlow.js';
import { QuizTakeComponent } from '../components/user/QuizTake.js';
import { AdminDashboardComponent } from '../components/admin/AdminDashboard.js';
import { AddSubjectComponent } from '../components/admin/AddSubject.js';
import { AddChapterComponent } from '../components/admin/AddChapter.js';
import { AddQuizComponent } from '../components/admin/AddQuiz.js';
import { ManageQuizComponent } from '../components/admin/ManageQuiz.js';

const routes = [
  // Public Routes that do not require login
  { path: '/', component: HomeComponent },
  { path: '/login', component: LoginComponent },
  { path: '/register', component: RegisterComponent },

  // General Authenticated Routes (accessible by any logged-in user)
  { path: '/profile', component: ProfileComponent, meta: { requiresAuth: true } },

  // User-Only Routes (will redirect admins)
  { path: '/dashboard', component: UserDashboardComponent, meta: { requiresAuth: true, role: 'user'} },
  { path: '/subjects', component: QuizFlowComponent, meta: { requiresAuth: true, role: 'user' } },
  { path: '/quiz/:quizId', component: QuizTakeComponent, meta: { requiresAuth: true, role: 'user' }, props: true },
  
  // Admin-Only Routes (will redirect regular users)
  { path: '/admin/dashboard', component: AdminDashboardComponent, meta: { requiresAuth: true, role: 'admin'} },
  
  // ADD & EDIT Routes for Admin
  { path: '/admin/add-subject', component: AddSubjectComponent, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/edit-subject/:id', component: AddSubjectComponent, meta: { requiresAuth: true, role: 'admin' }, props: true },
  
  { path: '/admin/add-chapter', component: AddChapterComponent, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/edit-chapter/:id', component: AddChapterComponent, meta: { requiresAuth: true, role: 'admin' }, props: true },
  
  { path: '/admin/add-quiz', component: AddQuizComponent, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/edit-quiz/:id', component: AddQuizComponent, meta: { requiresAuth: true, role: 'admin' }, props: true },
  
  { path: '/admin/quiz/:quizId/manage', component: ManageQuizComponent, meta: { requiresAuth: true, role: 'admin' }, props: true },

  // A catch-all route to redirect any unknown paths to the home page
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes,
});

// Global navigation guard to protect routes
router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('auth_token');
    const userRole = localStorage.getItem('user_role');

    // Check if the route requires authentication
    if (to.meta.requiresAuth) {
        if (!isLoggedIn) {
            // If user is not logged in, redirect them to the login page
            next({ path: '/login' });
        } else {
            // If user is logged in, check if the route requires a specific role
            if (to.meta.role && to.meta.role !== userRole) {
                // If the user's role does not match the required role,
                // redirect them to their respective dashboard.
                next(userRole === 'admin' ? '/admin/dashboard' : '/dashboard');
            } else {
                // If roles match or no specific role is required, allow access
                next();
            }
        }
    } else {
        // If the route does not require authentication, allow access
        next();
    }
});

export default router;