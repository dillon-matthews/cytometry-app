import sqlite3
import pandas as pd
from contextlib import contextmanager

class Database:
    def __init__(self, db_path: str = "cytometry.db"):
        self.db_path = db_path
        self.init_db()

    @contextmanager
    def get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        try:
            yield conn
        finally:
            conn.close()

    def init_db(self):
        with self.get_conn() as conn:
            conn.executescript('''
                CREATE TABLE IF NOT EXISTS samples (
                    sample_id TEXT PRIMARY KEY,
                    project TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    condition TEXT,
                    age INTEGER,
                    sex TEXT,
                    treatment TEXT,
                    response TEXT,
                    sample_type TEXT,
                    time_from_treatment_start INTEGER
                );

                CREATE TABLE IF NOT EXISTS cell_counts (
                    sample_id TEXT,
                    cell_type TEXT,
                    count INTEGER,
                    PRIMARY KEY (sample_id, cell_type),
                    FOREIGN KEY (sample_id) REFERENCES samples(sample_id) ON DELETE CASCADE
                );
            ''')

    def load_csv(self, filepath: str):
        df = pd.read_csv(filepath)
        cell_types = ['b_cell', 'cd8_t_cell', 'cd4_t_cell', 'nk_cell', 'monocyte']

        with self.get_conn() as conn:
            conn.execute("DELETE FROM cell_counts")
            conn.execute("DELETE FROM samples")

            for _, row in df.iterrows():
                conn.execute('''
                    INSERT INTO samples
                      (sample_id, project, subject, condition, age, sex,
                       treatment, response, sample_type, time_from_treatment_start)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    row['sample'],
                    row['project'],
                    row['subject'],
                    row['condition'],
                    row['age'],
                    row['sex'],
                    row['treatment'],
                    row.get('response'),
                    row['sample_type'],
                    row['time_from_treatment_start']
                ))
                for ct in cell_types:
                    conn.execute('''
                        INSERT INTO cell_counts (sample_id, cell_type, count)
                        VALUES (?, ?, ?)
                    ''', (row['sample'], ct, row[ct]))

            conn.commit()

    def get_frequencies(self) -> list:
        """
        Returns one row per sample × population, with:
          - sample        : sample_id
          - total_count   : sum of all counts in that sample
          - population    : cell_type
          - count         : raw count
          - percentage    : 0.0 if total_count=0 else rounded percent
        """
        with self.get_conn() as conn:
            query = """
            WITH totals AS (
              SELECT sample_id,
                     SUM(count) AS total_count
              FROM cell_counts
              GROUP BY sample_id
            )
            SELECT
              c.sample_id     AS sample,
              t.total_count   AS total_count,
              c.cell_type     AS population,
              c.count         AS count,
              CASE
                WHEN t.total_count > 0
                  THEN ROUND(100.0 * c.count / t.total_count, 2)
                ELSE 0.0
              END             AS percentage
            FROM cell_counts c
            JOIN totals t USING(sample_id)
            ORDER BY c.sample_id, c.cell_type;
            """
            cursor = conn.execute(query)
            return [dict(row) for row in cursor]
