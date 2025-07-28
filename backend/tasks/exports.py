import os
import csv
import datetime
from backend.celery_utils import celery
from backend.database import db, User, Score, Quiz
from sqlalchemy import func
from flask_mail import Message
from backend.main import mail

@celery.task
def generate_user_scores_csv(user_id):
    """Generates a CSV of scores for a user, then emails it as an attachment."""
    user = db.session.get(User, int(user_id))
    if not user:
        print(f"Export failed: User with ID {user_id} not found.")
        return {'status': 'Failed', 'message': 'User not found'}
        
    print(f"CELERY TASK: Starting score export for user {user.username}...")
    scores = Score.query.filter_by(user_id=user_id).order_by(Score.time_stamp_of_attempt.desc()).all()

    export_dir = 'temp_exports'
    os.makedirs(export_dir, exist_ok=True)
    filename = f"scores_export_{user_id}_{int(datetime.datetime.now().timestamp())}.csv"
    filepath = os.path.join(export_dir, filename)

    if not scores:
        print(f"No scores found for user {user.username}. Sending notification email.")
        msg = Message(
            subject="Your Score Export Request",
            recipients=[user.username],
            body=f"Hi {user.full_name},\n\nYou requested an export of your quiz scores, but you have not yet completed any quizzes.\n\nThanks,\nThe Quiz Master Team"
        )
        mail.send(msg)
        return {'status': 'Complete', 'message': 'No scores to export.'}

    with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['Quiz Title', 'Score', 'Date of Attempt (UTC)'])
        for score in scores:
            writer.writerow([score.quiz.title, score.total_scored, score.time_stamp_of_attempt.strftime('%Y-%m-%d %H:%M:%S')])
            
    print(f"CSV created for {user.username}. Now sending email with attachment...")

    msg = Message(
        "Your Quiz Master Score Export is Ready",
        recipients=[user.username],
        body=f"Hi {user.full_name},\n\nPlease find your quiz score export attached.\n\nThanks,\nThe Quiz Master Team"
    )
    with open(filepath, 'rb') as fp:
        msg.attach(f"my_scores_{datetime.date.today()}.csv", "text/csv", fp.read())
    mail.send(msg)
    
   
    print(f"Email with attachment sent to {user.username} and server file deleted.")
    return {'status': 'Complete', 'filename': filename}

@celery.task
def generate_user_details_csv(admin_email):
    """Generates a CSV of all users and their stats, then emails it to the requesting admin."""
    print("CELERY TASK: Starting all-user stats CSV export...")

    # Query logic for gathering user stats
    quizzes_taken_subquery = db.session.query(Score.user_id, func.count(Score.id).label('quizzes_taken')).group_by(Score.user_id).subquery()
    avg_score_subquery = db.session.query(Score.user_id, func.avg(Score.total_scored).label('average_score')).group_by(Score.user_id).subquery()
    users_data = db.session.query(User, quizzes_taken_subquery.c.quizzes_taken, avg_score_subquery.c.average_score)\
        .outerjoin(quizzes_taken_subquery, User.id == quizzes_taken_subquery.c.user_id)\
        .outerjoin(avg_score_subquery, User.id == avg_score_subquery.c.user_id)\
        .filter(User.role == 'user').all()

    export_dir = 'temp_exports'
    os.makedirs(export_dir, exist_ok=True)
    filename = f"all_users_export_{int(datetime.datetime.now().timestamp())}.csv"
    filepath = os.path.join(export_dir, filename)

    with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['User ID', 'Full Name', 'Email', 'Quizzes Taken', 'Average Score'])
        for user, taken_count, avg_scr in users_data:
            writer.writerow([user.id, user.full_name, user.username, taken_count or 0, f"{avg_scr:.2f}" if avg_scr else "N/A"])
            
    print(f"CSV created. Sending to admin at {admin_email}...")

    msg = Message(
        "User Performance Statistics Export Ready",
        recipients=[admin_email],
        body="Hi Admin,\n\nPlease find the user performance statistics export attached.\n\n- The System"
    )
    with open(filepath, 'rb') as fp:
        msg.attach(f"all_user_stats_{datetime.date.today()}.csv", "text/csv", fp.read())
    mail.send(msg)
    
    print(f"Email with user stats sent to {admin_email} and server file deleted.")
    return {'status': 'Complete'}