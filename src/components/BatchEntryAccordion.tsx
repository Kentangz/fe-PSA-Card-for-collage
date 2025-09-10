import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { MdAssignment } from "react-icons/md";
import { BsEye } from "react-icons/bs";
import type { Batch } from "../types/batch.types";
import { queueEntryService, type QueueEntryItem } from "../services/queueEntryService";
import { PATHS } from "@/routes/paths";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import formatDate from "@/utils/formatDate";
import PaymentModal from "@/components/PaymentModal";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface BatchEntryAccordionProps {
  batch: Batch;
  isOpen: boolean;
  onToggle: () => void;
  onToggleBatchStatus: (batchId: number, currentStatus: boolean) => Promise<void>;
}

function DraggableRow({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// Narrowed card type used for entry detail rendering
interface CardListItem {
  id: string | number;
  name: string;
  year: number | string;
  brand: string;
  serial_number?: string | null;
  grade?: string | null;
  latest_status?: { status: string } | null;
  created_at: string;
}

const BatchEntryAccordion: React.FC<BatchEntryAccordionProps> = ({ batch, isOpen, onToggle, onToggleBatchStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [entries, setEntries] = useState<QueueEntryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [expandedEntryIds, setExpandedEntryIds] = useState<Set<number>>(new Set());
  const [entryCardsCache, setEntryCardsCache] = useState<Record<number, CardListItem[]>>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalEntryId, setModalEntryId] = useState<number | null>(null);
  const [modalUserInfo, setModalUserInfo] = useState<{ name: string; email: string } | undefined>(undefined);
  const [modalSubs, setModalSubs] = useState<CardListItem[] | undefined>(undefined);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 50, tolerance: 5 } })
  );
  const prevOrderRef = useRef<number[] | null>(null);

  const statusText = batch.is_active ? "Open" : "Closed";
  const statusStyle = batch.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

  const loadEntries = async (p = page) => {
    setLoading(true);
    try {
      const res = await queueEntryService.listByBatch(batch.id, p, perPage);
      setEntries(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEntries(1);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, batch.id]);

  const handleToggleBatchStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await onToggleBatchStatus(batch.id, batch.is_active);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOrderIds = useMemo(() => entries.map(e => e.id), [entries]);

  const arrayMove = (arr: number[], from: number, to: number) => {
    const copy = arr.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };

  const onDragEnd = async (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;
    const from = currentOrderIds.indexOf(Number(active.id));
    const to = currentOrderIds.indexOf(Number(over.id));
    if (from === -1 || to === -1) return;
    const optimisticOrder = arrayMove(currentOrderIds, from, to);
    prevOrderRef.current = currentOrderIds;
    // optimistic UI
    const reordered = optimisticOrder.map(id => entries.find(e => e.id === id)!).filter((e): e is QueueEntryItem => Boolean(e));
    setEntries(reordered);
    try {
      await queueEntryService.reorder(batch.id, optimisticOrder);
    } catch {
      if (prevOrderRef.current) {
        const rollback = prevOrderRef.current.map(id => entries.find(e => e.id === id)!).filter((e): e is QueueEntryItem => Boolean(e));
        setEntries(rollback);
      }
    }
  };

  const onSetAndSend = async (entryId: number) => {
    const entry = entries.find(en => en.id === entryId);
    const cards = entryCardsCache[entryId] || [];
    setModalEntryId(entryId);
    setModalUserInfo({ name: entry?.user?.name ?? `User #${entry?.user_id}`, email: entry?.user?.email ?? "" });
    setModalSubs(cards);
    setShowPaymentModal(true);
  };

  const toggleEntry = (entryId: number) => {
    const next = new Set(expandedEntryIds);
    if (next.has(entryId)) next.delete(entryId); else next.add(entryId);
    setExpandedEntryIds(next);
  };

  useEffect(() => {
    // fetch cards for newly expanded entries
    const fetchExpanded = async () => {
      const ids = Array.from(expandedEntryIds).filter(id => !entryCardsCache[id]);
      await Promise.all(ids.map(async (id) => {
        try {
          const detail = await queueEntryService.getDetail(id);
          setEntryCardsCache(prev => ({ ...prev, [id]: (detail.cards || []) as CardListItem[] }));
        } catch (e) {
          console.error('Failed to load entry detail', e);
        }
      }));
    };
    if (expandedEntryIds.size) fetchExpanded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedEntryIds]);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm mb-4 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center hover:bg-gray-50">
        <button onClick={onToggle} className="flex-1 px-4 py-3 flex items-center justify-between" aria-expanded={isOpen}>
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {isOpen ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-500" />
            )}
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{batch.batch_number}</h3>
              <p className="text-sm text-gray-600 truncate">{batch.register_number}</p>
            </div>
            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">{batch.category}</span>
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle}`}>{statusText}</span>
          </div>
        </button>
        <div className="px-3 py-3 border-l border-gray-200">
          <button
            onClick={handleToggleBatchStatus}
            disabled={isUpdating}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
              batch.is_active ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {batch.is_active ? "Close Batch" : "Open Batch"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="py-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              Loading entries...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <MdAssignment className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              No entries yet
            </div>
          ) : (
            <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={rectIntersection}>
              <SortableContext items={entries.map(e => e.id)} strategy={verticalListSortingStrategy}>
                <div className="divide-y divide-gray-100">
                  {entries.map((e, idx) => {
                    const isOpen = expandedEntryIds.has(e.id);
                    const cards = entryCardsCache[e.id] || [];
                    return (
                      <DraggableRow key={e.id} id={e.id}>
                        <div className="bg-white">
                          {/* Row header (match legacy style) */}
                          <div className="flex items-center hover:bg-gray-50 transition-colors duration-200">
                            <button onClick={() => toggleEntry(e.id)} className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between focus:outline-none min-w-0" aria-expanded={isOpen}>
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                {isOpen ? (
                                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                                )}
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1 text-left">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">{e.user?.name ?? `User #${e.user_id}`}</h4>
                                  <p className="text-xs text-gray-600 truncate">{e.user?.email ?? ''}</p>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                    {e.cards_count} submission{e.cards_count !== 1 ? 's' : ''}
                                  </span>
                                  <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</span>
                                </div>
                              </div>
                            </button>
                            <div className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-200">
                              {e.is_sent ? (
                                <span className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-green-50 text-green-700 border-green-200">Payment Sent</span>
                              ) : (
                                <button onClick={() => onSetAndSend(e.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                  Set & Send
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isOpen && (
                            <div className="border-t border-gray-100 bg-white">
                              {/* Mobile list */}
                              <div className="block md:hidden">
                                <div className="divide-y divide-gray-100">
                                  {cards.map((item: CardListItem, index: number) => (
                                    <div key={item.id || index} className="p-3">
                                      <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                                        <div className="flex-1 min-w-0 mr-1">
                                          <h3 className="text-sm font-medium text-gray-900 truncate" title={item.name}>{item.name}</h3>
                                          <p className="text-xs text-gray-500 mt-0.5 truncate">{item.brand} • {item.year}</p>
                                        </div>
                                        <span className="inline-flex flex-shrink-0">
                                          <StatusBadge status={item.latest_status?.status ?? ''} />
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 mb-2">
                                        <div className="truncate"><span className="font-medium">Serial:</span> <span className="ml-1 break-all" title={item.serial_number ?? undefined}>{item.serial_number}</span></div>
                                        <div><span className="font-medium">Grade:</span> {item.grade}</div>
                                        <div><span className="font-medium">Date:</span> <span className="ml-1">{formatDate(new Date(item.created_at))}</span></div>
                                      </div>
                                      <div className="flex justify-end">
                                        <Link to={PATHS.DASHBOARD.ADMIN.SUBMISSION_DETAIL(String(item.id))} className="inline-flex items-center px-2.5 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                                          <BsEye className="h-4 w-4" />
                                        </Link>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {/* Desktop table */}
                              <div className="hidden md:block">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm text-left min-w-full">
                                    <thead className="bg-gray-25 border-b border-gray-100">
                                      <tr>
                                        <th className="py-2 px-3 lg:px-4 font-medium text-gray-600 text-xs">Name</th>
                                        <th className="py-2 px-3 lg:px-4 font-medium text-gray-600 text-xs">Year</th>
                                        <th className="py-2 px-3 lg:px-4 font-medium text-gray-600 text-xs">Brand</th>
                                        <th className="py-2 px-3 lg:px-4 font-medium text-gray-600 text-xs">Serial</th>
                                        <th className="py-2 px-3 lg:px-4 font-medium text-gray-600 text-xs">Grade</th>
                                        <th className="py-2 px-3 lg:px-4 font-medium text-gray-600 text-xs">Status</th>
                                        <th className="py-2 px-3 lg:px-4 font-medium text-gray-600 text-xs">Date</th>
                                        <th className="py-2 px-3 lg:px-4 font-medium text-gray-600 text-xs">Detail</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {cards.map((item: CardListItem, index: number) => (
                                        <tr key={item.id || index} className="hover:bg-gray-25">
                                          <td className="py-1.5 px-3 lg:px-4 text-gray-800"><div className="truncate max-w-48" title={item.name}>{item.name}</div></td>
                                          <td className="py-1.5 px-3 lg:px-4 text-gray-600 text-xs whitespace-nowrap">{item.year}</td>
                                          <td className="py-1.5 px-3 lg:px-4 text-gray-600"><div className="truncate max-w-32" title={item.brand}>{item.brand}</div></td>
                                          <td className="py-1.5 px-3 lg:px-4 text-gray-600"><div className="truncate max-w-40" title={item.serial_number ?? undefined}>{item.serial_number}</div></td>
                                          <td className="py-1.5 px-3 lg:px-4 text-gray-600 text-xs whitespace-nowrap">{item.grade}</td>
                                          <td className="py-1.5 px-3 lg:px-4 whitespace-nowrap"><StatusBadge status={item.latest_status?.status ?? ''} /></td>
                                          <td className="py-1.5 px-3 lg:px-4 text-gray-600 text-xs whitespace-nowrap">{formatDate(new Date(item.created_at))}</td>
                                          <td className="py-1.5 px-3 lg:px-4 whitespace-nowrap"><Link to={PATHS.DASHBOARD.ADMIN.SUBMISSION_DETAIL(String(item.id))} className="text-blue-600 hover:text-blue-800"><BsEye className="h-4 w-4" /></Link></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </DraggableRow>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
          {/* Simple pagination controls */}
          {total > entries.length && (
            <div className="flex justify-end px-4 py-3 gap-2">
              <button
                className="text-xs px-3 py-1.5 rounded border disabled:opacity-50"
                onClick={async () => { const np = Math.max(1, page - 1); setPage(np); await loadEntries(np); }}
                disabled={page <= 1}
              >
                Prev
              </button>
              <button
                className="text-xs px-3 py-1.5 rounded border disabled:opacity-50"
                onClick={async () => { const np = page + 1; setPage(np); await loadEntries(np); }}
                disabled={entries.length < perPage}
              >
                Next
              </button>
            </div>
          )}
          {showPaymentModal && modalEntryId && modalUserInfo && modalSubs && (
            <PaymentModal
              isOpen={showPaymentModal}
              onClose={() => {
                setShowPaymentModal(false);
                setModalEntryId(null);
                setModalUserInfo(undefined);
                setModalSubs(undefined);
              }}
              onSuccess={async () => { await loadEntries(page); }}
              entryId={modalEntryId}
              userInfo={modalUserInfo}
              submissions={modalSubs}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BatchEntryAccordion;


