from backend.main import create_app
from backend.celery_utils import celery

app = create_app()
app.app_context().push()