"""
Test Tekshirish Tizimi — PostgreSQL Database moduli (psycopg2)
Neon.tech PostgreSQL bilan ishlash uchun to'liq refaktoring qilingan.
SQLite fallback lokal sinov uchun saqlab qolindi.
"""
import json
import os
import re
import time
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

UZB_TZ = timezone(timedelta(hours=5))
ADMIN_ID = int(os.getenv("ADMIN_ID", "8039427064"))

DATABASE_URL = os.getenv("DATABASE_URL", "")

# PostgreSQL yoki SQLite ni avtomatik aniqlash
USE_POSTGRES = bool(DATABASE_URL and ("postgresql" in DATABASE_URL or "postgres" in DATABASE_URL))

if not USE_POSTGRES:
    import sqlite3
    data_dir = os.getenv("DATA_DIR")
    if data_dir:
        try:
            os.makedirs(data_dir, exist_ok=True)
        except Exception:
            pass
        DB_FILE = os.path.join(data_dir, "test_system.db")
    else:
        DB_FILE = os.getenv("DB_PATH", "test_system.db")


def format_uzb_time(timestamp: Optional[float] = None, fmt: str = "%d.%m.%Y %H:%M") -> str:
    """O'zbekiston (Toshkent, UTC+5) vaqti bo'yicha formatlash"""
    if timestamp is None:
        dt = datetime.now(UZB_TZ)
    else:
        dt = datetime.fromtimestamp(timestamp, tz=UZB_TZ)
    return dt.strftime(fmt)


# ──────────────────────────────────────────────────────────
# ULANISH MENEJERI
# ──────────────────────────────────────────────────────────

