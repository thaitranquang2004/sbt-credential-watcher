# Credential Core

Hệ thống quản lý văn bằng trên Blockchain sử dụng Soulbound Tokens (SBT).

## Trạng thái hiện tại

✅ **Đang chạy:**
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

## Quick Start

```bash
# Backend
cd backend
npm install
npm run build
node dist/main.js

# Frontend  
cd frontend
npm install
npm run dev
```

## Demo Accounts

- **Admin login**: admin / admin123

## Mock Data

### Students
- Nguyễn Văn A (SV001, active)
- Trần Thị B (SV002, active)
- Lê Văn C (SV003, active)
- Phạm Thị D (SV004, inactive)

### Credentials
- CRED-20240115-ABC123 (confirmed)
- CRED-20240125-DEF456 (confirmed)
- CRED-20240201-GHI789 (issued)
- CRED-20240210-JKL012 (pending)
- CRED-20240212-MNO345 (pending)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Admin login |
| GET | /students | Get all students |
| POST | /students | Create student |
| GET | /credentials | Get all credentials |
| GET | /credentials/verify/:code | Public verify |
| POST | /credentials | Issue credential |

## Pages

- `/` - Trang chủ
- `/admin` - Admin Portal (quản lý sinh viên)
- `/student` - Student Portal (xem văn bằng)
- `/verify/[code]` - Public verify (xác minh văn bằng)

## Team

| Role | Member | Responsibility |
|------|--------|----------------|
| BE1 | Thịnh | Core API, DB |
| BE2 | Nhã | Smart Contract |
| BE3 | Thái | Socket/Events |
| FE1 | Trường | Admin UI |
| FE2 | Tài | Student UI |
| FE3 | Khánh | Public Verify |

## Documentation

- Database Schema: `docs/database/schema.md`
- Socket Events: `specs/socket/events.md`
- OpenAPI: `specs/openapi/api.yaml`
