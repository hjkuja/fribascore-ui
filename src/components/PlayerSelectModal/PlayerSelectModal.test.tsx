import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { act, fireEvent, render, screen } from '@testing-library/react';

// Must be declared before the component import so Bun hoists it above the
// module loader for "../../utils/db".
const mockAddPlayer = mock(async (name: string) => ({ id: 'mocked-new-id', name }));
mock.module('../../utils/db', () => ({
  addPlayer: mockAddPlayer,
  getPlayers: mock(async () => []),
  savePlayer: mock(async () => {}),
}));

import { PlayerSelectModal } from './PlayerSelectModal';

const PLAYERS = [
  { id: 'player-1', name: 'Alice' },
  { id: 'player-2', name: 'Bob' },
  { id: 'player-3', name: 'Charlie' },
];

const noop = () => {};

describe('PlayerSelectModal', () => {
  let onConfirm: ReturnType<typeof mock>;
  let onClose: ReturnType<typeof mock>;

  beforeEach(() => {
    onConfirm = mock(noop);
    onClose = mock(noop);
    mockAddPlayer.mockClear();
  });

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  test('renders dialog when isOpen is true', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Select players')).toBeDefined();
  });

  test('renders nothing when isOpen is false', () => {
    render(
      <PlayerSelectModal isOpen={false} players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('Cancel button calls onClose', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Escape key calls onClose', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('clicking the backdrop calls onClose', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    const backdrop = document.querySelector('.players-modal__backdrop') as HTMLElement;
    // Simulate a click whose target is the backdrop itself (not a child)
    fireEvent.click(backdrop, { target: backdrop });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // Player list
  // ---------------------------------------------------------------------------

  test('displays all players', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
    expect(screen.getByText('Charlie')).toBeDefined();
  });

  test('shows "No players found." when list is empty', () => {
    render(<PlayerSelectModal isOpen players={[]} onConfirm={onConfirm} onClose={onClose} />);
    expect(screen.getByText('No players found.')).toBeDefined();
  });

  test('truncated UUID metadata is shown for each player', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    // Each player row should show first 8 chars of id followed by ellipsis
    expect(screen.getByTitle('player-1')).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Search / filter
  // ---------------------------------------------------------------------------

  test('search input is rendered', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    expect(screen.getByLabelText('Search players')).toBeDefined();
  });

  test('filters players after debounce (200 ms)', async () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText('Search players'), { target: { value: 'al' } });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
    });

    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.queryByText('Bob')).toBeNull();
    expect(screen.queryByText('Charlie')).toBeNull();
  });

  test('clear button appears when filter has text', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    expect(screen.queryByLabelText('Clear search')).toBeNull();
    fireEvent.change(screen.getByLabelText('Search players'), { target: { value: 'x' } });
    expect(screen.getByLabelText('Clear search')).toBeDefined();
  });

  test('clear button resets the filter', async () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText('Search players'), { target: { value: 'al' } });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
    });
    expect(screen.queryByText('Bob')).toBeNull();

    fireEvent.click(screen.getByLabelText('Clear search'));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
    });
    expect(screen.getByText('Bob')).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Select / deselect
  // ---------------------------------------------------------------------------

  test('checkboxes start unchecked when no preselectedIds', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    const checkbox = screen.getByLabelText('Select Alice') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  test('preselectedIds are checked on open', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1']}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    expect((screen.getByLabelText('Select Alice') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Select Bob') as HTMLInputElement).checked).toBe(false);
  });

  test('unknown preselectedIds (not in players list) are ignored on open', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['unknown-id', 'player-1']}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    // Only Alice (player-1) should be checked; the unknown ID is silently dropped
    expect((screen.getByLabelText('Select Alice') as HTMLInputElement).checked).toBe(true);
    // Confirm button should show count of 1, not 2
    expect((screen.getByText('Confirm (1)') as HTMLButtonElement).disabled).toBe(false);
  });

  test('all-unknown preselectedIds leave nothing selected and Confirm disabled', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['unknown-id']}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    expect((screen.getByText('Confirm (0)') as HTMLButtonElement).disabled).toBe(true);
  });

  test('clicking a checkbox selects the player', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    const checkbox = screen.getByLabelText('Select Alice') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  test('clicking a checked checkbox deselects the player', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1']}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    const checkbox = screen.getByLabelText('Select Alice') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Confirm button
  // ---------------------------------------------------------------------------

  test('Confirm button is disabled when nothing is selected', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    const btn = screen.getByText('Confirm (0)') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  test('Confirm button is enabled when at least one player is selected', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1']}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    const btn = screen.getByText('Confirm (1)') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  test('Confirm button shows selected count', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1', 'player-2']}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    expect(screen.getByText('Confirm (2)')).toBeDefined();
  });

  test('onConfirm is called with selected IDs in players-list order', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-3', 'player-1']} // deliberately reversed
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText(/Confirm/));
    expect(onConfirm).toHaveBeenCalledWith(['player-1', 'player-3']);
  });

  test('onConfirm includes newly toggled players', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Select Bob'));
    fireEvent.click(screen.getByText(/Confirm/));
    expect(onConfirm).toHaveBeenCalledWith(['player-2']);
  });

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------

  test('Space toggles checkbox when it is focused', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    const checkbox = screen.getByLabelText('Select Alice') as HTMLInputElement;
    checkbox.focus();
    fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' });
    // The browser fires a click on Space for checkboxes; simulate that:
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  test('ArrowDown moves focus to the next checkbox', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    checkboxes[0].focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(checkboxes[1]);
  });

  test('ArrowUp moves focus to the previous checkbox', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    checkboxes[2].focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(checkboxes[1]);
  });

  test('ArrowDown does not go past the last checkbox', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    const last = checkboxes[checkboxes.length - 1];
    last.focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(last);
  });

  test('ArrowUp does not go before the first checkbox', () => {
    render(<PlayerSelectModal isOpen players={PLAYERS} onConfirm={onConfirm} onClose={onClose} />);
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    const first = checkboxes[0];
    first.focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(first);
  });

  // ---------------------------------------------------------------------------
  // allowAddNew — show / hide
  // ---------------------------------------------------------------------------

  test('does not show "+ Add player" when allowAddNew is false', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        onConfirm={onConfirm}
        onClose={onClose}
        allowAddNew={false}
      />,
    );
    expect(screen.queryByText('+ Add player')).toBeNull();
  });

  test('shows "+ Add player" when allowAddNew is true', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        onConfirm={onConfirm}
        onClose={onClose}
        allowAddNew
      />,
    );
    expect(screen.getByText('+ Add player')).toBeDefined();
  });

  test('clicking "+ Add player" reveals the inline form', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        onConfirm={onConfirm}
        onClose={onClose}
        allowAddNew
      />,
    );
    fireEvent.click(screen.getByText('+ Add player'));
    expect(screen.getByLabelText('New player name')).toBeDefined();
    expect(screen.getByText('Save')).toBeDefined();
  });

  test('Cancel inside add-form hides the form', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        onConfirm={onConfirm}
        onClose={onClose}
        allowAddNew
      />,
    );
    fireEvent.click(screen.getByText('+ Add player'));
    fireEvent.click(screen.getByText('Cancel', { selector: '.players-modal__add-cancel' }));
    expect(screen.queryByLabelText('New player name')).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // allowAddNew — save new player
  // ---------------------------------------------------------------------------

  test('saving a new player adds them to the list and selects them', async () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        onConfirm={onConfirm}
        onClose={onClose}
        allowAddNew
      />,
    );
    fireEvent.click(screen.getByText('+ Add player'));
    fireEvent.change(screen.getByLabelText('New player name'), {
      target: { value: 'Diana' },
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(mockAddPlayer).toHaveBeenCalledWith('Diana');
    // New player should appear in the list
    expect(screen.getByText('Diana')).toBeDefined();
    // And be selected
    const checkbox = screen.getByLabelText('Select Diana') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    // Add-form should be hidden again
    expect(screen.queryByLabelText('New player name')).toBeNull();
  });

  test('pressing Enter in the add-form input saves the player', async () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        onConfirm={onConfirm}
        onClose={onClose}
        allowAddNew
      />,
    );
    fireEvent.click(screen.getByText('+ Add player'));
    const input = screen.getByLabelText('New player name');
    fireEvent.change(input, { target: { value: 'Eve' } });
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    expect(mockAddPlayer).toHaveBeenCalledWith('Eve');
    expect(screen.getByText('Eve')).toBeDefined();
  });

  test('newly added player is included in onConfirm result', async () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        onConfirm={onConfirm}
        onClose={onClose}
        allowAddNew
      />,
    );
    fireEvent.click(screen.getByText('+ Add player'));
    fireEvent.change(screen.getByLabelText('New player name'), { target: { value: 'Frank' } });
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    fireEvent.click(screen.getByText(/Confirm/));
    expect(onConfirm).toHaveBeenCalledWith(['mocked-new-id']);
  });

  // ---------------------------------------------------------------------------
  // State reset on re-open
  // ---------------------------------------------------------------------------

  test('selection is reset when the modal is re-opened', () => {
    const { rerender } = render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1']}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    // Deselect Alice
    fireEvent.click(screen.getByLabelText('Select Alice'));
    // Close the modal
    rerender(
      <PlayerSelectModal
        isOpen={false}
        players={PLAYERS}
        preselectedIds={['player-1']}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    // Re-open the modal
    rerender(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1']}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    // Alice should be pre-selected again
    expect((screen.getByLabelText('Select Alice') as HTMLInputElement).checked).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // maxSelectable — counter and disabled checkboxes
  // ---------------------------------------------------------------------------

  test('shows X/max counter when maxSelectable is provided', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1']}
        onConfirm={onConfirm}
        onClose={onClose}
        maxSelectable={3}
      />,
    );
    expect(screen.getByLabelText('1 of 3 players selected')).toBeDefined();
  });

  test('does not show counter when maxSelectable is not provided', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1']}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    expect(screen.queryByLabelText(/of .* players selected/)).toBeNull();
  });

  test('counter reflects current selection count', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1', 'player-2']}
        onConfirm={onConfirm}
        onClose={onClose}
        maxSelectable={3}
      />,
    );
    expect(screen.getByLabelText('2 of 3 players selected')).toBeDefined();
  });

  test('unselected checkboxes are disabled when max is reached', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1', 'player-2']}
        onConfirm={onConfirm}
        onClose={onClose}
        maxSelectable={2}
      />,
    );
    // Charlie is not selected — should be disabled
    const charlieCheckbox = screen.getByLabelText('Select Charlie') as HTMLInputElement;
    expect(charlieCheckbox.disabled).toBe(true);
  });

  test('selected checkboxes remain enabled when max is reached', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1', 'player-2']}
        onConfirm={onConfirm}
        onClose={onClose}
        maxSelectable={2}
      />,
    );
    const aliceCheckbox = screen.getByLabelText('Select Alice') as HTMLInputElement;
    const bobCheckbox = screen.getByLabelText('Select Bob') as HTMLInputElement;
    expect(aliceCheckbox.disabled).toBe(false);
    expect(bobCheckbox.disabled).toBe(false);
  });

  test('checkboxes are re-enabled after deselecting a player below max', () => {
    render(
      <PlayerSelectModal
        isOpen
        players={PLAYERS}
        preselectedIds={['player-1', 'player-2']}
        onConfirm={onConfirm}
        onClose={onClose}
        maxSelectable={2}
      />,
    );
    // Deselect Alice to go back under the limit
    fireEvent.click(screen.getByLabelText('Select Alice'));
    const charlieCheckbox = screen.getByLabelText('Select Charlie') as HTMLInputElement;
    expect(charlieCheckbox.disabled).toBe(false);
  });
});