def get_connection():
    """PostgreSQL yoki SQLite ulanishini qaytaradi."""
    if USE_POSTGRES:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        conn.autocommit = False
        return conn
    else:
        conn = sqlite3.connect(DB_FILE, timeout=20.0, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA busy_timeout=20000;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        return conn


def _row_to_dict(row) -> Optional[Dict[str, Any]]:
    """psycopg2 RealDictRow yoki sqlite3.Row ni dict ga o'tkazish."""
    if row is None:
        return None
    return dict(row)


def _commit_and_close(conn):
    """Commit qilib, ulanishni yopish."""
    try:
        conn.commit()
    finally:
        conn.close()


def _placeholder(n: int = 1) -> str:
    """PostgreSQL uchun %s, SQLite uchun ? placeholder qaytaradi."""
    ph = "%s" if USE_POSTGRES else "?"
    if n == 1:
        return ph
    return ", ".join([ph] * n)


def _ph() -> str:
    """Bitta placeholder."""
    return "%s" if USE_POSTGRES else "?"


# ──────────────────────────────────────────────────────────
# JADVALLARNI YARATISH
# ──────────────────────────────────────────────────────────

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    if USE_POSTGRES:
        # PostgreSQL jadvallar
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            tg_id BIGINT UNIQUE NOT NULL,
            fullname TEXT NOT NULL,
            phone TEXT NOT NULL,
            username TEXT,
            status TEXT DEFAULT 'pending',
            pin_code TEXT,
            registered_at BIGINT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS tests (
            id SERIAL PRIMARY KEY,
            test_code TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            subject TEXT DEFAULT 'Matematika',
            pdf_file_id TEXT,
            pdf_file_name TEXT,
            answers_json TEXT NOT NULL,
            total_questions INTEGER DEFAULT 45,
            time_limit_min INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            key_access_code TEXT,
            results_published INTEGER DEFAULT 0,
            created_at BIGINT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS submissions (
            id SERIAL PRIMARY KEY,
            test_id INTEGER NOT NULL REFERENCES tests(id),
            test_code TEXT NOT NULL,
            user_tg_id BIGINT NOT NULL,
            fullname TEXT NOT NULL,
            phone TEXT NOT NULL,
            answers_json TEXT NOT NULL,
            score REAL NOT NULL,
            max_score REAL DEFAULT 100.0,
            correct_count INTEGER NOT NULL,
            total_count INTEGER DEFAULT 45,
            details_json TEXT NOT NULL,
            submitted_at BIGINT NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            tg_id BIGINT PRIMARY KEY,
            fullname TEXT,
            username TEXT,
            added_by BIGINT,
            created_at BIGINT NOT NULL
        )
        """)

        # Bosh adminni qo'shish (ON CONFLICT — PostgreSQL)
        cur.execute("""
        INSERT INTO admins (tg_id, fullname, username, added_by, created_at)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (tg_id) DO NOTHING
        """, (8039427064, 'Bosh Admin', 'admin', 0, 1789300000))

    else:
        # SQLite jadvallar (fallback)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tg_id INTEGER UNIQUE NOT NULL,
            fullname TEXT NOT NULL,
            phone TEXT NOT NULL,
            username TEXT,
            status TEXT DEFAULT 'pending',
            pin_code TEXT,
            registered_at INTEGER NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_code TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            subject TEXT DEFAULT 'Matematika',
            pdf_file_id TEXT,
            pdf_file_name TEXT,
            answers_json TEXT NOT NULL,
            total_questions INTEGER DEFAULT 45,
            time_limit_min INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            key_access_code TEXT,
            results_published INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_id INTEGER NOT NULL,
            test_code TEXT NOT NULL,
            user_tg_id INTEGER NOT NULL,
            fullname TEXT NOT NULL,
            phone TEXT NOT NULL,
            answers_json TEXT NOT NULL,
            score REAL NOT NULL,
            max_score REAL DEFAULT 100.0,
            correct_count INTEGER NOT NULL,
            total_count INTEGER DEFAULT 45,
            details_json TEXT NOT NULL,
            submitted_at INTEGER NOT NULL,
            FOREIGN KEY(test_id) REFERENCES tests(id)
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            tg_id INTEGER PRIMARY KEY,
            fullname TEXT,
            username TEXT,
            added_by INTEGER,
            created_at INTEGER NOT NULL
        )
        """)

        cur.execute("""
        INSERT OR IGNORE INTO admins (tg_id, fullname, username, added_by, created_at)
        VALUES (8039427064, 'Bosh Admin', 'admin', 0, 1789300000)
        """)

    _commit_and_close(conn)


# ──────────────────────────────────────────────────────────
# USERS & ACCESS
# ──────────────────────────────────────────────────────────

def add_or_update_user(tg_id: int, fullname: str, phone: str,
                       username: Optional[str] = None, status: str = "approved") -> bool:
    conn = get_connection()
    cur = conn.cursor()
    now = int(time.time())
    try:
        if USE_POSTGRES:
            cur.execute("""
            INSERT INTO users (tg_id, fullname, phone, username, status, registered_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (tg_id) DO UPDATE SET
                fullname = EXCLUDED.fullname,
                phone = EXCLUDED.phone,
                username = EXCLUDED.username,
                status = CASE WHEN users.status = 'blocked' THEN 'blocked' ELSE EXCLUDED.status END
            """, (tg_id, fullname, phone, username, status, now))
        else:
            cur.execute("""
            INSERT INTO users (tg_id, fullname, phone, username, status, registered_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(tg_id) DO UPDATE SET
                fullname=excluded.fullname,
                phone=excluded.phone,
                username=excluded.username,
                status=CASE WHEN users.status = 'blocked' THEN 'blocked' ELSE excluded.status END
            """, (tg_id, fullname, phone, username, status, now))
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error saving user: {e}")
        conn.close()
        return False


def get_user(tg_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM users WHERE tg_id = {_ph()}", (tg_id,))
    row = cur.fetchone()
    conn.close()
    return _row_to_dict(row)


def is_user_approved(tg_id: int, admin_id: int = 8039427064) -> bool:
    user = get_user(tg_id)
    if not user:
        return True
    return user.get("status") != "blocked"


def approve_user(tg_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(f"UPDATE users SET status = 'approved' WHERE tg_id = {_ph()}", (tg_id,))
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error approving user: {e}")
        conn.close()
        return False


def reject_user(tg_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(f"UPDATE users SET status = 'rejected' WHERE tg_id = {_ph()}", (tg_id,))
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error rejecting user: {e}")
        conn.close()
        return False


def set_user_pin(tg_id: int, pin: str) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(f"UPDATE users SET pin_code = {_ph()} WHERE tg_id = {_ph()}", (pin, tg_id))
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error setting PIN: {e}")
        conn.close()
        return False


def get_user_pin(tg_id: int) -> Optional[str]:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(f"SELECT pin_code FROM users WHERE tg_id = {_ph()}", (tg_id,))
        row = cur.fetchone()
        conn.close()
        if row:
            d = _row_to_dict(row)
            return d.get("pin_code") if d else None
        return None
    except Exception as e:
        print(f"Error getting PIN: {e}")
        conn.close()
        return None


def block_user(tg_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(f"UPDATE users SET status = 'blocked' WHERE tg_id = {_ph()}", (tg_id,))
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error blocking user: {e}")
        conn.close()
        return False


def delete_user(tg_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(f"DELETE FROM submissions WHERE user_tg_id = {_ph()}", (tg_id,))
        cur.execute(f"DELETE FROM users WHERE tg_id = {_ph()}", (tg_id,))
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error deleting user: {e}")
        conn.close()
        return False


def get_users_count() -> Dict[str, int]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as total FROM users")
    total = (_row_to_dict(cur.fetchone()) or {}).get("total", 0)
    cur.execute("SELECT COUNT(*) as approved FROM users WHERE status = 'approved'")
    approved = (_row_to_dict(cur.fetchone()) or {}).get("approved", 0)
    cur.execute("SELECT COUNT(*) as pending FROM users WHERE status = 'pending'")
    pending = (_row_to_dict(cur.fetchone()) or {}).get("pending", 0)
    cur.execute("SELECT COUNT(*) as blocked FROM users WHERE status = 'blocked'")
    blocked = (_row_to_dict(cur.fetchone()) or {}).get("blocked", 0)
    conn.close()
    return {
        "total": total,
        "approved": approved,
        "pending": pending,
        "blocked": blocked
    }


# ──────────────────────────────────────────────────────────
# TESTS
# ──────────────────────────────────────────────────────────

def create_test(test_code: str, title: str, subject: str, answers: Dict[str, Any],
                pdf_file_id: Optional[str] = None, pdf_file_name: Optional[str] = None,
                time_limit_min: int = 0, key_access_code: str = "") -> bool:
    conn = get_connection()
    cur = conn.cursor()
    now = int(time.time())
    try:
        if USE_POSTGRES:
            cur.execute("""
            INSERT INTO tests (test_code, title, subject, pdf_file_id, pdf_file_name,
                               answers_json, total_questions, time_limit_min, is_active,
                               key_access_code, results_published, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1, %s, 0, %s)
            ON CONFLICT (test_code) DO UPDATE SET
                title = EXCLUDED.title,
                subject = EXCLUDED.subject,
                pdf_file_id = COALESCE(EXCLUDED.pdf_file_id, tests.pdf_file_id),
                pdf_file_name = COALESCE(EXCLUDED.pdf_file_name, tests.pdf_file_name),
                answers_json = EXCLUDED.answers_json,
                time_limit_min = EXCLUDED.time_limit_min,
                key_access_code = EXCLUDED.key_access_code,
                is_active = 1,
                results_published = 0
            """, (test_code, title, subject, pdf_file_id, pdf_file_name,
                  json.dumps(answers, ensure_ascii=False), 45, time_limit_min,
                  key_access_code, now))
        else:
            cur.execute("""
            INSERT INTO tests (test_code, title, subject, pdf_file_id, pdf_file_name,
                               answers_json, total_questions, time_limit_min, is_active,
                               key_access_code, results_published, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0, ?)
            ON CONFLICT(test_code) DO UPDATE SET
                title=excluded.title,
                subject=excluded.subject,
                pdf_file_id=COALESCE(excluded.pdf_file_id, tests.pdf_file_id),
                pdf_file_name=COALESCE(excluded.pdf_file_name, tests.pdf_file_name),
                answers_json=excluded.answers_json,
                time_limit_min=excluded.time_limit_min,
                key_access_code=excluded.key_access_code,
                is_active=1,
                results_published=0
            """, (test_code, title, subject, pdf_file_id, pdf_file_name,
                  json.dumps(answers, ensure_ascii=False), 45, time_limit_min,
                  key_access_code, now))
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error creating/updating test: {e}")
        conn.close()
        return False


def update_test_pdf(test_id: int, pdf_file_id: str, pdf_file_name: str) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            f"UPDATE tests SET pdf_file_id = {_ph()}, pdf_file_name = {_ph()} WHERE id = {_ph()}",
            (pdf_file_id, pdf_file_name, test_id)
        )
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error updating test pdf: {e}")
        conn.close()
        return False


def get_active_tests() -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tests WHERE is_active = 1 ORDER BY id DESC")
    rows = cur.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows if r]


def get_test_by_code(test_code: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM tests WHERE test_code = {_ph()}", (test_code,))
    row = cur.fetchone()
    conn.close()
    return _row_to_dict(row)


def get_test_by_id(test_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM tests WHERE id = {_ph()}", (test_id,))
    row = cur.fetchone()
    conn.close()
    return _row_to_dict(row)


get_test = get_test_by_id


def get_all_tests() -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tests ORDER BY id DESC")
    rows = cur.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows if r]


def toggle_test_status(test_id: int) -> Optional[int]:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(f"SELECT is_active FROM tests WHERE id = {_ph()}", (test_id,))
        row = cur.fetchone()
        if not row:
            conn.close()
            return None
        d = _row_to_dict(row)
        new_status = 0 if d["is_active"] == 1 else 1
        cur.execute(f"UPDATE tests SET is_active = {_ph()} WHERE id = {_ph()}", (new_status, test_id))
        _commit_and_close(conn)
        return new_status
    except Exception as e:
        print(f"Error toggling test: {e}")
        conn.close()
        return None


def set_test_active_status(test_id: int, status: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            f"UPDATE tests SET is_active = {_ph()} WHERE id = {_ph()}",
            (1 if status else 0, test_id)
        )
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error setting test active status: {e}")
        conn.close()
        return False


def update_test_time_limit(test_id: int, time_limit_min: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            f"UPDATE tests SET time_limit_min = {_ph()} WHERE id = {_ph()}",
            (time_limit_min, test_id)
        )
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error updating test time limit: {e}")
        conn.close()
        return False


def set_test_results_published(test_id: int, published: bool = True) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            f"UPDATE tests SET results_published = {_ph()} WHERE id = {_ph()}",
            (1 if published else 0, test_id)
        )
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error publishing results: {e}")
        conn.close()
        return False


def is_test_results_published(test_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(f"SELECT results_published FROM tests WHERE id = {_ph()}", (test_id,))
        row = cur.fetchone()
        conn.close()
        if row:
            d = _row_to_dict(row)
            return bool(d.get("results_published", 0))
        return False
    except Exception:
        conn.close()
        return False


def get_test_submissions_with_users(test_id: int) -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"""
    SELECT s.*, t.title as test_title, t.test_code, t.results_published
    FROM submissions s
    JOIN tests t ON s.test_id = t.id
    WHERE s.test_id = {_ph()}
    ORDER BY s.score DESC, s.submitted_at ASC
    """, (test_id,))
    rows = cur.fetchall()
    conn.close()
    out = []
    for r in rows:
        d = _row_to_dict(r)
        if d:
            d["grade"] = calculate_grade(d.get("score", 0.0))
            out.append(d)
    return out


def delete_test(test_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(f"DELETE FROM submissions WHERE test_id = {_ph()}", (test_id,))
        cur.execute(f"DELETE FROM tests WHERE id = {_ph()}", (test_id,))
        _commit_and_close(conn)
        return True
    except Exception:
        conn.close()
        return False


# ──────────────────────────────────────────────────────────
# ADMINS
# ──────────────────────────────────────────────────────────

def is_admin(tg_id: int, super_admin_id: int = 8039427064) -> bool:
    if tg_id == super_admin_id:
        return True
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"SELECT tg_id FROM admins WHERE tg_id = {_ph()}", (tg_id,))
    row = cur.fetchone()
    conn.close()
    return bool(row)


def add_admin(tg_id: int, fullname: str = "Admin", username: Optional[str] = None, added_by: int = 0) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    now = int(time.time())
    try:
        if USE_POSTGRES:
            cur.execute("""
            INSERT INTO admins (tg_id, fullname, username, added_by, created_at)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (tg_id) DO UPDATE SET
                fullname = EXCLUDED.fullname,
                username = EXCLUDED.username
            """, (tg_id, fullname, username, added_by, now))
        else:
            cur.execute("""
            INSERT INTO admins (tg_id, fullname, username, added_by, created_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(tg_id) DO UPDATE SET
                fullname=excluded.fullname,
                username=excluded.username
            """, (tg_id, fullname, username, added_by, now))
        _commit_and_close(conn)
        return True
    except Exception as e:
        print(f"Error adding admin: {e}")
        conn.close()
        return False


def remove_admin(tg_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(f"DELETE FROM admins WHERE tg_id = {_ph()}", (tg_id,))
        _commit_and_close(conn)
        return True
    except Exception:
        conn.close()
        return False


def get_all_admins() -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM admins ORDER BY created_at ASC")
    rows = cur.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows if r]


def get_all_users() -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    SELECT u.*, COUNT(s.id) as tests_count, MAX(s.submitted_at) as last_test_at
    FROM users u
    LEFT JOIN submissions s ON u.tg_id = s.user_tg_id
    GROUP BY u.id, u.tg_id, u.fullname, u.phone, u.username, u.status, u.pin_code, u.registered_at
    ORDER BY u.registered_at DESC
    """)
    rows = cur.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows if r]


# ──────────────────────────────────────────────────────────
# SUBMISSIONS / RESULTS
# ──────────────────────────────────────────────────────────

def parse_answers_json(raw: Any) -> Dict[str, Any]:
    if not raw:
        return {}
    if isinstance(raw, dict):
        return raw
    try:
        data = json.loads(raw)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def normalize_answer(ans: Any) -> str:
    if ans is None:
        return ""
    res = str(ans).strip().lower()
    res = res.replace(" ", "")
    res = res.replace(",", ".")
    res = res.replace("·", "*").replace("×", "*")
    res = res.replace("²", "^2").replace("³", "^3")
    res = res.replace("sqrt", "√")
    return res


def parse_numeric_or_fraction(val: str) -> Optional[float]:
    try:
        if "/" in val:
            parts = val.split("/")
            if len(parts) == 2:
                num = float(parts[0])
                den = float(parts[1])
                if den != 0:
                    return num / den
        return float(val)
    except Exception:
        return None


def is_answer_matching(user_ans: Any, correct_ans: Any) -> bool:
    u = normalize_answer(user_ans)
    c = normalize_answer(correct_ans)
    if not u or not c:
        return False
    if u == c:
        return True
    num_u = parse_numeric_or_fraction(u)
    num_c = parse_numeric_or_fraction(c)
    if num_u is not None and num_c is not None:
        if abs(num_u - num_c) < 1e-5:
            return True
    return False


def get_user_submission_for_test(test_id: int, user_tg_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        f"SELECT * FROM submissions WHERE test_id = {_ph()} AND user_tg_id = {_ph()}",
        (test_id, user_tg_id)
    )
    row = cur.fetchone()
    conn.close()
    return _row_to_dict(row)


def get_key_and_score(q_data: Any, default_score: float) -> tuple:
    if isinstance(q_data, dict):
        ans = str(q_data.get("ans", q_data.get("answer", "")))
        try:
            score = float(q_data.get("score", q_data.get("ball", default_score)))
        except (ValueError, TypeError):
            score = default_score
        return ans, score
    else:
        return str(q_data or ""), default_score


def calculate_grade(score: float) -> str:
    if score >= 70.0:
        return "A+"
    elif score >= 65.0:
        return "A"
    elif score >= 60.0:
        return "B+"
    elif score >= 55.0:
        return "B"
    elif score >= 50.0:
        return "C+"
    elif score >= 46.0:
        return "C"
    else:
        return "— (Yetarli emas)"


def check_and_save_submission(test_id: int, user_tg_id: int, user_answers: Dict[str, str]) -> Dict[str, Any]:
    test = get_test_by_id(test_id)
    if not test:
        raise ValueError("Test topilmadi!")

    if user_tg_id:
        existing = get_user_submission_for_test(test_id, user_tg_id)
        if existing:
            if is_admin(user_tg_id, ADMIN_ID):
                conn_del = get_connection()
                conn_del.cursor().execute(
                    f"DELETE FROM submissions WHERE id = {_ph()}", (existing["id"],)
                )
                _commit_and_close(conn_del)
            else:
                raise ValueError("Siz ushbu testni allaqachon topshirgansiz! Qayta topshirish mumkin emas.")

    user = get_user(user_tg_id) if user_tg_id else None
    fullname = user["fullname"] if user else "Foydalanuvchi"
    phone = user["phone"] if user else "-"

    correct_answers_raw = json.loads(test["answers_json"])

    total_questions = 55
    correct_count = 0
    incorrect_count = 0
    unanswered_count = 0
    details = {}
    earned_score = 0.0
    total_possible_score = 0.0

    # 1-32 savollar (4 variant, default 2.0 ball)
    for q in range(1, 33):
        key = str(q)
        q_raw = correct_answers_raw.get(key, "A")
        correct_ans, q_score = get_key_and_score(q_raw, default_score=2.0)
        total_possible_score += q_score
        user_val = user_answers.get(key, "")
        is_corr = False
        if not user_val or not str(user_val).strip():
            status = "unanswered"
            unanswered_count += 1
        elif is_answer_matching(user_val, correct_ans):
            is_corr = True
            status = "correct"
            correct_count += 1
            earned_score += q_score
        else:
            status = "incorrect"
            incorrect_count += 1
        details[key] = {
            "num": f"{q}-savol", "type": "choice_4",
            "user": user_val, "correct": correct_ans,
            "status": status,
            "score": q_score if is_corr else 0.0,
            "max_score": q_score
        }

    # 33, 34, 35 savollar (6 variant, default 2.0 ball)
    for q in [33, 34, 35]:
        key = str(q)
        q_raw = correct_answers_raw.get(key, "A")
        correct_ans, q_score = get_key_and_score(q_raw, default_score=2.0)
        total_possible_score += q_score
        user_val = user_answers.get(key, "")
        is_corr = False
        if not user_val or not str(user_val).strip():
            status = "unanswered"
            unanswered_count += 1
        elif is_answer_matching(user_val, correct_ans):
            is_corr = True
            status = "correct"
            correct_count += 1
            earned_score += q_score
        else:
            status = "incorrect"
            incorrect_count += 1
        details[key] = {
            "num": f"{q}-savol", "type": "choice_6",
            "user": user_val, "correct": correct_ans,
            "status": status,
            "score": q_score if is_corr else 0.0,
            "max_score": q_score
        }

    # 36a–45b ochiq savollar (default 1.5 ball)
    for q in range(36, 46):
        for sub in ["a", "b"]:
            key = f"{q}{sub}"
            q_raw = correct_answers_raw.get(key, "1")
            correct_ans, q_score = get_key_and_score(q_raw, default_score=1.5)
            total_possible_score += q_score
            user_val = user_answers.get(key, "")
            is_corr = False
            if not user_val or not str(user_val).strip():
                status = "unanswered"
                unanswered_count += 1
            elif is_answer_matching(user_val, correct_ans):
                is_corr = True
                status = "correct"
                correct_count += 1
                earned_score += q_score
            else:
                status = "incorrect"
                incorrect_count += 1
            details[key] = {
                "num": f"{key}-savol", "type": "open",
                "user": user_val, "correct": correct_ans,
                "status": status,
                "score": q_score if is_corr else 0.0,
                "max_score": q_score
            }

    earned_score = round(earned_score, 1)
    total_possible_score = 100.0
    percentage = round((earned_score / total_possible_score) * 100.0, 1)
    grade = calculate_grade(earned_score)
    rasch_theta = 0.0

    now = int(time.time())
    conn = get_connection()
    cur = conn.cursor()

    if USE_POSTGRES:
        cur.execute("""
        INSERT INTO submissions (
            test_id, test_code, user_tg_id, fullname, phone,
            answers_json, score, max_score, correct_count, total_count,
            details_json, submitted_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """, (
            test["id"], test["test_code"], user_tg_id, fullname, phone,
            json.dumps(user_answers, ensure_ascii=False), earned_score, total_possible_score,
            correct_count, 55,
            json.dumps(details, ensure_ascii=False), now
        ))
        submission_id = cur.fetchone()
        submission_id = _row_to_dict(submission_id).get("id") if submission_id else None
    else:
        cur.execute("""
        INSERT INTO submissions (
            test_id, test_code, user_tg_id, fullname, phone,
            answers_json, score, max_score, correct_count, total_count,
            details_json, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            test["id"], test["test_code"], user_tg_id, fullname, phone,
            json.dumps(user_answers, ensure_ascii=False), earned_score, total_possible_score,
            correct_count, 55,
            json.dumps(details, ensure_ascii=False), now
        ))
        submission_id = cur.lastrowid

    _commit_and_close(conn)

    return {
        "submission_id": submission_id,
        "test_title": test["title"],
        "test_code": test["test_code"],
        "fullname": fullname,
        "score": earned_score,
        "max_score": total_possible_score,
        "percentage": percentage,
        "grade": grade,
        "rasch_theta": rasch_theta,
        "correct_count": correct_count,
        "incorrect_count": incorrect_count,
        "unanswered_count": unanswered_count,
        "details": details,
        "submitted_at": now
    }


def get_user_submissions(user_tg_id: int) -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"""
    SELECT s.*, t.title as test_title, t.results_published, t.is_active
    FROM submissions s
    JOIN tests t ON s.test_id = t.id
    WHERE s.user_tg_id = {_ph()} ORDER BY s.id DESC
    """, (user_tg_id,))
    rows = cur.fetchall()
    conn.close()
    results = []
    for r in rows:
        d = _row_to_dict(r)
        if not d:
            continue
        is_pub = bool(d.get("results_published", 0))
        d["results_published"] = is_pub
        if is_pub:
            d["grade"] = calculate_grade(d.get("score", 0))
        else:
            d["grade"] = "Kutilmoqda"
            d["score"] = None
            d["correct_count"] = None
            d["total_count"] = None
            d["details_json"] = "{}"
        results.append(d)
    return results


def get_test_results_leaderboard(test_id: int) -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"""
    SELECT fullname, phone, score, correct_count, submitted_at
    FROM submissions WHERE test_id = {_ph()} ORDER BY score DESC, submitted_at ASC
    """, (test_id,))
    rows = cur.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows if r]


def get_tests_with_stats() -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    SELECT t.*, COUNT(s.id) as submissions_count,
           COALESCE(AVG(s.score), 0) as avg_score,
           COALESCE(MAX(s.score), 0) as max_score_achieved
    FROM tests t
    LEFT JOIN submissions s ON t.id = s.test_id
    GROUP BY t.id, t.test_code, t.title, t.subject, t.pdf_file_id, t.pdf_file_name,
             t.answers_json, t.total_questions, t.time_limit_min, t.is_active,
             t.key_access_code, t.results_published, t.created_at
    ORDER BY t.id DESC
    """)
    rows = cur.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows if r]


# ──────────────────────────────────────────────────────────
# RASCH MODEL INTEGRATION
# ──────────────────────────────────────────────────────────

def get_test_submissions_for_rasch(test_id: int) -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"""
    SELECT user_tg_id, fullname, details_json, score, correct_count, submitted_at
    FROM submissions
    WHERE test_id = {_ph()} AND details_json IS NOT NULL AND details_json != ''
    ORDER BY submitted_at ASC
    """, (test_id,))
    rows = cur.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows if r]


def evaluate_test_rasch(test_id: int, auto_update_db: bool = False) -> Optional[Dict[str, Any]]:
    try:
        from rasch_engine import evaluate_single_test
        res = evaluate_single_test(test_id, get_test_submissions_for_rasch)
        if res and auto_update_db and res.get("students"):
            item_score_map = {
                it["item_label"].replace("Q", ""): it.get("item_score", 1.0)
                for it in res.get("items", [])
            }
            conn = get_connection()
            cur = conn.cursor()
            for s in res["students"]:
                student_id = s.get("student_id")
                final_score = s.get("final_score", 0.0)
                cur.execute(f"""
                    SELECT id, details_json FROM submissions
                    WHERE test_id = {_ph()} AND (user_tg_id = {_ph()} OR id = {_ph()})
                """, (test_id, student_id, student_id))
                row = cur.fetchone()
                if row:
                    d = _row_to_dict(row)
                    sub_id = d["id"]
                    det_raw = d["details_json"]
                    try:
                        det = json.loads(det_raw) if det_raw else {}
                        for k, v in det.items():
                            if k in item_score_map:
                                is_c = (v.get("status") == "correct")
                                sc = item_score_map[k]
                                v["score"] = sc if is_c else 0.0
                                v["max_score"] = sc
                        new_det = json.dumps(det, ensure_ascii=False)
                        cur.execute(f"""
                            UPDATE submissions
                            SET score = {_ph()}, details_json = {_ph()}
                            WHERE id = {_ph()}
                        """, (final_score, new_det, sub_id))
                    except Exception:
                        cur.execute(
                            f"UPDATE submissions SET score = {_ph()} WHERE id = {_ph()}",
                            (final_score, sub_id)
                        )
            _commit_and_close(conn)
        return res
    except ImportError:
        print("[rasch] rasch_engine.py topilmadi — Rasch baholash o'tkazib yuborildi.")
        return None
    except Exception as e:
        print(f"[rasch] Xatolik: {e}")
        return None


# ──────────────────────────────────────────────────────────
# PDF GENERATION HELPERS
# ──────────────────────────────────────────────────────────

CYRILLIC_TO_LATIN = {
    'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
    'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e',
    'Ё': 'Yo', 'ё': 'yo', 'Ж': 'J', 'ж': 'j', 'З': 'Z', 'з': 'z',
    'И': 'I', 'и': 'i', 'Й': 'Y', 'й': 'y', 'К': 'K', 'к': 'k',
    'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n',
    'О': 'O', 'о': 'o', 'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r',
    'С': 'S', 'с': 's', 'Т': 'T', 'т': 't', 'У': 'U', 'у': 'u',
    'Ф': 'F', 'ф': 'f', 'Х': 'X', 'х': 'x', 'Ц': 'Ts', 'ц': 'ts',
    'Ч': 'Ch', 'ч': 'ch', 'Ш': 'Sh', 'ш': 'sh', 'Щ': 'Sh', 'щ': 'sh',
    'Ъ': "'", 'ъ': "'", 'Ь': '', 'ь': '', 'Э': 'E', 'э': 'e',
    'Ю': 'Yu', 'ю': 'yu', 'Я': 'Ya', 'я': 'ya',
    'Ў': "O'", 'ў': "o'", 'Қ': 'Q', 'қ': 'q', 'Ғ': "G'", 'ғ': "g'",
    'Ҳ': 'H', 'ҳ': 'h'
}


def transliterate_cyrillic(text: str) -> str:
    if not text:
        return ""
    return "".join(CYRILLIC_TO_LATIN.get(ch, ch) for ch in text)


def _clean_pdf_text(text: Any) -> str:
    if text is None:
        return ""
    s = str(text).strip()
    s = re.sub(r'[\U00010000-\U0010ffff]', '', s)
    s = re.sub(r'[\u200B-\u200D\uFEFF]', '', s)
    s = s.replace("—", "-").replace("–", "-").replace("−", "-")
    for ch in ["ʻ", "ʼ", "'", "'", "′", "`", "´", "ʹ", "ʽ"]:
        s = s.replace(ch, "'")
    for q in [""", """, "„", "«", "»"]:
        s = s.replace(q, '"')
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return s.strip()


def generate_test_results_pdf(test_id: int) -> Optional[str]:
    """Test natijalari bo'yicha rasmiy PDF reyting jadvali generatsiya qiladi."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont

        test = get_test_by_id(test_id)
        if not test:
            return None

        results = get_test_results_leaderboard(test_id)

        pdf_filename = f"test_result_{test_id}_{int(time.time())}.pdf"
        pdf_path = os.path.join(os.path.dirname(__file__), pdf_filename)

        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=A4,
            leftMargin=30, rightMargin=30,
            topMargin=30, bottomMargin=30
        )

        font_name = 'Helvetica'
        font_bold = 'Helvetica-Bold'

        font_dir = os.path.join(os.path.dirname(__file__), 'fonts')
        possible_regular = [
            os.path.join(font_dir, 'Arial.ttf'),
            '/System/Library/Fonts/Supplemental/Arial.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
            '/Library/Fonts/Arial.ttf'
        ]
        possible_bold = [
            os.path.join(font_dir, 'Arial-Bold.ttf'),
            '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
            '/Library/Fonts/Arial Bold.ttf'
        ]

        reg_path = next((p for p in possible_regular if os.path.exists(p)), None)
        bld_path = next((p for p in possible_bold if os.path.exists(p)), None)

        if reg_path:
            try:
                pdfmetrics.registerFont(TTFont('UnicodeSans', reg_path))
                font_name = 'UnicodeSans'
            except Exception as fe:
                print(f"Font regular error: {fe}")

        if bld_path:
            try:
                pdfmetrics.registerFont(TTFont('UnicodeSansBold', bld_path))
                font_bold = 'UnicodeSansBold'
            except Exception as fe:
                print(f"Font bold error: {fe}")
        elif font_name == 'UnicodeSans':
            font_bold = 'UnicodeSans'

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle('TitleStyle', parent=styles['Normal'],
                                     fontName=font_bold, fontSize=15, leading=19,
                                     textColor=colors.HexColor("#1E3A8A"), alignment=1)
        subtitle_style = ParagraphStyle('SubTitleStyle', parent=styles['Normal'],
                                        fontName=font_name, fontSize=10, leading=14,
                                        textColor=colors.HexColor("#475569"), alignment=1)
        header_cell_style = ParagraphStyle('HeaderCellStyle', parent=styles['Normal'],
                                           fontName=font_bold, fontSize=9, leading=12,
                                           textColor=colors.HexColor("#1E3A8A"), alignment=1)
        cell_style = ParagraphStyle('CellStyle', parent=styles['Normal'],
                                    fontName=font_name, fontSize=9, leading=12, alignment=1)
        cell_name_style = ParagraphStyle('CellNameStyle', parent=styles['Normal'],
                                         fontName=font_name, fontSize=9, leading=12, alignment=0)
        cell_bold = ParagraphStyle('CellBold', parent=styles['Normal'],
                                   fontName=font_bold, fontSize=9, leading=12, alignment=1)

        elements = []
        elements.append(Paragraph("BUXORIYLAR MAKTABI - BM RASH TEST", title_style))
        elements.append(Spacer(1, 6))

        test_title_clean = _clean_pdf_text(test['title'])
        test_subject_clean = _clean_pdf_text(test.get('subject', 'Matematika'))
        if font_name == 'Helvetica':
            test_title_clean = transliterate_cyrillic(test_title_clean)
            test_subject_clean = transliterate_cyrillic(test_subject_clean)

        elements.append(Paragraph(f"Test: <b>{test_title_clean}</b> | Fan: {test_subject_clean}", subtitle_style))
        elements.append(Paragraph(f"Jami ishtirokchilar soni: <b>{len(results)} nafar</b> | Sana: {format_uzb_time()}", subtitle_style))
        elements.append(Spacer(1, 14))

        table_data = [[
            Paragraph("<b>O'rin</b>", header_cell_style),
            Paragraph("<b>Ism va Familiya</b>", header_cell_style),
            Paragraph("<b>To'plangan Ball</b>", header_cell_style),
            Paragraph("<b>Daraja</b>", header_cell_style),
            Paragraph("<b>To'g'ri</b>", header_cell_style),
            Paragraph("<b>Topshirilgan Vaqt</b>", header_cell_style)
        ]]

        for rank, r in enumerate(results, 1):
            dt = format_uzb_time(r["submitted_at"], "%d.%m %H:%M")
            grade = calculate_grade(r["score"])
            fullname_clean = _clean_pdf_text(r["fullname"] or "Foydalanuvchi")
            if font_name == 'Helvetica':
                fullname_clean = transliterate_cyrillic(fullname_clean)
            grade_clean = _clean_pdf_text(grade)

            table_data.append([
                Paragraph(f"<b>#{rank}</b>", cell_bold),
                Paragraph(f"&nbsp;{fullname_clean}", cell_name_style),
                Paragraph(f"<b>{r['score']} ball</b>", cell_bold),
                Paragraph(f"<b>{grade_clean}</b>", cell_style),
                Paragraph(f"{r['correct_count']} ta", cell_style),
                Paragraph(dt, cell_style)
            ])

        col_widths = [45, 215, 80, 70, 55, 70]
        t = Table(table_data, colWidths=col_widths, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EEF2FF")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))

        elements.append(t)
        doc.build(elements)
        return pdf_path
    except Exception as e:
        import traceback
        print(f"PDF Generation Error: {e}")
        traceback.print_exc()
        return None


# Baza inicializatsiyasi
init_db()
