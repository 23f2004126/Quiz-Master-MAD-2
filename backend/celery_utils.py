from celery import Celery
from celery.schedules import crontab

celery = Celery(__name__)

def init_celery(app):
    """Initialize Celery with Flask app configuration."""
    # Link Celery to the Flask app's configuration
    celery.conf.update(
        broker_url=app.config['CELERY_BROKER_URL'],
        result_backend=app.config['CELERY_RESULT_BACKEND'],
        # Explicitly tell Celery where to find our task modules
        imports=('backend.tasks.reminders', 'backend.tasks.reports', 'backend.tasks.exports')
    )

    # A Celery Task that has access to the Flask application context
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    
    # ==============================================================
    # THE SCHEDULE CHANGE IS HERE
    # ==============================================================
    celery.conf.beat_schedule = {
        'send-daily-reminders': {
            'task': 'backend.tasks.reminders.send_daily_reminders',
            # CHANGED: Run every 120 seconds (2 minutes) for testing
            'schedule': 120.0,
        },
        'send-monthly-reports': {
            'task': 'backend.tasks.reports.send_monthly_activity_reports',
            # CHANGED: Run every 120 seconds (2 minutes) for testing
            'schedule': 120.0,
        },
    }