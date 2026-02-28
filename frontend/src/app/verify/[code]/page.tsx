'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Credential {
  id: string;
  name: string;
  description: string;
  status: string;
  verifyCode: string;
  issuedAt: string;
  txHash: string;
  tokenId: string;
  ipfsHash: string;
  fileHash: string;
  student: {
    name: string;
    email: string;
    studentCode: string;
  };
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [hashMatch, setHashMatch] = useState<boolean | null>(null);

  useEffect(() => {
    if (code) {
      fetchCredential(code);
    }
  }, [code]);

  const fetchCredential = async (verifyCode: string) => {
    try {
      const res = await fetch(`http://localhost:3000/credentials/verify/${verifyCode}`);
      if (!res.ok) {
        setError('Không tìm thấy văn bằng');
        return;
      }
      const data = await res.json();
      setCredential(data);
    } catch (err) {
      setError('Lỗi khi tải thông tin văn bằng');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    setFileHash(hashHex);
    
    if (credential?.fileHash) {
      setHashMatch(hashHex === credential.fileHash);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'issued': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'revoked': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin văn bằng...</p>
        </div>
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">✕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Văn bằng không hợp lệ</h1>
          <p className="text-gray-600">{error || 'Không tìm thấy văn bằng với mã này'}</p>
          <a href="/" className="inline-block mt-6 text-primary-600 hover:underline">
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Xác minh văn bằng</h1>
            <a href="/" className="text-gray-600 hover:text-gray-900">Trang chủ</a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary-600 text-white p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🎓</span>
              <div>
                <h2 className="text-2xl font-bold">{credential.name}</h2>
                <p className="text-primary-100">Verify Code: {credential.verifyCode}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className={`text-xl font-bold ${getStatusColor(credential.status)}`}>
                {credential.status === 'confirmed' && '✓ Đã xác nhận'}
                {credential.status === 'issued' && '○ Đã phát hành'}
                {credential.status === 'pending' && '⏳ Chờ xử lý'}
                {credential.status === 'revoked' && '✕ Đã thu hồi'}
              </span>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold text-lg mb-4">Thông tin người học</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Họ và tên</p>
                  <p className="font-medium">{credential.student?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mã sinh viên</p>
                  <p className="font-medium">{credential.student?.studentCode}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{credential.student?.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold text-lg mb-4">Chi tiết văn bằng</h3>
              <div className="text-sm space-y-2">
                <p><span className="text-gray-500">Mô tả:</span> {credential.description}</p>
                {credential.issuedAt && (
                  <p><span className="text-gray-500">Ngày cấp:</span> {new Date(credential.issuedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                )}
                {credential.tokenId && (
                  <p><span className="text-gray-500">Token ID:</span> #{credential.tokenId}</p>
                )}
              </div>
            </div>

            {credential.fileHash && (
              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-4">Kiểm tra file PDF</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Tải lên file PDF của văn bằng để kiểm tra tính toàn vẹn:
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {fileHash && (
                    <div className="mt-4 text-sm">
                      <p className="text-gray-500">Hash của file:</p>
                      <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">{fileHash}</p>
                      <p className="text-gray-500 mt-2">Hash trong hệ thống:</p>
                      <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">{credential.fileHash}</p>
                      {hashMatch === true && (
                        <p className="mt-2 text-green-600 font-medium">✓ File hợp lệ - Hash khớp!</p>
                      )}
                      {hashMatch === false && (
                        <p className="mt-2 text-red-600 font-medium">✕ File không hợp lệ - Hash không khớp!</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {credential.txHash && (
              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-4">Thông tin Blockchain</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p className="text-gray-500">Transaction Hash:</p>
                  <p className="font-mono text-xs break-all">{credential.txHash}</p>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${credential.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline text-sm"
                  >
                    Xem trên Polygon Scan →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
