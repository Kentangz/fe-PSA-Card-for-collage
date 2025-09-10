import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Clock, User, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axiosInstance';

import type { CardStatus } from "@/types/card.types";

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
      const submittedCards = response.data.filter((card: UserCard) => card.latest_status.status === 'submit');
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
    const interval = setInterval(fetchUserCards, 30000); // 30 second
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-notification-dropdown]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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



  return (
    <div className={`relative ${className}`} data-notification-dropdown>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 touch-manipulation"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium text-[10px] sm:text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          
          <div className="fixed inset-x-4 top-16 sm:absolute sm:right-0 sm:top-full sm:inset-x-auto sm:mt-2 w-auto sm:w-96 bg-[#F5F5F5] border border-gray-200 rounded-lg shadow-lg z-50 max-h-[calc(100vh-8rem)] sm:max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-3 border-b border-gray-200 bg-[#F5F5F5] sticky top-0 z-10">
              <h3 className="font-medium text-gray-800 flex items-center gap-2 text-sm sm:text-sm">
                <Bell className="w-4 h-4" />
                <span className="truncate">Kartu Baru Disubmit ({unreadCount})</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
              {loading ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-3 text-sm">Memuat notifikasi...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <CheckCircle className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-base mb-1">Tidak ada kartu baru</p>
                  <p className="text-sm">Semua kartu sudah diproses</p>
                </div>
              ) : (
                notifications.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleNotificationClick(card.id)}
                    className="p-4 sm:p-3 border-b border-gray-100 hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 cursor-pointer group touch-manipulation"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Card Info */}
                        <div className="flex items-center gap-2 mb-2 sm:mb-1">
                          <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <h4 className="font-medium text-gray-800 truncate text-base sm:text-sm group-hover:text-blue-700 flex-1">
                            {card.name}
                          </h4>
                          <span className="inline-flex items-center px-2 py-1 sm:px-1.5 sm:py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 flex-shrink-0">
                            {card.latest_status.status}
                          </span>
                        </div>

                        {/* Card Details */}
                        <div className="space-y-1.5 sm:space-y-0.5 text-sm sm:text-xs text-gray-600">
                          <div className="flex items-center gap-2 sm:gap-1">
                            <User className="w-4 h-4 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span>User ID: {card.user_id}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-1">
                            <Calendar className="w-4 h-4 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className="truncate">{card.brand} ({card.year})</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-1">
                            <span>Target: </span>
                            <span className={`px-2 py-1 sm:px-1 sm:py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                              card.grade_target === 'A' ? 'bg-green-100 text-green-800' :
                              card.grade_target === 'B' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              Grade {card.grade_target}
                            </span>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 sm:gap-1 mt-2 sm:mt-1 text-sm sm:text-xs text-gray-500">
                          <Clock className="w-4 h-4 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="truncate">{formatDate(card.latest_status.created_at)}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <ExternalLink className="w-4 h-4 sm:w-3 sm:h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(card.id);
                          }}
                          className="p-2 sm:p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                          title="Tandai sudah dibaca"
                        >
                          <X className="w-4 h-4 sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 sm:p-2 bg-[#F5F5F5] border-t border-gray-200 sticky bottom-0">
                <button
                  onClick={fetchUserCards}
                  className="w-full text-sm sm:text-xs text-blue-600 hover:text-blue-800 font-medium py-2 sm:py-1 rounded hover:bg-blue-50 transition-colors touch-manipulation"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserNotifications;