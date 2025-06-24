from fastapi import FastAPI, HTTPException, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from database import Database
from scipy.stats import mannwhitneyu

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://keen-truth-production-bf2f.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


db = Database()


class Sample(BaseModel):
    sample_id: str
    project: str
    subject: str
    condition: Optional[str]
    age: Optional[int]
    sex: Optional[str]
    treatment: Optional[str]
    response: Optional[str]
    sample_type: str
    time_from_treatment_start: int
    cell_counts: Dict[str, int]


class Frequency(BaseModel):
    sample: str
    total_count: int
    population: str
    count: int
    percentage: float


class ResponseAnalysis(BaseModel):
    population: str
    responders: List[float]
    non_responders: List[float]
    p_value: float


class BaselineSummary(BaseModel):
    samples_by_project: Dict[str, int]
    subjects_by_response: Dict[str, int]
    subjects_by_sex: Dict[str, int]


class FilterParams(BaseModel):
    condition: Optional[str] = None
    treatment: Optional[str] = None
    sample_type: Optional[str] = None
    time_from_treatment_start: Optional[int] = None


class FilterSummary(BaseModel):
    samples_by_project: Dict[str, int]
    subjects_by_response: Dict[str, int]
    subjects_by_sex: Dict[str, int]


@app.post("/api/upload")
async def upload_csv(file: UploadFile):
    contents = await file.read()
    with open("temp.csv", "wb") as f:
        f.write(contents)
    try:
        db.load_csv("temp.csv")
        return {"message": "Data loaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/samples", response_model=List[Sample])
def get_samples():
    with db.get_conn() as conn:
        query = """
            SELECT 
                s.*,
                GROUP_CONCAT(c.cell_type || ':' || c.count) AS cell_data
            FROM samples s
            LEFT JOIN cell_counts c ON s.sample_id = c.sample_id
            GROUP BY s.sample_id
        """
        cursor = conn.execute(query)
        out = []
        for row in cursor:
            sd = dict(row)
            cc = {}
            if sd["cell_data"]:
                for item in sd["cell_data"].split(","):
                    ct, cnt = item.split(":")
                    cc[ct] = int(cnt)
            sd["cell_counts"] = cc
            del sd["cell_data"]
            out.append(sd)
        return out


