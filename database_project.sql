-- =========================================================================
-- DATABASE SETUP: Create and use the skill_swap database
-- =========================================================================
DROP DATABASE IF EXISTS skill_swap;
CREATE DATABASE skill_swap;
USE skill_swap;

-- =========================================================================
-- TABLES CREATION (DDL & Constraints - Labs 01-03)
-- =========================================================================

-- Table: Students
-- Stores registration and profile information for each student
CREATE TABLE Students (
    studentID INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL, 
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    phonenumber VARCHAR(11), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Skills
-- Stores a master list of all skills that can be offered or desired
CREATE TABLE Skills (
    skillID INT PRIMARY KEY AUTO_INCREMENT,
    skill_name VARCHAR(100) NOT NULL,
    CONSTRAINT unique_skill_name UNIQUE (skill_name), 
    INDEX idx_skill_name (skill_name) 
);

-- Table: Offered_skills
-- Maps students to the skills they are offering, along with their proficiency level
CREATE TABLE Offered_skills (
    Offered_skillID INT PRIMARY KEY AUTO_INCREMENT,
    studentID INT NOT NULL,
    skillID INT NOT NULL,
    proficiency VARCHAR(100) NOT NULL,
    FOREIGN KEY (studentID) REFERENCES Students(studentID),
    FOREIGN KEY (skillID) REFERENCES Skills(skillID),
    CONSTRAINT unique_offered_skill UNIQUE (studentID, skillID), 
    INDEX idx_offered_student (studentID), 
    INDEX idx_offered_skill (skillID) 
);

-- Table: Desired_skills
-- Maps students to the skills they want to learn/acquire
CREATE TABLE Desired_skills (
    desired_skillID INT PRIMARY KEY AUTO_INCREMENT,
    studentID INT NOT NULL,
    skillID INT NOT NULL,
    FOREIGN KEY (studentID) REFERENCES Students(studentID),
    FOREIGN KEY (skillID) REFERENCES Skills(skillID),
    CONSTRAINT unique_desired_skill UNIQUE (studentID, skillID) 
);

-- Table: Requests
-- Stores swap requests sent from one student to another
CREATE TABLE Requests (
    request_ID INT PRIMARY KEY AUTO_INCREMENT,
    senderID INT NOT NULL,
    receiverID INT NOT NULL,
    requested_skill INT NOT NULL,
    offered_skill INT NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderID) REFERENCES Students(studentID),
    FOREIGN KEY (receiverID) REFERENCES Students(studentID),
    FOREIGN KEY (requested_skill) REFERENCES Skills(skillID),
    FOREIGN KEY (offered_skill) REFERENCES Skills(skillID),
    INDEX idx_request_status (status),
    INDEX idx_sender (senderID), 
    INDEX idx_receiver (receiverID) 
);

-- Table: Exchanges
-- Records successfully completed exchanges when requests are accepted
CREATE TABLE Exchanges (
    exchangeID INT PRIMARY KEY AUTO_INCREMENT,
    requestID INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requestID) REFERENCES Requests(request_ID),
    INDEX idx_exchange (exchangeID) 
);

-- Table: Notifications
-- Stores notifications directed at students
CREATE TABLE Notifications (
    notificationID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT NOT NULL,
    message VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Students(studentID)
);

-- =========================================================================
-- INITIAL DATA INSERTIONS (DML - Lab 04)
-- =========================================================================

-- Insert test students
INSERT INTO Students (name, email, password, department)
VALUES
('Ali', 'ali@gmail.com', 'pass123', 'CS'),
('Sara', 'sara@gmail.com', 'pass123', 'SE'),
('Ahmed', 'ahmed@gmail.com', 'pass123', 'AI'),
('Ayesha', 'ayesha@gmail.com', 'pass123', 'IT');

-- Insert master skills list
INSERT INTO Skills (skill_name)
VALUES
('Python'),
('Java'),
('Web Development'),
('Graphic Design'),
('Database'),
('Excel');

-- Insert offered skills mapping
INSERT INTO Offered_skills (studentID, skillID, proficiency)
VALUES
(1, 1, 'Expert'),   -- Ali - Python
(1, 2, 'Intermediate'), -- Ali - Java
(2, 3, 'Expert'),   -- Sara - Web Dev
(3, 5, 'Expert'),   -- Ahmed - Database
(4, 4, 'Intermediate'), -- Ayesha - Graphic Design
(4, 6, 'Expert');   -- Ayesha - Excel

