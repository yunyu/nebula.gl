// @flow

// Represents an edit action, i.e. a suggestion to update the data based on user interaction events
export type EditAction<TData> = {
  updatedData: TData,
  editType: string,
  affectedIndexes: number[],
  editContext: any
};

// Represents an object "picked" from the screen. This usually reflects an object under the cursor
export type Pick = {
  object: any,
  index: number,
  isGuide: boolean
};

// Represents a click event
export type ClickEvent = {
  picks: Pick[],
  screenCoords: Position,
  mapCoords: Position,
  sourceEvent: any
};

// Represents a double-click event
export type DoubleClickEvent = {
  mapCoords: Position,
  sourceEvent: any
};

// Represents an event that occurs when the pointer goes down and the cursor starts moving
export type StartDraggingEvent = {
  picks: Pick[],
  screenCoords: Position,
  mapCoords: Position,
  pointerDownScreenCoords: Position,
  pointerDownMapCoords: Position,
  sourceEvent: any
};

// Represents an event that occurs after the pointer goes down, moves some, then the pointer goes back up
export type StopDraggingEvent = {
  picks: Pick[],
  screenCoords: Position,
  mapCoords: Position,
  pointerDownScreenCoords: Position,
  pointerDownMapCoords: Position,
  sourceEvent: any
};

// Represents an event that occurs every time the pointer moves
export type PointerMoveEvent = {
  screenCoords: Position,
  mapCoords: Position,
  picks: Pick[],
  isDragging: boolean,
  pointerDownPicks: ?(Pick[]),
  pointerDownScreenCoords: ?Position,
  pointerDownMapCoords: ?Position,
  sourceEvent: any
};

export type ModeState<TData, TGuides> = {
  // The data being edited, this can be an array or an object
  data: TData,

  // Additional configuration for this mode
  modeConfig: any,

  // The indexes of the selected features
  selectedIndexes: number[],

  // Features that can be used as a guide for editing the data
  guides: ?TGuides,

  // The cursor type, as a [CSS Cursor](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor)
  cursor: string,

  // Callback used to notify applications of an edit action
  onEdit: (editAction: EditAction<TData>) => void,

  // Callback used to update guides
  onUpdateGuides: (guides: ?TGuides) => void,

  // Callback used to update cursor
  onUpdateCursor: (cursor: string) => void
};

export class EditMode<TData, TGuides> {
  state: ModeState<TData, TGuides>;

  getState(): ModeState<TData, TGuides> {
    return this.state;
  }

  updateState(state: ModeState<TData, TGuides>) {
    const changedEvents: (() => void)[] = [];
    if (this.state && this.state.data !== state.data) {
      changedEvents.push(this.onDataChanged);
    }
    if (this.state && this.state.modeConfig !== state.modeConfig) {
      changedEvents.push(this.onModeConfigChanged);
    }
    if (this.state && this.state.selectedIndexes !== state.selectedIndexes) {
      changedEvents.push(this.onSelectedIndexesChanged);
    }
    if (this.state && this.state.guides !== state.guides) {
      changedEvents.push(this.onGuidesChanged);
    }
    this.state = state;

    changedEvents.forEach(fn => fn.bind(this)());
  }

  // Overridable user interaction handlers
  handleClick2(event: ClickEvent): void {}
  handlePointerMove2(event: PointerMoveEvent): void {}
  handleStartDragging2(event: StartDraggingEvent): void {}
  handleStopDragging2(event: StopDraggingEvent): void {}

  // Convenience functions to handle state changes
  onDataChanged(): void {}
  onModeConfigChanged(): void {}
  onSelectedIndexesChanged(): void {}
  onGuidesChanged(): void {}

  // Convenience functions to access state
  getModeConfig(): any {
    return this.state.modeConfig;
  }
  getSelectedIndexes(): number[] {
    return this.state.selectedIndexes;
  }
  getGuides(): ?TGuides {
    return this.state && this.state.guides;
  }
  getCursor(): string {
    return this.state && this.state.cursor;
  }
  onEdit(editAction: EditAction<TData>): void {
    this.state.onEdit(editAction);
  }
  onUpdateGuides(guides: ?TGuides): void {
    this.state.onUpdateGuides(guides);
  }
  onUpdateCursor(cursor: string): void {
    this.state.onUpdateCursor(cursor);
  }
}
