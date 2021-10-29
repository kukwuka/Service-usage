// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/parcel-bundler/src/builtins/_empty.js":[function(require,module,exports) {

},{}],"node_modules/dxf-parser/src/DxfArrayScanner.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DxfArrayScanner;

/**
 * DxfArrayScanner
 *
 * Based off the AutoCad 2012 DXF Reference
 * http://images.autodesk.com/adsk/files/autocad_2012_pdf_dxf-reference_enu.pdf
 *
 * Reads through an array representing lines of a dxf file. Takes an array and
 * provides an easy interface to extract group code and value pairs.
 * @param data - an array where each element represents a line in the dxf file
 * @constructor
 */
function DxfArrayScanner(data) {
  this._pointer = 0;
  this._data = data;
  this._eof = false;
}
/**
 * Gets the next group (code, value) from the array. A group is two consecutive elements
 * in the array. The first is the code, the second is the value.
 * @returns {{code: Number}|*}
 */


DxfArrayScanner.prototype.next = function () {
  var group;

  if (!this.hasNext()) {
    if (!this._eof) throw new Error('Unexpected end of input: EOF group not read before end of file. Ended on code ' + this._data[this._pointer]);else throw new Error('Cannot call \'next\' after EOF group has been read');
  }

  group = {
    code: parseInt(this._data[this._pointer])
  };
  this._pointer++;
  group.value = parseGroupValue(group.code, this._data[this._pointer].trim());
  this._pointer++;
  if (group.code === 0 && group.value === 'EOF') this._eof = true;
  this.lastReadGroup = group;
  return group;
};

DxfArrayScanner.prototype.peek = function () {
  if (!this.hasNext()) {
    if (!this._eof) throw new Error('Unexpected end of input: EOF group not read before end of file. Ended on code ' + this._data[this._pointer]);else throw new Error('Cannot call \'next\' after EOF group has been read');
  }

  var group = {
    code: parseInt(this._data[this._pointer])
  };
  group.value = parseGroupValue(group.code, this._data[this._pointer + 1].trim());
  return group;
};

DxfArrayScanner.prototype.rewind = function (numberOfGroups) {
  numberOfGroups = numberOfGroups || 1;
  this._pointer = this._pointer - numberOfGroups * 2;
};
/**
 * Returns true if there is another code/value pair (2 elements in the array).
 * @returns {boolean}
 */


DxfArrayScanner.prototype.hasNext = function () {
  // Check if we have read EOF group code
  if (this._eof) {
    return false;
  } // We need to be sure there are two lines available


  if (this._pointer > this._data.length - 2) {
    return false;
  }

  return true;
};
/**
 * Returns true if the scanner is at the end of the array
 * @returns {boolean}
 */


DxfArrayScanner.prototype.isEOF = function () {
  return this._eof;
};
/**
 * Parse a value to its proper type.
 * See pages 3 - 10 of the AutoCad DXF 2012 reference given at the top of this file
 *
 * @param code
 * @param value
 * @returns {*}
 */


function parseGroupValue(code, value) {
  if (code <= 9) return value;
  if (code >= 10 && code <= 59) return parseFloat(value);
  if (code >= 60 && code <= 99) return parseInt(value);
  if (code >= 100 && code <= 109) return value;
  if (code >= 110 && code <= 149) return parseFloat(value);
  if (code >= 160 && code <= 179) return parseInt(value);
  if (code >= 210 && code <= 239) return parseFloat(value);
  if (code >= 270 && code <= 289) return parseInt(value);
  if (code >= 290 && code <= 299) return parseBoolean(value);
  if (code >= 300 && code <= 369) return value;
  if (code >= 370 && code <= 389) return parseInt(value);
  if (code >= 390 && code <= 399) return value;
  if (code >= 400 && code <= 409) return parseInt(value);
  if (code >= 410 && code <= 419) return value;
  if (code >= 420 && code <= 429) return parseInt(value);
  if (code >= 430 && code <= 439) return value;
  if (code >= 440 && code <= 459) return parseInt(value);
  if (code >= 460 && code <= 469) return parseFloat(value);
  if (code >= 470 && code <= 481) return value;
  if (code === 999) return value;
  if (code >= 1000 && code <= 1009) return value;
  if (code >= 1010 && code <= 1059) return parseFloat(value);
  if (code >= 1060 && code <= 1071) return parseInt(value);
  console.log('WARNING: Group code does not have a defined type: %j', {
    code: code,
    value: value
  });
  return value;
}
/**
 * Parse a boolean according to a 1 or 0 value
 * @param str
 * @returns {boolean}
 */


function parseBoolean(str) {
  if (str === '0') return false;
  if (str === '1') return true;
  throw TypeError('String \'' + str + '\' cannot be cast to Boolean type');
}
},{}],"node_modules/dxf-parser/src/AutoCadColorIndex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * AutoCad files sometimes use an indexed color value between 1 and 255 inclusive.
 * Each value corresponds to a color. index 1 is red, that is 16711680 or 0xFF0000.
 * index 0 and 256, while included in this array, are actually reserved for inheritance
 * values in AutoCad so they should not be used for index color lookups.
 */
var _default = [0, 16711680, 16776960, 65280, 65535, 255, 16711935, 16777215, 8421504, 12632256, 16711680, 16744319, 13369344, 13395558, 10027008, 10046540, 8323072, 8339263, 4980736, 4990502, 16727808, 16752511, 13382400, 13401958, 10036736, 10051404, 8331008, 8343359, 4985600, 4992806, 16744192, 16760703, 13395456, 13408614, 10046464, 10056268, 8339200, 8347455, 4990464, 4995366, 16760576, 16768895, 13408512, 13415014, 10056192, 10061132, 8347392, 8351551, 4995328, 4997670, 16776960, 16777087, 13421568, 13421670, 10000384, 10000460, 8355584, 8355647, 5000192, 5000230, 12582656, 14679935, 10079232, 11717734, 7510016, 8755276, 6258432, 7307071, 3755008, 4344870, 8388352, 12582783, 6736896, 10079334, 5019648, 7510092, 4161280, 6258495, 2509824, 3755046, 4194048, 10485631, 3394560, 8375398, 2529280, 6264908, 2064128, 5209919, 1264640, 3099686, 65280, 8388479, 52224, 6736998, 38912, 5019724, 32512, 4161343, 19456, 2509862, 65343, 8388511, 52275, 6737023, 38950, 5019743, 32543, 4161359, 19475, 2509871, 65407, 8388543, 52326, 6737049, 38988, 5019762, 32575, 4161375, 19494, 2509881, 65471, 8388575, 52377, 6737074, 39026, 5019781, 32607, 4161391, 19513, 2509890, 65535, 8388607, 52428, 6737100, 39064, 5019800, 32639, 4161407, 19532, 2509900, 49151, 8380415, 39372, 6730444, 29336, 5014936, 24447, 4157311, 14668, 2507340, 32767, 8372223, 26316, 6724044, 19608, 5010072, 16255, 4153215, 9804, 2505036, 16383, 8364031, 13260, 6717388, 9880, 5005208, 8063, 4149119, 4940, 2502476, 255, 8355839, 204, 6710988, 152, 5000344, 127, 4145023, 76, 2500172, 4129023, 10452991, 3342540, 8349388, 2490520, 6245528, 2031743, 5193599, 1245260, 3089996, 8323327, 12550143, 6684876, 10053324, 4980888, 7490712, 4128895, 6242175, 2490444, 3745356, 12517631, 14647295, 10027212, 11691724, 7471256, 8735896, 6226047, 7290751, 3735628, 4335180, 16711935, 16744447, 13369548, 13395660, 9961624, 9981080, 8323199, 8339327, 4980812, 4990540, 16711871, 16744415, 13369497, 13395634, 9961586, 9981061, 8323167, 8339311, 4980793, 4990530, 16711807, 16744383, 13369446, 13395609, 9961548, 9981042, 8323135, 8339295, 4980774, 4990521, 16711743, 16744351, 13369395, 13395583, 9961510, 9981023, 8323103, 8339279, 4980755, 4990511, 3355443, 5987163, 8684676, 11382189, 14079702, 16777215];
exports.default = _default;
},{}],"node_modules/dxf-parser/src/ParseHelpers.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAcadColor = getAcadColor;
exports.parsePoint = parsePoint;
exports.checkCommonEntityProperties = checkCommonEntityProperties;

var _AutoCadColorIndex = _interopRequireDefault(require("./AutoCadColorIndex"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the truecolor value of the given AutoCad color index value
 * @return {Number} truecolor value as a number
 */
function getAcadColor(index) {
  return _AutoCadColorIndex.default[index];
}
/**
 * Parses the 2D or 3D coordinate, vector, or point. When complete,
 * the scanner remains on the last group of the coordinate.
 * @param {*} scanner 
 */


function parsePoint(scanner) {
  var point = {}; // Reread group for the first coordinate

  scanner.rewind();
  var curr = scanner.next();
  var code = curr.code;
  point.x = curr.value;
  code += 10;
  curr = scanner.next();
  if (curr.code != code) throw new Error('Expected code for point value to be ' + code + ' but got ' + curr.code + '.');
  point.y = curr.value;
  code += 10;
  curr = scanner.next();

  if (curr.code != code) {
    // Only the x and y are specified. Don't read z.
    scanner.rewind(); // Let the calling code advance off the point

    return point;
  }

  point.z = curr.value;
  return point;
}

;
/**
 * Attempts to parse codes common to all entities. Returns true if the group
 * was handled by this function.
 * @param {*} entity - the entity currently being parsed 
 * @param {*} curr - the current group being parsed
 */

function checkCommonEntityProperties(entity, curr) {
  switch (curr.code) {
    case 0:
      entity.type = curr.value;
      break;

    case 5:
      entity.handle = curr.value;
      break;

    case 6:
      entity.lineType = curr.value;
      break;

    case 8:
      // Layer name
      entity.layer = curr.value;
      break;

    case 48:
      entity.lineTypeScale = curr.value;
      break;

    case 60:
      entity.visible = curr.value === 0;
      break;

    case 62:
      // Acad Index Color. 0 inherits ByBlock. 256 inherits ByLayer. Default is bylayer
      entity.colorIndex = curr.value;
      entity.color = getAcadColor(Math.abs(curr.value));
      break;

    case 67:
      entity.inPaperSpace = curr.value !== 0;
      break;

    case 100:
      //ignore
      break;

    case 330:
      entity.ownerHandle = curr.value;
      break;

    case 347:
      entity.materialObjectHandle = curr.value;
      break;

    case 370:
      //From https://www.woutware.com/Forum/Topic/955/lineweight?returnUrl=%2FForum%2FUserPosts%3FuserId%3D478262319
      // An integer representing 100th of mm, must be one of the following values:
      // 0, 5, 9, 13, 15, 18, 20, 25, 30, 35, 40, 50, 53, 60, 70, 80, 90, 100, 106, 120, 140, 158, 200, 211.
      // -3 = STANDARD, -2 = BYLAYER, -1 = BYBLOCK
      entity.lineweight = curr.value;
      break;

    case 420:
      // TrueColor Color
      entity.color = curr.value;
      break;

    case 1000:
      entity.extendedData = entity.extendedData || {};
      entity.extendedData.customStrings = entity.extendedData.customStrings || [];
      entity.extendedData.customStrings.push(curr.value);
      break;

    case 1001:
      entity.extendedData = entity.extendedData || {};
      entity.extendedData.applicationName = curr.value;
      break;

    default:
      return false;
  }

  return true;
}

;
},{"./AutoCadColorIndex":"node_modules/dxf-parser/src/AutoCadColorIndex.js"}],"node_modules/dxf-parser/src/entities/3dface.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = '3DFACE';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity = {
    type: curr.value,
    vertices: []
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 70:
        // 1 = Closed shape, 128 = plinegen?, 0 = default
        entity.shape = (curr.value & 1) === 1;
        entity.hasContinuousLinetypePattern = (curr.value & 128) === 128;
        break;

      case 10:
        // X coordinate of point
        entity.vertices = parse3dFaceVertices(scanner, curr);
        curr = scanner.lastReadGroup;
        break;

      default:
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};

function parse3dFaceVertices(scanner, curr) {
  var vertices = [],
      i;
  var vertexIsStarted = false;
  var vertexIsFinished = false;
  var verticesPer3dFace = 4; // there can be up to four vertices per face, although 3 is most used for TIN

  for (i = 0; i <= verticesPer3dFace; i++) {
    var vertex = {};

    while (curr !== 'EOF') {
      if (curr.code === 0 || vertexIsFinished) break;

      switch (curr.code) {
        case 10: // X0

        case 11: // X1

        case 12: // X2

        case 13:
          // X3
          if (vertexIsStarted) {
            vertexIsFinished = true;
            continue;
          }

          vertex.x = curr.value;
          vertexIsStarted = true;
          break;

        case 20: // Y

        case 21:
        case 22:
        case 23:
          vertex.y = curr.value;
          break;

        case 30: // Z

        case 31:
        case 32:
        case 33:
          vertex.z = curr.value;
          break;

        default:
          // it is possible to have entity codes after the vertices.  
          // So if code is not accounted for return to entity parser where it might be accounted for
          return vertices;
          continue;
      }

      curr = scanner.next();
    } // See https://groups.google.com/forum/#!topic/comp.cad.autocad/9gn8s5O_w6E


    vertices.push(vertex);
    vertexIsStarted = false;
    vertexIsFinished = false;
  }

  scanner.rewind();
  return vertices;
}

;
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/arc.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'ARC';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity, endAngle;
  entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 10:
        // X coordinate of point
        entity.center = helpers.parsePoint(scanner);
        break;

      case 40:
        // radius
        entity.radius = curr.value;
        break;

      case 50:
        // start angle
        entity.startAngle = Math.PI / 180 * curr.value;
        break;

      case 51:
        // end angle
        entity.endAngle = Math.PI / 180 * curr.value;
        entity.angleLength = entity.endAngle - entity.startAngle; // angleLength is deprecated

        break;

      default:
        // ignored attribute
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/attdef.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'ATTDEF';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity = {
    type: curr.value,
    scale: 1,
    textStyle: 'STANDARD'
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) {
      break;
    }

    switch (curr.code) {
      case 1:
        entity.text = curr.value;
        break;

      case 2:
        entity.tag = curr.value;
        break;

      case 3:
        entity.prompt = curr.value;
        break;

      case 7:
        entity.textStyle = curr.value;
        break;

      case 10:
        // X coordinate of 'first alignment point'
        entity.startPoint = helpers.parsePoint(scanner);
        break;

      case 11:
        // X coordinate of 'second alignment point'
        entity.endPoint = helpers.parsePoint(scanner);
        break;

      case 39:
        entity.thickness = curr.value;
        break;

      case 40:
        entity.textHeight = curr.value;
        break;

      case 41:
        entity.scale = curr.value;
        break;

      case 50:
        entity.rotation = curr.value;
        break;

      case 51:
        entity.obliqueAngle = curr.value;
        break;

      case 70:
        entity.invisible = !!(curr.value & 0x01);
        entity.constant = !!(curr.value & 0x02);
        entity.verificationRequired = !!(curr.value & 0x04);
        entity.preset = !!(curr.value & 0x08);
        break;

      case 71:
        entity.backwards = !!(curr.value & 0x02);
        entity.mirrored = !!(curr.value & 0x04);
        break;

      case 72:
        // TODO: enum values?
        entity.horizontalJustification = curr.value;
        break;

      case 73:
        entity.fieldLength = curr.value;
        break;

      case 74:
        // TODO: enum values?
        entity.verticalJustification = curr.value;
        break;

      case 100:
        break;

      case 210:
        entity.extrusionDirectionX = curr.value;
        break;

      case 220:
        entity.extrusionDirectionY = curr.value;
        break;

      case 230:
        entity.extrusionDirectionZ = curr.value;
        break;

      default:
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/circle.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'CIRCLE';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity, endAngle;
  entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 10:
        // X coordinate of point
        entity.center = helpers.parsePoint(scanner);
        break;

      case 40:
        // radius
        entity.radius = curr.value;
        break;

      case 50:
        // start angle
        entity.startAngle = Math.PI / 180 * curr.value;
        break;

      case 51:
        // end angle
        endAngle = Math.PI / 180 * curr.value;
        if (endAngle < entity.startAngle) entity.angleLength = endAngle + 2 * Math.PI - entity.startAngle;else entity.angleLength = endAngle - entity.startAngle;
        entity.endAngle = endAngle;
        break;

      default:
        // ignored attribute
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/dimension.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'DIMENSION';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity;
  entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 2:
        // Referenced block name
        entity.block = curr.value;
        break;

      case 10:
        // X coordinate of 'first alignment point'
        entity.anchorPoint = helpers.parsePoint(scanner);
        break;

      case 11:
        entity.middleOfText = helpers.parsePoint(scanner);
        break;

      case 12:
        // Insertion point for clones of a dimension
        entity.insertionPoint = helpers.parsePoint(scanner);
        break;

      case 13:
        // Definition point for linear and angular dimensions 
        entity.linearOrAngularPoint1 = helpers.parsePoint(scanner);
        break;

      case 14:
        // Definition point for linear and angular dimensions 
        entity.linearOrAngularPoint2 = helpers.parsePoint(scanner);
        break;

      case 15:
        // Definition point for diameter, radius, and angular dimensions
        entity.diameterOrRadiusPoint = helpers.parsePoint(scanner);
        break;

      case 16:
        // Point defining dimension arc for angular dimensions
        entity.arcPoint = helpers.parsePoint(scanner);
        break;

      case 70:
        // Dimension type
        entity.dimensionType = curr.value;
        break;

      case 71:
        // 5 = Middle center
        entity.attachmentPoint = curr.value;
        break;

      case 42:
        // Actual measurement
        entity.actualMeasurement = curr.value;
        break;

      case 1:
        // Text entered by user explicitly
        entity.text = curr.value;
        break;

      case 50:
        // Angle of rotated, horizontal, or vertical dimensions
        entity.angle = curr.value;
        break;

      default:
        // check common entity attributes
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/ellipse.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'ELLIPSE';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity;
  entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 10:
        entity.center = helpers.parsePoint(scanner);
        break;

      case 11:
        entity.majorAxisEndPoint = helpers.parsePoint(scanner);
        break;

      case 40:
        entity.axisRatio = curr.value;
        break;

      case 41:
        entity.startAngle = curr.value;
        break;

      case 42:
        entity.endAngle = curr.value;
        break;

      case 2:
        entity.name = curr.value;
        break;

      default:
        // check common entity attributes
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/insert.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'INSERT';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity;
  entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 2:
        entity.name = curr.value;
        break;

      case 41:
        entity.xScale = curr.value;
        break;

      case 42:
        entity.yScale = curr.value;
        break;

      case 43:
        entity.zScale = curr.value;
        break;

      case 10:
        entity.position = helpers.parsePoint(scanner);
        break;

      case 50:
        entity.rotation = curr.value;
        break;

      case 70:
        entity.columnCount = curr.value;
        break;

      case 71:
        entity.rowCount = curr.value;
        break;

      case 44:
        entity.columnSpacing = curr.value;
        break;

      case 45:
        entity.rowSpacing = curr.value;
        break;

      case 210:
        entity.extrusionDirection = helpers.parsePoint(scanner);
        break;

      default:
        // check common entity attributes
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/line.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'LINE';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity = {
    type: curr.value,
    vertices: []
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 10:
        // X coordinate of point
        entity.vertices.unshift(helpers.parsePoint(scanner));
        break;

      case 11:
        entity.vertices.push(helpers.parsePoint(scanner));
        break;

      case 210:
        entity.extrusionDirection = helpers.parsePoint(scanner);
        break;

      case 100:
        break;

      default:
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/lwpolyline.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'LWPOLYLINE';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity = {
    type: curr.value,
    vertices: []
  },
      numberOfVertices = 0;
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 38:
        entity.elevation = curr.value;
        break;

      case 39:
        entity.depth = curr.value;
        break;

      case 70:
        // 1 = Closed shape, 128 = plinegen?, 0 = default
        entity.shape = (curr.value & 1) === 1;
        entity.hasContinuousLinetypePattern = (curr.value & 128) === 128;
        break;

      case 90:
        numberOfVertices = curr.value;
        break;

      case 10:
        // X coordinate of point
        entity.vertices = parseLWPolylineVertices(numberOfVertices, scanner);
        break;

      case 43:
        if (curr.value !== 0) entity.width = curr.value;
        break;

      case 210:
        entity.extrusionDirectionX = curr.value;
        break;

      case 220:
        entity.extrusionDirectionY = curr.value;
        break;

      case 230:
        entity.extrusionDirectionZ = curr.value;
        break;

      default:
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};

function parseLWPolylineVertices(n, scanner) {
  if (!n || n <= 0) throw Error('n must be greater than 0 verticies');
  var vertices = [],
      i;
  var vertexIsStarted = false;
  var vertexIsFinished = false;
  var curr = scanner.lastReadGroup;

  for (i = 0; i < n; i++) {
    var vertex = {};

    while (curr !== 'EOF') {
      if (curr.code === 0 || vertexIsFinished) break;

      switch (curr.code) {
        case 10:
          // X
          if (vertexIsStarted) {
            vertexIsFinished = true;
            continue;
          }

          vertex.x = curr.value;
          vertexIsStarted = true;
          break;

        case 20:
          // Y
          vertex.y = curr.value;
          break;

        case 30:
          // Z
          vertex.z = curr.value;
          break;

        case 40:
          // start width
          vertex.startWidth = curr.value;
          break;

        case 41:
          // end width
          vertex.endWidth = curr.value;
          break;

        case 42:
          // bulge
          if (curr.value != 0) vertex.bulge = curr.value;
          break;

        default:
          // if we do not hit known code return vertices.  Code might belong to entity
          if (vertexIsStarted) {
            vertices.push(vertex);
          }

          scanner.rewind();
          return vertices;
      }

      curr = scanner.next();
    } // See https://groups.google.com/forum/#!topic/comp.cad.autocad/9gn8s5O_w6E


    vertices.push(vertex);
    vertexIsStarted = false;
    vertexIsFinished = false;
  }

  scanner.rewind();
  return vertices;
}

;
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/mtext.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'MTEXT';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 3:
        entity.text ? entity.text += curr.value : entity.text = curr.value;
        break;

      case 1:
        entity.text ? entity.text += curr.value : entity.text = curr.value;
        break;

      case 10:
        entity.position = helpers.parsePoint(scanner);
        break;

      case 40:
        //Note: this is the text height
        entity.height = curr.value;
        break;

      case 41:
        entity.width = curr.value;
        break;

      case 50:
        entity.rotation = curr.value;
        break;

      case 71:
        entity.attachmentPoint = curr.value;
        break;

      case 72:
        entity.drawingDirection = curr.value;
        break;

      default:
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/point.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'POINT';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity;
  entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 10:
        entity.position = helpers.parsePoint(scanner);
        break;

      case 39:
        entity.thickness = curr.value;
        break;

      case 210:
        entity.extrusionDirection = helpers.parsePoint(scanner);
        break;

      case 100:
        break;

      default:
        // check common entity attributes
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/vertex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'VERTEX';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 10:
        // X
        entity.x = curr.value;
        break;

      case 20:
        // Y
        entity.y = curr.value;
        break;

      case 30:
        // Z
        entity.z = curr.value;
        break;

      case 40:
        // start width
        break;

      case 41:
        // end width
        break;

      case 42:
        // bulge
        if (curr.value != 0) entity.bulge = curr.value;
        break;

      case 70:
        // flags
        entity.curveFittingVertex = (curr.value & 1) !== 0;
        entity.curveFitTangent = (curr.value & 2) !== 0;
        entity.splineVertex = (curr.value & 8) !== 0;
        entity.splineControlPoint = (curr.value & 16) !== 0;
        entity.threeDPolylineVertex = (curr.value & 32) !== 0;
        entity.threeDPolylineMesh = (curr.value & 64) !== 0;
        entity.polyfaceMeshVertex = (curr.value & 128) !== 0;
        break;

      case 50:
        // curve fit tangent direction
        break;

      case 71:
        // polyface mesh vertex index
        entity.faceA = curr.value;
        break;

      case 72:
        // polyface mesh vertex index
        entity.faceB = curr.value;
        break;

      case 73:
        // polyface mesh vertex index
        entity.faceC = curr.value;
        break;

      case 74:
        // polyface mesh vertex index
        entity.faceD = curr.value;
        break;

      default:
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/polyline.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

var _vertex = _interopRequireDefault(require("./vertex"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'POLYLINE';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity = {
    type: curr.value,
    vertices: []
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 10:
        // always 0
        break;

      case 20:
        // always 0
        break;

      case 30:
        // elevation
        break;

      case 39:
        // thickness
        entity.thickness = curr.value;
        break;

      case 40:
        // start width
        break;

      case 41:
        // end width
        break;

      case 70:
        entity.shape = (curr.value & 1) !== 0;
        entity.includesCurveFitVertices = (curr.value & 2) !== 0;
        entity.includesSplineFitVertices = (curr.value & 4) !== 0;
        entity.is3dPolyline = (curr.value & 8) !== 0;
        entity.is3dPolygonMesh = (curr.value & 16) !== 0;
        entity.is3dPolygonMeshClosed = (curr.value & 32) !== 0; // 32 = The polygon mesh is closed in the N direction

        entity.isPolyfaceMesh = (curr.value & 64) !== 0;
        entity.hasContinuousLinetypePattern = (curr.value & 128) !== 0;
        break;

      case 71:
        // Polygon mesh M vertex count
        break;

      case 72:
        // Polygon mesh N vertex count
        break;

      case 73:
        // Smooth surface M density
        break;

      case 74:
        // Smooth surface N density
        break;

      case 75:
        // Curves and smooth surface type
        break;

      case 210:
        entity.extrusionDirection = helpers.parsePoint(scanner);
        break;

      default:
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  entity.vertices = parsePolylineVertices(scanner, curr);
  return entity;
};

function parsePolylineVertices(scanner, curr) {
  var vertexParser = new _vertex.default();
  var vertices = [];

  while (!scanner.isEOF()) {
    if (curr.code === 0) {
      if (curr.value === 'VERTEX') {
        vertices.push(vertexParser.parseEntity(scanner, curr));
        curr = scanner.lastReadGroup;
      } else if (curr.value === 'SEQEND') {
        parseSeqEnd(scanner, curr);
        break;
      }
    }
  }

  return vertices;
}

;

function parseSeqEnd(scanner, curr) {
  var entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr != 'EOF') {
    if (curr.code == 0) break;
    helpers.checkCommonEntityProperties(entity, curr);
    curr = scanner.next();
  }

  return entity;
}

;
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js","./vertex":"node_modules/dxf-parser/src/entities/vertex.js"}],"node_modules/dxf-parser/src/entities/solid.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'SOLID';

EntityParser.prototype.parseEntity = function (scanner, currentGroup) {
  var entity;
  entity = {
    type: currentGroup.value
  };
  entity.points = [];
  currentGroup = scanner.next();

  while (currentGroup !== 'EOF') {
    if (currentGroup.code === 0) break;

    switch (currentGroup.code) {
      case 10:
        entity.points[0] = helpers.parsePoint(scanner);
        break;

      case 11:
        entity.points[1] = helpers.parsePoint(scanner);
        break;

      case 12:
        entity.points[2] = helpers.parsePoint(scanner);
        break;

      case 13:
        entity.points[3] = helpers.parsePoint(scanner);
        break;

      case 210:
        entity.extrusionDirection = helpers.parsePoint(scanner);
        break;

      default:
        // check common entity attributes
        helpers.checkCommonEntityProperties(entity, currentGroup);
        break;
    }

    currentGroup = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/spline.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'SPLINE';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity;
  entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 10:
        if (!entity.controlPoints) entity.controlPoints = [];
        entity.controlPoints.push(helpers.parsePoint(scanner));
        break;

      case 11:
        if (!entity.fitPoints) entity.fitPoints = [];
        entity.fitPoints.push(helpers.parsePoint(scanner));
        break;

      case 12:
        entity.startTangent = helpers.parsePoint(scanner);
        break;

      case 13:
        entity.endTangent = helpers.parsePoint(scanner);
        break;

      case 40:
        if (!entity.knotValues) entity.knotValues = [];
        entity.knotValues.push(curr.value);
        break;

      case 70:
        if ((curr.value & 1) != 0) entity.closed = true;
        if ((curr.value & 2) != 0) entity.periodic = true;
        if ((curr.value & 4) != 0) entity.rational = true;
        if ((curr.value & 8) != 0) entity.planar = true;

        if ((curr.value & 16) != 0) {
          entity.planar = true;
          entity.linear = true;
        }

        break;

      case 71:
        entity.degreeOfSplineCurve = curr.value;
        break;

      case 72:
        entity.numberOfKnots = curr.value;
        break;

      case 73:
        entity.numberOfControlPoints = curr.value;
        break;

      case 74:
        entity.numberOfFitPoints = curr.value;
        break;

      case 210:
        entity.normalVector = helpers.parsePoint(scanner);
        break;

      default:
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/dxf-parser/src/entities/text.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EntityParser;

var helpers = _interopRequireWildcard(require("../ParseHelpers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function EntityParser() {}

EntityParser.ForEntityName = 'TEXT';

EntityParser.prototype.parseEntity = function (scanner, curr) {
  var entity;
  entity = {
    type: curr.value
  };
  curr = scanner.next();

  while (curr !== 'EOF') {
    if (curr.code === 0) break;

    switch (curr.code) {
      case 10:
        // X coordinate of 'first alignment point'
        entity.startPoint = helpers.parsePoint(scanner);
        break;

      case 11:
        // X coordinate of 'second alignment point'
        entity.endPoint = helpers.parsePoint(scanner);
        break;

      case 40:
        // Text height
        entity.textHeight = curr.value;
        break;

      case 41:
        entity.xScale = curr.value;
        break;

      case 50:
        // Rotation in degrees
        entity.rotation = curr.value;
        break;

      case 1:
        // Text
        entity.text = curr.value;
        break;
      // NOTE: 72 and 73 are meaningless without 11 (second alignment point)

      case 72:
        // Horizontal alignment
        entity.halign = curr.value;
        break;

      case 73:
        // Vertical alignment
        entity.valign = curr.value;
        break;

      default:
        // check common entity attributes
        helpers.checkCommonEntityProperties(entity, curr);
        break;
    }

    curr = scanner.next();
  }

  return entity;
};
},{"../ParseHelpers":"node_modules/dxf-parser/src/ParseHelpers.js"}],"node_modules/loglevel/lib/loglevel.js":[function(require,module,exports) {
var define;
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
  "use strict";

  if (typeof define === 'function' && define.amd) {
    define(definition);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = definition();
  } else {
    root.log = definition();
  }
})(this, function () {
  "use strict"; // Slightly dubious tricks to cut down minimized file size

  var noop = function () {};

  var undefinedType = "undefined";
  var isIE = typeof window !== undefinedType && typeof window.navigator !== undefinedType && /Trident\/|MSIE /.test(window.navigator.userAgent);
  var logMethods = ["trace", "debug", "info", "warn", "error"]; // Cross-browser bind equivalent that works at least back to IE6

  function bindMethod(obj, methodName) {
    var method = obj[methodName];

    if (typeof method.bind === 'function') {
      return method.bind(obj);
    } else {
      try {
        return Function.prototype.bind.call(method, obj);
      } catch (e) {
        // Missing bind shim or IE8 + Modernizr, fallback to wrapping
        return function () {
          return Function.prototype.apply.apply(method, [obj, arguments]);
        };
      }
    }
  } // Trace() doesn't print the message in IE, so for that case we need to wrap it


  function traceForIE() {
    if (console.log) {
      if (console.log.apply) {
        console.log.apply(console, arguments);
      } else {
        // In old IE, native console methods themselves don't have apply().
        Function.prototype.apply.apply(console.log, [console, arguments]);
      }
    }

    if (console.trace) console.trace();
  } // Build the best logging method possible for this env
  // Wherever possible we want to bind, not wrap, to preserve stack traces


  function realMethod(methodName) {
    if (methodName === 'debug') {
      methodName = 'log';
    }

    if (typeof console === undefinedType) {
      return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
    } else if (methodName === 'trace' && isIE) {
      return traceForIE;
    } else if (console[methodName] !== undefined) {
      return bindMethod(console, methodName);
    } else if (console.log !== undefined) {
      return bindMethod(console, 'log');
    } else {
      return noop;
    }
  } // These private functions always need `this` to be set properly


  function replaceLoggingMethods(level, loggerName) {
    /*jshint validthis:true */
    for (var i = 0; i < logMethods.length; i++) {
      var methodName = logMethods[i];
      this[methodName] = i < level ? noop : this.methodFactory(methodName, level, loggerName);
    } // Define log.log as an alias for log.debug


    this.log = this.debug;
  } // In old IE versions, the console isn't present until you first open it.
  // We build realMethod() replacements here that regenerate logging methods


  function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
    return function () {
      if (typeof console !== undefinedType) {
        replaceLoggingMethods.call(this, level, loggerName);
        this[methodName].apply(this, arguments);
      }
    };
  } // By default, we use closely bound real methods wherever possible, and
  // otherwise we wait for a console to appear, and then try again.


  function defaultMethodFactory(methodName, level, loggerName) {
    /*jshint validthis:true */
    return realMethod(methodName) || enableLoggingWhenConsoleArrives.apply(this, arguments);
  }

  function Logger(name, defaultLevel, factory) {
    var self = this;
    var currentLevel;
    var storageKey = "loglevel";

    if (typeof name === "string") {
      storageKey += ":" + name;
    } else if (typeof name === "symbol") {
      storageKey = undefined;
    }

    function persistLevelIfPossible(levelNum) {
      var levelName = (logMethods[levelNum] || 'silent').toUpperCase();
      if (typeof window === undefinedType || !storageKey) return; // Use localStorage if available

      try {
        window.localStorage[storageKey] = levelName;
        return;
      } catch (ignore) {} // Use session cookie as fallback


      try {
        window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
      } catch (ignore) {}
    }

    function getPersistedLevel() {
      var storedLevel;
      if (typeof window === undefinedType || !storageKey) return;

      try {
        storedLevel = window.localStorage[storageKey];
      } catch (ignore) {} // Fallback to cookies if local storage gives us nothing


      if (typeof storedLevel === undefinedType) {
        try {
          var cookie = window.document.cookie;
          var location = cookie.indexOf(encodeURIComponent(storageKey) + "=");

          if (location !== -1) {
            storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
          }
        } catch (ignore) {}
      } // If the stored level is not valid, treat it as if nothing was stored.


      if (self.levels[storedLevel] === undefined) {
        storedLevel = undefined;
      }

      return storedLevel;
    }
    /*
     *
     * Public logger API - see https://github.com/pimterry/loglevel for details
     *
     */


    self.name = name;
    self.levels = {
      "TRACE": 0,
      "DEBUG": 1,
      "INFO": 2,
      "WARN": 3,
      "ERROR": 4,
      "SILENT": 5
    };
    self.methodFactory = factory || defaultMethodFactory;

    self.getLevel = function () {
      return currentLevel;
    };

    self.setLevel = function (level, persist) {
      if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
        level = self.levels[level.toUpperCase()];
      }

      if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
        currentLevel = level;

        if (persist !== false) {
          // defaults to true
          persistLevelIfPossible(level);
        }

        replaceLoggingMethods.call(self, level, name);

        if (typeof console === undefinedType && level < self.levels.SILENT) {
          return "No console available for logging";
        }
      } else {
        throw "log.setLevel() called with invalid level: " + level;
      }
    };

    self.setDefaultLevel = function (level) {
      if (!getPersistedLevel()) {
        self.setLevel(level, false);
      }
    };

    self.enableAll = function (persist) {
      self.setLevel(self.levels.TRACE, persist);
    };

    self.disableAll = function (persist) {
      self.setLevel(self.levels.SILENT, persist);
    }; // Initialize with the right level


    var initialLevel = getPersistedLevel();

    if (initialLevel == null) {
      initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
    }

    self.setLevel(initialLevel, false);
  }
  /*
   *
   * Top-level API
   *
   */


  var defaultLogger = new Logger();
  var _loggersByName = {};

  defaultLogger.getLogger = function getLogger(name) {
    if (typeof name !== "symbol" && typeof name !== "string" || name === "") {
      throw new TypeError("You must supply a name when creating a logger.");
    }

    var logger = _loggersByName[name];

    if (!logger) {
      logger = _loggersByName[name] = new Logger(name, defaultLogger.getLevel(), defaultLogger.methodFactory);
    }

    return logger;
  }; // Grab the current global log variable in case of overwrite


  var _log = typeof window !== undefinedType ? window.log : undefined;

  defaultLogger.noConflict = function () {
    if (typeof window !== undefinedType && window.log === defaultLogger) {
      window.log = _log;
    }

    return defaultLogger;
  };

  defaultLogger.getLoggers = function getLoggers() {
    return _loggersByName;
  }; // ES6 default export, for compatibility


  defaultLogger['default'] = defaultLogger;
  return defaultLogger;
});
},{}],"node_modules/dxf-parser/src/DxfParser.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DxfParser;

var _DxfArrayScanner = _interopRequireDefault(require("./DxfArrayScanner"));

var _AutoCadColorIndex = _interopRequireDefault(require("./AutoCadColorIndex"));

var _dface = _interopRequireDefault(require("./entities/3dface"));

var _arc = _interopRequireDefault(require("./entities/arc"));

var _attdef = _interopRequireDefault(require("./entities/attdef"));

var _circle = _interopRequireDefault(require("./entities/circle"));

var _dimension = _interopRequireDefault(require("./entities/dimension"));

var _ellipse = _interopRequireDefault(require("./entities/ellipse"));

var _insert = _interopRequireDefault(require("./entities/insert"));

var _line = _interopRequireDefault(require("./entities/line"));

var _lwpolyline = _interopRequireDefault(require("./entities/lwpolyline"));

var _mtext = _interopRequireDefault(require("./entities/mtext"));

var _point = _interopRequireDefault(require("./entities/point"));

var _polyline = _interopRequireDefault(require("./entities/polyline"));

var _solid = _interopRequireDefault(require("./entities/solid"));

var _spline = _interopRequireDefault(require("./entities/spline"));

var _text = _interopRequireDefault(require("./entities/text"));

var _loglevel = _interopRequireDefault(require("loglevel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import Vertex from './entities/';
//log.setLevel('trace');
//log.setLevel('debug');
//log.setLevel('info');
//log.setLevel('warn');
_loglevel.default.setLevel('error'); //log.setLevel('silent');


function registerDefaultEntityHandlers(dxfParser) {
  // Supported entities here (some entity code is still being refactored into this flow)
  dxfParser.registerEntityHandler(_dface.default);
  dxfParser.registerEntityHandler(_arc.default);
  dxfParser.registerEntityHandler(_attdef.default);
  dxfParser.registerEntityHandler(_circle.default);
  dxfParser.registerEntityHandler(_dimension.default);
  dxfParser.registerEntityHandler(_ellipse.default);
  dxfParser.registerEntityHandler(_insert.default);
  dxfParser.registerEntityHandler(_line.default);
  dxfParser.registerEntityHandler(_lwpolyline.default);
  dxfParser.registerEntityHandler(_mtext.default);
  dxfParser.registerEntityHandler(_point.default);
  dxfParser.registerEntityHandler(_polyline.default);
  dxfParser.registerEntityHandler(_solid.default);
  dxfParser.registerEntityHandler(_spline.default);
  dxfParser.registerEntityHandler(_text.default); //dxfParser.registerEntityHandler(require('./entities/vertex'));
}

function DxfParser() {
  this._entityHandlers = {};
  registerDefaultEntityHandlers(this);
}

DxfParser.prototype.parse = function (source, done) {
  throw new Error("read() not implemented. Use readSync()");
};

DxfParser.prototype.registerEntityHandler = function (handlerType) {
  var instance = new handlerType();
  this._entityHandlers[handlerType.ForEntityName] = instance;
};

DxfParser.prototype.parseSync = function (source) {
  if (typeof source === 'string') {
    return this._parse(source);
  } else {
    console.error('Cannot read dxf source of type `' + typeof source);
    return null;
  }
};

DxfParser.prototype.parseStream = function (stream, done) {
  var dxfString = "";
  var self = this;
  stream.on('data', onData);
  stream.on('end', onEnd);
  stream.on('error', onError);

  function onData(chunk) {
    dxfString += chunk;
  }

  function onEnd() {
    try {
      var dxf = self._parse(dxfString);
    } catch (err) {
      return done(err);
    }

    done(null, dxf);
  }

  function onError(err) {
    done(err);
  }
};

DxfParser.prototype._parse = function (dxfString) {
  var scanner,
      curr,
      dxf = {},
      lastHandle = 0;
  var dxfLinesArray = dxfString.split(/\r\n|\r|\n/g);
  scanner = new _DxfArrayScanner.default(dxfLinesArray);
  if (!scanner.hasNext()) throw Error('Empty file');
  var self = this;

  var parseAll = function () {
    curr = scanner.next();

    while (!scanner.isEOF()) {
      if (curr.code === 0 && curr.value === 'SECTION') {
        curr = scanner.next(); // Be sure we are reading a section code

        if (curr.code !== 2) {
          console.error('Unexpected code %s after 0:SECTION', debugCode(curr));
          curr = scanner.next();
          continue;
        }

        if (curr.value === 'HEADER') {
          _loglevel.default.debug('> HEADER');

          dxf.header = parseHeader();

          _loglevel.default.debug('<');
        } else if (curr.value === 'BLOCKS') {
          _loglevel.default.debug('> BLOCKS');

          dxf.blocks = parseBlocks();

          _loglevel.default.debug('<');
        } else if (curr.value === 'ENTITIES') {
          _loglevel.default.debug('> ENTITIES');

          dxf.entities = parseEntities(false);

          _loglevel.default.debug('<');
        } else if (curr.value === 'TABLES') {
          _loglevel.default.debug('> TABLES');

          dxf.tables = parseTables();

          _loglevel.default.debug('<');
        } else if (curr.value === 'EOF') {
          _loglevel.default.debug('EOF');
        } else {
          _loglevel.default.warn('Skipping section \'%s\'', curr.value);
        }
      } else {
        curr = scanner.next();
      } // If is a new section

    }
  };

  var groupIs = function (code, value) {
    return curr.code === code && curr.value === value;
  };
  /**
   *
   * @return {object} header
   */


  var parseHeader = function () {
    // interesting variables:
    //  $ACADVER, $VIEWDIR, $VIEWSIZE, $VIEWCTR, $TDCREATE, $TDUPDATE
    // http://www.autodesk.com/techpubs/autocad/acadr14/dxf/header_section_al_u05_c.htm
    // Also see VPORT table entries
    var currVarName = null,
        currVarValue = null;
    var header = {}; // loop through header variables

    curr = scanner.next();

    while (true) {
      if (groupIs(0, 'ENDSEC')) {
        if (currVarName) header[currVarName] = currVarValue;
        break;
      } else if (curr.code === 9) {
        if (currVarName) header[currVarName] = currVarValue;
        currVarName = curr.value; // Filter here for particular variables we are interested in
      } else {
        if (curr.code === 10) {
          currVarValue = {
            x: curr.value
          };
        } else if (curr.code === 20) {
          currVarValue.y = curr.value;
        } else if (curr.code === 30) {
          currVarValue.z = curr.value;
        } else {
          currVarValue = curr.value;
        }
      }

      curr = scanner.next();
    } // console.log(util.inspect(header, { colors: true, depth: null }));


    curr = scanner.next(); // swallow up ENDSEC

    return header;
  };
  /**
   *
   */


  var parseBlocks = function () {
    var blocks = {},
        block;
    curr = scanner.next();

    while (curr.value !== 'EOF') {
      if (groupIs(0, 'ENDSEC')) {
        break;
      }

      if (groupIs(0, 'BLOCK')) {
        _loglevel.default.debug('block {');

        block = parseBlock();

        _loglevel.default.debug('}');

        ensureHandle(block);
        if (!block.name) _loglevel.default.error('block with handle "' + block.handle + '" is missing a name.');else blocks[block.name] = block;
      } else {
        logUnhandledGroup(curr);
        curr = scanner.next();
      }
    }

    return blocks;
  };

  var parseBlock = function () {
    var block = {};
    curr = scanner.next();

    while (curr.value !== 'EOF') {
      switch (curr.code) {
        case 1:
          block.xrefPath = curr.value;
          curr = scanner.next();
          break;

        case 2:
          block.name = curr.value;
          curr = scanner.next();
          break;

        case 3:
          block.name2 = curr.value;
          curr = scanner.next();
          break;

        case 5:
          block.handle = curr.value;
          curr = scanner.next();
          break;

        case 8:
          block.layer = curr.value;
          curr = scanner.next();
          break;

        case 10:
          block.position = parsePoint();
          curr = scanner.next();
          break;

        case 67:
          block.paperSpace = curr.value && curr.value == 1 ? true : false;
          curr = scanner.next();
          break;

        case 70:
          if (curr.value != 0) {
            //if(curr.value & BLOCK_ANONYMOUS_FLAG) console.log('  Anonymous block');
            //if(curr.value & BLOCK_NON_CONSTANT_FLAG) console.log('  Non-constant attributes');
            //if(curr.value & BLOCK_XREF_FLAG) console.log('  Is xref');
            //if(curr.value & BLOCK_XREF_OVERLAY_FLAG) console.log('  Is xref overlay');
            //if(curr.value & BLOCK_EXTERNALLY_DEPENDENT_FLAG) console.log('  Is externally dependent');
            //if(curr.value & BLOCK_RESOLVED_OR_DEPENDENT_FLAG) console.log('  Is resolved xref or dependent of an xref');
            //if(curr.value & BLOCK_REFERENCED_XREF) console.log('  This definition is a referenced xref');
            block.type = curr.value;
          }

          curr = scanner.next();
          break;

        case 100:
          // ignore class markers
          curr = scanner.next();
          break;

        case 330:
          block.ownerHandle = curr.value;
          curr = scanner.next();
          break;

        case 0:
          if (curr.value == 'ENDBLK') break;
          block.entities = parseEntities(true);
          break;

        default:
          logUnhandledGroup(curr);
          curr = scanner.next();
      }

      if (groupIs(0, 'ENDBLK')) {
        curr = scanner.next();
        break;
      }
    }

    return block;
  };
  /**
   * parseTables
   * @return {Object} Object representing tables
   */


  var parseTables = function () {
    var tables = {};
    curr = scanner.next();

    while (curr.value !== 'EOF') {
      if (groupIs(0, 'ENDSEC')) break;

      if (groupIs(0, 'TABLE')) {
        curr = scanner.next();
        var tableDefinition = tableDefinitions[curr.value];

        if (tableDefinition) {
          _loglevel.default.debug(curr.value + ' Table {');

          tables[tableDefinitions[curr.value].tableName] = parseTable();

          _loglevel.default.debug('}');
        } else {
          _loglevel.default.debug('Unhandled Table ' + curr.value);
        }
      } else {
        // else ignored
        curr = scanner.next();
      }
    }

    curr = scanner.next();
    return tables;
  };

  const END_OF_TABLE_VALUE = 'ENDTAB';

  var parseTable = function () {
    var tableDefinition = tableDefinitions[curr.value],
        table = {},
        expectedCount = 0,
        actualCount;
    curr = scanner.next();

    while (!groupIs(0, END_OF_TABLE_VALUE)) {
      switch (curr.code) {
        case 5:
          table.handle = curr.value;
          curr = scanner.next();
          break;

        case 330:
          table.ownerHandle = curr.value;
          curr = scanner.next();
          break;

        case 100:
          if (curr.value === 'AcDbSymbolTable') {
            // ignore
            curr = scanner.next();
          } else {
            logUnhandledGroup(curr);
            curr = scanner.next();
          }

          break;

        case 70:
          expectedCount = curr.value;
          curr = scanner.next();
          break;

        case 0:
          if (curr.value === tableDefinition.dxfSymbolName) {
            table[tableDefinition.tableRecordsProperty] = tableDefinition.parseTableRecords();
          } else {
            logUnhandledGroup(curr);
            curr = scanner.next();
          }

          break;

        default:
          logUnhandledGroup(curr);
          curr = scanner.next();
      }
    }

    var tableRecords = table[tableDefinition.tableRecordsProperty];

    if (tableRecords) {
      if (tableRecords.constructor === Array) {
        actualCount = tableRecords.length;
      } else if (typeof tableRecords === 'object') {
        actualCount = Object.keys(tableRecords).length;
      }

      if (expectedCount !== actualCount) _loglevel.default.warn('Parsed ' + actualCount + ' ' + tableDefinition.dxfSymbolName + '\'s but expected ' + expectedCount);
    }

    curr = scanner.next();
    return table;
  };

  var parseViewPortRecords = function () {
    var viewPorts = [],
        // Multiple table entries may have the same name indicating a multiple viewport configuration
    viewPort = {};

    _loglevel.default.debug('ViewPort {');

    curr = scanner.next();

    while (!groupIs(0, END_OF_TABLE_VALUE)) {
      switch (curr.code) {
        case 2:
          // layer name
          viewPort.name = curr.value;
          curr = scanner.next();
          break;

        case 10:
          viewPort.lowerLeftCorner = parsePoint();
          curr = scanner.next();
          break;

        case 11:
          viewPort.upperRightCorner = parsePoint();
          curr = scanner.next();
          break;

        case 12:
          viewPort.center = parsePoint();
          curr = scanner.next();
          break;

        case 13:
          viewPort.snapBasePoint = parsePoint();
          curr = scanner.next();
          break;

        case 14:
          viewPort.snapSpacing = parsePoint();
          curr = scanner.next();
          break;

        case 15:
          viewPort.gridSpacing = parsePoint();
          curr = scanner.next();
          break;

        case 16:
          viewPort.viewDirectionFromTarget = parsePoint();
          curr = scanner.next();
          break;

        case 17:
          viewPort.viewTarget = parsePoint();
          curr = scanner.next();
          break;

        case 42:
          viewPort.lensLength = curr.value;
          curr = scanner.next();
          break;

        case 43:
          viewPort.frontClippingPlane = curr.value;
          curr = scanner.next();
          break;

        case 44:
          viewPort.backClippingPlane = curr.value;
          curr = scanner.next();
          break;

        case 45:
          viewPort.viewHeight = curr.value;
          curr = scanner.next();
          break;

        case 50:
          viewPort.snapRotationAngle = curr.value;
          curr = scanner.next();
          break;

        case 51:
          viewPort.viewTwistAngle = curr.value;
          curr = scanner.next();
          break;

        case 79:
          viewPort.orthographicType = curr.value;
          curr = scanner.next();
          break;

        case 110:
          viewPort.ucsOrigin = parsePoint();
          curr = scanner.next();
          break;

        case 111:
          viewPort.ucsXAxis = parsePoint();
          curr = scanner.next();
          break;

        case 112:
          viewPort.ucsYAxis = parsePoint();
          curr = scanner.next();
          break;

        case 110:
          viewPort.ucsOrigin = parsePoint();
          curr = scanner.next();
          break;

        case 281:
          viewPort.renderMode = curr.value;
          curr = scanner.next();
          break;

        case 281:
          // 0 is one distant light, 1 is two distant lights
          viewPort.defaultLightingType = curr.value;
          curr = scanner.next();
          break;

        case 292:
          viewPort.defaultLightingOn = curr.value;
          curr = scanner.next();
          break;

        case 330:
          viewPort.ownerHandle = curr.value;
          curr = scanner.next();
          break;

        case 63: // These are all ambient color. Perhaps should be a gradient when multiple are set.

        case 421:
        case 431:
          viewPort.ambientColor = curr.value;
          curr = scanner.next();
          break;

        case 0:
          // New ViewPort
          if (curr.value === 'VPORT') {
            _loglevel.default.debug('}');

            viewPorts.push(viewPort);

            _loglevel.default.debug('ViewPort {');

            viewPort = {};
            curr = scanner.next();
          }

          break;

        default:
          logUnhandledGroup(curr);
          curr = scanner.next();
          break;
      }
    } // Note: do not call scanner.next() here,
    //  parseTable() needs the current group


    _loglevel.default.debug('}');

    viewPorts.push(viewPort);
    return viewPorts;
  };

  var parseLineTypes = function () {
    var ltypes = {},
        ltypeName,
        ltype = {},
        length;

    _loglevel.default.debug('LType {');

    curr = scanner.next();

    while (!groupIs(0, 'ENDTAB')) {
      switch (curr.code) {
        case 2:
          ltype.name = curr.value;
          ltypeName = curr.value;
          curr = scanner.next();
          break;

        case 3:
          ltype.description = curr.value;
          curr = scanner.next();
          break;

        case 73:
          // Number of elements for this line type (dots, dashes, spaces);
          length = curr.value;
          if (length > 0) ltype.pattern = [];
          curr = scanner.next();
          break;

        case 40:
          // total pattern length
          ltype.patternLength = curr.value;
          curr = scanner.next();
          break;

        case 49:
          ltype.pattern.push(curr.value);
          curr = scanner.next();
          break;

        case 0:
          _loglevel.default.debug('}');

          if (length > 0 && length !== ltype.pattern.length) _loglevel.default.warn('lengths do not match on LTYPE pattern');
          ltypes[ltypeName] = ltype;
          ltype = {};

          _loglevel.default.debug('LType {');

          curr = scanner.next();
          break;

        default:
          curr = scanner.next();
      }
    }

    _loglevel.default.debug('}');

    ltypes[ltypeName] = ltype;
    return ltypes;
  };

  var parseLayers = function () {
    var layers = {},
        layerName,
        layer = {};

    _loglevel.default.debug('Layer {');

    curr = scanner.next();

    while (!groupIs(0, 'ENDTAB')) {
      switch (curr.code) {
        case 2:
          // layer name
          layer.name = curr.value;
          layerName = curr.value;
          curr = scanner.next();
          break;

        case 62:
          // color, visibility
          layer.visible = curr.value >= 0; // TODO 0 and 256 are BYBLOCK and BYLAYER respectively. Need to handle these values for layers?.

          layer.colorIndex = Math.abs(curr.value);
          layer.color = getAcadColor(layer.colorIndex);
          curr = scanner.next();
          break;

        case 70:
          // frozen layer
          layer.frozen = (curr.value & 1) != 0 || (curr.value & 2) != 0;
          curr = scanner.next();
          break;

        case 0:
          // New Layer
          if (curr.value === 'LAYER') {
            _loglevel.default.debug('}');

            layers[layerName] = layer;

            _loglevel.default.debug('Layer {');

            layer = {};
            layerName = undefined;
            curr = scanner.next();
          }

          break;

        default:
          logUnhandledGroup(curr);
          curr = scanner.next();
          break;
      }
    } // Note: do not call scanner.next() here,
    //  parseLayerTable() needs the current group


    _loglevel.default.debug('}');

    layers[layerName] = layer;
    return layers;
  };

  var tableDefinitions = {
    VPORT: {
      tableRecordsProperty: 'viewPorts',
      tableName: 'viewPort',
      dxfSymbolName: 'VPORT',
      parseTableRecords: parseViewPortRecords
    },
    LTYPE: {
      tableRecordsProperty: 'lineTypes',
      tableName: 'lineType',
      dxfSymbolName: 'LTYPE',
      parseTableRecords: parseLineTypes
    },
    LAYER: {
      tableRecordsProperty: 'layers',
      tableName: 'layer',
      dxfSymbolName: 'LAYER',
      parseTableRecords: parseLayers
    }
  };
  /**
   * Is called after the parser first reads the 0:ENTITIES group. The scanner
   * should be on the start of the first entity already.
   * @return {Array} the resulting entities
   */

  var parseEntities = function (forBlock) {
    var entities = [];
    var endingOnValue = forBlock ? 'ENDBLK' : 'ENDSEC';

    if (!forBlock) {
      curr = scanner.next();
    }

    while (true) {
      if (curr.code === 0) {
        if (curr.value === endingOnValue) {
          break;
        }

        var entity;
        var handler = self._entityHandlers[curr.value];

        if (handler != null) {
          _loglevel.default.debug(curr.value + ' {');

          entity = handler.parseEntity(scanner, curr);
          curr = scanner.lastReadGroup;

          _loglevel.default.debug('}');
        } else {
          _loglevel.default.warn('Unhandled entity ' + curr.value);

          curr = scanner.next();
          continue;
        }

        ensureHandle(entity);
        entities.push(entity);
      } else {
        // ignored lines from unsupported entity
        curr = scanner.next();
      }
    }

    if (endingOnValue == 'ENDSEC') curr = scanner.next(); // swallow up ENDSEC, but not ENDBLK

    return entities;
  };
  /**
   * Parses a 2D or 3D point, returning it as an object with x, y, and
   * (sometimes) z property if it is 3D. It is assumed the current group
   * is x of the point being read in, and scanner.next() will return the
   * y. The parser will determine if there is a z point automatically.
   * @return {Object} The 2D or 3D point as an object with x, y[, z]
   */


  var parsePoint = function () {
    var point = {},
        code = curr.code;
    point.x = curr.value;
    code += 10;
    curr = scanner.next();
    if (curr.code != code) throw new Error('Expected code for point value to be ' + code + ' but got ' + curr.code + '.');
    point.y = curr.value;
    code += 10;
    curr = scanner.next();

    if (curr.code != code) {
      scanner.rewind();
      return point;
    }

    point.z = curr.value;
    return point;
  };

  var ensureHandle = function (entity) {
    if (!entity) throw new TypeError('entity cannot be undefined or null');
    if (!entity.handle) entity.handle = lastHandle++;
  };

  parseAll();
  return dxf;
};

function logUnhandledGroup(curr) {
  _loglevel.default.debug('unhandled group ' + debugCode(curr));
}

function debugCode(curr) {
  return curr.code + ':' + curr.value;
}
/**
 * Returns the truecolor value of the given AutoCad color index value
 * @return {Number} truecolor value as a number
 */


function getAcadColor(index) {
  return _AutoCadColorIndex.default[index];
}

const BLOCK_ANONYMOUS_FLAG = 1;
const BLOCK_NON_CONSTANT_FLAG = 2;
const BLOCK_XREF_FLAG = 4;
const BLOCK_XREF_OVERLAY_FLAG = 8;
const BLOCK_EXTERNALLY_DEPENDENT_FLAG = 16;
const BLOCK_RESOLVED_OR_DEPENDENT_FLAG = 32;
const BLOCK_REFERENCED_XREF = 64;
/* Notes */
// Code 6 of an entity indicates inheritance of properties (eg. color).
//   BYBLOCK means inherits from block
//   BYLAYER (default) mean inherits from layer
},{"./DxfArrayScanner":"node_modules/dxf-parser/src/DxfArrayScanner.js","./AutoCadColorIndex":"node_modules/dxf-parser/src/AutoCadColorIndex.js","./entities/3dface":"node_modules/dxf-parser/src/entities/3dface.js","./entities/arc":"node_modules/dxf-parser/src/entities/arc.js","./entities/attdef":"node_modules/dxf-parser/src/entities/attdef.js","./entities/circle":"node_modules/dxf-parser/src/entities/circle.js","./entities/dimension":"node_modules/dxf-parser/src/entities/dimension.js","./entities/ellipse":"node_modules/dxf-parser/src/entities/ellipse.js","./entities/insert":"node_modules/dxf-parser/src/entities/insert.js","./entities/line":"node_modules/dxf-parser/src/entities/line.js","./entities/lwpolyline":"node_modules/dxf-parser/src/entities/lwpolyline.js","./entities/mtext":"node_modules/dxf-parser/src/entities/mtext.js","./entities/point":"node_modules/dxf-parser/src/entities/point.js","./entities/polyline":"node_modules/dxf-parser/src/entities/polyline.js","./entities/solid":"node_modules/dxf-parser/src/entities/solid.js","./entities/spline":"node_modules/dxf-parser/src/entities/spline.js","./entities/text":"node_modules/dxf-parser/src/entities/text.js","loglevel":"node_modules/loglevel/lib/loglevel.js"}],"node_modules/dxf-parser/src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DxfParser = _interopRequireDefault(require("./DxfParser.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _DxfParser.default;
exports.default = _default;
},{"./DxfParser.js":"node_modules/dxf-parser/src/DxfParser.js"}],"node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"src/dxf-parser/DxfScanner.ts":[function(require,module,exports) {
var process = require("process");
"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
  }

  __setModuleDefault(result, mod);

  return result;
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var readline = __importStar(require("readline"));

var fs = __importStar(require("fs"));

var dxf_parser_1 = __importDefault(require("dxf-parser"));

var Layer =
/** @class */
function () {
  function Layer(name, height) {
    this.height = height;
    this.name = name;
  }

  return Layer;
}();

var DxfReader =
/** @class */
function () {
  function DxfReader() {
    this.LayersType = {};
    this.addButton = document.getElementById('AddLayer');
    this.addButton.addEventListener('click', this.listenAddButton.bind(this));
    this.nameAdd = document.getElementById('layerName');
    this.heightAdd = document.getElementById('layerHeight');
    this.LayerListElement = document.getElementById('LayerList');
  }

  DxfReader.prototype.GetDxfFile = function (file) {
    this.ClearLayers();
    var parser = new dxf_parser_1.default();
    this.dxf = parser.parseSync(file);
    var layers = this.dxf.tables.layer.layers;

    for (var layerName in layers) {
      this.AddLayer(layerName, 16);
    }
  };

  DxfReader.prototype.listenAddButton = function () {
    var name = this.nameAdd.value;
    var height = Number(this.heightAdd.value);
    this.AddLayer(name, height);
  };

  DxfReader.prototype.Line = function (filePath) {
    var rd = readline.createInterface(fs.createReadStream(filePath), process.stdout);
    rd.on('line', function (line) {
      console.log(line);
    });
  };

  DxfReader.prototype.ClearLayers = function () {
    this.LayerListElement.innerHTML = '';
  };

  DxfReader.prototype.GetRods = function () {
    var rods = [];

    for (var _i = 0, _a = this.dxf.entities; _i < _a.length; _i++) {
      var entity = _a[_i];

      if (entity['layer'] in this.LayersType && entity['type'] === 'CIRCLE') {
        var ds = {
          x: 0,
          y: 0,
          h: 0
        };
        ds.x = parseFloat(entity['center'].x);
        ds.y = parseFloat(entity['center'].y);
        ds.h = this.LayersType[entity['layer']].height;
        rods.push(ds);
      }
    }

    return rods;
  };

  DxfReader.prototype.getLines = function () {
    var linesByLayer = {};

    for (var _i = 0, _a = this.dxf.entities; _i < _a.length; _i++) {
      var entity = _a[_i];

      if (entity['type'] === 'LINE') {
        var ds = {
          point1: {
            x: 0,
            y: 0
          },
          point2: {
            x: 0,
            y: 0
          }
        };
        ds.point1.x = parseFloat(entity['vertices'][0].x);
        ds.point2.y = parseFloat(entity['vertices'][0].y);
        ds.point2.x = parseFloat(entity['vertices'][1].x);
        ds.point2.y = parseFloat(entity['vertices'][1].y);

        if (linesByLayer[entity['layer']] === undefined) {
          linesByLayer[entity['layer']] = [];
        }

        linesByLayer[entity['layer']].push(ds);
      }
    }

    return linesByLayer;
  };

  DxfReader.prototype.AddLayer = function (name, height) {
    var _this = this;

    var layer = new Layer(name, height);
    var liLayer = document.createElement('li');
    liLayer.id = "" + layer.name;
    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = name;
    var heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.value = height.toString();
    var deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger';
    deleteButton.innerHTML = 'Delete';
    liLayer.appendChild(nameInput);
    liLayer.appendChild(heightInput);
    liLayer.appendChild(deleteButton);
    this.LayerListElement.appendChild(liLayer);
    this.LayersType[layer.name] = layer;
    nameInput.addEventListener('change', function () {
      _this.LayersType[layer.name].name = nameInput.value;
    });
    heightInput.addEventListener('change', function () {
      _this.LayersType[layer.name].height = heightInput.value;
    });
    deleteButton.addEventListener('click', function () {
      liLayer.remove();
      delete _this.LayersType[layer.name];
    });
  };

  return DxfReader;
}();