-- Insert desired skills mapping
INSERT INTO Desired_skills (studentID, skillID)
VALUES
(1, 3), -- Ali wants Web Dev
(2, 1), -- Sara wants Python
(3, 4), -- Ahmed wants Graphic Design
(4, 2), -- Ayesha wants Java
(4, 5); -- Ayesha wants Database

-- Insert swap requests
INSERT INTO Requests (senderID, receiverID, offered_skill, requested_skill, status)
VALUES
(1, 2, 1, 3, 'accepted'), -- Ali ↔ Sara
(2, 1, 3, 1, 'accepted'), -- Sara ↔ Ali
(3, 4, 5, 4, 'accepted'), -- Ahmed ↔ Ayesha
(4, 3, 4, 5, 'accepted'), -- Ayesha ↔ Ahmed
(1, 3, 2, 5, 'pending');  -- Ali → Ahmed

-- Insert exchange history
INSERT INTO Exchanges (requestID)
VALUES
(1),
(2),
(3),
(4);

-- =========================================================================
-- VIEWS (Views - Lab 08)
-- =========================================================================

-- View: Student_profile
-- Combines student info and their offered skills
CREATE VIEW Student_profile AS
SELECT
    s.studentID,
    s.name,
    s.email,
    s.department,
    s.phonenumber,
    sk.skill_name AS offered_skill,
    os.proficiency
FROM Students s
LEFT JOIN Offered_skills os ON s.studentID = os.studentID
LEFT JOIN Skills sk ON os.skillID = sk.skillID;

-- View: RequestDashboard
-- Displays overview details for requests, mapping IDs to display names
CREATE VIEW RequestDashboard AS
SELECT 
    r.request_ID,
    r.senderID,
    r.receiverID,
    s1.name AS sender_name,
    s2.name AS receiver_name,
    sk.skill_name AS requested_skill,
    r.status,
    r.created_at
FROM Requests r
JOIN Students s1 ON r.senderID = s1.studentID
JOIN Students s2 ON r.receiverID = s2.studentID
JOIN Skills sk ON r.requested_skill = sk.skillID;

-- View: ExchangeHistory
-- Details all completed exchanges
CREATE VIEW ExchangeHistory AS
SELECT 
    e.exchangeID,
    r.request_ID,
    r.senderID,
    r.receiverID,
    s1.name AS sender,
    s2.name AS receiver,
    sk.skill_name,
    e.completed_at
FROM Exchanges e
JOIN Requests r ON e.requestID = r.request_ID
JOIN Students s1 ON r.senderID = s1.studentID
JOIN Students s2 ON r.receiverID = s2.studentID
JOIN Skills sk ON r.requested_skill = sk.skillID;

-- View: SkillsPopularity (GROUP BY, HAVING, COUNT - Lab 06)
-- Aggregates offered skills to show skill popularity
CREATE VIEW SkillsPopularity AS
SELECT 
    sk.skillID,
    sk.skill_name, 
    COUNT(os.studentID) AS offering_count
FROM Skills sk
LEFT JOIN Offered_skills os ON sk.skillID = os.skillID
GROUP BY sk.skillID, sk.skill_name
HAVING COUNT(os.studentID) >= 0
ORDER BY offering_count DESC;

-- =========================================================================
-- TRIGGERS (Lab 10 Triggers)
-- =========================================================================

DELIMITER $$

-- Trigger: trig_exchange_update
-- Automatically records an exchange when a request status transitions to 'accepted'
CREATE TRIGGER trig_exchange_update
AFTER UPDATE ON Requests
FOR EACH ROW
BEGIN
    IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
        INSERT INTO Exchanges (requestID, completed_at)
        VALUES (NEW.request_ID, NOW());
    END IF;
END $$

-- Trigger: trig__request_notification
-- Automatically creates a notification for the receiver when a request is inserted
CREATE TRIGGER trig__request_notification
AFTER INSERT ON Requests
FOR EACH ROW
BEGIN
    INSERT INTO Notifications (userID, message)
    VALUES (NEW.receiverID, CONCAT('New request received (ID: ', NEW.request_ID, ')'));
END $$

-- Trigger: trg_accepted_notification
-- Automatically notifies both sender and receiver when a request status is accepted
CREATE TRIGGER trg_accepted_notification
AFTER UPDATE ON Requests
FOR EACH ROW
BEGIN
    IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
        INSERT INTO Notifications (userID, message)
        VALUES 
            (NEW.senderID, 'Your swap request has been accepted!'),
            (NEW.receiverID, 'You have accepted a swap request!');
    END IF;
END $$

DELIMITER ;

-- =========================================================================
-- PROCEDURES (Stored Procedures - Lab 10)
-- =========================================================================

