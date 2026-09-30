import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodePanel } from './code-panel';

describe('CodePanel', () => {
  let fixture: ComponentFixture<CodePanel>;
  let component: CodePanel;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(CodePanel);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('codes', [
      { file: 'a.ts', lines: ['one', 'two', 'three', 'four', 'five'] },
      { file: 'b.ts', lines: ['alpha', 'beta'] },
    ]);
  });

  it('isHighlighted uses the legacy exclusive range', () => {
    fixture.componentRef.setInput('activeLines', { 'a.ts': [2, 5] });

    expect(component.isHighlighted('a.ts', 2)).toBe(false);
    expect(component.isHighlighted('a.ts', 3)).toBe(true);
    expect(component.isHighlighted('a.ts', 4)).toBe(true);
    expect(component.isHighlighted('a.ts', 5)).toBe(false);

    expect(component.isDimmed('a.ts', 2)).toBe(true);
    expect(component.isDimmed('a.ts', 3)).toBe(false);
    expect(component.isDimmed('a.ts', 4)).toBe(false);
    expect(component.isDimmed('a.ts', 5)).toBe(true);
  });

  it('applies no highlight or dimming when no range is present', () => {
    fixture.componentRef.setInput('activeLines', {});
    expect(component.isHighlighted('a.ts', 1)).toBe(false);
    expect(component.isHighlighted('a.ts', 99)).toBe(false);
    expect(component.isDimmed('a.ts', 1)).toBe(false);
    expect(component.isDimmed('a.ts', 99)).toBe(false);

    fixture.componentRef.setInput('activeLines', { 'a.ts': [] });
    expect(component.isHighlighted('a.ts', 1)).toBe(false);
    expect(component.isHighlighted('a.ts', 3)).toBe(false);
    expect(component.isDimmed('a.ts', 1)).toBe(false);
    expect(component.isDimmed('a.ts', 3)).toBe(false);
  });

  it('applies no highlight or dimming for an empty exclusive range', () => {
    fixture.componentRef.setInput('activeLines', { 'a.ts': [1, 1] });

    expect(component.isHighlighted('a.ts', 1)).toBe(false);
    expect(component.isHighlighted('a.ts', 2)).toBe(false);
    expect(component.isDimmed('a.ts', 1)).toBe(false);
    expect(component.isDimmed('a.ts', 2)).toBe(false);
  });

  it('selects the first available mapped file when the active lines input changes', () => {
    fixture.componentRef.setInput('activeLines', {
      'missing.ts': [1, 3],
      'b.ts': [1, 2],
      'a.ts': [1, 4],
    });

    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim()).toBe(
      'b.ts',
    );
    expect(Array.from(element.querySelectorAll('.code-row'), (row) => row.textContent)).toEqual([
      'alpha',
      'beta',
    ]);
  });
});
