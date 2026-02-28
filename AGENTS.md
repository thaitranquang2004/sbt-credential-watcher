# Credential Core - Project Context

## Team Members
| Role | Name | Responsibility |
|------|------|----------------|
| BE1 (Core) | Thịnh | DB migrations, Admin login, Students CRUD |
| BE2 (Chain) | Nhã | Smart Contract, ABI export |
| BE3 (Watcher) | Thái | Socket Gateway, Event Listener |
| FE1 (Admin) | Trường | Admin UI (login, list, issue form) |
| FE2 (Student) | Tài | Student UI (wallet login, credentials list) |
| FE3 (Public) | Khánh | Public verify page (/verify/[code]) |

## Tech Stack

### Blockchain & Smart Contract
- **Network**: Polygon (Layer 2)
- **Language**: Solidity
- **Library**: OpenZeppelin
- **Token Standard**: SBT (Soulbound Token / ERC721 non-transferable)

### Backend
- **Framework**: NestJS (TypeScript)
- **Auth**: JWT + RBAC Guards
- **Queue**: BullMQ + Redis
- **Realtime**: Socket.io
- **Database**: PostgreSQL (hiện tại dùng MockDatabaseService)
- **Indexer**: Blockchain Watcher/Event Listener Service

### Frontend
- **Framework**: Next.js (SSR)
- **Styling**: TailwindCSS

### Storage
- **Relational**: PostgreSQL (users, student profiles)
- **Files**: IPFS via Pinata/Infura (PDF storage)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Admin Portal│  │Student Portal│  │ Public Verify (/verify)│  │
│  │  /admin     │  │  /student   │  │  /verify/[code]        │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API (NestJS)                         │
│  http://localhost:3000                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ /auth       │  │ /students   │  │ /credentials           │  │
│  │ POST /login │  │ GET/POST    │  │ GET/POST/PUT          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────────────────────────────────────┐│
│  │ /events     │  │ Socket Gateway (realtime updates)          ││
│  │ Socket.io   │  │                                             ││
│  └─────────────┘  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Current Status

### Demo Running
- ✅ Backend: http://localhost:3000 (với MockDatabaseService)
- ✅ Frontend: http://localhost:3001
- ✅ Mock data đã được seed sẵn

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Admin login |
| GET | /students | Get all students |
| POST | /students | Create student |
| GET | /credentials | Get all credentials |
| GET | /credentials/verify/:code | Public verify |
| POST | /credentials | Issue credential |

## Database Schema

### Entities

```typescript
// User
{
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'student' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

// Student
{
  id: string;
  userId: string | null;
  name: string;
  email: string;
  walletAddress: string | null;
  studentCode: string | null;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: Date;
  updatedAt: Date;
}

// Credential
{
  id: string;
  studentId: string;
  student: Student;
  name: string;
  description: string | null;
  ipfsHash: string | null;
  fileHash: string | null;
  status: 'pending' | 'issued' | 'confirmed' | 'revoked';
  txHash: string | null;
  tokenId: string | null;
  verifyCode: string;
  issuedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Mock Data (đã seed sẵn)

**Users:**
- admin / admin123 (role: admin)

**Students:**
- Nguyễn Văn A (SV001, active)
- Trần Thị B (SV002, active)
- Lê Văn C (SV003, active)
- Phạm Thị D (SV004, inactive)

**Credentials:**
- CRED-20240115-ABC123 (confirmed, tokenId: 1)
- CRED-20240125-DEF456 (confirmed, tokenId: 2)
- CRED-20240201-GHI789 (issued, tokenId: 3)
- CRED-20240210-JKL012 (pending)
- CRED-20240212-MNO345 (pending)

## Development Commands

```bash
# Backend (đã chạy)
cd backend
npm install
npm run build
node dist/main.js   # Port 3000

# Frontend (đã chạy)
cd frontend
npm install
npm run dev         # Port 3001
```

## Repository Structure

```
credential-core/
├── backend/
│   └── src/
│       ├── auth/           # Auth + RBAC
│       │   ├── auth.service.ts
│       │   ├── guards/
│       │   └── entities/user.entity.ts
│       ├── students/       # Student CRUD
│       │   ├── students.service.ts
│       │   ├── students.controller.ts
│       │   └── entities/student.entity.ts
│       ├── credentials/    # Credential management
│       │   ├── credentials.service.ts
│       │   ├── credentials.controller.ts
│       │   └── entities/credential.entity.ts
│       ├── events/         # Socket Gateway
│       └── common/
│           └── services/
│               └── mock-database.service.ts  # ← Mock data
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # Home
│       │   ├── admin/page.tsx     # Admin Portal
│       │   ├── student/page.tsx   # Student Portal
│       │   └── verify/[code]/     # Public Verify
│       └── lib/api.ts
│
├── contracts/              # Solidity
├── specs/                  # OpenAPI, Socket Events, ABIs
├── docs/database/          # Database docs
└── AGENTS.md              # AI Context
```

## For AI Assistants

Khi làm việc với dự án này:

1. **Database**: Hiện tại dùng `MockDatabaseService` (in-memory). Để chuyển sang PostgreSQL thật, cần cài đặt TypeORM và chạy migrations.

2. **Mock Data**: Xem `backend/src/common/services/mock-database.service.ts` để hiểu cấu trúc data.

3. **API**: Tất cả endpoints không cần auth token (đã bỏ guard tạm thời cho demo).

4. **Frontend**: Fetch data từ `http://localhost:3000`.

5. **Verify Code**: Dùng các mock verify codes đã có: `CRED-20240115-ABC123`, `CRED-20240125-DEF456`, etc.

## Environment Variables

```env
# Backend
PORT=3000
JWT_SECRET=secret
JWT_EXPIRES_IN=7d

# Frontend  
NEXT_PUBLIC_API_URL=http://localhost:3000
```