DELIMITER $$

-- Procedure: RegisterStudent
-- Handles inserting a new student and returns the created profile row
CREATE PROCEDURE RegisterStudent (
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_department VARCHAR(100),
    IN p_phonenumber VARCHAR(11)
)
BEGIN
    INSERT INTO Students (name, email, password, department, phonenumber)
    VALUES (p_name, p_email, p_password, p_department, p_phonenumber);
    
    SELECT studentID, name, email, department, phonenumber, created_at
    FROM Students
    WHERE studentID = LAST_INSERT_ID();
END $$

-- Procedure: LoginStudent
-- Validates credentials and returns student details if matched
CREATE PROCEDURE LoginStudent (
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    SELECT studentID, name, email, department, phonenumber, created_at
    FROM Students
    WHERE email = p_email AND password = p_password;
END $$

-- Procedure: GetProfile
-- Returns a student profile and their desired skills in multiple result sets
-- Demonstrates basic Subquery to count completed exchanges for the student
CREATE PROCEDURE GetProfile (
    IN p_studentID INT
)
BEGIN
    -- Result Set 1: Profile View Details
    SELECT sp.*,
        (SELECT COUNT(*) 
         FROM Exchanges e 
         JOIN Requests r ON e.requestID = r.request_ID 
         WHERE r.senderID = p_studentID OR r.receiverID = p_studentID) AS completed_exchanges_count
    FROM Student_profile sp
    WHERE sp.studentID = p_studentID;
    
    -- Result Set 2: Desired Skills
    SELECT sk.skillID, sk.skill_name
    FROM Desired_skills ds
    JOIN Skills sk ON ds.skillID = sk.skillID
    WHERE ds.studentID = p_studentID;
END $$

-- Procedure: SearchSkills
-- Searches students offering a skill matching query (uses LIKE pattern matching)
CREATE PROCEDURE SearchSkills (
    IN p_query VARCHAR(100)
)
BEGIN
    SELECT
        s.studentID,
        s.name,
        s.email,
        s.department,
        sk.skillID,
        sk.skill_name,
        os.proficiency
    FROM Students s
    JOIN Offered_skills os ON s.studentID = os.studentID
    JOIN Skills sk         ON os.skillID  = sk.skillID
    WHERE sk.skill_name LIKE CONCAT('%', p_query, '%');
END $$

-- Procedure: GetAllSkills
-- Retrieves all skills sorted alphabetically
CREATE PROCEDURE GetAllSkills ()
BEGIN
    SELECT * FROM Skills ORDER BY skill_name;
END $$

-- Procedure: SendRequest
-- Creates a swap request
CREATE PROCEDURE SendRequest (
    IN p_senderID INT,
    IN p_receiverID INT,
    IN p_skillID INT,
    IN p_offeredskillID INT
)
BEGIN
    INSERT INTO Requests (senderID, receiverID, requested_skill, offered_skill, status)
    VALUES (p_senderID, p_receiverID, p_skillID, p_offeredskillID, 'pending');
END $$

-- Procedure: AcceptRequest
-- Updates status of a request to 'accepted'
CREATE PROCEDURE AcceptRequest (
    IN p_requestID INT
)
BEGIN
    UPDATE Requests
    SET status = 'accepted'
    WHERE request_ID = p_requestID;
END $$

-- Procedure: GetDashboard
-- Queries RequestDashboard view for student's sent/received requests
CREATE PROCEDURE GetDashboard (
    IN p_studentID INT
)
BEGIN
    SELECT * 
    FROM RequestDashboard
    WHERE senderID = p_studentID OR receiverID = p_studentID
    ORDER BY created_at DESC;
END $$

-- Procedure: GetNotifications
-- Queries user's notifications sorted by created_at DESC
CREATE PROCEDURE GetNotifications (
    IN p_userID INT
)
BEGIN
    SELECT notificationID, message, created_at
    FROM Notifications
    WHERE userID = p_userID
    ORDER BY created_at DESC;
END $$

-- Procedure: GetExchanges
-- Queries ExchangeHistory view for student's completed exchanges
CREATE PROCEDURE GetExchanges (
    IN p_studentID INT
)
BEGIN
    SELECT * 
    FROM ExchangeHistory
    WHERE senderID = p_studentID OR receiverID = p_studentID
    ORDER BY completed_at DESC;
END $$

-- Procedure: GetSkillsPopularity
-- Queries the popularity view
CREATE PROCEDURE GetSkillsPopularity ()
BEGIN
    SELECT * FROM SkillsPopularity;
END $$

DELIMITER ;




