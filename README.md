# Cytometry Analysis App

A full-stack application for analyzing immune cell population data from clinical trials. Built with FastAPI backend and React frontend.

---

## Features

* Load trial data from CSV files into relational database
* Interactive data exploration and filtering
* Statistical analysis of treatment response
* Real-time visualizations and summaries
* Add/remove samples with automatic analysis updates

---

### Installation & Setup

#### 1. Clone the repository

```bash
git clone https://github.com/dillon-matthews/cytometry-app.git
cd cytometry-app
```

#### Backend Setup

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python app.py
```

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

> Frontend runs on [http://localhost:3000](http://localhost:3000)

---

## Usage

### Load Data

Upload `cell-count.csv` via the sidebar upload button (it's already uploaded, similar sets could also be uploaded). 

### Explore Views

* **Samples**: View and manage all samples
* **Frequencies**: Cell population frequency analysis
* **Analysis**: Statistical comparison of responders vs non-responders
* **Filter**: Subset analysis with custom filters

### Modify Data

* **Add/Delete Samples**: Use the interface to modify data
* **Automatic Updates**: All analyses refresh automatically when data changes

---

## Database Schema

### Design

```sql
samples (
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

cell_counts (
    sample_id TEXT,
    cell_type TEXT,
    count INTEGER,
    PRIMARY KEY (sample_id, cell_type),
    FOREIGN KEY (sample_id) REFERENCES samples(sample_id)
);
```

### Rationale

* **Normalized design**: Separates sample metadata from measurements
* **Flexible cell types**: Supports any number of cell populations without schema changes
* **Data integrity**: Foreign key constraints ensure referential integrity
* **Query efficiency**: Optimized for frequency calculations and filtering

---

## Scaling Considerations

For hundreds of projects and thousands of samples:

* **Indexing**: Add indexes on project, condition, treatment, response
* **Partitioning**: Partition tables by project or time ranges
* **Read replicas**: Separate analytics workloads from operational data
* **Audit trails**: Track data changes and user actions
* **Access control**: Implement project-based user permissions

---

## Code Architecture

### Backend (`backend/`)

* `app.py` - FastAPI application with REST endpoints
* `database.py` - SQLite database management and data loading
* Clean separation of API layer and data access layer

### Frontend (`frontend/src/`)

* `App.tsx` - Main application with centralized state management
* `api.ts` - TypeScript API client with type definitions
* `components/` - Modular UI components for each analysis view

---

## Design Principles

* **FastAPI + SQLite**: Rapid development with built-in validation
* **React + TypeScript**: Type safety and component reusability
* **Modular components**: Independent, reusable analysis views
* **RESTful API**: Standard HTTP operations for easy integration
* **Responsive design**: Works on desktop and most mobile devices
* **Real-time updates**: Automatic refresh when data changes
