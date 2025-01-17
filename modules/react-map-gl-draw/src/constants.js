// @flow
export const MODES = {
  READ_ONLY: 'READ_ONLY',
  SELECT_FEATURE: 'SELECT_FEATURE',
  EDIT_VERTEX: 'EDIT_VERTEX',
  DRAW_POINT: 'DRAW_POINT',
  DRAW_PATH: 'DRAW_PATH',
  DRAW_POLYGON: 'DRAW_POLYGON',
  DRAW_RECTANGLE: 'DRAW_RECTANGLE'
};

export const DRAWING_MODES = [
  MODES.DRAW_POINT,
  MODES.DRAW_PATH,
  MODES.DRAW_POLYGON,
  MODES.DRAW_RECTANGLE
];

export const GEOJSON_TYPE = {
  POINT: 'Point',
  LINE_STRING: 'LineString',
  POLYGON: 'Polygon'
};

export const MODE_TO_GEOJSON_TYPE = {
  [MODES.DRAW_POINT]: GEOJSON_TYPE.POINT,
  [MODES.DRAW_PATH]: GEOJSON_TYPE.LINE_STRING,
  [MODES.DRAW_POLYGON]: GEOJSON_TYPE.POLYGON,
  [MODES.DRAW_RECTANGLE]: GEOJSON_TYPE.POLYGON
};

export const RENDER_TYPE = {
  POINT: 'Point',
  LINE_STRING: 'LineString',
  POLYGON: 'Polygon',
  RECTANGLE: 'Rectangle'
};

export const MODE_TO_RENDER_TYPE = {
  [MODES.DRAW_POINT]: RENDER_TYPE.POINT,
  [MODES.DRAW_PATH]: RENDER_TYPE.LINE_STRING,
  [MODES.DRAW_POLYGON]: RENDER_TYPE.POLYGON,
  [MODES.DRAW_RECTANGLE]: RENDER_TYPE.RECTANGLE
};

export const RENDER_STATE = {
  INACTIVE: 'INACTIVE',
  UNCOMMITTED: 'UNCOMMITTED',
  SELECTED: 'SELECTED',
  HOVERED: 'HOVERED'
};

export const OPERATIONS = {
  NONE: 'NONE',
  SET: 'SET',
  INTERSECT: 'INTERSECT',
  INSERT: 'INSERT'
};

export const STATIC_STYLE = {
  cursor: 'default',
  pointerEvents: 'none'
};
