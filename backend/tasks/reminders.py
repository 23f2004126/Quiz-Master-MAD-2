from backend.celery_utils import celery
from backend.database import db, User, Score
from flask_mail import Message
from backend.main import mail
import datetime

@celery.task
def send_daily_reminders():
    """Sends a reminder email to users who have never taken a quiz."""
    print("CELERY TASK: Running daily reminder check...")
    
    # --- MODIFIED LOGIC FOR EASY TESTING ---
    # Find all user IDs who have at least one score.
    users_with_scores = db.session.query(Score.user_id).distinct()
    
    # Find all users who are NOT in that list.
    users_without_scores = User.query.filter(User.role == 'user', User.id.notin_(users_with_scores)).all()
    
    users_emailed = 0
    for user in users_without_scores:
        msg = Message(
            subject="A new challenge awaits at Quiz Master!",
            recipients=[user.username],
            body=(
                f"Hi {user.full_name},\n\n"
                "We noticed you haven't taken a quiz yet! There are quizzes waiting for you to test your knowledge. "
                "Come back and aim for the top score!\n\n"
                "The Quiz Master Team"
            )
        )
        try:
            mail.send(msg)
            print(f"Sent reminder email to new user: {user.username}")
            users_emailed += 1
        except Exception as e:
            print(f"Failed to send reminder to {user.username}: {e}")
    
    return f"Reminder task complete. Sent emails to {users_emailed} users without scores."