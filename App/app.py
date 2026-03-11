from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
import pickle
import numpy as np
import os

app = Flask(__name__, static_folder='../UI', static_url_path='')
CORS(app)

# ============================================================
#  EMAIL CONFIGURATION (Gmail)
# ============================================================
app.config['MAIL_SERVER']         = 'smtp.gmail.com'
app.config['MAIL_PORT']           = 465
app.config['MAIL_USE_TLS']        = False
app.config['MAIL_USE_SSL']        = True
app.config['MAIL_USERNAME']       = 'anishansarbasha@gmail.com'
app.config['MAIL_PASSWORD']       = os.environ.get('MAIL_PASSWORD', '')
app.config['MAIL_DEFAULT_SENDER'] = 'anishansarbasha@gmail.com'
mail = Mail(app)

# ============================================================
#  LOAD ML MODEL FILES
# ============================================================
BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "Model")

model           = pickle.load(open(os.path.join(MODEL_DIR, "house_price_model.pkl"), "rb"))
scaler          = pickle.load(open(os.path.join(MODEL_DIR, "scaler.pkl"),            "rb"))
feature_columns = pickle.load(open(os.path.join(MODEL_DIR, "feature_columns.pkl"),  "rb"))


# ============================================================
#  SERVE HTML PAGES
# ============================================================
@app.route('/')
def home():
    return send_from_directory('../UI', 'index.html')

@app.route('/<page>')
def serve_page(page):
    return send_from_directory('../UI', page)


# ============================================================
#  PREDICTION ROUTE
# ============================================================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        input_data = []
        for col in feature_columns:
            if col not in data:
                return jsonify({"error": f"Missing feature: {col}"}), 400
            input_data.append(float(data[col]))

        input_array  = np.array([input_data])
        input_scaled = scaler.transform(input_array)
        prediction   = model.predict(input_scaled)[0]

        return jsonify({"predicted_price": float(prediction)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
#  CONTACT FORM ROUTE
# ============================================================
@app.route('/contact', methods=['POST'])
def contact():
    try:
        data = request.get_json()

        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing field: {field}"}), 400

        sender_name   = data['name']
        sender_email  = data['email']
        subject_type  = data['subject']
        user_message  = data['message']

        subject_labels = {
            "general":       "General Inquiry",
            "technical":     "Technical Question",
            "feedback":      "Feedback",
            "issue":         "Report Issue",
            "collaboration": "Collaboration"
        }
        subject_label = subject_labels.get(subject_type, subject_type.capitalize())

        email_body = f"""
Hello Anishfathima,

You have received a new message from your House Price Predictor website.

──────────────────────────────────────
  FROM    : {sender_name}
  EMAIL   : {sender_email}
  SUBJECT : {subject_label}
──────────────────────────────────────

MESSAGE:
{user_message}

──────────────────────────────────────
You can reply directly to: {sender_email}

- House Price Predictor Contact Form
        """

        msg = Message(
            subject    = f"[House Price Predictor] New {subject_label} from {sender_name}",
            recipients = ['anishansarbasha@gmail.com'],
            body       = email_body,
            reply_to   = sender_email
        )
        mail.send(msg)

        return jsonify({"success": True, "message": "Your message has been sent successfully!"}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
#  QUICK FEEDBACK ROUTE
# ============================================================
@app.route('/feedback', methods=['POST'])
def feedback():
    try:
        data = request.get_json()

        emoji_map = {
            "great":      "Great Experience",
            "good":       "Good, but can improve",
            "needs-work": "Needs Work"
        }

        feedback_type  = data.get('feedback', 'unknown')
        feedback_text  = data.get('text', 'No additional comment.')
        feedback_label = emoji_map.get(feedback_type, feedback_type)

        email_body = f"""
Hello Anishfathima,

A visitor submitted quick feedback on your House Price Predictor website.

──────────────────────────────────────
  RATING  : {feedback_label}
──────────────────────────────────────

COMMENT:
{feedback_text}

- House Price Predictor Feedback Form
        """

        msg = Message(
            subject    = f"[House Price Predictor] New Feedback: {feedback_label}",
            recipients = ['anishansarbasha@gmail.com'],
            body       = email_body
        )
        mail.send(msg)

        return jsonify({"success": True}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
if __name__ == '__main__':
    app.run(debug=True)
