export const HomeComponent = {
    template: `
    <div class="content-container text-center" style="margin-top: 10vh; max-width: 700px;">
        <h2 class="page-title" style="font-size: 4rem;">Quiz Master</h2>
        <p class="fs-5 mt-3" style="color: #5a3e2b;">
            Every question is a step toward your success.<br>
            Let’s grow your knowledge, one quiz at a time.
        </p>
        <div class="mt-5">
            <router-link to="/login" class="btn btn-lg btn-primary">Begin Your Journey</router-link>
        </div>
    </div>
    `
};