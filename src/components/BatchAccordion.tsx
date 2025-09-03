import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { MdAssignment } from "react-icons/md";
import UserPaymentGroup from "./UserPaymentGroup";
import PaymentModal from "./PaymentModal";
import { batchPaymentService } from "../services/batchPaymentService";
import { transformToUserPaymentGroups } from "../utils/batchPaymentUtils";
import type { 
  CardType, 
  UserPaymentGroup as UserPaymentGroupType,
  BatchPaymentsResponse 
} from "../types/submission";
import type { Batch } from "../types/batch.types";
import { queueService } from "../services/queueService";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DraggableUserRowProps {
  id: number;
  isSyncing: boolean;
  children: ReactNode;
  onKeyboardReorder: (payload: { id: number; direction: 'up' | 'down' }) => void;
}

const DraggableUserRow: React.FC<DraggableUserRowProps> = ({ id, isSyncing, children, onKeyboardReorder }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white ${isDragging ? 'z-10 shadow-lg ring-1 ring-slate-200 scale-[1.01]' : ''}`}
      onKeyDown={(e) => {
        if (e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          e.preventDefault();
          onKeyboardReorder({ id, direction: e.key === 'ArrowUp' ? 'up' : 'down' });
        }
      }}
      {...listeners}
      {...attributes}
      aria-roledescription="Draggable user row"
      role="listitem"
      title="Drag with mouse or Ctrl+Arrow to reorder"
    >
      <div className={`${isSyncing ? 'opacity-90' : 'opacity-100'} cursor-grab active:cursor-grabbing`}>
        {children}
      </div>
    </div>
  );
};

interface BatchAccordionProps {
  batch: Batch;
  submissions: CardType[];
  isOpen: boolean;
  onToggle: () => void;
  onToggleBatchStatus: (batchId: number, currentStatus: boolean) => Promise<void>;
}

const BatchAccordion: React.FC<BatchAccordionProps> = ({ 
  batch, 
  submissions, 
  isOpen, 
  onToggle,
  onToggleBatchStatus 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [batchPaymentsData, setBatchPaymentsData] = useState<BatchPaymentsResponse | null>(null);
  const [paymentDataLoaded, setPaymentDataLoaded] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUserGroup, setSelectedUserGroup] = useState<UserPaymentGroupType | null>(null);
  const [userQueueOrder, setUserQueueOrder] = useState<number[] | null>(null);
  const previousOrderRef = useRef<number[] | null>(null);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 50, tolerance: 5 },
    })
  );
  
  const statusText = batch.is_active ? "Open" : "Closed";
  const statusStyle = batch.is_active 
    ? "bg-green-100 text-green-800" 
    : "bg-red-100 text-red-800";

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (isOpen && !paymentDataLoaded && submissions.length > 0) {
        try {
          const data = await batchPaymentService.getByBatch(batch.id);
          setBatchPaymentsData(data);
        } catch (error) {
          console.error('Failed to fetch batch payment data:', error);
          setBatchPaymentsData(null);
        } finally {
          setPaymentDataLoaded(true);
        }
      }
    };

    fetchPaymentData();
  }, [isOpen, batch.id, paymentDataLoaded, submissions.length]);

  // Fetch and sync queue order as source of truth
  useEffect(() => {
    const fetchQueue = async () => {
      if (!isOpen) return;
      try {
        const res = await queueService.getBatchUserQueue(batch.id);
        const orderedIds = [...res.data.user_queues]
          .sort((a, b) => a.queue_order - b.queue_order)
          .map((item) => item.user.id);
        setUserQueueOrder(orderedIds);
      } catch (error) {
        console.error('Failed to fetch user queue order:', error);
        // Fallback to current order from submissions grouping
        setUserQueueOrder(null);
      }
    };
    fetchQueue();
  }, [isOpen, batch.id]);

  const userPaymentGroups = transformToUserPaymentGroups(submissions, batchPaymentsData || undefined);

  // Compute sorted groups based on queue order when available
  const sortedUserGroups = useMemo(() => {
    if (!userPaymentGroups || userPaymentGroups.length === 0) return [] as UserPaymentGroupType[];
    if (!userQueueOrder) return userPaymentGroups;
    const orderIndex = new Map<number, number>();
    userQueueOrder.forEach((userId, index) => orderIndex.set(userId, index));
    return [...userPaymentGroups].sort((a, b) => {
      const ai = orderIndex.has(a.user.id) ? (orderIndex.get(a.user.id) as number) : Number.MAX_SAFE_INTEGER;
      const bi = orderIndex.has(b.user.id) ? (orderIndex.get(b.user.id) as number) : Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.user.id - b.user.id;
    });
  }, [userPaymentGroups, userQueueOrder]);

  const arrayMove = (arr: number[], from: number, to: number) => {
    const copy = arr.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };

  const notify = (message: string) => {
    // Minimal inline toast using a temporary fixed element (no external deps)
    const el = document.createElement('div');
    el.textContent = message;
    el.className = 'fixed left-1/2 -translate-x-1/2 top-4 z-[9999] bg-red-600 text-white text-sm px-3 py-2 rounded shadow-md animate-in fade-in duration-150';
    document.body.appendChild(el);
    setTimeout(() => {
      el.classList.add('opacity-0');
      setTimeout(() => el.remove(), 300);
    }, 2000);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Build current order from sortedUserGroups to ensure consistency
    const currentOrder = (userQueueOrder && userQueueOrder.length === sortedUserGroups.length)
      ? userQueueOrder
      : sortedUserGroups.map((g) => g.user.id);
    const fromIndex = currentOrder.indexOf(Number(active.id));
    const toIndex = currentOrder.indexOf(Number(over.id));
    if (fromIndex === -1 || toIndex === -1) return;

    const optimistic = arrayMove(currentOrder, fromIndex, toIndex);
    previousOrderRef.current = currentOrder;
    setUserQueueOrder(optimistic);
    setIsSyncingQueue(true);
    try {
      await queueService.updateBatchUserQueue(batch.id, optimistic);
    } catch {
      // Revert on failure
      setUserQueueOrder(previousOrderRef.current);
      notify('Failed to update queue order. Reverting changes.');
    } finally {
      setIsSyncingQueue(false);
    }
  };

  // No overlay; we keep the drag UX minimal without extra UI

  const handleKeyboardReorder = async (payload: { id: number; direction: 'up' | 'down' }) => {
    const currentOrder = (userQueueOrder && userQueueOrder.length === sortedUserGroups.length)
      ? userQueueOrder
      : sortedUserGroups.map((g) => g.user.id);
    const index = currentOrder.indexOf(payload.id);
    if (index === -1) return;
    const toIndex = payload.direction === 'up' ? Math.max(0, index - 1) : Math.min(currentOrder.length - 1, index + 1);
    if (toIndex === index) return;
    const optimistic = arrayMove(currentOrder, index, toIndex);
    previousOrderRef.current = currentOrder;
    setUserQueueOrder(optimistic);
    setIsSyncingQueue(true);
    try {
      await queueService.updateBatchUserQueue(batch.id, optimistic);
    } catch {
      setUserQueueOrder(previousOrderRef.current);
      notify('Failed to update queue order. Reverting changes.');
    } finally {
      setIsSyncingQueue(false);
    }
  };

  const handleToggleBatchStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await onToggleBatchStatus(batch.id, batch.is_active);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleUserGroup = (userId: number) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const handlePaymentAction = async (userGroup: UserPaymentGroupType, action: string) => {
    try {
      switch (action) {
        case 'create':
        case 'update':
          // Open modal for create/update
          setSelectedUserGroup(userGroup);
          setShowPaymentModal(true);
          break;
        case 'send':
          if (userGroup.paymentInfo?.id) {
            await batchPaymentService.sendPaymentLink(userGroup.paymentInfo.id);
            // Refresh payment data
            await refreshPaymentData();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Payment action failed:', error);
    }
  };

  const refreshPaymentData = async () => {
    try {
      const data = await batchPaymentService.getByBatch(batch.id);
      setBatchPaymentsData(data);
    } catch (error) {
      console.error('Failed to refresh payment data:', error);
    }
  };

  const handlePaymentModalSuccess = async () => {
    await refreshPaymentData();
    setShowPaymentModal(false);
    setSelectedUserGroup(null);
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setSelectedUserGroup(null);
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm mb-4 bg-white overflow-hidden">
      {/* Accordion Header - Fixed: Separated buttons */}
      <div className="flex items-center hover:bg-gray-50 transition-colors duration-200">
        {/* Accordion Toggle Button */}
        <button
          onClick={onToggle}
          className="flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-inset min-w-0"
          aria-expanded={isOpen}
          aria-controls={`batch-content-${batch.id}`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {isOpen ? (
              <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
            )}
            
            {/* Desktop Header (lg and above) */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-left flex-1 min-w-0">
              <div className="min-w-0">
                <h3 className="text-lg xl:text-xl font-semibold text-gray-900 truncate">
                  {batch.batch_number}
                </h3>
                <p className="text-sm text-gray-600 truncate">{batch.register_number}</p>
              </div>
              
              <div className="flex items-center space-x-3 xl:space-x-4 flex-shrink-0">
                <span className="inline-flex px-2.5 py-1 text-xs xl:text-sm font-medium rounded-full bg-slate-100 text-slate-700 whitespace-nowrap">
                  {batch.category}
                </span>
                
                <span className={`inline-flex px-2.5 py-1 text-xs xl:text-sm font-medium rounded-full whitespace-nowrap ${statusStyle}`}>
                  {statusText}
                </span>
                
                <span className="text-xs xl:text-sm text-gray-600 whitespace-nowrap">
                  {submissions.length > 0 
                    ? `${submissions.length} submission${submissions.length > 1 ? 's' : ''}` 
                    : 'No submissions'
                  }
                </span>
                
                {userPaymentGroups.length > 0 && (
                  <span className="text-xs xl:text-sm text-gray-600 whitespace-nowrap">
                    {userPaymentGroups.length} user{userPaymentGroups.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Tablet Header (md to lg) */}
            <div className="hidden md:flex lg:hidden items-center justify-between text-left flex-1 min-w-0">
              <div className="min-w-0 flex-1 mr-4">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {batch.batch_number}
                </h3>
                <p className="text-sm text-gray-600 truncate">{batch.register_number}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                    {batch.category}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle}`}>
                    {statusText}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500">
                  {submissions.length > 0 
                    ? `${submissions.length} submission${submissions.length > 1 ? 's' : ''}` 
                    : 'No submissions'
                  }
                </p>
                {userPaymentGroups.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {userPaymentGroups.length} user{userPaymentGroups.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Header (sm and below) */}
            <div className="md:hidden text-left flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                {batch.batch_number}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{batch.register_number}</p>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700 truncate max-w-20">
                  {batch.category}
                </span>
                <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${statusStyle}`}>
                  {statusText}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {submissions.length > 0 
                  ? `${submissions.length} item${submissions.length > 1 ? 's' : ''} • ${userPaymentGroups.length} user${userPaymentGroups.length > 1 ? 's' : ''}` 
                  : 'Empty'
                }
              </p>
            </div>
          </div>
        </button>

        {/* Separate Toggle Batch Status Button - Now outside the accordion button */}
        <div className="flex items-center px-2 sm:px-3 lg:px-4 py-3 sm:py-4 flex-shrink-0 border-l border-gray-200">
          <button
            onClick={handleToggleBatchStatus}
            disabled={isUpdating}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
              batch.is_active
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
            }`}
          >
            {isUpdating ? (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-current"></div>
                <span className="hidden sm:inline">Updating...</span>
                <span className="sm:hidden">...</span>
              </div>
            ) : (
              <>
                <span className="hidden sm:inline">
                  {batch.is_active ? 'Close Batch' : 'Open Batch'}
                </span>
                <span className="sm:hidden">
                  {batch.is_active ? 'Close' : 'Open'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div 
          id={`batch-content-${batch.id}`}
          className="border-t border-gray-200 animate-in slide-in-from-top-2 duration-200"
        >
          {submissions.length === 0 ? (
            <div className="py-8 sm:py-12 text-center text-gray-500">
              <MdAssignment className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base">There is no submission yet</p>
            </div>
          ) : userPaymentGroups.length === 0 ? (
            <div className="py-8 sm:py-12 text-center text-gray-500">
              <MdAssignment className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base">Loading user payment data...</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
              collisionDetection={rectIntersection}
            >
              <SortableContext items={sortedUserGroups.map(g => g.user.id)} strategy={verticalListSortingStrategy}>
                <div className="divide-y divide-gray-100">
                {sortedUserGroups.map((userGroup, index) => (
                  <DraggableUserRow
                    key={userGroup.user.id}
                    id={userGroup.user.id}
                    isSyncing={isSyncingQueue}
                    onKeyboardReorder={handleKeyboardReorder}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center select-none">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mt-2">
                          {index + 1}
                        </span>
                        <span className="mt-1 h-4 w-1 rounded-full bg-slate-200" />
                      </div>
                      <div className="flex-1">
                        <UserPaymentGroup
                          userGroup={userGroup}
                          isOpen={expandedUsers.has(userGroup.user.id)}
                          onToggle={() => toggleUserGroup(userGroup.user.id)}
                          onPaymentAction={handlePaymentAction}
                        />
                      </div>
                    </div>
                  </DraggableUserRow>
                ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentModalClose}
        userGroup={selectedUserGroup}
        batchId={batch.id}
        onSuccess={handlePaymentModalSuccess}
      />
    </div>
  );
};

export default BatchAccordion;