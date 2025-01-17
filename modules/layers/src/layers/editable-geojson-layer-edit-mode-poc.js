// @flow
/* eslint-env browser */

import { GeoJsonLayer, ScatterplotLayer, IconLayer } from '@deck.gl/layers';

import { ViewMode, DrawPolygonMode } from '@nebula.gl/edit-modes';
import type {
  EditAction,
  ClickEvent,
  StartDraggingEvent,
  StopDraggingEvent,
  PointerMoveEvent,
  GeoJsonEditMode,
  FeatureCollection
} from '@nebula.gl/edit-modes';
import EditableLayer from './editable-layer-edit-mode-poc.js';

const DEFAULT_LINE_COLOR = [0x0, 0x0, 0x0, 0xff];
const DEFAULT_FILL_COLOR = [0x0, 0x0, 0x0, 0x90];
const DEFAULT_SELECTED_LINE_COLOR = [0x90, 0x90, 0x90, 0xff];
const DEFAULT_SELECTED_FILL_COLOR = [0x90, 0x90, 0x90, 0x90];
const DEFAULT_EDITING_EXISTING_POINT_COLOR = [0xc0, 0x0, 0x0, 0xff];
const DEFAULT_EDITING_INTERMEDIATE_POINT_COLOR = [0x0, 0x0, 0x0, 0x80];
const DEFAULT_EDITING_SNAP_POINT_COLOR = [0x7c, 0x00, 0xc0, 0xff];
const DEFAULT_EDITING_EXISTING_POINT_RADIUS = 5;
const DEFAULT_EDITING_INTERMEDIATE_POINT_RADIUS = 3;
const DEFAULT_EDITING_SNAP_POINT_RADIUS = 7;

function getEditHandleColor(handle) {
  switch (handle.type) {
    case 'existing':
      return DEFAULT_EDITING_EXISTING_POINT_COLOR;
    case 'snap':
      return DEFAULT_EDITING_SNAP_POINT_COLOR;
    case 'intermediate':
    default:
      return DEFAULT_EDITING_INTERMEDIATE_POINT_COLOR;
  }
}

function getEditHandleRadius(handle) {
  switch (handle.type) {
    case 'existing':
      return DEFAULT_EDITING_EXISTING_POINT_RADIUS;
    case 'snap':
      return DEFAULT_EDITING_SNAP_POINT_RADIUS;
    case 'intermediate':
    default:
      return DEFAULT_EDITING_INTERMEDIATE_POINT_RADIUS;
  }
}

const defaultProps = {
  mode: 'modify',

  // Edit and interaction events
  onEdit: () => {},

  pickable: true,
  pickingRadius: 10,
  fp64: false,
  filled: true,
  stroked: true,
  lineWidthScale: 1,
  lineWidthMinPixels: 1,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineWidthUnits: 'meters',
  lineJointRounded: false,
  lineMiterLimit: 4,
  pointRadiusScale: 1,
  pointRadiusMinPixels: 2,
  pointRadiusMaxPixels: Number.MAX_SAFE_INTEGER,
  lineDashJustified: false,
  getLineColor: (feature, isSelected, mode) =>
    isSelected ? DEFAULT_SELECTED_LINE_COLOR : DEFAULT_LINE_COLOR,
  getFillColor: (feature, isSelected, mode) =>
    isSelected ? DEFAULT_SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR,
  getRadius: f =>
    (f && f.properties && f.properties.radius) || (f && f.properties && f.properties.size) || 1,
  getLineWidth: f => (f && f.properties && f.properties.lineWidth) || 1,
  getLineDashArray: (feature, isSelected, mode) =>
    isSelected && mode !== 'view' ? [7, 4] : [0, 0],

  // Tentative feature rendering
  getTentativeLineDashArray: (f, mode) => [7, 4],
  getTentativeLineColor: (f, mode) => DEFAULT_SELECTED_LINE_COLOR,
  getTentativeFillColor: (f, mode) => DEFAULT_SELECTED_FILL_COLOR,
  getTentativeLineWidth: (f, mode) => (f && f.properties && f.properties.lineWidth) || 1,

  editHandleType: 'point',
  editHandleParameters: {},
  editHandleLayerProps: {},

  // point handles
  editHandlePointRadiusScale: 1,
  editHandlePointOutline: false,
  editHandlePointStrokeWidth: 1,
  editHandlePointRadiusMinPixels: 4,
  editHandlePointRadiusMaxPixels: 8,
  getEditHandlePointColor: getEditHandleColor,
  getEditHandlePointRadius: getEditHandleRadius,

  // icon handles
  editHandleIconAtlas: null,
  editHandleIconMapping: null,
  editHandleIconSizeScale: 1,
  getEditHandleIcon: handle => handle.type,
  getEditHandleIconSize: 10,
  getEditHandleIconColor: getEditHandleColor,
  getEditHandleIconAngle: 0,

  // Mode handlers
  modeHandlers: {
    view: new ViewMode(),
    drawPolygon: new DrawPolygonMode()
  }
};

