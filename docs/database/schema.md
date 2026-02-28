# Database Schema

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│      users      │       │    students     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ username        │       │ user_id (FK)    │
│ password_hash   │◄──────│ name            │
│ role            │       │ email           │
│ created_at      │       │ wallet_address  │
│ updated_at      │       │ student_code    │
└─────────────────┘       │ status          │
                          │ created_at      │
                          │ updated_at      │
                          └────────┬────────┘
                                   │
                                   │ 1:N
                                   ▼
                          ┌─────────────────┐
                          │   credentials   │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ student_id (FK)│
                          │ name            │
                          │ description     │
                          │ ipfs_hash       │
                          │ file_hash       │
                          │ status          │
                          │ tx_hash         │
                          │ token_id        │
                          │ verify_code     │
                          │ issued_at       │
                          │ created_at      │
                          │ updated_at      │
                          └─────────────────┘
```

## Tables

### 1. users
| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | User ID |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Login username |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | ENUM | NOT NULL | 'admin', 'student', 'viewer' |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | | Last update |

### 2. students
| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | Student ID |
| user_id | UUID | FK → users.id | Related user account |
| name | VARCHAR(255) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| wallet_address | VARCHAR(42) | | Polygon wallet address |
| student_code | VARCHAR(50) | UNIQUE | Student code (e.g., SV001) |
| status | ENUM | DEFAULT 'active' | 'active', 'inactive', 'graduated' |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | | Last update |

### 3. credentials
| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | Credential ID |
| student_id | UUID | FK → students.id | Owner student |
| name | VARCHAR(255) | NOT NULL | Credential name |
| description | TEXT | | Detailed description |
| ipfs_hash | VARCHAR(255) | | IPFS file hash (PDF) |
| file_hash | VARCHAR(64) | | SHA-256 hash of file |
| status | ENUM | DEFAULT 'pending' | 'pending', 'issued', 'confirmed', 'revoked' |
| tx_hash | VARCHAR(66) | | Blockchain transaction hash |
| token_id | BIGINT | | ERC721 token ID |
| verify_code | VARCHAR(50) | UNIQUE | Public verification code |
| issued_at | TIMESTAMP | | Issue date |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | | Last update |

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_wallet ON students(wallet_address);
CREATE INDEX idx_credentials_student ON credentials(student_id);
CREATE INDEX idx_credentials_verify_code ON credentials(verify_code);
CREATE INDEX idx_credentials_status ON credentials(status);
```

## Status Flow

```
pending → issued → confirmed
                   ↓
                revoked
```

## API Response Examples

### GET /students
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Nguyen Van A",
      "email": "a@example.com",
      "walletAddress": "0x1234...",
      "studentCode": "SV001",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /credentials
```json
{
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "name": "Certificate of Completion",
      "description": "Complete blockchain course",
      "status": "confirmed",
      "verifyCode": "CRED-20240101-ABC123",
      "txHash": "0xabc...",
      "tokenId": "1",
      "issuedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```
