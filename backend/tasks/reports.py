from backend.celery_utils import celery
from backend.database import db, User, Score, Quiz
from flask_mail import Message
from flask import render_template
from backend.main import mail
import datetime

@celery.task
def send_monthly_activity_reports():
    """Generates and sends a monthly activity report via email to every user with activity."""
    print("CELERY TASK: Generating monthly reports...")
    
    all_users = User.query.filter_by(role='user').all()
    
    # --- MODIFIED LOGIC FOR EASY TESTING ---
    # We look for scores in the last year instead of just the previous calendar month.
    # This ensures that any recently completed quizzes are included in the test report.
    one_year_ago = datetime.date.today() - datetime.timedelta(days=365)
    report_period_str = f"since {one_year_ago.strftime('%B %Y')}"

    users_emailed = 0
    for user in all_users:
        scores = Score.query.join(Quiz).filter(
            Score.user_id == user.id,
            Score.time_stamp_of_attempt >= one_year_ago
        ).order_by(Score.time_stamp_of_attempt.desc()).all()
        
        quizzes_taken = len(scores)
        if quizzes_taken == 0:
            continue

        total_score = sum(s.total_scored for s in scores)
        average_score = total_score / quizzes_taken
        
        html_body = render_template(
            'reports/monthly_report.html',
            user=user,
            quizzes_taken=quizzes_taken,
            average_score=round(average_score, 2),
            scores=scores,
            report_month=report_period_str # Use the modified period string
        )
        
        msg = Message(
            subject=f"Your Quiz Master Activity Report",
            recipients=[user.username],
            html=html_body
        )

        try:
            mail.send(msg)
            print(f"Successfully sent activity report to {user.username}")
            users_emailed += 1
        except Exception as e:
            print(f"Failed to send activity report to {user.username}: {e}")
        
    return f"Report task complete. Sent emails to {users_emailed} users."