type Props = {
  mode: string,
  modeHandlers: { [mode: string]: GeoJsonEditMode },
  onEdit: (EditAction<FeatureCollection>) => void,
  // TODO: type the rest
  [string]: any
};

// type State = {
//   modeHandler: EditableFeatureCollection,
//   tentativeFeature: ?Feature,
//   editHandles: any[],
//   selectedFeatures: Feature[]
// };

// eslint-disable-next-line camelcase
export default class EditableGeoJsonLayer_EDIT_MODE_POC extends EditableLayer {
  // state: State;
  // props: Props;
  // setState: ($Shape<State>) => void;

  renderLayers() {
    const subLayerProps = this.getSubLayerProps({
      id: 'geojson',

      // Proxy most GeoJsonLayer props as-is
      data: this.props.data,
      fp64: this.props.fp64,
      filled: this.props.filled,
      stroked: this.props.stroked,
      lineWidthScale: this.props.lineWidthScale,
      lineWidthMinPixels: this.props.lineWidthMinPixels,
      lineWidthMaxPixels: this.props.lineWidthMaxPixels,
      lineWidthUnits: this.props.lineWidthUnits,
      lineJointRounded: this.props.lineJointRounded,
      lineMiterLimit: this.props.lineMiterLimit,
      pointRadiusScale: this.props.pointRadiusScale,
      pointRadiusMinPixels: this.props.pointRadiusMinPixels,
      pointRadiusMaxPixels: this.props.pointRadiusMaxPixels,
      lineDashJustified: this.props.lineDashJustified,
      getLineColor: this.selectionAwareAccessor(this.props.getLineColor),
      getFillColor: this.selectionAwareAccessor(this.props.getFillColor),
      getRadius: this.selectionAwareAccessor(this.props.getRadius),
      getLineWidth: this.selectionAwareAccessor(this.props.getLineWidth),
      getLineDashArray: this.selectionAwareAccessor(this.props.getLineDashArray),

      updateTriggers: {
        getLineColor: [this.props.selectedFeatureIndexes, this.props.mode],
        getFillColor: [this.props.selectedFeatureIndexes, this.props.mode],
        getRadius: [this.props.selectedFeatureIndexes, this.props.mode],
        getLineWidth: [this.props.selectedFeatureIndexes, this.props.mode],
        getLineDashArray: [this.props.selectedFeatureIndexes, this.props.mode]
      }
    });

    let layers: any = [new GeoJsonLayer(subLayerProps)];

    layers = layers.concat(this.createTentativeLayers());
    layers = layers.concat(this.createEditHandleLayers());

    return layers;
  }

  initializeState() {
    super.initializeState();

    this.setState({
      cursor: 'grab',
      selectedFeatures: [],
      editHandles: []
    });
  }

  setState(partialState: any) {
    super.setState(partialState);
    this.updateModeState(this.props);
  }

  // TODO: figure out how to properly update state from an outside event handler
  shouldUpdateState() {
    return true;
  }

  // shouldUpdateState(opts: Object) {
  //   let shouldUpdateState = super.shouldUpdateState(opts);

  //   if (opts.changeFlags.stateChanged) {
  //     shouldUpdateState = true;

