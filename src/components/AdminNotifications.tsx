import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Clock, User, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axiosInstance';

interface CardStatus {
  id: number;
  card_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserCard {
  id: string;
  user_id: number;
  name: string;
  year: number;
  brand: string;
  serial_number: string;
  grade_target: string;
  grade: string | null;
  created_at: string;
  updated_at: string;
  latest_status: CardStatus;
  statuses: CardStatus[];
}

interface UserNotificationsProps {
  className?: string;
}

const UserNotifications: React.FC<UserNotificationsProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<UserCard[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchUserCards = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<UserCard[]>('/card');
      // Filter submitted cards
      const submittedCards = response.data.filter((card: UserCard) => card.latest_status.status === 'submitted');
      setNotifications(submittedCards);
      setUnreadCount(submittedCards.length);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCards();
    // new notifications every 30 seconds
    const interval = setInterval(fetchUserCards, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const markAsRead = (cardId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== cardId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (cardId: string) => {
    navigate(`/dashboard/admin/submissions/${cardId}`);
    markAsRead(cardId);
    setIsOpen(false);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-[10px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium text-gray-800 flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4" />
              Kartu Baru Disubmit ({unreadCount})
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Hapus
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm">Memuat notifikasi...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">Tidak ada kartu baru</p>
                <p className="text-sm">Semua kartu sudah diproses</p>
              </div>
            ) : (
              notifications.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleNotificationClick(card.id)}
                  className="p-3 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Card Info */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <h4 className="font-medium text-gray-800 truncate text-sm group-hover:text-blue-700">
                          {card.name}
                        </h4>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          {card.latest_status.status}
                        </span>
                        <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Card Details */}
                      <div className="space-y-0.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>User ID: {card.user_id}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{card.brand} ({card.year})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Target: </span>
                          <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                            card.grade_target === 'A' ? 'bg-green-100 text-green-800' :
                            card.grade_target === 'B' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Grade {card.grade_target}
                          </span>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(card.latest_status.created_at)}</span>
                      </div>
                    </div>

                    {/* Mark as read button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(card.id);
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Tandai sudah dibaca"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 bg-gray-50 border-t border-gray-200">
              <button
                onClick={fetchUserCards}
                className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium py-1"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserNotifications;