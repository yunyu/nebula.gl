// @flow

import { ModeHandler } from './mode-handler.js';

export class ViewHandler extends ModeHandler {
  getCursorAdapter({ isDragging }: { isDragging: boolean }): string {
    return isDragging ? 'grabbing' : 'grab';
  }
}