  //     // const needsRedraw = this.getNeedsRedraw && this.getNeedsRedraw()
  //     // console.log(
  //     //   'calling modeHandler.updateState',
  //     //   this.getNeedsRedraw(),
  //     //   this.internalState.needsRedraw,
  //     //   JSON.stringify(changeFlags)
  //     // );

  //     this.updateModeState(this.props);
  //   }
  //   return shouldUpdateState;
  // }

  updateState({
    props,
    oldProps,
    changeFlags
  }: {
    props: Props,
    oldProps: Props,
    changeFlags: any
  }) {
    super.updateState({ props, changeFlags });

    let modeHandler: GeoJsonEditMode = this.state.modeHandler;
    if (changeFlags.propsOrDataChanged) {
      if (props.modeHandlers !== oldProps.modeHandlers || props.mode !== oldProps.mode) {
        modeHandler = props.modeHandlers[props.mode];

        if (!modeHandler) {
          console.warn(`No handler configured for mode ${props.mode}`); // eslint-disable-line no-console,no-undef
          // Use default mode handler
          modeHandler = new ViewMode();
        }

        if (modeHandler !== this.state.modeHandler) {
          this.setState({ modeHandler });
        }
      }
    }

    let selectedFeatures = [];
    if (Array.isArray(props.selectedFeatureIndexes)) {
      // TODO: needs improved testing, i.e. checking for duplicates, NaNs, out of range numbers, ...
      selectedFeatures = props.selectedFeatureIndexes.map(elem => props.data.features[elem]);
    }

    this.setState({ selectedFeatures });
  }

  updateModeState(props: Props) {
    const modeHandler = props.modeHandlers[props.mode];

    modeHandler.updateState({
      modeConfig: props.modeConfig,
      data: props.data,
      selectedIndexes: props.selectedFeatureIndexes,
      guides: this.state && {
        tentativeFeature: this.state.tentativeFeature,
        editHandles: this.state.editHandles
      },
      cursor: this.state.cursor,
      onEdit: (editAction: EditAction<FeatureCollection>) => {
        props.onEdit(editAction);
      },
      onUpdateGuides: guides => {
        if (guides) {
          this.setState({
            tentativeFeature: guides.tentativeFeature,
            editHandles: guides.editHandles
          });
        } else {
          this.setState({
            tentativeFeature: null,
            editHandles: null
          });
        }
        this.setLayerNeedsUpdate();
        this.setNeedsRedraw();
      },
      onUpdateCursor: cursor => {
        this.setState({ cursor });
      }
    });
  }

  selectionAwareAccessor(accessor: any) {
    if (typeof accessor !== 'function') {
      return accessor;
    }
    return (feature: Object) => accessor(feature, this.isFeatureSelected(feature), this.props.mode);
  }

  isFeatureSelected(feature: Object) {
    if (!this.props.data || !this.props.selectedFeatureIndexes) {
      return false;
    }
    if (!this.props.selectedFeatureIndexes.length) {
      return false;
    }
    const featureIndex = this.props.data.features.indexOf(feature);
    return this.props.selectedFeatureIndexes.includes(featureIndex);
  }

  getPickingInfo({ info, sourceLayer }: Object) {
    if (sourceLayer.id.endsWith('-edit-handles')) {
      // If user is picking an editing handle, add additional data to the info
      info.isGuide = true;
    }

    return info;
  }