@app.post("/api/samples", response_model=dict)
def add_sample(sample: Sample):
    with db.get_conn() as conn:
        conn.execute(
            """
            INSERT INTO samples
              (sample_id, project, subject, condition, age, sex,
               treatment, response, sample_type, time_from_treatment_start)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                sample.sample_id,
                sample.project,
                sample.subject,
                sample.condition,
                sample.age,
                sample.sex,
                sample.treatment,
                sample.response,
                sample.sample_type,
                sample.time_from_treatment_start,
            ),
        )
        for ct, cnt in sample.cell_counts.items():
            conn.execute(
                """
                INSERT INTO cell_counts (sample_id, cell_type, count)
                VALUES (?, ?, ?)
                """,
                (sample.sample_id, ct, cnt),
            )
        conn.commit()
    return {"message": "Sample added successfully"}


@app.delete("/api/samples/{sample_id}", response_model=dict)
def delete_sample(sample_id: str):
    with db.get_conn() as conn:
        conn.execute("DELETE FROM cell_counts WHERE sample_id = ?", (sample_id,))
        cursor = conn.execute("DELETE FROM samples WHERE sample_id = ?", (sample_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Sample not found")
        conn.commit()
    return {"message": "Sample deleted successfully"}


@app.get("/api/frequencies", response_model=List[Frequency])
def get_frequencies():
    return db.get_frequencies()


@app.post("/api/response-analysis", response_model=List[ResponseAnalysis])
def response_analysis(params: FilterParams = Body(...)):
    clauses, args = [], []
    if params.condition is not None:
        clauses.append("s.condition = ?")
        args.append(params.condition)
    if params.treatment is not None:
        clauses.append("s.treatment = ?")
        args.append(params.treatment)
    if params.sample_type is not None:
        clauses.append("s.sample_type = ?")
        args.append(params.sample_type)
    where = " AND ".join(clauses) or "1=1"

    query = f"""
    WITH totals AS (
      SELECT sample_id, SUM(count) AS total_count
      FROM cell_counts GROUP BY sample_id
    )
    SELECT
      s.response      AS response,
      c.cell_type     AS population,
      ROUND(100.0 * c.count / t.total_count, 2) AS percentage
    FROM cell_counts c
    JOIN totals t USING(sample_id)
    JOIN samples s USING(sample_id)
    WHERE {where}
      AND (s.response = 'yes' OR s.response = 'no')
    """
    with db.get_conn() as conn:
        rows = conn.execute(query, args).fetchall()

    grouped: Dict[str, Dict[str, List[float]]] = {}
    for r in rows:
        pop = r["population"]
        resp = (r["response"] or "no").lower()
        pct = float(r["percentage"])
        grouped.setdefault(pop, {}).setdefault(resp, []).append(pct)

    results: List[ResponseAnalysis] = []
    for pop, grp in grouped.items():
        yes_vals = grp.get("yes", [])
        no_vals = grp.get("no", [])
        if len(yes_vals) >= 2 and len(no_vals) >= 2:
            _, p = mannwhitneyu(yes_vals, no_vals, alternative="two-sided")
        else:
            p = 1.0
        results.append(
            ResponseAnalysis(
                population=pop,
                responders=yes_vals,
                non_responders=no_vals,
                p_value=round(p, 4),
            )
        )
    return results


@app.get("/api/baseline-summary", response_model=BaselineSummary)
def baseline_summary():
    filter_sql = """
      condition='melanoma'
      AND treatment='miraclib'
      AND sample_type='PBMC'
      AND time_from_treatment_start=0
    """
    with db.get_conn() as conn:
        cursor = conn.execute(
            f"""
          SELECT project, COUNT(*) AS cnt
            FROM samples WHERE {filter_sql}
            GROUP BY project
        """
        )
        samples_by_project = {r["project"]: r["cnt"] for r in cursor}

        cursor = conn.execute(
            f"""
          SELECT response, COUNT(DISTINCT subject) AS cnt
            FROM samples WHERE {filter_sql}
            GROUP BY response
        """
        )
        subjects_by_response = {(r["response"] or "unknown"): r["cnt"] for r in cursor}

        cursor = conn.execute(
            f"""
          SELECT sex, COUNT(DISTINCT subject) AS cnt
            FROM samples WHERE {filter_sql}
            GROUP BY sex
        """
        )
        subjects_by_sex = {(r["sex"] or "unknown"): r["cnt"] for r in cursor}

    return BaselineSummary(
        samples_by_project=samples_by_project,
        subjects_by_response=subjects_by_response,
        subjects_by_sex=subjects_by_sex,
    )


@app.post("/api/filter-summary", response_model=FilterSummary)
def filter_summary(params: FilterParams = Body(...)):
    clauses, args = [], []
    if params.condition is not None:
        clauses.append("condition = ?")
        args.append(params.condition)
    if params.treatment is not None:
        clauses.append("treatment = ?")
        args.append(params.treatment)
    if params.sample_type is not None:
        clauses.append("sample_type = ?")
        args.append(params.sample_type)
    if params.time_from_treatment_start is not None:
        clauses.append("time_from_treatment_start = ?")
        args.append(params.time_from_treatment_start)
    where = " AND ".join(clauses) or "1=1"

    with db.get_conn() as conn:
        cursor = conn.execute(
            f"SELECT project, COUNT(*) AS cnt FROM samples WHERE {where} GROUP BY project",
            args,
        )
        samples_by_project = {r["project"]: r["cnt"] for r in cursor}

        cursor = conn.execute(
            f"SELECT response, COUNT(DISTINCT subject) AS cnt FROM samples WHERE {where} GROUP BY response",
            args,
        )
        subjects_by_response = {(r["response"] or "unknown"): r["cnt"] for r in cursor}

        cursor = conn.execute(
            f"SELECT sex, COUNT(DISTINCT subject) AS cnt FROM samples WHERE {where} GROUP BY sex",
            args,
        )
        subjects_by_sex = {(r["sex"] or "unknown"): r["cnt"] for r in cursor}

    return FilterSummary(
        samples_by_project=samples_by_project,
        subjects_by_response=subjects_by_response,
        subjects_by_sex=subjects_by_sex,
    )


@app.post("/api/filter-samples", response_model=List[Sample])
def filter_samples(params: FilterParams = Body(...)):
    clauses, args = [], []
    if params.condition is not None:
        clauses.append("s.condition = ?")
        args.append(params.condition)
    if params.treatment is not None:
        clauses.append("s.treatment = ?")
        args.append(params.treatment)
    if params.sample_type is not None:
        clauses.append("s.sample_type = ?")
        args.append(params.sample_type)
    if params.time_from_treatment_start is not None:
        clauses.append("s.time_from_treatment_start = ?")
        args.append(params.time_from_treatment_start)
    where = " AND ".join(clauses) or "1=1"

    query = f"""
      SELECT s.*,
             GROUP_CONCAT(c.cell_type || ':' || c.count) AS cell_data
        FROM samples s
        LEFT JOIN cell_counts c ON s.sample_id = c.sample_id
       WHERE {where}
       GROUP BY s.sample_id
    """
    out: List[Sample] = []
    with db.get_conn() as conn:
        for row in conn.execute(query, args):
            sd = dict(row)
            cc = {}
            if sd["cell_data"]:
                for item in sd["cell_data"].split(","):
                    ct, cnt = item.split(":")
                    cc[ct] = int(cnt)
            sd["cell_counts"] = cc
            del sd["cell_data"]
            out.append(Sample(**sd))
    return out


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
