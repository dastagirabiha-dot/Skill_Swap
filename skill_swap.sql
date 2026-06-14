-- =========================================================================
-- DATABASE SETUP: Create and use the skill_swap database
-- =========================================================================
CREATE DATABASE skill_swap;
USE skill_swap;

-- =========================================================================
-- TABLES CREATION 
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
-- INITIAL DATA INSERTIONS
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
-- TRIGGERS
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

DELIMITER ;

DELIMITER $$

-- Trigger: trig__request_notification
-- Automatically creates a notification for the receiver when a request is inserted
CREATE TRIGGER trig__request_notification
AFTER INSERT ON Requests
FOR EACH ROW
BEGIN
    INSERT INTO Notifications (userID, message)
    VALUES (NEW.receiverID, CONCAT('New request received: (RecieverID:', NEW.request_ID, ')'));
END $$

DELIMITER ;

DELIMITER $$

-- Trigger: trg_accepted_notification
-- Automatically notifies both sender and receiver when a request status is accepted
CREATE TRIGGER trg_accepted_notification
AFTER UPDATE ON Requests
FOR EACH ROW
BEGIN
    IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
        INSERT INTO Notifications (userID, message)
        VALUES 
            (NEW.senderID, 'Your message has been accepted'),
            (NEW.receiverID, 'You have accepted a message');
    END IF;
END $$

DELIMITER ;

-- =========================================================================
-- PROCEDURES
-- =========================================================================

DELIMITER $$

-- Procedure: send_request
-- Allows a student to send a new skill swap request
CREATE PROCEDURE send_request (
    IN p_senderID INT,
    IN p_receiverID INT,
    IN p_skillID INT,
    IN p_offeredskillID INT
)
BEGIN
    INSERT INTO Requests (senderID, receiverID, requested_skill, offered_skill, status)
    VALUES (p_senderID, p_receiverID, p_skillID, p_offeredskillID, 'pending');
END $$

DELIMITER ;

DELIMITER $$

-- Procedure: accept_request
-- Direct update procedure to mark a request status as 'accepted'
CREATE PROCEDURE accept_request (
    IN p_requestID INT
)
BEGIN
    UPDATE Requests
    SET status = 'accepted'
    WHERE request_ID = p_requestID;
END $$

DELIMITER ;

-- =========================================================================
-- VIEWS
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
    s1.name AS sender,
    s2.name AS receiver,
    sk.skill_name,
    e.completed_at
FROM Exchanges e
JOIN Requests r ON e.requestID = r.request_ID
JOIN Students s1 ON r.senderID = s1.studentID
JOIN Students s2 ON r.receiverID = s2.studentID
JOIN Skills sk ON r.requested_skill = sk.skillID;

-- =========================================================================
-- TRANSACTIONS
-- =========================================================================

DELIMITER $$

-- Procedure: AcceptRequestTransaction
-- Atomic transaction to accept a request and write an exchange entry
CREATE PROCEDURE AcceptRequestTransaction (
    IN p_requestID INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

    -- Step 1: update request status
    UPDATE Requests
    SET status = 'accepted'
    WHERE request_ID = p_requestID;

    -- Step 2: create exchange record
    INSERT INTO Exchanges (requestID, completed_at)
    VALUES (p_requestID, NOW());

    COMMIT;
END $$

DELIMITER ;

select*from Students;