exports.default = DxfReader;
},{"readline":"node_modules/parcel-bundler/src/builtins/_empty.js","fs":"node_modules/parcel-bundler/src/builtins/_empty.js","dxf-parser":"node_modules/dxf-parser/src/index.js","process":"node_modules/process/browser.js"}],"src/utils/utils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function RotationDirection(p1x, p1y, p2x, p2y, p3x, p3y) {
  if ((p3y - p1y) * (p2x - p1x) > (p2y - p1y) * (p3x - p1x)) return 1;else if ((p3y - p1y) * (p2x - p1x) == (p2y - p1y) * (p3x - p1x)) return 0;
  return -1;
}

function containsSegment(x1, y1, x2, y2, sx, sy) {
  if (x1 < x2 && x1 < sx && sx < x2) return true;else if (x2 < x1 && x2 < sx && sx < x1) return true;else if (y1 < y2 && y1 < sy && sy < y2) return true;else if (y2 < y1 && y2 < sy && sy < y1) return true;else if (x1 == sx && y1 == sy || x2 == sx && y2 == sy) return true;
  return false;
}

var Utils = {
  GetDistanceBetween2Point: function GetDistanceBetween2Point(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
  },
  GetAngleBetween2points: function GetAngleBetween2points(point1, point2) {
    var deltaY = point2.y - point1.y;
    var deltaX = point2.x - point1.x;
    var angle = Math.atan(deltaY / deltaX);
    if (deltaX < 0) return angle - Math.PI;
    return angle;
  },
  GetTangentsCircleByPointOld: function GetTangentsCircleByPointOld(pointC, pointP, r) {
    var L = Utils.GetDistanceBetween2Point(pointC, pointP); //distance between point and center of circle

    var alpha = Utils.GetAngleBetween2points(pointC, pointP);
    var lAspic = Math.sqrt(Math.pow(L, 2) - Math.pow(r, 2));
    var fi = Math.acos(r / lAspic);
    var point1 = Utils.GetNewPointComplex(pointP, lAspic, -alpha + fi + Math.PI);
    var point2 = Utils.GetNewPointComplex(pointP, lAspic, -alpha - fi); // console.log('fi', ((-alpha + fi + Math.PI) * 180) / Math.PI)
    // console.log('alpha', ((-alpha - fi + 2 * Math.PI) * 180) / Math.PI)

    var chord = Utils.GetDistanceBetween2Point(point1, point2);
    var fiO = Math.atan(chord / 2 / r);
    return {
      x1: point1.x,
      y1: point1.y,
      x2: point2.x,
      y2: point2.y,
      fi: fiO
    };
  },
  GetTangentsCircleByPoint: function GetTangentsCircleByPoint(pointC, radius, pointP) {
    var dx = pointC.x - pointP.x;
    var dy = pointC.y - pointP.y;
    var dd = Math.sqrt(dx * dx + dy * dy);
    var a = Math.asin(radius / dd);
    var b = Math.atan2(dy, dx);
    var t = b - a;
    var point1 = {
      x: radius * Math.sin(t) + pointC.x,
      y: radius * -Math.cos(t) + pointC.y
    };
    t = b + a;
    var point2 = {
      x: radius * -Math.sin(t) + pointC.x,
      y: radius * Math.cos(t) + pointC.y
    };
    var chord = Utils.GetDistanceBetween2Point(point1, point2);
    var fiO = Math.atan(chord / 2 / radius);
    return {
      point1: point1,
      point2: point2,
      fi: fiO
    };
  },
  GetNewPointComplex: function GetNewPointComplex(point, l, fi) {
    var dX = l * Math.sin(fi);
    var dY = l * Math.cos(fi);
    return {
      x: point.x + dX,
      y: point.y + dY
    };
  },
  LinesHasIntersection: function LinesHasIntersection(line1, line2) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator,
        a,
        b,
        numerator1,
        numerator2,
        result = {
      x: null,
      y: null,
      onLine1: false,
      onLine2: false
    };
    denominator = (line2.point2.y - line2.point1.y) * (line1.point2.x - line1.point1.x) - (line2.point2.x - line2.point1.x) * (line1.point2.y - line1.point1.y);

    if (denominator == 0) {
      return result;
    }

    a = line1.point1.y - line2.point1.y;
    b = line1.point1.x - line2.point1.x;
    numerator1 = (line2.point2.x - line2.point1.x) * a - (line2.point2.y - line2.point1.y) * b;
    numerator2 = (line1.point2.x - line1.point1.x) * a - (line1.point2.y - line1.point1.y) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator; // if we cast these lines infinitely in both directions, they intersect here:

    result.x = line1.point1.x + a * (line1.point2.x - line1.point1.x);
    result.y = line1.point1.y + a * (line1.point2.y - line1.point1.y);
    /*
            // it is worth noting that this should be the same as:
            x = line2.point1.x + (b * (line2.point2.x - line2.point1.x));
            y = line2.point1.x + (b * (line2.point2.y - line2.point1.y));
            */
    // if line1 is a segment and line2 is infinite, they intersect if:

    if (a > 0 && a < 1) {
      result.onLine1 = true;
    } // if line2 is a segment and line1 is infinite, they intersect if:


    if (b > 0 && b < 1) {
      result.onLine2 = true;
    } // if line1 and line2 are segments, they intersect if both of the above are true


    return result.onLine1 && result.onLine2;
  },
  Rx: function Rx(r0, h0, height) {
    return r0 * (h0 - height) / h0;
  },
  Rcx: function Rcx(r0, h0, hc, height) {
    return r0 * (hc - height) / hc;
  }
};
exports.default = Utils;
},{}],"src/lines.app.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var DxfScanner_1 = __importDefault(require("./dxf-parser/DxfScanner"));

