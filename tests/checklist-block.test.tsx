import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChecklistBlock } from '@/components/blocks/ChecklistBlock';
import type { ChecklistBlock as ChecklistBlockType } from '@/types/study';

const mockChecklistBlock: ChecklistBlockType = {
  id: 'chk-test-1',
  type: 'checklist',
  title: 'OSI Model Revision Checklist',
  items: [
    { id: 'item-1', text: 'Understand Physical Layer bit synchronization' },
    { id: 'item-2', text: 'Review Data Link Layer framing and MAC addressing' },
    { id: 'item-3', text: 'Master Network Layer IP packet routing' },
  ],
};

describe('ChecklistBlock Component Suite — Strikethrough Elimination', () => {
  it('renders all checklist items with readable text and progress stats', () => {
    render(
      <ChecklistBlock
        block={mockChecklistBlock}
        progressMap={{ 'item-1': true }}
      />
    );

    expect(screen.getByText('OSI Model Revision Checklist')).toBeDefined();
    expect(screen.getByText('Understand Physical Layer bit synchronization')).toBeDefined();
    expect(screen.getByText('Review Data Link Layer framing and MAC addressing')).toBeDefined();
    expect(screen.getByText('Master Network Layer IP packet routing')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined(); // completed count
  });

  it('ensures completed checklist items NEVER contain line-through class or crossed-out styling', () => {
    const { container } = render(
      <ChecklistBlock
        block={mockChecklistBlock}
        progressMap={{ 'item-1': true, 'item-2': true }}
      />
    );

    // 1. Text elements must not have the line-through class
    const completedText1 = screen.getByText('Understand Physical Layer bit synchronization');
    const completedText2 = screen.getByText('Review Data Link Layer framing and MAC addressing');
    const incompleteText3 = screen.getByText('Master Network Layer IP packet routing');

    expect(completedText1.className).not.toContain('line-through');
    expect(completedText2.className).not.toContain('line-through');
    expect(incompleteText3.className).not.toContain('line-through');

    // 2. Ensure no <del> or <s> elements exist in rendered DOM
    expect(container.querySelectorAll('del').length).toBe(0);
    expect(container.querySelectorAll('s').length).toBe(0);

    // 3. Ensure no element in the component contains line-through in its class attribute
    const elementsWithLineThrough = container.querySelectorAll('.line-through');
    expect(elementsWithLineThrough.length).toBe(0);

    // 4. Verify text color is readable and contrastive (text-[#D4D4D4]) without excessive dimming
    expect(completedText1.className).toContain('text-[#D4D4D4]');
    expect(incompleteText3.className).toContain('text-[#F5F5F5]');
  });

  it('triggers onToggleItem callback with item ID when clicked', () => {
    const onToggleMock = vi.fn();

    render(
      <ChecklistBlock
        block={mockChecklistBlock}
        progressMap={{}}
        onToggleItem={onToggleMock}
      />
    );

    const button = screen.getByText('Understand Physical Layer bit synchronization').closest('button');
    expect(button).not.toBeNull();
    if (button) {
      fireEvent.click(button);
      expect(onToggleMock).toHaveBeenCalledWith('item-1');
    }
  });
});
