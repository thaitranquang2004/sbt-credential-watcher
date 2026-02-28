# Socket Events

## Client → Server

### `join:student`
Join a student room to receive credential updates.
```json
{ "studentId": "uuid" }
```

## Server → Client

### `credential:issued`
Emitted when a credential is issued to a student.
```json
{
  "id": "uuid",
  "studentId": "uuid",
  "name": "Certificate of Completion",
  "status": "issued",
  "verifyCode": "CRED-xxx"
}
```

### `credential:statusChanged`
Emitted when credential status changes.
```json
{
  "credentialId": "uuid",
  "status": "confirmed"
}
```

### `credential:txConfirmed`
Emitted when blockchain transaction is confirmed.
```json
{
  "credentialId": "uuid",
  "txHash": "0x...",
  "tokenId": "1"
}
```

### `error`
Emitted on error.
```json
{
  "code": "ERROR_CODE",
  "message": "Error message"
}
```
