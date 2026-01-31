from flask import Flask, render_template, request, jsonify, Response
import sqlite3
from datetime import datetime
import csv

app = Flask(__name__)
DB_NAME = "survey.db"


# ---------------- DB INIT ----------------
def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            age TEXT,
            occupation TEXT,
            frequency TEXT,
            preferred_meals TEXT,
            pain_points TEXT,
            price_range TEXT,
            subscription_interest TEXT,
            recommend_score INTEGER,
            feedback TEXT,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()


# ---------------- ROUTES ----------------
@app.route("/")
def survey():
    return render_template("survey.html")


@app.route("/submit", methods=["POST"])
def submit():
    data = request.json

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""
        INSERT INTO responses 
        (name, age, occupation, frequency, preferred_meals, pain_points, price_range,
         subscription_interest, recommend_score, feedback, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("name"),
        data.get("age"),
        data.get("occupation"),
        data.get("frequency"),
        data.get("preferred_meals"),
        data.get("pain_points"),
        data.get("price_range"),
        data.get("subscription_interest"),
        int(data.get("recommend_score", 0)),
        data.get("feedback"),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    conn.commit()
    conn.close()

    return jsonify({"status": "success"})


@app.route("/admin")
def admin():
    return render_template("admin.html")


@app.route("/stats")
def stats():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    # Total responses
    c.execute("SELECT COUNT(*) FROM responses")
    total = c.fetchone()[0]

    # Group price ranges
    c.execute("SELECT price_range, COUNT(*) FROM responses GROUP BY price_range")
    price_data = c.fetchall()

    # Group ordering frequency
    c.execute("SELECT frequency, COUNT(*) FROM responses GROUP BY frequency")
    freq_data = c.fetchall()

    # Average score
    c.execute("SELECT recommend_score FROM responses")
    scores = [row[0] for row in c.fetchall()]
    avg_score = round(sum(scores) / len(scores), 2) if scores else 0

    conn.close()

    return jsonify({
        "total": total,
        "avg_score": avg_score,
        "price_data": price_data,
        "freq_data": freq_data
    })


@app.route("/responses")
def responses():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT * FROM responses ORDER BY id DESC")
    rows = c.fetchall()
    conn.close()

    formatted = []
    for r in rows:
        formatted.append({
            "id": r[0],
            "name": r[1],
            "age": r[2],
            "occupation": r[3],
            "frequency": r[4],
            "preferred_meals": r[5],
            "pain_points": r[6],
            "price_range": r[7],
            "subscription_interest": r[8],
            "recommend_score": r[9],
            "feedback": r[10],
            "created_at": r[11]
        })
    return jsonify(formatted)


@app.route("/export")
def export_csv():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT * FROM responses ORDER BY id DESC")
    rows = c.fetchall()
    conn.close()

    def generate():
        output = []
        writer = csv.writer(output)

        # Header row
        header = ["id", "name", "age", "occupation", "frequency", "preferred_meals",
                  "pain_points", "price_range", "subscription_interest",
                  "recommend_score", "feedback", "created_at"]

        yield ",".join(header) + "\n"

        for row in rows:
            safe_row = []
            for item in row:
                text = "" if item is None else str(item)
                text = text.replace(",", " ")  # avoid CSV comma breaking
                safe_row.append(text)
            yield ",".join(safe_row) + "\n"

    return Response(
        generate(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=homebites_survey.csv"}
    )


if __name__ == "__main__":
    init_db()
    # host=0.0.0.0 makes it accessible to phone on same WiFi
    app.run(host="0.0.0.0", port=5000, debug=True)