  createEditHandleLayers() {
    if (!this.state.editHandles.length) {
      return [];
    }

    const sharedProps = {
      id: `${this.props.editHandleType.layerName || this.props.editHandleType}-edit-handles`,
      data: this.state.editHandles,
      fp64: this.props.fp64,

      parameters: this.props.editHandleParameters,
      ...this.props.editHandleLayerProps
    };

    let layer;

    switch (this.props.editHandleType) {
      case 'icon':
        layer = new IconLayer(
          this.getSubLayerProps({
            ...sharedProps,
            iconAtlas: this.props.editHandleIconAtlas,
            iconMapping: this.props.editHandleIconMapping,
            sizeScale: this.props.editHandleIconSizeScale,
            getIcon: this.props.getEditHandleIcon,
            getSize: this.props.getEditHandleIconSize,
            getColor: this.props.getEditHandleIconColor,
            getAngle: this.props.getEditHandleIconAngle,

            getPosition: d => d.position
          })
        );
        break;

      case 'point':
        layer = new ScatterplotLayer(
          this.getSubLayerProps({
            ...sharedProps,

            // Proxy editing point props
            radiusScale: this.props.editHandlePointRadiusScale,
            outline: this.props.editHandlePointOutline,
            strokeWidth: this.props.editHandlePointStrokeWidth,
            radiusMinPixels: this.props.editHandlePointRadiusMinPixels,
            radiusMaxPixels: this.props.editHandlePointRadiusMaxPixels,
            getRadius: this.props.getEditHandlePointRadius,
            getColor: this.props.getEditHandlePointColor
          })
        );
        break;

      default:
        if (typeof this.props.editHandleType === 'function') {
          const EditHandleType = this.props.editHandleType;
          layer = new EditHandleType(
            this.getSubLayerProps({
              ...sharedProps,

              // Proxy editing point props
              radiusScale: this.props.editHandlePointRadiusScale,
              outline: this.props.editHandlePointOutline,
              strokeWidth: this.props.editHandlePointStrokeWidth,
              radiusMinPixels: this.props.editHandlePointRadiusMinPixels,
              radiusMaxPixels: this.props.editHandlePointRadiusMaxPixels,
              getRadius: this.props.getEditHandlePointRadius,
              getColor: this.props.getEditHandlePointColor
            })
          );
        }
        break;
    }

    return [layer];
  }

  createTentativeLayers() {
    if (!this.state.tentativeFeature) {
      return [];
    }

    const layer = new GeoJsonLayer(
      this.getSubLayerProps({
        id: 'tentative',
        data: this.state.tentativeFeature,
        fp64: this.props.fp64,
        pickable: false,
        stroked: true,
        autoHighlight: false,
        lineWidthScale: this.props.lineWidthScale,
        lineWidthMinPixels: this.props.lineWidthMinPixels,
        lineWidthMaxPixels: this.props.lineWidthMaxPixels,
        lineWidthUnits: this.props.lineWidthUnits,
        lineJointRounded: this.props.lineJointRounded,
        lineMiterLimit: this.props.lineMiterLimit,
        pointRadiusScale: this.props.editHandlePointRadiusScale,
        outline: this.props.editHandlePointOutline,
        strokeWidth: this.props.editHandlePointStrokeWidth,
        pointRadiusMinPixels: this.props.editHandlePointRadiusMinPixels,
        pointRadiusMaxPixels: this.props.editHandlePointRadiusMaxPixels,
        getRadius: this.props.getEditHandlePointRadius,
        getLineColor: feature => this.props.getTentativeLineColor(feature, this.props.mode),
        getLineWidth: feature => this.props.getTentativeLineWidth(feature, this.props.mode),
        getFillColor: feature => this.props.getTentativeFillColor(feature, this.props.mode),
        getLineDashArray: feature =>
          this.props.getTentativeLineDashArray(
            feature,
            this.state.selectedFeatures[0],
            this.props.mode
          )
      })
    );

    return [layer];
  }

  onLayerClick(event: ClickEvent) {
    this.getActiveModeHandler().handleClick(event);
  }

  onStartDragging(event: StartDraggingEvent) {
    this.getActiveModeHandler().handleStartDragging(event);
  }

  onStopDragging(event: StopDraggingEvent) {
    this.getActiveModeHandler().handleStopDragging(event);
  }

  onPointerMove(event: PointerMoveEvent) {
    this.getActiveModeHandler().handlePointerMove(event);
  }

  getCursor({ isDragging }: { isDragging: boolean }) {
    return this.state.cursor;
  }

  getActiveModeHandler(): GeoJsonEditMode {
    return this.state.modeHandler;
  }
}

// eslint-disable-next-line camelcase
EditableGeoJsonLayer_EDIT_MODE_POC.layerName = 'EditableGeoJsonLayer_EDIT_MODE_POC';
// eslint-disable-next-line camelcase
EditableGeoJsonLayer_EDIT_MODE_POC.defaultProps = defaultProps;
