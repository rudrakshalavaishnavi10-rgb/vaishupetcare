# PawCare – Pet Care / Veterinary Management System

A responsive CRUD website built with **HTML, CSS, JavaScript, Node.js, Express and MySQL**.

## Features
- Owners: create, view, edit and delete owner details.
- Pets: register pets and link each pet to an owner.
- Appointments: create and update appointments, including status.
- Medical records: save visit date, diagnosis, treatment and notes for each pet.
- Dashboard counts, search boxes and responsive layout.

## Database structure
The three tables from the supplied specification are included:
- `owners(owner_id, name, email, phone, address)`
- `pets(pet_id, owner_id, pet_name, species, breed, age)`
- `appointments(appointment_id, pet_id, doctor_name, appointment_date, reason, status)`

A fourth `medical_records` table is included because the project description says medical records must be maintained for each pet. Foreign keys connect pets to owners, and appointments/medical records to pets. Deleting an owner cascades to their pets; deleting a pet cascades to its appointments and medical records.

## Requirements
- Node.js (LTS recommended)
- MySQL Server
- VS Code (recommended)

## Setup in VS Code
1. Extract the ZIP file.
2. Open the extracted `Pet_Care_Veterinary_Management_System` folder in VS Code.
3. Start MySQL Server.
4. Open MySQL Workbench or the MySQL command line and run the complete `database.sql` file. This creates `pet_care_db` and its tables.
5. In the VS Code terminal, install packages:
   ```bash
   npm install
   ```
6. Copy `.env.example` to a new file named `.env`.
7. Open `.env` and enter your MySQL username and password. For example:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=pet_care_db
   PORT=3000
   ```
   If your MySQL root account has no password, leave `DB_PASSWORD=` empty.
8. Start the website:
   ```bash
   npm start
   ```
9. Open **http://localhost:3000** in your browser.

## Important
- Do not upload your real `.env` file or database password to GitHub.
- Add an owner before adding a pet. Use the owner's ID when registering the pet.
- Add a pet before creating its appointment or medical record. Use the pet's ID.
- Deleting an owner or pet also deletes dependent records because the SQL schema uses `ON DELETE CASCADE`.
- This is a learning/demo project. Add authentication, authorization, input validation and backups before using it with real patient data.
