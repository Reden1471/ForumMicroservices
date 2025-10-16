-- docker-init.sql

-- Create database if not exists
IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'ForumMicroservices')
BEGIN
    CREATE DATABASE ForumMicroservices;
    PRINT 'ForumMicroservices database created.';
END
ELSE
BEGIN
    PRINT 'ForumMicroservices database already exists.';
END
GO

USE ForumMicroservices;
GO

-- Create Users table if not exists
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        Role INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL,
        LastLogin DATETIME2 NULL
    );
    PRINT 'Users table created.';
END
ELSE
BEGIN
    PRINT 'Users table already exists.';
END
GO

-- Create Posts table if not exists
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Posts' AND xtype='U')
BEGIN
    CREATE TABLE Posts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(200) NOT NULL,
        Content NVARCHAR(MAX) NOT NULL,
        UserId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL,
        UpdatedAt DATETIME2 NULL
    );
    PRINT 'Posts table created.';
END
ELSE
BEGIN
    PRINT 'Posts table already exists.';
END
GO

-- Create Comments table if not exists
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Comments' AND xtype='U')
BEGIN
    CREATE TABLE Comments (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Content NVARCHAR(MAX) NOT NULL,
        PostId INT NOT NULL,
        UserId INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL
    );
    PRINT 'Comments table created.';
END
ELSE
BEGIN
    PRINT 'Comments table already exists.';
END
GO

-- Indexes (if not exists)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Username' AND object_id = OBJECT_ID('Users'))
BEGIN
    CREATE UNIQUE INDEX IX_Users_Username ON Users(Username);
    PRINT 'IX_Users_Username index created.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('Users'))
BEGIN
    CREATE UNIQUE INDEX IX_Users_Email ON Users(Email);
    PRINT 'IX_Users_Email index created.';
END

PRINT 'Database initialization completed successfully.';
GO