var utils_1 = __importDefault(require("./utils/utils"));

var file = document.getElementById('file');
var fileButton = document.getElementById('fileButton');
var LayerDistanceElement = document.getElementById('distanceOnLayer');
var reader = new DxfScanner_1.default();

var ParseLinesDxfFile = function ParseLinesDxfFile() {
  var fileToLoad = file.files[0];
  var fileReader = new FileReader();

  fileReader.onload = function (fileLoadedEvent) {
    // console.log(fileLoadedEvent.target.result.toString())
    reader.GetDxfFile(fileLoadedEvent.target.result.toString());
    var LinesByLayer = reader.getLines(); // const distanceBylayer = {}

    console.log(LinesByLayer);

    for (var layer in LinesByLayer) {
      var distance = 0;

      for (var _i = 0, _a = LinesByLayer[layer]; _i < _a.length; _i++) {
        var layerLinesKey = _a[_i];
        distance += utils_1.default.GetDistanceBetween2Point(layerLinesKey.point1, layerLinesKey.point2);
      } // distanceBylayer[layer] = distance


      console.log(layer);
      var liLayer = document.createElement('li');
      liLayer.id = "" + layer;
      var nameList = document.createElement('span');
      nameList.innerText = layer + "  :";
      var valueList = document.createElement('span');
      valueList.innerText = "" + distance;
      liLayer.appendChild(nameList);
      liLayer.appendChild(valueList);
      LayerDistanceElement.appendChild(liLayer);
    }
  };

  fileReader.readAsText(fileToLoad, 'UTF-8');
};

fileButton.addEventListener('click', ParseLinesDxfFile);
},{"./dxf-parser/DxfScanner":"src/dxf-parser/DxfScanner.ts","./utils/utils":"src/utils/utils.ts"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57774" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/lines.app.ts"], null)
//# sourceMappingURL=/lines.app.275c3b5c.js.map