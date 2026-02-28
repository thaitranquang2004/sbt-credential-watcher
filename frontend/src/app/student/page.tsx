'use client';

import { useState, useEffect } from 'react';

interface Credential {
  id: string;
  name: string;
  description: string;
  status: string;
  verifyCode: string;
  issuedAt: string;
  tokenId: string;
  student: {
    name: string;
    email: string;
  };
}

export default function StudentPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await fetch('http://localhost:3000/credentials');
      const data = await res.json();
      setCredentials(data);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Student Portal - Học vị của tôi</h1>
            <div className="flex gap-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">Trang chủ</a>
              <a href="/admin" className="text-gray-600 hover:text-gray-900">Admin</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Danh sách văn bằng</h2>
          <p className="text-gray-600">Tất cả văn bằng của bạn sẽ được hiển thị dưới đây</p>
        </div>

        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : credentials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có văn bằng nào</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
                onClick={() => setSelectedCredential(cred)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                    {cred.name}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cred.status)}`}>
                    {cred.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{cred.description}</p>
                <div className="text-xs text-gray-500">
                  <p>Mã xác minh: <span className="font-mono">{cred.verifyCode}</span></p>
                  {cred.issuedAt && <p>Ngày cấp: {new Date(cred.issuedAt).toLocaleDateString('vi-VN')}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedCredential && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setSelectedCredential(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">{selectedCredential.name}</h3>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Mô tả:</span> {selectedCredential.description}</p>
              <p><span className="font-medium">Mã xác minh:</span> <span className="font-mono">{selectedCredential.verifyCode}</span></p>
              <p><span className="font-medium">Trạng thái:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedCredential.status)}`}>
                  {selectedCredential.status}
                </span>
              </p>
              {selectedCredential.tokenId && (
                <p><span className="font-medium">Token ID:</span> #{selectedCredential.tokenId}</p>
              )}
              {selectedCredential.issuedAt && (
                <p><span className="font-medium">Ngày cấp:</span> {new Date(selectedCredential.issuedAt).toLocaleDateString('vi-VN')}</p>
              )}
              <p><span className="font-medium">Sinh viên:</span> {selectedCredential.student?.name}</p>
            </div>
            <div className="flex gap-2 mt-6">
              <a href={`/verify/${selectedCredential.verifyCode}`} className="flex-1 bg-primary-600 text-white text-center py-2 rounded-lg hover:bg-primary-700">Xem công khai</a>
              <button onClick={() => setSelectedCredential(null)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
