CREATE DATABASE IF NOT EXISTS pet_care_db;
USE pet_care_db;

CREATE TABLE IF NOT EXISTS owners (
  owner_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(15),
  address VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS pets (
  pet_id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  pet_name VARCHAR(100) NOT NULL,
  species VARCHAR(50),
  breed VARCHAR(50),
  age INT,
  CONSTRAINT fk_pet_owner FOREIGN KEY (owner_id) REFERENCES owners(owner_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  doctor_name VARCHAR(100) NOT NULL,
  appointment_date DATE NOT NULL,
  reason VARCHAR(200),
  status VARCHAR(30) DEFAULT 'Scheduled',
  CONSTRAINT fk_appointment_pet FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Added to support the requirement to maintain medical records for each pet.
CREATE TABLE IF NOT EXISTS medical_records (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  visit_date DATE NOT NULL,
  diagnosis VARCHAR(200),
  treatment VARCHAR(500),
  notes VARCHAR(500),
  CONSTRAINT fk_record_pet FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);