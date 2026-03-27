import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { addPlayer as dbAddPlayer } from '../../utils/db';
import './PlayerSelectModal.css';

export interface PlayerSelectModalPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface PlayerSelectModalProps {
  isOpen: boolean;
  players: PlayerSelectModalPlayer[];
  preselectedIds?: string[];
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
  allowAddNew?: boolean;
}

export function PlayerSelectModal({
  isOpen,
  players,
  preselectedIds,
  onConfirm,
  onClose,
  allowAddNew = false,
}: PlayerSelectModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(preselectedIds));
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [adding, setAdding] = useState(false);
  const [localPlayers, setLocalPlayers] = useState<PlayerSelectModalPlayer[]>(players);

  const dialogRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prevIsOpenRef = useRef(false);
  const titleId = useRef(
    `players-modal-title-${
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    }`,
  ).current;
  // Dedicated portal container — avoids removeChild conflicts with RTL cleanup
  const [portalRoot] = useState<HTMLElement>(() => document.createElement('div'));

  useEffect(() => {
    if (!isOpen) return;
    document.body.appendChild(portalRoot);
    return () => {
      if (document.body.contains(portalRoot)) {
        document.body.removeChild(portalRoot);
      }
    };
  }, [isOpen, portalRoot]);

  // Reset state only when modal transitions from closed → open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setLocalPlayers(players);
      setSelectedIds(new Set(preselectedIds ?? []));
      setFilter('');
      setDebouncedFilter('');
      setShowAddForm(false);
      setNewPlayerName('');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, players, preselectedIds]);

  // Debounce filter input (200 ms)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedFilter(filter), 200);
    return () => clearTimeout(id);
  }, [filter]);

  // Move initial focus into the modal when it opens
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => {
      (
        searchInputRef.current ??
        dialogRef.current?.querySelector<HTMLElement>('input[type="checkbox"]')
      )?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Global key handlers: Escape closes, Tab implements focus trap
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, handleGlobalKeyDown]);

  const filteredPlayers = useMemo(() => {
    if (!debouncedFilter) return localPlayers;
    const lower = debouncedFilter.toLowerCase();
    return localPlayers.filter((p) => p.name.toLowerCase().includes(lower));
  }, [localPlayers, debouncedFilter]);

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = useCallback(() => {
    const orderedIds = localPlayers.filter((p) => selectedIds.has(p.id)).map((p) => p.id);
    onConfirm(orderedIds);
  }, [localPlayers, selectedIds, onConfirm]);

  // In-dialog key handling: Arrow keys navigate checkboxes, Enter confirms
  const handleDialogKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const checkboxes = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>('input[type="checkbox"]') ?? [],
      );
      const idx = checkboxes.indexOf(document.activeElement as HTMLElement);
      if (idx === -1) return;
      const next =
        e.key === 'ArrowDown'
          ? Math.min(idx + 1, checkboxes.length - 1)
          : Math.max(idx - 1, 0);
      e.preventDefault();
      checkboxes[next].focus();
    }
    if (e.key === 'Enter') {
      const active = document.activeElement as HTMLElement;
      const tag = active?.tagName?.toLowerCase();
      const isText = tag === 'input' && (active as HTMLInputElement).type !== 'checkbox';
      const isBtn = tag === 'button';
      if (!isText && !isBtn && selectedIds.size > 0) {
        e.preventDefault();
        handleConfirm();
      }
    }
  };

  const handleAddNew = async () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      const player = await dbAddPlayer(trimmed);
      setLocalPlayers((prev) => [...prev, player]);
      setSelectedIds((prev) => new Set([...prev, player.id]));
      setNewPlayerName('');
      setShowAddForm(false);
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="players-modal__backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="players-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="players-modal__header">
          <h2 id={titleId} className="players-modal__title">
            Select players
          </h2>
        </div>

        <div className="players-modal__search">
          <input
            ref={searchInputRef}
            type="text"
            className="players-modal__search-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search players…"
            aria-label="Search players"
          />
          {filter && (
            <button
              type="button"
              className="players-modal__search-clear"
              onClick={() => setFilter('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <ul className="players-modal__list">
          {filteredPlayers.map((player) => (
            <li
              key={player.id}
              className={`players-modal__row${selectedIds.has(player.id) ? ' players-modal__row--selected' : ''}`}
            >
              <label className="players-modal__row-label">
                <input
                  type="checkbox"
                  className="players-modal__checkbox"
                  checked={selectedIds.has(player.id)}
                  onChange={() => togglePlayer(player.id)}
                  aria-label={`Select ${player.name}`}
                />
                {player.avatarUrl && (
                  <img
                    src={player.avatarUrl}
                    alt=""
                    className="players-modal__avatar"
                    aria-hidden="true"
                  />
                )}
                <span className="players-modal__player-name">{player.name}</span>
                <span className="players-modal__player-id" title={player.id}>
                  {player.id.slice(0, 8)}…
                </span>
              </label>
            </li>
          ))}
          {filteredPlayers.length === 0 && (
            <li className="players-modal__empty">No players found.</li>
          )}
        </ul>

        {allowAddNew && (
          <div className="players-modal__add-section">
            {!showAddForm ? (
              <button
                type="button"
                className="players-modal__add-trigger"
                onClick={() => setShowAddForm(true)}
              >
                + Add player
              </button>
            ) : (
              <div className="players-modal__add-form">
                <input
                  type="text"
                  className="players-modal__add-input"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNew();
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAddForm(false);
                      setNewPlayerName('');
                    }
                  }}
                  placeholder="Player name"
                  aria-label="New player name"
                  autoFocus
                />
                <button
                  type="button"
                  className="players-modal__add-save"
                  onClick={handleAddNew}
                  disabled={!newPlayerName.trim() || adding}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="players-modal__add-cancel"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewPlayerName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        <div className="players-modal__footer">
          <button type="button" className="players-modal__cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="players-modal__confirm"
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
          >
            Confirm ({selectedIds.size})
          </button>
        </div>

        {/* Visually hidden live region announces selection count to screen readers */}
        <div className="players-modal__live" aria-live="polite" aria-atomic="true">
          {selectedIds.size} {selectedIds.size === 1 ? 'player' : 'players'} selected
        </div>
      </div>
    </div>,
    portalRoot,
  );
}
