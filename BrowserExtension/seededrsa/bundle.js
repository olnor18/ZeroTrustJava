(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rsagen = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":3,"ieee754":5}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function eventListener() {
      if (errorListener !== undefined) {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };
    var errorListener;

    // Adding an error listener is not optional because
    // if an error is thrown on an event emitter we cannot
    // guarantee that the actual event we are waiting will
    // be fired. The result could be a silent way to create
    // memory or file descriptor leaks, which is something
    // we should avoid.
    if (name !== 'error') {
      errorListener = function errorListener(err) {
        emitter.removeListener(name, eventListener);
        reject(err);
      };

      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}

},{}],5:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],6:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],7:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],8:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
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
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
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
    while(len) {
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
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
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

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],9:[function(require,module,exports){
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":3}],10:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/lib/_stream_readable.js');
Stream.Writable = require('readable-stream/lib/_stream_writable.js');
Stream.Duplex = require('readable-stream/lib/_stream_duplex.js');
Stream.Transform = require('readable-stream/lib/_stream_transform.js');
Stream.PassThrough = require('readable-stream/lib/_stream_passthrough.js');
Stream.finished = require('readable-stream/lib/internal/streams/end-of-stream.js')
Stream.pipeline = require('readable-stream/lib/internal/streams/pipeline.js')

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":4,"inherits":6,"readable-stream/lib/_stream_duplex.js":12,"readable-stream/lib/_stream_passthrough.js":13,"readable-stream/lib/_stream_readable.js":14,"readable-stream/lib/_stream_transform.js":15,"readable-stream/lib/_stream_writable.js":16,"readable-stream/lib/internal/streams/end-of-stream.js":20,"readable-stream/lib/internal/streams/pipeline.js":22}],11:[function(require,module,exports){
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError =
  /*#__PURE__*/
  function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
module.exports.codes = codes;

},{}],12:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.
'use strict';
/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];

  for (var key in obj) {
    keys.push(key);
  }

  return keys;
};
/*</replacement>*/


module.exports = Duplex;

var Readable = require('./_stream_readable');

var Writable = require('./_stream_writable');

require('inherits')(Duplex, Readable);

{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);

  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;

  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;

    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
}); // the no-half-open enforcer

function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return; // no more data can be written.
  // But allow more writes to happen in this tick.

  process.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }

    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});
}).call(this)}).call(this,require('_process'))
},{"./_stream_readable":14,"./_stream_writable":16,"_process":8,"inherits":6}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.
'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

require('inherits')(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":15,"inherits":6}],14:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict';

module.exports = Readable;
/*<replacement>*/

var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;
/*<replacement>*/

var EE = require('events').EventEmitter;

var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/


var Stream = require('./internal/streams/stream');
/*</replacement>*/


var Buffer = require('buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*<replacement>*/


var debugUtil = require('util');

var debug;

if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/


var BufferList = require('./internal/streams/buffer_list');

var destroyImpl = require('./internal/streams/destroy');

var _require = require('./internal/streams/state'),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = require('../errors').codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT; // Lazy loaded to improve the startup performance.


var StringDecoder;
var createReadableStreamAsyncIterator;
var from;

require('inherits')(Readable, Stream);

var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn); // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.

  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"

  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex); // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()

  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false; // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.

  this.sync = true; // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.

  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'end' (and potentially 'finish')

  this.autoDestroy = !!options.autoDestroy; // has it been destroyed

  this.destroyed = false; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // the number of writers that are awaiting a drain event in .pipe()s

  this.awaitDrain = 0; // if true, a maybeReadMore has been scheduled

  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;

  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');
  if (!(this instanceof Readable)) return new Readable(options); // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex); // legacy

  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }

    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;

Readable.prototype._destroy = function (err, cb) {
  cb(err);
}; // Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.


Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;

      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }

      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
}; // Unshift should *always* be something directly out of read()


Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;

  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);

    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;

        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  } // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.


  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }

  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;

  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }

  return er;
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
}; // backwards compatibility.


Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder; // If setEncoding(null), decoder.encoding equals utf8

  this._readableState.encoding = this._readableState.decoder.encoding; // Iterate over current buffer to convert already stored Buffers:

  var p = this._readableState.buffer.head;
  var content = '';

  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }

  this._readableState.buffer.clear();

  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
}; // Don't raise the hwm > 1GB


var MAX_HWM = 0x40000000;

function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }

  return n;
} // This function is designed to be inlinable, so please take care when making
// changes to the function body.


function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;

  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  } // If we're asking for more than the current hwm, then raise the hwm.


  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n; // Don't have enough

  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }

  return state.length;
} // you can override either this method, or the async _read(n) below.


Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false; // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.

  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state); // if we've ended, and we're now clear, then finish it up.

  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  } // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.
  // if we need a readable event, then we need to do some reading.


  var doRead = state.needReadable;
  debug('need readable', doRead); // if we currently have less than the highWaterMark, then also read some

  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  } // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.


  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true; // if the length is currently zero, then we *need* a readable event.

    if (state.length === 0) state.needReadable = true; // call internal read method

    this._read(state.highWaterMark);

    state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.

    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);
  return ret;
};

function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;

  if (state.decoder) {
    var chunk = state.decoder.end();

    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }

  state.ended = true;

  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;

    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
} // Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.


function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;

  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}

function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);

  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  } // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.


  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
} // at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.


function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length) // didn't get any data, stop spinning.
      break;
  }

  state.readingMore = false;
} // abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.


Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;

    case 1:
      state.pipes = [state.pipes, dest];
      break;

    default:
      state.pipes.push(dest);
      break;
  }

  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);

  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');

    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  } // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.


  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;

  function cleanup() {
    debug('cleanup'); // cleanup event handlers once the pipe is broken

    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true; // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.

    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  src.on('data', ondata);

  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);

    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }

      src.pause();
    }
  } // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.


  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  } // Make sure our error handler is attached before userland ones.


  prependListener(dest, 'error', onerror); // Both close and finish should trigger unpipe, but only once.

  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }

  dest.once('close', onclose);

  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }

  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  } // tell the dest that it's being piped to


  dest.emit('pipe', src); // start the flow if it hasn't been started already.

  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;

    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  }; // if we're not piping anywhere, then do nothing.

  if (state.pipesCount === 0) return this; // just one destination.  most common case.

  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes; // got a match.

    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  } // slow case. multiple pipe destinations.


  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, {
        hasUnpiped: false
      });
    }

    return this;
  } // try to find the right one.


  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
}; // set up data events if they are asked for
// Ensure readable listeners eventually get something


Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;

  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0; // Try start flowing on next tick if stream isn't explicitly paused

    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);

      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }

  return res;
};

Readable.prototype.addListener = Readable.prototype.on;

Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);

  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);

  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;

  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true; // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
} // pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.


Readable.prototype.resume = function () {
  var state = this._readableState;

  if (!state.flowing) {
    debug('resume'); // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()

    state.flowing = !state.readableListening;
    resume(this, state);
  }

  state.paused = false;
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  debug('resume', state.reading);

  if (!state.reading) {
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);

  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }

  this._readableState.paused = true;
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);

  while (state.flowing && stream.read() !== null) {
    ;
  }
} // wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.


Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');

    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk); // don't skip over falsy values in objectMode

    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);

    if (!ret) {
      paused = true;
      stream.pause();
    }
  }); // proxy all the other methods.
  // important when wrapping filters and duplexes.

  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  } // proxy certain important events.


  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  } // when we try to consume some more bytes, simply unpause the
  // underlying stream.


  this._read = function (n) {
    debug('wrapped _read', n);

    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = require('./internal/streams/async_iterator');
    }

    return createReadableStreamAsyncIterator(this);
  };
}

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
}); // exposed for testing purposes only.

Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
}); // Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.

function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length); // Check that we didn't get one last unshift.

  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');

    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;

      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}

if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = require('./internal/streams/from');
    }

    return from(Readable, iterable, opts);
  };
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }

  return -1;
}
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":11,"./_stream_duplex":12,"./internal/streams/async_iterator":17,"./internal/streams/buffer_list":18,"./internal/streams/destroy":19,"./internal/streams/from":21,"./internal/streams/state":23,"./internal/streams/stream":24,"_process":8,"buffer":3,"events":4,"inherits":6,"string_decoder/":25,"util":2}],15:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.
'use strict';

module.exports = Transform;

var _require$codes = require('../errors').codes,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
    ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;

var Duplex = require('./_stream_duplex');

require('inherits')(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;

  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }

  ts.writechunk = null;
  ts.writecb = null;
  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;

  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  }; // start out asking for a readable event once data is transformed.

  this._readableState.needReadable = true; // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.

  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  } // When the writable side finishes, then flush out anything remaining.


  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
}; // This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.


Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;

  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
}; // Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.


Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;

    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data); // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided

  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}
},{"../errors":11,"./_stream_duplex":12,"inherits":6}],16:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.
'use strict';

module.exports = Writable;
/* <replacement> */

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
} // It seems a linked list but it is not
// there will be only 2 of these for each stream


function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/


var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;
/*<replacement>*/

var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/

var Stream = require('./internal/streams/stream');
/*</replacement>*/


var Buffer = require('buffer').Buffer;

var OurUint8Array = global.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

var destroyImpl = require('./internal/streams/destroy');

var _require = require('./internal/streams/state'),
    getHighWaterMark = _require.getHighWaterMark;

var _require$codes = require('../errors').codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
    ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
    ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
    ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;

var errorOrDestroy = destroyImpl.errorOrDestroy;

require('inherits')(Writable, Stream);

function nop() {}

function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag to indicate whether or not this stream
  // contains buffers or objects.

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()

  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex); // if _final has been called

  this.finalCalled = false; // drain event flag.

  this.needDrain = false; // at the start of calling end()

  this.ending = false; // when end() has been called, and returned

  this.ended = false; // when 'finish' is emitted

  this.finished = false; // has it been destroyed

  this.destroyed = false; // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.

  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.

  this.length = 0; // a flag to see when we're in the middle of a write.

  this.writing = false; // when true all writes will be buffered until .uncork() call

  this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.

  this.sync = true; // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.

  this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

  this.onwrite = function (er) {
    onwrite(stream, er);
  }; // the callback that the user supplies to write(chunk,encoding,cb)


  this.writecb = null; // the amount that is being written when _write is called.

  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted

  this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams

  this.prefinished = false; // True if the error was already emitted and should not be thrown again

  this.errorEmitted = false; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'finish' (and potentially 'end')

  this.autoDestroy = !!options.autoDestroy; // count buffered requests

  this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two

  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];

  while (current) {
    out.push(current);
    current = current.next;
  }

  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})(); // Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.


var realHasInstance;

if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex'); // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.
  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex); // legacy.

  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
} // Otherwise people can pipe Writable streams, which is just wrong.


Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};

function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END(); // TODO: defer error events consistently everywhere, not just the cb

  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
} // Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.


function validChunk(stream, state, chunk, cb) {
  var er;

  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }

  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }

  return true;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};

Writable.prototype.cork = function () {
  this._writableState.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }

  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
}); // if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.

function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);

    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }

  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };

    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }

    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er); // this can emit finish, and it will always happen
    // after error

    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er); // this can emit finish, but finish must
    // always follow error

    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
} // Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.


function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
} // if there's something in the buffer waiting, then process it


function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;

    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }

    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish); // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite

    state.pendingcb++;
    state.lastBufferedRequest = null;

    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }

    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--; // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.

      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding); // .end() fully uncorks

  if (state.corked) {
    state.corked = 1;
    this.uncork();
  } // ignore unnecessary end() calls.


  if (!state.ending) endWritable(this, state, cb);
  return this;
};

Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;

    if (err) {
      errorOrDestroy(stream, err);
    }

    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}

function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);

  if (need) {
    prefinish(stream, state);

    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');

      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;

        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }

  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);

  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }

  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;

  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  } // reuse the free corkReq.


  state.corkedRequestsFree.next = corkReq;
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }

    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;

Writable.prototype._destroy = function (err, cb) {
  cb(err);
};
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":11,"./_stream_duplex":12,"./internal/streams/destroy":19,"./internal/streams/state":23,"./internal/streams/stream":24,"_process":8,"buffer":3,"inherits":6,"util-deprecate":26}],17:[function(require,module,exports){
(function (process){(function (){
'use strict';

var _Object$setPrototypeO;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var finished = require('./end-of-stream');

var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');

function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}

function readAndResolve(iter) {
  var resolve = iter[kLastResolve];

  if (resolve !== null) {
    var data = iter[kStream].read(); // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'

    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}

function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}

function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }

      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}

var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },

  next: function next() {
    var _this = this;

    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];

    if (error !== null) {
      return Promise.reject(error);
    }

    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }

    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    } // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time


    var lastPromise = this[kLastPromise];
    var promise;

    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();

      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }

      promise = new Promise(this[kHandlePromise]);
    }

    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;

  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);

var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;

  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();

      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject]; // reject if we are waiting for data in the Promise
      // returned by next() and store the error

      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }

      iterator[kError] = err;
      return;
    }

    var resolve = iterator[kLastResolve];

    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }

    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};

module.exports = createReadableStreamAsyncIterator;
}).call(this)}).call(this,require('_process'))
},{"./end-of-stream":20,"_process":8}],18:[function(require,module,exports){
'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('buffer'),
    Buffer = _require.Buffer;

var _require2 = require('util'),
    inspect = _require2.inspect;

var custom = inspect && inspect.custom || 'inspect';

function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}

module.exports =
/*#__PURE__*/
function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;

      while (p = p.next) {
        ret += s + p.data;
      }

      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;

      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }

      return ret;
    } // Consumes a specified amount of bytes or characters from the buffered data.

  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;

      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }

      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    } // Consumes a specified amount of characters from the buffered data.

  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;

      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;

        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Consumes a specified amount of bytes from the buffered data.

  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;

      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;

        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Make sure the linked list only shows the minimal necessary information.

  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread({}, options, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);

  return BufferList;
}();
},{"buffer":3,"util":2}],19:[function(require,module,exports){
(function (process){(function (){
'use strict'; // undocumented cb() API, needed for core, not for public API

function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }

    return this;
  } // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks


  if (this._readableState) {
    this._readableState.destroyed = true;
  } // if this is a duplex stream mark the writable part as destroyed as well


  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });

  return this;
}

function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}

function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.
  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};
}).call(this)}).call(this,require('_process'))
},{"_process":8}],20:[function(require,module,exports){
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).
'use strict';

var ERR_STREAM_PREMATURE_CLOSE = require('../../../errors').codes.ERR_STREAM_PREMATURE_CLOSE;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    callback.apply(this, args);
  };
}

function noop() {}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;

  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };

  var writableEnded = stream._writableState && stream._writableState.finished;

  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };

  var readableEnded = stream._readableState && stream._readableState.endEmitted;

  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };

  var onerror = function onerror(err) {
    callback.call(stream, err);
  };

  var onclose = function onclose() {
    var err;

    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }

    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };

  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };

  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}

module.exports = eos;
},{"../../../errors":11}],21:[function(require,module,exports){
module.exports = function () {
  throw new Error('Readable.from is not available in the browser')
};

},{}],22:[function(require,module,exports){
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).
'use strict';

var eos;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}

var _require$codes = require('../../../errors').codes,
    ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;

function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = require('./end-of-stream');
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true; // request.destroy just do .end - .abort is what we want

    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}

function call(fn) {
  fn();
}

function pipe(from, to) {
  return from.pipe(to);
}

function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}

function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];

  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}

module.exports = pipeline;
},{"../../../errors":11,"./end-of-stream":20}],23:[function(require,module,exports){
'use strict';

var ERR_INVALID_OPT_VALUE = require('../../../errors').codes.ERR_INVALID_OPT_VALUE;

function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}

function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }

    return Math.floor(hwm);
  } // Default value


  return state.objectMode ? 16 : 16 * 1024;
}

module.exports = {
  getHighWaterMark: getHighWaterMark
};
},{"../../../errors":11}],24:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":4}],25:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":9}],26:[function(require,module,exports){
(function (global){(function (){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(require,module,exports){
const RSA = require("./rsa");

module.exports = function generateKey(password) {
    const key = new RSA(password);
    return key.generate(2048).then((key) => {
        return {"privateKey": key.privateKey, "publicKey": key.publicKey}
    })
}
},{"./rsa":64}],28:[function(require,module,exports){
var Buffer = require('safe-buffer').Buffer
var createHash = require('create-hash')
var pbkdf2 = require('pbkdf2').pbkdf2Sync
var randomBytes = require('randombytes')

// use unorm until String.prototype.normalize gets better browser support
var unorm = require('unorm')

var CHINESE_SIMPLIFIED_WORDLIST = require('./wordlists/chinese_simplified.json')
var CHINESE_TRADITIONAL_WORDLIST = require('./wordlists/chinese_traditional.json')
var ENGLISH_WORDLIST = require('./wordlists/english.json')
var FRENCH_WORDLIST = require('./wordlists/french.json')
var ITALIAN_WORDLIST = require('./wordlists/italian.json')
var JAPANESE_WORDLIST = require('./wordlists/japanese.json')
var KOREAN_WORDLIST = require('./wordlists/korean.json')
var SPANISH_WORDLIST = require('./wordlists/spanish.json')
var DEFAULT_WORDLIST = ENGLISH_WORDLIST

var INVALID_MNEMONIC = 'Invalid mnemonic'
var INVALID_ENTROPY = 'Invalid entropy'
var INVALID_CHECKSUM = 'Invalid mnemonic checksum'

function lpad (str, padString, length) {
  while (str.length < length) str = padString + str
  return str
}

function binaryToByte (bin) {
  return parseInt(bin, 2)
}

function bytesToBinary (bytes) {
  return bytes.map(function (x) {
    return lpad(x.toString(2), '0', 8)
  }).join('')
}

function deriveChecksumBits (entropyBuffer) {
  var ENT = entropyBuffer.length * 8
  var CS = ENT / 32
  var hash = createHash('sha256').update(entropyBuffer).digest()

  return bytesToBinary([].slice.call(hash)).slice(0, CS)
}

function salt (password) {
  return 'mnemonic' + (password || '')
}

function mnemonicToSeed (mnemonic, password) {
  var mnemonicBuffer = Buffer.from(unorm.nfkd(mnemonic), 'utf8')
  var saltBuffer = Buffer.from(salt(unorm.nfkd(password)), 'utf8')

  return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512')
}

function mnemonicToSeedHex (mnemonic, password) {
  return mnemonicToSeed(mnemonic, password).toString('hex')
}

function mnemonicToEntropy (mnemonic, wordlist) {
  wordlist = wordlist || DEFAULT_WORDLIST

  var words = unorm.nfkd(mnemonic).split(' ')
  if (words.length % 3 !== 0) throw new Error(INVALID_MNEMONIC)

  // convert word indices to 11 bit binary strings
  var bits = words.map(function (word) {
    var index = wordlist.indexOf(word)
    if (index === -1) throw new Error(INVALID_MNEMONIC)

    return lpad(index.toString(2), '0', 11)
  }).join('')

  // split the binary string into ENT/CS
  var dividerIndex = Math.floor(bits.length / 33) * 32
  var entropyBits = bits.slice(0, dividerIndex)
  var checksumBits = bits.slice(dividerIndex)

  // calculate the checksum and compare
  var entropyBytes = entropyBits.match(/(.{1,8})/g).map(binaryToByte)
  if (entropyBytes.length < 16) throw new Error(INVALID_ENTROPY)
  if (entropyBytes.length > 32) throw new Error(INVALID_ENTROPY)
  if (entropyBytes.length % 4 !== 0) throw new Error(INVALID_ENTROPY)

  var entropy = Buffer.from(entropyBytes)
  var newChecksum = deriveChecksumBits(entropy)
  if (newChecksum !== checksumBits) throw new Error(INVALID_CHECKSUM)

  return entropy.toString('hex')
}

function entropyToMnemonic (entropy, wordlist) {
  if (!Buffer.isBuffer(entropy)) entropy = Buffer.from(entropy, 'hex')
  wordlist = wordlist || DEFAULT_WORDLIST

  // 128 <= ENT <= 256
  if (entropy.length < 16) throw new TypeError(INVALID_ENTROPY)
  if (entropy.length > 32) throw new TypeError(INVALID_ENTROPY)
  if (entropy.length % 4 !== 0) throw new TypeError(INVALID_ENTROPY)

  var entropyBits = bytesToBinary([].slice.call(entropy))
  var checksumBits = deriveChecksumBits(entropy)

  var bits = entropyBits + checksumBits
  var chunks = bits.match(/(.{1,11})/g)
  var words = chunks.map(function (binary) {
    var index = binaryToByte(binary)
    return wordlist[index]
  })

  return wordlist === JAPANESE_WORDLIST ? words.join('\u3000') : words.join(' ')
}

function generateMnemonic (strength, rng, wordlist) {
  strength = strength || 128
  if (strength % 32 !== 0) throw new TypeError(INVALID_ENTROPY)
  rng = rng || randomBytes

  return entropyToMnemonic(rng(strength / 8), wordlist)
}

function validateMnemonic (mnemonic, wordlist) {
  try {
    mnemonicToEntropy(mnemonic, wordlist)
  } catch (e) {
    return false
  }

  return true
}

module.exports = {
  mnemonicToSeed: mnemonicToSeed,
  mnemonicToSeedHex: mnemonicToSeedHex,
  mnemonicToEntropy: mnemonicToEntropy,
  entropyToMnemonic: entropyToMnemonic,
  generateMnemonic: generateMnemonic,
  validateMnemonic: validateMnemonic,
  wordlists: {
    EN: ENGLISH_WORDLIST,
    JA: JAPANESE_WORDLIST,

    chinese_simplified: CHINESE_SIMPLIFIED_WORDLIST,
    chinese_traditional: CHINESE_TRADITIONAL_WORDLIST,
    english: ENGLISH_WORDLIST,
    french: FRENCH_WORDLIST,
    italian: ITALIAN_WORDLIST,
    japanese: JAPANESE_WORDLIST,
    korean: KOREAN_WORDLIST,
    spanish: SPANISH_WORDLIST
  }
}

},{"./wordlists/chinese_simplified.json":29,"./wordlists/chinese_traditional.json":30,"./wordlists/english.json":31,"./wordlists/french.json":32,"./wordlists/italian.json":33,"./wordlists/japanese.json":34,"./wordlists/korean.json":35,"./wordlists/spanish.json":36,"create-hash":38,"pbkdf2":46,"randombytes":51,"safe-buffer":53,"unorm":62}],29:[function(require,module,exports){
module.exports=[
  "τÜä",
  "Σ╕Ç",
  "µÿ»",
  "σ£¿",
  "Σ╕ì",
  "Σ║å",
  "µ£ë",
  "σÆî",
  "Σ║║",
  "Φ┐Ö",
  "Σ╕¡",
  "σñº",
  "Σ╕║",
  "Σ╕è",
  "Σ╕¬",
  "σ¢╜",
  "µêæ",
  "Σ╗Ñ",
  "Φªü",
  "Σ╗û",
  "µù╢",
  "µ¥Ñ",
  "τö¿",
  "Σ╗¼",
  "τöƒ",
  "σê░",
  "Σ╜£",
  "σ£░",
  "Σ║Ä",
  "σç║",
  "σ░▒",
  "σêå",
  "σ»╣",
  "µêÉ",
  "Σ╝Ü",
  "σÅ»",
  "Σ╕╗",
  "σÅæ",
  "σ╣┤",
  "σè¿",
  "σÉî",
  "σ╖Ñ",
  "Σ╣ƒ",
  "Φâ╜",
  "Σ╕ï",
  "Φ┐ç",
  "σ¡É",
  "Φ»┤",
  "Σ║º",
  "τºì",
  "Θ¥ó",
  "ΦÇî",
  "µû╣",
  "σÉÄ",
  "σñÜ",
  "σ«Ü",
  "Φíî",
  "σ¡ª",
  "µ│ò",
  "µëÇ",
  "µ░æ",
  "σ╛ù",
  "τ╗Å",
  "σìü",
  "Σ╕ë",
  "Σ╣ï",
  "Φ┐¢",
  "τ¥Ç",
  "τ¡ë",
  "Θâ¿",
  "σ║ª",
  "σ«╢",
  "τö╡",
  "σè¢",
  "Θçî",
  "σªé",
  "µ░┤",
  "σîû",
  "Θ½ÿ",
  "Φç¬",
  "Σ║î",
  "τÉå",
  "Φ╡╖",
  "σ░Å",
  "τë⌐",
  "τÄ░",
  "σ«₧",
  "σèá",
  "ΘçÅ",
  "Θâ╜",
  "Σ╕ñ",
  "Σ╜ô",
  "σê╢",
  "µ£║",
  "σ╜ô",
  "Σ╜┐",
  "τé╣",
  "Σ╗Ä",
  "Σ╕Ü",
  "µ£¼",
  "σÄ╗",
  "µèè",
  "µÇº",
  "σÑ╜",
  "σ║ö",
  "σ╝Ç",
  "σ«â",
  "σÉê",
  "Φ┐ÿ",
  "σ¢á",
  "τö▒",
  "σà╢",
  "Σ║¢",
  "τä╢",
  "σëì",
  "σñû",
  "σñ⌐",
  "µö┐",
  "σ¢¢",
  "µùÑ",
  "Θéú",
  "τñ╛",
  "Σ╣ë",
  "Σ║ï",
  "σ╣│",
  "σ╜ó",
  "τ¢╕",
  "σà¿",
  "Φí¿",
  "Θù┤",
  "µá╖",
  "Σ╕Ä",
  "σà│",
  "σÉä",
  "Θçì",
  "µû░",
  "τ║┐",
  "σåà",
  "µò░",
  "µ¡ú",
  "σ┐â",
  "σÅì",
  "Σ╜á",
  "µÿÄ",
  "τ£ï",
  "σÄƒ",
  "σÅê",
  "Σ╣ê",
  "σê⌐",
  "µ»ö",
  "µêû",
  "Σ╜å",
  "Φ┤¿",
  "µ░ö",
  "τ¼¼",
  "σÉæ",
  "Θüô",
  "σæ╜",
  "µ¡ñ",
  "σÅÿ",
  "µ¥í",
  "σÅ¬",
  "µ▓í",
  "τ╗ô",
  "Φºú",
  "Θù«",
  "µäÅ",
  "σ╗║",
  "µ£ê",
  "σà¼",
  "µùá",
  "τ│╗",
  "σå¢",
  "σ╛ê",
  "µâà",
  "ΦÇà",
  "µ£Ç",
  "τ½ï",
  "Σ╗ú",
  "µâ│",
  "σ╖▓",
  "ΘÇÜ",
  "σ╣╢",
  "µÅÉ",
  "τ¢┤",
  "Θóÿ",
  "σàÜ",
  "τ¿ï",
  "σ▒ò",
  "Σ║ö",
  "µ₧£",
  "µûÖ",
  "Φ▒í",
  "σæÿ",
  "Θ¥⌐",
  "Σ╜ì",
  "σàÑ",
  "σ╕╕",
  "µûç",
  "µÇ╗",
  "µ¼í",
  "σôü",
  "σ╝Å",
  "µ┤╗",
  "Φ«╛",
  "σÅè",
  "τ«í",
  "τë╣",
  "Σ╗╢",
  "Θò┐",
  "µ▒é",
  "ΦÇü",
  "σñ┤",
  "σƒ║",
  "Φ╡ä",
  "Φ╛╣",
  "µ╡ü",
  "Φ╖»",
  "τ║º",
  "σ░æ",
  "σ¢╛",
  "σ▒▒",
  "τ╗ƒ",
  "µÄÑ",
  "τƒÑ",
  "Φ╛â",
  "σ░å",
  "τ╗ä",
  "Φºü",
  "Φ«í",
  "σê½",
  "σÑ╣",
  "µëï",
  "ΦºÆ",
  "µ£ƒ",
  "µá╣",
  "Φ«║",
  "Φ┐É",
  "σå£",
  "µîç",
  "σçá",
  "Σ╣¥",
  "σî║",
  "σ╝║",
  "µö╛",
  "σå│",
  "ΦÑ┐",
  "Φó½",
  "σ╣▓",
  "σüÜ",
  "σ┐à",
  "µêÿ",
  "σàê",
  "σ¢₧",
  "σêÖ",
  "Σ╗╗",
  "σÅû",
  "µì«",
  "σñä",
  "Θÿƒ",
  "σìù",
  "τ╗Ö",
  "Φë▓",
  "σàë",
  "Θù¿",
  "σì│",
  "Σ┐¥",
  "µ▓╗",
  "σîù",
  "ΘÇá",
  "τÖ╛",
  "Φºä",
  "τâ¡",
  "Θóå",
  "Σ╕â",
  "µ╡╖",
  "σÅú",
  "Σ╕£",
  "σ»╝",
  "σÖ¿",
  "σÄï",
  "σ┐ù",
  "Σ╕û",
  "Θçæ",
  "σó₧",
  "Σ║ë",
  "µ╡Ä",
  "Θÿ╢",
  "µ▓╣",
  "µÇ¥",
  "µ£»",
  "µ₧ü",
  "Σ║ñ",
  "σÅù",
  "Φüö",
  "Σ╗Ç",
  "Φ«ñ",
  "σà¡",
  "σà▒",
  "µ¥â",
  "µö╢",
  "Φ»ü",
  "µö╣",
  "µ╕à",
  "τ╛Ä",
  "σåì",
  "Θçç",
  "Φ╜¼",
  "µ¢┤",
  "σìò",
  "ΘúÄ",
  "σêç",
  "µëô",
  "τÖ╜",
  "µòÖ",
  "ΘÇƒ",
  "Φè▒",
  "σ╕ª",
  "σ«ë",
  "σ£║",
  "Φ║½",
  "Φ╜ª",
  "Σ╛ï",
  "τ£ƒ",
  "σèí",
  "σà╖",
  "Σ╕ç",
  "µ»Å",
  "τ¢«",
  "Φç│",
  "Φ╛╛",
  "Φ╡░",
  "τº»",
  "τñ║",
  "Φ««",
  "σú░",
  "µèÑ",
  "µûù",
  "σ«î",
  "τ▒╗",
  "σà½",
  "τª╗",
  "σìÄ",
  "σÉì",
  "τí«",
  "µëì",
  "τºæ",
  "σ╝á",
  "Σ┐í",
  "Θ⌐¼",
  "Φèé",
  "Φ»¥",
  "τ▒│",
  "µò┤",
  "τ⌐║",
  "σàâ",
  "σå╡",
  "Σ╗è",
  "Θ¢å",
  "µ╕⌐",
  "Σ╝á",
  "σ£ƒ",
  "Φ«╕",
  "µ¡Ñ",
  "τ╛ñ",
  "σ╣┐",
  "τƒ│",
  "Φ«░",
  "Θ£Ç",
  "µ«╡",
  "τáö",
  "τòî",
  "µïë",
  "µ₧ù",
  "σ╛ï",
  "σÅ½",
  "Σ╕ö",
  "τ⌐╢",
  "Φºé",
  "Φ╢è",
  "τ╗ç",
  "Φúà",
  "σ╜▒",
  "τ«ù",
  "Σ╜Ä",
  "µîü",
  "Θƒ│",
  "Σ╝ù",
  "Σ╣ª",
  "σ╕â",
  "σñì",
  "σ«╣",
  "σä┐",
  "Θí╗",
  "ΘÖà",
  "σòå",
  "Θ¥₧",
  "Θ¬î",
  "Φ┐₧",
  "µû¡",
  "µ╖▒",
  "ΘÜ╛",
  "Φ┐æ",
  "τƒ┐",
  "σìâ",
  "σæ¿",
  "σºö",
  "τ┤á",
  "µèÇ",
  "σñç",
  "σìè",
  "σè₧",
  "Θ¥Æ",
  "τ£ü",
  "σêù",
  "Σ╣á",
  "σôì",
  "τ║ª",
  "µö»",
  "Φê¼",
  "σÅ▓",
  "µäƒ",
  "σè│",
  "Σ╛┐",
  "σ¢ó",
  "σ╛Ç",
  "Θà╕",
  "σÄå",
  "σ╕é",
  "σàï",
  "Σ╜ò",
  "ΘÖñ",
  "µ╢ê",
  "µ₧ä",
  "σ║£",
  "τº░",
  "σñ¬",
  "σçå",
  "τ▓╛",
  "σÇ╝",
  "σÅ╖",
  "τÄç",
  "µùÅ",
  "τ╗┤",
  "σêÆ",
  "ΘÇë",
  "µáç",
  "σåÖ",
  "σ¡ÿ",
  "σÇÖ",
  "µ»¢",
  "Σ║▓",
  "σ┐½",
  "µòê",
  "µû»",
  "ΘÖó",
  "µƒÑ",
  "µ▒ƒ",
  "σ₧ï",
  "τ£╝",
  "τÄï",
  "µîë",
  "µá╝",
  "σà╗",
  "µÿô",
  "τ╜«",
  "µ┤╛",
  "σ▒é",
  "τëç",
  "σºï",
  "σì┤",
  "Σ╕ô",
  "τè╢",
  "Φé▓",
  "σÄé",
  "Σ║¼",
  "Φ»å",
  "ΘÇé",
  "σ▒₧",
  "σ£å",
  "σîà",
  "τü½",
  "Σ╜Å",
  "Φ░â",
  "µ╗í",
  "σÄ┐",
  "σ▒Ç",
  "τàº",
  "σÅé",
  "τ║ó",
  "τ╗å",
  "σ╝ò",
  "σÉ¼",
  "Φ»Ñ",
  "Θôü",
  "Σ╗╖",
  "Σ╕Ñ",
  "Θªû",
  "σ║ò",
  "µ╢▓",
  "σ«ÿ",
  "σ╛╖",
  "ΘÜÅ",
  "τùà",
  "ΦïÅ",
  "σñ▒",
  "σ░ö",
  "µ¡╗",
  "Φ«▓",
  "Θàì",
  "σÑ│",
  "Θ╗ä",
  "µÄ¿",
  "µÿ╛",
  "Φ░ê",
  "τ╜¬",
  "τÑ₧",
  "Φë║",
  "σæó",
  "σ╕¡",
  "σÉ½",
  "Σ╝ü",
  "µ£¢",
  "σ»å",
  "µë╣",
  "ΦÉÑ",
  "Θí╣",
  "Θÿ▓",
  "Σ╕╛",
  "τÉâ",
  "Φï▒",
  "µ░º",
  "σè┐",
  "σæè",
  "µ¥Ä",
  "σÅ░",
  "ΦÉ╜",
  "µ£¿",
  "σ╕«",
  "Φ╜«",
  "τá┤",
  "Σ║Ü",
  "σ╕ê",
  "σ¢┤",
  "µ│¿",
  "Φ┐£",
  "σ¡ù",
  "µ¥É",
  "µÄÆ",
  "Σ╛¢",
  "µ▓│",
  "µÇü",
  "σ░ü",
  "σÅª",
  "µû╜",
  "σçÅ",
  "µáæ",
  "µ║╢",
  "µÇÄ",
  "µ¡ó",
  "µíê",
  "Φ¿Ç",
  "σú½",
  "σ¥ç",
  "µ¡ª",
  "σ¢║",
  "σÅ╢",
  "Θ▒╝",
  "µ│ó",
  "Φºå",
  "Σ╗à",
  "Φ┤╣",
  "τ┤º",
  "τê▒",
  "σ╖ª",
  "τ½á",
  "µù⌐",
  "µ£¥",
  "σ«│",
  "τ╗¡",
  "Φ╜╗",
  "µ£ì",
  "Φ»ò",
  "Θúƒ",
  "σàà",
  "σà╡",
  "µ║É",
  "σêñ",
  "µèñ",
  "σÅ╕",
  "Φ╢│",
  "µƒÉ",
  "τ╗â",
  "σ╖«",
  "Φç┤",
  "µ¥┐",
  "τö░",
  "ΘÖì",
  "Θ╗æ",
  "τè»",
  "Φ┤ƒ",
  "σç╗",
  "Φîâ",
  "τ╗º",
  "σà┤",
  "Σ╝╝",
  "Σ╜Ö",
  "σ¥Ü",
  "µ¢▓",
  "Φ╛ô",
  "Σ┐«",
  "µòà",
  "σƒÄ",
  "σñ½",
  "σñƒ",
  "ΘÇü",
  "τ¼ö",
  "Φê╣",
  "σìá",
  "σÅ│",
  "Φ┤ó",
  "σÉâ",
  "σ»î",
  "µÿÑ",
  "Φüî",
  "Φºë",
  "µ▒ë",
  "τö╗",
  "σèƒ",
  "σ╖┤",
  "Φ╖ƒ",
  "ΦÖ╜",
  "µ¥é",
  "Θú₧",
  "µúÇ",
  "σÉ╕",
  "σè⌐",
  "σìç",
  "Θÿ│",
  "Σ║Æ",
  "σê¥",
  "σê¢",
  "µèù",
  "ΦÇâ",
  "µèò",
  "σ¥Å",
  "τ¡û",
  "σÅñ",
  "σ╛ä",
  "µìó",
  "µ£¬",
  "Φ╖æ",
  "τòÖ",
  "ΘÆó",
  "µ¢╛",
  "τ½»",
  "Φ┤ú",
  "τ½Ö",
  "τ«Ç",
  "Φ┐░",
  "ΘÆ▒",
  "σë»",
  "σ░╜",
  "σ╕¥",
  "σ░ä",
  "Φìë",
  "σå▓",
  "µë┐",
  "τï¼",
  "Σ╗ñ",
  "ΘÖÉ",
  "Θÿ┐",
  "σ«ú",
  "τÄ»",
  "σÅî",
  "Φ»╖",
  "Φ╢à",
  "σ╛«",
  "Φ«⌐",
  "µÄº",
  "σ╖₧",
  "Φë»",
  "Φ╜┤",
  "µë╛",
  "σÉª",
  "τ║¬",
  "τ¢è",
  "Σ╛¥",
  "Σ╝ÿ",
  "Θí╢",
  "τíÇ",
  "Φ╜╜",
  "σÇÆ",
  "µê┐",
  "τ¬ü",
  "σ¥É",
  "τ▓ë",
  "µòî",
  "τòÑ",
  "σ«ó",
  "Φóü",
  "σå╖",
  "Φâ£",
  "τ╗¥",
  "µ₧É",
  "σ¥ù",
  "σëé",
  "µ╡ï",
  "Σ╕¥",
  "σìÅ",
  "Φ»ë",
  "σ┐╡",
  "ΘÖê",
  "Σ╗ì",
  "τ╜ù",
  "τ¢É",
  "σÅï",
  "µ┤ï",
  "ΘöÖ",
  "Φïª",
  "σñ£",
  "σêæ",
  "τº╗",
  "Θóæ",
  "ΘÇÉ",
  "Θ¥á",
  "µ╖╖",
  "µ»ì",
  "τƒ¡",
  "τÜ«",
  "τ╗ê",
  "ΦüÜ",
  "µ▒╜",
  "µ¥æ",
  "Σ║æ",
  "σô¬",
  "µùó",
  "Φ╖¥",
  "σì½",
  "σü£",
  "τâê",
  "σñ«",
  "σ»ƒ",
  "τâº",
  "Φ┐à",
  "σóâ",
  "ΦïÑ",
  "σì░",
  "µ┤▓",
  "σê╗",
  "µï¼",
  "µ┐Ç",
  "σ¡ö",
  "µÉ₧",
  "τöÜ",
  "σ«ñ",
  "σ╛à",
  "µá╕",
  "µáí",
  "µòú",
  "Σ╛╡",
  "σÉº",
  "τö▓",
  "µ╕╕",
  "Σ╣à",
  "ΦÅ£",
  "σæ│",
  "µùº",
  "µ¿í",
  "µ╣û",
  "Φ┤º",
  "µìƒ",
  "Θóä",
  "Θÿ╗",
  "µ»½",
  "µÖ«",
  "τ¿│",
  "Σ╣Ö",
  "σªê",
  "µñì",
  "µü»",
  "µë⌐",
  "Θô╢",
  "Φ»¡",
  "µîÑ",
  "ΘàÆ",
  "σ«ê",
  "µï┐",
  "σ║Å",
  "τ║╕",
  "σî╗",
  "τ╝║",
  "Θ¢¿",
  "σÉù",
  "ΘÆê",
  "σêÿ",
  "σòè",
  "µÇÑ",
  "σö▒",
  "Φ»»",
  "Φ«¡",
  "µä┐",
  "σ«í",
  "ΘÖä",
  "ΦÄ╖",
  "Φî╢",
  "Θ▓£",
  "τ▓«",
  "µûñ",
  "σ¡⌐",
  "Φä▒",
  "τí½",
  "ΦéÑ",
  "σûä",
  "Θ╛Ö",
  "µ╝ö",
  "τê╢",
  "µ╕É",
  "ΦíÇ",
  "µ¼ó",
  "µó░",
  "µÄî",
  "µ¡î",
  "µ▓Ö",
  "σêÜ",
  "µö╗",
  "Φ░ô",
  "τ¢╛",
  "Φ«¿",
  "µÖÜ",
  "τ▓Æ",
  "Σ╣▒",
  "τçâ",
  "τƒ¢",
  "Σ╣Ä",
  "µ¥Ç",
  "Φì»",
  "σ«ü",
  "Θ▓ü",
  "Φ┤╡",
  "ΘÆƒ",
  "τàñ",
  "Φ»╗",
  "τÅ¡",
  "Σ╝»",
  "ΘªÖ",
  "Σ╗ï",
  "Φ┐½",
  "σÅÑ",
  "Σ╕░",
  "σƒ╣",
  "µÅí",
  "σà░",
  "µïà",
  "σ╝ª",
  "Φ¢ï",
  "µ▓ë",
  "σüç",
  "τ⌐┐",
  "µëº",
  "τ¡ö",
  "Σ╣É",
  "Φ░ü",
  "Θí║",
  "τâƒ",
  "τ╝⌐",
  "σ╛ü",
  "Φä╕",
  "σû£",
  "µ¥╛",
  "ΦäÜ",
  "σ¢░",
  "σ╝é",
  "σàì",
  "Φâî",
  "µÿƒ",
  "τªÅ",
  "Σ╣░",
  "µƒô",
  "Σ║ò",
  "µªé",
  "µàó",
  "µÇò",
  "τúü",
  "σÇì",
  "τÑû",
  "τÜç",
  "Σ┐â",
  "Θ¥Ö",
  "ΦíÑ",
  "Φ»ä",
  "τ┐╗",
  "Φéë",
  "Φ╖╡",
  "σ░╝",
  "Φíú",
  "σ«╜",
  "µë¼",
  "µúë",
  "σ╕î",
  "Σ╝ñ",
  "µôì",
  "σ₧é",
  "τºï",
  "σ«£",
  "µ░ó",
  "σÑù",
  "τ¥ú",
  "µî»",
  "µ₧╢",
  "Σ║«",
  "µ£½",
  "σ«¬",
  "σ║å",
  "τ╝û",
  "τë¢",
  "Φºª",
  "µÿá",
  "Θ¢╖",
  "ΘöÇ",
  "Φ»ù",
  "σ║º",
  "σ▒à",
  "µèô",
  "Φúé",
  "Φâ₧",
  "σæ╝",
  "σ¿ÿ",
  "µÖ»",
  "σ¿ü",
  "τ╗┐",
  "µÖ╢",
  "σÄÜ",
  "τ¢ƒ",
  "Φíí",
  "Θ╕í",
  "σ¡Ö",
  "σ╗╢",
  "σì▒",
  "Φâ╢",
  "σ▒ï",
  "Σ╣í",
  "Σ╕┤",
  "ΘÖå",
  "Θí╛",
  "µÄë",
  "σæÇ",
  "τü»",
  "σ▓ü",
  "µÄ¬",
  "µ¥ƒ",
  "ΦÇÉ",
  "σëº",
  "τÄë",
  "Φ╡╡",
  "Φ╖│",
  "σôÑ",
  "σ¡ú",
  "Φ»╛",
  "σç»",
  "Φâí",
  "Θó¥",
  "µ¼╛",
  "τ╗ì",
  "σì╖",
  "Θ╜É",
  "Σ╝ƒ",
  "ΦÆ╕",
  "µ«û",
  "µ░╕",
  "σ«ù",
  "Φïù",
  "σ╖¥",
  "τéë",
  "σ▓⌐",
  "σ╝▒",
  "Θ¢╢",
  "µ¥¿",
  "σÑÅ",
  "µ▓┐",
  "Θ£▓",
  "µ¥å",
  "µÄó",
  "µ╗æ",
  "Θòç",
  "ΘÑ¡",
  "µ╡ô",
  "Φê¬",
  "µÇÇ",
  "Φ╡╢",
  "σ║ô",
  "σñ║",
  "Σ╝è",
  "τü╡",
  "τ¿Ä",
  "ΘÇö",
  "τü¡",
  "Φ╡¢",
  "σ╜Æ",
  "σÅ¼",
  "Θ╝ô",
  "µÆ¡",
  "τ¢ÿ",
  "Φúü",
  "ΘÖ⌐",
  "σ║╖",
  "σö»",
  "σ╜ò",
  "ΦÅî",
  "τ║»",
  "σÇƒ",
  "τ│û",
  "τ¢û",
  "µ¿¬",
  "τ¼ª",
  "τºü",
  "σè¬",
  "σáé",
  "σƒƒ",
  "µ₧¬",
  "µ╢ª",
  "σ╣à",
  "σôê",
  "τ½ƒ",
  "τåƒ",
  "ΦÖ½",
  "µ│╜",
  "Φäæ",
  "σúñ",
  "τó│",
  "µ¼º",
  "Θüì",
  "Σ╛º",
  "σ»¿",
  "µòó",
  "σ╜╗",
  "ΦÖæ",
  "µû£",
  "Φûä",
  "σ║¡",
  "τ║│",
  "σ╝╣",
  "ΘÑ▓",
  "Σ╝╕",
  "µèÿ",
  "Θ║ª",
  "µ╣┐",
  "µÜù",
  "Φì╖",
  "τôª",
  "σí₧",
  "σ║è",
  "τ¡æ",
  "µü╢",
  "µê╖",
  "Φ«┐",
  "σíö",
  "σÑç",
  "ΘÇÅ",
  "µóü",
  "σêÇ",
  "µùï",
  "Φ┐╣",
  "σìí",
  "µ░»",
  "Θüç",
  "Σ╗╜",
  "µ»Æ",
  "µ│Ñ",
  "ΘÇÇ",
  "µ┤ù",
  "µæå",
  "τü░",
  "σ╜⌐",
  "σìû",
  "ΦÇù",
  "σñÅ",
  "µï⌐",
  "σ┐Ö",
  "Θô£",
  "τî«",
  "τí¼",
  "Σ║ê",
  "τ╣ü",
  "σ£ê",
  "Θ¢¬",
  "σç╜",
  "Σ║ª",
  "µè╜",
  "τ»ç",
  "Θÿ╡",
  "Θÿ┤",
  "Σ╕ü",
  "σ░║",
  "Φ┐╜",
  "σáå",
  "Θ¢ä",
  "Φ┐Ä",
  "µ│¢",
  "τê╕",
  "µÑ╝",
  "Θü┐",
  "Φ░ï",
  "σÉ¿",
  "ΘçÄ",
  "τî¬",
  "µùù",
  "τ┤»",
  "σüÅ",
  "σà╕",
  "Θªå",
  "τ┤ó",
  "τºª",
  "Φäé",
  "µ╜«",
  "τê╖",
  "Φ▒å",
  "σ┐╜",
  "µëÿ",
  "µâè",
  "σíæ",
  "Θüù",
  "µäê",
  "µ£▒",
  "µ¢┐",
  "τ║ñ",
  "τ▓ù",
  "σÇ╛",
  "σ░Ü",
  "τù¢",
  "µÑÜ",
  "Φ░ó",
  "σÑï",
  "Φ┤¡",
  "τú¿",
  "σÉ¢",
  "µ▒á",
  "µùü",
  "τóÄ",
  "Θ¬¿",
  "τ¢æ",
  "µìò",
  "σ╝ƒ",
  "µÜ┤",
  "σë▓",
  "Φ┤»",
  "µ«è",
  "Θçè",
  "Φ»ì",
  "Σ║í",
  "σúü",
  "Θí┐",
  "σ«¥",
  "σìê",
  "σ░ÿ",
  "Θù╗",
  "µÅ¡",
  "τé«",
  "µ«ï",
  "σå¼",
  "µíÑ",
  "σªç",
  "Φ¡ª",
  "τ╗╝",
  "µï¢",
  "σÉ┤",
  "Σ╗ÿ",
  "µ╡«",
  "Θü¡",
  "σ╛É",
  "µé¿",
  "µæç",
  "Φ░╖",
  "Φ╡₧",
  "τ«▒",
  "ΘÜö",
  "Φ«ó",
  "τö╖",
  "σÉ╣",
  "σ¢¡",
  "τ║╖",
  "σöÉ",
  "Φ┤Ñ",
  "σ«ï",
  "τÄ╗",
  "σ╖¿",
  "ΦÇò",
  "σ¥ª",
  "Φìú",
  "Θù¡",
  "µ╣╛",
  "Θö«",
  "σçí",
  "Θ⌐╗",
  "Θöà",
  "µòæ",
  "µü⌐",
  "σëÑ",
  "σç¥",
  "τó▒",
  "Θ╜┐",
  "µê¬",
  "τé╝",
  "Θ║╗",
  "τ║║",
  "τªü",
  "σ║ƒ",
  "τ¢¢",
  "τëê",
  "τ╝ô",
  "σçÇ",
  "τ¥¢",
  "µÿî",
  "σ⌐Ü",
  "µ╢ë",
  "τ¡Æ",
  "σÿ┤",
  "µÅÆ",
  "σ▓╕",
  "µ£ù",
  "σ║ä",
  "Φíù",
  "ΦùÅ",
  "σºæ",
  "Φ┤╕",
  "ΦàÉ",
  "σÑ┤",
  "σòª",
  "µâ»",
  "Σ╣ÿ",
  "Σ╝Ö",
  "µüó",
  "σîÇ",
  "τ║▒",
  "µëÄ",
  "Φ╛⌐",
  "ΦÇ│",
  "σ╜¬",
  "Φçú",
  "Σ║┐",
  "τÆâ",
  "µè╡",
  "Φäë",
  "τºÇ",
  "ΦÉ¿",
  "Σ┐ä",
  "τ╜æ",
  "Φê₧",
  "σ║ù",
  "σû╖",
  "τ║╡",
  "σ»╕",
  "µ▒ù",
  "µîé",
  "µ┤¬",
  "Φ┤║",
  "Θù¬",
  "µƒ¼",
  "τêå",
  "τâ»",
  "µ┤Ñ",
  "τ¿╗",
  "σóÖ",
  "Φ╜»",
  "σïç",
  "σâÅ",
  "µ╗Ü",
  "σÄÿ",
  "ΦÆÖ",
  "Φè│",
  "Φé»",
  "σ¥í",
  "µƒ▒",
  "Φìí",
  "Φà┐",
  "Σ╗¬",
  "µùà",
  "σ░╛",
  "Φ╜º",
  "σå░",
  "Φ┤í",
  "τÖ╗",
  "Θ╗Ä",
  "σëè",
  "ΘÆ╗",
  "σïÆ",
  "ΘÇâ",
  "ΘÜ£",
  "µ░¿",
  "Θâ¡",
  "σ│░",
  "σ╕ü",
  "µ╕»",
  "Σ╝Å",
  "Φ╜¿",
  "Σ║⌐",
  "µ»ò",
  "µôª",
  "ΦÄ½",
  "σê║",
  "µ╡¬",
  "τºÿ",
  "µÅ┤",
  "µá¬",
  "σüÑ",
  "σö«",
  "Φéí",
  "σ▓¢",
  "τöÿ",
  "µ│í",
  "τ¥í",
  "τ½Ñ",
  "Θô╕",
  "µ▒ñ",
  "ΘÿÇ",
  "Σ╝æ",
  "µ▒ç",
  "Φêì",
  "τëº",
  "τ╗ò",
  "τé╕",
  "σô▓",
  "τú╖",
  "τ╗⌐",
  "µ£ï",
  "µ╖í",
  "σ░û",
  "σÉ»",
  "ΘÖ╖",
  "µƒ┤",
  "σæê",
  "σ╛Æ",
  "Θó£",
  "µ│¬",
  "τ¿ì",
  "σ┐ÿ",
  "µ│╡",
  "Φô¥",
  "µïû",
  "µ┤₧",
  "µÄê",
  "Θò£",
  "Φ╛¢",
  "σú«",
  "Θöï",
  "Φ┤½",
  "ΦÖÜ",
  "σ╝»",
  "µæ⌐",
  "µ│░",
  "σ╣╝",
  "σ╗╖",
  "σ░è",
  "τ¬ù",
  "τ║▓",
  "σ╝ä",
  "ΘÜ╢",
  "τûæ",
  "µ░Å",
  "σ«½",
  "σºÉ",
  "Θ£ç",
  "τæ₧",
  "µÇ¬",
  "σ░ñ",
  "τÉ┤",
  "σ╛¬",
  "µÅÅ",
  "Φå£",
  "Φ┐¥",
  "σñ╣",
  "Φà░",
  "τ╝ÿ",
  "τÅá",
  "τ⌐╖",
  "µú«",
  "µ₧¥",
  "τ½╣",
  "µ▓ƒ",
  "σé¼",
  "τ╗│",
  "σ┐å",
  "Θéª",
  "σë⌐",
  "σ╣╕",
  "µ╡å",
  "µáÅ",
  "µïÑ",
  "τëÖ",
  "Φ┤«",
  "τñ╝",
  "µ╗ñ",
  "ΘÆá",
  "τ║╣",
  "τ╜ó",
  "µïì",
  "σÆ▒",
  "σûè",
  "Φóû",
  "σƒâ",
  "σïñ",
  "τ╜Ü",
  "τäª",
  "µ╜£",
  "Σ╝ì",
  "σó¿",
  "µ¼▓",
  "τ╝¥",
  "σºô",
  "σêè",
  "ΘÑ▒",
  "Σ╗┐",
  "σÑû",
  "Θô¥",
  "Θ¼╝",
  "Σ╕╜",
  "Φ╖¿",
  "Θ╗ÿ",
  "µîû",
  "Θô╛",
  "µë½",
  "σû¥",
  "Φóï",
  "τé¡",
  "µ▒í",
  "σ╣ò",
  "Φ»╕",
  "σ╝º",
  "σè▒",
  "µóà",
  "σÑ╢",
  "µ┤ü",
  "τü╛",
  "Φêƒ",
  "Θë┤",
  "Φï»",
  "Φ«╝",
  "µè▒",
  "µ»ü",
  "µçé",
  "σ»Æ",
  "µÖ║",
  "σƒö",
  "σ»ä",
  "σ▒è",
  "Φ╖â",
  "µ╕í",
  "µîæ",
  "Σ╕╣",
  "Φë░",
  "Φ┤¥",
  "τó░",
  "µïö",
  "τê╣",
  "µê┤",
  "τáü",
  "µóª",
  "Φè╜",
  "τåö",
  "Φ╡ñ",
  "µ╕ö",
  "σô¡",
  "µò¼",
  "Θóù",
  "σÑö",
  "Θôà",
  "Σ╗▓",
  "ΦÖÄ",
  "τ¿Ç",
  "σª╣",
  "Σ╣Å",
  "τÅì",
  "τö│",
  "µíî",
  "Θü╡",
  "σàü",
  "ΘÜå",
  "Φ₧║",
  "Σ╗ô",
  "Θ¡Å",
  "ΘöÉ",
  "µÖô",
  "µ░«",
  "σà╝",
  "ΘÜÉ",
  "τóì",
  "Φ╡½",
  "µï¿",
  "σ┐á",
  "Φéâ",
  "τ╝╕",
  "τë╡",
  "µèó",
  "σìÜ",
  "σ╖º",
  "σú│",
  "σàä",
  "µ¥£",
  "Φ«»",
  "Φ»Ü",
  "τóº",
  "τÑÑ",
  "µƒ»",
  "Θí╡",
  "σ╖í",
  "τƒ⌐",
  "µé▓",
  "τüî",
  "Θ╛ä",
  "Σ╝ª",
  "τÑ¿",
  "σ»╗",
  "µíé",
  "Θô║",
  "σ£ú",
  "µüÉ",
  "µü░",
  "Θâæ",
  "Φ╢ú",
  "µè¼",
  "ΦìÆ",
  "Φà╛",
  "Φ┤┤",
  "µƒö",
  "µ╗┤",
  "τî¢",
  "Θÿö",
  "Φ╛å",
  "σª╗",
  "σí½",
  "µÆñ",
  "σé¿",
  "τ¡╛",
  "Θù╣",
  "µë░",
  "τ┤½",
  "τáé",
  "ΘÇÆ",
  "µêÅ",
  "σÉè",
  "ΘÖ╢",
  "Σ╝É",
  "σûé",
  "τûù",
  "τô╢",
  "σ⌐å",
  "µèÜ",
  "Φçé",
  "µæ╕",
  "σ┐ì",
  "ΦÖ╛",
  "Φ£í",
  "Θé╗",
  "Φâ╕",
  "σ╖⌐",
  "µîñ",
  "σü╢",
  "σ╝â",
  "µº╜",
  "σè▓",
  "Σ╣│",
  "Θéô",
  "σÉë",
  "Σ╗ü",
  "τâé",
  "τáû",
  "τºƒ",
  "Σ╣î",
  "Φê░",
  "Σ╝┤",
  "τô£",
  "µ╡à",
  "Σ╕Ö",
  "µÜé",
  "τçÑ",
  "µ⌐í",
  "µƒ│",
  "Φ┐╖",
  "µÜû",
  "τëî",
  "τºº",
  "Φâå",
  "Φ»ª",
  "τ░º",
  "Φ╕Å",
  "τô╖",
  "Φ░▒",
  "σæå",
  "σ«╛",
  "τ│è",
  "µ┤¢",
  "Φ╛ë",
  "µäñ",
  "τ½₧",
  "ΘÜÖ",
  "µÇÆ",
  "τ▓ÿ",
  "Σ╣â",
  "τ╗¬",
  "Φé⌐",
  "τ▒ì",
  "µòÅ",
  "µ╢é",
  "τåÖ",
  "τÜå",
  "Σ╛ª",
  "µé¼",
  "µÄÿ",
  "Σ║½",
  "τ║á",
  "ΘåÆ",
  "τïé",
  "Θöü",
  "µ╖Ç",
  "µü¿",
  "τë▓",
  "Θ£╕",
  "τê¼",
  "Φ╡Å",
  "ΘÇå",
  "τÄ⌐",
  "ΘÖ╡",
  "τÑ¥",
  "τºÆ",
  "µ╡Ö",
  "Φ▓î",
  "σ╜╣",
  "σ╜╝",
  "µéë",
  "Θ╕¡",
  "Φ╢ï",
  "σçñ",
  "µÖ¿",
  "τò£",
  "Φ╛ê",
  "τº⌐",
  "σì╡",
  "τ╜▓",
  "µó»",
  "τéÄ",
  "µ╗⌐",
  "µúï",
  "Θ⌐▒",
  "τ¡¢",
  "σ│í",
  "σåÆ",
  "σòÑ",
  "σ»┐",
  "Φ»æ",
  "µ╡╕",
  "µ│ë",
  "σ╕╜",
  "Φ┐ƒ",
  "τíà",
  "τûå",
  "Φ┤╖",
  "µ╝Å",
  "τ¿┐",
  "σåá",
  "σ½⌐",
  "Φâü",
  "Φè»",
  "τëó",
  "σÅ¢",
  "ΦÜÇ",
  "σÑÑ",
  "Θ╕ú",
  "σ▓¡",
  "τ╛è",
  "σç¡",
  "Σ╕▓",
  "σíÿ",
  "τ╗ÿ",
  "Θà╡",
  "Φ₧ì",
  "τ¢å",
  "Θöí",
  "σ║Ö",
  "τ¡╣",
  "σå╗",
  "Φ╛à",
  "µæä",
  "Φó¡",
  "τ¡ï",
  "µïÆ",
  "σâÜ",
  "µù▒",
  "ΘÆ╛",
  "Θ╕ƒ",
  "µ╝å",
  "µ▓ê",
  "τ£ë",
  "τûÅ",
  "µ╖╗",
  "µúÆ",
  "τ⌐ù",
  "τí¥",
  "Θƒ⌐",
  "ΘÇ╝",
  "µë¡",
  "Σ╛¿",
  "σçë",
  "µî║",
  "τóù",
  "µá╜",
  "τéÆ",
  "µ¥»",
  "µéú",
  "ΘªÅ",
  "σè¥",
  "Φ▒¬",
  "Φ╛╜",
  "σïâ",
  "Θ╕┐",
  "µùª",
  "σÉÅ",
  "µï£",
  "τïù",
  "σƒï",
  "Φ╛è",
  "µÄ⌐",
  "ΘÑ«",
  "µÉ¼",
  "Θ¬é",
  "Φ╛₧",
  "σï╛",
  "µëú",
  "Σ╝░",
  "ΦÆï",
  "τ╗Æ",
  "Θ¢╛",
  "Σ╕ê",
  "µ£╡",
  "σºå",
  "µïƒ",
  "σ«ç",
  "Φ╛æ",
  "ΘÖò",
  "Θ¢ò",
  "σü┐",
  "Φôä",
  "σ┤ç",
  "σë¬",
  "σÇí",
  "σÄà",
  "σÆ¼",
  "Θ⌐╢",
  "Φû»",
  "σê╖",
  "µûÑ",
  "τò¬",
  "Φ╡ï",
  "σÑë",
  "Σ╜¢",
  "µ╡ç",
  "µ╝½",
  "µ¢╝",
  "µëç",
  "ΘÆÖ",
  "µíâ",
  "µë╢",
  "Σ╗ö",
  "Φ┐ö",
  "Σ┐ù",
  "Σ║Å",
  "Φàö",
  "Θ₧ï",
  "µú▒",
  "Φªå",
  "µíå",
  "µéä",
  "σÅö",
  "µÆ₧",
  "Θ¬ù",
  "σïÿ",
  "µù║",
  "µ▓╕",
  "σ¡ñ",
  "σÉÉ",
  "σ¡ƒ",
  "µ╕á",
  "σ▒ê",
  "τû╛",
  "σªÖ",
  "µâ£",
  "Σ╗░",
  "τïá",
  "ΦâÇ",
  "Φ░É",
  "µè¢",
  "Θ£ë",
  "µíæ",
  "σ▓ù",
  "σÿ¢",
  "Φí░",
  "τ¢ù",
  "µ╕ù",
  "ΦäÅ",
  "Φ╡û",
  "µ╢î",
  "τö£",
  "µ¢╣",
  "Θÿà",
  "Φéî",
  "σô⌐",
  "σÄë",
  "τââ",
  "τ║¼",
  "µ»à",
  "µÿ¿",
  "Σ╝¬",
  "τùç",
  "τà«",
  "σÅ╣",
  "ΘÆë",
  "µÉ¡",
  "ΦîÄ",
  "τ¼╝",
  "Θà╖",
  "σü╖",
  "σ╝ô",
  "ΘöÑ",
  "µüÆ",
  "µ¥░",
  "σ¥æ",
  "Θ╝╗",
  "τ┐╝",
  "τ║╢",
  "σÅÖ",
  "τï▒",
  "ΘÇ«",
  "τ╜É",
  "τ╗£",
  "µúÜ",
  "µèæ",
  "Φå¿",
  "Φö¼",
  "σ»║",
  "Θ¬ñ",
  "τ⌐å",
  "σå╢",
  "µ₧»",
  "σåî",
  "σ░╕",
  "σç╕",
  "τ╗à",
  "σ¥»",
  "τë║",
  "τä░",
  "Φ╜░",
  "µ¼ú",
  "µÖï",
  "τÿª",
  "σ╛í",
  "Θö¡",
  "Θöª",
  "Σ╕º",
  "µù¼",
  "Θö╗",
  "σ₧ä",
  "µÉ£",
  "µëæ",
  "ΘéÇ",
  "Σ║¡",
  "Θà»",
  "Φ┐ê",
  "ΦêÆ",
  "Φäå",
  "Θà╢",
  "Θù▓",
  "σ┐º",
  "ΘàÜ",
  "Θí╜",
  "τ╛╜",
  "µ╢¿",
  "σì╕",
  "Σ╗ù",
  "ΘÖ¬",
  "Φ╛ƒ",
  "µâ⌐",
  "µ¥¡",
  "σºÜ",
  "ΦéÜ",
  "µìë",
  "Θúÿ",
  "µ╝é",
  "µÿå",
  "µ¼║",
  "σÉ╛",
  "ΘâÄ",
  "τâ╖",
  "µ▒ü",
  "σæ╡",
  "ΘÑ░",
  "ΦÉº",
  "Θ¢à",
  "Θé«",
  "Φ┐ü",
  "τçò",
  "µÆÆ",
  "σº╗",
  "Φ╡┤",
  "σ«┤",
  "τâª",
  "σÇ║",
  "σ╕É",
  "µûæ",
  "Θôâ",
  "µù¿",
  "Θåç",
  "Φæú",
  "ΘÑ╝",
  "Θ¢Å",
  "σº┐",
  "µïî",
  "σéà",
  "Φà╣",
  "σªÑ",
  "µÅë",
  "Φ┤ñ",
  "µïå",
  "µ¡¬",
  "Φæí",
  "Φâ║",
  "Σ╕ó",
  "µ╡⌐",
  "σ╛╜",
  "µÿé",
  "σ₧½",
  "µîí",
  "Φºê",
  "Φ┤¬",
  "µà░",
  "τ╝┤",
  "µ▒¬",
  "µàî",
  "σå»",
  "Φ»║",
  "σº£",
  "Φ░è",
  "σç╢",
  "σèú",
  "Φ»¼",
  "ΦÇÇ",
  "µÿÅ",
  "Φ║║",
  "τ¢ê",
  "Θ¬æ",
  "Σ╣ö",
  "µ║¬",
  "Σ╕¢",
  "σìó",
  "µè╣",
  "Θù╖",
  "σÆ¿",
  "σê«",
  "Θ⌐╛",
  "τ╝å",
  "µéƒ",
  "µæÿ",
  "ΘôÆ",
  "µÄ╖",
  "Θóç",
  "σ╣╗",
  "µƒä",
  "µâá",
  "µâ¿",
  "Σ╜│",
  "Σ╗ç",
  "Φàè",
  "τ¬¥",
  "µ╢ñ",
  "σëæ",
  "τ₧º",
  "σáí",
  "µ│╝",
  "Φæ▒",
  "τ╜⌐",
  "Θ£ì",
  "µì₧",
  "ΦâÄ",
  "Φïì",
  "µ╗¿",
  "Σ┐⌐",
  "µìà",
  "µ╣ÿ",
  "τáì",
  "Θ£₧",
  "Θé╡",
  "ΦÉä",
  "τû»",
  "µ╖«",
  "Θüé",
  "τåè",
  "τ▓¬",
  "τâÿ",
  "σ«┐",
  "µíú",
  "µêê",
  "Θ⌐│",
  "σ½é",
  "Φúò",
  "σ╛Ö",
  "τ«¡",
  "µìÉ",
  "Φéá",
  "µÆæ",
  "µÖÆ",
  "Φ╛¿",
  "µ«┐",
  "ΦÄ▓",
  "µæè",
  "µÉà",
  "Θà▒",
  "σ▒Å",
  "τû½",
  "σôÇ",
  "Φöí",
  "σá╡",
  "µ▓½",
  "τÜ▒",
  "τòà",
  "σÅá",
  "Θÿü",
  "ΦÄ▒",
  "µò▓",
  "Φ╛û",
  "ΘÆ⌐",
  "τùò",
  "σ¥¥",
  "σ╖╖",
  "ΘÑ┐",
  "τÑ╕",
  "Σ╕ÿ",
  "τÄä",
  "µ║£",
  "µ¢░",
  "ΘÇ╗",
  "σ╜¡",
  "σ░¥",
  "σì┐",
  "σª¿",
  "Φëç",
  "σÉ₧",
  "Θƒª",
  "µÇ¿",
  "τƒ«",
  "µ¡ç"
]

},{}],30:[function(require,module,exports){
module.exports=[
  "τÜä",
  "Σ╕Ç",
  "µÿ»",
  "σ£¿",
  "Σ╕ì",
  "Σ║å",
  "µ£ë",
  "σÆî",
  "Σ║║",
  "ΘÇÖ",
  "Σ╕¡",
  "σñº",
  "τé║",
  "Σ╕è",
  "σÇï",
  "σ£ï",
  "µêæ",
  "Σ╗Ñ",
  "Φªü",
  "Σ╗û",
  "µÖé",
  "Σ╛å",
  "τö¿",
  "σÇæ",
  "τöƒ",
  "σê░",
  "Σ╜£",
  "σ£░",
  "µû╝",
  "σç║",
  "σ░▒",
  "σêå",
  "σ░ì",
  "µêÉ",
  "µ£â",
  "σÅ»",
  "Σ╕╗",
  "τÖ╝",
  "σ╣┤",
  "σïò",
  "σÉî",
  "σ╖Ñ",
  "Σ╣ƒ",
  "Φâ╜",
  "Σ╕ï",
  "ΘüÄ",
  "σ¡É",
  "Φ¬¬",
  "τöó",
  "τ¿«",
  "Θ¥ó",
  "ΦÇî",
  "µû╣",
  "σ╛î",
  "σñÜ",
  "σ«Ü",
  "Φíî",
  "σ¡╕",
  "µ│ò",
  "µëÇ",
  "µ░æ",
  "σ╛ù",
  "τ╢ô",
  "σìü",
  "Σ╕ë",
  "Σ╣ï",
  "ΘÇ▓",
  "Φæù",
  "τ¡ë",
  "Θâ¿",
  "σ║ª",
  "σ«╢",
  "Θ¢╗",
  "σè¢",
  "Φúí",
  "σªé",
  "µ░┤",
  "σîû",
  "Θ½ÿ",
  "Φç¬",
  "Σ║î",
  "τÉå",
  "Φ╡╖",
  "σ░Å",
  "τë⌐",
  "τÅ╛",
  "σ»ª",
  "σèá",
  "ΘçÅ",
  "Θâ╜",
  "σà⌐",
  "Θ½ö",
  "σê╢",
  "µ⌐ƒ",
  "τò╢",
  "Σ╜┐",
  "Θ╗₧",
  "σ╛₧",
  "µÑ¡",
  "µ£¼",
  "σÄ╗",
  "µèè",
  "µÇº",
  "σÑ╜",
  "µçë",
  "Θûï",
  "σ«â",
  "σÉê",
  "Θéä",
  "σ¢á",
  "τö▒",
  "σà╢",
  "Σ║¢",
  "τä╢",
  "σëì",
  "σñû",
  "σñ⌐",
  "µö┐",
  "σ¢¢",
  "µùÑ",
  "Θéú",
  "τñ╛",
  "τ╛⌐",
  "Σ║ï",
  "σ╣│",
  "σ╜ó",
  "τ¢╕",
  "σà¿",
  "Φí¿",
  "Θûô",
  "µ¿ú",
  "Φêç",
  "Θù£",
  "σÉä",
  "Θçì",
  "µû░",
  "τ╖Ü",
  "σàº",
  "µò╕",
  "µ¡ú",
  "σ┐â",
  "σÅì",
  "Σ╜á",
  "µÿÄ",
  "τ£ï",
  "σÄƒ",
  "σÅê",
  "Θ║╝",
  "σê⌐",
  "µ»ö",
  "µêû",
  "Σ╜å",
  "Φ│¬",
  "µ░ú",
  "τ¼¼",
  "σÉæ",
  "Θüô",
  "σæ╜",
  "µ¡ñ",
  "Φ«è",
  "µó¥",
  "σÅ¬",
  "µ▓Æ",
  "τ╡É",
  "Φºú",
  "σòÅ",
  "µäÅ",
  "σ╗║",
  "µ£ê",
  "σà¼",
  "τäí",
  "τ│╗",
  "Φ╗ì",
  "σ╛ê",
  "µâà",
  "ΦÇà",
  "µ£Ç",
  "τ½ï",
  "Σ╗ú",
  "µâ│",
  "σ╖▓",
  "ΘÇÜ",
  "Σ╕ª",
  "µÅÉ",
  "τ¢┤",
  "Θíî",
  "Θ╗¿",
  "τ¿ï",
  "σ▒ò",
  "Σ║ö",
  "µ₧£",
  "µûÖ",
  "Φ▒í",
  "σôí",
  "Θ¥⌐",
  "Σ╜ì",
  "σàÑ",
  "σ╕╕",
  "µûç",
  "τ╕╜",
  "µ¼í",
  "σôü",
  "σ╝Å",
  "µ┤╗",
  "Φ¿¡",
  "σÅè",
  "τ«í",
  "τë╣",
  "Σ╗╢",
  "Θò╖",
  "µ▒é",
  "ΦÇü",
  "Θá¡",
  "σƒ║",
  "Φ│ç",
  "Θéè",
  "µ╡ü",
  "Φ╖»",
  "τ┤Ü",
  "σ░æ",
  "σ£û",
  "σ▒▒",
  "τ╡▒",
  "µÄÑ",
  "τƒÑ",
  "Φ╝â",
  "σ░ç",
  "τ╡ä",
  "Φªï",
  "Φ¿ê",
  "σêÑ",
  "σÑ╣",
  "µëï",
  "ΦºÆ",
  "µ£ƒ",
  "µá╣",
  "Φ½û",
  "Θüï",
  "Φ╛▓",
  "µîç",
  "σ╣╛",
  "Σ╣¥",
  "σìÇ",
  "σ╝╖",
  "µö╛",
  "µ▒║",
  "ΦÑ┐",
  "Φó½",
  "σ╣╣",
  "σüÜ",
  "σ┐à",
  "µê░",
  "σàê",
  "σ¢₧",
  "σëç",
  "Σ╗╗",
  "σÅû",
  "µôÜ",
  "ΦÖò",
  "ΘÜè",
  "σìù",
  "τ╡ª",
  "Φë▓",
  "σàë",
  "ΘûÇ",
  "σì│",
  "Σ┐¥",
  "µ▓╗",
  "σîù",
  "ΘÇá",
  "τÖ╛",
  "ΦªÅ",
  "τå▒",
  "Θáÿ",
  "Σ╕â",
  "µ╡╖",
  "σÅú",
  "µ¥▒",
  "σ░Ä",
  "σÖ¿",
  "σúô",
  "σ┐ù",
  "Σ╕û",
  "Θçæ",
  "σó₧",
  "τê¡",
  "µ┐ƒ",
  "ΘÜÄ",
  "µ▓╣",
  "µÇ¥",
  "Φíô",
  "µÑ╡",
  "Σ║ñ",
  "σÅù",
  "Φü»",
  "Σ╗Ç",
  "Φ¬ì",
  "σà¡",
  "σà▒",
  "µ¼è",
  "µö╢",
  "Φ¡ë",
  "µö╣",
  "µ╕à",
  "τ╛Ä",
  "σåì",
  "µÄí",
  "Φ╜ë",
  "µ¢┤",
  "σû«",
  "Θó¿",
  "σêç",
  "µëô",
  "τÖ╜",
  "µòÖ",
  "ΘÇƒ",
  "Φè▒",
  "σ╕╢",
  "σ«ë",
  "σá┤",
  "Φ║½",
  "Φ╗è",
  "Σ╛ï",
  "τ£ƒ",
  "σïÖ",
  "σà╖",
  "ΦÉ¼",
  "µ»Å",
  "τ¢«",
  "Φç│",
  "Θüö",
  "Φ╡░",
  "τ⌐ì",
  "τñ║",
  "Φ¡░",
  "Φü▓",
  "σá▒",
  "Θ¼Ñ",
  "σ«î",
  "Θí₧",
  "σà½",
  "Θ¢ó",
  "ΦÅ»",
  "σÉì",
  "τó║",
  "µëì",
  "τºæ",
  "σ╝╡",
  "Σ┐í",
  "Θª¼",
  "τ»Ç",
  "Φ⌐▒",
  "τ▒│",
  "µò┤",
  "τ⌐║",
  "σàâ",
  "µ│ü",
  "Σ╗è",
  "Θ¢å",
  "µ║½",
  "σé│",
  "σ£ƒ",
  "Φ¿▒",
  "µ¡Ñ",
  "τ╛ñ",
  "σ╗ú",
  "τƒ│",
  "Φ¿ÿ",
  "Θ£Ç",
  "µ«╡",
  "τáö",
  "τòî",
  "µïë",
  "µ₧ù",
  "σ╛ï",
  "σÅ½",
  "Σ╕ö",
  "τ⌐╢",
  "ΦºÇ",
  "Φ╢è",
  "τ╣ö",
  "Φú¥",
  "σ╜▒",
  "τ«ù",
  "Σ╜Ä",
  "µîü",
  "Θƒ│",
  "τ£╛",
  "µ¢╕",
  "σ╕â",
  "σñì",
  "σ«╣",
  "σàÆ",
  "Θáê",
  "ΘÜ¢",
  "σòå",
  "Θ¥₧",
  "Θ⌐ù",
  "ΘÇú",
  "µû╖",
  "µ╖▒",
  "Θ¢ú",
  "Φ┐æ",
  "τñª",
  "σìâ",
  "ΘÇ▒",
  "σºö",
  "τ┤á",
  "µèÇ",
  "σéÖ",
  "σìè",
  "Φ╛ª",
  "Θ¥Æ",
  "τ£ü",
  "σêù",
  "τ┐Æ",
  "Θƒ┐",
  "τ┤ä",
  "µö»",
  "Φê¼",
  "σÅ▓",
  "µäƒ",
  "σï₧",
  "Σ╛┐",
  "σ£ÿ",
  "σ╛Ç",
  "Θà╕",
  "µ¡╖",
  "σ╕é",
  "σàï",
  "Σ╜ò",
  "ΘÖñ",
  "µ╢ê",
  "µºï",
  "σ║£",
  "τ¿▒",
  "σñ¬",
  "µ║û",
  "τ▓╛",
  "σÇ╝",
  "ΦÖƒ",
  "τÄç",
  "µùÅ",
  "τ╢¡",
  "σèâ",
  "Θü╕",
  "µ¿Ö",
  "σ»½",
  "σ¡ÿ",
  "σÇÖ",
  "µ»¢",
  "Φª¬",
  "σ┐½",
  "µòê",
  "µû»",
  "ΘÖó",
  "µƒÑ",
  "µ▒ƒ",
  "σ₧ï",
  "τ£╝",
  "τÄï",
  "µîë",
  "µá╝",
  "Θñè",
  "µÿô",
  "τ╜«",
  "µ┤╛",
  "σ▒ñ",
  "τëç",
  "σºï",
  "σì╗",
  "σ░ê",
  "τïÇ",
  "Φé▓",
  "σ╗á",
  "Σ║¼",
  "Φ¡ÿ",
  "Θü⌐",
  "σ▒¼",
  "σ£ô",
  "σîà",
  "τü½",
  "Σ╜Å",
  "Φ¬┐",
  "µ╗┐",
  "τ╕ú",
  "σ▒Ç",
  "τàº",
  "σÅâ",
  "τ┤à",
  "τ┤░",
  "σ╝ò",
  "Φü╜",
  "Φ⌐▓",
  "ΘÉ╡",
  "σâ╣",
  "σÜ┤",
  "Θªû",
  "σ║ò",
  "µ╢▓",
  "σ«ÿ",
  "σ╛╖",
  "ΘÜ¿",
  "τùà",
  "Φÿç",
  "σñ▒",
  "τê╛",
  "µ¡╗",
  "Φ¼¢",
  "Θàì",
  "σÑ│",
  "Θ╗â",
  "µÄ¿",
  "Θí»",
  "Φ½ç",
  "τ╜¬",
  "τÑ₧",
  "Φù¥",
  "σæó",
  "σ╕¡",
  "σÉ½",
  "Σ╝ü",
  "µ£¢",
  "σ»å",
  "µë╣",
  "τçƒ",
  "Θáà",
  "Θÿ▓",
  "Φêë",
  "τÉâ",
  "Φï▒",
  "µ░º",
  "σïó",
  "σæè",
  "µ¥Ä",
  "σÅ░",
  "ΦÉ╜",
  "µ£¿",
  "σ╣½",
  "Φ╝¬",
  "τá┤",
  "Σ║₧",
  "σ╕½",
  "σ£ì",
  "µ│¿",
  "Θüá",
  "σ¡ù",
  "µ¥É",
  "µÄÆ",
  "Σ╛¢",
  "µ▓│",
  "µàï",
  "σ░ü",
  "σÅª",
  "µû╜",
  "µ╕¢",
  "µ¿╣",
  "µ║╢",
  "µÇÄ",
  "µ¡ó",
  "µíê",
  "Φ¿Ç",
  "σú½",
  "σ¥ç",
  "µ¡ª",
  "σ¢║",
  "Φæë",
  "Θ¡Ü",
  "µ│ó",
  "Φªû",
  "σâà",
  "Φ▓╗",
  "τ╖è",
  "µä¢",
  "σ╖ª",
  "τ½á",
  "µù⌐",
  "µ£¥",
  "σ«│",
  "τ║î",
  "Φ╝ò",
  "µ£ì",
  "Φ⌐ª",
  "Θúƒ",
  "σàà",
  "σà╡",
  "µ║É",
  "σêñ",
  "Φ¡╖",
  "σÅ╕",
  "Φ╢│",
  "µƒÉ",
  "τ╖┤",
  "σ╖«",
  "Φç┤",
  "µ¥┐",
  "τö░",
  "ΘÖì",
  "Θ╗æ",
  "τè»",
  "Φ▓á",
  "µôè",
  "Φîâ",
  "τ╣╝",
  "Φêê",
  "Σ╝╝",
  "Θñÿ",
  "σáà",
  "µ¢▓",
  "Φ╝╕",
  "Σ┐«",
  "µòà",
  "σƒÄ",
  "σñ½",
  "σñá",
  "ΘÇü",
  "τ¡å",
  "Φê╣",
  "Σ╜ö",
  "σÅ│",
  "Φ▓í",
  "σÉâ",
  "σ»î",
  "µÿÑ",
  "Φü╖",
  "Φª║",
  "µ╝ó",
  "τò½",
  "σèƒ",
  "σ╖┤",
  "Φ╖ƒ",
  "Θ¢û",
  "Θ¢£",
  "Θú¢",
  "µ¬ó",
  "σÉ╕",
  "σè⌐",
  "µÿç",
  "ΘÖ╜",
  "Σ║Æ",
  "σê¥",
  "σë╡",
  "µèù",
  "ΦÇâ",
  "µèò",
  "σú₧",
  "τ¡û",
  "σÅñ",
  "σ╛æ",
  "µÅ¢",
  "µ£¬",
  "Φ╖æ",
  "τòÖ",
  "Θï╝",
  "µ¢╛",
  "τ½»",
  "Φ▓¼",
  "τ½Ö",
  "τ░í",
  "Φ┐░",
  "Θîó",
  "σë»",
  "τ¢í",
  "σ╕¥",
  "σ░ä",
  "Φìë",
  "Φí¥",
  "µë┐",
  "τì¿",
  "Σ╗ñ",
  "ΘÖÉ",
  "Θÿ┐",
  "σ«ú",
  "τÆ░",
  "Θ¢Ö",
  "Φ½ï",
  "Φ╢à",
  "σ╛«",
  "Φ«ô",
  "µÄº",
  "σ╖₧",
  "Φë»",
  "Φ╗╕",
  "µë╛",
  "σÉª",
  "τ┤Ç",
  "τ¢è",
  "Σ╛¥",
  "σä¬",
  "Θáé",
  "τñÄ",
  "Φ╝ë",
  "σÇÆ",
  "µê┐",
  "τ¬ü",
  "σ¥É",
  "τ▓ë",
  "µò╡",
  "τòÑ",
  "σ«ó",
  "Φóü",
  "σå╖",
  "σï¥",
  "τ╡ò",
  "µ₧É",
  "σíè",
  "σèæ",
  "µ╕¼",
  "τ╡▓",
  "σìö",
  "Φ¿┤",
  "σ┐╡",
  "ΘÖ│",
  "Σ╗ì",
  "τ╛à",
  "Θ╣╜",
  "σÅï",
  "µ┤ï",
  "Θî»",
  "Φïª",
  "σñ£",
  "σêæ",
  "τº╗",
  "Θá╗",
  "ΘÇÉ",
  "Θ¥á",
  "µ╖╖",
  "µ»ì",
  "τƒ¡",
  "τÜ«",
  "τ╡é",
  "ΦüÜ",
  "µ▒╜",
  "µ¥æ",
  "Θ¢▓",
  "σô¬",
  "µùó",
  "Φ╖¥",
  "Φí¢",
  "σü£",
  "τâê",
  "σñ«",
  "σ»ƒ",
  "τçÆ",
  "Φ┐à",
  "σóâ",
  "ΦïÑ",
  "σì░",
  "µ┤▓",
  "σê╗",
  "µï¼",
  "µ┐Ç",
  "σ¡ö",
  "µÉ₧",
  "τöÜ",
  "σ«ñ",
  "σ╛à",
  "µá╕",
  "µáí",
  "µòú",
  "Σ╛╡",
  "σÉº",
  "τö▓",
  "Θüè",
  "Σ╣à",
  "ΦÅ£",
  "σæ│",
  "Φêè",
  "µ¿í",
  "µ╣û",
  "Φ▓¿",
  "µÉì",
  "ΘáÉ",
  "Θÿ╗",
  "µ»½",
  "µÖ«",
  "τ⌐⌐",
  "Σ╣Ö",
  "σ¬╜",
  "µñì",
  "µü»",
  "µô┤",
  "ΘèÇ",
  "Φ¬₧",
  "µÅ«",
  "ΘàÆ",
  "σ«ê",
  "µï┐",
  "σ║Å",
  "τ┤Ö",
  "Θå½",
  "τ╝║",
  "Θ¢¿",
  "σùÄ",
  "Θç¥",
  "σèë",
  "σòè",
  "µÇÑ",
  "σö▒",
  "Φ¬ñ",
  "Φ¿ô",
  "Θíÿ",
  "σ»⌐",
  "ΘÖä",
  "τì▓",
  "Φî╢",
  "Θ««",
  "τ│º",
  "µûñ",
  "σ¡⌐",
  "Φä½",
  "τí½",
  "ΦéÑ",
  "σûä",
  "Θ╛ì",
  "µ╝ö",
  "τê╢",
  "µ╝╕",
  "ΦíÇ",
  "µ¡í",
  "µó░",
  "µÄî",
  "µ¡î",
  "µ▓Ö",
  "σë¢",
  "µö╗",
  "Φ¼é",
  "τ¢╛",
  "Φ¿Ä",
  "µÖÜ",
  "τ▓Æ",
  "Σ║é",
  "τçâ",
  "τƒ¢",
  "Σ╣Ä",
  "µ«║",
  "ΦùÑ",
  "σ»º",
  "Θ¡»",
  "Φ▓┤",
  "ΘÉÿ",
  "τàñ",
  "Φ«Ç",
  "τÅ¡",
  "Σ╝»",
  "ΘªÖ",
  "Σ╗ï",
  "Φ┐½",
  "σÅÑ",
  "Φ▒É",
  "σƒ╣",
  "µÅí",
  "Φÿ¡",
  "µôö",
  "σ╝ª",
  "Φ¢ï",
  "µ▓ë",
  "σüç",
  "τ⌐┐",
  "σƒ╖",
  "τ¡ö",
  "µ¿é",
  "Φ¬░",
  "Θáå",
  "τàÖ",
  "τ╕«",
  "σ╛╡",
  "Φçë",
  "σû£",
  "µ¥╛",
  "Φà│",
  "σ¢░",
  "τò░",
  "σàì",
  "Φâî",
  "µÿƒ",
  "τªÅ",
  "Φ▓╖",
  "µƒô",
  "Σ║ò",
  "µªé",
  "µàó",
  "µÇò",
  "τúü",
  "σÇì",
  "τÑû",
  "τÜç",
  "Σ┐â",
  "Θ¥£",
  "Φú£",
  "Φ⌐ò",
  "τ┐╗",
  "Φéë",
  "Φ╕É",
  "σ░╝",
  "Φíú",
  "σ»¼",
  "µÅÜ",
  "µúë",
  "σ╕î",
  "σé╖",
  "µôì",
  "σ₧é",
  "τºï",
  "σ«£",
  "µ░½",
  "σÑù",
  "τ¥ú",
  "µî»",
  "µ₧╢",
  "Σ║«",
  "µ£½",
  "µå▓",
  "µà╢",
  "τ╖¿",
  "τë¢",
  "Φº╕",
  "µÿá",
  "Θ¢╖",
  "Θè╖",
  "Φ⌐⌐",
  "σ║º",
  "σ▒à",
  "µèô",
  "Φúé",
  "Φâ₧",
  "σæ╝",
  "σ¿ÿ",
  "µÖ»",
  "σ¿ü",
  "τ╢á",
  "µÖ╢",
  "σÄÜ",
  "τ¢ƒ",
  "Φíí",
  "Θ¢₧",
  "σ¡½",
  "σ╗╢",
  "σì▒",
  "Φåá",
  "σ▒ï",
  "Θäë",
  "Φç¿",
  "ΘÖ╕",
  "Θíº",
  "µÄë",
  "σæÇ",
  "τçê",
  "µ¡▓",
  "µÄ¬",
  "µ¥ƒ",
  "ΦÇÉ",
  "σèç",
  "τÄë",
  "Φ╢Ö",
  "Φ╖│",
  "σôÑ",
  "σ¡ú",
  "Φ¬▓",
  "σç▒",
  "Φâí",
  "Θíì",
  "µ¼╛",
  "τ┤╣",
  "σì╖",
  "Θ╜è",
  "σüë",
  "ΦÆ╕",
  "µ«û",
  "µ░╕",
  "σ«ù",
  "Φïù",
  "σ╖¥",
  "τêÉ",
  "σ▓⌐",
  "σ╝▒",
  "Θ¢╢",
  "µÑè",
  "σÑÅ",
  "µ▓┐",
  "Θ£▓",
  "µí┐",
  "µÄó",
  "µ╗æ",
  "ΘÄ«",
  "Θú»",
  "µ┐â",
  "Φê¬",
  "µç╖",
  "Φ╢ò",
  "σ║½",
  "σÑ¬",
  "Σ╝è",
  "Θ¥ê",
  "τ¿à",
  "ΘÇö",
  "µ╗à",
  "Φ│╜",
  "µ¡╕",
  "σÅ¼",
  "Θ╝ô",
  "µÆ¡",
  "τ¢ñ",
  "Φúü",
  "ΘÜ¬",
  "σ║╖",
  "σö»",
  "Θîä",
  "ΦÅî",
  "τ┤ö",
  "σÇƒ",
  "τ│û",
  "Φôï",
  "µ⌐½",
  "τ¼ª",
  "τºü",
  "σè¬",
  "σáé",
  "σƒƒ",
  "µºì",
  "µ╜ñ",
  "σ╣à",
  "σôê",
  "τ½ƒ",
  "τåƒ",
  "Φƒ▓",
  "µ╛ñ",
  "Φàª",
  "σúñ",
  "τó│",
  "µ¡É",
  "Θüì",
  "σü┤",
  "σ»¿",
  "µòó",
  "σ╛╣",
  "µà«",
  "µû£",
  "Φûä",
  "σ║¡",
  "τ┤ì",
  "σ╜ê",
  "Θú╝",
  "Σ╝╕",
  "µèÿ",
  "Θ║Ñ",
  "µ┐ò",
  "µÜù",
  "Φì╖",
  "τôª",
  "σí₧",
  "σ║è",
  "τ»ë",
  "µâí",
  "µê╢",
  "Φ¿¬",
  "σíö",
  "σÑç",
  "ΘÇÅ",
  "µóü",
  "σêÇ",
  "µùï",
  "Φ╖í",
  "σìí",
  "µ░»",
  "Θüç",
  "Σ╗╜",
  "µ»Æ",
  "µ│Ñ",
  "ΘÇÇ",
  "µ┤ù",
  "µô║",
  "τü░",
  "σ╜⌐",
  "Φ│ú",
  "ΦÇù",
  "σñÅ",
  "µôç",
  "σ┐Ö",
  "Θèà",
  "τì╗",
  "τí¼",
  "Σ║ê",
  "τ╣ü",
  "σ£ê",
  "Θ¢¬",
  "σç╜",
  "Σ║ª",
  "µè╜",
  "τ»ç",
  "ΘÖú",
  "ΘÖ░",
  "Σ╕ü",
  "σ░║",
  "Φ┐╜",
  "σáå",
  "Θ¢ä",
  "Φ┐Ä",
  "µ│¢",
  "τê╕",
  "µ¿ô",
  "Θü┐",
  "Φ¼Ç",
  "σÖ╕",
  "ΘçÄ",
  "Φ▒¼",
  "µùù",
  "τ┤»",
  "σüÅ",
  "σà╕",
  "Θñ¿",
  "τ┤ó",
  "τºª",
  "Φäé",
  "µ╜«",
  "τê║",
  "Φ▒å",
  "σ┐╜",
  "µëÿ",
  "Θ⌐Ü",
  "σíæ",
  "Θü║",
  "µäê",
  "µ£▒",
  "µ¢┐",
  "τ║û",
  "τ▓ù",
  "σé╛",
  "σ░Ü",
  "τù¢",
  "µÑÜ",
  "Φ¼¥",
  "σÑ«",
  "Φ│╝",
  "τú¿",
  "σÉ¢",
  "µ▒á",
  "µùü",
  "τóÄ",
  "Θ¬¿",
  "τ¢ú",
  "µìò",
  "σ╝ƒ",
  "µÜ┤",
  "σë▓",
  "Φ▓½",
  "µ«è",
  "Θçï",
  "Φ⌐₧",
  "Σ║í",
  "σúü",
  "Θáô",
  "σ»╢",
  "σìê",
  "σí╡",
  "Φü₧",
  "µÅ¡",
  "τé«",
  "µ«ÿ",
  "σå¼",
  "µ⌐ï",
  "σ⌐ª",
  "Φ¡ª",
  "τ╢£",
  "µï¢",
  "σÉ│",
  "Σ╗ÿ",
  "µ╡«",
  "Θü¡",
  "σ╛É",
  "µé¿",
  "µÉû",
  "Φ░╖",
  "Φ┤è",
  "τ«▒",
  "ΘÜö",
  "Φ¿é",
  "τö╖",
  "σÉ╣",
  "σ£Æ",
  "τ┤¢",
  "σöÉ",
  "µòù",
  "σ«ï",
  "τÄ╗",
  "σ╖¿",
  "ΦÇò",
  "σ¥ª",
  "µª«",
  "Θûë",
  "τüú",
  "Θì╡",
  "σçí",
  "ΘºÉ",
  "Θìï",
  "µòæ",
  "µü⌐",
  "σë¥",
  "σç¥",
  "Θ╣╝",
  "Θ╜Æ",
  "µê¬",
  "τàë",
  "Θ║╗",
  "τ┤í",
  "τªü",
  "σ╗ó",
  "τ¢¢",
  "τëê",
  "τ╖⌐",
  "µ╖¿",
  "τ¥¢",
  "µÿî",
  "σ⌐Ü",
  "µ╢ë",
  "τ¡Æ",
  "σÿ┤",
  "µÅÆ",
  "σ▓╕",
  "µ£ù",
  "ΦÄè",
  "Φíù",
  "ΦùÅ",
  "σºæ",
  "Φ▓┐",
  "ΦàÉ",
  "σÑ┤",
  "σòª",
  "µàú",
  "Σ╣ÿ",
  "σñÑ",
  "µüó",
  "σï╗",
  "τ┤ù",
  "µëÄ",
  "Φ╛»",
  "ΦÇ│",
  "σ╜¬",
  "Φçú",
  "σää",
  "τÆâ",
  "µè╡",
  "Φäê",
  "τºÇ",
  "Φû⌐",
  "Σ┐ä",
  "τ╢▓",
  "Φê₧",
  "σ║ù",
  "σÖ┤",
  "τ╕▒",
  "σ»╕",
  "µ▒ù",
  "µÄ¢",
  "µ┤¬",
  "Φ│Ç",
  "Θûâ",
  "µƒ¼",
  "τêå",
  "τâ»",
  "µ┤Ñ",
  "τ¿╗",
  "τëå",
  "Φ╗ƒ",
  "σïç",
  "σâÅ",
  "µ╗╛",
  "σÄÿ",
  "ΦÆÖ",
  "Φè│",
  "Φé»",
  "σ¥í",
  "µƒ▒",
  "τ¢¬",
  "Φà┐",
  "σäÇ",
  "µùà",
  "σ░╛",
  "Φ╗ï",
  "σå░",
  "Φ▓ó",
  "τÖ╗",
  "Θ╗Ä",
  "σëè",
  "Θæ╜",
  "σïÆ",
  "ΘÇâ",
  "ΘÜ£",
  "µ░¿",
  "Θâ¡",
  "σ│░",
  "σ╣ú",
  "µ╕»",
  "Σ╝Å",
  "Φ╗î",
  "τò¥",
  "τòó",
  "µôª",
  "ΦÄ½",
  "σê║",
  "µ╡¬",
  "τºÿ",
  "µÅ┤",
  "µá¬",
  "σüÑ",
  "σö«",
  "Φéí",
  "σ│╢",
  "τöÿ",
  "µ│í",
  "τ¥í",
  "τ½Ñ",
  "Θæä",
  "µ╣»",
  "ΘûÑ",
  "Σ╝æ",
  "σî»",
  "Φêì",
  "τëº",
  "τ╣₧",
  "τé╕",
  "σô▓",
  "τú╖",
  "τ╕╛",
  "µ£ï",
  "µ╖í",
  "σ░û",
  "σòƒ",
  "ΘÖ╖",
  "µƒ┤",
  "σæê",
  "σ╛Æ",
  "ΘíÅ",
  "µ╖Ü",
  "τ¿ì",
  "σ┐ÿ",
  "µ│╡",
  "Φùì",
  "µïû",
  "µ┤₧",
  "µÄê",
  "ΘÅí",
  "Φ╛¢",
  "σú»",
  "ΘïÆ",
  "Φ▓º",
  "ΦÖ¢",
  "σ╜Ä",
  "µæ⌐",
  "µ│░",
  "σ╣╝",
  "σ╗╖",
  "σ░è",
  "τ¬ù",
  "τ╢▒",
  "σ╝ä",
  "ΘÜ╕",
  "τûæ",
  "µ░Å",
  "σ««",
  "σºÉ",
  "Θ£ç",
  "τæ₧",
  "µÇ¬",
  "σ░ñ",
  "τÉ┤",
  "σ╛¬",
  "µÅÅ",
  "Φå£",
  "Θüò",
  "σñ╛",
  "Φà░",
  "τ╖ú",
  "τÅá",
  "τ¬«",
  "µú«",
  "µ₧¥",
  "τ½╣",
  "µ║¥",
  "σé¼",
  "τ╣⌐",
  "µå╢",
  "Θéª",
  "σë⌐",
  "σ╣╕",
  "µ╝┐",
  "µ¼ä",
  "µôü",
  "τëÖ",
  "Φ▓»",
  "τª«",
  "µ┐╛",
  "Θêë",
  "τ┤ï",
  "τ╜╖",
  "µïì",
  "σÆ▒",
  "σûè",
  "Φóû",
  "σƒâ",
  "σïñ",
  "τ╜░",
  "τäª",
  "µ╜¢",
  "Σ╝ì",
  "σó¿",
  "µ¼▓",
  "τ╕½",
  "σºô",
  "σêè",
  "Θú╜",
  "Σ╗┐",
  "τìÄ",
  "Θïü",
  "Θ¼╝",
  "Θ║ù",
  "Φ╖¿",
  "Θ╗ÿ",
  "µîû",
  "ΘÅê",
  "µÄâ",
  "σû¥",
  "Φóï",
  "τé¡",
  "µ▒í",
  "σ╣ò",
  "Φ½╕",
  "σ╝º",
  "σï╡",
  "µóà",
  "σÑ╢",
  "µ╜ö",
  "τü╜",
  "Φêƒ",
  "Θææ",
  "Φï»",
  "Φ¿ƒ",
  "µè▒",
  "µ»Ç",
  "µçé",
  "σ»Æ",
  "µÖ║",
  "σƒö",
  "σ»ä",
  "σ▒å",
  "Φ║ì",
  "µ╕í",
  "µîæ",
  "Σ╕╣",
  "Φë▒",
  "Φ▓¥",
  "τó░",
  "µïö",
  "τê╣",
  "µê┤",
  "τó╝",
  "σñó",
  "Φè╜",
  "τåö",
  "Φ╡ñ",
  "µ╝ü",
  "σô¡",
  "µò¼",
  "Θíå",
  "σÑö",
  "Θë¢",
  "Σ╗▓",
  "ΦÖÄ",
  "τ¿Ç",
  "σª╣",
  "Σ╣Å",
  "τÅì",
  "τö│",
  "µíî",
  "Θü╡",
  "σàü",
  "ΘÜå",
  "Φ₧║",
  "σÇë",
  "Θ¡Å",
  "Θè│",
  "µ¢ë",
  "µ░«",
  "σà╝",
  "ΘÜ▒",
  "τñÖ",
  "Φ╡½",
  "µÆÑ",
  "σ┐á",
  "Φéà",
  "τ╝╕",
  "τë╜",
  "µÉ╢",
  "σìÜ",
  "σ╖º",
  "µ«╝",
  "σàä",
  "µ¥£",
  "Φ¿è",
  "Φ¬á",
  "τóº",
  "τÑÑ",
  "µƒ»",
  "Θáü",
  "σ╖í",
  "τƒ⌐",
  "µé▓",
  "τüî",
  "Θ╜í",
  "σÇ½",
  "τÑ¿",
  "σ░ï",
  "µíé",
  "Θï¬",
  "Φüû",
  "µüÉ",
  "µü░",
  "Θä¡",
  "Φ╢ú",
  "µè¼",
  "ΦìÆ",
  "Θ¿░",
  "Φ▓╝",
  "µƒö",
  "µ╗┤",
  "τî¢",
  "Θùè",
  "Φ╝¢",
  "σª╗",
  "σí½",
  "µÆñ",
  "σä▓",
  "τ░╜",
  "Θ¼º",
  "µô╛",
  "τ┤½",
  "τáé",
  "Θü₧",
  "µê▓",
  "σÉè",
  "ΘÖ╢",
  "Σ╝É",
  "Θñ╡",
  "τÖé",
  "τô╢",
  "σ⌐å",
  "µÆ½",
  "Φçé",
  "µæ╕",
  "σ┐ì",
  "Φ¥ª",
  "Φáƒ",
  "Θä░",
  "Φâ╕",
  "Θ₧Å",
  "µôá",
  "σü╢",
  "µúä",
  "µº╜",
  "σïü",
  "Σ╣│",
  "Θäº",
  "σÉë",
  "Σ╗ü",
  "τê¢",
  "τúÜ",
  "τºƒ",
  "τâÅ",
  "Φëª",
  "Σ╝┤",
  "τô£",
  "µ╖║",
  "Σ╕Ö",
  "µÜ½",
  "τçÑ",
  "µ⌐í",
  "µƒ│",
  "Φ┐╖",
  "µÜû",
  "τëî",
  "τºº",
  "Φå╜",
  "Φ⌐│",
  "τ░º",
  "Φ╕Å",
  "τô╖",
  "Φ¡£",
  "σæå",
  "Φ│ô",
  "τ│è",
  "µ┤¢",
  "Φ╝¥",
  "µåñ",
  "τ½╢",
  "ΘÜÖ",
  "µÇÆ",
  "τ▓ÿ",
  "Σ╣â",
  "τ╖Æ",
  "Φé⌐",
  "τ▒ì",
  "µòÅ",
  "σíù",
  "τåÖ",
  "τÜå",
  "σü╡",
  "µç╕",
  "µÄÿ",
  "Σ║½",
  "τ│╛",
  "ΘåÆ",
  "τïé",
  "ΘÄû",
  "µ╖Ç",
  "µü¿",
  "τë▓",
  "Θ£╕",
  "τê¼",
  "Φ│₧",
  "ΘÇå",
  "τÄ⌐",
  "ΘÖ╡",
  "τÑ¥",
  "τºÆ",
  "µ╡Ö",
  "Φ▓î",
  "σ╜╣",
  "σ╜╝",
  "µéë",
  "Θ┤¿",
  "Φ╢¿",
  "Θ││",
  "µÖ¿",
  "τò£",
  "Φ╝⌐",
  "τº⌐",
  "σì╡",
  "τ╜▓",
  "µó»",
  "τéÄ",
  "τüÿ",
  "µúï",
  "Θ⌐à",
  "τ»⌐",
  "σ│╜",
  "σåÆ",
  "σòÑ",
  "σú╜",
  "Φ¡»",
  "µ╡╕",
  "µ│ë",
  "σ╕╜",
  "Θü▓",
  "τƒ╜",
  "τûå",
  "Φ▓╕",
  "µ╝Å",
  "τ¿┐",
  "σåá",
  "σ½⌐",
  "Φäà",
  "Φè»",
  "τëó",
  "σÅ¢",
  "Φ¥ò",
  "σÑº",
  "Θ│┤",
  "σ╢║",
  "τ╛è",
  "µåæ",
  "Σ╕▓",
  "σíÿ",
  "τ╣¬",
  "Θà╡",
  "Φ₧ì",
  "τ¢å",
  "Θî½",
  "σ╗ƒ",
  "τ▒î",
  "σçì",
  "Φ╝ö",
  "µö¥",
  "ΦÑ▓",
  "τ¡ï",
  "µïÆ",
  "σâÜ",
  "µù▒",
  "ΘëÇ",
  "Θ│Ñ",
  "µ╝å",
  "µ▓ê",
  "τ£ë",
  "τûÅ",
  "µ╖╗",
  "µúÆ",
  "τ⌐ù",
  "τí¥",
  "Θƒô",
  "ΘÇ╝",
  "µë¡",
  "σâæ",
  "µ╢╝",
  "µî║",
  "τóù",
  "µá╜",
  "τéÆ",
  "µ¥»",
  "µéú",
  "Θñ╛",
  "σï╕",
  "Φ▒¬",
  "Θü╝",
  "σïâ",
  "Θ┤╗",
  "µùª",
  "σÉÅ",
  "µï£",
  "τïù",
  "σƒï",
  "Φ╝Ñ",
  "µÄ⌐",
  "Θú▓",
  "µÉ¼",
  "τ╜╡",
  "Φ╛¡",
  "σï╛",
  "µëú",
  "Σ╝░",
  "Φöú",
  "τ╡¿",
  "Θ£º",
  "Σ╕ê",
  "µ£╡",
  "σºå",
  "µô¼",
  "σ«ç",
  "Φ╝»",
  "ΘÖ¥",
  "Θ¢ò",
  "σäƒ",
  "Φôä",
  "σ┤ç",
  "σë¬",
  "σÇí",
  "σ╗│",
  "σÆ¼",
  "Θº¢",
  "Φû»",
  "σê╖",
  "µûÑ",
  "τò¬",
  "Φ│ª",
  "σÑë",
  "Σ╜¢",
  "µ╛å",
  "µ╝½",
  "µ¢╝",
  "µëç",
  "Θêú",
  "µíâ",
  "µë╢",
  "Σ╗ö",
  "Φ┐ö",
  "Σ┐ù",
  "ΦÖº",
  "Φàö",
  "Θ₧ï",
  "µú▒",
  "Φªå",
  "µíå",
  "µéä",
  "σÅö",
  "µÆ₧",
  "Θ¿Ö",
  "σïÿ",
  "µù║",
  "µ▓╕",
  "σ¡ñ",
  "σÉÉ",
  "σ¡ƒ",
  "µ╕á",
  "σ▒ê",
  "τû╛",
  "σªÖ",
  "µâ£",
  "Σ╗░",
  "τïá",
  "Φä╣",
  "Φ½º",
  "µïï",
  "Θ╗┤",
  "µíæ",
  "σ┤ù",
  "σÿ¢",
  "Φí░",
  "τ¢£",
  "µ╗▓",
  "Φçƒ",
  "Φ│┤",
  "µ╣º",
  "τö£",
  "µ¢╣",
  "Θû▒",
  "Φéî",
  "σô⌐",
  "σÄ▓",
  "τâ┤",
  "τ╖»",
  "µ»à",
  "µÿ¿",
  "σü╜",
  "τùç",
  "τà«",
  "σÿå",
  "Θçÿ",
  "µÉ¡",
  "ΦÄû",
  "τ▒á",
  "Θà╖",
  "σü╖",
  "σ╝ô",
  "ΘîÉ",
  "µüå",
  "σéæ",
  "σ¥æ",
  "Θ╝╗",
  "τ┐╝",
  "τ╢╕",
  "µòÿ",
  "τìä",
  "ΘÇ«",
  "τ╜É",
  "τ╡í",
  "µúÜ",
  "µèæ",
  "Φå¿",
  "Φö¼",
  "σ»║",
  "Θ⌐ƒ",
  "τ⌐å",
  "σå╢",
  "µ₧»",
  "σåè",
  "σ▒ì",
  "σç╕",
  "τ┤│",
  "σ¥»",
  "τèº",
  "τä░",
  "Φ╜ƒ",
  "µ¼ú",
  "µÖë",
  "τÿª",
  "τªª",
  "Θîá",
  "Θîª",
  "σû¬",
  "µù¼",
  "Θì¢",
  "σúƒ",
  "µÉ£",
  "µÆ▓",
  "ΘéÇ",
  "Σ║¡",
  "Θà»",
  "Θéü",
  "ΦêÆ",
  "Φäå",
  "Θà╢",
  "ΘûÆ",
  "µåé",
  "ΘàÜ",
  "Θáæ",
  "τ╛╜",
  "µ╝▓",
  "σì╕",
  "Σ╗ù",
  "ΘÖ¬",
  "Θùó",
  "µç▓",
  "µ¥¡",
  "σºÜ",
  "ΦéÜ",
  "µìë",
  "Θúä",
  "µ╝é",
  "µÿå",
  "µ¼║",
  "σÉ╛",
  "ΘâÄ",
  "τâ╖",
  "µ▒ü",
  "σæ╡",
  "Θú╛",
  "Φò¡",
  "Θ¢à",
  "Θâ╡",
  "Θü╖",
  "τçò",
  "µÆÆ",
  "σº╗",
  "Φ╡┤",
  "σ«┤",
  "τà⌐",
  "σé╡",
  "σ╕│",
  "µûæ",
  "Θê┤",
  "µù¿",
  "Θåç",
  "Φæú",
  "Θñà",
  "Θ¢¢",
  "σº┐",
  "µïî",
  "σéà",
  "Φà╣",
  "σªÑ",
  "µÅë",
  "Φ│ó",
  "µïå",
  "µ¡¬",
  "Φæí",
  "Φâ║",
  "Σ╕ƒ",
  "µ╡⌐",
  "σ╛╜",
  "µÿé",
  "σóè",
  "µôï",
  "Φª╜",
  "Φ▓¬",
  "µà░",
  "τ╣│",
  "µ▒¬",
  "µàî",
  "Θª«",
  "Φ½╛",
  "σº£",
  "Φ¬╝",
  "σàç",
  "σèú",
  "Φ¬ú",
  "ΦÇÇ",
  "µÿÅ",
  "Φ║║",
  "τ¢ê",
  "Θ¿Ä",
  "σû¼",
  "µ║¬",
  "σÅó",
  "τ¢º",
  "µè╣",
  "µé╢",
  "Φ½«",
  "σê«",
  "Θºò",
  "τ║£",
  "µéƒ",
  "µæÿ",
  "Θë║",
  "µô▓",
  "Θáù",
  "σ╣╗",
  "µƒä",
  "µâá",
  "µàÿ",
  "Σ╜│",
  "Σ╗ç",
  "Φçÿ",
  "τ¬⌐",
  "µ╗î",
  "σèì",
  "τ₧º",
  "σáí",
  "µ╜æ",
  "ΦöÑ",
  "τ╜⌐",
  "Θ£ì",
  "µÆê",
  "ΦâÄ",
  "ΦÆ╝",
  "µ┐▒",
  "σÇå",
  "µìà",
  "µ╣ÿ",
  "τáì",
  "Θ£₧",
  "Θé╡",
  "ΦÉä",
  "τÿï",
  "µ╖«",
  "Θüé",
  "τåè",
  "τ│₧",
  "τâÿ",
  "σ«┐",
  "µ¬ö",
  "µêê",
  "Θºü",
  "σ½é",
  "Φúò",
  "σ╛Ö",
  "τ«¡",
  "µìÉ",
  "Φà╕",
  "µÆÉ",
  "µ¢¼",
  "Φ╛¿",
  "µ«┐",
  "Φô«",
  "µöñ",
  "µö¬",
  "Θå¼",
  "σ▒Å",
  "τû½",
  "σôÇ",
  "Φöí",
  "σá╡",
  "µ▓½",
  "τÜ║",
  "µÜó",
  "τûè",
  "Θûú",
  "ΦÉè",
  "µò▓",
  "Φ╜ä",
  "Θëñ",
  "τùò",
  "σú⌐",
  "σ╖╖",
  "Θñô",
  "τªì",
  "Σ╕ÿ",
  "τÄä",
  "µ║£",
  "µ¢░",
  "ΘéÅ",
  "σ╜¡",
  "σÿù",
  "σì┐",
  "σª¿",
  "Φëç",
  "σÉ₧",
  "Θƒï",
  "µÇ¿",
  "τƒ«",
  "µ¡ç"
]

},{}],31:[function(require,module,exports){
module.exports=[
  "abandon",
  "ability",
  "able",
  "about",
  "above",
  "absent",
  "absorb",
  "abstract",
  "absurd",
  "abuse",
  "access",
  "accident",
  "account",
  "accuse",
  "achieve",
  "acid",
  "acoustic",
  "acquire",
  "across",
  "act",
  "action",
  "actor",
  "actress",
  "actual",
  "adapt",
  "add",
  "addict",
  "address",
  "adjust",
  "admit",
  "adult",
  "advance",
  "advice",
  "aerobic",
  "affair",
  "afford",
  "afraid",
  "again",
  "age",
  "agent",
  "agree",
  "ahead",
  "aim",
  "air",
  "airport",
  "aisle",
  "alarm",
  "album",
  "alcohol",
  "alert",
  "alien",
  "all",
  "alley",
  "allow",
  "almost",
  "alone",
  "alpha",
  "already",
  "also",
  "alter",
  "always",
  "amateur",
  "amazing",
  "among",
  "amount",
  "amused",
  "analyst",
  "anchor",
  "ancient",
  "anger",
  "angle",
  "angry",
  "animal",
  "ankle",
  "announce",
  "annual",
  "another",
  "answer",
  "antenna",
  "antique",
  "anxiety",
  "any",
  "apart",
  "apology",
  "appear",
  "apple",
  "approve",
  "april",
  "arch",
  "arctic",
  "area",
  "arena",
  "argue",
  "arm",
  "armed",
  "armor",
  "army",
  "around",
  "arrange",
  "arrest",
  "arrive",
  "arrow",
  "art",
  "artefact",
  "artist",
  "artwork",
  "ask",
  "aspect",
  "assault",
  "asset",
  "assist",
  "assume",
  "asthma",
  "athlete",
  "atom",
  "attack",
  "attend",
  "attitude",
  "attract",
  "auction",
  "audit",
  "august",
  "aunt",
  "author",
  "auto",
  "autumn",
  "average",
  "avocado",
  "avoid",
  "awake",
  "aware",
  "away",
  "awesome",
  "awful",
  "awkward",
  "axis",
  "baby",
  "bachelor",
  "bacon",
  "badge",
  "bag",
  "balance",
  "balcony",
  "ball",
  "bamboo",
  "banana",
  "banner",
  "bar",
  "barely",
  "bargain",
  "barrel",
  "base",
  "basic",
  "basket",
  "battle",
  "beach",
  "bean",
  "beauty",
  "because",
  "become",
  "beef",
  "before",
  "begin",
  "behave",
  "behind",
  "believe",
  "below",
  "belt",
  "bench",
  "benefit",
  "best",
  "betray",
  "better",
  "between",
  "beyond",
  "bicycle",
  "bid",
  "bike",
  "bind",
  "biology",
  "bird",
  "birth",
  "bitter",
  "black",
  "blade",
  "blame",
  "blanket",
  "blast",
  "bleak",
  "bless",
  "blind",
  "blood",
  "blossom",
  "blouse",
  "blue",
  "blur",
  "blush",
  "board",
  "boat",
  "body",
  "boil",
  "bomb",
  "bone",
  "bonus",
  "book",
  "boost",
  "border",
  "boring",
  "borrow",
  "boss",
  "bottom",
  "bounce",
  "box",
  "boy",
  "bracket",
  "brain",
  "brand",
  "brass",
  "brave",
  "bread",
  "breeze",
  "brick",
  "bridge",
  "brief",
  "bright",
  "bring",
  "brisk",
  "broccoli",
  "broken",
  "bronze",
  "broom",
  "brother",
  "brown",
  "brush",
  "bubble",
  "buddy",
  "budget",
  "buffalo",
  "build",
  "bulb",
  "bulk",
  "bullet",
  "bundle",
  "bunker",
  "burden",
  "burger",
  "burst",
  "bus",
  "business",
  "busy",
  "butter",
  "buyer",
  "buzz",
  "cabbage",
  "cabin",
  "cable",
  "cactus",
  "cage",
  "cake",
  "call",
  "calm",
  "camera",
  "camp",
  "can",
  "canal",
  "cancel",
  "candy",
  "cannon",
  "canoe",
  "canvas",
  "canyon",
  "capable",
  "capital",
  "captain",
  "car",
  "carbon",
  "card",
  "cargo",
  "carpet",
  "carry",
  "cart",
  "case",
  "cash",
  "casino",
  "castle",
  "casual",
  "cat",
  "catalog",
  "catch",
  "category",
  "cattle",
  "caught",
  "cause",
  "caution",
  "cave",
  "ceiling",
  "celery",
  "cement",
  "census",
  "century",
  "cereal",
  "certain",
  "chair",
  "chalk",
  "champion",
  "change",
  "chaos",
  "chapter",
  "charge",
  "chase",
  "chat",
  "cheap",
  "check",
  "cheese",
  "chef",
  "cherry",
  "chest",
  "chicken",
  "chief",
  "child",
  "chimney",
  "choice",
  "choose",
  "chronic",
  "chuckle",
  "chunk",
  "churn",
  "cigar",
  "cinnamon",
  "circle",
  "citizen",
  "city",
  "civil",
  "claim",
  "clap",
  "clarify",
  "claw",
  "clay",
  "clean",
  "clerk",
  "clever",
  "click",
  "client",
  "cliff",
  "climb",
  "clinic",
  "clip",
  "clock",
  "clog",
  "close",
  "cloth",
  "cloud",
  "clown",
  "club",
  "clump",
  "cluster",
  "clutch",
  "coach",
  "coast",
  "coconut",
  "code",
  "coffee",
  "coil",
  "coin",
  "collect",
  "color",
  "column",
  "combine",
  "come",
  "comfort",
  "comic",
  "common",
  "company",
  "concert",
  "conduct",
  "confirm",
  "congress",
  "connect",
  "consider",
  "control",
  "convince",
  "cook",
  "cool",
  "copper",
  "copy",
  "coral",
  "core",
  "corn",
  "correct",
  "cost",
  "cotton",
  "couch",
  "country",
  "couple",
  "course",
  "cousin",
  "cover",
  "coyote",
  "crack",
  "cradle",
  "craft",
  "cram",
  "crane",
  "crash",
  "crater",
  "crawl",
  "crazy",
  "cream",
  "credit",
  "creek",
  "crew",
  "cricket",
  "crime",
  "crisp",
  "critic",
  "crop",
  "cross",
  "crouch",
  "crowd",
  "crucial",
  "cruel",
  "cruise",
  "crumble",
  "crunch",
  "crush",
  "cry",
  "crystal",
  "cube",
  "culture",
  "cup",
  "cupboard",
  "curious",
  "current",
  "curtain",
  "curve",
  "cushion",
  "custom",
  "cute",
  "cycle",
  "dad",
  "damage",
  "damp",
  "dance",
  "danger",
  "daring",
  "dash",
  "daughter",
  "dawn",
  "day",
  "deal",
  "debate",
  "debris",
  "decade",
  "december",
  "decide",
  "decline",
  "decorate",
  "decrease",
  "deer",
  "defense",
  "define",
  "defy",
  "degree",
  "delay",
  "deliver",
  "demand",
  "demise",
  "denial",
  "dentist",
  "deny",
  "depart",
  "depend",
  "deposit",
  "depth",
  "deputy",
  "derive",
  "describe",
  "desert",
  "design",
  "desk",
  "despair",
  "destroy",
  "detail",
  "detect",
  "develop",
  "device",
  "devote",
  "diagram",
  "dial",
  "diamond",
  "diary",
  "dice",
  "diesel",
  "diet",
  "differ",
  "digital",
  "dignity",
  "dilemma",
  "dinner",
  "dinosaur",
  "direct",
  "dirt",
  "disagree",
  "discover",
  "disease",
  "dish",
  "dismiss",
  "disorder",
  "display",
  "distance",
  "divert",
  "divide",
  "divorce",
  "dizzy",
  "doctor",
  "document",
  "dog",
  "doll",
  "dolphin",
  "domain",
  "donate",
  "donkey",
  "donor",
  "door",
  "dose",
  "double",
  "dove",
  "draft",
  "dragon",
  "drama",
  "drastic",
  "draw",
  "dream",
  "dress",
  "drift",
  "drill",
  "drink",
  "drip",
  "drive",
  "drop",
  "drum",
  "dry",
  "duck",
  "dumb",
  "dune",
  "during",
  "dust",
  "dutch",
  "duty",
  "dwarf",
  "dynamic",
  "eager",
  "eagle",
  "early",
  "earn",
  "earth",
  "easily",
  "east",
  "easy",
  "echo",
  "ecology",
  "economy",
  "edge",
  "edit",
  "educate",
  "effort",
  "egg",
  "eight",
  "either",
  "elbow",
  "elder",
  "electric",
  "elegant",
  "element",
  "elephant",
  "elevator",
  "elite",
  "else",
  "embark",
  "embody",
  "embrace",
  "emerge",
  "emotion",
  "employ",
  "empower",
  "empty",
  "enable",
  "enact",
  "end",
  "endless",
  "endorse",
  "enemy",
  "energy",
  "enforce",
  "engage",
  "engine",
  "enhance",
  "enjoy",
  "enlist",
  "enough",
  "enrich",
  "enroll",
  "ensure",
  "enter",
  "entire",
  "entry",
  "envelope",
  "episode",
  "equal",
  "equip",
  "era",
  "erase",
  "erode",
  "erosion",
  "error",
  "erupt",
  "escape",
  "essay",
  "essence",
  "estate",
  "eternal",
  "ethics",
  "evidence",
  "evil",
  "evoke",
  "evolve",
  "exact",
  "example",
  "excess",
  "exchange",
  "excite",
  "exclude",
  "excuse",
  "execute",
  "exercise",
  "exhaust",
  "exhibit",
  "exile",
  "exist",
  "exit",
  "exotic",
  "expand",
  "expect",
  "expire",
  "explain",
  "expose",
  "express",
  "extend",
  "extra",
  "eye",
  "eyebrow",
  "fabric",
  "face",
  "faculty",
  "fade",
  "faint",
  "faith",
  "fall",
  "false",
  "fame",
  "family",
  "famous",
  "fan",
  "fancy",
  "fantasy",
  "farm",
  "fashion",
  "fat",
  "fatal",
  "father",
  "fatigue",
  "fault",
  "favorite",
  "feature",
  "february",
  "federal",
  "fee",
  "feed",
  "feel",
  "female",
  "fence",
  "festival",
  "fetch",
  "fever",
  "few",
  "fiber",
  "fiction",
  "field",
  "figure",
  "file",
  "film",
  "filter",
  "final",
  "find",
  "fine",
  "finger",
  "finish",
  "fire",
  "firm",
  "first",
  "fiscal",
  "fish",
  "fit",
  "fitness",
  "fix",
  "flag",
  "flame",
  "flash",
  "flat",
  "flavor",
  "flee",
  "flight",
  "flip",
  "float",
  "flock",
  "floor",
  "flower",
  "fluid",
  "flush",
  "fly",
  "foam",
  "focus",
  "fog",
  "foil",
  "fold",
  "follow",
  "food",
  "foot",
  "force",
  "forest",
  "forget",
  "fork",
  "fortune",
  "forum",
  "forward",
  "fossil",
  "foster",
  "found",
  "fox",
  "fragile",
  "frame",
  "frequent",
  "fresh",
  "friend",
  "fringe",
  "frog",
  "front",
  "frost",
  "frown",
  "frozen",
  "fruit",
  "fuel",
  "fun",
  "funny",
  "furnace",
  "fury",
  "future",
  "gadget",
  "gain",
  "galaxy",
  "gallery",
  "game",
  "gap",
  "garage",
  "garbage",
  "garden",
  "garlic",
  "garment",
  "gas",
  "gasp",
  "gate",
  "gather",
  "gauge",
  "gaze",
  "general",
  "genius",
  "genre",
  "gentle",
  "genuine",
  "gesture",
  "ghost",
  "giant",
  "gift",
  "giggle",
  "ginger",
  "giraffe",
  "girl",
  "give",
  "glad",
  "glance",
  "glare",
  "glass",
  "glide",
  "glimpse",
  "globe",
  "gloom",
  "glory",
  "glove",
  "glow",
  "glue",
  "goat",
  "goddess",
  "gold",
  "good",
  "goose",
  "gorilla",
  "gospel",
  "gossip",
  "govern",
  "gown",
  "grab",
  "grace",
  "grain",
  "grant",
  "grape",
  "grass",
  "gravity",
  "great",
  "green",
  "grid",
  "grief",
  "grit",
  "grocery",
  "group",
  "grow",
  "grunt",
  "guard",
  "guess",
  "guide",
  "guilt",
  "guitar",
  "gun",
  "gym",
  "habit",
  "hair",
  "half",
  "hammer",
  "hamster",
  "hand",
  "happy",
  "harbor",
  "hard",
  "harsh",
  "harvest",
  "hat",
  "have",
  "hawk",
  "hazard",
  "head",
  "health",
  "heart",
  "heavy",
  "hedgehog",
  "height",
  "hello",
  "helmet",
  "help",
  "hen",
  "hero",
  "hidden",
  "high",
  "hill",
  "hint",
  "hip",
  "hire",
  "history",
  "hobby",
  "hockey",
  "hold",
  "hole",
  "holiday",
  "hollow",
  "home",
  "honey",
  "hood",
  "hope",
  "horn",
  "horror",
  "horse",
  "hospital",
  "host",
  "hotel",
  "hour",
  "hover",
  "hub",
  "huge",
  "human",
  "humble",
  "humor",
  "hundred",
  "hungry",
  "hunt",
  "hurdle",
  "hurry",
  "hurt",
  "husband",
  "hybrid",
  "ice",
  "icon",
  "idea",
  "identify",
  "idle",
  "ignore",
  "ill",
  "illegal",
  "illness",
  "image",
  "imitate",
  "immense",
  "immune",
  "impact",
  "impose",
  "improve",
  "impulse",
  "inch",
  "include",
  "income",
  "increase",
  "index",
  "indicate",
  "indoor",
  "industry",
  "infant",
  "inflict",
  "inform",
  "inhale",
  "inherit",
  "initial",
  "inject",
  "injury",
  "inmate",
  "inner",
  "innocent",
  "input",
  "inquiry",
  "insane",
  "insect",
  "inside",
  "inspire",
  "install",
  "intact",
  "interest",
  "into",
  "invest",
  "invite",
  "involve",
  "iron",
  "island",
  "isolate",
  "issue",
  "item",
  "ivory",
  "jacket",
  "jaguar",
  "jar",
  "jazz",
  "jealous",
  "jeans",
  "jelly",
  "jewel",
  "job",
  "join",
  "joke",
  "journey",
  "joy",
  "judge",
  "juice",
  "jump",
  "jungle",
  "junior",
  "junk",
  "just",
  "kangaroo",
  "keen",
  "keep",
  "ketchup",
  "key",
  "kick",
  "kid",
  "kidney",
  "kind",
  "kingdom",
  "kiss",
  "kit",
  "kitchen",
  "kite",
  "kitten",
  "kiwi",
  "knee",
  "knife",
  "knock",
  "know",
  "lab",
  "label",
  "labor",
  "ladder",
  "lady",
  "lake",
  "lamp",
  "language",
  "laptop",
  "large",
  "later",
  "latin",
  "laugh",
  "laundry",
  "lava",
  "law",
  "lawn",
  "lawsuit",
  "layer",
  "lazy",
  "leader",
  "leaf",
  "learn",
  "leave",
  "lecture",
  "left",
  "leg",
  "legal",
  "legend",
  "leisure",
  "lemon",
  "lend",
  "length",
  "lens",
  "leopard",
  "lesson",
  "letter",
  "level",
  "liar",
  "liberty",
  "library",
  "license",
  "life",
  "lift",
  "light",
  "like",
  "limb",
  "limit",
  "link",
  "lion",
  "liquid",
  "list",
  "little",
  "live",
  "lizard",
  "load",
  "loan",
  "lobster",
  "local",
  "lock",
  "logic",
  "lonely",
  "long",
  "loop",
  "lottery",
  "loud",
  "lounge",
  "love",
  "loyal",
  "lucky",
  "luggage",
  "lumber",
  "lunar",
  "lunch",
  "luxury",
  "lyrics",
  "machine",
  "mad",
  "magic",
  "magnet",
  "maid",
  "mail",
  "main",
  "major",
  "make",
  "mammal",
  "man",
  "manage",
  "mandate",
  "mango",
  "mansion",
  "manual",
  "maple",
  "marble",
  "march",
  "margin",
  "marine",
  "market",
  "marriage",
  "mask",
  "mass",
  "master",
  "match",
  "material",
  "math",
  "matrix",
  "matter",
  "maximum",
  "maze",
  "meadow",
  "mean",
  "measure",
  "meat",
  "mechanic",
  "medal",
  "media",
  "melody",
  "melt",
  "member",
  "memory",
  "mention",
  "menu",
  "mercy",
  "merge",
  "merit",
  "merry",
  "mesh",
  "message",
  "metal",
  "method",
  "middle",
  "midnight",
  "milk",
  "million",
  "mimic",
  "mind",
  "minimum",
  "minor",
  "minute",
  "miracle",
  "mirror",
  "misery",
  "miss",
  "mistake",
  "mix",
  "mixed",
  "mixture",
  "mobile",
  "model",
  "modify",
  "mom",
  "moment",
  "monitor",
  "monkey",
  "monster",
  "month",
  "moon",
  "moral",
  "more",
  "morning",
  "mosquito",
  "mother",
  "motion",
  "motor",
  "mountain",
  "mouse",
  "move",
  "movie",
  "much",
  "muffin",
  "mule",
  "multiply",
  "muscle",
  "museum",
  "mushroom",
  "music",
  "must",
  "mutual",
  "myself",
  "mystery",
  "myth",
  "naive",
  "name",
  "napkin",
  "narrow",
  "nasty",
  "nation",
  "nature",
  "near",
  "neck",
  "need",
  "negative",
  "neglect",
  "neither",
  "nephew",
  "nerve",
  "nest",
  "net",
  "network",
  "neutral",
  "never",
  "news",
  "next",
  "nice",
  "night",
  "noble",
  "noise",
  "nominee",
  "noodle",
  "normal",
  "north",
  "nose",
  "notable",
  "note",
  "nothing",
  "notice",
  "novel",
  "now",
  "nuclear",
  "number",
  "nurse",
  "nut",
  "oak",
  "obey",
  "object",
  "oblige",
  "obscure",
  "observe",
  "obtain",
  "obvious",
  "occur",
  "ocean",
  "october",
  "odor",
  "off",
  "offer",
  "office",
  "often",
  "oil",
  "okay",
  "old",
  "olive",
  "olympic",
  "omit",
  "once",
  "one",
  "onion",
  "online",
  "only",
  "open",
  "opera",
  "opinion",
  "oppose",
  "option",
  "orange",
  "orbit",
  "orchard",
  "order",
  "ordinary",
  "organ",
  "orient",
  "original",
  "orphan",
  "ostrich",
  "other",
  "outdoor",
  "outer",
  "output",
  "outside",
  "oval",
  "oven",
  "over",
  "own",
  "owner",
  "oxygen",
  "oyster",
  "ozone",
  "pact",
  "paddle",
  "page",
  "pair",
  "palace",
  "palm",
  "panda",
  "panel",
  "panic",
  "panther",
  "paper",
  "parade",
  "parent",
  "park",
  "parrot",
  "party",
  "pass",
  "patch",
  "path",
  "patient",
  "patrol",
  "pattern",
  "pause",
  "pave",
  "payment",
  "peace",
  "peanut",
  "pear",
  "peasant",
  "pelican",
  "pen",
  "penalty",
  "pencil",
  "people",
  "pepper",
  "perfect",
  "permit",
  "person",
  "pet",
  "phone",
  "photo",
  "phrase",
  "physical",
  "piano",
  "picnic",
  "picture",
  "piece",
  "pig",
  "pigeon",
  "pill",
  "pilot",
  "pink",
  "pioneer",
  "pipe",
  "pistol",
  "pitch",
  "pizza",
  "place",
  "planet",
  "plastic",
  "plate",
  "play",
  "please",
  "pledge",
  "pluck",
  "plug",
  "plunge",
  "poem",
  "poet",
  "point",
  "polar",
  "pole",
  "police",
  "pond",
  "pony",
  "pool",
  "popular",
  "portion",
  "position",
  "possible",
  "post",
  "potato",
  "pottery",
  "poverty",
  "powder",
  "power",
  "practice",
  "praise",
  "predict",
  "prefer",
  "prepare",
  "present",
  "pretty",
  "prevent",
  "price",
  "pride",
  "primary",
  "print",
  "priority",
  "prison",
  "private",
  "prize",
  "problem",
  "process",
  "produce",
  "profit",
  "program",
  "project",
  "promote",
  "proof",
  "property",
  "prosper",
  "protect",
  "proud",
  "provide",
  "public",
  "pudding",
  "pull",
  "pulp",
  "pulse",
  "pumpkin",
  "punch",
  "pupil",
  "puppy",
  "purchase",
  "purity",
  "purpose",
  "purse",
  "push",
  "put",
  "puzzle",
  "pyramid",
  "quality",
  "quantum",
  "quarter",
  "question",
  "quick",
  "quit",
  "quiz",
  "quote",
  "rabbit",
  "raccoon",
  "race",
  "rack",
  "radar",
  "radio",
  "rail",
  "rain",
  "raise",
  "rally",
  "ramp",
  "ranch",
  "random",
  "range",
  "rapid",
  "rare",
  "rate",
  "rather",
  "raven",
  "raw",
  "razor",
  "ready",
  "real",
  "reason",
  "rebel",
  "rebuild",
  "recall",
  "receive",
  "recipe",
  "record",
  "recycle",
  "reduce",
  "reflect",
  "reform",
  "refuse",
  "region",
  "regret",
  "regular",
  "reject",
  "relax",
  "release",
  "relief",
  "rely",
  "remain",
  "remember",
  "remind",
  "remove",
  "render",
  "renew",
  "rent",
  "reopen",
  "repair",
  "repeat",
  "replace",
  "report",
  "require",
  "rescue",
  "resemble",
  "resist",
  "resource",
  "response",
  "result",
  "retire",
  "retreat",
  "return",
  "reunion",
  "reveal",
  "review",
  "reward",
  "rhythm",
  "rib",
  "ribbon",
  "rice",
  "rich",
  "ride",
  "ridge",
  "rifle",
  "right",
  "rigid",
  "ring",
  "riot",
  "ripple",
  "risk",
  "ritual",
  "rival",
  "river",
  "road",
  "roast",
  "robot",
  "robust",
  "rocket",
  "romance",
  "roof",
  "rookie",
  "room",
  "rose",
  "rotate",
  "rough",
  "round",
  "route",
  "royal",
  "rubber",
  "rude",
  "rug",
  "rule",
  "run",
  "runway",
  "rural",
  "sad",
  "saddle",
  "sadness",
  "safe",
  "sail",
  "salad",
  "salmon",
  "salon",
  "salt",
  "salute",
  "same",
  "sample",
  "sand",
  "satisfy",
  "satoshi",
  "sauce",
  "sausage",
  "save",
  "say",
  "scale",
  "scan",
  "scare",
  "scatter",
  "scene",
  "scheme",
  "school",
  "science",
  "scissors",
  "scorpion",
  "scout",
  "scrap",
  "screen",
  "script",
  "scrub",
  "sea",
  "search",
  "season",
  "seat",
  "second",
  "secret",
  "section",
  "security",
  "seed",
  "seek",
  "segment",
  "select",
  "sell",
  "seminar",
  "senior",
  "sense",
  "sentence",
  "series",
  "service",
  "session",
  "settle",
  "setup",
  "seven",
  "shadow",
  "shaft",
  "shallow",
  "share",
  "shed",
  "shell",
  "sheriff",
  "shield",
  "shift",
  "shine",
  "ship",
  "shiver",
  "shock",
  "shoe",
  "shoot",
  "shop",
  "short",
  "shoulder",
  "shove",
  "shrimp",
  "shrug",
  "shuffle",
  "shy",
  "sibling",
  "sick",
  "side",
  "siege",
  "sight",
  "sign",
  "silent",
  "silk",
  "silly",
  "silver",
  "similar",
  "simple",
  "since",
  "sing",
  "siren",
  "sister",
  "situate",
  "six",
  "size",
  "skate",
  "sketch",
  "ski",
  "skill",
  "skin",
  "skirt",
  "skull",
  "slab",
  "slam",
  "sleep",
  "slender",
  "slice",
  "slide",
  "slight",
  "slim",
  "slogan",
  "slot",
  "slow",
  "slush",
  "small",
  "smart",
  "smile",
  "smoke",
  "smooth",
  "snack",
  "snake",
  "snap",
  "sniff",
  "snow",
  "soap",
  "soccer",
  "social",
  "sock",
  "soda",
  "soft",
  "solar",
  "soldier",
  "solid",
  "solution",
  "solve",
  "someone",
  "song",
  "soon",
  "sorry",
  "sort",
  "soul",
  "sound",
  "soup",
  "source",
  "south",
  "space",
  "spare",
  "spatial",
  "spawn",
  "speak",
  "special",
  "speed",
  "spell",
  "spend",
  "sphere",
  "spice",
  "spider",
  "spike",
  "spin",
  "spirit",
  "split",
  "spoil",
  "sponsor",
  "spoon",
  "sport",
  "spot",
  "spray",
  "spread",
  "spring",
  "spy",
  "square",
  "squeeze",
  "squirrel",
  "stable",
  "stadium",
  "staff",
  "stage",
  "stairs",
  "stamp",
  "stand",
  "start",
  "state",
  "stay",
  "steak",
  "steel",
  "stem",
  "step",
  "stereo",
  "stick",
  "still",
  "sting",
  "stock",
  "stomach",
  "stone",
  "stool",
  "story",
  "stove",
  "strategy",
  "street",
  "strike",
  "strong",
  "struggle",
  "student",
  "stuff",
  "stumble",
  "style",
  "subject",
  "submit",
  "subway",
  "success",
  "such",
  "sudden",
  "suffer",
  "sugar",
  "suggest",
  "suit",
  "summer",
  "sun",
  "sunny",
  "sunset",
  "super",
  "supply",
  "supreme",
  "sure",
  "surface",
  "surge",
  "surprise",
  "surround",
  "survey",
  "suspect",
  "sustain",
  "swallow",
  "swamp",
  "swap",
  "swarm",
  "swear",
  "sweet",
  "swift",
  "swim",
  "swing",
  "switch",
  "sword",
  "symbol",
  "symptom",
  "syrup",
  "system",
  "table",
  "tackle",
  "tag",
  "tail",
  "talent",
  "talk",
  "tank",
  "tape",
  "target",
  "task",
  "taste",
  "tattoo",
  "taxi",
  "teach",
  "team",
  "tell",
  "ten",
  "tenant",
  "tennis",
  "tent",
  "term",
  "test",
  "text",
  "thank",
  "that",
  "theme",
  "then",
  "theory",
  "there",
  "they",
  "thing",
  "this",
  "thought",
  "three",
  "thrive",
  "throw",
  "thumb",
  "thunder",
  "ticket",
  "tide",
  "tiger",
  "tilt",
  "timber",
  "time",
  "tiny",
  "tip",
  "tired",
  "tissue",
  "title",
  "toast",
  "tobacco",
  "today",
  "toddler",
  "toe",
  "together",
  "toilet",
  "token",
  "tomato",
  "tomorrow",
  "tone",
  "tongue",
  "tonight",
  "tool",
  "tooth",
  "top",
  "topic",
  "topple",
  "torch",
  "tornado",
  "tortoise",
  "toss",
  "total",
  "tourist",
  "toward",
  "tower",
  "town",
  "toy",
  "track",
  "trade",
  "traffic",
  "tragic",
  "train",
  "transfer",
  "trap",
  "trash",
  "travel",
  "tray",
  "treat",
  "tree",
  "trend",
  "trial",
  "tribe",
  "trick",
  "trigger",
  "trim",
  "trip",
  "trophy",
  "trouble",
  "truck",
  "true",
  "truly",
  "trumpet",
  "trust",
  "truth",
  "try",
  "tube",
  "tuition",
  "tumble",
  "tuna",
  "tunnel",
  "turkey",
  "turn",
  "turtle",
  "twelve",
  "twenty",
  "twice",
  "twin",
  "twist",
  "two",
  "type",
  "typical",
  "ugly",
  "umbrella",
  "unable",
  "unaware",
  "uncle",
  "uncover",
  "under",
  "undo",
  "unfair",
  "unfold",
  "unhappy",
  "uniform",
  "unique",
  "unit",
  "universe",
  "unknown",
  "unlock",
  "until",
  "unusual",
  "unveil",
  "update",
  "upgrade",
  "uphold",
  "upon",
  "upper",
  "upset",
  "urban",
  "urge",
  "usage",
  "use",
  "used",
  "useful",
  "useless",
  "usual",
  "utility",
  "vacant",
  "vacuum",
  "vague",
  "valid",
  "valley",
  "valve",
  "van",
  "vanish",
  "vapor",
  "various",
  "vast",
  "vault",
  "vehicle",
  "velvet",
  "vendor",
  "venture",
  "venue",
  "verb",
  "verify",
  "version",
  "very",
  "vessel",
  "veteran",
  "viable",
  "vibrant",
  "vicious",
  "victory",
  "video",
  "view",
  "village",
  "vintage",
  "violin",
  "virtual",
  "virus",
  "visa",
  "visit",
  "visual",
  "vital",
  "vivid",
  "vocal",
  "voice",
  "void",
  "volcano",
  "volume",
  "vote",
  "voyage",
  "wage",
  "wagon",
  "wait",
  "walk",
  "wall",
  "walnut",
  "want",
  "warfare",
  "warm",
  "warrior",
  "wash",
  "wasp",
  "waste",
  "water",
  "wave",
  "way",
  "wealth",
  "weapon",
  "wear",
  "weasel",
  "weather",
  "web",
  "wedding",
  "weekend",
  "weird",
  "welcome",
  "west",
  "wet",
  "whale",
  "what",
  "wheat",
  "wheel",
  "when",
  "where",
  "whip",
  "whisper",
  "wide",
  "width",
  "wife",
  "wild",
  "will",
  "win",
  "window",
  "wine",
  "wing",
  "wink",
  "winner",
  "winter",
  "wire",
  "wisdom",
  "wise",
  "wish",
  "witness",
  "wolf",
  "woman",
  "wonder",
  "wood",
  "wool",
  "word",
  "work",
  "world",
  "worry",
  "worth",
  "wrap",
  "wreck",
  "wrestle",
  "wrist",
  "write",
  "wrong",
  "yard",
  "year",
  "yellow",
  "you",
  "young",
  "youth",
  "zebra",
  "zero",
  "zone",
  "zoo"
]

},{}],32:[function(require,module,exports){
module.exports=[
  "abaisser",
  "abandon",
  "abdiquer",
  "abeille",
  "abolir",
  "aborder",
  "aboutir",
  "aboyer",
  "abrasif",
  "abreuver",
  "abriter",
  "abroger",
  "abrupt",
  "absence",
  "absolu",
  "absurde",
  "abusif",
  "abyssal",
  "acade╠ümie",
  "acajou",
  "acarien",
  "accabler",
  "accepter",
  "acclamer",
  "accolade",
  "accroche",
  "accuser",
  "acerbe",
  "achat",
  "acheter",
  "aciduler",
  "acier",
  "acompte",
  "acque╠ürir",
  "acronyme",
  "acteur",
  "actif",
  "actuel",
  "adepte",
  "ade╠üquat",
  "adhe╠üsif",
  "adjectif",
  "adjuger",
  "admettre",
  "admirer",
  "adopter",
  "adorer",
  "adoucir",
  "adresse",
  "adroit",
  "adulte",
  "adverbe",
  "ae╠ürer",
  "ae╠üronef",
  "affaire",
  "affecter",
  "affiche",
  "affreux",
  "affubler",
  "agacer",
  "agencer",
  "agile",
  "agiter",
  "agrafer",
  "agre╠üable",
  "agrume",
  "aider",
  "aiguille",
  "ailier",
  "aimable",
  "aisance",
  "ajouter",
  "ajuster",
  "alarmer",
  "alchimie",
  "alerte",
  "alge╠Çbre",
  "algue",
  "alie╠üner",
  "aliment",
  "alle╠üger",
  "alliage",
  "allouer",
  "allumer",
  "alourdir",
  "alpaga",
  "altesse",
  "alve╠üole",
  "amateur",
  "ambigu",
  "ambre",
  "ame╠ünager",
  "amertume",
  "amidon",
  "amiral",
  "amorcer",
  "amour",
  "amovible",
  "amphibie",
  "ampleur",
  "amusant",
  "analyse",
  "anaphore",
  "anarchie",
  "anatomie",
  "ancien",
  "ane╠üantir",
  "angle",
  "angoisse",
  "anguleux",
  "animal",
  "annexer",
  "annonce",
  "annuel",
  "anodin",
  "anomalie",
  "anonyme",
  "anormal",
  "antenne",
  "antidote",
  "anxieux",
  "apaiser",
  "ape╠üritif",
  "aplanir",
  "apologie",
  "appareil",
  "appeler",
  "apporter",
  "appuyer",
  "aquarium",
  "aqueduc",
  "arbitre",
  "arbuste",
  "ardeur",
  "ardoise",
  "argent",
  "arlequin",
  "armature",
  "armement",
  "armoire",
  "armure",
  "arpenter",
  "arracher",
  "arriver",
  "arroser",
  "arsenic",
  "arte╠üriel",
  "article",
  "aspect",
  "asphalte",
  "aspirer",
  "assaut",
  "asservir",
  "assiette",
  "associer",
  "assurer",
  "asticot",
  "astre",
  "astuce",
  "atelier",
  "atome",
  "atrium",
  "atroce",
  "attaque",
  "attentif",
  "attirer",
  "attraper",
  "aubaine",
  "auberge",
  "audace",
  "audible",
  "augurer",
  "aurore",
  "automne",
  "autruche",
  "avaler",
  "avancer",
  "avarice",
  "avenir",
  "averse",
  "aveugle",
  "aviateur",
  "avide",
  "avion",
  "aviser",
  "avoine",
  "avouer",
  "avril",
  "axial",
  "axiome",
  "badge",
  "bafouer",
  "bagage",
  "baguette",
  "baignade",
  "balancer",
  "balcon",
  "baleine",
  "balisage",
  "bambin",
  "bancaire",
  "bandage",
  "banlieue",
  "bannie╠Çre",
  "banquier",
  "barbier",
  "baril",
  "baron",
  "barque",
  "barrage",
  "bassin",
  "bastion",
  "bataille",
  "bateau",
  "batterie",
  "baudrier",
  "bavarder",
  "belette",
  "be╠ülier",
  "belote",
  "be╠üne╠üfice",
  "berceau",
  "berger",
  "berline",
  "bermuda",
  "besace",
  "besogne",
  "be╠ütail",
  "beurre",
  "biberon",
  "bicycle",
  "bidule",
  "bijou",
  "bilan",
  "bilingue",
  "billard",
  "binaire",
  "biologie",
  "biopsie",
  "biotype",
  "biscuit",
  "bison",
  "bistouri",
  "bitume",
  "bizarre",
  "blafard",
  "blague",
  "blanchir",
  "blessant",
  "blinder",
  "blond",
  "bloquer",
  "blouson",
  "bobard",
  "bobine",
  "boire",
  "boiser",
  "bolide",
  "bonbon",
  "bondir",
  "bonheur",
  "bonifier",
  "bonus",
  "bordure",
  "borne",
  "botte",
  "boucle",
  "boueux",
  "bougie",
  "boulon",
  "bouquin",
  "bourse",
  "boussole",
  "boutique",
  "boxeur",
  "branche",
  "brasier",
  "brave",
  "brebis",
  "bre╠Çche",
  "breuvage",
  "bricoler",
  "brigade",
  "brillant",
  "brioche",
  "brique",
  "brochure",
  "broder",
  "bronzer",
  "brousse",
  "broyeur",
  "brume",
  "brusque",
  "brutal",
  "bruyant",
  "buffle",
  "buisson",
  "bulletin",
  "bureau",
  "burin",
  "bustier",
  "butiner",
  "butoir",
  "buvable",
  "buvette",
  "cabanon",
  "cabine",
  "cachette",
  "cadeau",
  "cadre",
  "cafe╠üine",
  "caillou",
  "caisson",
  "calculer",
  "calepin",
  "calibre",
  "calmer",
  "calomnie",
  "calvaire",
  "camarade",
  "came╠üra",
  "camion",
  "campagne",
  "canal",
  "caneton",
  "canon",
  "cantine",
  "canular",
  "capable",
  "caporal",
  "caprice",
  "capsule",
  "capter",
  "capuche",
  "carabine",
  "carbone",
  "caresser",
  "caribou",
  "carnage",
  "carotte",
  "carreau",
  "carton",
  "cascade",
  "casier",
  "casque",
  "cassure",
  "causer",
  "caution",
  "cavalier",
  "caverne",
  "caviar",
  "ce╠üdille",
  "ceinture",
  "ce╠üleste",
  "cellule",
  "cendrier",
  "censurer",
  "central",
  "cercle",
  "ce╠üre╠übral",
  "cerise",
  "cerner",
  "cerveau",
  "cesser",
  "chagrin",
  "chaise",
  "chaleur",
  "chambre",
  "chance",
  "chapitre",
  "charbon",
  "chasseur",
  "chaton",
  "chausson",
  "chavirer",
  "chemise",
  "chenille",
  "che╠üquier",
  "chercher",
  "cheval",
  "chien",
  "chiffre",
  "chignon",
  "chime╠Çre",
  "chiot",
  "chlorure",
  "chocolat",
  "choisir",
  "chose",
  "chouette",
  "chrome",
  "chute",
  "cigare",
  "cigogne",
  "cimenter",
  "cine╠üma",
  "cintrer",
  "circuler",
  "cirer",
  "cirque",
  "citerne",
  "citoyen",
  "citron",
  "civil",
  "clairon",
  "clameur",
  "claquer",
  "classe",
  "clavier",
  "client",
  "cligner",
  "climat",
  "clivage",
  "cloche",
  "clonage",
  "cloporte",
  "cobalt",
  "cobra",
  "cocasse",
  "cocotier",
  "coder",
  "codifier",
  "coffre",
  "cogner",
  "cohe╠üsion",
  "coiffer",
  "coincer",
  "cole╠Çre",
  "colibri",
  "colline",
  "colmater",
  "colonel",
  "combat",
  "come╠üdie",
  "commande",
  "compact",
  "concert",
  "conduire",
  "confier",
  "congeler",
  "connoter",
  "consonne",
  "contact",
  "convexe",
  "copain",
  "copie",
  "corail",
  "corbeau",
  "cordage",
  "corniche",
  "corpus",
  "correct",
  "corte╠Çge",
  "cosmique",
  "costume",
  "coton",
  "coude",
  "coupure",
  "courage",
  "couteau",
  "couvrir",
  "coyote",
  "crabe",
  "crainte",
  "cravate",
  "crayon",
  "cre╠üature",
  "cre╠üditer",
  "cre╠ümeux",
  "creuser",
  "crevette",
  "cribler",
  "crier",
  "cristal",
  "crite╠Çre",
  "croire",
  "croquer",
  "crotale",
  "crucial",
  "cruel",
  "crypter",
  "cubique",
  "cueillir",
  "cuille╠Çre",
  "cuisine",
  "cuivre",
  "culminer",
  "cultiver",
  "cumuler",
  "cupide",
  "curatif",
  "curseur",
  "cyanure",
  "cycle",
  "cylindre",
  "cynique",
  "daigner",
  "damier",
  "danger",
  "danseur",
  "dauphin",
  "de╠übattre",
  "de╠übiter",
  "de╠üborder",
  "de╠übrider",
  "de╠übutant",
  "de╠ücaler",
  "de╠ücembre",
  "de╠üchirer",
  "de╠ücider",
  "de╠üclarer",
  "de╠ücorer",
  "de╠ücrire",
  "de╠ücupler",
  "de╠üdale",
  "de╠üductif",
  "de╠üesse",
  "de╠üfensif",
  "de╠üfiler",
  "de╠üfrayer",
  "de╠ügager",
  "de╠ügivrer",
  "de╠üglutir",
  "de╠ügrafer",
  "de╠üjeuner",
  "de╠ülice",
  "de╠üloger",
  "demander",
  "demeurer",
  "de╠ümolir",
  "de╠ünicher",
  "de╠ünouer",
  "dentelle",
  "de╠ünuder",
  "de╠üpart",
  "de╠üpenser",
  "de╠üphaser",
  "de╠üplacer",
  "de╠üposer",
  "de╠üranger",
  "de╠ürober",
  "de╠üsastre",
  "descente",
  "de╠üsert",
  "de╠üsigner",
  "de╠üsobe╠üir",
  "dessiner",
  "destrier",
  "de╠ütacher",
  "de╠ütester",
  "de╠ütourer",
  "de╠ütresse",
  "devancer",
  "devenir",
  "deviner",
  "devoir",
  "diable",
  "dialogue",
  "diamant",
  "dicter",
  "diffe╠ürer",
  "dige╠ürer",
  "digital",
  "digne",
  "diluer",
  "dimanche",
  "diminuer",
  "dioxyde",
  "directif",
  "diriger",
  "discuter",
  "disposer",
  "dissiper",
  "distance",
  "divertir",
  "diviser",
  "docile",
  "docteur",
  "dogme",
  "doigt",
  "domaine",
  "domicile",
  "dompter",
  "donateur",
  "donjon",
  "donner",
  "dopamine",
  "dortoir",
  "dorure",
  "dosage",
  "doseur",
  "dossier",
  "dotation",
  "douanier",
  "double",
  "douceur",
  "douter",
  "doyen",
  "dragon",
  "draper",
  "dresser",
  "dribbler",
  "droiture",
  "duperie",
  "duplexe",
  "durable",
  "durcir",
  "dynastie",
  "e╠üblouir",
  "e╠ücarter",
  "e╠ücharpe",
  "e╠üchelle",
  "e╠üclairer",
  "e╠üclipse",
  "e╠üclore",
  "e╠ücluse",
  "e╠ücole",
  "e╠üconomie",
  "e╠ücorce",
  "e╠ücouter",
  "e╠ücraser",
  "e╠ücre╠ümer",
  "e╠ücrivain",
  "e╠ücrou",
  "e╠ücume",
  "e╠ücureuil",
  "e╠üdifier",
  "e╠üduquer",
  "effacer",
  "effectif",
  "effigie",
  "effort",
  "effrayer",
  "effusion",
  "e╠ügaliser",
  "e╠ügarer",
  "e╠üjecter",
  "e╠ülaborer",
  "e╠ülargir",
  "e╠ülectron",
  "e╠üle╠ügant",
  "e╠üle╠üphant",
  "e╠üle╠Çve",
  "e╠üligible",
  "e╠ülitisme",
  "e╠üloge",
  "e╠ülucider",
  "e╠üluder",
  "emballer",
  "embellir",
  "embryon",
  "e╠ümeraude",
  "e╠ümission",
  "emmener",
  "e╠ümotion",
  "e╠ümouvoir",
  "empereur",
  "employer",
  "emporter",
  "emprise",
  "e╠ümulsion",
  "encadrer",
  "enche╠Çre",
  "enclave",
  "encoche",
  "endiguer",
  "endosser",
  "endroit",
  "enduire",
  "e╠ünergie",
  "enfance",
  "enfermer",
  "enfouir",
  "engager",
  "engin",
  "englober",
  "e╠ünigme",
  "enjamber",
  "enjeu",
  "enlever",
  "ennemi",
  "ennuyeux",
  "enrichir",
  "enrobage",
  "enseigne",
  "entasser",
  "entendre",
  "entier",
  "entourer",
  "entraver",
  "e╠ünume╠ürer",
  "envahir",
  "enviable",
  "envoyer",
  "enzyme",
  "e╠üolien",
  "e╠üpaissir",
  "e╠üpargne",
  "e╠üpatant",
  "e╠üpaule",
  "e╠üpicerie",
  "e╠üpide╠ümie",
  "e╠üpier",
  "e╠üpilogue",
  "e╠üpine",
  "e╠üpisode",
  "e╠üpitaphe",
  "e╠üpoque",
  "e╠üpreuve",
  "e╠üprouver",
  "e╠üpuisant",
  "e╠üquerre",
  "e╠üquipe",
  "e╠üriger",
  "e╠ürosion",
  "erreur",
  "e╠üruption",
  "escalier",
  "espadon",
  "espe╠Çce",
  "espie╠Çgle",
  "espoir",
  "esprit",
  "esquiver",
  "essayer",
  "essence",
  "essieu",
  "essorer",
  "estime",
  "estomac",
  "estrade",
  "e╠ütage╠Çre",
  "e╠ütaler",
  "e╠ütanche",
  "e╠ütatique",
  "e╠üteindre",
  "e╠ütendoir",
  "e╠üternel",
  "e╠üthanol",
  "e╠üthique",
  "ethnie",
  "e╠ütirer",
  "e╠ütoffer",
  "e╠ütoile",
  "e╠ütonnant",
  "e╠ütourdir",
  "e╠ütrange",
  "e╠ütroit",
  "e╠ütude",
  "euphorie",
  "e╠üvaluer",
  "e╠üvasion",
  "e╠üventail",
  "e╠üvidence",
  "e╠üviter",
  "e╠üvolutif",
  "e╠üvoquer",
  "exact",
  "exage╠ürer",
  "exaucer",
  "exceller",
  "excitant",
  "exclusif",
  "excuse",
  "exe╠ücuter",
  "exemple",
  "exercer",
  "exhaler",
  "exhorter",
  "exigence",
  "exiler",
  "exister",
  "exotique",
  "expe╠üdier",
  "explorer",
  "exposer",
  "exprimer",
  "exquis",
  "extensif",
  "extraire",
  "exulter",
  "fable",
  "fabuleux",
  "facette",
  "facile",
  "facture",
  "faiblir",
  "falaise",
  "fameux",
  "famille",
  "farceur",
  "farfelu",
  "farine",
  "farouche",
  "fasciner",
  "fatal",
  "fatigue",
  "faucon",
  "fautif",
  "faveur",
  "favori",
  "fe╠übrile",
  "fe╠üconder",
  "fe╠üde╠ürer",
  "fe╠ülin",
  "femme",
  "fe╠ümur",
  "fendoir",
  "fe╠üodal",
  "fermer",
  "fe╠üroce",
  "ferveur",
  "festival",
  "feuille",
  "feutre",
  "fe╠üvrier",
  "fiasco",
  "ficeler",
  "fictif",
  "fide╠Çle",
  "figure",
  "filature",
  "filetage",
  "filie╠Çre",
  "filleul",
  "filmer",
  "filou",
  "filtrer",
  "financer",
  "finir",
  "fiole",
  "firme",
  "fissure",
  "fixer",
  "flairer",
  "flamme",
  "flasque",
  "flatteur",
  "fle╠üau",
  "fle╠Çche",
  "fleur",
  "flexion",
  "flocon",
  "flore",
  "fluctuer",
  "fluide",
  "fluvial",
  "folie",
  "fonderie",
  "fongible",
  "fontaine",
  "forcer",
  "forgeron",
  "formuler",
  "fortune",
  "fossile",
  "foudre",
  "fouge╠Çre",
  "fouiller",
  "foulure",
  "fourmi",
  "fragile",
  "fraise",
  "franchir",
  "frapper",
  "frayeur",
  "fre╠ügate",
  "freiner",
  "frelon",
  "fre╠ümir",
  "fre╠üne╠üsie",
  "fre╠Çre",
  "friable",
  "friction",
  "frisson",
  "frivole",
  "froid",
  "fromage",
  "frontal",
  "frotter",
  "fruit",
  "fugitif",
  "fuite",
  "fureur",
  "furieux",
  "furtif",
  "fusion",
  "futur",
  "gagner",
  "galaxie",
  "galerie",
  "gambader",
  "garantir",
  "gardien",
  "garnir",
  "garrigue",
  "gazelle",
  "gazon",
  "ge╠üant",
  "ge╠ülatine",
  "ge╠ülule",
  "gendarme",
  "ge╠üne╠üral",
  "ge╠ünie",
  "genou",
  "gentil",
  "ge╠üologie",
  "ge╠üome╠Çtre",
  "ge╠üranium",
  "germe",
  "gestuel",
  "geyser",
  "gibier",
  "gicler",
  "girafe",
  "givre",
  "glace",
  "glaive",
  "glisser",
  "globe",
  "gloire",
  "glorieux",
  "golfeur",
  "gomme",
  "gonfler",
  "gorge",
  "gorille",
  "goudron",
  "gouffre",
  "goulot",
  "goupille",
  "gourmand",
  "goutte",
  "graduel",
  "graffiti",
  "graine",
  "grand",
  "grappin",
  "gratuit",
  "gravir",
  "grenat",
  "griffure",
  "griller",
  "grimper",
  "grogner",
  "gronder",
  "grotte",
  "groupe",
  "gruger",
  "grutier",
  "gruye╠Çre",
  "gue╠üpard",
  "guerrier",
  "guide",
  "guimauve",
  "guitare",
  "gustatif",
  "gymnaste",
  "gyrostat",
  "habitude",
  "hachoir",
  "halte",
  "hameau",
  "hangar",
  "hanneton",
  "haricot",
  "harmonie",
  "harpon",
  "hasard",
  "he╠ülium",
  "he╠ümatome",
  "herbe",
  "he╠ürisson",
  "hermine",
  "he╠üron",
  "he╠üsiter",
  "heureux",
  "hiberner",
  "hibou",
  "hilarant",
  "histoire",
  "hiver",
  "homard",
  "hommage",
  "homoge╠Çne",
  "honneur",
  "honorer",
  "honteux",
  "horde",
  "horizon",
  "horloge",
  "hormone",
  "horrible",
  "houleux",
  "housse",
  "hublot",
  "huileux",
  "humain",
  "humble",
  "humide",
  "humour",
  "hurler",
  "hydromel",
  "hygie╠Çne",
  "hymne",
  "hypnose",
  "idylle",
  "ignorer",
  "iguane",
  "illicite",
  "illusion",
  "image",
  "imbiber",
  "imiter",
  "immense",
  "immobile",
  "immuable",
  "impact",
  "impe╠ürial",
  "implorer",
  "imposer",
  "imprimer",
  "imputer",
  "incarner",
  "incendie",
  "incident",
  "incliner",
  "incolore",
  "indexer",
  "indice",
  "inductif",
  "ine╠üdit",
  "ineptie",
  "inexact",
  "infini",
  "infliger",
  "informer",
  "infusion",
  "inge╠ürer",
  "inhaler",
  "inhiber",
  "injecter",
  "injure",
  "innocent",
  "inoculer",
  "inonder",
  "inscrire",
  "insecte",
  "insigne",
  "insolite",
  "inspirer",
  "instinct",
  "insulter",
  "intact",
  "intense",
  "intime",
  "intrigue",
  "intuitif",
  "inutile",
  "invasion",
  "inventer",
  "inviter",
  "invoquer",
  "ironique",
  "irradier",
  "irre╠üel",
  "irriter",
  "isoler",
  "ivoire",
  "ivresse",
  "jaguar",
  "jaillir",
  "jambe",
  "janvier",
  "jardin",
  "jauger",
  "jaune",
  "javelot",
  "jetable",
  "jeton",
  "jeudi",
  "jeunesse",
  "joindre",
  "joncher",
  "jongler",
  "joueur",
  "jouissif",
  "journal",
  "jovial",
  "joyau",
  "joyeux",
  "jubiler",
  "jugement",
  "junior",
  "jupon",
  "juriste",
  "justice",
  "juteux",
  "juve╠ünile",
  "kayak",
  "kimono",
  "kiosque",
  "label",
  "labial",
  "labourer",
  "lace╠ürer",
  "lactose",
  "lagune",
  "laine",
  "laisser",
  "laitier",
  "lambeau",
  "lamelle",
  "lampe",
  "lanceur",
  "langage",
  "lanterne",
  "lapin",
  "largeur",
  "larme",
  "laurier",
  "lavabo",
  "lavoir",
  "lecture",
  "le╠ügal",
  "le╠üger",
  "le╠ügume",
  "lessive",
  "lettre",
  "levier",
  "lexique",
  "le╠üzard",
  "liasse",
  "libe╠ürer",
  "libre",
  "licence",
  "licorne",
  "lie╠Çge",
  "lie╠Çvre",
  "ligature",
  "ligoter",
  "ligue",
  "limer",
  "limite",
  "limonade",
  "limpide",
  "line╠üaire",
  "lingot",
  "lionceau",
  "liquide",
  "lisie╠Çre",
  "lister",
  "lithium",
  "litige",
  "littoral",
  "livreur",
  "logique",
  "lointain",
  "loisir",
  "lombric",
  "loterie",
  "louer",
  "lourd",
  "loutre",
  "louve",
  "loyal",
  "lubie",
  "lucide",
  "lucratif",
  "lueur",
  "lugubre",
  "luisant",
  "lumie╠Çre",
  "lunaire",
  "lundi",
  "luron",
  "lutter",
  "luxueux",
  "machine",
  "magasin",
  "magenta",
  "magique",
  "maigre",
  "maillon",
  "maintien",
  "mairie",
  "maison",
  "majorer",
  "malaxer",
  "male╠üfice",
  "malheur",
  "malice",
  "mallette",
  "mammouth",
  "mandater",
  "maniable",
  "manquant",
  "manteau",
  "manuel",
  "marathon",
  "marbre",
  "marchand",
  "mardi",
  "maritime",
  "marqueur",
  "marron",
  "marteler",
  "mascotte",
  "massif",
  "mate╠üriel",
  "matie╠Çre",
  "matraque",
  "maudire",
  "maussade",
  "mauve",
  "maximal",
  "me╠üchant",
  "me╠üconnu",
  "me╠üdaille",
  "me╠üdecin",
  "me╠üditer",
  "me╠üduse",
  "meilleur",
  "me╠ülange",
  "me╠ülodie",
  "membre",
  "me╠ümoire",
  "menacer",
  "mener",
  "menhir",
  "mensonge",
  "mentor",
  "mercredi",
  "me╠ürite",
  "merle",
  "messager",
  "mesure",
  "me╠ütal",
  "me╠üte╠üore",
  "me╠üthode",
  "me╠ütier",
  "meuble",
  "miauler",
  "microbe",
  "miette",
  "mignon",
  "migrer",
  "milieu",
  "million",
  "mimique",
  "mince",
  "mine╠üral",
  "minimal",
  "minorer",
  "minute",
  "miracle",
  "miroiter",
  "missile",
  "mixte",
  "mobile",
  "moderne",
  "moelleux",
  "mondial",
  "moniteur",
  "monnaie",
  "monotone",
  "monstre",
  "montagne",
  "monument",
  "moqueur",
  "morceau",
  "morsure",
  "mortier",
  "moteur",
  "motif",
  "mouche",
  "moufle",
  "moulin",
  "mousson",
  "mouton",
  "mouvant",
  "multiple",
  "munition",
  "muraille",
  "mure╠Çne",
  "murmure",
  "muscle",
  "muse╠üum",
  "musicien",
  "mutation",
  "muter",
  "mutuel",
  "myriade",
  "myrtille",
  "myste╠Çre",
  "mythique",
  "nageur",
  "nappe",
  "narquois",
  "narrer",
  "natation",
  "nation",
  "nature",
  "naufrage",
  "nautique",
  "navire",
  "ne╠übuleux",
  "nectar",
  "ne╠üfaste",
  "ne╠ügation",
  "ne╠ügliger",
  "ne╠ügocier",
  "neige",
  "nerveux",
  "nettoyer",
  "neurone",
  "neutron",
  "neveu",
  "niche",
  "nickel",
  "nitrate",
  "niveau",
  "noble",
  "nocif",
  "nocturne",
  "noirceur",
  "noisette",
  "nomade",
  "nombreux",
  "nommer",
  "normatif",
  "notable",
  "notifier",
  "notoire",
  "nourrir",
  "nouveau",
  "novateur",
  "novembre",
  "novice",
  "nuage",
  "nuancer",
  "nuire",
  "nuisible",
  "nume╠üro",
  "nuptial",
  "nuque",
  "nutritif",
  "obe╠üir",
  "objectif",
  "obliger",
  "obscur",
  "observer",
  "obstacle",
  "obtenir",
  "obturer",
  "occasion",
  "occuper",
  "oce╠üan",
  "octobre",
  "octroyer",
  "octupler",
  "oculaire",
  "odeur",
  "odorant",
  "offenser",
  "officier",
  "offrir",
  "ogive",
  "oiseau",
  "oisillon",
  "olfactif",
  "olivier",
  "ombrage",
  "omettre",
  "onctueux",
  "onduler",
  "one╠üreux",
  "onirique",
  "opale",
  "opaque",
  "ope╠ürer",
  "opinion",
  "opportun",
  "opprimer",
  "opter",
  "optique",
  "orageux",
  "orange",
  "orbite",
  "ordonner",
  "oreille",
  "organe",
  "orgueil",
  "orifice",
  "ornement",
  "orque",
  "ortie",
  "osciller",
  "osmose",
  "ossature",
  "otarie",
  "ouragan",
  "ourson",
  "outil",
  "outrager",
  "ouvrage",
  "ovation",
  "oxyde",
  "oxyge╠Çne",
  "ozone",
  "paisible",
  "palace",
  "palmare╠Çs",
  "palourde",
  "palper",
  "panache",
  "panda",
  "pangolin",
  "paniquer",
  "panneau",
  "panorama",
  "pantalon",
  "papaye",
  "papier",
  "papoter",
  "papyrus",
  "paradoxe",
  "parcelle",
  "paresse",
  "parfumer",
  "parler",
  "parole",
  "parrain",
  "parsemer",
  "partager",
  "parure",
  "parvenir",
  "passion",
  "paste╠Çque",
  "paternel",
  "patience",
  "patron",
  "pavillon",
  "pavoiser",
  "payer",
  "paysage",
  "peigne",
  "peintre",
  "pelage",
  "pe╠ülican",
  "pelle",
  "pelouse",
  "peluche",
  "pendule",
  "pe╠üne╠ütrer",
  "pe╠ünible",
  "pensif",
  "pe╠ünurie",
  "pe╠üpite",
  "pe╠üplum",
  "perdrix",
  "perforer",
  "pe╠üriode",
  "permuter",
  "perplexe",
  "persil",
  "perte",
  "peser",
  "pe╠ütale",
  "petit",
  "pe╠ütrir",
  "peuple",
  "pharaon",
  "phobie",
  "phoque",
  "photon",
  "phrase",
  "physique",
  "piano",
  "pictural",
  "pie╠Çce",
  "pierre",
  "pieuvre",
  "pilote",
  "pinceau",
  "pipette",
  "piquer",
  "pirogue",
  "piscine",
  "piston",
  "pivoter",
  "pixel",
  "pizza",
  "placard",
  "plafond",
  "plaisir",
  "planer",
  "plaque",
  "plastron",
  "plateau",
  "pleurer",
  "plexus",
  "pliage",
  "plomb",
  "plonger",
  "pluie",
  "plumage",
  "pochette",
  "poe╠üsie",
  "poe╠Çte",
  "pointe",
  "poirier",
  "poisson",
  "poivre",
  "polaire",
  "policier",
  "pollen",
  "polygone",
  "pommade",
  "pompier",
  "ponctuel",
  "ponde╠ürer",
  "poney",
  "portique",
  "position",
  "posse╠üder",
  "posture",
  "potager",
  "poteau",
  "potion",
  "pouce",
  "poulain",
  "poumon",
  "pourpre",
  "poussin",
  "pouvoir",
  "prairie",
  "pratique",
  "pre╠ücieux",
  "pre╠üdire",
  "pre╠üfixe",
  "pre╠ülude",
  "pre╠ünom",
  "pre╠üsence",
  "pre╠ütexte",
  "pre╠üvoir",
  "primitif",
  "prince",
  "prison",
  "priver",
  "proble╠Çme",
  "proce╠üder",
  "prodige",
  "profond",
  "progre╠Çs",
  "proie",
  "projeter",
  "prologue",
  "promener",
  "propre",
  "prospe╠Çre",
  "prote╠üger",
  "prouesse",
  "proverbe",
  "prudence",
  "pruneau",
  "psychose",
  "public",
  "puceron",
  "puiser",
  "pulpe",
  "pulsar",
  "punaise",
  "punitif",
  "pupitre",
  "purifier",
  "puzzle",
  "pyramide",
  "quasar",
  "querelle",
  "question",
  "quie╠ütude",
  "quitter",
  "quotient",
  "racine",
  "raconter",
  "radieux",
  "ragondin",
  "raideur",
  "raisin",
  "ralentir",
  "rallonge",
  "ramasser",
  "rapide",
  "rasage",
  "ratisser",
  "ravager",
  "ravin",
  "rayonner",
  "re╠üactif",
  "re╠üagir",
  "re╠üaliser",
  "re╠üanimer",
  "recevoir",
  "re╠üciter",
  "re╠üclamer",
  "re╠ücolter",
  "recruter",
  "reculer",
  "recycler",
  "re╠üdiger",
  "redouter",
  "refaire",
  "re╠üflexe",
  "re╠üformer",
  "refrain",
  "refuge",
  "re╠ügalien",
  "re╠ügion",
  "re╠üglage",
  "re╠ügulier",
  "re╠üite╠ürer",
  "rejeter",
  "rejouer",
  "relatif",
  "relever",
  "relief",
  "remarque",
  "reme╠Çde",
  "remise",
  "remonter",
  "remplir",
  "remuer",
  "renard",
  "renfort",
  "renifler",
  "renoncer",
  "rentrer",
  "renvoi",
  "replier",
  "reporter",
  "reprise",
  "reptile",
  "requin",
  "re╠üserve",
  "re╠üsineux",
  "re╠üsoudre",
  "respect",
  "rester",
  "re╠üsultat",
  "re╠ütablir",
  "retenir",
  "re╠üticule",
  "retomber",
  "retracer",
  "re╠üunion",
  "re╠üussir",
  "revanche",
  "revivre",
  "re╠üvolte",
  "re╠üvulsif",
  "richesse",
  "rideau",
  "rieur",
  "rigide",
  "rigoler",
  "rincer",
  "riposter",
  "risible",
  "risque",
  "rituel",
  "rival",
  "rivie╠Çre",
  "rocheux",
  "romance",
  "rompre",
  "ronce",
  "rondin",
  "roseau",
  "rosier",
  "rotatif",
  "rotor",
  "rotule",
  "rouge",
  "rouille",
  "rouleau",
  "routine",
  "royaume",
  "ruban",
  "rubis",
  "ruche",
  "ruelle",
  "rugueux",
  "ruiner",
  "ruisseau",
  "ruser",
  "rustique",
  "rythme",
  "sabler",
  "saboter",
  "sabre",
  "sacoche",
  "safari",
  "sagesse",
  "saisir",
  "salade",
  "salive",
  "salon",
  "saluer",
  "samedi",
  "sanction",
  "sanglier",
  "sarcasme",
  "sardine",
  "saturer",
  "saugrenu",
  "saumon",
  "sauter",
  "sauvage",
  "savant",
  "savonner",
  "scalpel",
  "scandale",
  "sce╠üle╠ürat",
  "sce╠ünario",
  "sceptre",
  "sche╠üma",
  "science",
  "scinder",
  "score",
  "scrutin",
  "sculpter",
  "se╠üance",
  "se╠ücable",
  "se╠ücher",
  "secouer",
  "se╠ücre╠üter",
  "se╠üdatif",
  "se╠üduire",
  "seigneur",
  "se╠üjour",
  "se╠ülectif",
  "semaine",
  "sembler",
  "semence",
  "se╠üminal",
  "se╠ünateur",
  "sensible",
  "sentence",
  "se╠üparer",
  "se╠üquence",
  "serein",
  "sergent",
  "se╠ürieux",
  "serrure",
  "se╠ürum",
  "service",
  "se╠üsame",
  "se╠üvir",
  "sevrage",
  "sextuple",
  "side╠üral",
  "sie╠Çcle",
  "sie╠üger",
  "siffler",
  "sigle",
  "signal",
  "silence",
  "silicium",
  "simple",
  "since╠Çre",
  "sinistre",
  "siphon",
  "sirop",
  "sismique",
  "situer",
  "skier",
  "social",
  "socle",
  "sodium",
  "soigneux",
  "soldat",
  "soleil",
  "solitude",
  "soluble",
  "sombre",
  "sommeil",
  "somnoler",
  "sonde",
  "songeur",
  "sonnette",
  "sonore",
  "sorcier",
  "sortir",
  "sosie",
  "sottise",
  "soucieux",
  "soudure",
  "souffle",
  "soulever",
  "soupape",
  "source",
  "soutirer",
  "souvenir",
  "spacieux",
  "spatial",
  "spe╠ücial",
  "sphe╠Çre",
  "spiral",
  "stable",
  "station",
  "sternum",
  "stimulus",
  "stipuler",
  "strict",
  "studieux",
  "stupeur",
  "styliste",
  "sublime",
  "substrat",
  "subtil",
  "subvenir",
  "succe╠Çs",
  "sucre",
  "suffixe",
  "sugge╠ürer",
  "suiveur",
  "sulfate",
  "superbe",
  "supplier",
  "surface",
  "suricate",
  "surmener",
  "surprise",
  "sursaut",
  "survie",
  "suspect",
  "syllabe",
  "symbole",
  "syme╠ütrie",
  "synapse",
  "syntaxe",
  "syste╠Çme",
  "tabac",
  "tablier",
  "tactile",
  "tailler",
  "talent",
  "talisman",
  "talonner",
  "tambour",
  "tamiser",
  "tangible",
  "tapis",
  "taquiner",
  "tarder",
  "tarif",
  "tartine",
  "tasse",
  "tatami",
  "tatouage",
  "taupe",
  "taureau",
  "taxer",
  "te╠ümoin",
  "temporel",
  "tenaille",
  "tendre",
  "teneur",
  "tenir",
  "tension",
  "terminer",
  "terne",
  "terrible",
  "te╠ütine",
  "texte",
  "the╠Çme",
  "the╠üorie",
  "the╠ürapie",
  "thorax",
  "tibia",
  "tie╠Çde",
  "timide",
  "tirelire",
  "tiroir",
  "tissu",
  "titane",
  "titre",
  "tituber",
  "toboggan",
  "tole╠ürant",
  "tomate",
  "tonique",
  "tonneau",
  "toponyme",
  "torche",
  "tordre",
  "tornade",
  "torpille",
  "torrent",
  "torse",
  "tortue",
  "totem",
  "toucher",
  "tournage",
  "tousser",
  "toxine",
  "traction",
  "trafic",
  "tragique",
  "trahir",
  "train",
  "trancher",
  "travail",
  "tre╠Çfle",
  "tremper",
  "tre╠üsor",
  "treuil",
  "triage",
  "tribunal",
  "tricoter",
  "trilogie",
  "triomphe",
  "tripler",
  "triturer",
  "trivial",
  "trombone",
  "tronc",
  "tropical",
  "troupeau",
  "tuile",
  "tulipe",
  "tumulte",
  "tunnel",
  "turbine",
  "tuteur",
  "tutoyer",
  "tuyau",
  "tympan",
  "typhon",
  "typique",
  "tyran",
  "ubuesque",
  "ultime",
  "ultrason",
  "unanime",
  "unifier",
  "union",
  "unique",
  "unitaire",
  "univers",
  "uranium",
  "urbain",
  "urticant",
  "usage",
  "usine",
  "usuel",
  "usure",
  "utile",
  "utopie",
  "vacarme",
  "vaccin",
  "vagabond",
  "vague",
  "vaillant",
  "vaincre",
  "vaisseau",
  "valable",
  "valise",
  "vallon",
  "valve",
  "vampire",
  "vanille",
  "vapeur",
  "varier",
  "vaseux",
  "vassal",
  "vaste",
  "vecteur",
  "vedette",
  "ve╠üge╠ütal",
  "ve╠ühicule",
  "veinard",
  "ve╠üloce",
  "vendredi",
  "ve╠üne╠ürer",
  "venger",
  "venimeux",
  "ventouse",
  "verdure",
  "ve╠ürin",
  "vernir",
  "verrou",
  "verser",
  "vertu",
  "veston",
  "ve╠üte╠üran",
  "ve╠ütuste",
  "vexant",
  "vexer",
  "viaduc",
  "viande",
  "victoire",
  "vidange",
  "vide╠üo",
  "vignette",
  "vigueur",
  "vilain",
  "village",
  "vinaigre",
  "violon",
  "vipe╠Çre",
  "virement",
  "virtuose",
  "virus",
  "visage",
  "viseur",
  "vision",
  "visqueux",
  "visuel",
  "vital",
  "vitesse",
  "viticole",
  "vitrine",
  "vivace",
  "vivipare",
  "vocation",
  "voguer",
  "voile",
  "voisin",
  "voiture",
  "volaille",
  "volcan",
  "voltiger",
  "volume",
  "vorace",
  "vortex",
  "voter",
  "vouloir",
  "voyage",
  "voyelle",
  "wagon",
  "xe╠ünon",
  "yacht",
  "ze╠Çbre",
  "ze╠ünith",
  "zeste",
  "zoologie"
]

},{}],33:[function(require,module,exports){
module.exports=[
  "abaco",
  "abbaglio",
  "abbinato",
  "abete",
  "abisso",
  "abolire",
  "abrasivo",
  "abrogato",
  "accadere",
  "accenno",
  "accusato",
  "acetone",
  "achille",
  "acido",
  "acqua",
  "acre",
  "acrilico",
  "acrobata",
  "acuto",
  "adagio",
  "addebito",
  "addome",
  "adeguato",
  "aderire",
  "adipe",
  "adottare",
  "adulare",
  "affabile",
  "affetto",
  "affisso",
  "affranto",
  "aforisma",
  "afoso",
  "africano",
  "agave",
  "agente",
  "agevole",
  "aggancio",
  "agire",
  "agitare",
  "agonismo",
  "agricolo",
  "agrumeto",
  "aguzzo",
  "alabarda",
  "alato",
  "albatro",
  "alberato",
  "albo",
  "albume",
  "alce",
  "alcolico",
  "alettone",
  "alfa",
  "algebra",
  "aliante",
  "alibi",
  "alimento",
  "allagato",
  "allegro",
  "allievo",
  "allodola",
  "allusivo",
  "almeno",
  "alogeno",
  "alpaca",
  "alpestre",
  "altalena",
  "alterno",
  "alticcio",
  "altrove",
  "alunno",
  "alveolo",
  "alzare",
  "amalgama",
  "amanita",
  "amarena",
  "ambito",
  "ambrato",
  "ameba",
  "america",
  "ametista",
  "amico",
  "ammasso",
  "ammenda",
  "ammirare",
  "ammonito",
  "amore",
  "ampio",
  "ampliare",
  "amuleto",
  "anacardo",
  "anagrafe",
  "analista",
  "anarchia",
  "anatra",
  "anca",
  "ancella",
  "ancora",
  "andare",
  "andrea",
  "anello",
  "angelo",
  "angolare",
  "angusto",
  "anima",
  "annegare",
  "annidato",
  "anno",
  "annuncio",
  "anonimo",
  "anticipo",
  "anzi",
  "apatico",
  "apertura",
  "apode",
  "apparire",
  "appetito",
  "appoggio",
  "approdo",
  "appunto",
  "aprile",
  "arabica",
  "arachide",
  "aragosta",
  "araldica",
  "arancio",
  "aratura",
  "arazzo",
  "arbitro",
  "archivio",
  "ardito",
  "arenile",
  "argento",
  "argine",
  "arguto",
  "aria",
  "armonia",
  "arnese",
  "arredato",
  "arringa",
  "arrosto",
  "arsenico",
  "arso",
  "artefice",
  "arzillo",
  "asciutto",
  "ascolto",
  "asepsi",
  "asettico",
  "asfalto",
  "asino",
  "asola",
  "aspirato",
  "aspro",
  "assaggio",
  "asse",
  "assoluto",
  "assurdo",
  "asta",
  "astenuto",
  "astice",
  "astratto",
  "atavico",
  "ateismo",
  "atomico",
  "atono",
  "attesa",
  "attivare",
  "attorno",
  "attrito",
  "attuale",
  "ausilio",
  "austria",
  "autista",
  "autonomo",
  "autunno",
  "avanzato",
  "avere",
  "avvenire",
  "avviso",
  "avvolgere",
  "azione",
  "azoto",
  "azzimo",
  "azzurro",
  "babele",
  "baccano",
  "bacino",
  "baco",
  "badessa",
  "badilata",
  "bagnato",
  "baita",
  "balcone",
  "baldo",
  "balena",
  "ballata",
  "balzano",
  "bambino",
  "bandire",
  "baraonda",
  "barbaro",
  "barca",
  "baritono",
  "barlume",
  "barocco",
  "basilico",
  "basso",
  "batosta",
  "battuto",
  "baule",
  "bava",
  "bavosa",
  "becco",
  "beffa",
  "belgio",
  "belva",
  "benda",
  "benevole",
  "benigno",
  "benzina",
  "bere",
  "berlina",
  "beta",
  "bibita",
  "bici",
  "bidone",
  "bifido",
  "biga",
  "bilancia",
  "bimbo",
  "binocolo",
  "biologo",
  "bipede",
  "bipolare",
  "birbante",
  "birra",
  "biscotto",
  "bisesto",
  "bisnonno",
  "bisonte",
  "bisturi",
  "bizzarro",
  "blando",
  "blatta",
  "bollito",
  "bonifico",
  "bordo",
  "bosco",
  "botanico",
  "bottino",
  "bozzolo",
  "braccio",
  "bradipo",
  "brama",
  "branca",
  "bravura",
  "bretella",
  "brevetto",
  "brezza",
  "briglia",
  "brillante",
  "brindare",
  "broccolo",
  "brodo",
  "bronzina",
  "brullo",
  "bruno",
  "bubbone",
  "buca",
  "budino",
  "buffone",
  "buio",
  "bulbo",
  "buono",
  "burlone",
  "burrasca",
  "bussola",
  "busta",
  "cadetto",
  "caduco",
  "calamaro",
  "calcolo",
  "calesse",
  "calibro",
  "calmo",
  "caloria",
  "cambusa",
  "camerata",
  "camicia",
  "cammino",
  "camola",
  "campale",
  "canapa",
  "candela",
  "cane",
  "canino",
  "canotto",
  "cantina",
  "capace",
  "capello",
  "capitolo",
  "capogiro",
  "cappero",
  "capra",
  "capsula",
  "carapace",
  "carcassa",
  "cardo",
  "carisma",
  "carovana",
  "carretto",
  "cartolina",
  "casaccio",
  "cascata",
  "caserma",
  "caso",
  "cassone",
  "castello",
  "casuale",
  "catasta",
  "catena",
  "catrame",
  "cauto",
  "cavillo",
  "cedibile",
  "cedrata",
  "cefalo",
  "celebre",
  "cellulare",
  "cena",
  "cenone",
  "centesimo",
  "ceramica",
  "cercare",
  "certo",
  "cerume",
  "cervello",
  "cesoia",
  "cespo",
  "ceto",
  "chela",
  "chiaro",
  "chicca",
  "chiedere",
  "chimera",
  "china",
  "chirurgo",
  "chitarra",
  "ciao",
  "ciclismo",
  "cifrare",
  "cigno",
  "cilindro",
  "ciottolo",
  "circa",
  "cirrosi",
  "citrico",
  "cittadino",
  "ciuffo",
  "civetta",
  "civile",
  "classico",
  "clinica",
  "cloro",
  "cocco",
  "codardo",
  "codice",
  "coerente",
  "cognome",
  "collare",
  "colmato",
  "colore",
  "colposo",
  "coltivato",
  "colza",
  "coma",
  "cometa",
  "commando",
  "comodo",
  "computer",
  "comune",
  "conciso",
  "condurre",
  "conferma",
  "congelare",
  "coniuge",
  "connesso",
  "conoscere",
  "consumo",
  "continuo",
  "convegno",
  "coperto",
  "copione",
  "coppia",
  "copricapo",
  "corazza",
  "cordata",
  "coricato",
  "cornice",
  "corolla",
  "corpo",
  "corredo",
  "corsia",
  "cortese",
  "cosmico",
  "costante",
  "cottura",
  "covato",
  "cratere",
  "cravatta",
  "creato",
  "credere",
  "cremoso",
  "crescita",
  "creta",
  "criceto",
  "crinale",
  "crisi",
  "critico",
  "croce",
  "cronaca",
  "crostata",
  "cruciale",
  "crusca",
  "cucire",
  "cuculo",
  "cugino",
  "cullato",
  "cupola",
  "curatore",
  "cursore",
  "curvo",
  "cuscino",
  "custode",
  "dado",
  "daino",
  "dalmata",
  "damerino",
  "daniela",
  "dannoso",
  "danzare",
  "datato",
  "davanti",
  "davvero",
  "debutto",
  "decennio",
  "deciso",
  "declino",
  "decollo",
  "decreto",
  "dedicato",
  "definito",
  "deforme",
  "degno",
  "delegare",
  "delfino",
  "delirio",
  "delta",
  "demenza",
  "denotato",
  "dentro",
  "deposito",
  "derapata",
  "derivare",
  "deroga",
  "descritto",
  "deserto",
  "desiderio",
  "desumere",
  "detersivo",
  "devoto",
  "diametro",
  "dicembre",
  "diedro",
  "difeso",
  "diffuso",
  "digerire",
  "digitale",
  "diluvio",
  "dinamico",
  "dinnanzi",
  "dipinto",
  "diploma",
  "dipolo",
  "diradare",
  "dire",
  "dirotto",
  "dirupo",
  "disagio",
  "discreto",
  "disfare",
  "disgelo",
  "disposto",
  "distanza",
  "disumano",
  "dito",
  "divano",
  "divelto",
  "dividere",
  "divorato",
  "doblone",
  "docente",
  "doganale",
  "dogma",
  "dolce",
  "domato",
  "domenica",
  "dominare",
  "dondolo",
  "dono",
  "dormire",
  "dote",
  "dottore",
  "dovuto",
  "dozzina",
  "drago",
  "druido",
  "dubbio",
  "dubitare",
  "ducale",
  "duna",
  "duomo",
  "duplice",
  "duraturo",
  "ebano",
  "eccesso",
  "ecco",
  "eclissi",
  "economia",
  "edera",
  "edicola",
  "edile",
  "editoria",
  "educare",
  "egemonia",
  "egli",
  "egoismo",
  "egregio",
  "elaborato",
  "elargire",
  "elegante",
  "elencato",
  "eletto",
  "elevare",
  "elfico",
  "elica",
  "elmo",
  "elsa",
  "eluso",
  "emanato",
  "emblema",
  "emesso",
  "emiro",
  "emotivo",
  "emozione",
  "empirico",
  "emulo",
  "endemico",
  "enduro",
  "energia",
  "enfasi",
  "enoteca",
  "entrare",
  "enzima",
  "epatite",
  "epilogo",
  "episodio",
  "epocale",
  "eppure",
  "equatore",
  "erario",
  "erba",
  "erboso",
  "erede",
  "eremita",
  "erigere",
  "ermetico",
  "eroe",
  "erosivo",
  "errante",
  "esagono",
  "esame",
  "esanime",
  "esaudire",
  "esca",
  "esempio",
  "esercito",
  "esibito",
  "esigente",
  "esistere",
  "esito",
  "esofago",
  "esortato",
  "esoso",
  "espanso",
  "espresso",
  "essenza",
  "esso",
  "esteso",
  "estimare",
  "estonia",
  "estroso",
  "esultare",
  "etilico",
  "etnico",
  "etrusco",
  "etto",
  "euclideo",
  "europa",
  "evaso",
  "evidenza",
  "evitato",
  "evoluto",
  "evviva",
  "fabbrica",
  "faccenda",
  "fachiro",
  "falco",
  "famiglia",
  "fanale",
  "fanfara",
  "fango",
  "fantasma",
  "fare",
  "farfalla",
  "farinoso",
  "farmaco",
  "fascia",
  "fastoso",
  "fasullo",
  "faticare",
  "fato",
  "favoloso",
  "febbre",
  "fecola",
  "fede",
  "fegato",
  "felpa",
  "feltro",
  "femmina",
  "fendere",
  "fenomeno",
  "fermento",
  "ferro",
  "fertile",
  "fessura",
  "festivo",
  "fetta",
  "feudo",
  "fiaba",
  "fiducia",
  "fifa",
  "figurato",
  "filo",
  "finanza",
  "finestra",
  "finire",
  "fiore",
  "fiscale",
  "fisico",
  "fiume",
  "flacone",
  "flamenco",
  "flebo",
  "flemma",
  "florido",
  "fluente",
  "fluoro",
  "fobico",
  "focaccia",
  "focoso",
  "foderato",
  "foglio",
  "folata",
  "folclore",
  "folgore",
  "fondente",
  "fonetico",
  "fonia",
  "fontana",
  "forbito",
  "forchetta",
  "foresta",
  "formica",
  "fornaio",
  "foro",
  "fortezza",
  "forzare",
  "fosfato",
  "fosso",
  "fracasso",
  "frana",
  "frassino",
  "fratello",
  "freccetta",
  "frenata",
  "fresco",
  "frigo",
  "frollino",
  "fronde",
  "frugale",
  "frutta",
  "fucilata",
  "fucsia",
  "fuggente",
  "fulmine",
  "fulvo",
  "fumante",
  "fumetto",
  "fumoso",
  "fune",
  "funzione",
  "fuoco",
  "furbo",
  "furgone",
  "furore",
  "fuso",
  "futile",
  "gabbiano",
  "gaffe",
  "galateo",
  "gallina",
  "galoppo",
  "gambero",
  "gamma",
  "garanzia",
  "garbo",
  "garofano",
  "garzone",
  "gasdotto",
  "gasolio",
  "gastrico",
  "gatto",
  "gaudio",
  "gazebo",
  "gazzella",
  "geco",
  "gelatina",
  "gelso",
  "gemello",
  "gemmato",
  "gene",
  "genitore",
  "gennaio",
  "genotipo",
  "gergo",
  "ghepardo",
  "ghiaccio",
  "ghisa",
  "giallo",
  "gilda",
  "ginepro",
  "giocare",
  "gioiello",
  "giorno",
  "giove",
  "girato",
  "girone",
  "gittata",
  "giudizio",
  "giurato",
  "giusto",
  "globulo",
  "glutine",
  "gnomo",
  "gobba",
  "golf",
  "gomito",
  "gommone",
  "gonfio",
  "gonna",
  "governo",
  "gracile",
  "grado",
  "grafico",
  "grammo",
  "grande",
  "grattare",
  "gravoso",
  "grazia",
  "greca",
  "gregge",
  "grifone",
  "grigio",
  "grinza",
  "grotta",
  "gruppo",
  "guadagno",
  "guaio",
  "guanto",
  "guardare",
  "gufo",
  "guidare",
  "ibernato",
  "icona",
  "identico",
  "idillio",
  "idolo",
  "idra",
  "idrico",
  "idrogeno",
  "igiene",
  "ignaro",
  "ignorato",
  "ilare",
  "illeso",
  "illogico",
  "illudere",
  "imballo",
  "imbevuto",
  "imbocco",
  "imbuto",
  "immane",
  "immerso",
  "immolato",
  "impacco",
  "impeto",
  "impiego",
  "importo",
  "impronta",
  "inalare",
  "inarcare",
  "inattivo",
  "incanto",
  "incendio",
  "inchino",
  "incisivo",
  "incluso",
  "incontro",
  "incrocio",
  "incubo",
  "indagine",
  "india",
  "indole",
  "inedito",
  "infatti",
  "infilare",
  "inflitto",
  "ingaggio",
  "ingegno",
  "inglese",
  "ingordo",
  "ingrosso",
  "innesco",
  "inodore",
  "inoltrare",
  "inondato",
  "insano",
  "insetto",
  "insieme",
  "insonnia",
  "insulina",
  "intasato",
  "intero",
  "intonaco",
  "intuito",
  "inumidire",
  "invalido",
  "invece",
  "invito",
  "iperbole",
  "ipnotico",
  "ipotesi",
  "ippica",
  "iride",
  "irlanda",
  "ironico",
  "irrigato",
  "irrorare",
  "isolato",
  "isotopo",
  "isterico",
  "istituto",
  "istrice",
  "italia",
  "iterare",
  "labbro",
  "labirinto",
  "lacca",
  "lacerato",
  "lacrima",
  "lacuna",
  "laddove",
  "lago",
  "lampo",
  "lancetta",
  "lanterna",
  "lardoso",
  "larga",
  "laringe",
  "lastra",
  "latenza",
  "latino",
  "lattuga",
  "lavagna",
  "lavoro",
  "legale",
  "leggero",
  "lembo",
  "lentezza",
  "lenza",
  "leone",
  "lepre",
  "lesivo",
  "lessato",
  "lesto",
  "letterale",
  "leva",
  "levigato",
  "libero",
  "lido",
  "lievito",
  "lilla",
  "limatura",
  "limitare",
  "limpido",
  "lineare",
  "lingua",
  "liquido",
  "lira",
  "lirica",
  "lisca",
  "lite",
  "litigio",
  "livrea",
  "locanda",
  "lode",
  "logica",
  "lombare",
  "londra",
  "longevo",
  "loquace",
  "lorenzo",
  "loto",
  "lotteria",
  "luce",
  "lucidato",
  "lumaca",
  "luminoso",
  "lungo",
  "lupo",
  "luppolo",
  "lusinga",
  "lusso",
  "lutto",
  "macabro",
  "macchina",
  "macero",
  "macinato",
  "madama",
  "magico",
  "maglia",
  "magnete",
  "magro",
  "maiolica",
  "malafede",
  "malgrado",
  "malinteso",
  "malsano",
  "malto",
  "malumore",
  "mana",
  "mancia",
  "mandorla",
  "mangiare",
  "manifesto",
  "mannaro",
  "manovra",
  "mansarda",
  "mantide",
  "manubrio",
  "mappa",
  "maratona",
  "marcire",
  "maretta",
  "marmo",
  "marsupio",
  "maschera",
  "massaia",
  "mastino",
  "materasso",
  "matricola",
  "mattone",
  "maturo",
  "mazurca",
  "meandro",
  "meccanico",
  "mecenate",
  "medesimo",
  "meditare",
  "mega",
  "melassa",
  "melis",
  "melodia",
  "meninge",
  "meno",
  "mensola",
  "mercurio",
  "merenda",
  "merlo",
  "meschino",
  "mese",
  "messere",
  "mestolo",
  "metallo",
  "metodo",
  "mettere",
  "miagolare",
  "mica",
  "micelio",
  "michele",
  "microbo",
  "midollo",
  "miele",
  "migliore",
  "milano",
  "milite",
  "mimosa",
  "minerale",
  "mini",
  "minore",
  "mirino",
  "mirtillo",
  "miscela",
  "missiva",
  "misto",
  "misurare",
  "mitezza",
  "mitigare",
  "mitra",
  "mittente",
  "mnemonico",
  "modello",
  "modifica",
  "modulo",
  "mogano",
  "mogio",
  "mole",
  "molosso",
  "monastero",
  "monco",
  "mondina",
  "monetario",
  "monile",
  "monotono",
  "monsone",
  "montato",
  "monviso",
  "mora",
  "mordere",
  "morsicato",
  "mostro",
  "motivato",
  "motosega",
  "motto",
  "movenza",
  "movimento",
  "mozzo",
  "mucca",
  "mucosa",
  "muffa",
  "mughetto",
  "mugnaio",
  "mulatto",
  "mulinello",
  "multiplo",
  "mummia",
  "munto",
  "muovere",
  "murale",
  "musa",
  "muscolo",
  "musica",
  "mutevole",
  "muto",
  "nababbo",
  "nafta",
  "nanometro",
  "narciso",
  "narice",
  "narrato",
  "nascere",
  "nastrare",
  "naturale",
  "nautica",
  "naviglio",
  "nebulosa",
  "necrosi",
  "negativo",
  "negozio",
  "nemmeno",
  "neofita",
  "neretto",
  "nervo",
  "nessuno",
  "nettuno",
  "neutrale",
  "neve",
  "nevrotico",
  "nicchia",
  "ninfa",
  "nitido",
  "nobile",
  "nocivo",
  "nodo",
  "nome",
  "nomina",
  "nordico",
  "normale",
  "norvegese",
  "nostrano",
  "notare",
  "notizia",
  "notturno",
  "novella",
  "nucleo",
  "nulla",
  "numero",
  "nuovo",
  "nutrire",
  "nuvola",
  "nuziale",
  "oasi",
  "obbedire",
  "obbligo",
  "obelisco",
  "oblio",
  "obolo",
  "obsoleto",
  "occasione",
  "occhio",
  "occidente",
  "occorrere",
  "occultare",
  "ocra",
  "oculato",
  "odierno",
  "odorare",
  "offerta",
  "offrire",
  "offuscato",
  "oggetto",
  "oggi",
  "ognuno",
  "olandese",
  "olfatto",
  "oliato",
  "oliva",
  "ologramma",
  "oltre",
  "omaggio",
  "ombelico",
  "ombra",
  "omega",
  "omissione",
  "ondoso",
  "onere",
  "onice",
  "onnivoro",
  "onorevole",
  "onta",
  "operato",
  "opinione",
  "opposto",
  "oracolo",
  "orafo",
  "ordine",
  "orecchino",
  "orefice",
  "orfano",
  "organico",
  "origine",
  "orizzonte",
  "orma",
  "ormeggio",
  "ornativo",
  "orologio",
  "orrendo",
  "orribile",
  "ortensia",
  "ortica",
  "orzata",
  "orzo",
  "osare",
  "oscurare",
  "osmosi",
  "ospedale",
  "ospite",
  "ossa",
  "ossidare",
  "ostacolo",
  "oste",
  "otite",
  "otre",
  "ottagono",
  "ottimo",
  "ottobre",
  "ovale",
  "ovest",
  "ovino",
  "oviparo",
  "ovocito",
  "ovunque",
  "ovviare",
  "ozio",
  "pacchetto",
  "pace",
  "pacifico",
  "padella",
  "padrone",
  "paese",
  "paga",
  "pagina",
  "palazzina",
  "palesare",
  "pallido",
  "palo",
  "palude",
  "pandoro",
  "pannello",
  "paolo",
  "paonazzo",
  "paprica",
  "parabola",
  "parcella",
  "parere",
  "pargolo",
  "pari",
  "parlato",
  "parola",
  "partire",
  "parvenza",
  "parziale",
  "passivo",
  "pasticca",
  "patacca",
  "patologia",
  "pattume",
  "pavone",
  "peccato",
  "pedalare",
  "pedonale",
  "peggio",
  "peloso",
  "penare",
  "pendice",
  "penisola",
  "pennuto",
  "penombra",
  "pensare",
  "pentola",
  "pepe",
  "pepita",
  "perbene",
  "percorso",
  "perdonato",
  "perforare",
  "pergamena",
  "periodo",
  "permesso",
  "perno",
  "perplesso",
  "persuaso",
  "pertugio",
  "pervaso",
  "pesatore",
  "pesista",
  "peso",
  "pestifero",
  "petalo",
  "pettine",
  "petulante",
  "pezzo",
  "piacere",
  "pianta",
  "piattino",
  "piccino",
  "picozza",
  "piega",
  "pietra",
  "piffero",
  "pigiama",
  "pigolio",
  "pigro",
  "pila",
  "pilifero",
  "pillola",
  "pilota",
  "pimpante",
  "pineta",
  "pinna",
  "pinolo",
  "pioggia",
  "piombo",
  "piramide",
  "piretico",
  "pirite",
  "pirolisi",
  "pitone",
  "pizzico",
  "placebo",
  "planare",
  "plasma",
  "platano",
  "plenario",
  "pochezza",
  "poderoso",
  "podismo",
  "poesia",
  "poggiare",
  "polenta",
  "poligono",
  "pollice",
  "polmonite",
  "polpetta",
  "polso",
  "poltrona",
  "polvere",
  "pomice",
  "pomodoro",
  "ponte",
  "popoloso",
  "porfido",
  "poroso",
  "porpora",
  "porre",
  "portata",
  "posa",
  "positivo",
  "possesso",
  "postulato",
  "potassio",
  "potere",
  "pranzo",
  "prassi",
  "pratica",
  "precluso",
  "predica",
  "prefisso",
  "pregiato",
  "prelievo",
  "premere",
  "prenotare",
  "preparato",
  "presenza",
  "pretesto",
  "prevalso",
  "prima",
  "principe",
  "privato",
  "problema",
  "procura",
  "produrre",
  "profumo",
  "progetto",
  "prolunga",
  "promessa",
  "pronome",
  "proposta",
  "proroga",
  "proteso",
  "prova",
  "prudente",
  "prugna",
  "prurito",
  "psiche",
  "pubblico",
  "pudica",
  "pugilato",
  "pugno",
  "pulce",
  "pulito",
  "pulsante",
  "puntare",
  "pupazzo",
  "pupilla",
  "puro",
  "quadro",
  "qualcosa",
  "quasi",
  "querela",
  "quota",
  "raccolto",
  "raddoppio",
  "radicale",
  "radunato",
  "raffica",
  "ragazzo",
  "ragione",
  "ragno",
  "ramarro",
  "ramingo",
  "ramo",
  "randagio",
  "rantolare",
  "rapato",
  "rapina",
  "rappreso",
  "rasatura",
  "raschiato",
  "rasente",
  "rassegna",
  "rastrello",
  "rata",
  "ravveduto",
  "reale",
  "recepire",
  "recinto",
  "recluta",
  "recondito",
  "recupero",
  "reddito",
  "redimere",
  "regalato",
  "registro",
  "regola",
  "regresso",
  "relazione",
  "remare",
  "remoto",
  "renna",
  "replica",
  "reprimere",
  "reputare",
  "resa",
  "residente",
  "responso",
  "restauro",
  "rete",
  "retina",
  "retorica",
  "rettifica",
  "revocato",
  "riassunto",
  "ribadire",
  "ribelle",
  "ribrezzo",
  "ricarica",
  "ricco",
  "ricevere",
  "riciclato",
  "ricordo",
  "ricreduto",
  "ridicolo",
  "ridurre",
  "rifasare",
  "riflesso",
  "riforma",
  "rifugio",
  "rigare",
  "rigettato",
  "righello",
  "rilassato",
  "rilevato",
  "rimanere",
  "rimbalzo",
  "rimedio",
  "rimorchio",
  "rinascita",
  "rincaro",
  "rinforzo",
  "rinnovo",
  "rinomato",
  "rinsavito",
  "rintocco",
  "rinuncia",
  "rinvenire",
  "riparato",
  "ripetuto",
  "ripieno",
  "riportare",
  "ripresa",
  "ripulire",
  "risata",
  "rischio",
  "riserva",
  "risibile",
  "riso",
  "rispetto",
  "ristoro",
  "risultato",
  "risvolto",
  "ritardo",
  "ritegno",
  "ritmico",
  "ritrovo",
  "riunione",
  "riva",
  "riverso",
  "rivincita",
  "rivolto",
  "rizoma",
  "roba",
  "robotico",
  "robusto",
  "roccia",
  "roco",
  "rodaggio",
  "rodere",
  "roditore",
  "rogito",
  "rollio",
  "romantico",
  "rompere",
  "ronzio",
  "rosolare",
  "rospo",
  "rotante",
  "rotondo",
  "rotula",
  "rovescio",
  "rubizzo",
  "rubrica",
  "ruga",
  "rullino",
  "rumine",
  "rumoroso",
  "ruolo",
  "rupe",
  "russare",
  "rustico",
  "sabato",
  "sabbiare",
  "sabotato",
  "sagoma",
  "salasso",
  "saldatura",
  "salgemma",
  "salivare",
  "salmone",
  "salone",
  "saltare",
  "saluto",
  "salvo",
  "sapere",
  "sapido",
  "saporito",
  "saraceno",
  "sarcasmo",
  "sarto",
  "sassoso",
  "satellite",
  "satira",
  "satollo",
  "saturno",
  "savana",
  "savio",
  "saziato",
  "sbadiglio",
  "sbalzo",
  "sbancato",
  "sbarra",
  "sbattere",
  "sbavare",
  "sbendare",
  "sbirciare",
  "sbloccato",
  "sbocciato",
  "sbrinare",
  "sbruffone",
  "sbuffare",
  "scabroso",
  "scadenza",
  "scala",
  "scambiare",
  "scandalo",
  "scapola",
  "scarso",
  "scatenare",
  "scavato",
  "scelto",
  "scenico",
  "scettro",
  "scheda",
  "schiena",
  "sciarpa",
  "scienza",
  "scindere",
  "scippo",
  "sciroppo",
  "scivolo",
  "sclerare",
  "scodella",
  "scolpito",
  "scomparto",
  "sconforto",
  "scoprire",
  "scorta",
  "scossone",
  "scozzese",
  "scriba",
  "scrollare",
  "scrutinio",
  "scuderia",
  "scultore",
  "scuola",
  "scuro",
  "scusare",
  "sdebitare",
  "sdoganare",
  "seccatura",
  "secondo",
  "sedano",
  "seggiola",
  "segnalato",
  "segregato",
  "seguito",
  "selciato",
  "selettivo",
  "sella",
  "selvaggio",
  "semaforo",
  "sembrare",
  "seme",
  "seminato",
  "sempre",
  "senso",
  "sentire",
  "sepolto",
  "sequenza",
  "serata",
  "serbato",
  "sereno",
  "serio",
  "serpente",
  "serraglio",
  "servire",
  "sestina",
  "setola",
  "settimana",
  "sfacelo",
  "sfaldare",
  "sfamato",
  "sfarzoso",
  "sfaticato",
  "sfera",
  "sfida",
  "sfilato",
  "sfinge",
  "sfocato",
  "sfoderare",
  "sfogo",
  "sfoltire",
  "sforzato",
  "sfratto",
  "sfruttato",
  "sfuggito",
  "sfumare",
  "sfuso",
  "sgabello",
  "sgarbato",
  "sgonfiare",
  "sgorbio",
  "sgrassato",
  "sguardo",
  "sibilo",
  "siccome",
  "sierra",
  "sigla",
  "signore",
  "silenzio",
  "sillaba",
  "simbolo",
  "simpatico",
  "simulato",
  "sinfonia",
  "singolo",
  "sinistro",
  "sino",
  "sintesi",
  "sinusoide",
  "sipario",
  "sisma",
  "sistole",
  "situato",
  "slitta",
  "slogatura",
  "sloveno",
  "smarrito",
  "smemorato",
  "smentito",
  "smeraldo",
  "smilzo",
  "smontare",
  "smottato",
  "smussato",
  "snellire",
  "snervato",
  "snodo",
  "sobbalzo",
  "sobrio",
  "soccorso",
  "sociale",
  "sodale",
  "soffitto",
  "sogno",
  "soldato",
  "solenne",
  "solido",
  "sollazzo",
  "solo",
  "solubile",
  "solvente",
  "somatico",
  "somma",
  "sonda",
  "sonetto",
  "sonnifero",
  "sopire",
  "soppeso",
  "sopra",
  "sorgere",
  "sorpasso",
  "sorriso",
  "sorso",
  "sorteggio",
  "sorvolato",
  "sospiro",
  "sosta",
  "sottile",
  "spada",
  "spalla",
  "spargere",
  "spatola",
  "spavento",
  "spazzola",
  "specie",
  "spedire",
  "spegnere",
  "spelatura",
  "speranza",
  "spessore",
  "spettrale",
  "spezzato",
  "spia",
  "spigoloso",
  "spillato",
  "spinoso",
  "spirale",
  "splendido",
  "sportivo",
  "sposo",
  "spranga",
  "sprecare",
  "spronato",
  "spruzzo",
  "spuntino",
  "squillo",
  "sradicare",
  "srotolato",
  "stabile",
  "stacco",
  "staffa",
  "stagnare",
  "stampato",
  "stantio",
  "starnuto",
  "stasera",
  "statuto",
  "stelo",
  "steppa",
  "sterzo",
  "stiletto",
  "stima",
  "stirpe",
  "stivale",
  "stizzoso",
  "stonato",
  "storico",
  "strappo",
  "stregato",
  "stridulo",
  "strozzare",
  "strutto",
  "stuccare",
  "stufo",
  "stupendo",
  "subentro",
  "succoso",
  "sudore",
  "suggerito",
  "sugo",
  "sultano",
  "suonare",
  "superbo",
  "supporto",
  "surgelato",
  "surrogato",
  "sussurro",
  "sutura",
  "svagare",
  "svedese",
  "sveglio",
  "svelare",
  "svenuto",
  "svezia",
  "sviluppo",
  "svista",
  "svizzera",
  "svolta",
  "svuotare",
  "tabacco",
  "tabulato",
  "tacciare",
  "taciturno",
  "tale",
  "talismano",
  "tampone",
  "tannino",
  "tara",
  "tardivo",
  "targato",
  "tariffa",
  "tarpare",
  "tartaruga",
  "tasto",
  "tattico",
  "taverna",
  "tavolata",
  "tazza",
  "teca",
  "tecnico",
  "telefono",
  "temerario",
  "tempo",
  "temuto",
  "tendone",
  "tenero",
  "tensione",
  "tentacolo",
  "teorema",
  "terme",
  "terrazzo",
  "terzetto",
  "tesi",
  "tesserato",
  "testato",
  "tetro",
  "tettoia",
  "tifare",
  "tigella",
  "timbro",
  "tinto",
  "tipico",
  "tipografo",
  "tiraggio",
  "tiro",
  "titanio",
  "titolo",
  "titubante",
  "tizio",
  "tizzone",
  "toccare",
  "tollerare",
  "tolto",
  "tombola",
  "tomo",
  "tonfo",
  "tonsilla",
  "topazio",
  "topologia",
  "toppa",
  "torba",
  "tornare",
  "torrone",
  "tortora",
  "toscano",
  "tossire",
  "tostatura",
  "totano",
  "trabocco",
  "trachea",
  "trafila",
  "tragedia",
  "tralcio",
  "tramonto",
  "transito",
  "trapano",
  "trarre",
  "trasloco",
  "trattato",
  "trave",
  "treccia",
  "tremolio",
  "trespolo",
  "tributo",
  "tricheco",
  "trifoglio",
  "trillo",
  "trincea",
  "trio",
  "tristezza",
  "triturato",
  "trivella",
  "tromba",
  "trono",
  "troppo",
  "trottola",
  "trovare",
  "truccato",
  "tubatura",
  "tuffato",
  "tulipano",
  "tumulto",
  "tunisia",
  "turbare",
  "turchino",
  "tuta",
  "tutela",
  "ubicato",
  "uccello",
  "uccisore",
  "udire",
  "uditivo",
  "uffa",
  "ufficio",
  "uguale",
  "ulisse",
  "ultimato",
  "umano",
  "umile",
  "umorismo",
  "uncinetto",
  "ungere",
  "ungherese",
  "unicorno",
  "unificato",
  "unisono",
  "unitario",
  "unte",
  "uovo",
  "upupa",
  "uragano",
  "urgenza",
  "urlo",
  "usanza",
  "usato",
  "uscito",
  "usignolo",
  "usuraio",
  "utensile",
  "utilizzo",
  "utopia",
  "vacante",
  "vaccinato",
  "vagabondo",
  "vagliato",
  "valanga",
  "valgo",
  "valico",
  "valletta",
  "valoroso",
  "valutare",
  "valvola",
  "vampata",
  "vangare",
  "vanitoso",
  "vano",
  "vantaggio",
  "vanvera",
  "vapore",
  "varano",
  "varcato",
  "variante",
  "vasca",
  "vedetta",
  "vedova",
  "veduto",
  "vegetale",
  "veicolo",
  "velcro",
  "velina",
  "velluto",
  "veloce",
  "venato",
  "vendemmia",
  "vento",
  "verace",
  "verbale",
  "vergogna",
  "verifica",
  "vero",
  "verruca",
  "verticale",
  "vescica",
  "vessillo",
  "vestale",
  "veterano",
  "vetrina",
  "vetusto",
  "viandante",
  "vibrante",
  "vicenda",
  "vichingo",
  "vicinanza",
  "vidimare",
  "vigilia",
  "vigneto",
  "vigore",
  "vile",
  "villano",
  "vimini",
  "vincitore",
  "viola",
  "vipera",
  "virgola",
  "virologo",
  "virulento",
  "viscoso",
  "visione",
  "vispo",
  "vissuto",
  "visura",
  "vita",
  "vitello",
  "vittima",
  "vivanda",
  "vivido",
  "viziare",
  "voce",
  "voga",
  "volatile",
  "volere",
  "volpe",
  "voragine",
  "vulcano",
  "zampogna",
  "zanna",
  "zappato",
  "zattera",
  "zavorra",
  "zefiro",
  "zelante",
  "zelo",
  "zenzero",
  "zerbino",
  "zibetto",
  "zinco",
  "zircone",
  "zitto",
  "zolla",
  "zotico",
  "zucchero",
  "zufolo",
  "zulu",
  "zuppa"
]

},{}],34:[function(require,module,exports){
module.exports=[
  "πüéπüäπüôπüÅπüùπéô",
  "πüéπüäπüòπüñ",
  "πüéπüäπüƒπéÖ",
  "πüéπüèπü¥πéÖπéë",
  "πüéπüïπüíπéâπéô",
  "πüéπüìπéï",
  "πüéπüæπüïπéÖπüƒ",
  "πüéπüæπéï",
  "πüéπüôπüïπéÖπéîπéï",
  "πüéπüòπüä",
  "πüéπüòπü▓",
  "πüéπüùπüéπü¿",
  "πüéπüùπéÖπéÅπüå",
  "πüéπüÖπéÖπüïπéï",
  "πüéπüÖπéÖπüì",
  "πüéπü¥πü╡πéÖ",
  "πüéπüƒπüêπéï",
  "πüéπüƒπüƒπéüπéï",
  "πüéπüƒπéèπü╛πüê",
  "πüéπüƒπéï",
  "πüéπüñπüä",
  "πüéπüñπüïπüå",
  "πüéπüúπüùπéàπüÅ",
  "πüéπüñπü╛πéè",
  "πüéπüñπéüπéï",
  "πüéπüªπü¬",
  "πüéπüªπü»πü╛πéï",
  "πüéπü▓πéï",
  "πüéπü╡πéÖπéë",
  "πüéπü╡πéÖπéï",
  "πüéπü╡πéîπéï",
  "πüéπü╛πüä",
  "πüéπü╛πü¿πéÖ",
  "πüéπü╛πéäπüïπüÖ",
  "πüéπü╛πéè",
  "πüéπü┐πééπü«",
  "πüéπéüπéèπüï",
  "πüéπéäπü╛πéï",
  "πüéπéåπéÇ",
  "πüéπéëπüäπüÅπéÖπü╛",
  "πüéπéëπüù",
  "πüéπéëπüÖπüùπéÖ",
  "πüéπéëπüƒπéüπéï",
  "πüéπéëπéåπéï",
  "πüéπéëπéÅπüÖ",
  "πüéπéèπüïπéÖπü¿πüå",
  "πüéπéÅπü¢πéï",
  "πüéπéÅπüªπéï",
  "πüéπéôπüä",
  "πüéπéôπüïπéÖπüä",
  "πüéπéôπüô",
  "πüéπéôπü¢πéÖπéô",
  "πüéπéôπüªπüä",
  "πüéπéôπü¬πüä",
  "πüéπéôπü╛πéè",
  "πüäπüäπüƒπéÖπüÖ",
  "πüäπüèπéô",
  "πüäπüïπéÖπüä",
  "πüäπüïπéÖπüÅ",
  "πüäπüìπüèπüä",
  "πüäπüìπü¬πéè",
  "πüäπüìπééπü«",
  "πüäπüìπéï",
  "πüäπüÅπüùπéÖ",
  "πüäπüÅπü╡πéÖπéô",
  "πüäπüæπü»πéÖπü¬",
  "πüäπüæπéô",
  "πüäπüôπüå",
  "πüäπüôπüÅ",
  "πüäπüôπüñ",
  "πüäπüòπü╛πüùπüä",
  "πüäπüòπéô",
  "πüäπüùπüì",
  "πüäπüùπéÖπéàπüå",
  "πüäπüùπéÖπéçπüå",
  "πüäπüùπéÖπéÅπéï",
  "πüäπüÖπéÖπü┐",
  "πüäπüÖπéÖπéî",
  "πüäπü¢πüä",
  "πüäπü¢πüêπü▓πéÖ",
  "πüäπü¢πüïπüä",
  "πüäπü¢πüì",
  "πüäπü¢πéÖπéô",
  "πüäπü¥πüåπéìπüå",
  "πüäπü¥πüïπéÖπüùπüä",
  "πüäπüƒπéÖπüä",
  "πüäπüƒπéÖπüÅ",
  "πüäπüƒπüÖπéÖπéë",
  "πüäπüƒπü┐",
  "πüäπüƒπéèπüé",
  "πüäπüíπüèπüå",
  "πüäπüíπüùπéÖ",
  "πüäπüíπü¿πéÖ",
  "πüäπüíπü»πéÖ",
  "πüäπüíπü╡πéÖ",
  "πüäπüíπéèπéàπüå",
  "πüäπüñπüï",
  "πüäπüúπüùπéàπéô",
  "πüäπüúπü¢πüä",
  "πüäπüúπü¥πüå",
  "πüäπüúπüƒπéô",
  "πüäπüúπüí",
  "πüäπüúπüªπüä",
  "πüäπüúπü╗πéÜπüå",
  "πüäπüªπüòπéÖ",
  "πüäπüªπéô",
  "πüäπü¿πéÖπüå",
  "πüäπü¿πüô",
  "πüäπü¬πüä",
  "πüäπü¬πüï",
  "πüäπü¡πéÇπéè",
  "πüäπü«πüí",
  "πüäπü«πéï",
  "πüäπü»πüñ",
  "πüäπü»πéÖπéï",
  "πüäπü»πéô",
  "πüäπü▓πéÖπüì",
  "πüäπü▓πéô",
  "πüäπü╡πüÅ",
  "πüäπü╕πéô",
  "πüäπü╗πüå",
  "πüäπü┐πéô",
  "πüäπééπüåπü¿",
  "πüäπééπüƒπéî",
  "πüäπééπéè",
  "πüäπéäπüïπéÖπéï",
  "πüäπéäπüÖ",
  "πüäπéêπüïπéô",
  "πüäπéêπüÅ",
  "πüäπéëπüä",
  "πüäπéëπüÖπü¿",
  "πüäπéèπüÅπéÖπüí",
  "πüäπéèπéçπüå",
  "πüäπéîπüä",
  "πüäπéîπééπü«",
  "πüäπéîπéï",
  "πüäπéìπüêπéôπü▓πéÜπüñ",
  "πüäπéÅπüä",
  "πüäπéÅπüå",
  "πüäπéÅπüïπéô",
  "πüäπéÅπü»πéÖ",
  "πüäπéÅπéåπéï",
  "πüäπéôπüæπéÖπéôπü╛πéü",
  "πüäπéôπüòπüñ",
  "πüäπéôπüùπéçπüå",
  "πüäπéôπéêπüå",
  "πüåπüêπüì",
  "πüåπüêπéï",
  "πüåπüèπüòπéÖ",
  "πüåπüïπéÖπüä",
  "πüåπüïπü╡πéÖ",
  "πüåπüïπü╕πéÖπéï",
  "πüåπüìπéÅ",
  "πüåπüÅπéëπüäπü¬",
  "πüåπüÅπéîπéî",
  "πüåπüæπüƒπü╛πéÅπéï",
  "πüåπüæπüñπüæ",
  "πüåπüæπü¿πéï",
  "πüåπüæπééπüñ",
  "πüåπüæπéï",
  "πüåπüôπéÖπüïπüÖ",
  "πüåπüôπéÖπüÅ",
  "πüåπüôπéô",
  "πüåπüòπüìπéÖ",
  "πüåπüùπü¬πüå",
  "πüåπüùπéìπüïπéÖπü┐",
  "πüåπüÖπüä",
  "πüåπüÖπüìπéÖ",
  "πüåπüÖπüÅπéÖπéëπüä",
  "πüåπüÖπéüπéï",
  "πüåπü¢πüñ",
  "πüåπüíπüéπéÅπü¢",
  "πüåπüíπüïπéÖπéÅ",
  "πüåπüíπüì",
  "πüåπüíπéàπüå",
  "πüåπüúπüïπéè",
  "πüåπüñπüÅπüùπüä",
  "πüåπüúπüƒπüêπéï",
  "πüåπüñπéï",
  "πüåπü¿πéÖπéô",
  "πüåπü¬πüìπéÖ",
  "πüåπü¬πüùπéÖ",
  "πüåπü¬πüÖπéÖπüÅ",
  "πüåπü¬πéï",
  "πüåπü¡πéï",
  "πüåπü«πüå",
  "πüåπü╡πéÖπüæπéÖ",
  "πüåπü╡πéÖπüôπéÖπüê",
  "πüåπü╛πéîπéï",
  "πüåπéüπéï",
  "πüåπééπüå",
  "πüåπéäπü╛πüå",
  "πüåπéêπüÅ",
  "πüåπéëπüïπéÖπüêπüÖ",
  "πüåπéëπüÅπéÖπüí",
  "πüåπéëπü¬πüä",
  "πüåπéèπüéπüæπéÖ",
  "πüåπéèπüìπéî",
  "πüåπéïπüòπüä",
  "πüåπéîπüùπüä",
  "πüåπéîπéåπüì",
  "πüåπéîπéï",
  "πüåπéìπüô",
  "πüåπéÅπüì",
  "πüåπéÅπüò",
  "πüåπéôπüôπüå",
  "πüåπéôπüíπéô",
  "πüåπéôπüªπéô",
  "πüåπéôπü¿πéÖπüå",
  "πüêπüäπüêπéô",
  "πüêπüäπüïπéÖ",
  "πüêπüäπüìπéçπüå",
  "πüêπüäπüôπéÖ",
  "πüêπüäπü¢πüä",
  "πüêπüäπü╡πéÖπéô",
  "πüêπüäπéêπüå",
  "πüêπüäπéÅ",
  "πüêπüèπéè",
  "πüêπüïπéÖπüè",
  "πüêπüïπéÖπüÅ",
  "πüêπüìπüƒπüä",
  "πüêπüÅπü¢πéï",
  "πüêπüùπéâπüÅ",
  "πüêπüÖπüª",
  "πüêπüñπéëπéô",
  "πüêπü«πüÅπéÖ",
  "πüêπü╗πüåπü╛πüì",
  "πüêπü╗πéô",
  "πüêπü╛πüì",
  "πüêπééπüùπéÖ",
  "πüêπééπü«",
  "πüêπéëπüä",
  "πüêπéëπü╡πéÖ",
  "πüêπéèπüé",
  "πüêπéôπüêπéô",
  "πüêπéôπüïπüä",
  "πüêπéôπüìπéÖ",
  "πüêπéôπüæπéÖπüì",
  "πüêπéôπüùπéàπüå",
  "πüêπéôπü¢πéÖπüñ",
  "πüêπéôπü¥πüÅ",
  "πüêπéôπüíπéçπüå",
  "πüêπéôπü¿πüñ",
  "πüèπüäπüïπüæπéï",
  "πüèπüäπüôπüÖ",
  "πüèπüäπüùπüä",
  "πüèπüäπüñπüÅ",
  "πüèπüåπüêπéô",
  "πüèπüåπüòπü╛",
  "πüèπüåπüùπéÖ",
  "πüèπüåπü¢πüñ",
  "πüèπüåπüƒπüä",
  "πüèπüåπü╡πüÅ",
  "πüèπüåπü╕πéÖπüä",
  "πüèπüåπéêπüå",
  "πüèπüêπéï",
  "πüèπüèπüä",
  "πüèπüèπüå",
  "πüèπüèπü¿πéÖπüèπéè",
  "πüèπüèπéä",
  "πüèπüèπéêπü¥",
  "πüèπüïπüêπéè",
  "πüèπüïπüÖπéÖ",
  "πüèπüïπéÖπéÇ",
  "πüèπüïπéÅπéè",
  "πüèπüìπéÖπü¬πüå",
  "πüèπüìπéï",
  "πüèπüÅπüòπü╛",
  "πüèπüÅπüùπéÖπéçπüå",
  "πüèπüÅπéèπüïπéÖπü¬",
  "πüèπüÅπéï",
  "πüèπüÅπéîπéï",
  "πüèπüôπüÖ",
  "πüèπüôπü¬πüå",
  "πüèπüôπéï",
  "πüèπüòπüêπéï",
  "πüèπüòπü¬πüä",
  "πüèπüòπéüπéï",
  "πüèπüùπüäπéî",
  "πüèπüùπüêπéï",
  "πüèπüùπéÖπüìπéÖ",
  "πüèπüùπéÖπüòπéô",
  "πüèπüùπéâπéî",
  "πüèπü¥πéëπüÅ",
  "πüèπü¥πéÅπéï",
  "πüèπüƒπüïπéÖπüä",
  "πüèπüƒπüÅ",
  "πüèπüƒπéÖπéäπüï",
  "πüèπüíπüñπüÅ",
  "πüèπüúπü¿",
  "πüèπüñπéè",
  "πüèπüªπéÖπüïπüæ",
  "πüèπü¿πüùπééπü«",
  "πüèπü¿πü¬πüùπüä",
  "πüèπü¿πéÖπéè",
  "πüèπü¿πéÖπéìπüïπüÖ",
  "πüèπü»πéÖπüòπéô",
  "πüèπü╛πüäπéè",
  "πüèπéüπüªπéÖπü¿πüå",
  "πüèπééπüäπüªπéÖ",
  "πüèπééπüå",
  "πüèπééπüƒπüä",
  "πüèπééπüíπéâ",
  "πüèπéäπüñ",
  "πüèπéäπéåπü▓πéÖ",
  "πüèπéêπü╗πéÖπüÖ",
  "πüèπéëπéôπüƒπéÖ",
  "πüèπéìπüÖ",
  "πüèπéôπüïπéÖπüÅ",
  "πüèπéôπüæπüä",
  "πüèπéôπüùπéâ",
  "πüèπéôπü¢πéô",
  "πüèπéôπüƒπéÖπéô",
  "πüèπéôπüíπéàπüå",
  "πüèπéôπü¿πéÖπüæπüä",
  "πüïπüéπüñ",
  "πüïπüäπüïπéÖ",
  "πüïπéÖπüäπüì",
  "πüïπéÖπüäπüæπéô",
  "πüïπéÖπüäπüôπüå",
  "πüïπüäπüòπüñ",
  "πüïπüäπüùπéâ",
  "πüïπüäπüÖπüäπéêπüÅ",
  "πüïπüäπü¢πéÖπéô",
  "πüïπüäπü¥πéÖπüåπü¿πéÖ",
  "πüïπüäπüñπüå",
  "πüïπüäπüªπéô",
  "πüïπüäπü¿πüå",
  "πüïπüäπü╡πüÅ",
  "πüïπéÖπüäπü╕πüì",
  "πüïπüäπü╗πüå",
  "πüïπüäπéêπüå",
  "πüïπéÖπüäπéëπüä",
  "πüïπüäπéÅ",
  "πüïπüêπéï",
  "πüïπüèπéè",
  "πüïπüïπüêπéï",
  "πüïπüïπéÖπüÅ",
  "πüïπüïπéÖπüù",
  "πüïπüïπéÖπü┐",
  "πüïπüÅπüôπéÖ",
  "πüïπüÅπü¿πüÅ",
  "πüïπüòπéÖπéï",
  "πüïπéÖπü¥πéÖπüå",
  "πüïπüƒπüä",
  "πüïπüƒπüí",
  "πüïπéÖπüíπéçπüå",
  "πüïπéÖπüúπüìπéàπüå",
  "πüïπéÖπüúπüôπüå",
  "πüïπéÖπüúπüòπéô",
  "πüïπéÖπüúπüùπéçπüå",
  "πüïπü¬πüòπéÖπéÅπüù",
  "πüïπü«πüå",
  "πüïπéÖπü»πüÅ",
  "πüïπü╡πéÖπüï",
  "πüïπü╗πüå",
  "πüïπü╗πüôπéÖ",
  "πüïπü╛πüå",
  "πüïπü╛πü╗πéÖπüô",
  "πüïπéüπéîπüèπéô",
  "πüïπéåπüä",
  "πüïπéêπüåπü▓πéÖ",
  "πüïπéëπüä",
  "πüïπéïπüä",
  "πüïπéìπüå",
  "πüïπéÅπüÅ",
  "πüïπéÅπéë",
  "πüïπéÖπéôπüï",
  "πüïπéôπüæπüä",
  "πüïπéôπüôπüå",
  "πüïπéôπüùπéâ",
  "πüïπéôπü¥πüå",
  "πüïπéôπüƒπéô",
  "πüïπéôπüí",
  "πüïπéÖπéôπü»πéÖπéï",
  "πüìπüéπüä",
  "πüìπüéπüñ",
  "πüìπüäπéì",
  "πüìπéÖπüäπéô",
  "πüìπüåπüä",
  "πüìπüåπéô",
  "πüìπüêπéï",
  "πüìπüèπüå",
  "πüìπüèπüÅ",
  "πüìπüèπüí",
  "πüìπüèπéô",
  "πüìπüïπüä",
  "πüìπüïπüÅ",
  "πüìπüïπéôπüùπéâ",
  "πüìπüìπüª",
  "πüìπüÅπü»πéÖπéè",
  "πüìπüÅπéëπüæπéÖ",
  "πüìπüæπéôπü¢πüä",
  "πüìπüôπüå",
  "πüìπüôπüêπéï",
  "πüìπüôπüÅ",
  "πüìπüòπüä",
  "πüìπüòπüÅ",
  "πüìπüòπü╛",
  "πüìπüòπéëπüìπéÖ",
  "πüìπéÖπüùπéÖπüïπüïπéÖπüÅ",
  "πüìπéÖπüùπüì",
  "πüìπéÖπüùπéÖπüƒπüäπüæπéô",
  "πüìπéÖπüùπéÖπü½πüúπüªπüä",
  "πüìπéÖπüùπéÖπéàπüñπüùπéâ",
  "πüìπüÖπüå",
  "πüìπü¢πüä",
  "πüìπü¢πüì",
  "πüìπü¢πüñ",
  "πüìπü¥πüå",
  "πüìπü¥πéÖπüÅ",
  "πüìπü¥πéÖπéô",
  "πüìπüƒπüêπéï",
  "πüìπüíπéçπüå",
  "πüìπüñπüêπéô",
  "πüìπéÖπüúπüíπéè",
  "πüìπüñπüñπüì",
  "πüìπüñπü¡",
  "πüìπüªπüä",
  "πüìπü¿πéÖπüå",
  "πüìπü¿πéÖπüÅ",
  "πüìπü¬πüä",
  "πüìπü¬πüïπéÖ",
  "πüìπü¬πüô",
  "πüìπü¼πüôπéÖπüù",
  "πüìπü¡πéô",
  "πüìπü«πüå",
  "πüìπü«πüùπüƒ",
  "πüìπü»πüÅ",
  "πüìπü▓πéÖπüùπüä",
  "πüìπü▓πéô",
  "πüìπü╡πüÅ",
  "πüìπü╡πéÖπéô",
  "πüìπü╗πéÖπüå",
  "πüìπü╗πéô",
  "πüìπü╛πéï",
  "πüìπü┐πüñ",
  "πüìπéÇπüÖπéÖπüïπüùπüä",
  "πüìπéüπéï",
  "πüìπééπüƒπéÖπéüπüù",
  "πüìπééπüí",
  "πüìπééπü«",
  "πüìπéâπüÅ",
  "πüìπéäπüÅ",
  "πüìπéÖπéàπüåπü½πüÅ",
  "πüìπéêπüå",
  "πüìπéçπüåπéèπéàπüå",
  "πüìπéëπüä",
  "πüìπéëπüÅ",
  "πüìπéèπéô",
  "πüìπéîπüä",
  "πüìπéîπüñ",
  "πüìπéìπüÅ",
  "πüìπéÖπéìπéô",
  "πüìπéÅπéüπéï",
  "πüìπéÖπéôπüäπéì",
  "πüìπéôπüïπüÅπüùπéÖ",
  "πüìπéôπüùπéÖπéç",
  "πüìπéôπéêπüåπü▓πéÖ",
  "πüÅπéÖπüéπüä",
  "πüÅπüäπüÖπéÖ",
  "πüÅπüåπüïπéô",
  "πüÅπüåπüì",
  "πüÅπüåπüÅπéÖπéô",
  "πüÅπüåπüôπüå",
  "πüÅπéÖπüåπü¢πüä",
  "πüÅπüåπü¥πüå",
  "πüÅπéÖπüåπüƒπéë",
  "πüÅπüåπü╡πüÅ",
  "πüÅπüåπü╗πéÖ",
  "πüÅπüïπéô",
  "πüÅπüìπéçπüå",
  "πüÅπüæπéÖπéô",
  "πüÅπéÖπüôπüå",
  "πüÅπüòπüä",
  "πüÅπüòπüì",
  "πüÅπüòπü»πéÖπü¬",
  "πüÅπüòπéï",
  "πüÅπüùπéâπü┐",
  "πüÅπüùπéçπüå",
  "πüÅπüÖπü«πüì",
  "πüÅπüÖπéèπéåπü▓πéÖ",
  "πüÅπü¢πüæπéÖ",
  "πüÅπü¢πéô",
  "πüÅπéÖπüƒπüäπüªπüì",
  "πüÅπüƒπéÖπüòπéï",
  "πüÅπüƒπü▓πéÖπéîπéï",
  "πüÅπüíπüôπü┐",
  "πüÅπüíπüòπüì",
  "πüÅπüñπüùπüƒ",
  "πüÅπéÖπüúπüÖπéè",
  "πüÅπüñπéìπüÅπéÖ",
  "πüÅπü¿πüåπüªπéô",
  "πüÅπü¿πéÖπüÅ",
  "πüÅπü¬πéô",
  "πüÅπü¡πüÅπü¡",
  "πüÅπü«πüå",
  "πüÅπü╡πüå",
  "πüÅπü┐πüéπéÅπü¢",
  "πüÅπü┐πüƒπüªπéï",
  "πüÅπéüπéï",
  "πüÅπéäπüÅπüùπéç",
  "πüÅπéëπüÖ",
  "πüÅπéëπü╕πéÖπéï",
  "πüÅπéïπü╛",
  "πüÅπéîπéï",
  "πüÅπéìπüå",
  "πüÅπéÅπüùπüä",
  "πüÅπéÖπéôπüïπéô",
  "πüÅπéÖπéôπüùπéçπüÅ",
  "πüÅπéÖπéôπüƒπüä",
  "πüÅπéÖπéôπüª",
  "πüæπüéπü¬",
  "πüæπüäπüïπüÅ",
  "πüæπüäπüæπéô",
  "πüæπüäπüô",
  "πüæπüäπüòπüñ",
  "πüæπéÖπüäπüùπéÖπéàπüñ",
  "πüæπüäπüƒπüä",
  "πüæπéÖπüäπü«πüåπüùπéÖπéô",
  "πüæπüäπéîπüì",
  "πüæπüäπéì",
  "πüæπüèπü¿πüÖ",
  "πüæπüèπéèπééπü«",
  "πüæπéÖπüìπüï",
  "πüæπéÖπüìπüæπéÖπéô",
  "πüæπéÖπüìπüƒπéÖπéô",
  "πüæπéÖπüìπüíπéô",
  "πüæπéÖπüìπü¿πüñ",
  "πüæπéÖπüìπü»",
  "πüæπéÖπüìπéäπüÅ",
  "πüæπéÖπüôπüå",
  "πüæπéÖπüôπüÅπüùπéÖπéçπüå",
  "πüæπéÖπüòπéÖπüä",
  "πüæπüòπüì",
  "πüæπéÖπüòπéÖπéô",
  "πüæπüùπüì",
  "πüæπüùπüôπéÖπéÇ",
  "πüæπüùπéçπüå",
  "πüæπéÖπüÖπü¿",
  "πüæπüƒπü»πéÖ",
  "πüæπüíπéâπüúπü╡πéÜ",
  "πüæπüíπéëπüÖ",
  "πüæπüñπüéπüñ",
  "πüæπüñπüä",
  "πüæπüñπüêπüì",
  "πüæπüúπüôπéô",
  "πüæπüñπüùπéÖπéç",
  "πüæπüúπü¢πüì",
  "πüæπüúπüªπüä",
  "πüæπüñπü╛πüñ",
  "πüæπéÖπüñπéêπüåπü▓πéÖ",
  "πüæπéÖπüñπéîπüä",
  "πüæπüñπéìπéô",
  "πüæπéÖπü¿πéÖπüÅ",
  "πüæπü¿πü»πéÖπüÖ",
  "πüæπü¿πéï",
  "πüæπü¬πüæπéÖ",
  "πüæπü¬πüÖ",
  "πüæπü¬πü┐",
  "πüæπü¼πüì",
  "πüæπéÖπü¡πüñ",
  "πüæπü¡πéô",
  "πüæπü»πüä",
  "πüæπéÖπü▓πéô",
  "πüæπü╡πéÖπüïπüä",
  "πüæπéÖπü╗πéÖπüÅ",
  "πüæπü╛πéè",
  "πüæπü┐πüïπéï",
  "πüæπéÇπüù",
  "πüæπéÇπéè",
  "πüæπééπü«",
  "πüæπéëπüä",
  "πüæπéìπüæπéì",
  "πüæπéÅπüùπüä",
  "πüæπéôπüä",
  "πüæπéôπüêπüñ",
  "πüæπéôπüè",
  "πüæπéôπüï",
  "πüæπéÖπéôπüì",
  "πüæπéôπüæπéÖπéô",
  "πüæπéôπüôπüå",
  "πüæπéôπüòπüÅ",
  "πüæπéôπüùπéàπüå",
  "πüæπéôπüÖπüå",
  "πüæπéÖπéôπü¥πüå",
  "πüæπéôπüíπüÅ",
  "πüæπéôπüªπüä",
  "πüæπéôπü¿πüå",
  "πüæπéôπü¬πüä",
  "πüæπéôπü½πéô",
  "πüæπéÖπéôπü╡πéÖπüñ",
  "πüæπéôπü╛",
  "πüæπéôπü┐πéô",
  "πüæπéôπéüπüä",
  "πüæπéôπéëπéô",
  "πüæπéôπéè",
  "πüôπüéπüÅπü╛",
  "πüôπüäπü¼",
  "πüôπüäπü▓πéÖπü¿",
  "πüôπéÖπüåπüä",
  "πüôπüåπüêπéô",
  "πüôπüåπüèπéô",
  "πüôπüåπüïπéô",
  "πüôπéÖπüåπüìπéàπüå",
  "πüôπéÖπüåπüæπüä",
  "πüôπüåπüôπüå",
  "πüôπüåπüòπüä",
  "πüôπüåπüùπéÖ",
  "πüôπüåπüÖπüä",
  "πüôπéÖπüåπü¢πüä",
  "πüôπüåπü¥πüÅ",
  "πüôπüåπüƒπüä",
  "πüôπüåπüíπéâ",
  "πüôπüåπüñπüå",
  "πüôπüåπüªπüä",
  "πüôπüåπü¿πéÖπüå",
  "πüôπüåπü¬πüä",
  "πüôπüåπü»πüä",
  "πüôπéÖπüåπü╗πüå",
  "πüôπéÖπüåπü╛πéô",
  "πüôπüåπééπüÅ",
  "πüôπüåπéèπüñ",
  "πüôπüêπéï",
  "πüôπüèπéè",
  "πüôπéÖπüïπüä",
  "πüôπéÖπüïπéÖπüñ",
  "πüôπéÖπüïπéô",
  "πüôπüÅπüôπéÖ",
  "πüôπüÅπüòπüä",
  "πüôπüÅπü¿πüå",
  "πüôπüÅπü¬πüä",
  "πüôπüÅπü»πüÅ",
  "πüôπüÅπéÖπü╛",
  "πüôπüæπüä",
  "πüôπüæπéï",
  "πüôπüôπü«πüï",
  "πüôπüôπéì",
  "πüôπüòπéü",
  "πüôπüùπüñ",
  "πüôπüÖπüå",
  "πüôπü¢πüä",
  "πüôπü¢πüì",
  "πüôπü¢πéÖπéô",
  "πüôπü¥πüƒπéÖπüª",
  "πüôπüƒπüä",
  "πüôπüƒπüêπéï",
  "πüôπüƒπüñ",
  "πüôπüíπéçπüå",
  "πüôπüúπüï",
  "πüôπüñπüôπüñ",
  "πüôπüñπü»πéÖπéô",
  "πüôπüñπü╡πéÖ",
  "πüôπüªπüä",
  "πüôπüªπéô",
  "πüôπü¿πüïπéÖπéë",
  "πüôπü¿πüù",
  "πüôπü¿πü»πéÖ",
  "πüôπü¿πéè",
  "πüôπü¬πüôπéÖπü¬",
  "πüôπü¡πüôπü¡",
  "πüôπü«πü╛πü╛",
  "πüôπü«πü┐",
  "πüôπü«πéê",
  "πüôπéÖπü»πéô",
  "πüôπü▓πüñπüùπéÖ",
  "πüôπü╡πüå",
  "πüôπü╡πéô",
  "πüôπü╗πéÖπéîπéï",
  "πüôπéÖπü╛πüéπü╡πéÖπéë",
  "πüôπü╛πüïπüä",
  "πüôπéÖπü╛πüÖπéè",
  "πüôπü╛πüñπü¬",
  "πüôπü╛πéï",
  "πüôπéÇπüìπéÖπüô",
  "πüôπééπüùπéÖ",
  "πüôπééπüí",
  "πüôπééπü«",
  "πüôπééπéô",
  "πüôπéäπüÅ",
  "πüôπéäπü╛",
  "πüôπéåπüå",
  "πüôπéåπü▓πéÖ",
  "πüôπéêπüä",
  "πüôπéêπüå",
  "πüôπéèπéï",
  "πüôπéîπüÅπüùπéçπéô",
  "πüôπéìπüúπüæ",
  "πüôπéÅπééπüª",
  "πüôπéÅπéîπéï",
  "πüôπéôπüäπéô",
  "πüôπéôπüïπüä",
  "πüôπéôπüì",
  "πüôπéôπüùπéàπüå",
  "πüôπéôπüÖπüä",
  "πüôπéôπüƒπéÖπüª",
  "πüôπéôπü¿πéô",
  "πüôπéôπü¬πéô",
  "πüôπéôπü▓πéÖπü½",
  "πüôπéôπü╗πéÜπéô",
  "πüôπéôπü╛πüæ",
  "πüôπéôπéä",
  "πüôπéôπéîπüä",
  "πüôπéôπéÅπüÅ",
  "πüòπéÖπüäπüêπüì",
  "πüòπüäπüïπüä",
  "πüòπüäπüìπéô",
  "πüòπéÖπüäπüæπéÖπéô",
  "πüòπéÖπüäπüô",
  "πüòπüäπüùπéç",
  "πüòπüäπü¢πüä",
  "πüòπéÖπüäπüƒπüÅ",
  "πüòπéÖπüäπüíπéàπüå",
  "πüòπüäπüªπüì",
  "πüòπéÖπüäπéèπéçπüå",
  "πüòπüåπü¬",
  "πüòπüïπüäπüù",
  "πüòπüïπéÖπüÖ",
  "πüòπüïπü¬",
  "πüòπüïπü┐πüí",
  "πüòπüïπéÖπéï",
  "πüòπüìπéÖπéçπüå",
  "πüòπüÅπüù",
  "πüòπüÅπü▓πéô",
  "πüòπüÅπéë",
  "πüòπüôπüÅ",
  "πüòπüôπüñ",
  "πüòπüÖπéÖπüïπéï",
  "πüòπéÖπü¢πüì",
  "πüòπüƒπéô",
  "πüòπüñπüêπüä",
  "πüòπéÖπüñπüèπéô",
  "πüòπéÖπüúπüï",
  "πüòπéÖπüñπüïπéÖπüÅ",
  "πüòπüúπüìπéçπüÅ",
  "πüòπéÖπüúπüù",
  "πüòπüñπüùπéÖπéô",
  "πüòπéÖπüúπü¥πüå",
  "πüòπüñπüƒπü»πéÖ",
  "πüòπüñπü╛πüäπéé",
  "πüòπüªπüä",
  "πüòπü¿πüäπéé",
  "πüòπü¿πüå",
  "πüòπü¿πüèπéä",
  "πüòπü¿πüù",
  "πüòπü¿πéï",
  "πüòπü«πüå",
  "πüòπü»πéÖπüÅ",
  "πüòπü▓πéÖπüùπüä",
  "πüòπü╕πéÖπüñ",
  "πüòπü╗πüå",
  "πüòπü╗πü¿πéÖ",
  "πüòπü╛πüÖ",
  "πüòπü┐πüùπüä",
  "πüòπü┐πüƒπéÖπéî",
  "πüòπéÇπüæ",
  "πüòπéüπéï",
  "πüòπéäπüêπéôπü¿πéÖπüå",
  "πüòπéåπüå",
  "πüòπéêπüå",
  "πüòπéêπüÅ",
  "πüòπéëπüƒπéÖ",
  "πüòπéÖπéïπü¥πü»πéÖ",
  "πüòπéÅπéäπüï",
  "πüòπéÅπéï",
  "πüòπéôπüäπéô",
  "πüòπéôπüï",
  "πüòπéôπüìπéâπüÅ",
  "πüòπéôπüôπüå",
  "πüòπéôπüòπüä",
  "πüòπéÖπéôπüùπéç",
  "πüòπéôπüÖπüå",
  "πüòπéôπü¢πüä",
  "πüòπéôπü¥",
  "πüòπéôπüí",
  "πüòπéôπü╛",
  "πüòπéôπü┐",
  "πüòπéôπéëπéô",
  "πüùπüéπüä",
  "πüùπüéπüæπéÖ",
  "πüùπüéπüòπüúπüª",
  "πüùπüéπéÅπü¢",
  "πüùπüäπüÅ",
  "πüùπüäπéô",
  "πüùπüåπüí",
  "πüùπüêπüä",
  "πüùπüèπüæ",
  "πüùπüïπüä",
  "πüùπüïπüÅ",
  "πüùπéÖπüïπéô",
  "πüùπüôπéÖπü¿",
  "πüùπüÖπüå",
  "πüùπéÖπüƒπéÖπüä",
  "πüùπüƒπüåπüæ",
  "πüùπüƒπüìπéÖ",
  "πüùπüƒπüª",
  "πüùπüƒπü┐",
  "πüùπüíπéçπüå",
  "πüùπüíπéèπéô",
  "πüùπüúπüïπéè",
  "πüùπüñπüùπéÖ",
  "πüùπüñπééπéô",
  "πüùπüªπüä",
  "πüùπüªπüì",
  "πüùπüªπüñ",
  "πüùπéÖπüªπéô",
  "πüùπéÖπü¿πéÖπüå",
  "πüùπü¬πüìπéÖπéî",
  "πüùπü¬πééπü«",
  "πüùπü¬πéô",
  "πüùπü¡πü╛",
  "πüùπü¡πéô",
  "πüùπü«πüÅπéÖ",
  "πüùπü«πü╡πéÖ",
  "πüùπü»πüä",
  "πüùπü»πéÖπüïπéè",
  "πüùπü»πüñ",
  "πüùπü»πéëπüä",
  "πüùπü»πéô",
  "πüùπü▓πéçπüå",
  "πüùπü╡πüÅ",
  "πüùπéÖπü╡πéÖπéô",
  "πüùπü╕πüä",
  "πüùπü╗πüå",
  "πüùπü╗πéô",
  "πüùπü╛πüå",
  "πüùπü╛πéï",
  "πüùπü┐πéô",
  "πüùπéÇπüæπéï",
  "πüùπéÖπéÇπüùπéç",
  "πüùπéüπüä",
  "πüùπéüπéï",
  "πüùπééπéô",
  "πüùπéâπüäπéô",
  "πüùπéâπüåπéô",
  "πüùπéâπüèπéô",
  "πüùπéÖπéâπüïπéÖπüäπéé",
  "πüùπéäπüÅπüùπéç",
  "πüùπéâπüÅπü╗πüå",
  "πüùπéâπüæπéô",
  "πüùπéâπüô",
  "πüùπéâπüòπéÖπüä",
  "πüùπéâπüùπéô",
  "πüùπéâπü¢πéô",
  "πüùπéâπü¥πüå",
  "πüùπéâπüƒπüä",
  "πüùπéâπüíπéçπüå",
  "πüùπéâπüúπüìπéô",
  "πüùπéÖπéâπü╛",
  "πüùπéâπéèπéô",
  "πüùπéâπéîπüä",
  "πüùπéÖπéåπüå",
  "πüùπéÖπéàπüåπüùπéç",
  "πüùπéàπüÅπü»πüÅ",
  "πüùπéÖπéàπüùπéô",
  "πüùπéàπüúπü¢πüì",
  "πüùπéàπü┐",
  "πüùπéàπéëπü»πéÖ",
  "πüùπéÖπéàπéôπü»πéÖπéô",
  "πüùπéçπüåπüïπüä",
  "πüùπéçπüÅπüƒπüÅ",
  "πüùπéçπüúπüæπéô",
  "πüùπéçπü¿πéÖπüå",
  "πüùπéçπééπüñ",
  "πüùπéëπü¢πéï",
  "πüùπéëπü╕πéÖπéï",
  "πüùπéôπüï",
  "πüùπéôπüôπüå",
  "πüùπéÖπéôπüùπéÖπéâ",
  "πüùπéôπü¢πüäπüùπéÖ",
  "πüùπéôπüíπüÅ",
  "πüùπéôπéèπéô",
  "πüÖπüéπüæπéÖ",
  "πüÖπüéπüù",
  "πüÖπüéπü¬",
  "πüÖπéÖπüéπéô",
  "πüÖπüäπüêπüä",
  "πüÖπüäπüï",
  "πüÖπüäπü¿πüå",
  "πüÖπéÖπüäπü╡πéÖπéô",
  "πüÖπüäπéêπüåπü▓πéÖ",
  "πüÖπüåπüïπéÖπüÅ",
  "πüÖπüåπüùπéÖπüñ",
  "πüÖπüåπü¢πéô",
  "πüÖπüèπü¿πéÖπéè",
  "πüÖπüìπü╛",
  "πüÖπüÅπüå",
  "πüÖπüÅπü¬πüä",
  "πüÖπüæπéï",
  "πüÖπüôπéÖπüä",
  "πüÖπüôπüù",
  "πüÖπéÖπüòπéô",
  "πüÖπüÖπéÖπüùπüä",
  "πüÖπüÖπéÇ",
  "πüÖπüÖπéüπéï",
  "πüÖπüúπüïπéè",
  "πüÖπéÖπüúπüùπéè",
  "πüÖπéÖπüúπü¿",
  "πüÖπüªπüì",
  "πüÖπüªπéï",
  "πüÖπü¡πéï",
  "πüÖπü«πüô",
  "πüÖπü»πüƒπéÖ",
  "πüÖπü»πéÖπéëπüùπüä",
  "πüÖπéÖπü▓πéçπüå",
  "πüÖπéÖπü╡πéÖπü¼πéî",
  "πüÖπü╡πéÖπéè",
  "πüÖπü╡πéî",
  "πüÖπü╕πéÖπüª",
  "πüÖπü╕πéÖπéï",
  "πüÖπéÖπü╗πüå",
  "πüÖπü╗πéÖπéô",
  "πüÖπü╛πüä",
  "πüÖπéüπüù",
  "πüÖπééπüå",
  "πüÖπéäπüì",
  "πüÖπéëπüÖπéë",
  "πüÖπéïπéü",
  "πüÖπéîπüíπüïπéÖπüå",
  "πüÖπéìπüúπü¿",
  "πüÖπéÅπéï",
  "πüÖπéôπü¢πéÖπéô",
  "πüÖπéôπü╗πéÜπüå",
  "πü¢πüéπü╡πéÖπéë",
  "πü¢πüäπüïπüñ",
  "πü¢πüäπüæπéÖπéô",
  "πü¢πüäπüùπéÖ",
  "πü¢πüäπéêπüå",
  "πü¢πüèπüå",
  "πü¢πüïπüäπüïπéô",
  "πü¢πüìπü½πéô",
  "πü¢πüìπéÇ",
  "πü¢πüìπéå",
  "πü¢πüìπéëπéôπüåπéô",
  "πü¢πüæπéô",
  "πü¢πüôπüå",
  "πü¢πüÖπüùπéÖ",
  "πü¢πüƒπüä",
  "πü¢πüƒπüæ",
  "πü¢πüúπüïπüÅ",
  "πü¢πüúπüìπéâπüÅ",
  "πü¢πéÖπüúπüÅ",
  "πü¢πüúπüæπéô",
  "πü¢πüúπüôπüñ",
  "πü¢πüúπüòπüƒπüÅπü╛",
  "πü¢πüñπü¥πéÖπüÅ",
  "πü¢πüñπüƒπéÖπéô",
  "πü¢πüñπüªπéÖπéô",
  "πü¢πüúπü»πéÜπéô",
  "πü¢πüñπü▓πéÖ",
  "πü¢πüñπü╡πéÖπéô",
  "πü¢πüñπéüπüä",
  "πü¢πüñπéèπüñ",
  "πü¢πü¬πüï",
  "πü¢πü«πü▓πéÖ",
  "πü¢πü»πü»πéÖ",
  "πü¢πü▓πéÖπéì",
  "πü¢πü╗πéÖπü¡",
  "πü¢πü╛πüä",
  "πü¢πü╛πéï",
  "πü¢πéüπéï",
  "πü¢πééπüƒπéî",
  "πü¢πéèπü╡",
  "πü¢πéÖπéôπüéπüÅ",
  "πü¢πéôπüä",
  "πü¢πéôπüêπüä",
  "πü¢πéôπüï",
  "πü¢πéôπüìπéç",
  "πü¢πéôπüÅ",
  "πü¢πéôπüæπéÖπéô",
  "πü¢πéÖπéôπüôπéÖ",
  "πü¢πéôπüòπüä",
  "πü¢πéôπüùπéà",
  "πü¢πéôπüÖπüä",
  "πü¢πéôπü¢πüä",
  "πü¢πéôπü¥πéÖ",
  "πü¢πéôπüƒπüÅ",
  "πü¢πéôπüíπéçπüå",
  "πü¢πéôπüªπüä",
  "πü¢πéôπü¿πüå",
  "πü¢πéôπü¼πüì",
  "πü¢πéôπü¡πéô",
  "πü¢πéôπü»πéÜπüä",
  "πü¢πéÖπéôπü╡πéÖ",
  "πü¢πéÖπéôπü╗πéÜπüå",
  "πü¢πéôπéÇ",
  "πü¢πéôπéüπéôπüùπéÖπéç",
  "πü¢πéôπééπéô",
  "πü¢πéôπéäπüÅ",
  "πü¢πéôπéåπüå",
  "πü¢πéôπéêπüå",
  "πü¢πéÖπéôπéë",
  "πü¢πéÖπéôπéèπéâπüÅ",
  "πü¢πéôπéîπüä",
  "πü¢πéôπéì",
  "πü¥πüéπüÅ",
  "πü¥πüäπü¿πüæπéÖπéï",
  "πü¥πüäπü¡",
  "πü¥πüåπüïπéÖπéôπüìπéçπüå",
  "πü¥πüåπüì",
  "πü¥πüåπüôπéÖ",
  "πü¥πüåπüùπéô",
  "πü¥πüåπüƒπéÖπéô",
  "πü¥πüåπü¬πéô",
  "πü¥πüåπü▓πéÖ",
  "πü¥πüåπéüπéô",
  "πü¥πüåπéè",
  "πü¥πüêπééπü«",
  "πü¥πüêπéô",
  "πü¥πüïπéÖπüä",
  "πü¥πüæπéÖπüì",
  "πü¥πüôπüå",
  "πü¥πüôπü¥πüô",
  "πü¥πüòπéÖπüä",
  "πü¥πüùπü¬",
  "πü¥πü¢πüä",
  "πü¥πü¢πéô",
  "πü¥πü¥πüÅπéÖ",
  "πü¥πüƒπéÖπüªπéï",
  "πü¥πüñπüå",
  "πü¥πüñπüêπéô",
  "πü¥πüúπüïπéô",
  "πü¥πüñπüìπéÖπéçπüå",
  "πü¥πüúπüæπüñ",
  "πü¥πüúπüôπüå",
  "πü¥πüúπü¢πéô",
  "πü¥πüúπü¿",
  "πü¥πü¿πüïπéÖπéÅ",
  "πü¥πü¿πüñπéÖπéë",
  "πü¥πü¬πüêπéï",
  "πü¥πü¬πüƒ",
  "πü¥πü╡πü╗πéÖ",
  "πü¥πü╗πéÖπüÅ",
  "πü¥πü╗πéÖπéì",
  "πü¥πü╛πüñ",
  "πü¥πü╛πéï",
  "πü¥πéÇπüÅ",
  "πü¥πéÇπéèπüê",
  "πü¥πéüπéï",
  "πü¥πééπü¥πéé",
  "πü¥πéêπüïπü¢πéÖ",
  "πü¥πéëπü╛πéü",
  "πü¥πéìπüå",
  "πü¥πéôπüïπüä",
  "πü¥πéôπüæπüä",
  "πü¥πéôπüòπéÖπüä",
  "πü¥πéôπüùπüñ",
  "πü¥πéôπü¥πéÖπüÅ",
  "πü¥πéôπüíπéçπüå",
  "πü¥πéÖπéôπü▓πéÖ",
  "πü¥πéÖπéôπü╡πéÖπéô",
  "πü¥πéôπü┐πéô",
  "πüƒπüéπüä",
  "πüƒπüäπüäπéô",
  "πüƒπüäπüåπéô",
  "πüƒπüäπüêπüì",
  "πüƒπüäπüèπüå",
  "πüƒπéÖπüäπüïπéÖπüÅ",
  "πüƒπüäπüì",
  "πüƒπüäπüÅπéÖπüå",
  "πüƒπüäπüæπéô",
  "πüƒπüäπüô",
  "πüƒπüäπüòπéÖπüä",
  "πüƒπéÖπüäπüùπéÖπéçπüåπü╡πéÖ",
  "πüƒπéÖπüäπüÖπüì",
  "πüƒπüäπü¢πüñ",
  "πüƒπüäπü¥πüå",
  "πüƒπéÖπüäπüƒπüä",
  "πüƒπüäπüíπéçπüå",
  "πüƒπüäπüªπüä",
  "πüƒπéÖπüäπü¿πéÖπüôπéì",
  "πüƒπüäπü¬πüä",
  "πüƒπüäπü¡πüñ",
  "πüƒπüäπü«πüå",
  "πüƒπüäπü»πéô",
  "πüƒπéÖπüäπü▓πéçπüå",
  "πüƒπüäπü╡πüå",
  "πüƒπüäπü╕πéô",
  "πüƒπüäπü╗",
  "πüƒπüäπü╛πüñπü»πéÖπü¬",
  "πüƒπüäπü┐πéôπüÅπéÖ",
  "πüƒπüäπéÇ",
  "πüƒπüäπéüπéô",
  "πüƒπüäπéäπüì",
  "πüƒπüäπéêπüå",
  "πüƒπüäπéë",
  "πüƒπüäπéèπéçπüÅ",
  "πüƒπüäπéï",
  "πüƒπüäπéÅπéô",
  "πüƒπüåπüê",
  "πüƒπüêπéï",
  "πüƒπüèπüÖ",
  "πüƒπüèπéï",
  "πüƒπüèπéîπéï",
  "πüƒπüïπüä",
  "πüƒπüïπü¡",
  "πüƒπüìπü▓πéÖ",
  "πüƒπüÅπüòπéô",
  "πüƒπüôπüÅ",
  "πüƒπüôπéäπüì",
  "πüƒπüòπüä",
  "πüƒπüùπüòπéÖπéô",
  "πüƒπéÖπüùπéÖπéâπéî",
  "πüƒπüÖπüæπéï",
  "πüƒπüÖπéÖπüòπéÅπéï",
  "πüƒπü¥πüïπéÖπéî",
  "πüƒπüƒπüïπüå",
  "πüƒπüƒπüÅ",
  "πüƒπüƒπéÖπüùπüä",
  "πüƒπüƒπü┐",
  "πüƒπüíπü»πéÖπü¬",
  "πüƒπéÖπüúπüïπüä",
  "πüƒπéÖπüúπüìπéâπüÅ",
  "πüƒπéÖπüúπüô",
  "πüƒπéÖπüúπüùπéàπüñ",
  "πüƒπéÖπüúπüƒπüä",
  "πüƒπüªπéï",
  "πüƒπü¿πüêπéï",
  "πüƒπü¬πü»πéÖπüƒ",
  "πüƒπü½πéô",
  "πüƒπü¼πüì",
  "πüƒπü«πüùπü┐",
  "πüƒπü»πüñ",
  "πüƒπü╡πéÖπéô",
  "πüƒπü╕πéÖπéï",
  "πüƒπü╗πéÖπüå",
  "πüƒπü╛πüôπéÖ",
  "πüƒπü╛πéï",
  "πüƒπéÖπéÇπéï",
  "πüƒπéüπüäπüì",
  "πüƒπéüπüÖ",
  "πüƒπéüπéï",
  "πüƒπééπüñ",
  "πüƒπéäπüÖπüä",
  "πüƒπéêπéï",
  "πüƒπéëπüÖ",
  "πüƒπéèπüìπü╗πéôπüïπéÖπéô",
  "πüƒπéèπéçπüå",
  "πüƒπéèπéï",
  "πüƒπéïπü¿",
  "πüƒπéîπéï",
  "πüƒπéîπéôπü¿",
  "πüƒπéìπüúπü¿",
  "πüƒπéÅπéÇπéîπéï",
  "πüƒπéÖπéôπüéπüñ",
  "πüƒπéôπüä",
  "πüƒπéôπüèπéô",
  "πüƒπéôπüï",
  "πüƒπéôπüì",
  "πüƒπéôπüæπéô",
  "πüƒπéôπüôπéÖ",
  "πüƒπéôπüòπéô",
  "πüƒπéôπüùπéÖπéçπüåπü▓πéÖ",
  "πüƒπéÖπéôπü¢πüä",
  "πüƒπéôπü¥πüÅ",
  "πüƒπéôπüƒπüä",
  "πüƒπéÖπéôπüí",
  "πüƒπéôπüªπüä",
  "πüƒπéôπü¿πüå",
  "πüƒπéÖπéôπü¬",
  "πüƒπéôπü½πéô",
  "πüƒπéÖπéôπü¡πüñ",
  "πüƒπéôπü«πüå",
  "πüƒπéôπü▓πéÜπéô",
  "πüƒπéÖπéôπü╗πéÖπüå",
  "πüƒπéôπü╛πüñ",
  "πüƒπéôπéüπüä",
  "πüƒπéÖπéôπéîπüñ",
  "πüƒπéÖπéôπéì",
  "πüƒπéÖπéôπéÅ",
  "πüíπüéπüä",
  "πüíπüéπéô",
  "πüíπüäπüì",
  "πüíπüäπüòπüä",
  "πüíπüêπéô",
  "πüíπüïπüä",
  "πüíπüïπéë",
  "πüíπüìπéàπüå",
  "πüíπüìπéô",
  "πüíπüæπüäπüÖπéÖ",
  "πüíπüæπéô",
  "πüíπüôπüÅ",
  "πüíπüòπüä",
  "πüíπüùπüì",
  "πüíπüùπéèπéçπüå",
  "πüíπü¢πüä",
  "πüíπü¥πüå",
  "πüíπüƒπüä",
  "πüíπüƒπéô",
  "πüíπüíπüèπéä",
  "πüíπüñπüùπéÖπéç",
  "πüíπüªπüì",
  "πüíπüªπéô",
  "πüíπü¼πüì",
  "πüíπü¼πéè",
  "πüíπü«πüå",
  "πüíπü▓πéçπüå",
  "πüíπü╕πüäπü¢πéô",
  "πüíπü╗πüå",
  "πüíπü╛πüƒ",
  "πüíπü┐πüñ",
  "πüíπü┐πü¿πéÖπéì",
  "πüíπéüπüäπü¿πéÖ",
  "πüíπéâπéôπüôπü¬πü╕πéÖ",
  "πüíπéàπüåπüä",
  "πüíπéåπéèπéçπüÅ",
  "πüíπéçπüåπüù",
  "πüíπéçπüòπüÅπüæπéô",
  "πüíπéëπüù",
  "πüíπéëπü┐",
  "πüíπéèπüïπéÖπü┐",
  "πüíπéèπéçπüå",
  "πüíπéïπü¿πéÖ",
  "πüíπéÅπéÅ",
  "πüíπéôπüƒπüä",
  "πüíπéôπééπüÅ",
  "πüñπüäπüï",
  "πüñπüäπüƒπüí",
  "πüñπüåπüï",
  "πüñπüåπüùπéÖπéçπüå",
  "πüñπüåπü»πéô",
  "πüñπüåπéÅ",
  "πüñπüïπüå",
  "πüñπüïπéîπéï",
  "πüñπüÅπü¡",
  "πüñπüÅπéï",
  "πüñπüæπü¡",
  "πüñπüæπéï",
  "πüñπüôπéÖπüå",
  "πüñπüƒπüêπéï",
  "πüñπüñπéÖπüÅ",
  "πüñπüñπüùπéÖ",
  "πüñπüñπéÇ",
  "πüñπü¿πéüπéï",
  "πüñπü¬πüïπéÖπéï",
  "πüñπü¬πü┐",
  "πüñπü¡πüñπéÖπü¡",
  "πüñπü«πéï",
  "πüñπü╡πéÖπüÖ",
  "πüñπü╛πéëπü¬πüä",
  "πüñπü╛πéï",
  "πüñπü┐πüì",
  "πüñπéüπüƒπüä",
  "πüñπééπéè",
  "πüñπééπéï",
  "πüñπéêπüä",
  "πüñπéïπü╗πéÖ",
  "πüñπéïπü┐πüÅ",
  "πüñπéÅπééπü«",
  "πüñπéÅπéè",
  "πüªπüéπüù",
  "πüªπüéπüª",
  "πüªπüéπü┐",
  "πüªπüäπüèπéô",
  "πüªπüäπüï",
  "πüªπüäπüì",
  "πüªπüäπüæπüä",
  "πüªπüäπüôπüÅ",
  "πüªπüäπüòπüñ",
  "πüªπüäπüù",
  "πüªπüäπü¢πüä",
  "πüªπüäπüƒπüä",
  "πüªπüäπü¿πéÖ",
  "πüªπüäπü¡πüä",
  "πüªπüäπü▓πéçπüå",
  "πüªπüäπü╕πéô",
  "πüªπüäπü╗πéÖπüå",
  "πüªπüåπüí",
  "πüªπüèπüÅπéî",
  "πüªπüìπü¿πüå",
  "πüªπüÅπü▓πéÖ",
  "πüªπéÖπüôπü╗πéÖπüô",
  "πüªπüòπüìπéÖπéçπüå",
  "πüªπüòπüæπéÖ",
  "πüªπüÖπéè",
  "πüªπü¥πüå",
  "πüªπüíπüïπéÖπüä",
  "πüªπüíπéçπüå",
  "πüªπüñπüïπéÖπüÅ",
  "πüªπüñπüñπéÖπüì",
  "πüªπéÖπüúπü»πéÜ",
  "πüªπüñπü╗πéÖπüå",
  "πüªπüñπéä",
  "πüªπéÖπü¼πüïπüê",
  "πüªπü¼πüì",
  "πüªπü¼πüÅπéÖπüä",
  "πüªπü«πü▓πéë",
  "πüªπü»πüä",
  "πüªπü╡πéÖπüÅπéì",
  "πüªπü╡πüƒπéÖ",
  "πüªπü╗πü¿πéÖπüì",
  "πüªπü╗πéô",
  "πüªπü╛πüê",
  "πüªπü╛πüìπüÖπéÖπüù",
  "πüªπü┐πüùπéÖπüï",
  "πüªπü┐πéäπüæπéÖ",
  "πüªπéëπüÖ",
  "πüªπéîπü▓πéÖ",
  "πüªπéÅπüæ",
  "πüªπéÅπüƒπüù",
  "πüªπéÖπéôπüéπüñ",
  "πüªπéôπüäπéô",
  "πüªπéôπüïπüä",
  "πüªπéôπüì",
  "πüªπéôπüÅπéÖ",
  "πüªπéôπüæπéô",
  "πüªπéôπüôπéÖπüÅ",
  "πüªπéôπüòπüä",
  "πüªπéôπüù",
  "πüªπéôπüÖπüå",
  "πüªπéÖπéôπüí",
  "πüªπéôπüªπüì",
  "πüªπéôπü¿πüå",
  "πüªπéôπü¬πüä",
  "πüªπéôπü╡πéÜπéë",
  "πüªπéôπü╗πéÖπüåπüƒπéÖπüä",
  "πüªπéôπéüπüñ",
  "πüªπéôπéëπéôπüïπüä",
  "πüªπéÖπéôπéèπéçπüÅ",
  "πüªπéÖπéôπéÅ",
  "πü¿πéÖπüéπüä",
  "πü¿πüäπéî",
  "πü¿πéÖπüåπüïπéô",
  "πü¿πüåπüìπéàπüå",
  "πü¿πéÖπüåπüÅπéÖ",
  "πü¿πüåπüù",
  "πü¿πüåπéÇπüìπéÖ",
  "πü¿πüèπüä",
  "πü¿πüèπüï",
  "πü¿πüèπüÅ",
  "πü¿πüèπüÖ",
  "πü¿πüèπéï",
  "πü¿πüïπüä",
  "πü¿πüïπüÖ",
  "πü¿πüìπüèπéè",
  "πü¿πüìπü¿πéÖπüì",
  "πü¿πüÅπüä",
  "πü¿πüÅπüùπéàπüå",
  "πü¿πüÅπüªπéô",
  "πü¿πüÅπü½",
  "πü¿πüÅπü╕πéÖπüñ",
  "πü¿πüæπüä",
  "πü¿πüæπéï",
  "πü¿πüôπéä",
  "πü¿πüòπüï",
  "πü¿πüùπéçπüïπéô",
  "πü¿πü¥πüå",
  "πü¿πüƒπéô",
  "πü¿πüíπéàπüå",
  "πü¿πüúπüìπéàπüå",
  "πü¿πüúπüÅπéô",
  "πü¿πüñπü¢πéÖπéô",
  "πü¿πüñπü½πéàπüå",
  "πü¿πü¿πéÖπüæπéï",
  "πü¿πü¿πü«πüêπéï",
  "πü¿πü¬πüä",
  "πü¿πü¬πüêπéï",
  "πü¿πü¬πéè",
  "πü¿πü«πüòπü╛",
  "πü¿πü»πéÖπüÖ",
  "πü¿πéÖπü╡πéÖπüïπéÖπéÅ",
  "πü¿πü╗πüå",
  "πü¿πü╛πéï",
  "πü¿πéüπéï",
  "πü¿πééπüƒπéÖπüí",
  "πü¿πééπéï",
  "πü¿πéÖπéêπüåπü▓πéÖ",
  "πü¿πéëπüêπéï",
  "πü¿πéôπüïπüñ",
  "πü¿πéÖπéôπü╡πéÖπéè",
  "πü¬πüäπüïπüÅ",
  "πü¬πüäπüôπüå",
  "πü¬πüäπüùπéç",
  "πü¬πüäπüÖ",
  "πü¬πüäπü¢πéô",
  "πü¬πüäπü¥πüå",
  "πü¬πüèπüÖ",
  "πü¬πüïπéÖπüä",
  "πü¬πüÅπüÖ",
  "πü¬πüæπéÖπéï",
  "πü¬πüôπüåπü¿πéÖ",
  "πü¬πüòπüæ",
  "πü¬πüƒπüªπéÖπüôπüô",
  "πü¬πüúπü¿πüå",
  "πü¬πüñπéäπüÖπü┐",
  "πü¬πü¬πüèπüù",
  "πü¬πü½πüôπéÖπü¿",
  "πü¬πü½πééπü«",
  "πü¬πü½πéÅ",
  "πü¬πü«πüï",
  "πü¬πü╡πüƒπéÖ",
  "πü¬πü╛πüäπüì",
  "πü¬πü╛πüê",
  "πü¬πü╛πü┐",
  "πü¬πü┐πüƒπéÖ",
  "πü¬πéüπéëπüï",
  "πü¬πéüπéï",
  "πü¬πéäπéÇ",
  "πü¬πéëπüå",
  "πü¬πéëπü▓πéÖ",
  "πü¬πéëπü╡πéÖ",
  "πü¬πéîπéï",
  "πü¬πéÅπü¿πü▓πéÖ",
  "πü¬πéÅπü»πéÖπéè",
  "πü½πüéπüå",
  "πü½πüäπüïπéÖπüƒ",
  "πü½πüåπüæ",
  "πü½πüèπüä",
  "πü½πüïπüä",
  "πü½πüïπéÖπüª",
  "πü½πüìπü▓πéÖ",
  "πü½πüÅπüùπü┐",
  "πü½πüÅπü╛πéô",
  "πü½πüæπéÖπéï",
  "πü½πüòπéôπüïπüƒπéôπü¥",
  "πü½πüùπüì",
  "πü½πü¢πééπü«",
  "πü½πüíπüùπéÖπéçπüå",
  "πü½πüíπéêπüåπü▓πéÖ",
  "πü½πüúπüï",
  "πü½πüúπüì",
  "πü½πüúπüæπüä",
  "πü½πüúπüôπüå",
  "πü½πüúπüòπéô",
  "πü½πüúπüùπéçπüÅ",
  "πü½πüúπüÖπüå",
  "πü½πüúπü¢πüì",
  "πü½πüúπüªπüä",
  "πü½πü¬πüå",
  "πü½πü╗πéô",
  "πü½πü╛πéü",
  "πü½πééπüñ",
  "πü½πéäπéè",
  "πü½πéàπüåπüäπéô",
  "πü½πéèπéôπüùπéâ",
  "πü½πéÅπü¿πéè",
  "πü½πéôπüä",
  "πü½πéôπüï",
  "πü½πéôπüì",
  "πü½πéôπüæπéÖπéô",
  "πü½πéôπüùπüì",
  "πü½πéôπüÖπéÖπüå",
  "πü½πéôπü¥πüå",
  "πü½πéôπüƒπüä",
  "πü½πéôπüí",
  "πü½πéôπüªπüä",
  "πü½πéôπü½πüÅ",
  "πü½πéôπü╡πéÜ",
  "πü½πéôπü╛πéè",
  "πü½πéôπéÇ",
  "πü½πéôπéüπüä",
  "πü½πéôπéêπüå",
  "πü¼πüäπüÅπüìπéÖ",
  "πü¼πüïπüÖ",
  "πü¼πüÅπéÖπüäπü¿πéï",
  "πü¼πüÅπéÖπüå",
  "πü¼πüÅπééπéè",
  "πü¼πüÖπéÇ",
  "πü¼πü╛πüêπü▓πéÖ",
  "πü¼πéüπéè",
  "πü¼πéëπüÖ",
  "πü¼πéôπüíπéâπüÅ",
  "πü¡πüéπüæπéÖ",
  "πü¡πüäπüì",
  "πü¡πüäπéï",
  "πü¡πüäπéì",
  "πü¡πüÅπéÖπü¢",
  "πü¡πüÅπüƒπüä",
  "πü¡πüÅπéë",
  "πü¡πüôπü¢πéÖ",
  "πü¡πüôπéÇ",
  "πü¡πüòπüæπéÖ",
  "πü¡πüÖπüôπéÖπüÖ",
  "πü¡πü¥πü╕πéÖπéï",
  "πü¡πüƒπéÖπéô",
  "πü¡πüñπüä",
  "πü¡πüúπüùπéô",
  "πü¡πüñπü¥πéÖπüå",
  "πü¡πüúπüƒπüäπüìπéÖπéç",
  "πü¡πü╡πéÖπü¥πüÅ",
  "πü¡πü╡πüƒπéÖ",
  "πü¡πü╗πéÖπüå",
  "πü¡πü╗πéèπü»πü╗πéè",
  "πü¡πü╛πüì",
  "πü¡πü╛πéÅπüù",
  "πü¡πü┐πü┐",
  "πü¡πéÇπüä",
  "πü¡πéÇπüƒπüä",
  "πü¡πééπü¿",
  "πü¡πéëπüå",
  "πü¡πéÅπüòπéÖ",
  "πü¡πéôπüäπéè",
  "πü¡πéôπüèπüù",
  "πü¡πéôπüïπéô",
  "πü¡πéôπüìπéô",
  "πü¡πéôπüÅπéÖ",
  "πü¡πéôπüòπéÖ",
  "πü¡πéôπüù",
  "πü¡πéôπüíπéâπüÅ",
  "πü¡πéôπü¿πéÖ",
  "πü¡πéôπü▓πéÜ",
  "πü¡πéôπü╡πéÖπüñ",
  "πü¡πéôπü╛πüñ",
  "πü¡πéôπéèπéçπüå",
  "πü¡πéôπéîπüä",
  "πü«πüäπüÖπéÖ",
  "πü«πüèπüñπéÖπü╛",
  "πü«πüïπéÖπüÖ",
  "πü«πüìπü¬πü┐",
  "πü«πüôπüìπéÖπéè",
  "πü«πüôπüÖ",
  "πü«πüôπéï",
  "πü«πü¢πéï",
  "πü«πü¥πéÖπüÅ",
  "πü«πü¥πéÖπéÇ",
  "πü«πüƒπü╛πüå",
  "πü«πüíπü╗πü¿πéÖ",
  "πü«πüúπüÅ",
  "πü«πü»πéÖπüÖ",
  "πü«πü»πéë",
  "πü«πü╕πéÖπéï",
  "πü«πü╗πéÖπéï",
  "πü«πü┐πééπü«",
  "πü«πéäπü╛",
  "πü«πéëπüäπü¼",
  "πü«πéëπü¡πüô",
  "πü«πéèπééπü«",
  "πü«πéèπéåπüì",
  "πü«πéîπéô",
  "πü«πéôπüì",
  "πü»πéÖπüéπüä",
  "πü»πüéπüÅ",
  "πü»πéÖπüéπüòπéô",
  "πü»πéÖπüäπüï",
  "πü»πéÖπüäπüÅ",
  "πü»πüäπüæπéô",
  "πü»πüäπüôπéÖ",
  "πü»πüäπüùπéô",
  "πü»πüäπüÖπüä",
  "πü»πüäπü¢πéô",
  "πü»πüäπü¥πüå",
  "πü»πüäπüí",
  "πü»πéÖπüäπü»πéÖπüä",
  "πü»πüäπéîπüñ",
  "πü»πüêπéï",
  "πü»πüèπéï",
  "πü»πüïπüä",
  "πü»πéÖπüïπéè",
  "πü»πüïπéï",
  "πü»πüÅπüùπéà",
  "πü»πüæπéô",
  "πü»πüôπü╡πéÖ",
  "πü»πüòπü┐",
  "πü»πüòπéô",
  "πü»πüùπüôπéÖ",
  "πü»πéÖπüùπéç",
  "πü»πüùπéï",
  "πü»πü¢πéï",
  "πü»πéÜπü¥πüôπéô",
  "πü»πü¥πéô",
  "πü»πüƒπéô",
  "πü»πüíπü┐πüñ",
  "πü»πüñπüèπéô",
  "πü»πüúπüïπüÅ",
  "πü»πüñπéÖπüì",
  "πü»πüúπüìπéè",
  "πü»πüúπüÅπüñ",
  "πü»πüúπüæπéô",
  "πü»πüúπüôπüå",
  "πü»πüúπüòπéô",
  "πü»πüúπüùπéô",
  "πü»πüúπüƒπüñ",
  "πü»πüúπüíπéàπüå",
  "πü»πüúπüªπéô",
  "πü»πüúπü▓πéÜπéçπüå",
  "πü»πüúπü╗πéÜπüå",
  "πü»πü¬πüÖ",
  "πü»πü¬πü▓πéÖ",
  "πü»πü½πüïπéÇ",
  "πü»πü╡πéÖπéëπüù",
  "πü»πü┐πüïπéÖπüì",
  "πü»πéÇπüïπüå",
  "πü»πéüπüñ",
  "πü»πéäπüä",
  "πü»πéäπüù",
  "πü»πéëπüå",
  "πü»πéìπüåπüâπéô",
  "πü»πéÅπüä",
  "πü»πéôπüä",
  "πü»πéôπüêπüä",
  "πü»πéôπüèπéô",
  "πü»πéôπüïπüÅ",
  "πü»πéôπüìπéçπüå",
  "πü»πéÖπéôπüÅπéÖπü┐",
  "πü»πéôπüô",
  "πü»πéôπüùπéâ",
  "πü»πéôπüÖπüå",
  "πü»πéôπüƒπéÖπéô",
  "πü»πéÜπéôπüí",
  "πü»πéÜπéôπüñ",
  "πü»πéôπüªπüä",
  "πü»πéôπü¿πüù",
  "πü»πéôπü«πüå",
  "πü»πéôπü»πéÜ",
  "πü»πéôπü╡πéÖπéô",
  "πü»πéôπü╕πéÜπéô",
  "πü»πéôπü╗πéÖπüåπüì",
  "πü»πéôπéüπüä",
  "πü»πéôπéëπéô",
  "πü»πéôπéìπéô",
  "πü▓πüäπüì",
  "πü▓πüåπéô",
  "πü▓πüêπéï",
  "πü▓πüïπüÅ",
  "πü▓πüïπéè",
  "πü▓πüïπéï",
  "πü▓πüïπéô",
  "πü▓πüÅπüä",
  "πü▓πüæπüñ",
  "πü▓πüôπüåπüì",
  "πü▓πüôπüÅ",
  "πü▓πüòπüä",
  "πü▓πüòπüùπü╡πéÖπéè",
  "πü▓πüòπéô",
  "πü▓πéÖπüùπéÖπéàπüñπüïπéô",
  "πü▓πüùπéç",
  "πü▓πü¥πüï",
  "πü▓πü¥πéÇ",
  "πü▓πüƒπéÇπüì",
  "πü▓πüƒπéÖπéè",
  "πü▓πüƒπéï",
  "πü▓πüñπüìπéÖ",
  "πü▓πüúπüôπüù",
  "πü▓πüúπüù",
  "πü▓πüñπüùπéÖπéàπü▓πéô",
  "πü▓πüúπüÖ",
  "πü▓πüñπü¢πéÖπéô",
  "πü▓πéÜπüúπüƒπéè",
  "πü▓πéÜπüúπüíπéè",
  "πü▓πüñπéêπüå",
  "πü▓πüªπüä",
  "πü▓πü¿πüôπéÖπü┐",
  "πü▓πü¬πü╛πüñπéè",
  "πü▓πü¬πéô",
  "πü▓πü¡πéï",
  "πü▓πü»πéô",
  "πü▓πü▓πéÖπüÅ",
  "πü▓πü▓πéçπüå",
  "πü▓πü╗πüå",
  "πü▓πü╛πéÅπéè",
  "πü▓πü╛πéô",
  "πü▓πü┐πüñ",
  "πü▓πéüπüä",
  "πü▓πéüπüùπéÖπüù",
  "πü▓πéäπüæ",
  "πü▓πéäπüÖ",
  "πü▓πéêπüå",
  "πü▓πéÖπéçπüåπüì",
  "πü▓πéëπüïπéÖπü¬",
  "πü▓πéëπüÅ",
  "πü▓πéèπüñ",
  "πü▓πéèπéçπüå",
  "πü▓πéïπü╛",
  "πü▓πéïπéäπüÖπü┐",
  "πü▓πéîπüä",
  "πü▓πéìπüä",
  "πü▓πéìπüå",
  "πü▓πéìπüì",
  "πü▓πéìπéåπüì",
  "πü▓πéôπüïπüÅ",
  "πü▓πéôπüæπüñ",
  "πü▓πéôπüôπéô",
  "πü▓πéôπüùπéà",
  "πü▓πéôπü¥πüå",
  "πü▓πéÜπéôπüí",
  "πü▓πéôπü»πéÜπéô",
  "πü▓πéÖπéôπü╗πéÖπüå",
  "πü╡πüéπéô",
  "πü╡πüäπüåπüí",
  "πü╡πüåπüæπüä",
  "πü╡πüåπü¢πéô",
  "πü╡πéÜπüåπüƒπéìπüå",
  "πü╡πüåπü¿πüå",
  "πü╡πüåπü╡",
  "πü╡πüêπéï",
  "πü╡πüèπéô",
  "πü╡πüïπüä",
  "πü╡πüìπéô",
  "πü╡πüÅπüòπéÖπüñ",
  "πü╡πüÅπü╡πéÖπüÅπéì",
  "πü╡πüôπüå",
  "πü╡πüòπüä",
  "πü╡πüùπüìπéÖ",
  "πü╡πüùπéÖπü┐",
  "πü╡πüÖπü╛",
  "πü╡πü¢πüä",
  "πü╡πü¢πüÅπéÖ",
  "πü╡πü¥πüÅ",
  "πü╡πéÖπüƒπü½πüÅ",
  "πü╡πüƒπéô",
  "πü╡πüíπéçπüå",
  "πü╡πüñπüå",
  "πü╡πüñπüï",
  "πü╡πüúπüïπüñ",
  "πü╡πüúπüì",
  "πü╡πüúπüôπüÅ",
  "πü╡πéÖπü¿πéÖπüå",
  "πü╡πü¿πéï",
  "πü╡πü¿πéô",
  "πü╡πü«πüå",
  "πü╡πü»πüä",
  "πü╡πü▓πéçπüå",
  "πü╡πü╕πéô",
  "πü╡πü╛πéô",
  "πü╡πü┐πéô",
  "πü╡πéüπüñ",
  "πü╡πéüπéô",
  "πü╡πéêπüå",
  "πü╡πéèπüô",
  "πü╡πéèπéï",
  "πü╡πéïπüä",
  "πü╡πéôπüäπüì",
  "πü╡πéÖπéôπüïπéÖπüÅ",
  "πü╡πéÖπéôπüÅπéÖ",
  "πü╡πéôπüùπüñ",
  "πü╡πéÖπéôπü¢πüì",
  "πü╡πéôπü¥πüå",
  "πü╡πéÖπéôπü╗πéÜπüå",
  "πü╕πüäπüéπéô",
  "πü╕πüäπüèπéô",
  "πü╕πüäπüïπéÖπüä",
  "πü╕πüäπüì",
  "πü╕πüäπüæπéÖπéô",
  "πü╕πüäπüôπüå",
  "πü╕πüäπüò",
  "πü╕πüäπüùπéâ",
  "πü╕πüäπü¢πüñ",
  "πü╕πüäπü¥",
  "πü╕πüäπüƒπüÅ",
  "πü╕πüäπüªπéô",
  "πü╕πüäπü¡πüñ",
  "πü╕πüäπéÅ",
  "πü╕πüìπüïπéÖ",
  "πü╕πüôπéÇ",
  "πü╕πéÖπü½πüäπéì",
  "πü╕πéÖπü½πüùπéçπüåπüïπéÖ",
  "πü╕πéëπüÖ",
  "πü╕πéôπüïπéô",
  "πü╕πéÖπéôπüìπéçπüå",
  "πü╕πéÖπéôπüôπéÖπüù",
  "πü╕πéôπüòπüä",
  "πü╕πéôπüƒπüä",
  "πü╕πéÖπéôπéè",
  "πü╗πüéπéô",
  "πü╗πüäπüÅ",
  "πü╗πéÖπüåπüìπéÖπéç",
  "πü╗πüåπüôπüÅ",
  "πü╗πüåπü¥πüå",
  "πü╗πüåπü╗πüå",
  "πü╗πüåπééπéô",
  "πü╗πüåπéèπüñ",
  "πü╗πüêπéï",
  "πü╗πüèπéô",
  "πü╗πüïπéô",
  "πü╗πüìπéçπüå",
  "πü╗πéÖπüìπéô",
  "πü╗πüÅπéì",
  "πü╗πüæπüñ",
  "πü╗πüæπéô",
  "πü╗πüôπüå",
  "πü╗πüôπéï",
  "πü╗πüùπüä",
  "πü╗πüùπüñ",
  "πü╗πüùπéà",
  "πü╗πüùπéçπüå",
  "πü╗πü¢πüä",
  "πü╗πü¥πüä",
  "πü╗πü¥πüÅ",
  "πü╗πüƒπüª",
  "πü╗πüƒπéï",
  "πü╗πéÜπüíπü╡πéÖπüÅπéì",
  "πü╗πüúπüìπéçπüÅ",
  "πü╗πüúπüò",
  "πü╗πüúπüƒπéô",
  "πü╗πü¿πéôπü¿πéÖ",
  "πü╗πéüπéï",
  "πü╗πéôπüä",
  "πü╗πéôπüì",
  "πü╗πéôπüæ",
  "πü╗πéôπüùπüñ",
  "πü╗πéôπéäπüÅ",
  "πü╛πüäπü½πüí",
  "πü╛πüïπüä",
  "πü╛πüïπü¢πéï",
  "πü╛πüïπéÖπéï",
  "πü╛πüæπéï",
  "πü╛πüôπü¿",
  "πü╛πüòπüñ",
  "πü╛πüùπéÖπéü",
  "πü╛πüÖπüÅ",
  "πü╛πü¢πéÖπéï",
  "πü╛πüñπéè",
  "πü╛πü¿πéü",
  "πü╛πü¬πü╡πéÖ",
  "πü╛πü¼πüæ",
  "πü╛πü¡πüÅ",
  "πü╛πü╗πüå",
  "πü╛πééπéï",
  "πü╛πéåπüæπéÖ",
  "πü╛πéêπüå",
  "πü╛πéìπéäπüï",
  "πü╛πéÅπüÖ",
  "πü╛πéÅπéè",
  "πü╛πéÅπéï",
  "πü╛πéôπüïπéÖ",
  "πü╛πéôπüìπüñ",
  "πü╛πéôπü¥πéÖπüÅ",
  "πü╛πéôπü¬πüï",
  "πü┐πüäπéë",
  "πü┐πüåπüí",
  "πü┐πüêπéï",
  "πü┐πüïπéÖπüÅ",
  "πü┐πüïπüƒ",
  "πü┐πüïπéô",
  "πü┐πüæπéô",
  "πü┐πüôπéô",
  "πü┐πüùπéÖπüïπüä",
  "πü┐πüÖπüä",
  "πü┐πüÖπüêπéï",
  "πü┐πü¢πéï",
  "πü┐πüúπüï",
  "πü┐πüñπüïπéï",
  "πü┐πüñπüæπéï",
  "πü┐πüªπüä",
  "πü┐πü¿πéüπéï",
  "πü┐πü¬πü¿",
  "πü┐πü¬πü┐πüïπüòπüä",
  "πü┐πü¡πéëπéï",
  "πü┐πü«πüå",
  "πü┐πü«πüïπéÖπüÖ",
  "πü┐πü╗πéô",
  "πü┐πééπü¿",
  "πü┐πéäπüæπéÖ",
  "πü┐πéëπüä",
  "πü┐πéèπéçπüÅ",
  "πü┐πéÅπüÅ",
  "πü┐πéôπüï",
  "πü┐πéôπü¥πéÖπüÅ",
  "πéÇπüäπüï",
  "πéÇπüêπüì",
  "πéÇπüêπéô",
  "πéÇπüïπüä",
  "πéÇπüïπüå",
  "πéÇπüïπüê",
  "πéÇπüïπüù",
  "πéÇπüìπéÖπüíπéâ",
  "πéÇπüæπéï",
  "πéÇπüæπéÖπéô",
  "πéÇπüòπü╗πéÖπéï",
  "πéÇπüùπüéπüñπüä",
  "πéÇπüùπü»πéÖ",
  "πéÇπüùπéÖπéàπéô",
  "πéÇπüùπéì",
  "πéÇπüÖπüå",
  "πéÇπüÖπüô",
  "πéÇπüÖπü╡πéÖ",
  "πéÇπüÖπéü",
  "πéÇπü¢πéï",
  "πéÇπü¢πéô",
  "πéÇπüíπéàπüå",
  "πéÇπü¬πüùπüä",
  "πéÇπü«πüå",
  "πéÇπéäπü┐",
  "πéÇπéêπüå",
  "πéÇπéëπüòπüì",
  "πéÇπéèπéçπüå",
  "πéÇπéìπéô",
  "πéüπüäπüéπéô",
  "πéüπüäπüåπéô",
  "πéüπüäπüêπéô",
  "πéüπüäπüïπüÅ",
  "πéüπüäπüìπéçπüÅ",
  "πéüπüäπüòπüä",
  "πéüπüäπüù",
  "πéüπüäπü¥πüå",
  "πéüπüäπü╡πéÖπüñ",
  "πéüπüäπéîπüä",
  "πéüπüäπéÅπüÅ",
  "πéüπüÅπéÖπü╛πéîπéï",
  "πéüπüòπéÖπüÖ",
  "πéüπüùπüƒ",
  "πéüπüÖπéÖπéëπüùπüä",
  "πéüπüƒπéÖπüñ",
  "πéüπü╛πüä",
  "πéüπéäπüÖ",
  "πéüπéôπüìπéç",
  "πéüπéôπü¢πüì",
  "πéüπéôπü¿πéÖπüå",
  "πééπüåπüùπüéπüæπéÖπéï",
  "πééπüåπü¿πéÖπüåπüæπéô",
  "πééπüêπéï",
  "πééπüÅπüù",
  "πééπüÅπüªπüì",
  "πééπüÅπéêπüåπü▓πéÖ",
  "πééπüíπéìπéô",
  "πééπü¿πéÖπéï",
  "πééπéëπüå",
  "πééπéôπüÅ",
  "πééπéôπüƒπéÖπüä",
  "πéäπüèπéä",
  "πéäπüæπéï",
  "πéäπüòπüä",
  "πéäπüòπüùπüä",
  "πéäπüÖπüä",
  "πéäπüÖπüƒπéìπüå",
  "πéäπüÖπü┐",
  "πéäπü¢πéï",
  "πéäπü¥πüå",
  "πéäπüƒπüä",
  "πéäπüíπéô",
  "πéäπüúπü¿",
  "πéäπüúπü»πéÜπéè",
  "πéäπü╡πéÖπéï",
  "πéäπéüπéï",
  "πéäπéäπüôπüùπüä",
  "πéäπéêπüä",
  "πéäπéÅπéëπüïπüä",
  "πéåπüåπüì",
  "πéåπüåπü▓πéÖπéôπüìπéçπüÅ",
  "πéåπüåπü╕πéÖ",
  "πéåπüåπéüπüä",
  "πéåπüæπüñ",
  "πéåπüùπéàπüñ",
  "πéåπü¢πéô",
  "πéåπü¥πüå",
  "πéåπüƒπüï",
  "πéåπüíπéâπüÅ",
  "πéåπüªπéÖπéï",
  "πéåπü½πéàπüå",
  "πéåπü▓πéÖπéÅ",
  "πéåπéëπüä",
  "πéåπéîπéï",
  "πéêπüåπüä",
  "πéêπüåπüï",
  "πéêπüåπüìπéàπüå",
  "πéêπüåπüùπéÖ",
  "πéêπüåπüÖ",
  "πéêπüåπüíπüêπéô",
  "πéêπüïπü¢πéÖ",
  "πéêπüïπéô",
  "πéêπüìπéô",
  "πéêπüÅπü¢πüä",
  "πéêπüÅπü╗πéÖπüå",
  "πéêπüæπüä",
  "πéêπüôπéÖπéîπéï",
  "πéêπüòπéô",
  "πéêπüùπéàπüå",
  "πéêπü¥πüå",
  "πéêπü¥πüÅ",
  "πéêπüúπüï",
  "πéêπüªπüä",
  "πéêπü¿πéÖπüïπéÖπéÅπüÅ",
  "πéêπü¡πüñ",
  "πéêπéäπüÅ",
  "πéêπéåπüå",
  "πéêπéìπüôπü╡πéÖ",
  "πéêπéìπüùπüä",
  "πéëπüäπüå",
  "πéëπüÅπüïπéÖπüì",
  "πéëπüÅπüôπéÖ",
  "πéëπüÅπüòπüñ",
  "πéëπüÅπüƒπéÖ",
  "πéëπüùπéôπü»πéÖπéô",
  "πéëπü¢πéô",
  "πéëπü¥πéÖπüÅ",
  "πéëπüƒπüä",
  "πéëπüúπüï",
  "πéëπéîπüñ",
  "πéèπüêπüì",
  "πéèπüïπüä",
  "πéèπüìπüòπüÅ",
  "πéèπüìπü¢πüñ",
  "πéèπüÅπüÅπéÖπéô",
  "πéèπüÅπüñ",
  "πéèπüæπéô",
  "πéèπüôπüå",
  "πéèπü¢πüä",
  "πéèπü¥πüå",
  "πéèπü¥πüÅ",
  "πéèπüªπéô",
  "πéèπü¡πéô",
  "πéèπéåπüå",
  "πéèπéàπüåπüïπéÖπüÅ",
  "πéèπéêπüå",
  "πéèπéçπüåπéè",
  "πéèπéçπüïπéô",
  "πéèπéçπüÅπüíπéâ",
  "πéèπéçπüôπüå",
  "πéèπéèπüÅ",
  "πéèπéîπüì",
  "πéèπéìπéô",
  "πéèπéôπüôπéÖ",
  "πéïπüäπüæπüä",
  "πéïπüäπüòπüä",
  "πéïπüäπüùπéÖ",
  "πéïπüäπü¢πüì",
  "πéïπüÖπü»πéÖπéô",
  "πéïπéèπüïπéÖπéÅπéë",
  "πéîπüäπüïπéô",
  "πéîπüäπüìπéÖ",
  "πéîπüäπü¢πüä",
  "πéîπüäπü¥πéÖπüåπüô",
  "πéîπüäπü¿πüå",
  "πéîπüäπü╗πéÖπüå",
  "πéîπüìπüù",
  "πéîπüìπüƒπéÖπüä",
  "πéîπéôπüéπüä",
  "πéîπéôπüæπüä",
  "πéîπéôπüôπéô",
  "πéîπéôπüòπüä",
  "πéîπéôπüùπéàπüå",
  "πéîπéôπü¥πéÖπüÅ",
  "πéîπéôπéëπüÅ",
  "πéìπüåπüï",
  "πéìπüåπüôπéÖ",
  "πéìπüåπüùπéÖπéô",
  "πéìπüåπü¥πüÅ",
  "πéìπüÅπüïπéÖ",
  "πéìπüôπüñ",
  "πéìπüùπéÖπüåπéë",
  "πéìπüùπéàπüñ",
  "πéìπü¢πéô",
  "πéìπüªπéô",
  "πéìπéüπéô",
  "πéìπéîπüñ",
  "πéìπéôπüìπéÖ",
  "πéìπéôπü»πéÜ",
  "πéìπéôπü╡πéÖπéô",
  "πéìπéôπéè",
  "πéÅπüïπüÖ",
  "πéÅπüïπéü",
  "πéÅπüïπéäπü╛",
  "πéÅπüïπéîπéï",
  "πéÅπüùπüñ",
  "πéÅπüùπéÖπü╛πüù",
  "πéÅπüÖπéîπééπü«",
  "πéÅπéëπüå",
  "πéÅπéîπéï"
]

},{}],35:[function(require,module,exports){
module.exports=[
  "ßäÇßàíßäÇßàºßå¿",
  "ßäÇßàíßäüßà│ßå╖",
  "ßäÇßàíßäéßàíßå½",
  "ßäÇßàíßäéßà│ßå╝",
  "ßäÇßàíßäâßà│ßå¿",
  "ßäÇßàíßäàßà│ßäÄßà╡ßå╖",
  "ßäÇßàíßäåßà«ßå╖",
  "ßäÇßàíßäçßàíßå╝",
  "ßäÇßàíßäëßàíßå╝",
  "ßäÇßàíßäëßà│ßå╖",
  "ßäÇßàíßäïßà«ßå½ßäâßàª",
  "ßäÇßàíßäïßà│ßå»",
  "ßäÇßàíßäïßà╡ßäâßà│",
  "ßäÇßàíßäïßà╡ßå╕",
  "ßäÇßàíßäîßàíßå╝",
  "ßäÇßàíßäîßàÑßå╝",
  "ßäÇßàíßäîßà⌐ßå¿",
  "ßäÇßàíßäîßà«ßå¿",
  "ßäÇßàíßå¿ßäïßà⌐",
  "ßäÇßàíßå¿ßäîßàí",
  "ßäÇßàíßå½ßäÇßàºßå¿",
  "ßäÇßàíßå½ßäçßà«",
  "ßäÇßàíßå½ßäëßàÑßå╕",
  "ßäÇßàíßå½ßäîßàíßå╝",
  "ßäÇßàíßå½ßäîßàÑßå╕",
  "ßäÇßàíßå½ßäæßàíßå½",
  "ßäÇßàíßå»ßäâßà│ßå╝",
  "ßäÇßàíßå»ßäçßà╡",
  "ßäÇßàíßå»ßäëßàóßå¿",
  "ßäÇßàíßå»ßäîßà│ßå╝",
  "ßäÇßàíßå╖ßäÇßàíßå¿",
  "ßäÇßàíßå╖ßäÇßà╡",
  "ßäÇßàíßå╖ßäëßà⌐",
  "ßäÇßàíßå╖ßäëßà«ßäëßàÑßå╝",
  "ßäÇßàíßå╖ßäîßàí",
  "ßäÇßàíßå╖ßäîßàÑßå╝",
  "ßäÇßàíßå╕ßäîßàíßäÇßà╡",
  "ßäÇßàíßå╝ßäéßàíßå╖",
  "ßäÇßàíßå╝ßäâßàíßå╝",
  "ßäÇßàíßå╝ßäâßà⌐",
  "ßäÇßàíßå╝ßäàßàºßå¿ßäÆßà╡",
  "ßäÇßàíßå╝ßäçßàºßå½",
  "ßäÇßàíßå╝ßäçßà«ßå¿",
  "ßäÇßàíßå╝ßäëßàí",
  "ßäÇßàíßå╝ßäëßà«ßäàßàúßå╝",
  "ßäÇßàíßå╝ßäïßàíßäîßà╡",
  "ßäÇßàíßå╝ßäïßà»ßå½ßäâßà⌐",
  "ßäÇßàíßå╝ßäïßà┤",
  "ßäÇßàíßå╝ßäîßàª",
  "ßäÇßàíßå╝ßäîßà⌐",
  "ßäÇßàíßçÇßäïßà╡",
  "ßäÇßàóßäÇßà«ßäàßà╡",
  "ßäÇßàóßäéßàíßäàßà╡",
  "ßäÇßàóßäçßàíßå╝",
  "ßäÇßàóßäçßàºßå»",
  "ßäÇßàóßäëßàÑßå½",
  "ßäÇßàóßäëßàÑßå╝",
  "ßäÇßàóßäïßà╡ßå½",
  "ßäÇßàóßå¿ßäÇßà¬ßå½ßäîßàÑßå¿",
  "ßäÇßàÑßäëßà╡ßå»",
  "ßäÇßàÑßäïßàóßå¿",
  "ßäÇßàÑßäïßà«ßå»",
  "ßäÇßàÑßäîßà╡ßå║",
  "ßäÇßàÑßäæßà«ßå╖",
  "ßäÇßàÑßå¿ßäîßàÑßå╝",
  "ßäÇßàÑßå½ßäÇßàíßå╝",
  "ßäÇßàÑßå½ßäåßà«ßå»",
  "ßäÇßàÑßå½ßäëßàÑßå»",
  "ßäÇßàÑßå½ßäîßà⌐",
  "ßäÇßàÑßå½ßäÄßà«ßå¿",
  "ßäÇßàÑßå»ßäïßà│ßå╖",
  "ßäÇßàÑßå╖ßäëßàí",
  "ßäÇßàÑßå╖ßäÉßà⌐",
  "ßäÇßàªßäëßà╡ßäæßàíßå½",
  "ßäÇßàªßäïßà╡ßå╖",
  "ßäÇßàºßäïßà«ßå»",
  "ßäÇßàºßå½ßäÆßàó",
  "ßäÇßàºßå»ßäÇßà¬",
  "ßäÇßàºßå»ßäÇßà«ßå¿",
  "ßäÇßàºßå»ßäàßà⌐ßå½",
  "ßäÇßàºßå»ßäëßàÑßå¿",
  "ßäÇßàºßå»ßäëßà│ßå╝",
  "ßäÇßàºßå»ßäëßà╡ßå╖",
  "ßäÇßàºßå»ßäîßàÑßå╝",
  "ßäÇßàºßå»ßäÆßà⌐ßå½",
  "ßäÇßàºßå╝ßäÇßà¿",
  "ßäÇßàºßå╝ßäÇßà⌐",
  "ßäÇßàºßå╝ßäÇßà╡",
  "ßäÇßàºßå╝ßäàßàºßå¿",
  "ßäÇßàºßå╝ßäçßà⌐ßå¿ßäÇßà«ßå╝",
  "ßäÇßàºßå╝ßäçßà╡",
  "ßäÇßàºßå╝ßäëßàíßå╝ßäâßà⌐",
  "ßäÇßàºßå╝ßäïßàºßå╝",
  "ßäÇßàºßå╝ßäïßà«",
  "ßäÇßàºßå╝ßäîßàóßå╝",
  "ßäÇßàºßå╝ßäîßàª",
  "ßäÇßàºßå╝ßäîßà«",
  "ßäÇßàºßå╝ßäÄßàíßå»",
  "ßäÇßàºßå╝ßäÄßà╡",
  "ßäÇßàºßå╝ßäÆßàúßå╝",
  "ßäÇßàºßå╝ßäÆßàÑßå╖",
  "ßäÇßà¿ßäÇßà⌐ßå¿",
  "ßäÇßà¿ßäâßàíßå½",
  "ßäÇßà¿ßäàßàíßå½",
  "ßäÇßà¿ßäëßàíßå½",
  "ßäÇßà¿ßäëßà⌐ßå¿",
  "ßäÇßà¿ßäïßàúßå¿",
  "ßäÇßà¿ßäîßàÑßå»",
  "ßäÇßà¿ßäÄßà│ßå╝",
  "ßäÇßà¿ßäÆßà¼ßå¿",
  "ßäÇßà⌐ßäÇßàóßå¿",
  "ßäÇßà⌐ßäÇßà«ßäàßàº",
  "ßäÇßà⌐ßäÇßà«ßå╝",
  "ßäÇßà⌐ßäÇßà│ßå╕",
  "ßäÇßà⌐ßäâßà│ßå╝ßäÆßàíßå¿ßäëßàóßå╝",
  "ßäÇßà⌐ßäåßà«ßäëßà╡ßå½",
  "ßäÇßà⌐ßäåßà╡ßå½",
  "ßäÇßà⌐ßäïßàúßå╝ßäïßà╡",
  "ßäÇßà⌐ßäîßàíßå╝",
  "ßäÇßà⌐ßäîßàÑßå½",
  "ßäÇßà⌐ßäîßà╡ßå╕",
  "ßäÇßà⌐ßäÄßà«ßå║ßäÇßàíßäàßà«",
  "ßäÇßà⌐ßäÉßà⌐ßå╝",
  "ßäÇßà⌐ßäÆßàúßå╝",
  "ßäÇßà⌐ßå¿ßäëßà╡ßå¿",
  "ßäÇßà⌐ßå»ßäåßà⌐ßå¿",
  "ßäÇßà⌐ßå»ßäìßàíßäÇßà╡",
  "ßäÇßà⌐ßå»ßäæßà│",
  "ßäÇßà⌐ßå╝ßäÇßàíßå½",
  "ßäÇßà⌐ßå╝ßäÇßàó",
  "ßäÇßà⌐ßå╝ßäÇßàºßå¿",
  "ßäÇßà⌐ßå╝ßäÇßà«ßå½",
  "ßäÇßà⌐ßå╝ßäÇßà│ßå╕",
  "ßäÇßà⌐ßå╝ßäÇßà╡",
  "ßäÇßà⌐ßå╝ßäâßà⌐ßå╝",
  "ßäÇßà⌐ßå╝ßäåßà«ßäïßà»ßå½",
  "ßäÇßà⌐ßå╝ßäçßà«",
  "ßäÇßà⌐ßå╝ßäëßàí",
  "ßäÇßà⌐ßå╝ßäëßà╡ßå¿",
  "ßäÇßà⌐ßå╝ßäïßàÑßå╕",
  "ßäÇßà⌐ßå╝ßäïßàºßå½",
  "ßäÇßà⌐ßå╝ßäïßà»ßå½",
  "ßäÇßà⌐ßå╝ßäîßàíßå╝",
  "ßäÇßà⌐ßå╝ßäìßàí",
  "ßäÇßà⌐ßå╝ßäÄßàóßå¿",
  "ßäÇßà⌐ßå╝ßäÉßà⌐ßå╝",
  "ßäÇßà⌐ßå╝ßäæßà⌐",
  "ßäÇßà⌐ßå╝ßäÆßàíßå╝",
  "ßäÇßà⌐ßå╝ßäÆßà▓ßäïßà╡ßå»",
  "ßäÇßà¬ßäåßà⌐ßå¿",
  "ßäÇßà¬ßäïßà╡ßå»",
  "ßäÇßà¬ßäîßàíßå╝",
  "ßäÇßà¬ßäîßàÑßå╝",
  "ßäÇßà¬ßäÆßàíßå¿",
  "ßäÇßà¬ßå½ßäÇßàóßå¿",
  "ßäÇßà¬ßå½ßäÇßà¿",
  "ßäÇßà¬ßå½ßäÇßà¬ßå╝",
  "ßäÇßà¬ßå½ßäéßàºßå╖",
  "ßäÇßà¬ßå½ßäàßàíßå╖",
  "ßäÇßà¬ßå½ßäàßàºßå½",
  "ßäÇßà¬ßå½ßäàßà╡",
  "ßäÇßà¬ßå½ßäëßà│ßå╕",
  "ßäÇßà¬ßå½ßäëßà╡ßå╖",
  "ßäÇßà¬ßå½ßäîßàÑßå╖",
  "ßäÇßà¬ßå½ßäÄßàíßå»",
  "ßäÇßà¬ßå╝ßäÇßàºßå╝",
  "ßäÇßà¬ßå╝ßäÇßà⌐",
  "ßäÇßà¬ßå╝ßäîßàíßå╝",
  "ßäÇßà¬ßå╝ßäîßà«",
  "ßäÇßà¼ßäàßà⌐ßäïßà«ßå╖",
  "ßäÇßà¼ßå╝ßäîßàíßå╝ßäÆßà╡",
  "ßäÇßà¡ßäÇßà¬ßäëßàÑ",
  "ßäÇßà¡ßäåßà«ßå½",
  "ßäÇßà¡ßäçßà⌐ßå¿",
  "ßäÇßà¡ßäëßà╡ßå»",
  "ßäÇßà¡ßäïßàúßå╝",
  "ßäÇßà¡ßäïßà▓ßå¿",
  "ßäÇßà¡ßäîßàíßå╝",
  "ßäÇßà¡ßäîßà╡ßå¿",
  "ßäÇßà¡ßäÉßà⌐ßå╝",
  "ßäÇßà¡ßäÆßà¬ßå½",
  "ßäÇßà¡ßäÆßà«ßå½",
  "ßäÇßà«ßäÇßàºßå╝",
  "ßäÇßà«ßäàßà│ßå╖",
  "ßäÇßà«ßäåßàÑßå╝",
  "ßäÇßà«ßäçßàºßå»",
  "ßäÇßà«ßäçßà«ßå½",
  "ßäÇßà«ßäëßàÑßå¿",
  "ßäÇßà«ßäëßàÑßå╝",
  "ßäÇßà«ßäëßà⌐ßå¿",
  "ßäÇßà«ßäïßàºßå¿",
  "ßäÇßà«ßäïßà╡ßå╕",
  "ßäÇßà«ßäÄßàÑßå╝",
  "ßäÇßà«ßäÄßàªßäîßàÑßå¿",
  "ßäÇßà«ßå¿ßäÇßàí",
  "ßäÇßà«ßå¿ßäÇßà╡",
  "ßäÇßà«ßå¿ßäéßàó",
  "ßäÇßà«ßå¿ßäàßà╡ßå╕",
  "ßäÇßà«ßå¿ßäåßà«ßå»",
  "ßäÇßà«ßå¿ßäåßà╡ßå½",
  "ßäÇßà«ßå¿ßäëßà«",
  "ßäÇßà«ßå¿ßäïßàÑ",
  "ßäÇßà«ßå¿ßäïßà¬ßå╝",
  "ßäÇßà«ßå¿ßäîßàÑßå¿",
  "ßäÇßà«ßå¿ßäîßàª",
  "ßäÇßà«ßå¿ßäÆßà¼",
  "ßäÇßà«ßå½ßäâßàó",
  "ßäÇßà«ßå½ßäëßàí",
  "ßäÇßà«ßå½ßäïßà╡ßå½",
  "ßäÇßà«ßå╝ßäÇßà│ßå¿ßäîßàÑßå¿",
  "ßäÇßà»ßå½ßäàßà╡",
  "ßäÇßà»ßå½ßäïßà▒",
  "ßäÇßà»ßå½ßäÉßà«",
  "ßäÇßà▒ßäÇßà«ßå¿",
  "ßäÇßà▒ßäëßà╡ßå½",
  "ßäÇßà▓ßäîßàÑßå╝",
  "ßäÇßà▓ßäÄßà╡ßå¿",
  "ßäÇßà▓ßå½ßäÆßàºßå╝",
  "ßäÇßà│ßäéßàíßå»",
  "ßäÇßà│ßäéßàúßå╝",
  "ßäÇßà│ßäéßà│ßå»",
  "ßäÇßà│ßäàßàÑßäéßàí",
  "ßäÇßà│ßäàßà«ßå╕",
  "ßäÇßà│ßäàßà│ßå║",
  "ßäÇßà│ßäàßà╡ßå╖",
  "ßäÇßà│ßäîßàªßäëßàÑßäïßàú",
  "ßäÇßà│ßäÉßà⌐ßäàßà⌐ßå¿",
  "ßäÇßà│ßå¿ßäçßà⌐ßå¿",
  "ßäÇßà│ßå¿ßäÆßà╡",
  "ßäÇßà│ßå½ßäÇßàÑ",
  "ßäÇßà│ßå½ßäÇßà¡",
  "ßäÇßà│ßå½ßäàßàó",
  "ßäÇßà│ßå½ßäàßà⌐",
  "ßäÇßà│ßå½ßäåßà«",
  "ßäÇßà│ßå½ßäçßà⌐ßå½",
  "ßäÇßà│ßå½ßäïßà»ßå½",
  "ßäÇßà│ßå½ßäïßà▓ßå¿",
  "ßäÇßà│ßå½ßäÄßàÑ",
  "ßäÇßà│ßå»ßäèßà╡",
  "ßäÇßà│ßå»ßäîßàí",
  "ßäÇßà│ßå╖ßäÇßàíßå╝ßäëßàíßå½",
  "ßäÇßà│ßå╖ßäÇßà⌐",
  "ßäÇßà│ßå╖ßäéßàºßå½",
  "ßäÇßà│ßå╖ßäåßàªßäâßàíßå»",
  "ßäÇßà│ßå╖ßäïßàóßå¿",
  "ßäÇßà│ßå╖ßäïßàºßå½",
  "ßäÇßà│ßå╖ßäïßà¡ßäïßà╡ßå»",
  "ßäÇßà│ßå╖ßäîßà╡",
  "ßäÇßà│ßå╝ßäîßàÑßå╝ßäîßàÑßå¿",
  "ßäÇßà╡ßäÇßàíßå½",
  "ßäÇßà╡ßäÇßà¬ßå½",
  "ßäÇßà╡ßäéßàºßå╖",
  "ßäÇßà╡ßäéßà│ßå╝",
  "ßäÇßà╡ßäâßà⌐ßå¿ßäÇßà¡",
  "ßäÇßà╡ßäâßà«ßå╝",
  "ßäÇßà╡ßäàßà⌐ßå¿",
  "ßäÇßà╡ßäàßà│ßå╖",
  "ßäÇßà╡ßäçßàÑßå╕",
  "ßäÇßà╡ßäçßà⌐ßå½",
  "ßäÇßà╡ßäçßà«ßå½",
  "ßäÇßà╡ßäêßà│ßå╖",
  "ßäÇßà╡ßäëßà«ßå¿ßäëßàí",
  "ßäÇßà╡ßäëßà«ßå»",
  "ßäÇßà╡ßäïßàÑßå¿",
  "ßäÇßà╡ßäïßàÑßå╕",
  "ßäÇßà╡ßäïßà⌐ßå½",
  "ßäÇßà╡ßäïßà«ßå½",
  "ßäÇßà╡ßäïßà»ßå½",
  "ßäÇßà╡ßäîßàÑßå¿",
  "ßäÇßà╡ßäîßà«ßå½",
  "ßäÇßà╡ßäÄßà╡ßå╖",
  "ßäÇßà╡ßäÆßà⌐ßå½",
  "ßäÇßà╡ßäÆßà¼ßå¿",
  "ßäÇßà╡ßå½ßäÇßà│ßå╕",
  "ßäÇßà╡ßå½ßäîßàíßå╝",
  "ßäÇßà╡ßå»ßäïßà╡",
  "ßäÇßà╡ßå╖ßäçßàíßå╕",
  "ßäÇßà╡ßå╖ßäÄßà╡",
  "ßäÇßà╡ßå╖ßäæßà⌐ßäÇßà⌐ßå╝ßäÆßàíßå╝",
  "ßäüßàíßå¿ßäâßà«ßäÇßà╡",
  "ßäüßàíßå╖ßäêßàíßå¿",
  "ßäüßàóßäâßàíßå»ßäïßà│ßå╖",
  "ßäüßàóßäëßà⌐ßäÇßà│ßå╖",
  "ßäüßàÑßå╕ßäîßà╡ßå»",
  "ßäüßà⌐ßå¿ßäâßàóßäÇßà╡",
  "ßäüßà⌐ßå╛ßäïßà╡ßçü",
  "ßäéßàíßäâßà│ßå»ßäïßà╡",
  "ßäéßàíßäàßàíßå½ßäÆßà╡",
  "ßäéßàíßäåßàÑßäîßà╡",
  "ßäéßàíßäåßà«ßå»",
  "ßäéßàíßäÄßà╡ßå╖ßäçßàíßå½",
  "ßäéßàíßäÆßà│ßå»",
  "ßäéßàíßå¿ßäïßàºßå╕",
  "ßäéßàíßå½ßäçßàíßå╝",
  "ßäéßàíßå»ßäÇßàó",
  "ßäéßàíßå»ßäèßà╡",
  "ßäéßàíßå»ßäìßàí",
  "ßäéßàíßå╖ßäéßàº",
  "ßäéßàíßå╖ßäâßàóßäåßà«ßå½",
  "ßäéßàíßå╖ßäåßàó",
  "ßäéßàíßå╖ßäëßàíßå½",
  "ßäéßàíßå╖ßäîßàí",
  "ßäéßàíßå╖ßäæßàºßå½",
  "ßäéßàíßå╖ßäÆßàíßå¿ßäëßàóßå╝",
  "ßäéßàíßå╝ßäçßà╡",
  "ßäéßàíßçÇßäåßàíßå»",
  "ßäéßàóßäéßàºßå½",
  "ßäéßàóßäïßà¡ßå╝",
  "ßäéßàóßäïßà╡ßå»",
  "ßäéßàóßå╖ßäçßà╡",
  "ßäéßàóßå╖ßäëßàó",
  "ßäéßàóßå║ßäåßà«ßå»",
  "ßäéßàóßå╝ßäâßà⌐ßå╝",
  "ßäéßàóßå╝ßäåßàºßå½",
  "ßäéßàóßå╝ßäçßàíßå╝",
  "ßäéßàóßå╝ßäîßàíßå╝ßäÇßà⌐",
  "ßäéßàªßå¿ßäÉßàíßäïßà╡",
  "ßäéßàªßå║ßäìßàó",
  "ßäéßà⌐ßäâßà⌐ßå╝",
  "ßäéßà⌐ßäàßàíßå½ßäëßàóßå¿",
  "ßäéßà⌐ßäàßàºßå¿",
  "ßäéßà⌐ßäïßà╡ßå½",
  "ßäéßà⌐ßå¿ßäïßà│ßå╖",
  "ßäéßà⌐ßå¿ßäÄßàí",
  "ßäéßà⌐ßå¿ßäÆßà¬",
  "ßäéßà⌐ßå½ßäàßà╡",
  "ßäéßà⌐ßå½ßäåßà«ßå½",
  "ßäéßà⌐ßå½ßäîßàóßå╝",
  "ßäéßà⌐ßå»ßäïßà╡",
  "ßäéßà⌐ßå╝ßäÇßà«",
  "ßäéßà⌐ßå╝ßäâßàíßå╖",
  "ßäéßà⌐ßå╝ßäåßà╡ßå½",
  "ßäéßà⌐ßå╝ßäçßà«",
  "ßäéßà⌐ßå╝ßäïßàÑßå╕",
  "ßäéßà⌐ßå╝ßäîßàíßå╝",
  "ßäéßà⌐ßå╝ßäÄßà⌐ßå½",
  "ßäéßà⌐ßçüßäïßà╡",
  "ßäéßà«ßå½ßäâßà⌐ßå╝ßäîßàí",
  "ßäéßà«ßå½ßäåßà«ßå»",
  "ßäéßà«ßå½ßäèßàÑßå╕",
  "ßäéßà▓ßäïßà¡ßå¿",
  "ßäéßà│ßäüßà╡ßå╖",
  "ßäéßà│ßå¿ßäâßàó",
  "ßäéßà│ßå╝ßäâßà⌐ßå╝ßäîßàÑßå¿",
  "ßäéßà│ßå╝ßäàßàºßå¿",
  "ßäâßàíßäçßàíßå╝",
  "ßäâßàíßäïßàúßå╝ßäëßàÑßå╝",
  "ßäâßàíßäïßà│ßå╖",
  "ßäâßàíßäïßà╡ßäïßàÑßäÉßà│",
  "ßäâßàíßäÆßàóßå╝",
  "ßäâßàíßå½ßäÇßà¿",
  "ßäâßàíßå½ßäÇßà⌐ßå»",
  "ßäâßàíßå½ßäâßà⌐ßå¿",
  "ßäâßàíßå½ßäåßàíßå║",
  "ßäâßàíßå½ßäëßà«ßå½",
  "ßäâßàíßå½ßäïßàÑ",
  "ßäâßàíßå½ßäïßà▒",
  "ßäâßàíßå½ßäîßàÑßå╖",
  "ßäâßàíßå½ßäÄßàª",
  "ßäâßàíßå½ßäÄßà«",
  "ßäâßàíßå½ßäæßàºßå½",
  "ßäâßàíßå½ßäæßà«ßå╝",
  "ßäâßàíßå»ßäÇßàúßå»",
  "ßäâßàíßå»ßäàßàÑ",
  "ßäâßàíßå»ßäàßàºßå¿",
  "ßäâßàíßå»ßäàßà╡",
  "ßäâßàíßå░ßäÇßà⌐ßäÇßà╡",
  "ßäâßàíßå╖ßäâßàíßå╝",
  "ßäâßàíßå╖ßäçßàó",
  "ßäâßàíßå╖ßäïßà¡",
  "ßäâßàíßå╖ßäïßà╡ßå╖",
  "ßäâßàíßå╕ßäçßàºßå½",
  "ßäâßàíßå╕ßäîßàíßå╝",
  "ßäâßàíßå╝ßäÇßà│ßå½",
  "ßäâßàíßå╝ßäçßà«ßå½ßäÇßàíßå½",
  "ßäâßàíßå╝ßäïßàºßå½ßäÆßà╡",
  "ßäâßàíßå╝ßäîßàíßå╝",
  "ßäâßàóßäÇßà▓ßäåßà⌐",
  "ßäâßàóßäéßàíßå╜",
  "ßäâßàóßäâßàíßå½ßäÆßà╡",
  "ßäâßàóßäâßàíßå╕",
  "ßäâßàóßäâßà⌐ßäëßà╡",
  "ßäâßàóßäàßàúßå¿",
  "ßäâßàóßäàßàúßå╝",
  "ßäâßàóßäàßà▓ßå¿",
  "ßäâßàóßäåßà«ßå½",
  "ßäâßàóßäçßà«ßäçßà«ßå½",
  "ßäâßàóßäëßà╡ßå½",
  "ßäâßàóßäïßà│ßå╝",
  "ßäâßàóßäîßàíßå╝",
  "ßäâßàóßäîßàÑßå½",
  "ßäâßàóßäîßàÑßå╕",
  "ßäâßàóßäîßà«ßå╝",
  "ßäâßàóßäÄßàóßå¿",
  "ßäâßàóßäÄßà«ßå»",
  "ßäâßàóßäÄßà«ßå╝",
  "ßäâßàóßäÉßà⌐ßå╝ßäàßàºßå╝",
  "ßäâßàóßäÆßàíßå¿",
  "ßäâßàóßäÆßàíßå½ßäåßà╡ßå½ßäÇßà«ßå¿",
  "ßäâßàóßäÆßàíßå╕ßäëßà╡ßå»",
  "ßäâßàóßäÆßàºßå╝",
  "ßäâßàÑßå╝ßäïßàÑßäàßà╡",
  "ßäâßàªßäïßà╡ßäÉßà│",
  "ßäâßà⌐ßäâßàóßäÄßàª",
  "ßäâßà⌐ßäâßàÑßå¿",
  "ßäâßà⌐ßäâßà«ßå¿",
  "ßäâßà⌐ßäåßàíßå╝",
  "ßäâßà⌐ßäëßàÑßäÇßà¬ßå½",
  "ßäâßà⌐ßäëßà╡ßå╖",
  "ßäâßà⌐ßäïßà«ßå╖",
  "ßäâßà⌐ßäïßà╡ßå╕",
  "ßäâßà⌐ßäîßàíßäÇßà╡",
  "ßäâßà⌐ßäîßàÑßäÆßà╡",
  "ßäâßà⌐ßäîßàÑßå½",
  "ßäâßà⌐ßäîßà«ßå╝",
  "ßäâßà⌐ßäÄßàíßå¿",
  "ßäâßà⌐ßå¿ßäÇßàíßå╖",
  "ßäâßà⌐ßå¿ßäàßà╡ßå╕",
  "ßäâßà⌐ßå¿ßäëßàÑ",
  "ßäâßà⌐ßå¿ßäïßà╡ßå»",
  "ßäâßà⌐ßå¿ßäÄßàíßå╝ßäîßàÑßå¿",
  "ßäâßà⌐ßå╝ßäÆßà¬ßäÄßàóßå¿",
  "ßäâßà▒ßå║ßäåßà⌐ßäëßà│ßå╕",
  "ßäâßà▒ßå║ßäëßàíßå½",
  "ßääßàíßå»ßäïßàíßäïßà╡",
  "ßäåßàíßäéßà«ßäàßàí",
  "ßäåßàíßäéßà│ßå»",
  "ßäåßàíßäâßàíßå╝",
  "ßäåßàíßäàßàíßäÉßà⌐ßå½",
  "ßäåßàíßäàßàºßå½",
  "ßäåßàíßäåßà«ßäàßà╡",
  "ßäåßàíßäëßàíßäîßà╡",
  "ßäåßàíßäïßàúßå¿",
  "ßäåßàíßäïßà¡ßäéßàªßäîßà│",
  "ßäåßàíßäïßà│ßå»",
  "ßäåßàíßäïßà│ßå╖",
  "ßäåßàíßäïßà╡ßäÅßà│",
  "ßäåßàíßäîßà«ßå╝",
  "ßäåßàíßäîßà╡ßäåßàíßå¿",
  "ßäåßàíßäÄßàíßå½ßäÇßàíßäîßà╡",
  "ßäåßàíßäÄßàíßå»",
  "ßäåßàíßäÆßà│ßå½",
  "ßäåßàíßå¿ßäÇßàÑßå»ßäàßà╡",
  "ßäåßàíßå¿ßäéßàó",
  "ßäåßàíßå¿ßäëßàíßå╝",
  "ßäåßàíßå½ßäéßàíßå╖",
  "ßäåßàíßå½ßäâßà«",
  "ßäåßàíßå½ßäëßàª",
  "ßäåßàíßå½ßäïßàúßå¿",
  "ßäåßàíßå½ßäïßà╡ßå»",
  "ßäåßàíßå½ßäîßàÑßå╖",
  "ßäåßàíßå½ßäîßà⌐ßå¿",
  "ßäåßàíßå½ßäÆßà¬",
  "ßäåßàíßå¡ßäïßà╡",
  "ßäåßàíßå»ßäÇßà╡",
  "ßäåßàíßå»ßäèßà│ßå╖",
  "ßäåßàíßå»ßäÉßà«",
  "ßäåßàíßå╖ßäâßàóßäàßà⌐",
  "ßäåßàíßå╝ßäïßà»ßå½ßäÇßàºßå╝",
  "ßäåßàóßäéßàºßå½",
  "ßäåßàóßäâßàíßå»",
  "ßäåßàóßäàßàºßå¿",
  "ßäåßàóßäçßàÑßå½",
  "ßäåßàóßäëßà│ßäÅßàÑßå╖",
  "ßäåßàóßäïßà╡ßå»",
  "ßäåßàóßäîßàíßå╝",
  "ßäåßàóßå¿ßäîßà«",
  "ßäåßàÑßå¿ßäïßà╡",
  "ßäåßàÑßå½ßäîßàÑ",
  "ßäåßàÑßå½ßäîßà╡",
  "ßäåßàÑßå»ßäàßà╡",
  "ßäåßàªßäïßà╡ßå»",
  "ßäåßàºßäéßà│ßäàßà╡",
  "ßäåßàºßäÄßà╡ßå»",
  "ßäåßàºßå½ßäâßàíßå╖",
  "ßäåßàºßå»ßäÄßà╡",
  "ßäåßàºßå╝ßäâßàíßå½",
  "ßäåßàºßå╝ßäàßàºßå╝",
  "ßäåßàºßå╝ßäïßà¿",
  "ßäåßàºßå╝ßäïßà┤",
  "ßäåßàºßå╝ßäîßàÑßå»",
  "ßäåßàºßå╝ßäÄßà╡ßå╝",
  "ßäåßàºßå╝ßäÆßàíßå╖",
  "ßäåßà⌐ßäÇßà│ßå╖",
  "ßäåßà⌐ßäéßà╡ßäÉßàÑ",
  "ßäåßà⌐ßäâßàªßå»",
  "ßäåßà⌐ßäâßà│ßå½",
  "ßäåßà⌐ßäçßàÑßå╖",
  "ßäåßà⌐ßäëßà│ßå╕",
  "ßäåßà⌐ßäïßàúßå╝",
  "ßäåßà⌐ßäïßà╡ßå╖",
  "ßäåßà⌐ßäîßà⌐ßäàßà╡",
  "ßäåßà⌐ßäîßà╡ßå╕",
  "ßäåßà⌐ßäÉßà«ßå╝ßäïßà╡",
  "ßäåßà⌐ßå¿ßäÇßàÑßå»ßäïßà╡",
  "ßäåßà⌐ßå¿ßäàßà⌐ßå¿",
  "ßäåßà⌐ßå¿ßäëßàí",
  "ßäåßà⌐ßå¿ßäëßà⌐ßäàßà╡",
  "ßäåßà⌐ßå¿ßäëßà«ßå╖",
  "ßäåßà⌐ßå¿ßäîßàÑßå¿",
  "ßäåßà⌐ßå¿ßäæßà¡",
  "ßäåßà⌐ßå»ßäàßàó",
  "ßäåßà⌐ßå╖ßäåßàó",
  "ßäåßà⌐ßå╖ßäåßà«ßäÇßàª",
  "ßäåßà⌐ßå╖ßäëßàíßå»",
  "ßäåßà⌐ßå╖ßäëßà⌐ßå¿",
  "ßäåßà⌐ßå╖ßäîßà╡ßå║",
  "ßäåßà⌐ßå╖ßäÉßà⌐ßå╝",
  "ßäåßà⌐ßå╕ßäëßà╡",
  "ßäåßà«ßäÇßà¬ßå½ßäëßà╡ßå╖",
  "ßäåßà«ßäÇßà«ßå╝ßäÆßà¬",
  "ßäåßà«ßäâßàÑßäïßà▒",
  "ßäåßà«ßäâßàÑßå╖",
  "ßäåßà«ßäàßà│ßçü",
  "ßäåßà«ßäëßà│ßå½",
  "ßäåßà«ßäïßàÑßå║",
  "ßäåßà«ßäïßàºßå¿",
  "ßäåßà«ßäïßà¡ßå╝",
  "ßäåßà«ßäîßà⌐ßäÇßàÑßå½",
  "ßäåßà«ßäîßà╡ßäÇßàó",
  "ßäåßà«ßäÄßàÑßå¿",
  "ßäåßà«ßå½ßäÇßà«",
  "ßäåßà«ßå½ßäâßà│ßå¿",
  "ßäåßà«ßå½ßäçßàÑßå╕",
  "ßäåßà«ßå½ßäëßàÑ",
  "ßäåßà«ßå½ßäîßàª",
  "ßäåßà«ßå½ßäÆßàíßå¿",
  "ßäåßà«ßå½ßäÆßà¬",
  "ßäåßà«ßå»ßäÇßàí",
  "ßäåßà«ßå»ßäÇßàÑßå½",
  "ßäåßà«ßå»ßäÇßàºßå»",
  "ßäåßà«ßå»ßäÇßà⌐ßäÇßà╡",
  "ßäåßà«ßå»ßäàßà⌐ßå½",
  "ßäåßà«ßå»ßäàßà╡ßäÆßàíßå¿",
  "ßäåßà«ßå»ßäïßà│ßå╖",
  "ßäåßà«ßå»ßäîßà╡ßå»",
  "ßäåßà«ßå»ßäÄßàª",
  "ßäåßà╡ßäÇßà«ßå¿",
  "ßäåßà╡ßäâßà╡ßäïßàÑ",
  "ßäåßà╡ßäëßàíßäïßà╡ßå»",
  "ßäåßà╡ßäëßà«ßå»",
  "ßäåßà╡ßäïßàºßå¿",
  "ßäåßà╡ßäïßà¡ßå╝ßäëßà╡ßå»",
  "ßäåßà╡ßäïßà«ßå╖",
  "ßäåßà╡ßäïßà╡ßå½",
  "ßäåßà╡ßäÉßà╡ßå╝",
  "ßäåßà╡ßäÆßà⌐ßå½",
  "ßäåßà╡ßå½ßäÇßàíßå½",
  "ßäåßà╡ßå½ßäîßà⌐ßå¿",
  "ßäåßà╡ßå½ßäîßà«",
  "ßäåßà╡ßå«ßäïßà│ßå╖",
  "ßäåßà╡ßå»ßäÇßàíßäàßà«",
  "ßäåßà╡ßå»ßäàßà╡ßäåßà╡ßäÉßàÑ",
  "ßäåßà╡ßçÇßäçßàíßäâßàíßå¿",
  "ßäçßàíßäÇßàíßäîßà╡",
  "ßäçßàíßäÇßà«ßäéßà╡",
  "ßäçßàíßäéßàíßäéßàí",
  "ßäçßàíßäéßà│ßå»",
  "ßäçßàíßäâßàíßå¿",
  "ßäçßàíßäâßàíßå║ßäÇßàí",
  "ßäçßàíßäàßàíßå╖",
  "ßäçßàíßäïßà╡ßäàßàÑßäëßà│",
  "ßäçßàíßäÉßàíßå╝",
  "ßäçßàíßå¿ßäåßà«ßå»ßäÇßà¬ßå½",
  "ßäçßàíßå¿ßäëßàí",
  "ßäçßàíßå¿ßäëßà«",
  "ßäçßàíßå½ßäâßàó",
  "ßäçßàíßå½ßäâßà│ßäëßà╡",
  "ßäçßàíßå½ßäåßàíßå»",
  "ßäçßàíßå½ßäçßàíßå»",
  "ßäçßàíßå½ßäëßàÑßå╝",
  "ßäçßàíßå½ßäïßà│ßå╝",
  "ßäçßàíßå½ßäîßàíßå╝",
  "ßäçßàíßå½ßäîßà«ßå¿",
  "ßäçßàíßå½ßäîßà╡",
  "ßäçßàíßå½ßäÄßàíßå½",
  "ßäçßàíßå«ßäÄßà╡ßå╖",
  "ßäçßàíßå»ßäÇßàíßäàßàíßå¿",
  "ßäçßàíßå»ßäÇßàÑßå»ßäïßà│ßå╖",
  "ßäçßàíßå»ßäÇßàºßå½",
  "ßäçßàíßå»ßäâßàíßå»",
  "ßäçßàíßå»ßäàßàª",
  "ßäçßàíßå»ßäåßà⌐ßå¿",
  "ßäçßàíßå»ßäçßàíßäâßàíßå¿",
  "ßäçßàíßå»ßäëßàóßå╝",
  "ßäçßàíßå»ßäïßà│ßå╖",
  "ßäçßàíßå»ßäîßàíßäÇßà«ßå¿",
  "ßäçßàíßå»ßäîßàÑßå½",
  "ßäçßàíßå»ßäÉßà⌐ßå╕",
  "ßäçßàíßå»ßäæßà¡",
  "ßäçßàíßå╖ßäÆßàíßäéßà│ßå»",
  "ßäçßàíßå╕ßäÇßà│ßäàßà│ßå║",
  "ßäçßàíßå╕ßäåßàíßå║",
  "ßäçßàíßå╕ßäëßàíßå╝",
  "ßäçßàíßå╕ßäëßà⌐ßçÇ",
  "ßäçßàíßå╝ßäÇßà│ßå╖",
  "ßäçßàíßå╝ßäåßàºßå½",
  "ßäçßàíßå╝ßäåßà«ßå½",
  "ßäçßàíßå╝ßäçßàíßäâßàíßå¿",
  "ßäçßàíßå╝ßäçßàÑßå╕",
  "ßäçßàíßå╝ßäëßà⌐ßå╝",
  "ßäçßàíßå╝ßäëßà╡ßå¿",
  "ßäçßàíßå╝ßäïßàíßå½",
  "ßäçßàíßå╝ßäïßà«ßå»",
  "ßäçßàíßå╝ßäîßà╡",
  "ßäçßàíßå╝ßäÆßàíßå¿",
  "ßäçßàíßå╝ßäÆßàó",
  "ßäçßàíßå╝ßäÆßàúßå╝",
  "ßäçßàóßäÇßàºßå╝",
  "ßäçßàóßäüßà⌐ßå╕",
  "ßäçßàóßäâßàíßå»",
  "ßäçßàóßäâßà│ßäåßà╡ßå½ßäÉßàÑßå½",
  "ßäçßàóßå¿ßäâßà«ßäëßàíßå½",
  "ßäçßàóßå¿ßäëßàóßå¿",
  "ßäçßàóßå¿ßäëßàÑßå╝",
  "ßäçßàóßå¿ßäïßà╡ßå½",
  "ßäçßàóßå¿ßäîßàª",
  "ßäçßàóßå¿ßäÆßà¬ßäîßàÑßå╖",
  "ßäçßàÑßäàßà│ßå║",
  "ßäçßàÑßäëßàÑßå║",
  "ßäçßàÑßäÉßà│ßå½",
  "ßäçßàÑßå½ßäÇßàó",
  "ßäçßàÑßå½ßäïßàºßå¿",
  "ßäçßàÑßå½ßäîßà╡",
  "ßäçßàÑßå½ßäÆßà⌐",
  "ßäçßàÑßå»ßäÇßà│ßå╖",
  "ßäçßàÑßå»ßäàßàª",
  "ßäçßàÑßå»ßäèßàÑ",
  "ßäçßàÑßå╖ßäïßà▒",
  "ßäçßàÑßå╖ßäïßà╡ßå½",
  "ßäçßàÑßå╖ßäîßà¼",
  "ßäçßàÑßå╕ßäàßà▓ßå»",
  "ßäçßàÑßå╕ßäïßà»ßå½",
  "ßäçßàÑßå╕ßäîßàÑßå¿",
  "ßäçßàÑßå╕ßäÄßà╡ßå¿",
  "ßäçßàªßäïßà╡ßäîßà╡ßå╝",
  "ßäçßàªßå»ßäÉßà│",
  "ßäçßàºßå½ßäÇßàºßå╝",
  "ßäçßàºßå½ßäâßà⌐ßå╝",
  "ßäçßàºßå½ßäåßàºßå╝",
  "ßäçßàºßå½ßäëßà╡ßå½",
  "ßäçßàºßå½ßäÆßà⌐ßäëßàí",
  "ßäçßàºßå½ßäÆßà¬",
  "ßäçßàºßå»ßäâßà⌐",
  "ßäçßàºßå»ßäåßàºßå╝",
  "ßäçßàºßå»ßäïßà╡ßå»",
  "ßäçßàºßå╝ßäëßà╡ßå»",
  "ßäçßàºßå╝ßäïßàíßäàßà╡",
  "ßäçßàºßå╝ßäïßà»ßå½",
  "ßäçßà⌐ßäÇßà¬ßå½",
  "ßäçßà⌐ßäéßàÑßäëßà│",
  "ßäçßà⌐ßäàßàíßäëßàóßå¿",
  "ßäçßà⌐ßäàßàíßå╖",
  "ßäçßà⌐ßäàßà│ßå╖",
  "ßäçßà⌐ßäëßàíßå╝",
  "ßäçßà⌐ßäïßàíßå½",
  "ßäçßà⌐ßäîßàíßäÇßà╡",
  "ßäçßà⌐ßäîßàíßå╝",
  "ßäçßà⌐ßäîßàÑßå½",
  "ßäçßà⌐ßäîßà⌐ßå½",
  "ßäçßà⌐ßäÉßà⌐ßå╝",
  "ßäçßà⌐ßäæßàºßå½ßäîßàÑßå¿",
  "ßäçßà⌐ßäÆßàÑßå╖",
  "ßäçßà⌐ßå¿ßäâßà⌐",
  "ßäçßà⌐ßå¿ßäëßàí",
  "ßäçßà⌐ßå¿ßäëßà«ßå╝ßäïßàí",
  "ßäçßà⌐ßå¿ßäëßà│ßå╕",
  "ßäçßà⌐ßå⌐ßäïßà│ßå╖",
  "ßäçßà⌐ßå½ßäÇßàºßå¿ßäîßàÑßå¿",
  "ßäçßà⌐ßå½ßäàßàó",
  "ßäçßà⌐ßå½ßäçßà«",
  "ßäçßà⌐ßå½ßäëßàí",
  "ßäçßà⌐ßå½ßäëßàÑßå╝",
  "ßäçßà⌐ßå½ßäïßà╡ßå½",
  "ßäçßà⌐ßå½ßäîßà╡ßå»",
  "ßäçßà⌐ßå»ßäæßàªßå½",
  "ßäçßà⌐ßå╝ßäëßàí",
  "ßäçßà⌐ßå╝ßäîßà╡",
  "ßäçßà⌐ßå╝ßäÉßà«",
  "ßäçßà«ßäÇßà│ßå½",
  "ßäçßà«ßäüßà│ßäàßàÑßäïßà«ßå╖",
  "ßäçßà«ßäâßàíßå╖",
  "ßäçßà«ßäâßà⌐ßå╝ßäëßàíßå½",
  "ßäçßà«ßäåßà«ßå½",
  "ßäçßà«ßäçßà«ßå½",
  "ßäçßà«ßäëßàíßå½",
  "ßäçßà«ßäëßàíßå╝",
  "ßäçßà«ßäïßàÑßå┐",
  "ßäçßà«ßäïßà╡ßå½",
  "ßäçßà«ßäîßàíßå¿ßäïßà¡ßå╝",
  "ßäçßà«ßäîßàíßå╝",
  "ßäçßà«ßäîßàÑßå╝",
  "ßäçßà«ßäîßà⌐ßå¿",
  "ßäçßà«ßäîßà╡ßäàßàÑßå½ßäÆßà╡",
  "ßäçßà«ßäÄßà╡ßå½",
  "ßäçßà«ßäÉßàíßå¿",
  "ßäçßà«ßäæßà«ßå╖",
  "ßäçßà«ßäÆßà¼ßäîßàíßå╝",
  "ßäçßà«ßå¿ßäçßà«",
  "ßäçßà«ßå¿ßäÆßàíßå½",
  "ßäçßà«ßå½ßäéßà⌐",
  "ßäçßà«ßå½ßäàßàúßå╝",
  "ßäçßà«ßå½ßäàßà╡",
  "ßäçßà«ßå½ßäåßàºßå╝",
  "ßäçßà«ßå½ßäëßàÑßå¿",
  "ßäçßà«ßå½ßäïßàú",
  "ßäçßà«ßå½ßäïßà▒ßäÇßà╡",
  "ßäçßà«ßå½ßäæßà╡ßå»",
  "ßäçßà«ßå½ßäÆßà⌐ßå╝ßäëßàóßå¿",
  "ßäçßà«ßå»ßäÇßà⌐ßäÇßà╡",
  "ßäçßà«ßå»ßäÇßà¬",
  "ßäçßà«ßå»ßäÇßà¡",
  "ßäçßà«ßå»ßäüßà⌐ßå╛",
  "ßäçßà«ßå»ßäåßàíßå½",
  "ßäçßà«ßå»ßäçßàÑßå╕",
  "ßäçßà«ßå»ßäçßà╡ßå╛",
  "ßäçßà«ßå»ßäïßàíßå½",
  "ßäçßà«ßå»ßäïßà╡ßäïßà╡ßå¿",
  "ßäçßà«ßå»ßäÆßàóßå╝",
  "ßäçßà│ßäàßàóßå½ßäâßà│",
  "ßäçßà╡ßäÇßà│ßå¿",
  "ßäçßà╡ßäéßàíßå½",
  "ßäçßà╡ßäéßà╡ßå»",
  "ßäçßà╡ßäâßà«ßå»ßäÇßà╡",
  "ßäçßà╡ßäâßà╡ßäïßà⌐",
  "ßäçßà╡ßäàßà⌐ßäëßà⌐",
  "ßäçßà╡ßäåßàíßå½",
  "ßäçßà╡ßäåßàºßå╝",
  "ßäçßà╡ßäåßà╡ßå»",
  "ßäçßà╡ßäçßàíßäàßàíßå╖",
  "ßäçßà╡ßäçßà╡ßå╖ßäçßàíßå╕",
  "ßäçßà╡ßäëßàíßå╝",
  "ßäçßà╡ßäïßà¡ßå╝",
  "ßäçßà╡ßäïßà▓ßå»",
  "ßäçßà╡ßäîßà«ßå╝",
  "ßäçßà╡ßäÉßàíßäåßà╡ßå½",
  "ßäçßà╡ßäæßàíßå½",
  "ßäçßà╡ßå»ßäâßà╡ßå╝",
  "ßäçßà╡ßå║ßäåßà«ßå»",
  "ßäçßà╡ßå║ßäçßàíßå╝ßäïßà«ßå»",
  "ßäçßà╡ßå║ßäîßà«ßå»ßäÇßà╡",
  "ßäçßà╡ßå╛ßäüßàíßå»",
  "ßäêßàíßå»ßäÇßàíßå½ßäëßàóßå¿",
  "ßäêßàíßå»ßäàßàó",
  "ßäêßàíßå»ßäàßà╡",
  "ßäëßàíßäÇßàÑßå½",
  "ßäëßàíßäÇßà¿ßäîßàÑßå»",
  "ßäëßàíßäéßàíßäïßà╡",
  "ßäëßàíßäéßàúßå╝",
  "ßäëßàíßäàßàíßå╖",
  "ßäëßàíßäàßàíßå╝",
  "ßäëßàíßäàßà╡ßå╕",
  "ßäëßàíßäåßà⌐ßäéßà╡ßå╖",
  "ßäëßàíßäåßà«ßå»",
  "ßäëßàíßäçßàíßå╝",
  "ßäëßàíßäëßàíßå╝",
  "ßäëßàíßäëßàóßå╝ßäÆßà¬ßå»",
  "ßäëßàíßäëßàÑßå»",
  "ßäëßàíßäëßà│ßå╖",
  "ßäëßàíßäëßà╡ßå»",
  "ßäëßàíßäïßàÑßå╕",
  "ßäëßàíßäïßà¡ßå╝",
  "ßäëßàíßäïßà»ßå»",
  "ßäëßàíßäîßàíßå╝",
  "ßäëßàíßäîßàÑßå½",
  "ßäëßàíßäîßà╡ßå½",
  "ßäëßàíßäÄßà⌐ßå½",
  "ßäëßàíßäÄßà«ßå½ßäÇßà╡",
  "ßäëßàíßäÉßàíßå╝",
  "ßäëßàíßäÉßà«ßäàßà╡",
  "ßäëßàíßäÆßà│ßå»",
  "ßäëßàíßå½ßäÇßà╡ßå»",
  "ßäëßàíßå½ßäçßà«ßäïßà╡ßå½ßäÇßà¬",
  "ßäëßàíßå½ßäïßàÑßå╕",
  "ßäëßàíßå½ßäÄßàóßå¿",
  "ßäëßàíßå»ßäàßà╡ßå╖",
  "ßäëßàíßå»ßäïßà╡ßå½",
  "ßäëßàíßå»ßäìßàíßå¿",
  "ßäëßàíßå╖ßäÇßà¿ßäÉßàíßå╝",
  "ßäëßàíßå╖ßäÇßà«ßå¿",
  "ßäëßàíßå╖ßäëßà╡ßå╕",
  "ßäëßàíßå╖ßäïßà»ßå»",
  "ßäëßàíßå╖ßäÄßà⌐ßå½",
  "ßäëßàíßå╝ßäÇßà¬ßå½",
  "ßäëßàíßå╝ßäÇßà│ßå╖",
  "ßäëßàíßå╝ßäâßàó",
  "ßäëßàíßå╝ßäàßà▓",
  "ßäëßàíßå╝ßäçßàíßå½ßäÇßà╡",
  "ßäëßàíßå╝ßäëßàíßå╝",
  "ßäëßàíßå╝ßäëßà╡ßå¿",
  "ßäëßàíßå╝ßäïßàÑßå╕",
  "ßäëßàíßå╝ßäïßà╡ßå½",
  "ßäëßàíßå╝ßäîßàí",
  "ßäëßàíßå╝ßäîßàÑßå╖",
  "ßäëßàíßå╝ßäÄßàÑ",
  "ßäëßàíßå╝ßäÄßà«",
  "ßäëßàíßå╝ßäÉßàó",
  "ßäëßàíßå╝ßäæßà¡",
  "ßäëßàíßå╝ßäæßà«ßå╖",
  "ßäëßàíßå╝ßäÆßà¬ßå╝",
  "ßäëßàóßäçßàºßå¿",
  "ßäëßàóßå¿ßäüßàíßå»",
  "ßäëßàóßå¿ßäïßàºßå½ßäæßà╡ßå»",
  "ßäëßàóßå╝ßäÇßàíßå¿",
  "ßäëßàóßå╝ßäåßàºßå╝",
  "ßäëßàóßå╝ßäåßà«ßå»",
  "ßäëßàóßå╝ßäçßàíßå╝ßäëßà⌐ßå╝",
  "ßäëßàóßå╝ßäëßàíßå½",
  "ßäëßàóßå╝ßäëßàÑßå½",
  "ßäëßàóßå╝ßäëßà╡ßå½",
  "ßäëßàóßå╝ßäïßà╡ßå»",
  "ßäëßàóßå╝ßäÆßà¬ßå»",
  "ßäëßàÑßäàßàíßå╕",
  "ßäëßàÑßäàßà│ßå½",
  "ßäëßàÑßäåßàºßå╝",
  "ßäëßàÑßäåßà╡ßå½",
  "ßäëßàÑßäçßà╡ßäëßà│",
  "ßäëßàÑßäïßàúßå╝",
  "ßäëßàÑßäïßà«ßå»",
  "ßäëßàÑßäîßàÑßå¿",
  "ßäëßàÑßäîßàÑßå╖",
  "ßäëßàÑßäìßà⌐ßå¿",
  "ßäëßàÑßäÅßà│ßå»",
  "ßäëßàÑßå¿ßäëßàí",
  "ßäëßàÑßå¿ßäïßà▓",
  "ßäëßàÑßå½ßäÇßàÑ",
  "ßäëßàÑßå½ßäåßà«ßå»",
  "ßäëßàÑßå½ßäçßàó",
  "ßäëßàÑßå½ßäëßàóßå╝",
  "ßäëßàÑßå½ßäëßà«",
  "ßäëßàÑßå½ßäïßà»ßå½",
  "ßäëßàÑßå½ßäîßàíßå╝",
  "ßäëßàÑßå½ßäîßàÑßå½",
  "ßäëßàÑßå½ßäÉßàóßå¿",
  "ßäëßàÑßå½ßäæßà«ßå╝ßäÇßà╡",
  "ßäëßàÑßå»ßäÇßàÑßäîßà╡",
  "ßäëßàÑßå»ßäéßàíßå»",
  "ßäëßàÑßå»ßäàßàÑßå╝ßäÉßàíßå╝",
  "ßäëßàÑßå»ßäåßàºßå╝",
  "ßäëßàÑßå»ßäåßà«ßå½",
  "ßäëßàÑßå»ßäëßàí",
  "ßäëßàÑßå»ßäïßàíßå¿ßäëßàíßå½",
  "ßäëßàÑßå»ßäÄßà╡",
  "ßäëßàÑßå»ßäÉßàíßå╝",
  "ßäëßàÑßå╕ßäèßà╡",
  "ßäëßàÑßå╝ßäÇßà⌐ßå╝",
  "ßäëßàÑßå╝ßäâßàíßå╝",
  "ßäëßàÑßå╝ßäåßàºßå╝",
  "ßäëßàÑßå╝ßäçßàºßå»",
  "ßäëßàÑßå╝ßäïßà╡ßå½",
  "ßäëßàÑßå╝ßäîßàíßå╝",
  "ßäëßàÑßå╝ßäîßàÑßå¿",
  "ßäëßàÑßå╝ßäîßà╡ßå»",
  "ßäëßàÑßå╝ßäÆßàíßå╖",
  "ßäëßàªßäÇßà│ßå╖",
  "ßäëßàªßäåßà╡ßäéßàí",
  "ßäëßàªßäëßàíßå╝",
  "ßäëßàªßäïßà»ßå»",
  "ßäëßàªßäîßà⌐ßå╝ßäâßàóßäïßà¬ßå╝",
  "ßäëßàªßäÉßàíßå¿",
  "ßäëßàªßå½ßäÉßàÑ",
  "ßäëßàªßå½ßäÉßà╡ßäåßà╡ßäÉßàÑ",
  "ßäëßàªßå║ßäìßàó",
  "ßäëßà⌐ßäÇßà▓ßäåßà⌐",
  "ßäëßà⌐ßäÇßà│ßå¿ßäîßàÑßå¿",
  "ßäëßà⌐ßäÇßà│ßå╖",
  "ßäëßà⌐ßäéßàíßäÇßà╡",
  "ßäëßà⌐ßäéßàºßå½",
  "ßäëßà⌐ßäâßà│ßå¿",
  "ßäëßà⌐ßäåßàíßå╝",
  "ßäëßà⌐ßäåßà«ßå½",
  "ßäëßà⌐ßäëßàÑßå»",
  "ßäëßà⌐ßäëßà⌐ßå¿",
  "ßäëßà⌐ßäïßàíßäÇßà¬",
  "ßäëßà⌐ßäïßà¡ßå╝",
  "ßäëßà⌐ßäïßà»ßå½",
  "ßäëßà⌐ßäïßà│ßå╖",
  "ßäëßà⌐ßäîßà«ßå╝ßäÆßà╡",
  "ßäëßà⌐ßäîßà╡ßäæßà«ßå╖",
  "ßäëßà⌐ßäîßà╡ßå»",
  "ßäëßà⌐ßäæßà«ßå╝",
  "ßäëßà⌐ßäÆßàºßå╝",
  "ßäëßà⌐ßå¿ßäâßàíßå╖",
  "ßäëßà⌐ßå¿ßäâßà⌐",
  "ßäëßà⌐ßå¿ßäïßà⌐ßå║",
  "ßäëßà⌐ßå½ßäÇßàíßäàßàíßå¿",
  "ßäëßà⌐ßå½ßäÇßà╡ßå»",
  "ßäëßà⌐ßå½ßäéßàº",
  "ßäëßà⌐ßå½ßäéßà╡ßå╖",
  "ßäëßà⌐ßå½ßäâßà│ßå╝",
  "ßäëßà⌐ßå½ßäåßà⌐ßå¿",
  "ßäëßà⌐ßå½ßäêßàºßå¿",
  "ßäëßà⌐ßå½ßäëßà╡ßå»",
  "ßäëßà⌐ßå½ßäîßà╡ßå»",
  "ßäëßà⌐ßå½ßäÉßà⌐ßå╕",
  "ßäëßà⌐ßå½ßäÆßàó",
  "ßäëßà⌐ßå»ßäîßà╡ßå¿ßäÆßà╡",
  "ßäëßà⌐ßå╖ßäèßà╡",
  "ßäëßà⌐ßå╝ßäïßàíßäîßà╡",
  "ßäëßà⌐ßå╝ßäïßà╡",
  "ßäëßà⌐ßå╝ßäæßàºßå½",
  "ßäëßà¼ßäÇßà⌐ßäÇßà╡",
  "ßäëßà¡ßäæßà╡ßå╝",
  "ßäëßà«ßäÇßàÑßå½",
  "ßäëßà«ßäéßàºßå½",
  "ßäëßà«ßäâßàíßå½",
  "ßäëßà«ßäâßà⌐ßå║ßäåßà«ßå»",
  "ßäëßà«ßäâßà⌐ßå╝ßäîßàÑßå¿",
  "ßäëßà«ßäåßàºßå½",
  "ßäëßà«ßäåßàºßå╝",
  "ßäëßà«ßäçßàíßå¿",
  "ßäëßà«ßäëßàíßå╝",
  "ßäëßà«ßäëßàÑßå¿",
  "ßäëßà«ßäëßà«ßå»",
  "ßäëßà«ßäëßà╡ßäàßà⌐",
  "ßäëßà«ßäïßàÑßå╕",
  "ßäëßà«ßäïßàºßå╖",
  "ßäëßà«ßäïßàºßå╝",
  "ßäëßà«ßäïßà╡ßå╕",
  "ßäëßà«ßäîßà«ßå½",
  "ßäëßà«ßäîßà╡ßå╕",
  "ßäëßà«ßäÄßà«ßå»",
  "ßäëßà«ßäÅßàÑßå║",
  "ßäëßà«ßäæßà╡ßå»",
  "ßäëßà«ßäÆßàíßå¿",
  "ßäëßà«ßäÆßàÑßå╖ßäëßàóßå╝",
  "ßäëßà«ßäÆßà¬ßäÇßà╡",
  "ßäëßà«ßå¿ßäéßàº",
  "ßäëßà«ßå¿ßäëßà⌐",
  "ßäëßà«ßå¿ßäîßàª",
  "ßäëßà«ßå½ßäÇßàíßå½",
  "ßäëßà«ßå½ßäëßàÑ",
  "ßäëßà«ßå½ßäëßà«",
  "ßäëßà«ßå½ßäëßà╡ßå¿ßäÇßàíßå½",
  "ßäëßà«ßå½ßäïßà▒",
  "ßäëßà«ßå«ßäÇßàíßäàßàíßå¿",
  "ßäëßà«ßå»ßäçßàºßå╝",
  "ßäëßà«ßå»ßäîßà╡ßå╕",
  "ßäëßà«ßå║ßäîßàí",
  "ßäëßà│ßäéßà╡ßå╖",
  "ßäëßà│ßäåßà«ßå»",
  "ßäëßà│ßäëßà│ßäàßà⌐",
  "ßäëßà│ßäëßà│ßå╝",
  "ßäëßà│ßäïßà░ßäÉßàÑ",
  "ßäëßà│ßäïßà▒ßäÄßà╡",
  "ßäëßà│ßäÅßàªßäïßà╡ßäÉßà│",
  "ßäëßà│ßäÉßà▓ßäâßà╡ßäïßà⌐",
  "ßäëßà│ßäÉßà│ßäàßàªßäëßà│",
  "ßäëßà│ßäæßà⌐ßäÄßà│",
  "ßäëßà│ßå»ßäìßàÑßå¿",
  "ßäëßà│ßå»ßäæßà│ßå╖",
  "ßäëßà│ßå╕ßäÇßà¬ßå½",
  "ßäëßà│ßå╕ßäÇßà╡",
  "ßäëßà│ßå╝ßäÇßàóßå¿",
  "ßäëßà│ßå╝ßäàßà╡",
  "ßäëßà│ßå╝ßäçßà«",
  "ßäëßà│ßå╝ßäïßà¡ßå╝ßäÄßàí",
  "ßäëßà│ßå╝ßäîßà╡ßå½",
  "ßäëßà╡ßäÇßàíßå¿",
  "ßäëßà╡ßäÇßàíßå½",
  "ßäëßà╡ßäÇßà⌐ßå»",
  "ßäëßà╡ßäÇßà│ßå╖ßäÄßà╡",
  "ßäëßà╡ßäéßàíßäàßà╡ßäïßà⌐",
  "ßäëßà╡ßäâßàóßå¿",
  "ßäëßà╡ßäàßà╡ßäîßà│",
  "ßäëßà╡ßäåßàªßå½ßäÉßà│",
  "ßäëßà╡ßäåßà╡ßå½",
  "ßäëßà╡ßäçßà«ßäåßà⌐",
  "ßäëßà╡ßäëßàÑßå½",
  "ßäëßà╡ßäëßàÑßå»",
  "ßäëßà╡ßäëßà│ßäÉßàªßå╖",
  "ßäëßà╡ßäïßàíßäçßàÑßäîßà╡",
  "ßäëßà╡ßäïßàÑßäåßàÑßäéßà╡",
  "ßäëßà╡ßäïßà»ßå»",
  "ßäëßà╡ßäïßà╡ßå½",
  "ßäëßà╡ßäïßà╡ßå»",
  "ßäëßà╡ßäîßàíßå¿",
  "ßäëßà╡ßäîßàíßå╝",
  "ßäëßà╡ßäîßàÑßå»",
  "ßäëßà╡ßäîßàÑßå╖",
  "ßäëßà╡ßäîßà«ßå╝",
  "ßäëßà╡ßäîßà│ßå½",
  "ßäëßà╡ßäîßà╡ßå╕",
  "ßäëßà╡ßäÄßàÑßå╝",
  "ßäëßà╡ßäÆßàíßå╕",
  "ßäëßà╡ßäÆßàÑßå╖",
  "ßäëßà╡ßå¿ßäÇßà«",
  "ßäëßà╡ßå¿ßäÇßà╡",
  "ßäëßà╡ßå¿ßäâßàíßå╝",
  "ßäëßà╡ßå¿ßäàßàúßå╝",
  "ßäëßà╡ßå¿ßäàßà¡ßäæßà«ßå╖",
  "ßäëßà╡ßå¿ßäåßà«ßå»",
  "ßäëßà╡ßå¿ßäêßàíßå╝",
  "ßäëßà╡ßå¿ßäëßàí",
  "ßäëßà╡ßå¿ßäëßàóßå╝ßäÆßà¬ßå»",
  "ßäëßà╡ßå¿ßäÄßà⌐",
  "ßäëßà╡ßå¿ßäÉßàíßå¿",
  "ßäëßà╡ßå¿ßäæßà«ßå╖",
  "ßäëßà╡ßå½ßäÇßà⌐",
  "ßäëßà╡ßå½ßäÇßà▓",
  "ßäëßà╡ßå½ßäéßàºßå╖",
  "ßäëßà╡ßå½ßäåßà«ßå½",
  "ßäëßà╡ßå½ßäçßàíßå»",
  "ßäëßà╡ßå½ßäçßà╡",
  "ßäëßà╡ßå½ßäëßàí",
  "ßäëßà╡ßå½ßäëßàª",
  "ßäëßà╡ßå½ßäïßà¡ßå╝",
  "ßäëßà╡ßå½ßäîßàªßäæßà«ßå╖",
  "ßäëßà╡ßå½ßäÄßàÑßå╝",
  "ßäëßà╡ßå½ßäÄßàª",
  "ßäëßà╡ßå½ßäÆßà¬",
  "ßäëßà╡ßå»ßäÇßàíßå╖",
  "ßäëßà╡ßå»ßäéßàó",
  "ßäëßà╡ßå»ßäàßàºßå¿",
  "ßäëßà╡ßå»ßäàßà¿",
  "ßäëßà╡ßå»ßäåßàíßå╝",
  "ßäëßà╡ßå»ßäëßà«",
  "ßäëßà╡ßå»ßäëßà│ßå╕",
  "ßäëßà╡ßå»ßäëßà╡",
  "ßäëßà╡ßå»ßäîßàíßå╝",
  "ßäëßà╡ßå»ßäîßàÑßå╝",
  "ßäëßà╡ßå»ßäîßà╡ßå»ßäîßàÑßå¿",
  "ßäëßà╡ßå»ßäÄßàÑßå½",
  "ßäëßà╡ßå»ßäÄßàª",
  "ßäëßà╡ßå»ßäÅßàÑßå║",
  "ßäëßà╡ßå»ßäÉßàó",
  "ßäëßà╡ßå»ßäæßàó",
  "ßäëßà╡ßå»ßäÆßàÑßå╖",
  "ßäëßà╡ßå»ßäÆßàºßå½",
  "ßäëßà╡ßå╖ßäàßà╡",
  "ßäëßà╡ßå╖ßäçßà«ßäàßà│ßå╖",
  "ßäëßà╡ßå╖ßäëßàí",
  "ßäëßà╡ßå╖ßäîßàíßå╝",
  "ßäëßà╡ßå╖ßäîßàÑßå╝",
  "ßäëßà╡ßå╖ßäæßàíßå½",
  "ßäèßàíßå╝ßäâßà«ßå╝ßäïßà╡",
  "ßäèßà╡ßäàßà│ßå╖",
  "ßäèßà╡ßäïßàíßå║",
  "ßäïßàíßäÇßàíßäèßà╡",
  "ßäïßàíßäéßàíßäïßà«ßå½ßäëßàÑ",
  "ßäïßàíßäâßà│ßäéßà╡ßå╖",
  "ßäïßàíßäâßà│ßå»",
  "ßäïßàíßäëßà▒ßäïßà«ßå╖",
  "ßäïßàíßäëßà│ßäæßàíßå»ßäÉßà│",
  "ßäïßàíßäëßà╡ßäïßàí",
  "ßäïßàíßäïßà«ßå»ßäàßàÑ",
  "ßäïßàíßäîßàÑßäèßà╡",
  "ßäïßàíßäîßà«ßå╖ßäåßàí",
  "ßäïßàíßäîßà╡ßå¿",
  "ßäïßàíßäÄßà╡ßå╖",
  "ßäïßàíßäæßàíßäÉßà│",
  "ßäïßàíßäæßà│ßäàßà╡ßäÅßàí",
  "ßäïßàíßäæßà│ßå╖",
  "ßäïßàíßäÆßà⌐ßå╕",
  "ßäïßàíßäÆßà│ßå½",
  "ßäïßàíßå¿ßäÇßà╡",
  "ßäïßàíßå¿ßäåßà⌐ßå╝",
  "ßäïßàíßå¿ßäëßà«",
  "ßäïßàíßå½ßäÇßàó",
  "ßäïßàíßå½ßäÇßàºßå╝",
  "ßäïßàíßå½ßäÇßà¬",
  "ßäïßàíßå½ßäéßàó",
  "ßäïßàíßå½ßäéßàºßå╝",
  "ßäïßàíßå½ßäâßà⌐ßå╝",
  "ßäïßàíßå½ßäçßàíßå╝",
  "ßäïßàíßå½ßäçßà«",
  "ßäïßàíßå½ßäîßà«",
  "ßäïßàíßå»ßäàßà«ßäåßà╡ßäéßà▓ßå╖",
  "ßäïßàíßå»ßäÅßà⌐ßäïßà⌐ßå»",
  "ßäïßàíßå╖ßäëßà╡",
  "ßäïßàíßå╖ßäÅßàÑßå║",
  "ßäïßàíßå╕ßäàßàºßå¿",
  "ßäïßàíßçüßäéßàíßå»",
  "ßäïßàíßçüßäåßà«ßå½",
  "ßäïßàóßäïßà╡ßå½",
  "ßäïßàóßäîßàÑßå╝",
  "ßäïßàóßå¿ßäëßà«",
  "ßäïßàóßå»ßäçßàÑßå╖",
  "ßäïßàúßäÇßàíßå½",
  "ßäïßàúßäâßàíßå½",
  "ßäïßàúßäïßà⌐ßå╝",
  "ßäïßàúßå¿ßäÇßàíßå½",
  "ßäïßàúßå¿ßäÇßà«ßå¿",
  "ßäïßàúßå¿ßäëßà⌐ßå¿",
  "ßäïßàúßå¿ßäëßà«",
  "ßäïßàúßå¿ßäîßàÑßå╖",
  "ßäïßàúßå¿ßäæßà«ßå╖",
  "ßäïßàúßå¿ßäÆßà⌐ßå½ßäéßàº",
  "ßäïßàúßå╝ßäéßàºßå╖",
  "ßäïßàúßå╝ßäàßàºßå¿",
  "ßäïßàúßå╝ßäåßàíßå»",
  "ßäïßàúßå╝ßäçßàóßäÄßà«",
  "ßäïßàúßå╝ßäîßà«",
  "ßäïßàúßå╝ßäæßàí",
  "ßäïßàÑßäâßà«ßå╖",
  "ßäïßàÑßäàßàºßäïßà«ßå╖",
  "ßäïßàÑßäàßà│ßå½",
  "ßäïßàÑßäîßàªßå║ßäçßàíßå╖",
  "ßäïßàÑßäìßàóßå╗ßäâßà│ßå½",
  "ßäïßàÑßäìßàÑßäâßàíßäÇßàí",
  "ßäïßàÑßäìßàÑßå½ßäîßà╡",
  "ßäïßàÑßå½ßäéßà╡",
  "ßäïßàÑßå½ßäâßàÑßå¿",
  "ßäïßàÑßå½ßäàßà⌐ßå½",
  "ßäïßàÑßå½ßäïßàÑ",
  "ßäïßàÑßå»ßäÇßà«ßå»",
  "ßäïßàÑßå»ßäàßà│ßå½",
  "ßäïßàÑßå»ßäïßà│ßå╖",
  "ßäïßàÑßå»ßäæßà╡ßå║",
  "ßäïßàÑßå╖ßäåßàí",
  "ßäïßàÑßå╕ßäåßà«",
  "ßäïßàÑßå╕ßäîßà⌐ßå╝",
  "ßäïßàÑßå╕ßäÄßàª",
  "ßäïßàÑßå╝ßäâßàÑßå╝ßäïßà╡",
  "ßäïßàÑßå╝ßäåßàíßå╝",
  "ßäïßàÑßå╝ßäÉßàÑßäàßà╡",
  "ßäïßàÑßå╜ßäÇßà│ßäîßàª",
  "ßäïßàªßäéßàÑßäîßà╡",
  "ßäïßàªßäïßàÑßäÅßàÑßå½",
  "ßäïßàªßå½ßäîßà╡ßå½",
  "ßäïßàºßäÇßàÑßå½",
  "ßäïßàºßäÇßà⌐ßäëßàóßå╝",
  "ßäïßàºßäÇßà¬ßå½",
  "ßäïßàºßäÇßà«ßå½",
  "ßäïßàºßäÇßà»ßå½",
  "ßäïßàºßäâßàóßäëßàóßå╝",
  "ßäïßàºßäâßàÑßå▓",
  "ßäïßàºßäâßà⌐ßå╝ßäëßàóßå╝",
  "ßäïßàºßäâßà│ßå½",
  "ßäïßàºßäàßà⌐ßå½",
  "ßäïßàºßäàßà│ßå╖",
  "ßäïßàºßäëßàÑßå║",
  "ßäïßàºßäëßàÑßå╝",
  "ßäïßàºßäïßà¬ßå╝",
  "ßäïßàºßäïßà╡ßå½",
  "ßäïßàºßäîßàÑßå½ßäÆßà╡",
  "ßäïßàºßäîßà╡ßå¿ßäïßà»ßå½",
  "ßäïßàºßäÆßàíßå¿ßäëßàóßå╝",
  "ßäïßàºßäÆßàóßå╝",
  "ßäïßàºßå¿ßäëßàí",
  "ßäïßàºßå¿ßäëßà╡",
  "ßäïßàºßå¿ßäÆßàíßå»",
  "ßäïßàºßå½ßäÇßàºßå»",
  "ßäïßàºßå½ßäÇßà«",
  "ßäïßàºßå½ßäÇßà│ßå¿",
  "ßäïßàºßå½ßäÇßà╡",
  "ßäïßàºßå½ßäàßàíßå¿",
  "ßäïßàºßå½ßäëßàÑßå»",
  "ßäïßàºßå½ßäëßàª",
  "ßäïßàºßå½ßäëßà⌐ßå¿",
  "ßäïßàºßå½ßäëßà│ßå╕",
  "ßäïßàºßå½ßäïßàó",
  "ßäïßàºßå½ßäïßà¿ßäïßà╡ßå½",
  "ßäïßàºßå½ßäïßà╡ßå½",
  "ßäïßàºßå½ßäîßàíßå╝",
  "ßäïßàºßå½ßäîßà«",
  "ßäïßàºßå½ßäÄßà«ßå»",
  "ßäïßàºßå½ßäæßà╡ßå»",
  "ßäïßàºßå½ßäÆßàíßå╕",
  "ßäïßàºßå½ßäÆßà▓",
  "ßäïßàºßå»ßäÇßà╡",
  "ßäïßàºßå»ßäåßàó",
  "ßäïßàºßå»ßäëßà¼",
  "ßäïßàºßå»ßäëßà╡ßå╖ßäÆßà╡",
  "ßäïßàºßå»ßäîßàÑßå╝",
  "ßäïßàºßå»ßäÄßàí",
  "ßäïßàºßå»ßäÆßà│ßå»",
  "ßäïßàºßå╖ßäàßàº",
  "ßäïßàºßå╕ßäëßàÑ",
  "ßäïßàºßå╝ßäÇßà«ßå¿",
  "ßäïßàºßå╝ßäéßàíßå╖",
  "ßäïßàºßå╝ßäëßàíßå╝",
  "ßäïßàºßå╝ßäïßàúßå╝",
  "ßäïßàºßå╝ßäïßàºßå¿",
  "ßäïßàºßå╝ßäïßà«ßå╝",
  "ßäïßàºßå╝ßäïßà»ßå½ßäÆßà╡",
  "ßäïßàºßå╝ßäÆßàí",
  "ßäïßàºßå╝ßäÆßàúßå╝",
  "ßäïßàºßå╝ßäÆßà⌐ßå½",
  "ßäïßàºßå╝ßäÆßà¬",
  "ßäïßàºßçüßäÇßà«ßäàßà╡",
  "ßäïßàºßçüßäçßàíßå╝",
  "ßäïßàºßçüßäîßà╡ßå╕",
  "ßäïßà¿ßäÇßàíßå╖",
  "ßäïßà¿ßäÇßà│ßå╖",
  "ßäïßà¿ßäçßàíßå╝",
  "ßäïßà¿ßäëßàíßå½",
  "ßäïßà¿ßäëßàíßå╝",
  "ßäïßà¿ßäëßàÑßå½",
  "ßäïßà¿ßäëßà«ßå»",
  "ßäïßà¿ßäëßà│ßå╕",
  "ßäïßà¿ßäëßà╡ßå¿ßäîßàíßå╝",
  "ßäïßà¿ßäïßàúßå¿",
  "ßäïßà¿ßäîßàÑßå½",
  "ßäïßà¿ßäîßàÑßå»",
  "ßäïßà¿ßäîßàÑßå╝",
  "ßäïßà¿ßäÅßàÑßå½ßäâßàó",
  "ßäïßà¿ßå║ßäéßàíßå»",
  "ßäïßà⌐ßäéßà│ßå»",
  "ßäïßà⌐ßäàßàíßå¿",
  "ßäïßà⌐ßäàßàóßå║ßäâßà⌐ßå╝ßäïßàíßå½",
  "ßäïßà⌐ßäàßàªßå½ßäîßà╡",
  "ßäïßà⌐ßäàßà⌐ßäîßà╡",
  "ßäïßà⌐ßäàßà│ßå½ßäçßàíßå»",
  "ßäïßà⌐ßäçßà│ßå½",
  "ßäïßà⌐ßäëßà╡ßå╕",
  "ßäïßà⌐ßäïßàºßå╖",
  "ßäïßà⌐ßäïßà»ßå»",
  "ßäïßà⌐ßäîßàÑßå½",
  "ßäïßà⌐ßäîßà╡ßå¿",
  "ßäïßà⌐ßäîßà╡ßå╝ßäïßàÑ",
  "ßäïßà⌐ßäæßàªßäàßàí",
  "ßäïßà⌐ßäæßà╡ßäëßà│ßäÉßàªßå»",
  "ßäïßà⌐ßäÆßà╡ßäàßàº",
  "ßäïßà⌐ßå¿ßäëßàíßå╝",
  "ßäïßà⌐ßå¿ßäëßà«ßäëßà«",
  "ßäïßà⌐ßå½ßäÇßàíßå╜",
  "ßäïßà⌐ßå½ßäàßàíßäïßà╡ßå½",
  "ßäïßà⌐ßå½ßäåßà⌐ßå╖",
  "ßäïßà⌐ßå½ßäîßà⌐ßå╝ßäïßà╡ßå»",
  "ßäïßà⌐ßå½ßäÉßà⌐ßå╝",
  "ßäïßà⌐ßå»ßäÇßàíßäïßà│ßå»",
  "ßäïßà⌐ßå»ßäàßà╡ßå╖ßäæßà╡ßå¿",
  "ßäïßà⌐ßå»ßäÆßàó",
  "ßäïßà⌐ßå║ßäÄßàíßäàßà╡ßå╖",
  "ßäïßà¬ßäïßà╡ßäëßàºßäÄßà│",
  "ßäïßà¬ßäïßà╡ßå½",
  "ßäïßà¬ßå½ßäëßàÑßå╝",
  "ßäïßà¬ßå½ßäîßàÑßå½",
  "ßäïßà¬ßå╝ßäçßà╡",
  "ßäïßà¬ßå╝ßäîßàí",
  "ßäïßà½ßäéßàúßäÆßàíßäåßàºßå½",
  "ßäïßà½ßå½ßäîßà╡",
  "ßäïßà¼ßäÇßàíßå║ßäîßà╡ßå╕",
  "ßäïßà¼ßäÇßà«ßå¿",
  "ßäïßà¼ßäàßà⌐ßäïßà«ßå╖",
  "ßäïßà¼ßäëßàíßå╖ßäÄßà⌐ßå½",
  "ßäïßà¼ßäÄßà«ßå»",
  "ßäïßà¼ßäÄßà╡ßå╖",
  "ßäïßà¼ßäÆßàíßå»ßäåßàÑßäéßà╡",
  "ßäïßà¼ßå½ßäçßàíßå»",
  "ßäïßà¼ßå½ßäëßà⌐ßå½",
  "ßäïßà¼ßå½ßäìßà⌐ßå¿",
  "ßäïßà¡ßäÇßà│ßå╖",
  "ßäïßà¡ßäïßà╡ßå»",
  "ßäïßà¡ßäîßà│ßå╖",
  "ßäïßà¡ßäÄßàÑßå╝",
  "ßäïßà¡ßå╝ßäÇßà╡",
  "ßäïßà¡ßå╝ßäëßàÑ",
  "ßäïßà¡ßå╝ßäïßàÑ",
  "ßäïßà«ßäëßàíßå½",
  "ßäïßà«ßäëßàÑßå½",
  "ßäïßà«ßäëßà│ßå╝",
  "ßäïßà«ßäïßàºßå½ßäÆßà╡",
  "ßäïßà«ßäîßàÑßå╝",
  "ßäïßà«ßäÄßàªßäÇßà«ßå¿",
  "ßäïßà«ßäæßàºßå½",
  "ßäïßà«ßå½ßäâßà⌐ßå╝",
  "ßäïßà«ßå½ßäåßàºßå╝",
  "ßäïßà«ßå½ßäçßàíßå½",
  "ßäïßà«ßå½ßäîßàÑßå½",
  "ßäïßà«ßå½ßäÆßàóßå╝",
  "ßäïßà«ßå»ßäëßàíßå½",
  "ßäïßà«ßå»ßäïßà│ßå╖",
  "ßäïßà«ßå╖ßäîßà╡ßå¿ßäïßà╡ßå╖",
  "ßäïßà«ßå║ßäïßàÑßäàßà│ßå½",
  "ßäïßà«ßå║ßäïßà│ßå╖",
  "ßäïßà»ßäéßàíßå¿",
  "ßäïßà»ßå½ßäÇßà⌐",
  "ßäïßà»ßå½ßäàßàó",
  "ßäïßà»ßå½ßäëßàÑ",
  "ßäïßà»ßå½ßäëßà«ßå╝ßäïßà╡",
  "ßäïßà»ßå½ßäïßà╡ßå½",
  "ßäïßà»ßå½ßäîßàíßå╝",
  "ßäïßà»ßå½ßäæßà╡ßäëßà│",
  "ßäïßà»ßå»ßäÇßà│ßå╕",
  "ßäïßà»ßå»ßäâßà│ßäÅßàÑßå╕",
  "ßäïßà»ßå»ßäëßàª",
  "ßäïßà»ßå»ßäïßà¡ßäïßà╡ßå»",
  "ßäïßà░ßäïßà╡ßäÉßàÑ",
  "ßäïßà▒ßäçßàíßå½",
  "ßäïßà▒ßäçßàÑßå╕",
  "ßäïßà▒ßäëßàÑßå╝",
  "ßäïßà▒ßäïßà»ßå½",
  "ßäïßà▒ßäÆßàÑßå╖",
  "ßäïßà▒ßäÆßàºßå╕",
  "ßäïßà▒ßå║ßäëßàíßäàßàíßå╖",
  "ßäïßà▓ßäéßàíßå½ßäÆßà╡",
  "ßäïßà▓ßäàßàÑßå╕",
  "ßäïßà▓ßäåßàºßå╝",
  "ßäïßà▓ßäåßà«ßå»",
  "ßäïßà▓ßäëßàíßå½",
  "ßäïßà▓ßäîßàÑßå¿",
  "ßäïßà▓ßäÄßà╡ßäïßà»ßå½",
  "ßäïßà▓ßäÆßàíßå¿",
  "ßäïßà▓ßäÆßàóßå╝",
  "ßäïßà▓ßäÆßàºßå╝",
  "ßäïßà▓ßå¿ßäÇßà«ßå½",
  "ßäïßà▓ßå¿ßäëßàíßå╝",
  "ßäïßà▓ßå¿ßäëßà╡ßå╕",
  "ßäïßà▓ßå¿ßäÄßàª",
  "ßäïßà│ßå½ßäÆßàóßå╝",
  "ßäïßà│ßå╖ßäàßàºßå¿",
  "ßäïßà│ßå╖ßäàßà¡",
  "ßäïßà│ßå╖ßäçßàíßå½",
  "ßäïßà│ßå╖ßäëßàÑßå╝",
  "ßäïßà│ßå╖ßäëßà╡ßå¿",
  "ßäïßà│ßå╖ßäïßàíßå¿",
  "ßäïßà│ßå╖ßäîßà«",
  "ßäïßà┤ßäÇßàºßå½",
  "ßäïßà┤ßäéßà⌐ßå½",
  "ßäïßà┤ßäåßà«ßå½",
  "ßäïßà┤ßäçßà⌐ßå¿",
  "ßäïßà┤ßäëßà╡ßå¿",
  "ßäïßà┤ßäëßà╡ßå╖",
  "ßäïßà┤ßäïßà¼ßäàßà⌐",
  "ßäïßà┤ßäïßà¡ßå¿",
  "ßäïßà┤ßäïßà»ßå½",
  "ßäïßà┤ßäÆßàíßå¿",
  "ßäïßà╡ßäÇßàÑßå║",
  "ßäïßà╡ßäÇßà⌐ßå║",
  "ßäïßà╡ßäéßàºßå╖",
  "ßäïßà╡ßäéßà⌐ßå╖",
  "ßäïßà╡ßäâßàíßå»",
  "ßäïßà╡ßäâßàóßäàßà⌐",
  "ßäïßà╡ßäâßà⌐ßå╝",
  "ßäïßà╡ßäàßàÑßçéßäÇßàª",
  "ßäïßà╡ßäàßàºßå¿ßäëßàÑ",
  "ßäïßà╡ßäàßà⌐ßå½ßäîßàÑßå¿",
  "ßäïßà╡ßäàßà│ßå╖",
  "ßäïßà╡ßäåßà╡ßå½",
  "ßäïßà╡ßäçßàíßå»ßäëßà⌐",
  "ßäïßà╡ßäçßàºßå»",
  "ßäïßà╡ßäçßà«ßå»",
  "ßäïßà╡ßäêßàíßå»",
  "ßäïßà╡ßäëßàíßå╝",
  "ßäïßà╡ßäëßàÑßå╝",
  "ßäïßà╡ßäëßà│ßå»",
  "ßäïßà╡ßäïßàúßäÇßà╡",
  "ßäïßà╡ßäïßà¡ßå╝",
  "ßäïßà╡ßäïßà«ßå║",
  "ßäïßà╡ßäïßà»ßå»",
  "ßäïßà╡ßäïßà│ßå¿ßäÇßà⌐",
  "ßäïßà╡ßäïßà╡ßå¿",
  "ßäïßà╡ßäîßàÑßå½",
  "ßäïßà╡ßäîßà«ßå╝",
  "ßäïßà╡ßäÉßà│ßå«ßäéßàíßå»",
  "ßäïßà╡ßäÉßà│ßå»",
  "ßäïßà╡ßäÆßà⌐ßå½",
  "ßäïßà╡ßå½ßäÇßàíßå½",
  "ßäïßà╡ßå½ßäÇßàºßå¿",
  "ßäïßà╡ßå½ßäÇßà⌐ßå╝",
  "ßäïßà╡ßå½ßäÇßà«",
  "ßäïßà╡ßå½ßäÇßà│ßå½",
  "ßäïßà╡ßå½ßäÇßà╡",
  "ßäïßà╡ßå½ßäâßà⌐",
  "ßäïßà╡ßå½ßäàßà▓",
  "ßäïßà╡ßå½ßäåßà«ßå»",
  "ßäïßà╡ßå½ßäëßàóßå╝",
  "ßäïßà╡ßå½ßäëßà½",
  "ßäïßà╡ßå½ßäïßàºßå½",
  "ßäïßà╡ßå½ßäïßà»ßå½",
  "ßäïßà╡ßå½ßäîßàó",
  "ßäïßà╡ßå½ßäîßà⌐ßå╝",
  "ßäïßà╡ßå½ßäÄßàÑßå½",
  "ßäïßà╡ßå½ßäÄßàª",
  "ßäïßà╡ßå½ßäÉßàÑßäéßàªßå║",
  "ßäïßà╡ßå½ßäÆßàí",
  "ßäïßà╡ßå½ßäÆßàºßå╝",
  "ßäïßà╡ßå»ßäÇßà⌐ßå╕",
  "ßäïßà╡ßå»ßäÇßà╡",
  "ßäïßà╡ßå»ßäâßàíßå½",
  "ßäïßà╡ßå»ßäâßàó",
  "ßäïßà╡ßå»ßäâßà│ßå╝",
  "ßäïßà╡ßå»ßäçßàíßå½",
  "ßäïßà╡ßå»ßäçßà⌐ßå½",
  "ßäïßà╡ßå»ßäçßà«",
  "ßäïßà╡ßå»ßäëßàíßå╝",
  "ßäïßà╡ßå»ßäëßàóßå╝",
  "ßäïßà╡ßå»ßäëßà⌐ßå½",
  "ßäïßà╡ßå»ßäïßà¡ßäïßà╡ßå»",
  "ßäïßà╡ßå»ßäïßà»ßå»",
  "ßäïßà╡ßå»ßäîßàÑßå╝",
  "ßäïßà╡ßå»ßäîßà⌐ßå╝",
  "ßäïßà╡ßå»ßäîßà«ßäïßà╡ßå»",
  "ßäïßà╡ßå»ßäìßà╡ßå¿",
  "ßäïßà╡ßå»ßäÄßàª",
  "ßäïßà╡ßå»ßäÄßà╡",
  "ßäïßà╡ßå»ßäÆßàóßå╝",
  "ßäïßà╡ßå»ßäÆßà¼ßäïßà¡ßå╝",
  "ßäïßà╡ßå╖ßäÇßà│ßå╖",
  "ßäïßà╡ßå╖ßäåßà«",
  "ßäïßà╡ßå╕ßäâßàó",
  "ßäïßà╡ßå╕ßäàßàºßå¿",
  "ßäïßà╡ßå╕ßäåßàíßå║",
  "ßäïßà╡ßå╕ßäëßàí",
  "ßäïßà╡ßå╕ßäëßà«ßå»",
  "ßäïßà╡ßå╕ßäëßà╡",
  "ßäïßà╡ßå╕ßäïßà»ßå½",
  "ßäïßà╡ßå╕ßäîßàíßå╝",
  "ßäïßà╡ßå╕ßäÆßàíßå¿",
  "ßäîßàíßäÇßàíßäïßà¡ßå╝",
  "ßäîßàíßäÇßàºßå¿",
  "ßäîßàíßäÇßà│ßå¿",
  "ßäîßàíßäâßà⌐ßå╝",
  "ßäîßàíßäàßàíßå╝",
  "ßäîßàíßäçßà«ßäëßà╡ßå╖",
  "ßäîßàíßäëßà╡ßå¿",
  "ßäîßàíßäëßà╡ßå½",
  "ßäîßàíßäïßàºßå½",
  "ßäîßàíßäïßà»ßå½",
  "ßäîßàíßäïßà▓ßå»",
  "ßäîßàíßäîßàÑßå½ßäÇßàÑ",
  "ßäîßàíßäîßàÑßå╝",
  "ßäîßàíßäîßà⌐ßå½ßäëßà╡ßå╖",
  "ßäîßàíßäæßàíßå½",
  "ßäîßàíßå¿ßäÇßàí",
  "ßäîßàíßå¿ßäéßàºßå½",
  "ßäîßàíßå¿ßäëßàÑßå╝",
  "ßäîßàíßå¿ßäïßàÑßå╕",
  "ßäîßàíßå¿ßäïßà¡ßå╝",
  "ßäîßàíßå¿ßäïßà│ßå½ßääßàíßå»",
  "ßäîßàíßå¿ßäæßà«ßå╖",
  "ßäîßàíßå½ßäâßà╡",
  "ßäîßàíßå½ßääßà│ßå¿",
  "ßäîßàíßå½ßäÄßà╡",
  "ßäîßàíßå»ßäåßà⌐ßå║",
  "ßäîßàíßå╖ßäüßàíßå½",
  "ßäîßàíßå╖ßäëßà«ßäÆßàíßå╖",
  "ßäîßàíßå╖ßäëßà╡",
  "ßäîßàíßå╖ßäïßà⌐ßå║",
  "ßäîßàíßå╖ßäîßàíßäàßà╡",
  "ßäîßàíßå╕ßäîßà╡",
  "ßäîßàíßå╝ßäÇßà¬ßå½",
  "ßäîßàíßå╝ßäÇßà«ßå½",
  "ßäîßàíßå╝ßäÇßà╡ßäÇßàíßå½",
  "ßäîßàíßå╝ßäàßàó",
  "ßäîßàíßå╝ßäàßà¿",
  "ßäîßàíßå╝ßäàßà│",
  "ßäîßàíßå╝ßäåßàí",
  "ßäîßàíßå╝ßäåßàºßå½",
  "ßäîßàíßå╝ßäåßà⌐",
  "ßäîßàíßå╝ßäåßà╡",
  "ßäîßàíßå╝ßäçßà╡",
  "ßäîßàíßå╝ßäëßàí",
  "ßäîßàíßå╝ßäëßà⌐",
  "ßäîßàíßå╝ßäëßà╡ßå¿",
  "ßäîßàíßå╝ßäïßàóßäïßà╡ßå½",
  "ßäîßàíßå╝ßäïßà╡ßå½",
  "ßäîßàíßå╝ßäîßàÑßå╖",
  "ßäîßàíßå╝ßäÄßàí",
  "ßäîßàíßå╝ßäÆßàíßå¿ßäÇßà│ßå╖",
  "ßäîßàóßäéßà│ßå╝",
  "ßäîßàóßäêßàíßå»ßäàßà╡",
  "ßäîßàóßäëßàíßå½",
  "ßäîßàóßäëßàóßå╝",
  "ßäîßàóßäîßàíßå¿ßäéßàºßå½",
  "ßäîßàóßäîßàÑßå╝",
  "ßäîßàóßäÄßàóßäÇßà╡",
  "ßäîßàóßäæßàíßå½",
  "ßäîßàóßäÆßàíßå¿",
  "ßäîßàóßäÆßà¬ßå»ßäïßà¡ßå╝",
  "ßäîßàÑßäÇßàÑßå║",
  "ßäîßàÑßäÇßà⌐ßäàßà╡",
  "ßäîßàÑßäÇßà⌐ßå║",
  "ßäîßàÑßäéßàºßå¿",
  "ßäîßàÑßäàßàÑßå½",
  "ßäîßàÑßäàßàÑßçéßäÇßàª",
  "ßäîßàÑßäçßàÑßå½",
  "ßäîßàÑßäïßà«ßå»",
  "ßäîßàÑßäîßàÑßå»ßäàßà⌐",
  "ßäîßàÑßäÄßà«ßå¿",
  "ßäîßàÑßå¿ßäÇßà│ßå¿",
  "ßäîßàÑßå¿ßäâßàíßå╝ßäÆßà╡",
  "ßäîßàÑßå¿ßäëßàÑßå╝",
  "ßäîßàÑßå¿ßäïßà¡ßå╝",
  "ßäîßàÑßå¿ßäïßà│ßå╝",
  "ßäîßàÑßå½ßäÇßàó",
  "ßäîßàÑßå½ßäÇßà⌐ßå╝",
  "ßäîßàÑßå½ßäÇßà╡",
  "ßäîßàÑßå½ßäâßàíßå»",
  "ßäîßàÑßå½ßäàßàíßäâßà⌐",
  "ßäîßàÑßå½ßäåßàíßå╝",
  "ßäîßàÑßå½ßäåßà«ßå½",
  "ßäîßàÑßå½ßäçßàíßå½",
  "ßäîßàÑßå½ßäçßà«",
  "ßäîßàÑßå½ßäëßàª",
  "ßäîßàÑßå½ßäëßà╡",
  "ßäîßàÑßå½ßäïßà¡ßå╝",
  "ßäîßàÑßå½ßäîßàí",
  "ßäîßàÑßå½ßäîßàóßå╝",
  "ßäîßàÑßå½ßäîßà«",
  "ßäîßàÑßå½ßäÄßàÑßå»",
  "ßäîßàÑßå½ßäÄßàª",
  "ßäîßàÑßå½ßäÉßà⌐ßå╝",
  "ßäîßàÑßå½ßäÆßàº",
  "ßäîßàÑßå½ßäÆßà«",
  "ßäîßàÑßå»ßäâßàó",
  "ßäîßàÑßå»ßäåßàíßå╝",
  "ßäîßàÑßå»ßäçßàíßå½",
  "ßäîßàÑßå»ßäïßàúßå¿",
  "ßäîßàÑßå»ßäÄßàí",
  "ßäîßàÑßå╖ßäÇßàÑßå╖",
  "ßäîßàÑßå╖ßäëßà«",
  "ßäîßàÑßå╖ßäëßà╡ßå╖",
  "ßäîßàÑßå╖ßäïßà»ßå½",
  "ßäîßàÑßå╖ßäîßàÑßå╖",
  "ßäîßàÑßå╖ßäÄßàí",
  "ßäîßàÑßå╕ßäÇßà│ßå½",
  "ßäîßàÑßå╕ßäëßà╡",
  "ßäîßàÑßå╕ßäÄßà⌐ßå¿",
  "ßäîßàÑßå║ßäÇßàíßäàßàíßå¿",
  "ßäîßàÑßå╝ßäÇßàÑßäîßàíßå╝",
  "ßäîßàÑßå╝ßäâßà⌐",
  "ßäîßàÑßå╝ßäàßà▓ßäîßàíßå╝",
  "ßäîßàÑßå╝ßäàßà╡",
  "ßäîßàÑßå╝ßäåßàíßå»",
  "ßäîßàÑßå╝ßäåßàºßå½",
  "ßäîßàÑßå╝ßäåßà«ßå½",
  "ßäîßàÑßå╝ßäçßàíßå½ßäâßàó",
  "ßäîßàÑßå╝ßäçßà⌐",
  "ßäîßàÑßå╝ßäçßà«",
  "ßäîßàÑßå╝ßäçßà╡",
  "ßäîßàÑßå╝ßäëßàíßå╝",
  "ßäîßàÑßå╝ßäëßàÑßå╝",
  "ßäîßàÑßå╝ßäïßà⌐",
  "ßäîßàÑßå╝ßäïßà»ßå½",
  "ßäîßàÑßå╝ßäîßàíßå╝",
  "ßäîßàÑßå╝ßäîßà╡",
  "ßäîßàÑßå╝ßäÄßà╡",
  "ßäîßàÑßå╝ßäÆßà¬ßå¿ßäÆßà╡",
  "ßäîßàªßäÇßà⌐ßå╝",
  "ßäîßàªßäÇßà¬ßäîßàÑßå╖",
  "ßäîßàªßäâßàóßäàßà⌐",
  "ßäîßàªßäåßà⌐ßå¿",
  "ßäîßàªßäçßàíßå»",
  "ßäîßàªßäçßàÑßå╕",
  "ßäîßàªßäëßàíßå║ßäéßàíßå»",
  "ßäîßàªßäïßàíßå½",
  "ßäîßàªßäïßà╡ßå»",
  "ßäîßàªßäîßàíßå¿",
  "ßäîßàªßäîßà«ßäâßà⌐",
  "ßäîßàªßäÄßà«ßå»",
  "ßäîßàªßäæßà«ßå╖",
  "ßäîßàªßäÆßàíßå½",
  "ßäîßà⌐ßäÇßàíßå¿",
  "ßäîßà⌐ßäÇßàÑßå½",
  "ßäîßà⌐ßäÇßà│ßå╖",
  "ßäîßà⌐ßäÇßà╡ßå╝",
  "ßäîßà⌐ßäåßàºßå╝",
  "ßäîßà⌐ßäåßà╡ßäàßà¡",
  "ßäîßà⌐ßäëßàíßå╝",
  "ßäîßà⌐ßäëßàÑßå½",
  "ßäîßà⌐ßäïßà¡ßå╝ßäÆßà╡",
  "ßäîßà⌐ßäîßàÑßå»",
  "ßäîßà⌐ßäîßàÑßå╝",
  "ßäîßà⌐ßäîßà╡ßå¿",
  "ßäîßà⌐ßå½ßäâßàóßå║ßäåßàíßå»",
  "ßäîßà⌐ßå½ßäîßàó",
  "ßäîßà⌐ßå»ßäïßàÑßå╕",
  "ßäîßà⌐ßå»ßäïßà│ßå╖",
  "ßäîßà⌐ßå╝ßäÇßà¡",
  "ßäîßà⌐ßå╝ßäàßà⌐",
  "ßäîßà⌐ßå╝ßäàßà▓",
  "ßäîßà⌐ßå╝ßäëßà⌐ßäàßà╡",
  "ßäîßà⌐ßå╝ßäïßàÑßå╕ßäïßà»ßå½",
  "ßäîßà⌐ßå╝ßäîßà⌐ßå╝",
  "ßäîßà⌐ßå╝ßäÆßàíßå╕",
  "ßäîßà¬ßäëßàÑßå¿",
  "ßäîßà¼ßäïßà╡ßå½",
  "ßäîßà«ßäÇßà¬ßå½ßäîßàÑßå¿",
  "ßäîßà«ßäàßà│ßå╖",
  "ßäîßà«ßäåßàíßå»",
  "ßäîßà«ßäåßàÑßäéßà╡",
  "ßäîßà«ßäåßàÑßå¿",
  "ßäîßà«ßäåßà«ßå½",
  "ßäîßà«ßäåßà╡ßå½",
  "ßäîßà«ßäçßàíßå╝",
  "ßäîßà«ßäçßàºßå½",
  "ßäîßà«ßäëßà╡ßå¿",
  "ßäîßà«ßäïßà╡ßå½",
  "ßäîßà«ßäïßà╡ßå»",
  "ßäîßà«ßäîßàíßå╝",
  "ßäîßà«ßäîßàÑßå½ßäîßàí",
  "ßäîßà«ßäÉßàóßå¿",
  "ßäîßà«ßå½ßäçßà╡",
  "ßäîßà«ßå»ßäÇßàÑßäàßà╡",
  "ßäîßà«ßå»ßäÇßà╡",
  "ßäîßà«ßå»ßäåßà«ßäéßà┤",
  "ßäîßà«ßå╝ßäÇßàíßå½",
  "ßäîßà«ßå╝ßäÇßà¿ßäçßàíßå╝ßäëßà⌐ßå╝",
  "ßäîßà«ßå╝ßäÇßà«ßå¿",
  "ßäîßà«ßå╝ßäéßàºßå½",
  "ßäîßà«ßå╝ßäâßàíßå½",
  "ßäîßà«ßå╝ßäâßà⌐ßå¿",
  "ßäîßà«ßå╝ßäçßàíßå½",
  "ßäîßà«ßå╝ßäçßà«",
  "ßäîßà«ßå╝ßäëßàª",
  "ßäîßà«ßå╝ßäëßà⌐ßäÇßà╡ßäïßàÑßå╕",
  "ßäîßà«ßå╝ßäëßà«ßå½",
  "ßäîßà«ßå╝ßäïßàíßå╝",
  "ßäîßà«ßå╝ßäïßà¡",
  "ßäîßà«ßå╝ßäÆßàíßå¿ßäÇßà¡",
  "ßäîßà│ßå¿ßäëßàÑßå¿",
  "ßäîßà│ßå¿ßäëßà╡",
  "ßäîßà│ßå»ßäÇßàÑßäïßà«ßå╖",
  "ßäîßà│ßå╝ßäÇßàí",
  "ßäîßà│ßå╝ßäÇßàÑ",
  "ßäîßà│ßå╝ßäÇßà»ßå½",
  "ßäîßà│ßå╝ßäëßàíßå╝",
  "ßäîßà│ßå╝ßäëßàª",
  "ßäîßà╡ßäÇßàíßå¿",
  "ßäîßà╡ßäÇßàíßå╕",
  "ßäîßà╡ßäÇßàºßå╝",
  "ßäîßà╡ßäÇßà│ßå¿ßäÆßà╡",
  "ßäîßà╡ßäÇßà│ßå╖",
  "ßäîßà╡ßäÇßà│ßå╕",
  "ßäîßà╡ßäéßà│ßå╝",
  "ßäîßà╡ßäàßà│ßå╖ßäÇßà╡ßå»",
  "ßäîßà╡ßäàßà╡ßäëßàíßå½",
  "ßäîßà╡ßäçßàíßå╝",
  "ßäîßà╡ßäçßà«ßå╝",
  "ßäîßà╡ßäëßà╡ßå¿",
  "ßäîßà╡ßäïßàºßå¿",
  "ßäîßà╡ßäïßà«ßäÇßàó",
  "ßäîßà╡ßäïßà»ßå½",
  "ßäîßà╡ßäîßàÑßå¿",
  "ßäîßà╡ßäîßàÑßå╖",
  "ßäîßà╡ßäîßà╡ßå½",
  "ßäîßà╡ßäÄßà«ßå»",
  "ßäîßà╡ßå¿ßäëßàÑßå½",
  "ßäîßà╡ßå¿ßäïßàÑßå╕",
  "ßäîßà╡ßå¿ßäïßà»ßå½",
  "ßäîßà╡ßå¿ßäîßàíßå╝",
  "ßäîßà╡ßå½ßäÇßà│ßå╕",
  "ßäîßà╡ßå½ßäâßà⌐ßå╝",
  "ßäîßà╡ßå½ßäàßà⌐",
  "ßäîßà╡ßå½ßäàßà¡",
  "ßäîßà╡ßå½ßäàßà╡",
  "ßäîßà╡ßå½ßäìßàí",
  "ßäîßà╡ßå½ßäÄßàíßå»",
  "ßäîßà╡ßå½ßäÄßà«ßå»",
  "ßäîßà╡ßå½ßäÉßà⌐ßå╝",
  "ßäîßà╡ßå½ßäÆßàóßå╝",
  "ßäîßà╡ßå»ßäåßà«ßå½",
  "ßäîßà╡ßå»ßäçßàºßå╝",
  "ßäîßà╡ßå»ßäëßàÑ",
  "ßäîßà╡ßå╖ßäîßàíßå¿",
  "ßäîßà╡ßå╕ßäâßàíßå½",
  "ßäîßà╡ßå╕ßäïßàíßå½",
  "ßäîßà╡ßå╕ßäîßà«ßå╝",
  "ßäìßàíßäîßà│ßå╝",
  "ßäìßà╡ßäüßàÑßäÇßà╡",
  "ßäÄßàíßäéßàíßå╖",
  "ßäÄßàíßäàßàíßäàßà╡",
  "ßäÄßàíßäàßàúßå╝",
  "ßäÄßàíßäàßà╡ßå╖",
  "ßäÄßàíßäçßàºßå»",
  "ßäÄßàíßäëßàÑßå½",
  "ßäÄßàíßäÄßà│ßå╖",
  "ßäÄßàíßå¿ßäÇßàíßå¿",
  "ßäÄßàíßå½ßäåßà«ßå»",
  "ßäÄßàíßå½ßäëßàÑßå╝",
  "ßäÄßàíßå╖ßäÇßàí",
  "ßäÄßàíßå╖ßäÇßà╡ßäàßà│ßå╖",
  "ßäÄßàíßå╖ßäëßàó",
  "ßäÄßàíßå╖ßäëßàÑßå¿",
  "ßäÄßàíßå╖ßäïßàº",
  "ßäÄßàíßå╖ßäïßà¼",
  "ßäÄßàíßå╖ßäîßà⌐",
  "ßäÄßàíßå║ßäîßàíßå½",
  "ßäÄßàíßå╝ßäÇßàí",
  "ßäÄßàíßå╝ßäÇßà⌐",
  "ßäÄßàíßå╝ßäÇßà«",
  "ßäÄßàíßå╝ßäåßà«ßå½",
  "ßäÄßàíßå╝ßäçßàíßå⌐",
  "ßäÄßàíßå╝ßäîßàíßå¿",
  "ßäÄßàíßå╝ßäîßà⌐",
  "ßäÄßàóßäéßàÑßå»",
  "ßäÄßàóßäîßàÑßå╖",
  "ßäÄßàóßå¿ßäÇßàíßäçßàíßå╝",
  "ßäÄßàóßå¿ßäçßàíßå╝",
  "ßäÄßàóßå¿ßäëßàíßå╝",
  "ßäÄßàóßå¿ßäïßà╡ßå╖",
  "ßäÄßàóßå╖ßäæßà╡ßäïßàÑßå½",
  "ßäÄßàÑßäçßàÑßå»",
  "ßäÄßàÑßäïßà│ßå╖",
  "ßäÄßàÑßå½ßäÇßà«ßå¿",
  "ßäÄßàÑßå½ßäâßà«ßå╝",
  "ßäÄßàÑßå½ßäîßàíßå╝",
  "ßäÄßàÑßå½ßäîßàó",
  "ßäÄßàÑßå½ßäÄßàÑßå½ßäÆßà╡",
  "ßäÄßàÑßå»ßäâßà⌐",
  "ßäÄßàÑßå»ßäîßàÑßäÆßà╡",
  "ßäÄßàÑßå»ßäÆßàíßå¿",
  "ßäÄßàÑßå║ßäéßàíßå»",
  "ßäÄßàÑßå║ßäìßàó",
  "ßäÄßàÑßå╝ßäéßàºßå½",
  "ßäÄßàÑßå╝ßäçßàíßäîßà╡",
  "ßäÄßàÑßå╝ßäëßà⌐",
  "ßäÄßàÑßå╝ßäÄßà«ßå½",
  "ßäÄßàªßäÇßà¿",
  "ßäÄßàªßäàßàºßå¿",
  "ßäÄßàªßäïßà⌐ßå½",
  "ßäÄßàªßäïßà▓ßå¿",
  "ßäÄßàªßäîßà«ßå╝",
  "ßäÄßàªßäÆßàÑßå╖",
  "ßäÄßà⌐ßäâßà│ßå╝ßäÆßàíßå¿ßäëßàóßå╝",
  "ßäÄßà⌐ßäçßàíßå½",
  "ßäÄßà⌐ßäçßàíßå╕",
  "ßäÄßà⌐ßäëßàíßå╝ßäÆßà¬",
  "ßäÄßà⌐ßäëßà«ßå½",
  "ßäÄßà⌐ßäïßàºßäàßà│ßå╖",
  "ßäÄßà⌐ßäïßà»ßå½",
  "ßäÄßà⌐ßäîßàÑßäéßàºßå¿",
  "ßäÄßà⌐ßäîßàÑßå╖",
  "ßäÄßà⌐ßäÄßàÑßå╝",
  "ßäÄßà⌐ßäÅßà⌐ßå»ßäàßà╡ßå║",
  "ßäÄßà⌐ßå║ßäçßà«ßå»",
  "ßäÄßà⌐ßå╝ßäÇßàíßå¿",
  "ßäÄßà⌐ßå╝ßäàßà╡",
  "ßäÄßà⌐ßå╝ßäîßàíßå╝",
  "ßäÄßà¬ßå»ßäïßàºßå╝",
  "ßäÄßà¼ßäÇßà│ßå½",
  "ßäÄßà¼ßäëßàíßå╝",
  "ßäÄßà¼ßäëßàÑßå½",
  "ßäÄßà¼ßäëßà╡ßå½",
  "ßäÄßà¼ßäïßàíßå¿",
  "ßäÄßà¼ßäîßà⌐ßå╝",
  "ßäÄßà«ßäëßàÑßå¿",
  "ßäÄßà«ßäïßàÑßå¿",
  "ßäÄßà«ßäîßà╡ßå½",
  "ßäÄßà«ßäÄßàÑßå½",
  "ßäÄßà«ßäÄßà│ßå¿",
  "ßäÄßà«ßå¿ßäÇßà«",
  "ßäÄßà«ßå¿ßäëßà⌐",
  "ßäÄßà«ßå¿ßäîßàª",
  "ßäÄßà«ßå¿ßäÆßàí",
  "ßäÄßà«ßå»ßäÇßà│ßå½",
  "ßäÄßà«ßå»ßäçßàíßå»",
  "ßäÄßà«ßå»ßäëßàíßå½",
  "ßäÄßà«ßå»ßäëßà╡ßå½",
  "ßäÄßà«ßå»ßäïßàºßå½",
  "ßäÄßà«ßå»ßäïßà╡ßå╕",
  "ßäÄßà«ßå»ßäîßàíßå╝",
  "ßäÄßà«ßå»ßäæßàíßå½",
  "ßäÄßà«ßå╝ßäÇßàºßå¿",
  "ßäÄßà«ßå╝ßäÇßà⌐",
  "ßäÄßà«ßå╝ßäâßà⌐ßå»",
  "ßäÄßà«ßå╝ßäçßà«ßå½ßäÆßà╡",
  "ßäÄßà«ßå╝ßäÄßàÑßå╝ßäâßà⌐",
  "ßäÄßà▒ßäïßàÑßå╕",
  "ßäÄßà▒ßäîßà╡ßå¿",
  "ßäÄßà▒ßäÆßàúßå╝",
  "ßäÄßà╡ßäïßàúßå¿",
  "ßäÄßà╡ßå½ßäÇßà«",
  "ßäÄßà╡ßå½ßäÄßàÑßå¿",
  "ßäÄßà╡ßå»ßäëßà╡ßå╕",
  "ßäÄßà╡ßå»ßäïßà»ßå»",
  "ßäÄßà╡ßå»ßäæßàíßå½",
  "ßäÄßà╡ßå╖ßäâßàó",
  "ßäÄßà╡ßå╖ßäåßà«ßå¿",
  "ßäÄßà╡ßå╖ßäëßà╡ßå»",
  "ßäÄßà╡ßå║ßäëßà⌐ßå»",
  "ßäÄßà╡ßå╝ßäÄßàíßå½",
  "ßäÅßàíßäåßàªßäàßàí",
  "ßäÅßàíßäïßà«ßå½ßäÉßàÑ",
  "ßäÅßàíßå»ßäÇßà«ßå¿ßäëßà«",
  "ßäÅßàóßäàßà╡ßå¿ßäÉßàÑ",
  "ßäÅßàóßå╖ßäæßàÑßäëßà│",
  "ßäÅßàóßå╖ßäæßàªßäïßà╡ßå½",
  "ßäÅßàÑßäÉßà│ßå½",
  "ßäÅßàÑßå½ßäâßà╡ßäëßàºßå½",
  "ßäÅßàÑßå»ßäàßàÑ",
  "ßäÅßàÑßå╖ßäæßà▓ßäÉßàÑ",
  "ßäÅßà⌐ßäüßà╡ßäàßà╡",
  "ßäÅßà⌐ßäåßà╡ßäâßà╡",
  "ßäÅßà⌐ßå½ßäëßàÑßäÉßà│",
  "ßäÅßà⌐ßå»ßäàßàí",
  "ßäÅßà⌐ßå╖ßäæßà│ßå»ßäàßàªßå¿ßäëßà│",
  "ßäÅßà⌐ßå╝ßäéßàíßäåßà«ßå»",
  "ßäÅßà½ßäÇßàíßå╖",
  "ßäÅßà«ßäâßàªßäÉßàí",
  "ßäÅßà│ßäàßà╡ßå╖",
  "ßäÅßà│ßå½ßäÇßà╡ßå»",
  "ßäÅßà│ßå½ßääßàíßå»",
  "ßäÅßà│ßå½ßäëßà⌐ßäàßà╡",
  "ßäÅßà│ßå½ßäïßàíßäâßà│ßå»",
  "ßäÅßà│ßå½ßäïßàÑßäåßàÑßäéßà╡",
  "ßäÅßà│ßå½ßäïßà╡ßå»",
  "ßäÅßà│ßå½ßäîßàÑßå»",
  "ßäÅßà│ßå»ßäàßàóßäëßà╡ßå¿",
  "ßäÅßà│ßå»ßäàßàÑßå╕",
  "ßäÅßà╡ßå»ßäàßà⌐",
  "ßäÉßàíßäïßà╡ßå╕",
  "ßäÉßàíßäîßàíßäÇßà╡",
  "ßäÉßàíßå¿ßäÇßà«",
  "ßäÉßàíßå¿ßäîßàí",
  "ßäÉßàíßå½ßäëßàóßå╝",
  "ßäÉßàóßäÇßà»ßå½ßäâßà⌐",
  "ßäÉßàóßäïßàúßå╝",
  "ßäÉßàóßäæßà«ßå╝",
  "ßäÉßàóßå¿ßäëßà╡",
  "ßäÉßàóßå»ßäàßàÑßå½ßäÉßà│",
  "ßäÉßàÑßäéßàÑßå»",
  "ßäÉßàÑßäåßà╡ßäéßàÑßå»",
  "ßäÉßàªßäéßà╡ßäëßà│",
  "ßäÉßàªßäëßà│ßäÉßà│",
  "ßäÉßàªßäïßà╡ßäçßà│ßå»",
  "ßäÉßàªßå»ßäàßàªßäçßà╡ßäîßàÑßå½",
  "ßäÉßà⌐ßäàßà⌐ßå½",
  "ßäÉßà⌐ßäåßàíßäÉßà⌐",
  "ßäÉßà⌐ßäïßà¡ßäïßà╡ßå»",
  "ßäÉßà⌐ßå╝ßäÇßà¿",
  "ßäÉßà⌐ßå╝ßäÇßà¬",
  "ßäÉßà⌐ßå╝ßäàßà⌐",
  "ßäÉßà⌐ßå╝ßäëßà╡ßå½",
  "ßäÉßà⌐ßå╝ßäïßàºßå¿",
  "ßäÉßà⌐ßå╝ßäïßà╡ßå»",
  "ßäÉßà⌐ßå╝ßäîßàíßå╝",
  "ßäÉßà⌐ßå╝ßäîßàª",
  "ßäÉßà⌐ßå╝ßäîßà│ßå╝",
  "ßäÉßà⌐ßå╝ßäÆßàíßå╕",
  "ßäÉßà⌐ßå╝ßäÆßà¬",
  "ßäÉßà¼ßäÇßà│ßå½",
  "ßäÉßà¼ßäïßà»ßå½",
  "ßäÉßà¼ßäîßà╡ßå¿ßäÇßà│ßå╖",
  "ßäÉßà▒ßäÇßà╡ßå╖",
  "ßäÉßà│ßäàßàÑßå¿",
  "ßäÉßà│ßå¿ßäÇßà│ßå╕",
  "ßäÉßà│ßå¿ßäçßàºßå»",
  "ßäÉßà│ßå¿ßäëßàÑßå╝",
  "ßäÉßà│ßå¿ßäëßà«",
  "ßäÉßà│ßå¿ßäîßà╡ßå╝",
  "ßäÉßà│ßå¿ßäÆßà╡",
  "ßäÉßà│ßå½ßäÉßà│ßå½ßäÆßà╡",
  "ßäÉßà╡ßäëßàºßäÄßà│",
  "ßäæßàíßäàßàíßå½ßäëßàóßå¿",
  "ßäæßàíßäïßà╡ßå»",
  "ßäæßàíßäÄßà«ßå»ßäëßà⌐",
  "ßäæßàíßå½ßäÇßàºßå»",
  "ßäæßàíßå½ßäâßàíßå½",
  "ßäæßàíßå½ßäåßàó",
  "ßäæßàíßå½ßäëßàí",
  "ßäæßàíßå»ßäëßà╡ßå╕",
  "ßäæßàíßå»ßäïßà»ßå»",
  "ßäæßàíßå╕ßäëßà⌐ßå╝",
  "ßäæßàóßäëßàºßå½",
  "ßäæßàóßå¿ßäëßà│",
  "ßäæßàóßå¿ßäëßà╡ßäåßà╡ßå»ßäàßà╡",
  "ßäæßàóßå½ßäÉßà╡",
  "ßäæßàÑßäëßàªßå½ßäÉßà│",
  "ßäæßàªßäïßà╡ßå½ßäÉßà│",
  "ßäæßàºßå½ßäÇßàºßå½",
  "ßäæßàºßå½ßäïßà┤",
  "ßäæßàºßå½ßäîßà╡",
  "ßäæßàºßå½ßäÆßà╡",
  "ßäæßàºßå╝ßäÇßàí",
  "ßäæßàºßå╝ßäÇßà▓ßå½",
  "ßäæßàºßå╝ßäëßàóßå╝",
  "ßäæßàºßå╝ßäëßà⌐",
  "ßäæßàºßå╝ßäïßàúßå╝",
  "ßäæßàºßå╝ßäïßà╡ßå»",
  "ßäæßàºßå╝ßäÆßà¬",
  "ßäæßà⌐ßäëßà│ßäÉßàÑ",
  "ßäæßà⌐ßäïßà╡ßå½ßäÉßà│",
  "ßäæßà⌐ßäîßàíßå╝",
  "ßäæßà⌐ßäÆßàíßå╖",
  "ßäæßà¡ßäåßàºßå½",
  "ßäæßà¡ßäîßàÑßå╝",
  "ßäæßà¡ßäîßà«ßå½",
  "ßäæßà¡ßäÆßàºßå½",
  "ßäæßà«ßå╖ßäåßà⌐ßå¿",
  "ßäæßà«ßå╖ßäîßà╡ßå»",
  "ßäæßà«ßå╝ßäÇßàºßå╝",
  "ßäæßà«ßå╝ßäëßà⌐ßå¿",
  "ßäæßà«ßå╝ßäëßà│ßå╕",
  "ßäæßà│ßäàßàíßå╝ßäëßà│",
  "ßäæßà│ßäàßà╡ßå½ßäÉßàÑ",
  "ßäæßà│ßå»ßäàßàíßäëßà│ßäÉßà╡ßå¿",
  "ßäæßà╡ßäÇßà⌐ßå½",
  "ßäæßà╡ßäåßàíßå╝",
  "ßäæßà╡ßäïßàíßäéßà⌐",
  "ßäæßà╡ßå»ßäàßà│ßå╖",
  "ßäæßà╡ßå»ßäëßà«",
  "ßäæßà╡ßå»ßäïßà¡",
  "ßäæßà╡ßå»ßäîßàí",
  "ßäæßà╡ßå»ßäÉßà⌐ßå╝",
  "ßäæßà╡ßå╝ßäÇßà¿",
  "ßäÆßàíßäéßà│ßäéßà╡ßå╖",
  "ßäÆßàíßäéßà│ßå»",
  "ßäÆßàíßäâßà│ßäïßà░ßäïßàÑ",
  "ßäÆßàíßäàßà«ßå║ßäçßàíßå╖",
  "ßäÆßàíßäçßàíßå½ßäÇßà╡",
  "ßäÆßàíßäëßà«ßå¿ßäîßà╡ßå╕",
  "ßäÆßàíßäëßà«ßå½",
  "ßäÆßàíßäïßàºßäÉßà│ßå½",
  "ßäÆßàíßäîßà╡ßäåßàíßå½",
  "ßäÆßàíßäÄßàÑßå½",
  "ßäÆßàíßäæßà«ßå╖",
  "ßäÆßàíßäæßà╡ßå»",
  "ßäÆßàíßå¿ßäÇßà¬",
  "ßäÆßàíßå¿ßäÇßà¡",
  "ßäÆßàíßå¿ßäÇßà│ßå╕",
  "ßäÆßàíßå¿ßäÇßà╡",
  "ßäÆßàíßå¿ßäéßàºßå½",
  "ßäÆßàíßå¿ßäàßàºßå¿",
  "ßäÆßàíßå¿ßäçßàÑßå½",
  "ßäÆßàíßå¿ßäçßà«ßäåßà⌐",
  "ßäÆßàíßå¿ßäçßà╡",
  "ßäÆßàíßå¿ßäëßàóßå╝",
  "ßäÆßàíßå¿ßäëßà«ßå»",
  "ßäÆßàíßå¿ßäëßà│ßå╕",
  "ßäÆßàíßå¿ßäïßà¡ßå╝ßäæßà«ßå╖",
  "ßäÆßàíßå¿ßäïßà»ßå½",
  "ßäÆßàíßå¿ßäïßà▒",
  "ßäÆßàíßå¿ßäîßàí",
  "ßäÆßàíßå¿ßäîßàÑßå╖",
  "ßäÆßàíßå½ßäÇßà¿",
  "ßäÆßàíßå½ßäÇßà│ßå»",
  "ßäÆßàíßå½ßäüßàÑßäçßàÑßå½ßäïßàª",
  "ßäÆßàíßå½ßäéßàíßå╜",
  "ßäÆßàíßå½ßäéßà«ßå½",
  "ßäÆßàíßå½ßäâßà⌐ßå╝ßäïßàíßå½",
  "ßäÆßàíßå½ßääßàó",
  "ßäÆßàíßå½ßäàßàíßäëßàíßå½",
  "ßäÆßàíßå½ßäåßàíßäâßà╡",
  "ßäÆßàíßå½ßäåßà«ßå½",
  "ßäÆßàíßå½ßäçßàÑßå½",
  "ßäÆßàíßå½ßäçßà⌐ßå¿",
  "ßäÆßàíßå½ßäëßà╡ßå¿",
  "ßäÆßàíßå½ßäïßàºßäàßà│ßå╖",
  "ßäÆßàíßå½ßäìßà⌐ßå¿",
  "ßäÆßàíßå»ßäåßàÑßäéßà╡",
  "ßäÆßàíßå»ßäïßàíßäçßàÑßäîßà╡",
  "ßäÆßàíßå»ßäïßà╡ßå½",
  "ßäÆßàíßå╖ßäüßàª",
  "ßäÆßàíßå╖ßäçßà«ßäàßà⌐",
  "ßäÆßàíßå╕ßäÇßàºßå¿",
  "ßäÆßàíßå╕ßäàßà╡ßäîßàÑßå¿",
  "ßäÆßàíßå╝ßäÇßà⌐ßå╝",
  "ßäÆßàíßå╝ßäÇßà«",
  "ßäÆßàíßå╝ßäëßàíßå╝",
  "ßäÆßàíßå╝ßäïßà┤",
  "ßäÆßàóßäÇßàºßå»",
  "ßäÆßàóßäÇßà«ßå½",
  "ßäÆßàóßäâßàíßå╕",
  "ßäÆßàóßäâßàíßå╝",
  "ßäÆßàóßäåßà«ßå»",
  "ßäÆßàóßäëßàÑßå¿",
  "ßäÆßàóßäëßàÑßå»",
  "ßäÆßàóßäëßà«ßäïßà¡ßå¿ßäîßàíßå╝",
  "ßäÆßàóßäïßàíßå½",
  "ßäÆßàóßå¿ßäëßà╡ßå╖",
  "ßäÆßàóßå½ßäâßà│ßäçßàóßå¿",
  "ßäÆßàóßå╖ßäçßàÑßäÇßàÑ",
  "ßäÆßàóßå║ßäçßàºßçÇ",
  "ßäÆßàóßå║ßäëßàíßå»",
  "ßäÆßàóßå╝ßäâßà⌐ßå╝",
  "ßäÆßàóßå╝ßäçßà⌐ßå¿",
  "ßäÆßàóßå╝ßäëßàí",
  "ßäÆßàóßå╝ßäïßà«ßå½",
  "ßäÆßàóßå╝ßäïßà▒",
  "ßäÆßàúßå╝ßäÇßà╡",
  "ßäÆßàúßå╝ßäëßàíßå╝",
  "ßäÆßàúßå╝ßäëßà«",
  "ßäÆßàÑßäàßàíßå¿",
  "ßäÆßàÑßäïßà¡ßå╝",
  "ßäÆßàªßå»ßäÇßà╡",
  "ßäÆßàºßå½ßäÇßà¬ßå½",
  "ßäÆßàºßå½ßäÇßà│ßå╖",
  "ßäÆßàºßå½ßäâßàó",
  "ßäÆßàºßå½ßäëßàíßå╝",
  "ßäÆßàºßå½ßäëßà╡ßå»",
  "ßäÆßàºßå½ßäîßàíßå╝",
  "ßäÆßàºßå½ßäîßàó",
  "ßäÆßàºßå½ßäîßà╡",
  "ßäÆßàºßå»ßäïßàóßå¿",
  "ßäÆßàºßå╕ßäàßàºßå¿",
  "ßäÆßàºßå╝ßäçßà«",
  "ßäÆßàºßå╝ßäëßàí",
  "ßäÆßàºßå╝ßäëßà«",
  "ßäÆßàºßå╝ßäëßà╡ßå¿",
  "ßäÆßàºßå╝ßäîßàª",
  "ßäÆßàºßå╝ßäÉßàó",
  "ßäÆßàºßå╝ßäæßàºßå½",
  "ßäÆßà¿ßäÉßàóßå¿",
  "ßäÆßà⌐ßäÇßà╡ßäëßà╡ßå╖",
  "ßäÆßà⌐ßäéßàíßå╖",
  "ßäÆßà⌐ßäàßàíßå╝ßäïßà╡",
  "ßäÆßà⌐ßäçßàíßå¿",
  "ßäÆßà⌐ßäÉßàªßå»",
  "ßäÆßà⌐ßäÆßà│ßå╕",
  "ßäÆßà⌐ßå¿ßäëßà╡",
  "ßäÆßà⌐ßå»ßäàßà⌐",
  "ßäÆßà⌐ßå╖ßäæßàªßäïßà╡ßäîßà╡",
  "ßäÆßà⌐ßå╝ßäçßà⌐",
  "ßäÆßà⌐ßå╝ßäëßà«",
  "ßäÆßà⌐ßå╝ßäÄßàí",
  "ßäÆßà¬ßäåßàºßå½",
  "ßäÆßà¬ßäçßà«ßå½",
  "ßäÆßà¬ßäëßàíßå»",
  "ßäÆßà¬ßäïßà¡ßäïßà╡ßå»",
  "ßäÆßà¬ßäîßàíßå╝",
  "ßäÆßà¬ßäÆßàíßå¿",
  "ßäÆßà¬ßå¿ßäçßà⌐",
  "ßäÆßà¬ßå¿ßäïßà╡ßå½",
  "ßäÆßà¬ßå¿ßäîßàíßå╝",
  "ßäÆßà¬ßå¿ßäîßàÑßå╝",
  "ßäÆßà¬ßå½ßäÇßàíßå╕",
  "ßäÆßà¬ßå½ßäÇßàºßå╝",
  "ßäÆßà¬ßå½ßäïßàºßå╝",
  "ßäÆßà¬ßå½ßäïßà▓ßå»",
  "ßäÆßà¬ßå½ßäîßàí",
  "ßäÆßà¬ßå»ßäÇßà╡",
  "ßäÆßà¬ßå»ßäâßà⌐ßå╝",
  "ßäÆßà¬ßå»ßäçßàíßå»ßäÆßà╡",
  "ßäÆßà¬ßå»ßäïßà¡ßå╝",
  "ßäÆßà¬ßå»ßäìßàíßå¿",
  "ßäÆßà¼ßäÇßàºßå½",
  "ßäÆßà¼ßäÇßà¬ßå½",
  "ßäÆßà¼ßäçßà⌐ßå¿",
  "ßäÆßà¼ßäëßàóßå¿",
  "ßäÆßà¼ßäïßà»ßå½",
  "ßäÆßà¼ßäîßàíßå╝",
  "ßäÆßà¼ßäîßàÑßå½",
  "ßäÆßà¼ßå║ßäëßà«",
  "ßäÆßà¼ßå╝ßäâßàíßå½ßäçßà⌐ßäâßà⌐",
  "ßäÆßà¡ßäïßà▓ßå»ßäîßàÑßå¿",
  "ßäÆßà«ßäçßàíßå½",
  "ßäÆßà«ßäÄßà«ßå║ßäÇßàíßäàßà«",
  "ßäÆßà«ßå½ßäàßàºßå½",
  "ßäÆßà»ßå»ßäèßà╡ßå½",
  "ßäÆßà▓ßäëßà╡ßå¿",
  "ßäÆßà▓ßäïßà╡ßå»",
  "ßäÆßà▓ßå╝ßäéßàó",
  "ßäÆßà│ßäàßà│ßå╖",
  "ßäÆßà│ßå¿ßäçßàóßå¿",
  "ßäÆßà│ßå¿ßäïßà╡ßå½",
  "ßäÆßà│ßå½ßäîßàÑßå¿",
  "ßäÆßà│ßå½ßäÆßà╡",
  "ßäÆßà│ßå╝ßäåßà╡",
  "ßäÆßà│ßå╝ßäçßà«ßå½",
  "ßäÆßà┤ßäÇßà⌐ßå¿",
  "ßäÆßà┤ßäåßàíßå╝",
  "ßäÆßà┤ßäëßàóßå╝",
  "ßäÆßà┤ßå½ßäëßàóßå¿",
  "ßäÆßà╡ßå╖ßäüßàÑßå║"
]

},{}],36:[function(require,module,exports){
module.exports=[
  "a╠übaco",
  "abdomen",
  "abeja",
  "abierto",
  "abogado",
  "abono",
  "aborto",
  "abrazo",
  "abrir",
  "abuelo",
  "abuso",
  "acabar",
  "academia",
  "acceso",
  "accio╠ün",
  "aceite",
  "acelga",
  "acento",
  "aceptar",
  "a╠ücido",
  "aclarar",
  "acne╠ü",
  "acoger",
  "acoso",
  "activo",
  "acto",
  "actriz",
  "actuar",
  "acudir",
  "acuerdo",
  "acusar",
  "adicto",
  "admitir",
  "adoptar",
  "adorno",
  "aduana",
  "adulto",
  "ae╠üreo",
  "afectar",
  "aficio╠ün",
  "afinar",
  "afirmar",
  "a╠ügil",
  "agitar",
  "agoni╠üa",
  "agosto",
  "agotar",
  "agregar",
  "agrio",
  "agua",
  "agudo",
  "a╠üguila",
  "aguja",
  "ahogo",
  "ahorro",
  "aire",
  "aislar",
  "ajedrez",
  "ajeno",
  "ajuste",
  "alacra╠ün",
  "alambre",
  "alarma",
  "alba",
  "a╠ülbum",
  "alcalde",
  "aldea",
  "alegre",
  "alejar",
  "alerta",
  "aleta",
  "alfiler",
  "alga",
  "algodo╠ün",
  "aliado",
  "aliento",
  "alivio",
  "alma",
  "almeja",
  "almi╠übar",
  "altar",
  "alteza",
  "altivo",
  "alto",
  "altura",
  "alumno",
  "alzar",
  "amable",
  "amante",
  "amapola",
  "amargo",
  "amasar",
  "a╠ümbar",
  "a╠ümbito",
  "ameno",
  "amigo",
  "amistad",
  "amor",
  "amparo",
  "amplio",
  "ancho",
  "anciano",
  "ancla",
  "andar",
  "ande╠ün",
  "anemia",
  "a╠üngulo",
  "anillo",
  "a╠ünimo",
  "ani╠üs",
  "anotar",
  "antena",
  "antiguo",
  "antojo",
  "anual",
  "anular",
  "anuncio",
  "an╠âadir",
  "an╠âejo",
  "an╠âo",
  "apagar",
  "aparato",
  "apetito",
  "apio",
  "aplicar",
  "apodo",
  "aporte",
  "apoyo",
  "aprender",
  "aprobar",
  "apuesta",
  "apuro",
  "arado",
  "aran╠âa",
  "arar",
  "a╠ürbitro",
  "a╠ürbol",
  "arbusto",
  "archivo",
  "arco",
  "arder",
  "ardilla",
  "arduo",
  "a╠ürea",
  "a╠ürido",
  "aries",
  "armoni╠üa",
  "arne╠üs",
  "aroma",
  "arpa",
  "arpo╠ün",
  "arreglo",
  "arroz",
  "arruga",
  "arte",
  "artista",
  "asa",
  "asado",
  "asalto",
  "ascenso",
  "asegurar",
  "aseo",
  "asesor",
  "asiento",
  "asilo",
  "asistir",
  "asno",
  "asombro",
  "a╠üspero",
  "astilla",
  "astro",
  "astuto",
  "asumir",
  "asunto",
  "atajo",
  "ataque",
  "atar",
  "atento",
  "ateo",
  "a╠ütico",
  "atleta",
  "a╠ütomo",
  "atraer",
  "atroz",
  "atu╠ün",
  "audaz",
  "audio",
  "auge",
  "aula",
  "aumento",
  "ausente",
  "autor",
  "aval",
  "avance",
  "avaro",
  "ave",
  "avellana",
  "avena",
  "avestruz",
  "avio╠ün",
  "aviso",
  "ayer",
  "ayuda",
  "ayuno",
  "azafra╠ün",
  "azar",
  "azote",
  "azu╠ücar",
  "azufre",
  "azul",
  "baba",
  "babor",
  "bache",
  "bahi╠üa",
  "baile",
  "bajar",
  "balanza",
  "balco╠ün",
  "balde",
  "bambu╠ü",
  "banco",
  "banda",
  "ban╠âo",
  "barba",
  "barco",
  "barniz",
  "barro",
  "ba╠üscula",
  "basto╠ün",
  "basura",
  "batalla",
  "bateri╠üa",
  "batir",
  "batuta",
  "bau╠ül",
  "bazar",
  "bebe╠ü",
  "bebida",
  "bello",
  "besar",
  "beso",
  "bestia",
  "bicho",
  "bien",
  "bingo",
  "blanco",
  "bloque",
  "blusa",
  "boa",
  "bobina",
  "bobo",
  "boca",
  "bocina",
  "boda",
  "bodega",
  "boina",
  "bola",
  "bolero",
  "bolsa",
  "bomba",
  "bondad",
  "bonito",
  "bono",
  "bonsa╠üi",
  "borde",
  "borrar",
  "bosque",
  "bote",
  "boti╠ün",
  "bo╠üveda",
  "bozal",
  "bravo",
  "brazo",
  "brecha",
  "breve",
  "brillo",
  "brinco",
  "brisa",
  "broca",
  "broma",
  "bronce",
  "brote",
  "bruja",
  "brusco",
  "bruto",
  "buceo",
  "bucle",
  "bueno",
  "buey",
  "bufanda",
  "bufo╠ün",
  "bu╠üho",
  "buitre",
  "bulto",
  "burbuja",
  "burla",
  "burro",
  "buscar",
  "butaca",
  "buzo╠ün",
  "caballo",
  "cabeza",
  "cabina",
  "cabra",
  "cacao",
  "cada╠üver",
  "cadena",
  "caer",
  "cafe╠ü",
  "cai╠üda",
  "caima╠ün",
  "caja",
  "cajo╠ün",
  "cal",
  "calamar",
  "calcio",
  "caldo",
  "calidad",
  "calle",
  "calma",
  "calor",
  "calvo",
  "cama",
  "cambio",
  "camello",
  "camino",
  "campo",
  "ca╠üncer",
  "candil",
  "canela",
  "canguro",
  "canica",
  "canto",
  "can╠âa",
  "can╠âo╠ün",
  "caoba",
  "caos",
  "capaz",
  "capita╠ün",
  "capote",
  "captar",
  "capucha",
  "cara",
  "carbo╠ün",
  "ca╠ürcel",
  "careta",
  "carga",
  "carin╠âo",
  "carne",
  "carpeta",
  "carro",
  "carta",
  "casa",
  "casco",
  "casero",
  "caspa",
  "castor",
  "catorce",
  "catre",
  "caudal",
  "causa",
  "cazo",
  "cebolla",
  "ceder",
  "cedro",
  "celda",
  "ce╠ülebre",
  "celoso",
  "ce╠ülula",
  "cemento",
  "ceniza",
  "centro",
  "cerca",
  "cerdo",
  "cereza",
  "cero",
  "cerrar",
  "certeza",
  "ce╠üsped",
  "cetro",
  "chacal",
  "chaleco",
  "champu╠ü",
  "chancla",
  "chapa",
  "charla",
  "chico",
  "chiste",
  "chivo",
  "choque",
  "choza",
  "chuleta",
  "chupar",
  "ciclo╠ün",
  "ciego",
  "cielo",
  "cien",
  "cierto",
  "cifra",
  "cigarro",
  "cima",
  "cinco",
  "cine",
  "cinta",
  "cipre╠üs",
  "circo",
  "ciruela",
  "cisne",
  "cita",
  "ciudad",
  "clamor",
  "clan",
  "claro",
  "clase",
  "clave",
  "cliente",
  "clima",
  "cli╠ünica",
  "cobre",
  "coccio╠ün",
  "cochino",
  "cocina",
  "coco",
  "co╠üdigo",
  "codo",
  "cofre",
  "coger",
  "cohete",
  "coji╠ün",
  "cojo",
  "cola",
  "colcha",
  "colegio",
  "colgar",
  "colina",
  "collar",
  "colmo",
  "columna",
  "combate",
  "comer",
  "comida",
  "co╠ümodo",
  "compra",
  "conde",
  "conejo",
  "conga",
  "conocer",
  "consejo",
  "contar",
  "copa",
  "copia",
  "corazo╠ün",
  "corbata",
  "corcho",
  "cordo╠ün",
  "corona",
  "correr",
  "coser",
  "cosmos",
  "costa",
  "cra╠üneo",
  "cra╠üter",
  "crear",
  "crecer",
  "crei╠üdo",
  "crema",
  "cri╠üa",
  "crimen",
  "cripta",
  "crisis",
  "cromo",
  "cro╠ünica",
  "croqueta",
  "crudo",
  "cruz",
  "cuadro",
  "cuarto",
  "cuatro",
  "cubo",
  "cubrir",
  "cuchara",
  "cuello",
  "cuento",
  "cuerda",
  "cuesta",
  "cueva",
  "cuidar",
  "culebra",
  "culpa",
  "culto",
  "cumbre",
  "cumplir",
  "cuna",
  "cuneta",
  "cuota",
  "cupo╠ün",
  "cu╠üpula",
  "curar",
  "curioso",
  "curso",
  "curva",
  "cutis",
  "dama",
  "danza",
  "dar",
  "dardo",
  "da╠ütil",
  "deber",
  "de╠übil",
  "de╠ücada",
  "decir",
  "dedo",
  "defensa",
  "definir",
  "dejar",
  "delfi╠ün",
  "delgado",
  "delito",
  "demora",
  "denso",
  "dental",
  "deporte",
  "derecho",
  "derrota",
  "desayuno",
  "deseo",
  "desfile",
  "desnudo",
  "destino",
  "desvi╠üo",
  "detalle",
  "detener",
  "deuda",
  "di╠üa",
  "diablo",
  "diadema",
  "diamante",
  "diana",
  "diario",
  "dibujo",
  "dictar",
  "diente",
  "dieta",
  "diez",
  "difi╠ücil",
  "digno",
  "dilema",
  "diluir",
  "dinero",
  "directo",
  "dirigir",
  "disco",
  "disen╠âo",
  "disfraz",
  "diva",
  "divino",
  "doble",
  "doce",
  "dolor",
  "domingo",
  "don",
  "donar",
  "dorado",
  "dormir",
  "dorso",
  "dos",
  "dosis",
  "drago╠ün",
  "droga",
  "ducha",
  "duda",
  "duelo",
  "duen╠âo",
  "dulce",
  "du╠üo",
  "duque",
  "durar",
  "dureza",
  "duro",
  "e╠übano",
  "ebrio",
  "echar",
  "eco",
  "ecuador",
  "edad",
  "edicio╠ün",
  "edificio",
  "editor",
  "educar",
  "efecto",
  "eficaz",
  "eje",
  "ejemplo",
  "elefante",
  "elegir",
  "elemento",
  "elevar",
  "elipse",
  "e╠ülite",
  "elixir",
  "elogio",
  "eludir",
  "embudo",
  "emitir",
  "emocio╠ün",
  "empate",
  "empen╠âo",
  "empleo",
  "empresa",
  "enano",
  "encargo",
  "enchufe",
  "enci╠üa",
  "enemigo",
  "enero",
  "enfado",
  "enfermo",
  "engan╠âo",
  "enigma",
  "enlace",
  "enorme",
  "enredo",
  "ensayo",
  "ensen╠âar",
  "entero",
  "entrar",
  "envase",
  "envi╠üo",
  "e╠üpoca",
  "equipo",
  "erizo",
  "escala",
  "escena",
  "escolar",
  "escribir",
  "escudo",
  "esencia",
  "esfera",
  "esfuerzo",
  "espada",
  "espejo",
  "espi╠üa",
  "esposa",
  "espuma",
  "esqui╠ü",
  "estar",
  "este",
  "estilo",
  "estufa",
  "etapa",
  "eterno",
  "e╠ütica",
  "etnia",
  "evadir",
  "evaluar",
  "evento",
  "evitar",
  "exacto",
  "examen",
  "exceso",
  "excusa",
  "exento",
  "exigir",
  "exilio",
  "existir",
  "e╠üxito",
  "experto",
  "explicar",
  "exponer",
  "extremo",
  "fa╠übrica",
  "fa╠übula",
  "fachada",
  "fa╠ücil",
  "factor",
  "faena",
  "faja",
  "falda",
  "fallo",
  "falso",
  "faltar",
  "fama",
  "familia",
  "famoso",
  "farao╠ün",
  "farmacia",
  "farol",
  "farsa",
  "fase",
  "fatiga",
  "fauna",
  "favor",
  "fax",
  "febrero",
  "fecha",
  "feliz",
  "feo",
  "feria",
  "feroz",
  "fe╠ürtil",
  "fervor",
  "festi╠ün",
  "fiable",
  "fianza",
  "fiar",
  "fibra",
  "ficcio╠ün",
  "ficha",
  "fideo",
  "fiebre",
  "fiel",
  "fiera",
  "fiesta",
  "figura",
  "fijar",
  "fijo",
  "fila",
  "filete",
  "filial",
  "filtro",
  "fin",
  "finca",
  "fingir",
  "finito",
  "firma",
  "flaco",
  "flauta",
  "flecha",
  "flor",
  "flota",
  "fluir",
  "flujo",
  "flu╠üor",
  "fobia",
  "foca",
  "fogata",
  "fogo╠ün",
  "folio",
  "folleto",
  "fondo",
  "forma",
  "forro",
  "fortuna",
  "forzar",
  "fosa",
  "foto",
  "fracaso",
  "fra╠ügil",
  "franja",
  "frase",
  "fraude",
  "frei╠ür",
  "freno",
  "fresa",
  "fri╠üo",
  "frito",
  "fruta",
  "fuego",
  "fuente",
  "fuerza",
  "fuga",
  "fumar",
  "funcio╠ün",
  "funda",
  "furgo╠ün",
  "furia",
  "fusil",
  "fu╠ütbol",
  "futuro",
  "gacela",
  "gafas",
  "gaita",
  "gajo",
  "gala",
  "galeri╠üa",
  "gallo",
  "gamba",
  "ganar",
  "gancho",
  "ganga",
  "ganso",
  "garaje",
  "garza",
  "gasolina",
  "gastar",
  "gato",
  "gavila╠ün",
  "gemelo",
  "gemir",
  "gen",
  "ge╠ünero",
  "genio",
  "gente",
  "geranio",
  "gerente",
  "germen",
  "gesto",
  "gigante",
  "gimnasio",
  "girar",
  "giro",
  "glaciar",
  "globo",
  "gloria",
  "gol",
  "golfo",
  "goloso",
  "golpe",
  "goma",
  "gordo",
  "gorila",
  "gorra",
  "gota",
  "goteo",
  "gozar",
  "grada",
  "gra╠üfico",
  "grano",
  "grasa",
  "gratis",
  "grave",
  "grieta",
  "grillo",
  "gripe",
  "gris",
  "grito",
  "grosor",
  "gru╠üa",
  "grueso",
  "grumo",
  "grupo",
  "guante",
  "guapo",
  "guardia",
  "guerra",
  "gui╠üa",
  "guin╠âo",
  "guion",
  "guiso",
  "guitarra",
  "gusano",
  "gustar",
  "haber",
  "ha╠übil",
  "hablar",
  "hacer",
  "hacha",
  "hada",
  "hallar",
  "hamaca",
  "harina",
  "haz",
  "hazan╠âa",
  "hebilla",
  "hebra",
  "hecho",
  "helado",
  "helio",
  "hembra",
  "herir",
  "hermano",
  "he╠üroe",
  "hervir",
  "hielo",
  "hierro",
  "hi╠ügado",
  "higiene",
  "hijo",
  "himno",
  "historia",
  "hocico",
  "hogar",
  "hoguera",
  "hoja",
  "hombre",
  "hongo",
  "honor",
  "honra",
  "hora",
  "hormiga",
  "horno",
  "hostil",
  "hoyo",
  "hueco",
  "huelga",
  "huerta",
  "hueso",
  "huevo",
  "huida",
  "huir",
  "humano",
  "hu╠ümedo",
  "humilde",
  "humo",
  "hundir",
  "huraca╠ün",
  "hurto",
  "icono",
  "ideal",
  "idioma",
  "i╠üdolo",
  "iglesia",
  "iglu╠ü",
  "igual",
  "ilegal",
  "ilusio╠ün",
  "imagen",
  "ima╠ün",
  "imitar",
  "impar",
  "imperio",
  "imponer",
  "impulso",
  "incapaz",
  "i╠ündice",
  "inerte",
  "infiel",
  "informe",
  "ingenio",
  "inicio",
  "inmenso",
  "inmune",
  "innato",
  "insecto",
  "instante",
  "intere╠üs",
  "i╠üntimo",
  "intuir",
  "inu╠ütil",
  "invierno",
  "ira",
  "iris",
  "ironi╠üa",
  "isla",
  "islote",
  "jabali╠ü",
  "jabo╠ün",
  "jamo╠ün",
  "jarabe",
  "jardi╠ün",
  "jarra",
  "jaula",
  "jazmi╠ün",
  "jefe",
  "jeringa",
  "jinete",
  "jornada",
  "joroba",
  "joven",
  "joya",
  "juerga",
  "jueves",
  "juez",
  "jugador",
  "jugo",
  "juguete",
  "juicio",
  "junco",
  "jungla",
  "junio",
  "juntar",
  "ju╠üpiter",
  "jurar",
  "justo",
  "juvenil",
  "juzgar",
  "kilo",
  "koala",
  "labio",
  "lacio",
  "lacra",
  "lado",
  "ladro╠ün",
  "lagarto",
  "la╠ügrima",
  "laguna",
  "laico",
  "lamer",
  "la╠ümina",
  "la╠ümpara",
  "lana",
  "lancha",
  "langosta",
  "lanza",
  "la╠üpiz",
  "largo",
  "larva",
  "la╠üstima",
  "lata",
  "la╠ütex",
  "latir",
  "laurel",
  "lavar",
  "lazo",
  "leal",
  "leccio╠ün",
  "leche",
  "lector",
  "leer",
  "legio╠ün",
  "legumbre",
  "lejano",
  "lengua",
  "lento",
  "len╠âa",
  "leo╠ün",
  "leopardo",
  "lesio╠ün",
  "letal",
  "letra",
  "leve",
  "leyenda",
  "libertad",
  "libro",
  "licor",
  "li╠üder",
  "lidiar",
  "lienzo",
  "liga",
  "ligero",
  "lima",
  "li╠ümite",
  "limo╠ün",
  "limpio",
  "lince",
  "lindo",
  "li╠ünea",
  "lingote",
  "lino",
  "linterna",
  "li╠üquido",
  "liso",
  "lista",
  "litera",
  "litio",
  "litro",
  "llaga",
  "llama",
  "llanto",
  "llave",
  "llegar",
  "llenar",
  "llevar",
  "llorar",
  "llover",
  "lluvia",
  "lobo",
  "locio╠ün",
  "loco",
  "locura",
  "lo╠ügica",
  "logro",
  "lombriz",
  "lomo",
  "lonja",
  "lote",
  "lucha",
  "lucir",
  "lugar",
  "lujo",
  "luna",
  "lunes",
  "lupa",
  "lustro",
  "luto",
  "luz",
  "maceta",
  "macho",
  "madera",
  "madre",
  "maduro",
  "maestro",
  "mafia",
  "magia",
  "mago",
  "mai╠üz",
  "maldad",
  "maleta",
  "malla",
  "malo",
  "mama╠ü",
  "mambo",
  "mamut",
  "manco",
  "mando",
  "manejar",
  "manga",
  "maniqui╠ü",
  "manjar",
  "mano",
  "manso",
  "manta",
  "man╠âana",
  "mapa",
  "ma╠üquina",
  "mar",
  "marco",
  "marea",
  "marfil",
  "margen",
  "marido",
  "ma╠ürmol",
  "marro╠ün",
  "martes",
  "marzo",
  "masa",
  "ma╠üscara",
  "masivo",
  "matar",
  "materia",
  "matiz",
  "matriz",
  "ma╠üximo",
  "mayor",
  "mazorca",
  "mecha",
  "medalla",
  "medio",
  "me╠üdula",
  "mejilla",
  "mejor",
  "melena",
  "melo╠ün",
  "memoria",
  "menor",
  "mensaje",
  "mente",
  "menu╠ü",
  "mercado",
  "merengue",
  "me╠ürito",
  "mes",
  "meso╠ün",
  "meta",
  "meter",
  "me╠ütodo",
  "metro",
  "mezcla",
  "miedo",
  "miel",
  "miembro",
  "miga",
  "mil",
  "milagro",
  "militar",
  "millo╠ün",
  "mimo",
  "mina",
  "minero",
  "mi╠ünimo",
  "minuto",
  "miope",
  "mirar",
  "misa",
  "miseria",
  "misil",
  "mismo",
  "mitad",
  "mito",
  "mochila",
  "mocio╠ün",
  "moda",
  "modelo",
  "moho",
  "mojar",
  "molde",
  "moler",
  "molino",
  "momento",
  "momia",
  "monarca",
  "moneda",
  "monja",
  "monto",
  "mon╠âo",
  "morada",
  "morder",
  "moreno",
  "morir",
  "morro",
  "morsa",
  "mortal",
  "mosca",
  "mostrar",
  "motivo",
  "mover",
  "mo╠üvil",
  "mozo",
  "mucho",
  "mudar",
  "mueble",
  "muela",
  "muerte",
  "muestra",
  "mugre",
  "mujer",
  "mula",
  "muleta",
  "multa",
  "mundo",
  "mun╠âeca",
  "mural",
  "muro",
  "mu╠üsculo",
  "museo",
  "musgo",
  "mu╠üsica",
  "muslo",
  "na╠ücar",
  "nacio╠ün",
  "nadar",
  "naipe",
  "naranja",
  "nariz",
  "narrar",
  "nasal",
  "natal",
  "nativo",
  "natural",
  "na╠üusea",
  "naval",
  "nave",
  "navidad",
  "necio",
  "ne╠üctar",
  "negar",
  "negocio",
  "negro",
  "neo╠ün",
  "nervio",
  "neto",
  "neutro",
  "nevar",
  "nevera",
  "nicho",
  "nido",
  "niebla",
  "nieto",
  "nin╠âez",
  "nin╠âo",
  "ni╠ütido",
  "nivel",
  "nobleza",
  "noche",
  "no╠ümina",
  "noria",
  "norma",
  "norte",
  "nota",
  "noticia",
  "novato",
  "novela",
  "novio",
  "nube",
  "nuca",
  "nu╠ücleo",
  "nudillo",
  "nudo",
  "nuera",
  "nueve",
  "nuez",
  "nulo",
  "nu╠ümero",
  "nutria",
  "oasis",
  "obeso",
  "obispo",
  "objeto",
  "obra",
  "obrero",
  "observar",
  "obtener",
  "obvio",
  "oca",
  "ocaso",
  "oce╠üano",
  "ochenta",
  "ocho",
  "ocio",
  "ocre",
  "octavo",
  "octubre",
  "oculto",
  "ocupar",
  "ocurrir",
  "odiar",
  "odio",
  "odisea",
  "oeste",
  "ofensa",
  "oferta",
  "oficio",
  "ofrecer",
  "ogro",
  "oi╠üdo",
  "oi╠ür",
  "ojo",
  "ola",
  "oleada",
  "olfato",
  "olivo",
  "olla",
  "olmo",
  "olor",
  "olvido",
  "ombligo",
  "onda",
  "onza",
  "opaco",
  "opcio╠ün",
  "o╠üpera",
  "opinar",
  "oponer",
  "optar",
  "o╠üptica",
  "opuesto",
  "oracio╠ün",
  "orador",
  "oral",
  "o╠ürbita",
  "orca",
  "orden",
  "oreja",
  "o╠ürgano",
  "orgi╠üa",
  "orgullo",
  "oriente",
  "origen",
  "orilla",
  "oro",
  "orquesta",
  "oruga",
  "osadi╠üa",
  "oscuro",
  "osezno",
  "oso",
  "ostra",
  "oton╠âo",
  "otro",
  "oveja",
  "o╠üvulo",
  "o╠üxido",
  "oxi╠ügeno",
  "oyente",
  "ozono",
  "pacto",
  "padre",
  "paella",
  "pa╠ügina",
  "pago",
  "pai╠üs",
  "pa╠üjaro",
  "palabra",
  "palco",
  "paleta",
  "pa╠ülido",
  "palma",
  "paloma",
  "palpar",
  "pan",
  "panal",
  "pa╠ünico",
  "pantera",
  "pan╠âuelo",
  "papa╠ü",
  "papel",
  "papilla",
  "paquete",
  "parar",
  "parcela",
  "pared",
  "parir",
  "paro",
  "pa╠ürpado",
  "parque",
  "pa╠ürrafo",
  "parte",
  "pasar",
  "paseo",
  "pasio╠ün",
  "paso",
  "pasta",
  "pata",
  "patio",
  "patria",
  "pausa",
  "pauta",
  "pavo",
  "payaso",
  "peato╠ün",
  "pecado",
  "pecera",
  "pecho",
  "pedal",
  "pedir",
  "pegar",
  "peine",
  "pelar",
  "peldan╠âo",
  "pelea",
  "peligro",
  "pellejo",
  "pelo",
  "peluca",
  "pena",
  "pensar",
  "pen╠âo╠ün",
  "peo╠ün",
  "peor",
  "pepino",
  "pequen╠âo",
  "pera",
  "percha",
  "perder",
  "pereza",
  "perfil",
  "perico",
  "perla",
  "permiso",
  "perro",
  "persona",
  "pesa",
  "pesca",
  "pe╠üsimo",
  "pestan╠âa",
  "pe╠ütalo",
  "petro╠üleo",
  "pez",
  "pezun╠âa",
  "picar",
  "picho╠ün",
  "pie",
  "piedra",
  "pierna",
  "pieza",
  "pijama",
  "pilar",
  "piloto",
  "pimienta",
  "pino",
  "pintor",
  "pinza",
  "pin╠âa",
  "piojo",
  "pipa",
  "pirata",
  "pisar",
  "piscina",
  "piso",
  "pista",
  "pito╠ün",
  "pizca",
  "placa",
  "plan",
  "plata",
  "playa",
  "plaza",
  "pleito",
  "pleno",
  "plomo",
  "pluma",
  "plural",
  "pobre",
  "poco",
  "poder",
  "podio",
  "poema",
  "poesi╠üa",
  "poeta",
  "polen",
  "polici╠üa",
  "pollo",
  "polvo",
  "pomada",
  "pomelo",
  "pomo",
  "pompa",
  "poner",
  "porcio╠ün",
  "portal",
  "posada",
  "poseer",
  "posible",
  "poste",
  "potencia",
  "potro",
  "pozo",
  "prado",
  "precoz",
  "pregunta",
  "premio",
  "prensa",
  "preso",
  "previo",
  "primo",
  "pri╠üncipe",
  "prisio╠ün",
  "privar",
  "proa",
  "probar",
  "proceso",
  "producto",
  "proeza",
  "profesor",
  "programa",
  "prole",
  "promesa",
  "pronto",
  "propio",
  "pro╠üximo",
  "prueba",
  "pu╠üblico",
  "puchero",
  "pudor",
  "pueblo",
  "puerta",
  "puesto",
  "pulga",
  "pulir",
  "pulmo╠ün",
  "pulpo",
  "pulso",
  "puma",
  "punto",
  "pun╠âal",
  "pun╠âo",
  "pupa",
  "pupila",
  "pure╠ü",
  "quedar",
  "queja",
  "quemar",
  "querer",
  "queso",
  "quieto",
  "qui╠ümica",
  "quince",
  "quitar",
  "ra╠übano",
  "rabia",
  "rabo",
  "racio╠ün",
  "radical",
  "rai╠üz",
  "rama",
  "rampa",
  "rancho",
  "rango",
  "rapaz",
  "ra╠üpido",
  "rapto",
  "rasgo",
  "raspa",
  "rato",
  "rayo",
  "raza",
  "razo╠ün",
  "reaccio╠ün",
  "realidad",
  "reban╠âo",
  "rebote",
  "recaer",
  "receta",
  "rechazo",
  "recoger",
  "recreo",
  "recto",
  "recurso",
  "red",
  "redondo",
  "reducir",
  "reflejo",
  "reforma",
  "refra╠ün",
  "refugio",
  "regalo",
  "regir",
  "regla",
  "regreso",
  "rehe╠ün",
  "reino",
  "rei╠ür",
  "reja",
  "relato",
  "relevo",
  "relieve",
  "relleno",
  "reloj",
  "remar",
  "remedio",
  "remo",
  "rencor",
  "rendir",
  "renta",
  "reparto",
  "repetir",
  "reposo",
  "reptil",
  "res",
  "rescate",
  "resina",
  "respeto",
  "resto",
  "resumen",
  "retiro",
  "retorno",
  "retrato",
  "reunir",
  "reve╠üs",
  "revista",
  "rey",
  "rezar",
  "rico",
  "riego",
  "rienda",
  "riesgo",
  "rifa",
  "ri╠ügido",
  "rigor",
  "rinco╠ün",
  "rin╠âo╠ün",
  "ri╠üo",
  "riqueza",
  "risa",
  "ritmo",
  "rito",
  "rizo",
  "roble",
  "roce",
  "rociar",
  "rodar",
  "rodeo",
  "rodilla",
  "roer",
  "rojizo",
  "rojo",
  "romero",
  "romper",
  "ron",
  "ronco",
  "ronda",
  "ropa",
  "ropero",
  "rosa",
  "rosca",
  "rostro",
  "rotar",
  "rubi╠ü",
  "rubor",
  "rudo",
  "rueda",
  "rugir",
  "ruido",
  "ruina",
  "ruleta",
  "rulo",
  "rumbo",
  "rumor",
  "ruptura",
  "ruta",
  "rutina",
  "sa╠übado",
  "saber",
  "sabio",
  "sable",
  "sacar",
  "sagaz",
  "sagrado",
  "sala",
  "saldo",
  "salero",
  "salir",
  "salmo╠ün",
  "salo╠ün",
  "salsa",
  "salto",
  "salud",
  "salvar",
  "samba",
  "sancio╠ün",
  "sandi╠üa",
  "sanear",
  "sangre",
  "sanidad",
  "sano",
  "santo",
  "sapo",
  "saque",
  "sardina",
  "sarte╠ün",
  "sastre",
  "sata╠ün",
  "sauna",
  "saxofo╠ün",
  "seccio╠ün",
  "seco",
  "secreto",
  "secta",
  "sed",
  "seguir",
  "seis",
  "sello",
  "selva",
  "semana",
  "semilla",
  "senda",
  "sensor",
  "sen╠âal",
  "sen╠âor",
  "separar",
  "sepia",
  "sequi╠üa",
  "ser",
  "serie",
  "sermo╠ün",
  "servir",
  "sesenta",
  "sesio╠ün",
  "seta",
  "setenta",
  "severo",
  "sexo",
  "sexto",
  "sidra",
  "siesta",
  "siete",
  "siglo",
  "signo",
  "si╠ülaba",
  "silbar",
  "silencio",
  "silla",
  "si╠ümbolo",
  "simio",
  "sirena",
  "sistema",
  "sitio",
  "situar",
  "sobre",
  "socio",
  "sodio",
  "sol",
  "solapa",
  "soldado",
  "soledad",
  "so╠ülido",
  "soltar",
  "solucio╠ün",
  "sombra",
  "sondeo",
  "sonido",
  "sonoro",
  "sonrisa",
  "sopa",
  "soplar",
  "soporte",
  "sordo",
  "sorpresa",
  "sorteo",
  "soste╠ün",
  "so╠ütano",
  "suave",
  "subir",
  "suceso",
  "sudor",
  "suegra",
  "suelo",
  "suen╠âo",
  "suerte",
  "sufrir",
  "sujeto",
  "sulta╠ün",
  "sumar",
  "superar",
  "suplir",
  "suponer",
  "supremo",
  "sur",
  "surco",
  "suren╠âo",
  "surgir",
  "susto",
  "sutil",
  "tabaco",
  "tabique",
  "tabla",
  "tabu╠ü",
  "taco",
  "tacto",
  "tajo",
  "talar",
  "talco",
  "talento",
  "talla",
  "talo╠ün",
  "taman╠âo",
  "tambor",
  "tango",
  "tanque",
  "tapa",
  "tapete",
  "tapia",
  "tapo╠ün",
  "taquilla",
  "tarde",
  "tarea",
  "tarifa",
  "tarjeta",
  "tarot",
  "tarro",
  "tarta",
  "tatuaje",
  "tauro",
  "taza",
  "tazo╠ün",
  "teatro",
  "techo",
  "tecla",
  "te╠ücnica",
  "tejado",
  "tejer",
  "tejido",
  "tela",
  "tele╠üfono",
  "tema",
  "temor",
  "templo",
  "tenaz",
  "tender",
  "tener",
  "tenis",
  "tenso",
  "teori╠üa",
  "terapia",
  "terco",
  "te╠ürmino",
  "ternura",
  "terror",
  "tesis",
  "tesoro",
  "testigo",
  "tetera",
  "texto",
  "tez",
  "tibio",
  "tiburo╠ün",
  "tiempo",
  "tienda",
  "tierra",
  "tieso",
  "tigre",
  "tijera",
  "tilde",
  "timbre",
  "ti╠ümido",
  "timo",
  "tinta",
  "ti╠üo",
  "ti╠üpico",
  "tipo",
  "tira",
  "tiro╠ün",
  "tita╠ün",
  "ti╠ütere",
  "ti╠ütulo",
  "tiza",
  "toalla",
  "tobillo",
  "tocar",
  "tocino",
  "todo",
  "toga",
  "toldo",
  "tomar",
  "tono",
  "tonto",
  "topar",
  "tope",
  "toque",
  "to╠ürax",
  "torero",
  "tormenta",
  "torneo",
  "toro",
  "torpedo",
  "torre",
  "torso",
  "tortuga",
  "tos",
  "tosco",
  "toser",
  "to╠üxico",
  "trabajo",
  "tractor",
  "traer",
  "tra╠üfico",
  "trago",
  "traje",
  "tramo",
  "trance",
  "trato",
  "trauma",
  "trazar",
  "tre╠übol",
  "tregua",
  "treinta",
  "tren",
  "trepar",
  "tres",
  "tribu",
  "trigo",
  "tripa",
  "triste",
  "triunfo",
  "trofeo",
  "trompa",
  "tronco",
  "tropa",
  "trote",
  "trozo",
  "truco",
  "trueno",
  "trufa",
  "tuberi╠üa",
  "tubo",
  "tuerto",
  "tumba",
  "tumor",
  "tu╠ünel",
  "tu╠ünica",
  "turbina",
  "turismo",
  "turno",
  "tutor",
  "ubicar",
  "u╠ülcera",
  "umbral",
  "unidad",
  "unir",
  "universo",
  "uno",
  "untar",
  "un╠âa",
  "urbano",
  "urbe",
  "urgente",
  "urna",
  "usar",
  "usuario",
  "u╠ütil",
  "utopi╠üa",
  "uva",
  "vaca",
  "vaci╠üo",
  "vacuna",
  "vagar",
  "vago",
  "vaina",
  "vajilla",
  "vale",
  "va╠ülido",
  "valle",
  "valor",
  "va╠ülvula",
  "vampiro",
  "vara",
  "variar",
  "varo╠ün",
  "vaso",
  "vecino",
  "vector",
  "vehi╠üculo",
  "veinte",
  "vejez",
  "vela",
  "velero",
  "veloz",
  "vena",
  "vencer",
  "venda",
  "veneno",
  "vengar",
  "venir",
  "venta",
  "venus",
  "ver",
  "verano",
  "verbo",
  "verde",
  "vereda",
  "verja",
  "verso",
  "verter",
  "vi╠üa",
  "viaje",
  "vibrar",
  "vicio",
  "vi╠üctima",
  "vida",
  "vi╠üdeo",
  "vidrio",
  "viejo",
  "viernes",
  "vigor",
  "vil",
  "villa",
  "vinagre",
  "vino",
  "vin╠âedo",
  "violi╠ün",
  "viral",
  "virgo",
  "virtud",
  "visor",
  "vi╠üspera",
  "vista",
  "vitamina",
  "viudo",
  "vivaz",
  "vivero",
  "vivir",
  "vivo",
  "volca╠ün",
  "volumen",
  "volver",
  "voraz",
  "votar",
  "voto",
  "voz",
  "vuelo",
  "vulgar",
  "yacer",
  "yate",
  "yegua",
  "yema",
  "yerno",
  "yeso",
  "yodo",
  "yoga",
  "yogur",
  "zafiro",
  "zanja",
  "zapato",
  "zarza",
  "zona",
  "zorro",
  "zumo",
  "zurdo"
]

},{}],37:[function(require,module,exports){
var Buffer = require('safe-buffer').Buffer
var Transform = require('stream').Transform
var StringDecoder = require('string_decoder').StringDecoder
var inherits = require('inherits')

function CipherBase (hashMode) {
  Transform.call(this)
  this.hashMode = typeof hashMode === 'string'
  if (this.hashMode) {
    this[hashMode] = this._finalOrDigest
  } else {
    this.final = this._finalOrDigest
  }
  if (this._final) {
    this.__final = this._final
    this._final = null
  }
  this._decoder = null
  this._encoding = null
}
inherits(CipherBase, Transform)

CipherBase.prototype.update = function (data, inputEnc, outputEnc) {
  if (typeof data === 'string') {
    data = Buffer.from(data, inputEnc)
  }

  var outData = this._update(data)
  if (this.hashMode) return this

  if (outputEnc) {
    outData = this._toString(outData, outputEnc)
  }

  return outData
}

CipherBase.prototype.setAutoPadding = function () {}
CipherBase.prototype.getAuthTag = function () {
  throw new Error('trying to get auth tag in unsupported state')
}

CipherBase.prototype.setAuthTag = function () {
  throw new Error('trying to set auth tag in unsupported state')
}

CipherBase.prototype.setAAD = function () {
  throw new Error('trying to set aad in unsupported state')
}

CipherBase.prototype._transform = function (data, _, next) {
  var err
  try {
    if (this.hashMode) {
      this._update(data)
    } else {
      this.push(this._update(data))
    }
  } catch (e) {
    err = e
  } finally {
    next(err)
  }
}
CipherBase.prototype._flush = function (done) {
  var err
  try {
    this.push(this.__final())
  } catch (e) {
    err = e
  }

  done(err)
}
CipherBase.prototype._finalOrDigest = function (outputEnc) {
  var outData = this.__final() || Buffer.alloc(0)
  if (outputEnc) {
    outData = this._toString(outData, outputEnc, true)
  }
  return outData
}

CipherBase.prototype._toString = function (value, enc, fin) {
  if (!this._decoder) {
    this._decoder = new StringDecoder(enc)
    this._encoding = enc
  }

  if (this._encoding !== enc) throw new Error('can\'t switch encodings')

  var out = this._decoder.write(value)
  if (fin) {
    out += this._decoder.end()
  }

  return out
}

module.exports = CipherBase

},{"inherits":41,"safe-buffer":53,"stream":10,"string_decoder":25}],38:[function(require,module,exports){
'use strict'
var inherits = require('inherits')
var MD5 = require('md5.js')
var RIPEMD160 = require('ripemd160')
var sha = require('sha.js')
var Base = require('cipher-base')

function Hash (hash) {
  Base.call(this, 'digest')

  this._hash = hash
}

inherits(Hash, Base)

Hash.prototype._update = function (data) {
  this._hash.update(data)
}

Hash.prototype._final = function () {
  return this._hash.digest()
}

module.exports = function createHash (alg) {
  alg = alg.toLowerCase()
  if (alg === 'md5') return new MD5()
  if (alg === 'rmd160' || alg === 'ripemd160') return new RIPEMD160()

  return new Hash(sha(alg))
}

},{"cipher-base":37,"inherits":41,"md5.js":45,"ripemd160":52,"sha.js":55}],39:[function(require,module,exports){
var MD5 = require('md5.js')

module.exports = function (buffer) {
  return new MD5().update(buffer).digest()
}

},{"md5.js":45}],40:[function(require,module,exports){
'use strict'
var Buffer = require('safe-buffer').Buffer
var Transform = require('stream').Transform
var inherits = require('inherits')

function throwIfNotStringOrBuffer (val, prefix) {
  if (!Buffer.isBuffer(val) && typeof val !== 'string') {
    throw new TypeError(prefix + ' must be a string or a buffer')
  }
}

function HashBase (blockSize) {
  Transform.call(this)

  this._block = Buffer.allocUnsafe(blockSize)
  this._blockSize = blockSize
  this._blockOffset = 0
  this._length = [0, 0, 0, 0]

  this._finalized = false
}

inherits(HashBase, Transform)

HashBase.prototype._transform = function (chunk, encoding, callback) {
  var error = null
  try {
    this.update(chunk, encoding)
  } catch (err) {
    error = err
  }

  callback(error)
}

HashBase.prototype._flush = function (callback) {
  var error = null
  try {
    this.push(this.digest())
  } catch (err) {
    error = err
  }

  callback(error)
}

HashBase.prototype.update = function (data, encoding) {
  throwIfNotStringOrBuffer(data, 'Data')
  if (this._finalized) throw new Error('Digest already called')
  if (!Buffer.isBuffer(data)) data = Buffer.from(data, encoding)

  // consume data
  var block = this._block
  var offset = 0
  while (this._blockOffset + data.length - offset >= this._blockSize) {
    for (var i = this._blockOffset; i < this._blockSize;) block[i++] = data[offset++]
    this._update()
    this._blockOffset = 0
  }
  while (offset < data.length) block[this._blockOffset++] = data[offset++]

  // update length
  for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
    this._length[j] += carry
    carry = (this._length[j] / 0x0100000000) | 0
    if (carry > 0) this._length[j] -= 0x0100000000 * carry
  }

  return this
}

HashBase.prototype._update = function () {
  throw new Error('_update is not implemented')
}

HashBase.prototype.digest = function (encoding) {
  if (this._finalized) throw new Error('Digest already called')
  this._finalized = true

  var digest = this._digest()
  if (encoding !== undefined) digest = digest.toString(encoding)

  // reset state
  this._block.fill(0)
  this._blockOffset = 0
  for (var i = 0; i < 4; ++i) this._length[i] = 0

  return digest
}

HashBase.prototype._digest = function () {
  throw new Error('_digest is not implemented')
}

module.exports = HashBase

},{"inherits":41,"safe-buffer":53,"stream":10}],41:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],42:[function(require,module,exports){
(function (process,global){(function (){
/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
/*jslint bitwise: true */
(function () {
  'use strict';

  var ERROR = 'input is invalid type';
  var WINDOW = typeof window === 'object';
  var root = WINDOW ? window : {};
  if (root.JS_SHA256_NO_WINDOW) {
    WINDOW = false;
  }
  var WEB_WORKER = !WINDOW && typeof self === 'object';
  var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
    root = global;
  } else if (WEB_WORKER) {
    root = self;
  }
  var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && typeof module === 'object' && module.exports;
  var AMD = typeof define === 'function' && define.amd;
  var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');
  var EXTRA = [-2147483648, 8388608, 32768, 128];
  var SHIFT = [24, 16, 8, 0];
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var OUTPUT_TYPES = ['hex', 'array', 'digest', 'arrayBuffer'];

  var blocks = [];

  if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
    Array.isArray = function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
    ArrayBuffer.isView = function (obj) {
      return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
    };
  }

  var createOutputMethod = function (outputType, is224) {
    return function (message) {
      return new Sha256(is224, true).update(message)[outputType]();
    };
  };

  var createMethod = function (is224) {
    var method = createOutputMethod('hex', is224);
    if (NODE_JS) {
      method = nodeWrap(method, is224);
    }
    method.create = function () {
      return new Sha256(is224);
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createOutputMethod(type, is224);
    }
    return method;
  };

  var nodeWrap = function (method, is224) {
    var crypto = eval("require('crypto')");
    var Buffer = eval("require('buffer').Buffer");
    var algorithm = is224 ? 'sha224' : 'sha256';
    var nodeMethod = function (message) {
      if (typeof message === 'string') {
        return crypto.createHash(algorithm).update(message, 'utf8').digest('hex');
      } else {
        if (message === null || message === undefined) {
          throw new Error(ERROR);
        } else if (message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        }
      }
      if (Array.isArray(message) || ArrayBuffer.isView(message) ||
        message.constructor === Buffer) {
        return crypto.createHash(algorithm).update(new Buffer(message)).digest('hex');
      } else {
        return method(message);
      }
    };
    return nodeMethod;
  };

  var createHmacOutputMethod = function (outputType, is224) {
    return function (key, message) {
      return new HmacSha256(key, is224, true).update(message)[outputType]();
    };
  };

  var createHmacMethod = function (is224) {
    var method = createHmacOutputMethod('hex', is224);
    method.create = function (key) {
      return new HmacSha256(key, is224);
    };
    method.update = function (key, message) {
      return method.create(key).update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createHmacOutputMethod(type, is224);
    }
    return method;
  };

  function Sha256(is224, sharedMemory) {
    if (sharedMemory) {
      blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      this.blocks = blocks;
    } else {
      this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (is224) {
      this.h0 = 0xc1059ed8;
      this.h1 = 0x367cd507;
      this.h2 = 0x3070dd17;
      this.h3 = 0xf70e5939;
      this.h4 = 0xffc00b31;
      this.h5 = 0x68581511;
      this.h6 = 0x64f98fa7;
      this.h7 = 0xbefa4fa4;
    } else { // 256
      this.h0 = 0x6a09e667;
      this.h1 = 0xbb67ae85;
      this.h2 = 0x3c6ef372;
      this.h3 = 0xa54ff53a;
      this.h4 = 0x510e527f;
      this.h5 = 0x9b05688c;
      this.h6 = 0x1f83d9ab;
      this.h7 = 0x5be0cd19;
    }

    this.block = this.start = this.bytes = this.hBytes = 0;
    this.finalized = this.hashed = false;
    this.first = true;
    this.is224 = is224;
  }

  Sha256.prototype.update = function (message) {
    if (this.finalized) {
      return;
    }
    var notString, type = typeof message;
    if (type !== 'string') {
      if (type === 'object') {
        if (message === null) {
          throw new Error(ERROR);
        } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
          message = new Uint8Array(message);
        } else if (!Array.isArray(message)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
            throw new Error(ERROR);
          }
        }
      } else {
        throw new Error(ERROR);
      }
      notString = true;
    }
    var code, index = 0, i, length = message.length, blocks = this.blocks;

    while (index < length) {
      if (this.hashed) {
        this.hashed = false;
        blocks[0] = this.block;
        blocks[16] = blocks[1] = blocks[2] = blocks[3] =
          blocks[4] = blocks[5] = blocks[6] = blocks[7] =
          blocks[8] = blocks[9] = blocks[10] = blocks[11] =
          blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      }

      if (notString) {
        for (i = this.start; index < length && i < 64; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < 64; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }

      this.lastByteIndex = i;
      this.bytes += i - this.start;
      if (i >= 64) {
        this.block = blocks[16];
        this.start = i - 64;
        this.hash();
        this.hashed = true;
      } else {
        this.start = i;
      }
    }
    if (this.bytes > 4294967295) {
      this.hBytes += this.bytes / 4294967296 << 0;
      this.bytes = this.bytes % 4294967296;
    }
    return this;
  };

  Sha256.prototype.finalize = function () {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    var blocks = this.blocks, i = this.lastByteIndex;
    blocks[16] = this.block;
    blocks[i >> 2] |= EXTRA[i & 3];
    this.block = blocks[16];
    if (i >= 56) {
      if (!this.hashed) {
        this.hash();
      }
      blocks[0] = this.block;
      blocks[16] = blocks[1] = blocks[2] = blocks[3] =
        blocks[4] = blocks[5] = blocks[6] = blocks[7] =
        blocks[8] = blocks[9] = blocks[10] = blocks[11] =
        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    }
    blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
    blocks[15] = this.bytes << 3;
    this.hash();
  };

  Sha256.prototype.hash = function () {
    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6,
      h = this.h7, blocks = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;

    for (j = 16; j < 64; ++j) {
      // rightrotate
      t1 = blocks[j - 15];
      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3);
      t1 = blocks[j - 2];
      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10);
      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0;
    }

    bc = b & c;
    for (j = 0; j < 64; j += 4) {
      if (this.first) {
        if (this.is224) {
          ab = 300032;
          t1 = blocks[0] - 1413257819;
          h = t1 - 150054599 << 0;
          d = t1 + 24177077 << 0;
        } else {
          ab = 704751109;
          t1 = blocks[0] - 210244248;
          h = t1 - 1521486534 << 0;
          d = t1 + 143694565 << 0;
        }
        this.first = false;
      } else {
        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        ab = a & b;
        maj = ab ^ (a & c) ^ bc;
        ch = (e & f) ^ (~e & g);
        t1 = h + s1 + ch + K[j] + blocks[j];
        t2 = s0 + maj;
        h = d + t1 << 0;
        d = t1 + t2 << 0;
      }
      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10));
      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7));
      da = d & a;
      maj = da ^ (d & b) ^ ab;
      ch = (h & e) ^ (~h & f);
      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1];
      t2 = s0 + maj;
      g = c + t1 << 0;
      c = t1 + t2 << 0;
      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10));
      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7));
      cd = c & d;
      maj = cd ^ (c & a) ^ da;
      ch = (g & h) ^ (~g & e);
      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2];
      t2 = s0 + maj;
      f = b + t1 << 0;
      b = t1 + t2 << 0;
      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10));
      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7));
      bc = b & c;
      maj = bc ^ (b & d) ^ cd;
      ch = (f & g) ^ (~f & h);
      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3];
      t2 = s0 + maj;
      e = a + t1 << 0;
      a = t1 + t2 << 0;
    }

    this.h0 = this.h0 + a << 0;
    this.h1 = this.h1 + b << 0;
    this.h2 = this.h2 + c << 0;
    this.h3 = this.h3 + d << 0;
    this.h4 = this.h4 + e << 0;
    this.h5 = this.h5 + f << 0;
    this.h6 = this.h6 + g << 0;
    this.h7 = this.h7 + h << 0;
  };

  Sha256.prototype.hex = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
      h6 = this.h6, h7 = this.h7;

    var hex = HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
      HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
      HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
      HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
      HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
      HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
      HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
      HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
      HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
      HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
      HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
      HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
      HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F] +
      HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
      HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
      HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
      HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F] +
      HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F] +
      HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F] +
      HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] +
      HEX_CHARS[(h5 >> 28) & 0x0F] + HEX_CHARS[(h5 >> 24) & 0x0F] +
      HEX_CHARS[(h5 >> 20) & 0x0F] + HEX_CHARS[(h5 >> 16) & 0x0F] +
      HEX_CHARS[(h5 >> 12) & 0x0F] + HEX_CHARS[(h5 >> 8) & 0x0F] +
      HEX_CHARS[(h5 >> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] +
      HEX_CHARS[(h6 >> 28) & 0x0F] + HEX_CHARS[(h6 >> 24) & 0x0F] +
      HEX_CHARS[(h6 >> 20) & 0x0F] + HEX_CHARS[(h6 >> 16) & 0x0F] +
      HEX_CHARS[(h6 >> 12) & 0x0F] + HEX_CHARS[(h6 >> 8) & 0x0F] +
      HEX_CHARS[(h6 >> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F];
    if (!this.is224) {
      hex += HEX_CHARS[(h7 >> 28) & 0x0F] + HEX_CHARS[(h7 >> 24) & 0x0F] +
        HEX_CHARS[(h7 >> 20) & 0x0F] + HEX_CHARS[(h7 >> 16) & 0x0F] +
        HEX_CHARS[(h7 >> 12) & 0x0F] + HEX_CHARS[(h7 >> 8) & 0x0F] +
        HEX_CHARS[(h7 >> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];
    }
    return hex;
  };

  Sha256.prototype.toString = Sha256.prototype.hex;

  Sha256.prototype.digest = function () {
    this.finalize();

    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5,
      h6 = this.h6, h7 = this.h7;

    var arr = [
      (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,
      (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,
      (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,
      (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,
      (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,
      (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,
      (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF
    ];
    if (!this.is224) {
      arr.push((h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF);
    }
    return arr;
  };

  Sha256.prototype.array = Sha256.prototype.digest;

  Sha256.prototype.arrayBuffer = function () {
    this.finalize();

    var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
    var dataView = new DataView(buffer);
    dataView.setUint32(0, this.h0);
    dataView.setUint32(4, this.h1);
    dataView.setUint32(8, this.h2);
    dataView.setUint32(12, this.h3);
    dataView.setUint32(16, this.h4);
    dataView.setUint32(20, this.h5);
    dataView.setUint32(24, this.h6);
    if (!this.is224) {
      dataView.setUint32(28, this.h7);
    }
    return buffer;
  };

  function HmacSha256(key, is224, sharedMemory) {
    var i, type = typeof key;
    if (type === 'string') {
      var bytes = [], length = key.length, index = 0, code;
      for (i = 0; i < length; ++i) {
        code = key.charCodeAt(i);
        if (code < 0x80) {
          bytes[index++] = code;
        } else if (code < 0x800) {
          bytes[index++] = (0xc0 | (code >> 6));
          bytes[index++] = (0x80 | (code & 0x3f));
        } else if (code < 0xd800 || code >= 0xe000) {
          bytes[index++] = (0xe0 | (code >> 12));
          bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
          bytes[index++] = (0x80 | (code & 0x3f));
        } else {
          code = 0x10000 + (((code & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
          bytes[index++] = (0xf0 | (code >> 18));
          bytes[index++] = (0x80 | ((code >> 12) & 0x3f));
          bytes[index++] = (0x80 | ((code >> 6) & 0x3f));
          bytes[index++] = (0x80 | (code & 0x3f));
        }
      }
      key = bytes;
    } else {
      if (type === 'object') {
        if (key === null) {
          throw new Error(ERROR);
        } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
          key = new Uint8Array(key);
        } else if (!Array.isArray(key)) {
          if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
            throw new Error(ERROR);
          }
        }
      } else {
        throw new Error(ERROR);
      }
    }

    if (key.length > 64) {
      key = (new Sha256(is224, true)).update(key).array();
    }

    var oKeyPad = [], iKeyPad = [];
    for (i = 0; i < 64; ++i) {
      var b = key[i] || 0;
      oKeyPad[i] = 0x5c ^ b;
      iKeyPad[i] = 0x36 ^ b;
    }

    Sha256.call(this, is224, sharedMemory);

    this.update(iKeyPad);
    this.oKeyPad = oKeyPad;
    this.inner = true;
    this.sharedMemory = sharedMemory;
  }
  HmacSha256.prototype = new Sha256();

  HmacSha256.prototype.finalize = function () {
    Sha256.prototype.finalize.call(this);
    if (this.inner) {
      this.inner = false;
      var innerHash = this.array();
      Sha256.call(this, this.is224, this.sharedMemory);
      this.update(this.oKeyPad);
      this.update(innerHash);
      Sha256.prototype.finalize.call(this);
    }
  };

  var exports = createMethod();
  exports.sha256 = exports;
  exports.sha224 = createMethod(true);
  exports.sha256.hmac = createHmacMethod();
  exports.sha224.hmac = createHmacMethod(true);

  if (COMMON_JS) {
    module.exports = exports;
  } else {
    root.sha256 = exports.sha256;
    root.sha224 = exports.sha224;
    if (AMD) {
      define(function () {
        return exports;
      });
    }
  }
})();

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":8}],43:[function(require,module,exports){
(function(){

    // Copyright (c) 2005  Tom Wu
    // All Rights Reserved.
    // See "LICENSE" for details.

    // Basic JavaScript BN library - subset useful for RSA encryption.

    // Bits per digit
    var dbits;

    // JavaScript engine analysis
    var canary = 0xdeadbeefcafe;
    var j_lm = ((canary&0xffffff)==0xefcafe);

    // (public) Constructor
    function BigInteger(a,b,c) {
      if(a != null)
        if("number" == typeof a) this.fromNumber(a,b,c);
        else if(b == null && "string" != typeof a) this.fromString(a,256);
        else this.fromString(a,b);
    }

    // return new, unset BigInteger
    function nbi() { return new BigInteger(null); }

    // am: Compute w_j += (x*this_i), propagate carries,
    // c is initial carry, returns final carry.
    // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
    // We need to select the fastest one that works in this environment.

    // am1: use a single mult and divide to get the high bits,
    // max digit bits should be 26 because
    // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
    function am1(i,x,w,j,c,n) {
      while(--n >= 0) {
        var v = x*this[i++]+w[j]+c;
        c = Math.floor(v/0x4000000);
        w[j++] = v&0x3ffffff;
      }
      return c;
    }
    // am2 avoids a big mult-and-extract completely.
    // Max digit bits should be <= 30 because we do bitwise ops
    // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
    function am2(i,x,w,j,c,n) {
      var xl = x&0x7fff, xh = x>>15;
      while(--n >= 0) {
        var l = this[i]&0x7fff;
        var h = this[i++]>>15;
        var m = xh*l+h*xl;
        l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
        c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
        w[j++] = l&0x3fffffff;
      }
      return c;
    }
    // Alternately, set max digit bits to 28 since some
    // browsers slow down when dealing with 32-bit numbers.
    function am3(i,x,w,j,c,n) {
      var xl = x&0x3fff, xh = x>>14;
      while(--n >= 0) {
        var l = this[i]&0x3fff;
        var h = this[i++]>>14;
        var m = xh*l+h*xl;
        l = xl*l+((m&0x3fff)<<14)+w[j]+c;
        c = (l>>28)+(m>>14)+xh*h;
        w[j++] = l&0xfffffff;
      }
      return c;
    }
    var inBrowser = typeof navigator !== "undefined";
    if(inBrowser && j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
      BigInteger.prototype.am = am2;
      dbits = 30;
    }
    else if(inBrowser && j_lm && (navigator.appName != "Netscape")) {
      BigInteger.prototype.am = am1;
      dbits = 26;
    }
    else { // Mozilla/Netscape seems to prefer am3
      BigInteger.prototype.am = am3;
      dbits = 28;
    }

    BigInteger.prototype.DB = dbits;
    BigInteger.prototype.DM = ((1<<dbits)-1);
    BigInteger.prototype.DV = (1<<dbits);

    var BI_FP = 52;
    BigInteger.prototype.FV = Math.pow(2,BI_FP);
    BigInteger.prototype.F1 = BI_FP-dbits;
    BigInteger.prototype.F2 = 2*dbits-BI_FP;

    // Digit conversions
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = new Array();
    var rr,vv;
    rr = "0".charCodeAt(0);
    for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

    function int2char(n) { return BI_RM.charAt(n); }
    function intAt(s,i) {
      var c = BI_RC[s.charCodeAt(i)];
      return (c==null)?-1:c;
    }

    // (protected) copy this to r
    function bnpCopyTo(r) {
      for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
      r.t = this.t;
      r.s = this.s;
    }

    // (protected) set from integer value x, -DV <= x < DV
    function bnpFromInt(x) {
      this.t = 1;
      this.s = (x<0)?-1:0;
      if(x > 0) this[0] = x;
      else if(x < -1) this[0] = x+this.DV;
      else this.t = 0;
    }

    // return bigint initialized to value
    function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

    // (protected) set from string and radix
    function bnpFromString(s,b) {
      var k;
      if(b == 16) k = 4;
      else if(b == 8) k = 3;
      else if(b == 256) k = 8; // byte array
      else if(b == 2) k = 1;
      else if(b == 32) k = 5;
      else if(b == 4) k = 2;
      else { this.fromRadix(s,b); return; }
      this.t = 0;
      this.s = 0;
      var i = s.length, mi = false, sh = 0;
      while(--i >= 0) {
        var x = (k==8)?s[i]&0xff:intAt(s,i);
        if(x < 0) {
          if(s.charAt(i) == "-") mi = true;
          continue;
        }
        mi = false;
        if(sh == 0)
          this[this.t++] = x;
        else if(sh+k > this.DB) {
          this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
          this[this.t++] = (x>>(this.DB-sh));
        }
        else
          this[this.t-1] |= x<<sh;
        sh += k;
        if(sh >= this.DB) sh -= this.DB;
      }
      if(k == 8 && (s[0]&0x80) != 0) {
        this.s = -1;
        if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
      }
      this.clamp();
      if(mi) BigInteger.ZERO.subTo(this,this);
    }

    // (protected) clamp off excess high words
    function bnpClamp() {
      var c = this.s&this.DM;
      while(this.t > 0 && this[this.t-1] == c) --this.t;
    }

    // (public) return string representation in given radix
    function bnToString(b) {
      if(this.s < 0) return "-"+this.negate().toString(b);
      var k;
      if(b == 16) k = 4;
      else if(b == 8) k = 3;
      else if(b == 2) k = 1;
      else if(b == 32) k = 5;
      else if(b == 4) k = 2;
      else return this.toRadix(b);
      var km = (1<<k)-1, d, m = false, r = "", i = this.t;
      var p = this.DB-(i*this.DB)%k;
      if(i-- > 0) {
        if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
        while(i >= 0) {
          if(p < k) {
            d = (this[i]&((1<<p)-1))<<(k-p);
            d |= this[--i]>>(p+=this.DB-k);
          }
          else {
            d = (this[i]>>(p-=k))&km;
            if(p <= 0) { p += this.DB; --i; }
          }
          if(d > 0) m = true;
          if(m) r += int2char(d);
        }
      }
      return m?r:"0";
    }

    // (public) -this
    function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

    // (public) |this|
    function bnAbs() { return (this.s<0)?this.negate():this; }

    // (public) return + if this > a, - if this < a, 0 if equal
    function bnCompareTo(a) {
      var r = this.s-a.s;
      if(r != 0) return r;
      var i = this.t;
      r = i-a.t;
      if(r != 0) return (this.s<0)?-r:r;
      while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
      return 0;
    }

    // returns bit length of the integer x
    function nbits(x) {
      var r = 1, t;
      if((t=x>>>16) != 0) { x = t; r += 16; }
      if((t=x>>8) != 0) { x = t; r += 8; }
      if((t=x>>4) != 0) { x = t; r += 4; }
      if((t=x>>2) != 0) { x = t; r += 2; }
      if((t=x>>1) != 0) { x = t; r += 1; }
      return r;
    }

    // (public) return the number of bits in "this"
    function bnBitLength() {
      if(this.t <= 0) return 0;
      return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
    }

    // (protected) r = this << n*DB
    function bnpDLShiftTo(n,r) {
      var i;
      for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
      for(i = n-1; i >= 0; --i) r[i] = 0;
      r.t = this.t+n;
      r.s = this.s;
    }

    // (protected) r = this >> n*DB
    function bnpDRShiftTo(n,r) {
      for(var i = n; i < this.t; ++i) r[i-n] = this[i];
      r.t = Math.max(this.t-n,0);
      r.s = this.s;
    }

    // (protected) r = this << n
    function bnpLShiftTo(n,r) {
      var bs = n%this.DB;
      var cbs = this.DB-bs;
      var bm = (1<<cbs)-1;
      var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
      for(i = this.t-1; i >= 0; --i) {
        r[i+ds+1] = (this[i]>>cbs)|c;
        c = (this[i]&bm)<<bs;
      }
      for(i = ds-1; i >= 0; --i) r[i] = 0;
      r[ds] = c;
      r.t = this.t+ds+1;
      r.s = this.s;
      r.clamp();
    }

    // (protected) r = this >> n
    function bnpRShiftTo(n,r) {
      r.s = this.s;
      var ds = Math.floor(n/this.DB);
      if(ds >= this.t) { r.t = 0; return; }
      var bs = n%this.DB;
      var cbs = this.DB-bs;
      var bm = (1<<bs)-1;
      r[0] = this[ds]>>bs;
      for(var i = ds+1; i < this.t; ++i) {
        r[i-ds-1] |= (this[i]&bm)<<cbs;
        r[i-ds] = this[i]>>bs;
      }
      if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
      r.t = this.t-ds;
      r.clamp();
    }

    // (protected) r = this - a
    function bnpSubTo(a,r) {
      var i = 0, c = 0, m = Math.min(a.t,this.t);
      while(i < m) {
        c += this[i]-a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      if(a.t < this.t) {
        c -= a.s;
        while(i < this.t) {
          c += this[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c += this.s;
      }
      else {
        c += this.s;
        while(i < a.t) {
          c -= a[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c -= a.s;
      }
      r.s = (c<0)?-1:0;
      if(c < -1) r[i++] = this.DV+c;
      else if(c > 0) r[i++] = c;
      r.t = i;
      r.clamp();
    }

    // (protected) r = this * a, r != this,a (HAC 14.12)
    // "this" should be the larger one if appropriate.
    function bnpMultiplyTo(a,r) {
      var x = this.abs(), y = a.abs();
      var i = x.t;
      r.t = i+y.t;
      while(--i >= 0) r[i] = 0;
      for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
      r.s = 0;
      r.clamp();
      if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
    }

    // (protected) r = this^2, r != this (HAC 14.16)
    function bnpSquareTo(r) {
      var x = this.abs();
      var i = r.t = 2*x.t;
      while(--i >= 0) r[i] = 0;
      for(i = 0; i < x.t-1; ++i) {
        var c = x.am(i,x[i],r,2*i,0,1);
        if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
          r[i+x.t] -= x.DV;
          r[i+x.t+1] = 1;
        }
      }
      if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
      r.s = 0;
      r.clamp();
    }

    // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
    // r != q, this != m.  q or r may be null.
    function bnpDivRemTo(m,q,r) {
      var pm = m.abs();
      if(pm.t <= 0) return;
      var pt = this.abs();
      if(pt.t < pm.t) {
        if(q != null) q.fromInt(0);
        if(r != null) this.copyTo(r);
        return;
      }
      if(r == null) r = nbi();
      var y = nbi(), ts = this.s, ms = m.s;
      var nsh = this.DB-nbits(pm[pm.t-1]);   // normalize modulus
      if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
      else { pm.copyTo(y); pt.copyTo(r); }
      var ys = y.t;
      var y0 = y[ys-1];
      if(y0 == 0) return;
      var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
      var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
      var i = r.t, j = i-ys, t = (q==null)?nbi():q;
      y.dlShiftTo(j,t);
      if(r.compareTo(t) >= 0) {
        r[r.t++] = 1;
        r.subTo(t,r);
      }
      BigInteger.ONE.dlShiftTo(ys,t);
      t.subTo(y,y);  // "negative" y so we can replace sub with am later
      while(y.t < ys) y[y.t++] = 0;
      while(--j >= 0) {
        // Estimate quotient digit
        var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
        if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {   // Try it out
          y.dlShiftTo(j,t);
          r.subTo(t,r);
          while(r[i] < --qd) r.subTo(t,r);
        }
      }
      if(q != null) {
        r.drShiftTo(ys,q);
        if(ts != ms) BigInteger.ZERO.subTo(q,q);
      }
      r.t = ys;
      r.clamp();
      if(nsh > 0) r.rShiftTo(nsh,r); // Denormalize remainder
      if(ts < 0) BigInteger.ZERO.subTo(r,r);
    }

    // (public) this mod a
    function bnMod(a) {
      var r = nbi();
      this.abs().divRemTo(a,null,r);
      if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
      return r;
    }

    // Modular reduction using "classic" algorithm
    function Classic(m) { this.m = m; }
    function cConvert(x) {
      if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
      else return x;
    }
    function cRevert(x) { return x; }
    function cReduce(x) { x.divRemTo(this.m,null,x); }
    function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
    function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    Classic.prototype.convert = cConvert;
    Classic.prototype.revert = cRevert;
    Classic.prototype.reduce = cReduce;
    Classic.prototype.mulTo = cMulTo;
    Classic.prototype.sqrTo = cSqrTo;

    // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
    // justification:
    //         xy == 1 (mod m)
    //         xy =  1+km
    //   xy(2-xy) = (1+km)(1-km)
    // x[y(2-xy)] = 1-k^2m^2
    // x[y(2-xy)] == 1 (mod m^2)
    // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
    // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
    // JS multiply "overflows" differently from C/C++, so care is needed here.
    function bnpInvDigit() {
      if(this.t < 1) return 0;
      var x = this[0];
      if((x&1) == 0) return 0;
      var y = x&3;       // y == 1/x mod 2^2
      y = (y*(2-(x&0xf)*y))&0xf; // y == 1/x mod 2^4
      y = (y*(2-(x&0xff)*y))&0xff;   // y == 1/x mod 2^8
      y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;    // y == 1/x mod 2^16
      // last step - calculate inverse mod DV directly;
      // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
      y = (y*(2-x*y%this.DV))%this.DV;       // y == 1/x mod 2^dbits
      // we really want the negative inverse, and -DV < y < DV
      return (y>0)?this.DV-y:-y;
    }

    // Montgomery reduction
    function Montgomery(m) {
      this.m = m;
      this.mp = m.invDigit();
      this.mpl = this.mp&0x7fff;
      this.mph = this.mp>>15;
      this.um = (1<<(m.DB-15))-1;
      this.mt2 = 2*m.t;
    }

    // xR mod m
    function montConvert(x) {
      var r = nbi();
      x.abs().dlShiftTo(this.m.t,r);
      r.divRemTo(this.m,null,r);
      if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
      return r;
    }

    // x/R mod m
    function montRevert(x) {
      var r = nbi();
      x.copyTo(r);
      this.reduce(r);
      return r;
    }

    // x = x/R mod m (HAC 14.32)
    function montReduce(x) {
      while(x.t <= this.mt2) // pad x so am has enough room later
        x[x.t++] = 0;
      for(var i = 0; i < this.m.t; ++i) {
        // faster way of calculating u0 = x[i]*mp mod DV
        var j = x[i]&0x7fff;
        var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
        // use am to combine the multiply-shift-add into one call
        j = i+this.m.t;
        x[j] += this.m.am(0,u0,x,i,0,this.m.t);
        // propagate carry
        while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
      }
      x.clamp();
      x.drShiftTo(this.m.t,x);
      if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
    }

    // r = "x^2/R mod m"; x != r
    function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    // r = "xy/R mod m"; x,y != r
    function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

    Montgomery.prototype.convert = montConvert;
    Montgomery.prototype.revert = montRevert;
    Montgomery.prototype.reduce = montReduce;
    Montgomery.prototype.mulTo = montMulTo;
    Montgomery.prototype.sqrTo = montSqrTo;

    // (protected) true iff this is even
    function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

    // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
    function bnpExp(e,z) {
      if(e > 0xffffffff || e < 1) return BigInteger.ONE;
      var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
      g.copyTo(r);
      while(--i >= 0) {
        z.sqrTo(r,r2);
        if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
        else { var t = r; r = r2; r2 = t; }
      }
      return z.revert(r);
    }

    // (public) this^e % m, 0 <= e < 2^32
    function bnModPowInt(e,m) {
      var z;
      if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
      return this.exp(e,z);
    }

    // protected
    BigInteger.prototype.copyTo = bnpCopyTo;
    BigInteger.prototype.fromInt = bnpFromInt;
    BigInteger.prototype.fromString = bnpFromString;
    BigInteger.prototype.clamp = bnpClamp;
    BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
    BigInteger.prototype.drShiftTo = bnpDRShiftTo;
    BigInteger.prototype.lShiftTo = bnpLShiftTo;
    BigInteger.prototype.rShiftTo = bnpRShiftTo;
    BigInteger.prototype.subTo = bnpSubTo;
    BigInteger.prototype.multiplyTo = bnpMultiplyTo;
    BigInteger.prototype.squareTo = bnpSquareTo;
    BigInteger.prototype.divRemTo = bnpDivRemTo;
    BigInteger.prototype.invDigit = bnpInvDigit;
    BigInteger.prototype.isEven = bnpIsEven;
    BigInteger.prototype.exp = bnpExp;

    // public
    BigInteger.prototype.toString = bnToString;
    BigInteger.prototype.negate = bnNegate;
    BigInteger.prototype.abs = bnAbs;
    BigInteger.prototype.compareTo = bnCompareTo;
    BigInteger.prototype.bitLength = bnBitLength;
    BigInteger.prototype.mod = bnMod;
    BigInteger.prototype.modPowInt = bnModPowInt;

    // "constants"
    BigInteger.ZERO = nbv(0);
    BigInteger.ONE = nbv(1);

    // Copyright (c) 2005-2009  Tom Wu
    // All Rights Reserved.
    // See "LICENSE" for details.

    // Extended JavaScript BN functions, required for RSA private ops.

    // Version 1.1: new BigInteger("0", 10) returns "proper" zero
    // Version 1.2: square() API, isProbablePrime fix

    // (public)
    function bnClone() { var r = nbi(); this.copyTo(r); return r; }

    // (public) return value as integer
    function bnIntValue() {
      if(this.s < 0) {
        if(this.t == 1) return this[0]-this.DV;
        else if(this.t == 0) return -1;
      }
      else if(this.t == 1) return this[0];
      else if(this.t == 0) return 0;
      // assumes 16 < DB < 32
      return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
    }

    // (public) return value as byte
    function bnByteValue() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

    // (public) return value as short (assumes DB>=16)
    function bnShortValue() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

    // (protected) return x s.t. r^x < DV
    function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

    // (public) 0 if this == 0, 1 if this > 0
    function bnSigNum() {
      if(this.s < 0) return -1;
      else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
      else return 1;
    }

    // (protected) convert to radix string
    function bnpToRadix(b) {
      if(b == null) b = 10;
      if(this.signum() == 0 || b < 2 || b > 36) return "0";
      var cs = this.chunkSize(b);
      var a = Math.pow(b,cs);
      var d = nbv(a), y = nbi(), z = nbi(), r = "";
      this.divRemTo(d,y,z);
      while(y.signum() > 0) {
        r = (a+z.intValue()).toString(b).substr(1) + r;
        y.divRemTo(d,y,z);
      }
      return z.intValue().toString(b) + r;
    }

    // (protected) convert from radix string
    function bnpFromRadix(s,b) {
      this.fromInt(0);
      if(b == null) b = 10;
      var cs = this.chunkSize(b);
      var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
      for(var i = 0; i < s.length; ++i) {
        var x = intAt(s,i);
        if(x < 0) {
          if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
          continue;
        }
        w = b*w+x;
        if(++j >= cs) {
          this.dMultiply(d);
          this.dAddOffset(w,0);
          j = 0;
          w = 0;
        }
      }
      if(j > 0) {
        this.dMultiply(Math.pow(b,j));
        this.dAddOffset(w,0);
      }
      if(mi) BigInteger.ZERO.subTo(this,this);
    }

    // (protected) alternate constructor
    function bnpFromNumber(a,b,c) {
      if("number" == typeof b) {
        // new BigInteger(int,int,RNG)
        if(a < 2) this.fromInt(1);
        else {
          this.fromNumber(a,c);
          if(!this.testBit(a-1))    // force MSB set
            this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
          if(this.isEven()) this.dAddOffset(1,0); // force odd
          while(!this.isProbablePrime(b)) {
            this.dAddOffset(2,0);
            if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
          }
        }
      }
      else {
        // new BigInteger(int,RNG)
        var x = new Array(), t = a&7;
        x.length = (a>>3)+1;
        b.nextBytes(x);
        if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
        this.fromString(x,256);
      }
    }

    // (public) convert to bigendian byte array
    function bnToByteArray() {
      var i = this.t, r = new Array();
      r[0] = this.s;
      var p = this.DB-(i*this.DB)%8, d, k = 0;
      if(i-- > 0) {
        if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
          r[k++] = d|(this.s<<(this.DB-p));
        while(i >= 0) {
          if(p < 8) {
            d = (this[i]&((1<<p)-1))<<(8-p);
            d |= this[--i]>>(p+=this.DB-8);
          }
          else {
            d = (this[i]>>(p-=8))&0xff;
            if(p <= 0) { p += this.DB; --i; }
          }
          if((d&0x80) != 0) d |= -256;
          if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
          if(k > 0 || d != this.s) r[k++] = d;
        }
      }
      return r;
    }

    function bnEquals(a) { return(this.compareTo(a)==0); }
    function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
    function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

    // (protected) r = this op a (bitwise)
    function bnpBitwiseTo(a,op,r) {
      var i, f, m = Math.min(a.t,this.t);
      for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
      if(a.t < this.t) {
        f = a.s&this.DM;
        for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
        r.t = this.t;
      }
      else {
        f = this.s&this.DM;
        for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
        r.t = a.t;
      }
      r.s = op(this.s,a.s);
      r.clamp();
    }

    // (public) this & a
    function op_and(x,y) { return x&y; }
    function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

    // (public) this | a
    function op_or(x,y) { return x|y; }
    function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

    // (public) this ^ a
    function op_xor(x,y) { return x^y; }
    function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

    // (public) this & ~a
    function op_andnot(x,y) { return x&~y; }
    function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

    // (public) ~this
    function bnNot() {
      var r = nbi();
      for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
      r.t = this.t;
      r.s = ~this.s;
      return r;
    }

    // (public) this << n
    function bnShiftLeft(n) {
      var r = nbi();
      if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
      return r;
    }

    // (public) this >> n
    function bnShiftRight(n) {
      var r = nbi();
      if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
      return r;
    }

    // return index of lowest 1-bit in x, x < 2^31
    function lbit(x) {
      if(x == 0) return -1;
      var r = 0;
      if((x&0xffff) == 0) { x >>= 16; r += 16; }
      if((x&0xff) == 0) { x >>= 8; r += 8; }
      if((x&0xf) == 0) { x >>= 4; r += 4; }
      if((x&3) == 0) { x >>= 2; r += 2; }
      if((x&1) == 0) ++r;
      return r;
    }

    // (public) returns index of lowest 1-bit (or -1 if none)
    function bnGetLowestSetBit() {
      for(var i = 0; i < this.t; ++i)
        if(this[i] != 0) return i*this.DB+lbit(this[i]);
      if(this.s < 0) return this.t*this.DB;
      return -1;
    }

    // return number of 1 bits in x
    function cbit(x) {
      var r = 0;
      while(x != 0) { x &= x-1; ++r; }
      return r;
    }

    // (public) return number of set bits
    function bnBitCount() {
      var r = 0, x = this.s&this.DM;
      for(var i = 0; i < this.t; ++i) r += cbit(this[i]^x);
      return r;
    }

    // (public) true iff nth bit is set
    function bnTestBit(n) {
      var j = Math.floor(n/this.DB);
      if(j >= this.t) return(this.s!=0);
      return((this[j]&(1<<(n%this.DB)))!=0);
    }

    // (protected) this op (1<<n)
    function bnpChangeBit(n,op) {
      var r = BigInteger.ONE.shiftLeft(n);
      this.bitwiseTo(r,op,r);
      return r;
    }

    // (public) this | (1<<n)
    function bnSetBit(n) { return this.changeBit(n,op_or); }

    // (public) this & ~(1<<n)
    function bnClearBit(n) { return this.changeBit(n,op_andnot); }

    // (public) this ^ (1<<n)
    function bnFlipBit(n) { return this.changeBit(n,op_xor); }

    // (protected) r = this + a
    function bnpAddTo(a,r) {
      var i = 0, c = 0, m = Math.min(a.t,this.t);
      while(i < m) {
        c += this[i]+a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      if(a.t < this.t) {
        c += a.s;
        while(i < this.t) {
          c += this[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c += this.s;
      }
      else {
        c += this.s;
        while(i < a.t) {
          c += a[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c += a.s;
      }
      r.s = (c<0)?-1:0;
      if(c > 0) r[i++] = c;
      else if(c < -1) r[i++] = this.DV+c;
      r.t = i;
      r.clamp();
    }

    // (public) this + a
    function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

    // (public) this - a
    function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

    // (public) this * a
    function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

    // (public) this^2
    function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

    // (public) this / a
    function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

    // (public) this % a
    function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

    // (public) [this/a,this%a]
    function bnDivideAndRemainder(a) {
      var q = nbi(), r = nbi();
      this.divRemTo(a,q,r);
      return new Array(q,r);
    }

    // (protected) this *= n, this >= 0, 1 < n < DV
    function bnpDMultiply(n) {
      this[this.t] = this.am(0,n-1,this,0,0,this.t);
      ++this.t;
      this.clamp();
    }

    // (protected) this += n << w words, this >= 0
    function bnpDAddOffset(n,w) {
      if(n == 0) return;
      while(this.t <= w) this[this.t++] = 0;
      this[w] += n;
      while(this[w] >= this.DV) {
        this[w] -= this.DV;
        if(++w >= this.t) this[this.t++] = 0;
        ++this[w];
      }
    }

    // A "null" reducer
    function NullExp() {}
    function nNop(x) { return x; }
    function nMulTo(x,y,r) { x.multiplyTo(y,r); }
    function nSqrTo(x,r) { x.squareTo(r); }

    NullExp.prototype.convert = nNop;
    NullExp.prototype.revert = nNop;
    NullExp.prototype.mulTo = nMulTo;
    NullExp.prototype.sqrTo = nSqrTo;

    // (public) this^e
    function bnPow(e) { return this.exp(e,new NullExp()); }

    // (protected) r = lower n words of "this * a", a.t <= n
    // "this" should be the larger one if appropriate.
    function bnpMultiplyLowerTo(a,n,r) {
      var i = Math.min(this.t+a.t,n);
      r.s = 0; // assumes a,this >= 0
      r.t = i;
      while(i > 0) r[--i] = 0;
      var j;
      for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
      for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
      r.clamp();
    }

    // (protected) r = "this * a" without lower n words, n > 0
    // "this" should be the larger one if appropriate.
    function bnpMultiplyUpperTo(a,n,r) {
      --n;
      var i = r.t = this.t+a.t-n;
      r.s = 0; // assumes a,this >= 0
      while(--i >= 0) r[i] = 0;
      for(i = Math.max(n-this.t,0); i < a.t; ++i)
        r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
      r.clamp();
      r.drShiftTo(1,r);
    }

    // Barrett modular reduction
    function Barrett(m) {
      // setup Barrett
      this.r2 = nbi();
      this.q3 = nbi();
      BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
      this.mu = this.r2.divide(m);
      this.m = m;
    }

    function barrettConvert(x) {
      if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
      else if(x.compareTo(this.m) < 0) return x;
      else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
    }

    function barrettRevert(x) { return x; }

    // x = x mod m (HAC 14.42)
    function barrettReduce(x) {
      x.drShiftTo(this.m.t-1,this.r2);
      if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
      this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
      this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
      while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
      x.subTo(this.r2,x);
      while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
    }

    // r = x^2 mod m; x != r
    function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    // r = x*y mod m; x,y != r
    function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

    Barrett.prototype.convert = barrettConvert;
    Barrett.prototype.revert = barrettRevert;
    Barrett.prototype.reduce = barrettReduce;
    Barrett.prototype.mulTo = barrettMulTo;
    Barrett.prototype.sqrTo = barrettSqrTo;

    // (public) this^e % m (HAC 14.85)
    function bnModPow(e,m) {
      var i = e.bitLength(), k, r = nbv(1), z;
      if(i <= 0) return r;
      else if(i < 18) k = 1;
      else if(i < 48) k = 3;
      else if(i < 144) k = 4;
      else if(i < 768) k = 5;
      else k = 6;
      if(i < 8)
        z = new Classic(m);
      else if(m.isEven())
        z = new Barrett(m);
      else
        z = new Montgomery(m);

      // precomputation
      var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
      g[1] = z.convert(this);
      if(k > 1) {
        var g2 = nbi();
        z.sqrTo(g[1],g2);
        while(n <= km) {
          g[n] = nbi();
          z.mulTo(g2,g[n-2],g[n]);
          n += 2;
        }
      }

      var j = e.t-1, w, is1 = true, r2 = nbi(), t;
      i = nbits(e[j])-1;
      while(j >= 0) {
        if(i >= k1) w = (e[j]>>(i-k1))&km;
        else {
          w = (e[j]&((1<<(i+1))-1))<<(k1-i);
          if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
        }

        n = k;
        while((w&1) == 0) { w >>= 1; --n; }
        if((i -= n) < 0) { i += this.DB; --j; }
        if(is1) {    // ret == 1, don't bother squaring or multiplying it
          g[w].copyTo(r);
          is1 = false;
        }
        else {
          while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
          if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
          z.mulTo(r2,g[w],r);
        }

        while(j >= 0 && (e[j]&(1<<i)) == 0) {
          z.sqrTo(r,r2); t = r; r = r2; r2 = t;
          if(--i < 0) { i = this.DB-1; --j; }
        }
      }
      return z.revert(r);
    }

    // (public) gcd(this,a) (HAC 14.54)
    function bnGCD(a) {
      var x = (this.s<0)?this.negate():this.clone();
      var y = (a.s<0)?a.negate():a.clone();
      if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
      var i = x.getLowestSetBit(), g = y.getLowestSetBit();
      if(g < 0) return x;
      if(i < g) g = i;
      if(g > 0) {
        x.rShiftTo(g,x);
        y.rShiftTo(g,y);
      }
      while(x.signum() > 0) {
        if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
        if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
        if(x.compareTo(y) >= 0) {
          x.subTo(y,x);
          x.rShiftTo(1,x);
        }
        else {
          y.subTo(x,y);
          y.rShiftTo(1,y);
        }
      }
      if(g > 0) y.lShiftTo(g,y);
      return y;
    }

    // (protected) this % n, n < 2^26
    function bnpModInt(n) {
      if(n <= 0) return 0;
      var d = this.DV%n, r = (this.s<0)?n-1:0;
      if(this.t > 0)
        if(d == 0) r = this[0]%n;
        else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
      return r;
    }

    // (public) 1/this % m (HAC 14.61)
    function bnModInverse(m) {
      var ac = m.isEven();
      if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
      var u = m.clone(), v = this.clone();
      var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
      while(u.signum() != 0) {
        while(u.isEven()) {
          u.rShiftTo(1,u);
          if(ac) {
            if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
            a.rShiftTo(1,a);
          }
          else if(!b.isEven()) b.subTo(m,b);
          b.rShiftTo(1,b);
        }
        while(v.isEven()) {
          v.rShiftTo(1,v);
          if(ac) {
            if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
            c.rShiftTo(1,c);
          }
          else if(!d.isEven()) d.subTo(m,d);
          d.rShiftTo(1,d);
        }
        if(u.compareTo(v) >= 0) {
          u.subTo(v,u);
          if(ac) a.subTo(c,a);
          b.subTo(d,b);
        }
        else {
          v.subTo(u,v);
          if(ac) c.subTo(a,c);
          d.subTo(b,d);
        }
      }
      if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
      if(d.compareTo(m) >= 0) return d.subtract(m);
      if(d.signum() < 0) d.addTo(m,d); else return d;
      if(d.signum() < 0) return d.add(m); else return d;
    }

    var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
    var lplim = (1<<26)/lowprimes[lowprimes.length-1];

    // (public) test primality with certainty >= 1-.5^t
    function bnIsProbablePrime(t) {
      var i, x = this.abs();
      if(x.t == 1 && x[0] <= lowprimes[lowprimes.length-1]) {
        for(i = 0; i < lowprimes.length; ++i)
          if(x[0] == lowprimes[i]) return true;
        return false;
      }
      if(x.isEven()) return false;
      i = 1;
      while(i < lowprimes.length) {
        var m = lowprimes[i], j = i+1;
        while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
        m = x.modInt(m);
        while(i < j) if(m%lowprimes[i++] == 0) return false;
      }
      return x.millerRabin(t);
    }

    // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
    function bnpMillerRabin(t) {
      var n1 = this.subtract(BigInteger.ONE);
      var k = n1.getLowestSetBit();
      if(k <= 0) return false;
      var r = n1.shiftRight(k);
      t = (t+1)>>1;
      if(t > lowprimes.length) t = lowprimes.length;
      var a = nbi();
      for(var i = 0; i < t; ++i) {
        //Pick bases at random, instead of starting at 2
        a.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);
        var y = a.modPow(r,this);
        if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
          var j = 1;
          while(j++ < k && y.compareTo(n1) != 0) {
            y = y.modPowInt(2,this);
            if(y.compareTo(BigInteger.ONE) == 0) return false;
          }
          if(y.compareTo(n1) != 0) return false;
        }
      }
      return true;
    }

    // protected
    BigInteger.prototype.chunkSize = bnpChunkSize;
    BigInteger.prototype.toRadix = bnpToRadix;
    BigInteger.prototype.fromRadix = bnpFromRadix;
    BigInteger.prototype.fromNumber = bnpFromNumber;
    BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
    BigInteger.prototype.changeBit = bnpChangeBit;
    BigInteger.prototype.addTo = bnpAddTo;
    BigInteger.prototype.dMultiply = bnpDMultiply;
    BigInteger.prototype.dAddOffset = bnpDAddOffset;
    BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
    BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
    BigInteger.prototype.modInt = bnpModInt;
    BigInteger.prototype.millerRabin = bnpMillerRabin;

    // public
    BigInteger.prototype.clone = bnClone;
    BigInteger.prototype.intValue = bnIntValue;
    BigInteger.prototype.byteValue = bnByteValue;
    BigInteger.prototype.shortValue = bnShortValue;
    BigInteger.prototype.signum = bnSigNum;
    BigInteger.prototype.toByteArray = bnToByteArray;
    BigInteger.prototype.equals = bnEquals;
    BigInteger.prototype.min = bnMin;
    BigInteger.prototype.max = bnMax;
    BigInteger.prototype.and = bnAnd;
    BigInteger.prototype.or = bnOr;
    BigInteger.prototype.xor = bnXor;
    BigInteger.prototype.andNot = bnAndNot;
    BigInteger.prototype.not = bnNot;
    BigInteger.prototype.shiftLeft = bnShiftLeft;
    BigInteger.prototype.shiftRight = bnShiftRight;
    BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
    BigInteger.prototype.bitCount = bnBitCount;
    BigInteger.prototype.testBit = bnTestBit;
    BigInteger.prototype.setBit = bnSetBit;
    BigInteger.prototype.clearBit = bnClearBit;
    BigInteger.prototype.flipBit = bnFlipBit;
    BigInteger.prototype.add = bnAdd;
    BigInteger.prototype.subtract = bnSubtract;
    BigInteger.prototype.multiply = bnMultiply;
    BigInteger.prototype.divide = bnDivide;
    BigInteger.prototype.remainder = bnRemainder;
    BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
    BigInteger.prototype.modPow = bnModPow;
    BigInteger.prototype.modInverse = bnModInverse;
    BigInteger.prototype.pow = bnPow;
    BigInteger.prototype.gcd = bnGCD;
    BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

    // JSBN-specific extension
    BigInteger.prototype.square = bnSquare;

    // Expose the Barrett function
    BigInteger.prototype.Barrett = Barrett

    // BigInteger interfaces not implemented in jsbn:

    // BigInteger(int signum, byte[] magnitude)
    // double doubleValue()
    // float floatValue()
    // int hashCode()
    // long longValue()
    // static BigInteger valueOf(long val)

    // Random number generator - requires a PRNG backend, e.g. prng4.js

    // For best results, put code like
    // <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
    // in your main HTML document.

    var rng_state;
    var rng_pool;
    var rng_pptr;

    // Mix in a 32-bit integer into the pool
    function rng_seed_int(x) {
      rng_pool[rng_pptr++] ^= x & 255;
      rng_pool[rng_pptr++] ^= (x >> 8) & 255;
      rng_pool[rng_pptr++] ^= (x >> 16) & 255;
      rng_pool[rng_pptr++] ^= (x >> 24) & 255;
      if(rng_pptr >= rng_psize) rng_pptr -= rng_psize;
    }

    // Mix in the current time (w/milliseconds) into the pool
    function rng_seed_time() {
      rng_seed_int(new Date().getTime());
    }

    // Initialize the pool with junk if needed.
    if(rng_pool == null) {
      rng_pool = new Array();
      rng_pptr = 0;
      var t;
      if(typeof window !== "undefined" && window.crypto) {
        if (window.crypto.getRandomValues) {
          // Use webcrypto if available
          var ua = new Uint8Array(32);
          window.crypto.getRandomValues(ua);
          for(t = 0; t < 32; ++t)
            rng_pool[rng_pptr++] = ua[t];
        }
        else if(navigator.appName == "Netscape" && navigator.appVersion < "5") {
          // Extract entropy (256 bits) from NS4 RNG if available
          var z = window.crypto.random(32);
          for(t = 0; t < z.length; ++t)
            rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
        }
      }
      while(rng_pptr < rng_psize) {  // extract some randomness from Math.random()
        t = Math.floor(65536 * Math.random());
        rng_pool[rng_pptr++] = t >>> 8;
        rng_pool[rng_pptr++] = t & 255;
      }
      rng_pptr = 0;
      rng_seed_time();
      //rng_seed_int(window.screenX);
      //rng_seed_int(window.screenY);
    }

    function rng_get_byte() {
      if(rng_state == null) {
        rng_seed_time();
        rng_state = prng_newstate();
        rng_state.init(rng_pool);
        for(rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
          rng_pool[rng_pptr] = 0;
        rng_pptr = 0;
        //rng_pool = null;
      }
      // TODO: allow reseeding after first request
      return rng_state.next();
    }

    function rng_get_bytes(ba) {
      var i;
      for(i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
    }

    function SecureRandom() {}

    SecureRandom.prototype.nextBytes = rng_get_bytes;

    // prng4.js - uses Arcfour as a PRNG

    function Arcfour() {
      this.i = 0;
      this.j = 0;
      this.S = new Array();
    }

    // Initialize arcfour context from key, an array of ints, each from [0..255]
    function ARC4init(key) {
      var i, j, t;
      for(i = 0; i < 256; ++i)
        this.S[i] = i;
      j = 0;
      for(i = 0; i < 256; ++i) {
        j = (j + this.S[i] + key[i % key.length]) & 255;
        t = this.S[i];
        this.S[i] = this.S[j];
        this.S[j] = t;
      }
      this.i = 0;
      this.j = 0;
    }

    function ARC4next() {
      var t;
      this.i = (this.i + 1) & 255;
      this.j = (this.j + this.S[this.i]) & 255;
      t = this.S[this.i];
      this.S[this.i] = this.S[this.j];
      this.S[this.j] = t;
      return this.S[(t + this.S[this.i]) & 255];
    }

    Arcfour.prototype.init = ARC4init;
    Arcfour.prototype.next = ARC4next;

    // Plug in your RNG constructor here
    function prng_newstate() {
      return new Arcfour();
    }

    // Pool size must be a multiple of 4 and greater than 32.
    // An array of bytes the size of the pool will be passed to init()
    var rng_psize = 256;

    if (typeof exports !== 'undefined') {
        exports = module.exports = {
            default: BigInteger,
            BigInteger: BigInteger,
            SecureRandom: SecureRandom,
        };
    } else {
        this.jsbn = {
          BigInteger: BigInteger,
          SecureRandom: SecureRandom
        };
    }

}).call(this);

},{}],44:[function(require,module,exports){
(function (Buffer){(function (){

var navigator = {};
navigator.userAgent = false;

var window = {};
/*
 * jsrsasign(all) 8.0.24 (2020-08-18) (c) 2010-2020 Kenji Urushima | kjur.github.com/jsrsasign/license
 */

/*!
Copyright (c) 2011, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.9.0
*/
if(YAHOO===undefined){var YAHOO={}}YAHOO.lang={extend:function(g,h,f){if(!h||!g){throw new Error("YAHOO.lang.extend failed, please check that all dependencies are included.")}var d=function(){};d.prototype=h.prototype;g.prototype=new d();g.prototype.constructor=g;g.superclass=h.prototype;if(h.prototype.constructor==Object.prototype.constructor){h.prototype.constructor=h}if(f){var b;for(b in f){g.prototype[b]=f[b]}var e=function(){},c=["toString","valueOf"];try{if(/MSIE/.test(navigator.userAgent)){e=function(j,i){for(b=0;b<c.length;b=b+1){var l=c[b],k=i[l];if(typeof k==="function"&&k!=Object.prototype[l]){j[l]=k}}}}}catch(a){}e(g.prototype,f)}}};

/*! CryptoJS v3.1.2 core-fix.js
 * code.google.com/p/crypto-js
 * (c) 2009-2013 by Jeff Mott. All rights reserved.
 * code.google.com/p/crypto-js/wiki/License
 * THIS IS FIX of 'core.js' to fix Hmac issue.
 * https://code.google.com/p/crypto-js/issues/detail?id=84
 * https://crypto-js.googlecode.com/svn-history/r667/branches/3.x/src/core.js
 */
var CryptoJS=CryptoJS||(function(e,g){var a={};var b=a.lib={};var j=b.Base=(function(){function n(){}return{extend:function(p){n.prototype=this;var o=new n();if(p){o.mixIn(p)}if(!o.hasOwnProperty("init")){o.init=function(){o.$super.init.apply(this,arguments)}}o.init.prototype=o;o.$super=this;return o},create:function(){var o=this.extend();o.init.apply(o,arguments);return o},init:function(){},mixIn:function(p){for(var o in p){if(p.hasOwnProperty(o)){this[o]=p[o]}}if(p.hasOwnProperty("toString")){this.toString=p.toString}},clone:function(){return this.init.prototype.extend(this)}}}());var l=b.WordArray=j.extend({init:function(o,n){o=this.words=o||[];if(n!=g){this.sigBytes=n}else{this.sigBytes=o.length*4}},toString:function(n){return(n||h).stringify(this)},concat:function(t){var q=this.words;var p=t.words;var n=this.sigBytes;var s=t.sigBytes;this.clamp();if(n%4){for(var r=0;r<s;r++){var o=(p[r>>>2]>>>(24-(r%4)*8))&255;q[(n+r)>>>2]|=o<<(24-((n+r)%4)*8)}}else{for(var r=0;r<s;r+=4){q[(n+r)>>>2]=p[r>>>2]}}this.sigBytes+=s;return this},clamp:function(){var o=this.words;var n=this.sigBytes;o[n>>>2]&=4294967295<<(32-(n%4)*8);o.length=e.ceil(n/4)},clone:function(){var n=j.clone.call(this);n.words=this.words.slice(0);return n},random:function(p){var o=[];for(var n=0;n<p;n+=4){o.push((e.random()*4294967296)|0)}return new l.init(o,p)}});var m=a.enc={};var h=m.Hex={stringify:function(p){var r=p.words;var o=p.sigBytes;var q=[];for(var n=0;n<o;n++){var s=(r[n>>>2]>>>(24-(n%4)*8))&255;q.push((s>>>4).toString(16));q.push((s&15).toString(16))}return q.join("")},parse:function(p){var n=p.length;var q=[];for(var o=0;o<n;o+=2){q[o>>>3]|=parseInt(p.substr(o,2),16)<<(24-(o%8)*4)}return new l.init(q,n/2)}};var d=m.Latin1={stringify:function(q){var r=q.words;var p=q.sigBytes;var n=[];for(var o=0;o<p;o++){var s=(r[o>>>2]>>>(24-(o%4)*8))&255;n.push(String.fromCharCode(s))}return n.join("")},parse:function(p){var n=p.length;var q=[];for(var o=0;o<n;o++){q[o>>>2]|=(p.charCodeAt(o)&255)<<(24-(o%4)*8)}return new l.init(q,n)}};var c=m.Utf8={stringify:function(n){try{return decodeURIComponent(escape(d.stringify(n)))}catch(o){throw new Error("Malformed UTF-8 data")}},parse:function(n){return d.parse(unescape(encodeURIComponent(n)))}};var i=b.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=new l.init();this._nDataBytes=0},_append:function(n){if(typeof n=="string"){n=c.parse(n)}this._data.concat(n);this._nDataBytes+=n.sigBytes},_process:function(w){var q=this._data;var x=q.words;var n=q.sigBytes;var t=this.blockSize;var v=t*4;var u=n/v;if(w){u=e.ceil(u)}else{u=e.max((u|0)-this._minBufferSize,0)}var s=u*t;var r=e.min(s*4,n);if(s){for(var p=0;p<s;p+=t){this._doProcessBlock(x,p)}var o=x.splice(0,s);q.sigBytes-=r}return new l.init(o,r)},clone:function(){var n=j.clone.call(this);n._data=this._data.clone();return n},_minBufferSize:0});var f=b.Hasher=i.extend({cfg:j.extend(),init:function(n){this.cfg=this.cfg.extend(n);this.reset()},reset:function(){i.reset.call(this);this._doReset()},update:function(n){this._append(n);this._process();return this},finalize:function(n){if(n){this._append(n)}var o=this._doFinalize();return o},blockSize:512/32,_createHelper:function(n){return function(p,o){return new n.init(o).finalize(p)}},_createHmacHelper:function(n){return function(p,o){return new k.HMAC.init(n,o).finalize(p)}}});var k=a.algo={};return a}(Math));
/*
CryptoJS v3.1.2 x64-core-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(g){var a=CryptoJS,f=a.lib,e=f.Base,h=f.WordArray,a=a.x64={};a.Word=e.extend({init:function(b,c){this.high=b;this.low=c}});a.WordArray=e.extend({init:function(b,c){b=this.words=b||[];this.sigBytes=c!=g?c:8*b.length},toX32:function(){for(var b=this.words,c=b.length,a=[],d=0;d<c;d++){var e=b[d];a.push(e.high);a.push(e.low)}return h.create(a,this.sigBytes)},clone:function(){for(var b=e.clone.call(this),c=b.words=this.words.slice(0),a=c.length,d=0;d<a;d++)c[d]=c[d].clone();return b}})})();

/*
CryptoJS v3.1.2 cipher-core.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
CryptoJS.lib.Cipher||function(u){var g=CryptoJS,f=g.lib,k=f.Base,l=f.WordArray,q=f.BufferedBlockAlgorithm,r=g.enc.Base64,v=g.algo.EvpKDF,n=f.Cipher=q.extend({cfg:k.extend(),createEncryptor:function(a,b){return this.create(this._ENC_XFORM_MODE,a,b)},createDecryptor:function(a,b){return this.create(this._DEC_XFORM_MODE,a,b)},init:function(a,b,c){this.cfg=this.cfg.extend(c);this._xformMode=a;this._key=b;this.reset()},reset:function(){q.reset.call(this);this._doReset()},process:function(a){this._append(a);
return this._process()},finalize:function(a){a&&this._append(a);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(a){return{encrypt:function(b,c,d){return("string"==typeof c?s:j).encrypt(a,b,c,d)},decrypt:function(b,c,d){return("string"==typeof c?s:j).decrypt(a,b,c,d)}}}});f.StreamCipher=n.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var m=g.mode={},t=function(a,b,c){var d=this._iv;d?this._iv=u:d=this._prevBlock;for(var e=
0;e<c;e++)a[b+e]^=d[e]},h=(f.BlockCipherMode=k.extend({createEncryptor:function(a,b){return this.Encryptor.create(a,b)},createDecryptor:function(a,b){return this.Decryptor.create(a,b)},init:function(a,b){this._cipher=a;this._iv=b}})).extend();h.Encryptor=h.extend({processBlock:function(a,b){var c=this._cipher,d=c.blockSize;t.call(this,a,b,d);c.encryptBlock(a,b);this._prevBlock=a.slice(b,b+d)}});h.Decryptor=h.extend({processBlock:function(a,b){var c=this._cipher,d=c.blockSize,e=a.slice(b,b+d);c.decryptBlock(a,
b);t.call(this,a,b,d);this._prevBlock=e}});m=m.CBC=h;h=(g.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,e=[],f=0;f<c;f+=4)e.push(d);c=l.create(e,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};f.BlockCipher=n.extend({cfg:n.cfg.extend({mode:m,padding:h}),reset:function(){n.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;
this._mode=c.call(a,this,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var p=f.CipherParams=k.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),m=(g.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;
return(a?l.create([1398893684,1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=l.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return p.create({ciphertext:a,salt:c})}},j=f.SerializableCipher=k.extend({cfg:k.extend({format:m}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var e=a.createEncryptor(c,d);b=e.finalize(b);e=e.cfg;return p.create({ciphertext:b,key:c,iv:e.iv,algorithm:a,mode:e.mode,padding:e.padding,
blockSize:a.blockSize,formatter:d.format})},decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),g=(g.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=l.random(8));a=v.create({keySize:b+c}).compute(a,d);c=l.create(a.words.slice(b),4*c);a.sigBytes=4*b;return p.create({key:a,iv:c,salt:d})}},s=f.PasswordBasedCipher=j.extend({cfg:j.cfg.extend({kdf:g}),encrypt:function(a,
b,c,d){d=this.cfg.extend(d);c=d.kdf.execute(c,a.keySize,a.ivSize);d.iv=c.iv;a=j.encrypt.call(this,a,b,c.key,d);a.mixIn(c);return a},decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);c=d.kdf.execute(c,a.keySize,a.ivSize,b.salt);d.iv=c.iv;return j.decrypt.call(this,a,b,c.key,d)}})}();

/*
CryptoJS v3.1.2 aes.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){for(var q=CryptoJS,x=q.lib.BlockCipher,r=q.algo,j=[],y=[],z=[],A=[],B=[],C=[],s=[],u=[],v=[],w=[],g=[],k=0;256>k;k++)g[k]=128>k?k<<1:k<<1^283;for(var n=0,l=0,k=0;256>k;k++){var f=l^l<<1^l<<2^l<<3^l<<4,f=f>>>8^f&255^99;j[n]=f;y[f]=n;var t=g[n],D=g[t],E=g[D],b=257*g[f]^16843008*f;z[n]=b<<24|b>>>8;A[n]=b<<16|b>>>16;B[n]=b<<8|b>>>24;C[n]=b;b=16843009*E^65537*D^257*t^16843008*n;s[f]=b<<24|b>>>8;u[f]=b<<16|b>>>16;v[f]=b<<8|b>>>24;w[f]=b;n?(n=t^g[g[g[E^t]]],l^=g[g[l]]):n=l=1}var F=[0,1,2,4,8,
16,32,64,128,27,54],r=r.AES=x.extend({_doReset:function(){for(var c=this._key,e=c.words,a=c.sigBytes/4,c=4*((this._nRounds=a+6)+1),b=this._keySchedule=[],h=0;h<c;h++)if(h<a)b[h]=e[h];else{var d=b[h-1];h%a?6<a&&4==h%a&&(d=j[d>>>24]<<24|j[d>>>16&255]<<16|j[d>>>8&255]<<8|j[d&255]):(d=d<<8|d>>>24,d=j[d>>>24]<<24|j[d>>>16&255]<<16|j[d>>>8&255]<<8|j[d&255],d^=F[h/a|0]<<24);b[h]=b[h-a]^d}e=this._invKeySchedule=[];for(a=0;a<c;a++)h=c-a,d=a%4?b[h]:b[h-4],e[a]=4>a||4>=h?d:s[j[d>>>24]]^u[j[d>>>16&255]]^v[j[d>>>
8&255]]^w[j[d&255]]},encryptBlock:function(c,e){this._doCryptBlock(c,e,this._keySchedule,z,A,B,C,j)},decryptBlock:function(c,e){var a=c[e+1];c[e+1]=c[e+3];c[e+3]=a;this._doCryptBlock(c,e,this._invKeySchedule,s,u,v,w,y);a=c[e+1];c[e+1]=c[e+3];c[e+3]=a},_doCryptBlock:function(c,e,a,b,h,d,j,m){for(var n=this._nRounds,f=c[e]^a[0],g=c[e+1]^a[1],k=c[e+2]^a[2],p=c[e+3]^a[3],l=4,t=1;t<n;t++)var q=b[f>>>24]^h[g>>>16&255]^d[k>>>8&255]^j[p&255]^a[l++],r=b[g>>>24]^h[k>>>16&255]^d[p>>>8&255]^j[f&255]^a[l++],s=
b[k>>>24]^h[p>>>16&255]^d[f>>>8&255]^j[g&255]^a[l++],p=b[p>>>24]^h[f>>>16&255]^d[g>>>8&255]^j[k&255]^a[l++],f=q,g=r,k=s;q=(m[f>>>24]<<24|m[g>>>16&255]<<16|m[k>>>8&255]<<8|m[p&255])^a[l++];r=(m[g>>>24]<<24|m[k>>>16&255]<<16|m[p>>>8&255]<<8|m[f&255])^a[l++];s=(m[k>>>24]<<24|m[p>>>16&255]<<16|m[f>>>8&255]<<8|m[g&255])^a[l++];p=(m[p>>>24]<<24|m[f>>>16&255]<<16|m[g>>>8&255]<<8|m[k&255])^a[l++];c[e]=q;c[e+1]=r;c[e+2]=s;c[e+3]=p},keySize:8});q.AES=x._createHelper(r)})();

/*
CryptoJS v3.1.2 tripledes-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){function j(b,c){var a=(this._lBlock>>>b^this._rBlock)&c;this._rBlock^=a;this._lBlock^=a<<b}function l(b,c){var a=(this._rBlock>>>b^this._lBlock)&c;this._lBlock^=a;this._rBlock^=a<<b}var h=CryptoJS,e=h.lib,n=e.WordArray,e=e.BlockCipher,g=h.algo,q=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],p=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,
55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],r=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],s=[{"0":8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,
2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,
1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{"0":1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,
75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,
276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{"0":260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,
14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,
17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{"0":2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,
98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,
1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{"0":128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,
10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,
83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{"0":268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,
2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{"0":1048576,
16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,
496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{"0":134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,
2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,
2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],t=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],m=g.DES=e.extend({_doReset:function(){for(var b=this._key.words,c=[],a=0;56>a;a++){var f=q[a]-1;c[a]=b[f>>>5]>>>31-f%32&1}b=this._subKeys=[];for(f=0;16>f;f++){for(var d=b[f]=[],e=r[f],a=0;24>a;a++)d[a/6|0]|=c[(p[a]-1+e)%28]<<31-a%6,d[4+(a/6|0)]|=c[28+(p[a+24]-1+e)%28]<<31-a%6;d[0]=d[0]<<1|d[0]>>>31;for(a=1;7>a;a++)d[a]>>>=
4*(a-1)+3;d[7]=d[7]<<5|d[7]>>>27}c=this._invSubKeys=[];for(a=0;16>a;a++)c[a]=b[15-a]},encryptBlock:function(b,c){this._doCryptBlock(b,c,this._subKeys)},decryptBlock:function(b,c){this._doCryptBlock(b,c,this._invSubKeys)},_doCryptBlock:function(b,c,a){this._lBlock=b[c];this._rBlock=b[c+1];j.call(this,4,252645135);j.call(this,16,65535);l.call(this,2,858993459);l.call(this,8,16711935);j.call(this,1,1431655765);for(var f=0;16>f;f++){for(var d=a[f],e=this._lBlock,h=this._rBlock,g=0,k=0;8>k;k++)g|=s[k][((h^
d[k])&t[k])>>>0];this._lBlock=h;this._rBlock=e^g}a=this._lBlock;this._lBlock=this._rBlock;this._rBlock=a;j.call(this,1,1431655765);l.call(this,8,16711935);l.call(this,2,858993459);j.call(this,16,65535);j.call(this,4,252645135);b[c]=this._lBlock;b[c+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});h.DES=e._createHelper(m);g=g.TripleDES=e.extend({_doReset:function(){var b=this._key.words;this._des1=m.createEncryptor(n.create(b.slice(0,2)));this._des2=m.createEncryptor(n.create(b.slice(2,4)));this._des3=
m.createEncryptor(n.create(b.slice(4,6)))},encryptBlock:function(b,c){this._des1.encryptBlock(b,c);this._des2.decryptBlock(b,c);this._des3.encryptBlock(b,c)},decryptBlock:function(b,c){this._des3.decryptBlock(b,c);this._des2.encryptBlock(b,c);this._des1.decryptBlock(b,c)},keySize:6,ivSize:2,blockSize:2});h.TripleDES=e._createHelper(g)})();

/*
CryptoJS v3.1.2 enc-base64.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var h=CryptoJS,j=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();b=[];for(var a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));for(var c=[],a=0,d=0;d<
e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return j.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();

/*
CryptoJS v3.1.2 md5.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(E){function h(a,f,g,j,p,h,k){a=a+(f&g|~f&j)+p+k;return(a<<h|a>>>32-h)+f}function k(a,f,g,j,p,h,k){a=a+(f&j|g&~j)+p+k;return(a<<h|a>>>32-h)+f}function l(a,f,g,j,h,k,l){a=a+(f^g^j)+h+l;return(a<<k|a>>>32-k)+f}function n(a,f,g,j,h,k,l){a=a+(g^(f|~j))+h+l;return(a<<k|a>>>32-k)+f}for(var r=CryptoJS,q=r.lib,F=q.WordArray,s=q.Hasher,q=r.algo,a=[],t=0;64>t;t++)a[t]=4294967296*E.abs(E.sin(t+1))|0;q=q.MD5=s.extend({_doReset:function(){this._hash=new F.init([1732584193,4023233417,2562383102,271733878])},
_doProcessBlock:function(m,f){for(var g=0;16>g;g++){var j=f+g,p=m[j];m[j]=(p<<8|p>>>24)&16711935|(p<<24|p>>>8)&4278255360}var g=this._hash.words,j=m[f+0],p=m[f+1],q=m[f+2],r=m[f+3],s=m[f+4],t=m[f+5],u=m[f+6],v=m[f+7],w=m[f+8],x=m[f+9],y=m[f+10],z=m[f+11],A=m[f+12],B=m[f+13],C=m[f+14],D=m[f+15],b=g[0],c=g[1],d=g[2],e=g[3],b=h(b,c,d,e,j,7,a[0]),e=h(e,b,c,d,p,12,a[1]),d=h(d,e,b,c,q,17,a[2]),c=h(c,d,e,b,r,22,a[3]),b=h(b,c,d,e,s,7,a[4]),e=h(e,b,c,d,t,12,a[5]),d=h(d,e,b,c,u,17,a[6]),c=h(c,d,e,b,v,22,a[7]),
b=h(b,c,d,e,w,7,a[8]),e=h(e,b,c,d,x,12,a[9]),d=h(d,e,b,c,y,17,a[10]),c=h(c,d,e,b,z,22,a[11]),b=h(b,c,d,e,A,7,a[12]),e=h(e,b,c,d,B,12,a[13]),d=h(d,e,b,c,C,17,a[14]),c=h(c,d,e,b,D,22,a[15]),b=k(b,c,d,e,p,5,a[16]),e=k(e,b,c,d,u,9,a[17]),d=k(d,e,b,c,z,14,a[18]),c=k(c,d,e,b,j,20,a[19]),b=k(b,c,d,e,t,5,a[20]),e=k(e,b,c,d,y,9,a[21]),d=k(d,e,b,c,D,14,a[22]),c=k(c,d,e,b,s,20,a[23]),b=k(b,c,d,e,x,5,a[24]),e=k(e,b,c,d,C,9,a[25]),d=k(d,e,b,c,r,14,a[26]),c=k(c,d,e,b,w,20,a[27]),b=k(b,c,d,e,B,5,a[28]),e=k(e,b,
c,d,q,9,a[29]),d=k(d,e,b,c,v,14,a[30]),c=k(c,d,e,b,A,20,a[31]),b=l(b,c,d,e,t,4,a[32]),e=l(e,b,c,d,w,11,a[33]),d=l(d,e,b,c,z,16,a[34]),c=l(c,d,e,b,C,23,a[35]),b=l(b,c,d,e,p,4,a[36]),e=l(e,b,c,d,s,11,a[37]),d=l(d,e,b,c,v,16,a[38]),c=l(c,d,e,b,y,23,a[39]),b=l(b,c,d,e,B,4,a[40]),e=l(e,b,c,d,j,11,a[41]),d=l(d,e,b,c,r,16,a[42]),c=l(c,d,e,b,u,23,a[43]),b=l(b,c,d,e,x,4,a[44]),e=l(e,b,c,d,A,11,a[45]),d=l(d,e,b,c,D,16,a[46]),c=l(c,d,e,b,q,23,a[47]),b=n(b,c,d,e,j,6,a[48]),e=n(e,b,c,d,v,10,a[49]),d=n(d,e,b,c,
C,15,a[50]),c=n(c,d,e,b,t,21,a[51]),b=n(b,c,d,e,A,6,a[52]),e=n(e,b,c,d,r,10,a[53]),d=n(d,e,b,c,y,15,a[54]),c=n(c,d,e,b,p,21,a[55]),b=n(b,c,d,e,w,6,a[56]),e=n(e,b,c,d,D,10,a[57]),d=n(d,e,b,c,u,15,a[58]),c=n(c,d,e,b,B,21,a[59]),b=n(b,c,d,e,s,6,a[60]),e=n(e,b,c,d,z,10,a[61]),d=n(d,e,b,c,q,15,a[62]),c=n(c,d,e,b,x,21,a[63]);g[0]=g[0]+b|0;g[1]=g[1]+c|0;g[2]=g[2]+d|0;g[3]=g[3]+e|0},_doFinalize:function(){var a=this._data,f=a.words,g=8*this._nDataBytes,j=8*a.sigBytes;f[j>>>5]|=128<<24-j%32;var h=E.floor(g/
4294967296);f[(j+64>>>9<<4)+15]=(h<<8|h>>>24)&16711935|(h<<24|h>>>8)&4278255360;f[(j+64>>>9<<4)+14]=(g<<8|g>>>24)&16711935|(g<<24|g>>>8)&4278255360;a.sigBytes=4*(f.length+1);this._process();a=this._hash;f=a.words;for(g=0;4>g;g++)j=f[g],f[g]=(j<<8|j>>>24)&16711935|(j<<24|j>>>8)&4278255360;return a},clone:function(){var a=s.clone.call(this);a._hash=this._hash.clone();return a}});r.MD5=s._createHelper(q);r.HmacMD5=s._createHmacHelper(q)})(Math);

/*
CryptoJS v3.1.2 sha1-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var k=CryptoJS,b=k.lib,m=b.WordArray,l=b.Hasher,d=[],b=k.algo.SHA1=l.extend({_doReset:function(){this._hash=new m.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(n,p){for(var a=this._hash.words,e=a[0],f=a[1],h=a[2],j=a[3],b=a[4],c=0;80>c;c++){if(16>c)d[c]=n[p+c]|0;else{var g=d[c-3]^d[c-8]^d[c-14]^d[c-16];d[c]=g<<1|g>>>31}g=(e<<5|e>>>27)+b+d[c];g=20>c?g+((f&h|~f&j)+1518500249):40>c?g+((f^h^j)+1859775393):60>c?g+((f&h|f&j|h&j)-1894007588):g+((f^h^
j)-899497514);b=j;j=h;h=f<<30|f>>>2;f=e;e=g}a[0]=a[0]+e|0;a[1]=a[1]+f|0;a[2]=a[2]+h|0;a[3]=a[3]+j|0;a[4]=a[4]+b|0},_doFinalize:function(){var b=this._data,d=b.words,a=8*this._nDataBytes,e=8*b.sigBytes;d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=Math.floor(a/4294967296);d[(e+64>>>9<<4)+15]=a;b.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var b=l.clone.call(this);b._hash=this._hash.clone();return b}});k.SHA1=l._createHelper(b);k.HmacSHA1=l._createHmacHelper(b)})();

/*
CryptoJS v3.1.2 sha256-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(k){for(var g=CryptoJS,h=g.lib,v=h.WordArray,j=h.Hasher,h=g.algo,s=[],t=[],u=function(q){return 4294967296*(q-(q|0))|0},l=2,b=0;64>b;){var d;a:{d=l;for(var w=k.sqrt(d),r=2;r<=w;r++)if(!(d%r)){d=!1;break a}d=!0}d&&(8>b&&(s[b]=u(k.pow(l,0.5))),t[b]=u(k.pow(l,1/3)),b++);l++}var n=[],h=h.SHA256=j.extend({_doReset:function(){this._hash=new v.init(s.slice(0))},_doProcessBlock:function(q,h){for(var a=this._hash.words,c=a[0],d=a[1],b=a[2],k=a[3],f=a[4],g=a[5],j=a[6],l=a[7],e=0;64>e;e++){if(16>e)n[e]=
q[h+e]|0;else{var m=n[e-15],p=n[e-2];n[e]=((m<<25|m>>>7)^(m<<14|m>>>18)^m>>>3)+n[e-7]+((p<<15|p>>>17)^(p<<13|p>>>19)^p>>>10)+n[e-16]}m=l+((f<<26|f>>>6)^(f<<21|f>>>11)^(f<<7|f>>>25))+(f&g^~f&j)+t[e]+n[e];p=((c<<30|c>>>2)^(c<<19|c>>>13)^(c<<10|c>>>22))+(c&d^c&b^d&b);l=j;j=g;g=f;f=k+m|0;k=b;b=d;d=c;c=m+p|0}a[0]=a[0]+c|0;a[1]=a[1]+d|0;a[2]=a[2]+b|0;a[3]=a[3]+k|0;a[4]=a[4]+f|0;a[5]=a[5]+g|0;a[6]=a[6]+j|0;a[7]=a[7]+l|0},_doFinalize:function(){var d=this._data,b=d.words,a=8*this._nDataBytes,c=8*d.sigBytes;
b[c>>>5]|=128<<24-c%32;b[(c+64>>>9<<4)+14]=k.floor(a/4294967296);b[(c+64>>>9<<4)+15]=a;d.sigBytes=4*b.length;this._process();return this._hash},clone:function(){var b=j.clone.call(this);b._hash=this._hash.clone();return b}});g.SHA256=j._createHelper(h);g.HmacSHA256=j._createHmacHelper(h)})(Math);

/*
CryptoJS v3.1.2 sha224-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var b=CryptoJS,d=b.lib.WordArray,a=b.algo,c=a.SHA256,a=a.SHA224=c.extend({_doReset:function(){this._hash=new d.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var a=c._doFinalize.call(this);a.sigBytes-=4;return a}});b.SHA224=c._createHelper(a);b.HmacSHA224=c._createHmacHelper(a)})();

/*
CryptoJS v3.1.2 sha512-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){function a(){return d.create.apply(d,arguments)}for(var n=CryptoJS,r=n.lib.Hasher,e=n.x64,d=e.Word,T=e.WordArray,e=n.algo,ea=[a(1116352408,3609767458),a(1899447441,602891725),a(3049323471,3964484399),a(3921009573,2173295548),a(961987163,4081628472),a(1508970993,3053834265),a(2453635748,2937671579),a(2870763221,3664609560),a(3624381080,2734883394),a(310598401,1164996542),a(607225278,1323610764),a(1426881987,3590304994),a(1925078388,4068182383),a(2162078206,991336113),a(2614888103,633803317),
a(3248222580,3479774868),a(3835390401,2666613458),a(4022224774,944711139),a(264347078,2341262773),a(604807628,2007800933),a(770255983,1495990901),a(1249150122,1856431235),a(1555081692,3175218132),a(1996064986,2198950837),a(2554220882,3999719339),a(2821834349,766784016),a(2952996808,2566594879),a(3210313671,3203337956),a(3336571891,1034457026),a(3584528711,2466948901),a(113926993,3758326383),a(338241895,168717936),a(666307205,1188179964),a(773529912,1546045734),a(1294757372,1522805485),a(1396182291,
2643833823),a(1695183700,2343527390),a(1986661051,1014477480),a(2177026350,1206759142),a(2456956037,344077627),a(2730485921,1290863460),a(2820302411,3158454273),a(3259730800,3505952657),a(3345764771,106217008),a(3516065817,3606008344),a(3600352804,1432725776),a(4094571909,1467031594),a(275423344,851169720),a(430227734,3100823752),a(506948616,1363258195),a(659060556,3750685593),a(883997877,3785050280),a(958139571,3318307427),a(1322822218,3812723403),a(1537002063,2003034995),a(1747873779,3602036899),
a(1955562222,1575990012),a(2024104815,1125592928),a(2227730452,2716904306),a(2361852424,442776044),a(2428436474,593698344),a(2756734187,3733110249),a(3204031479,2999351573),a(3329325298,3815920427),a(3391569614,3928383900),a(3515267271,566280711),a(3940187606,3454069534),a(4118630271,4000239992),a(116418474,1914138554),a(174292421,2731055270),a(289380356,3203993006),a(460393269,320620315),a(685471733,587496836),a(852142971,1086792851),a(1017036298,365543100),a(1126000580,2618297676),a(1288033470,
3409855158),a(1501505948,4234509866),a(1607167915,987167468),a(1816402316,1246189591)],v=[],w=0;80>w;w++)v[w]=a();e=e.SHA512=r.extend({_doReset:function(){this._hash=new T.init([new d.init(1779033703,4089235720),new d.init(3144134277,2227873595),new d.init(1013904242,4271175723),new d.init(2773480762,1595750129),new d.init(1359893119,2917565137),new d.init(2600822924,725511199),new d.init(528734635,4215389547),new d.init(1541459225,327033209)])},_doProcessBlock:function(a,d){for(var f=this._hash.words,
F=f[0],e=f[1],n=f[2],r=f[3],G=f[4],H=f[5],I=f[6],f=f[7],w=F.high,J=F.low,X=e.high,K=e.low,Y=n.high,L=n.low,Z=r.high,M=r.low,$=G.high,N=G.low,aa=H.high,O=H.low,ba=I.high,P=I.low,ca=f.high,Q=f.low,k=w,g=J,z=X,x=K,A=Y,y=L,U=Z,B=M,l=$,h=N,R=aa,C=O,S=ba,D=P,V=ca,E=Q,m=0;80>m;m++){var s=v[m];if(16>m)var j=s.high=a[d+2*m]|0,b=s.low=a[d+2*m+1]|0;else{var j=v[m-15],b=j.high,p=j.low,j=(b>>>1|p<<31)^(b>>>8|p<<24)^b>>>7,p=(p>>>1|b<<31)^(p>>>8|b<<24)^(p>>>7|b<<25),u=v[m-2],b=u.high,c=u.low,u=(b>>>19|c<<13)^(b<<
3|c>>>29)^b>>>6,c=(c>>>19|b<<13)^(c<<3|b>>>29)^(c>>>6|b<<26),b=v[m-7],W=b.high,t=v[m-16],q=t.high,t=t.low,b=p+b.low,j=j+W+(b>>>0<p>>>0?1:0),b=b+c,j=j+u+(b>>>0<c>>>0?1:0),b=b+t,j=j+q+(b>>>0<t>>>0?1:0);s.high=j;s.low=b}var W=l&R^~l&S,t=h&C^~h&D,s=k&z^k&A^z&A,T=g&x^g&y^x&y,p=(k>>>28|g<<4)^(k<<30|g>>>2)^(k<<25|g>>>7),u=(g>>>28|k<<4)^(g<<30|k>>>2)^(g<<25|k>>>7),c=ea[m],fa=c.high,da=c.low,c=E+((h>>>14|l<<18)^(h>>>18|l<<14)^(h<<23|l>>>9)),q=V+((l>>>14|h<<18)^(l>>>18|h<<14)^(l<<23|h>>>9))+(c>>>0<E>>>0?1:
0),c=c+t,q=q+W+(c>>>0<t>>>0?1:0),c=c+da,q=q+fa+(c>>>0<da>>>0?1:0),c=c+b,q=q+j+(c>>>0<b>>>0?1:0),b=u+T,s=p+s+(b>>>0<u>>>0?1:0),V=S,E=D,S=R,D=C,R=l,C=h,h=B+c|0,l=U+q+(h>>>0<B>>>0?1:0)|0,U=A,B=y,A=z,y=x,z=k,x=g,g=c+b|0,k=q+s+(g>>>0<c>>>0?1:0)|0}J=F.low=J+g;F.high=w+k+(J>>>0<g>>>0?1:0);K=e.low=K+x;e.high=X+z+(K>>>0<x>>>0?1:0);L=n.low=L+y;n.high=Y+A+(L>>>0<y>>>0?1:0);M=r.low=M+B;r.high=Z+U+(M>>>0<B>>>0?1:0);N=G.low=N+h;G.high=$+l+(N>>>0<h>>>0?1:0);O=H.low=O+C;H.high=aa+R+(O>>>0<C>>>0?1:0);P=I.low=P+D;
I.high=ba+S+(P>>>0<D>>>0?1:0);Q=f.low=Q+E;f.high=ca+V+(Q>>>0<E>>>0?1:0)},_doFinalize:function(){var a=this._data,d=a.words,f=8*this._nDataBytes,e=8*a.sigBytes;d[e>>>5]|=128<<24-e%32;d[(e+128>>>10<<5)+30]=Math.floor(f/4294967296);d[(e+128>>>10<<5)+31]=f;a.sigBytes=4*d.length;this._process();return this._hash.toX32()},clone:function(){var a=r.clone.call(this);a._hash=this._hash.clone();return a},blockSize:32});n.SHA512=r._createHelper(e);n.HmacSHA512=r._createHmacHelper(e)})();

/*
CryptoJS v3.1.2 sha384-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var c=CryptoJS,a=c.x64,b=a.Word,e=a.WordArray,a=c.algo,d=a.SHA512,a=a.SHA384=d.extend({_doReset:function(){this._hash=new e.init([new b.init(3418070365,3238371032),new b.init(1654270250,914150663),new b.init(2438529370,812702999),new b.init(355462360,4144912697),new b.init(1731405415,4290775857),new b.init(2394180231,1750603025),new b.init(3675008525,1694076839),new b.init(1203062813,3204075428)])},_doFinalize:function(){var a=d._doFinalize.call(this);a.sigBytes-=16;return a}});c.SHA384=
d._createHelper(a);c.HmacSHA384=d._createHmacHelper(a)})();

/*
CryptoJS v3.1.2 ripemd160-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/*

(c) 2012 by Cedric Mesnil. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
(function(){var q=CryptoJS,d=q.lib,n=d.WordArray,p=d.Hasher,d=q.algo,x=n.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),y=n.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),z=n.create([11,14,15,12,
5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),A=n.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),B=n.create([0,1518500249,1859775393,2400959708,2840853838]),C=n.create([1352829926,1548603684,1836072691,
2053994217,0]),d=d.RIPEMD160=p.extend({_doReset:function(){this._hash=n.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(e,v){for(var b=0;16>b;b++){var c=v+b,f=e[c];e[c]=(f<<8|f>>>24)&16711935|(f<<24|f>>>8)&4278255360}var c=this._hash.words,f=B.words,d=C.words,n=x.words,q=y.words,p=z.words,w=A.words,t,g,h,j,r,u,k,l,m,s;u=t=c[0];k=g=c[1];l=h=c[2];m=j=c[3];s=r=c[4];for(var a,b=0;80>b;b+=1)a=t+e[v+n[b]]|0,a=16>b?a+((g^h^j)+f[0]):32>b?a+((g&h|~g&j)+f[1]):48>b?
a+(((g|~h)^j)+f[2]):64>b?a+((g&j|h&~j)+f[3]):a+((g^(h|~j))+f[4]),a|=0,a=a<<p[b]|a>>>32-p[b],a=a+r|0,t=r,r=j,j=h<<10|h>>>22,h=g,g=a,a=u+e[v+q[b]]|0,a=16>b?a+((k^(l|~m))+d[0]):32>b?a+((k&m|l&~m)+d[1]):48>b?a+(((k|~l)^m)+d[2]):64>b?a+((k&l|~k&m)+d[3]):a+((k^l^m)+d[4]),a|=0,a=a<<w[b]|a>>>32-w[b],a=a+s|0,u=s,s=m,m=l<<10|l>>>22,l=k,k=a;a=c[1]+h+m|0;c[1]=c[2]+j+s|0;c[2]=c[3]+r+u|0;c[3]=c[4]+t+k|0;c[4]=c[0]+g+l|0;c[0]=a},_doFinalize:function(){var e=this._data,d=e.words,b=8*this._nDataBytes,c=8*e.sigBytes;
d[c>>>5]|=128<<24-c%32;d[(c+64>>>9<<4)+14]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360;e.sigBytes=4*(d.length+1);this._process();e=this._hash;d=e.words;for(b=0;5>b;b++)c=d[b],d[b]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return e},clone:function(){var d=p.clone.call(this);d._hash=this._hash.clone();return d}});q.RIPEMD160=p._createHelper(d);q.HmacRIPEMD160=p._createHmacHelper(d)})(Math);

/*
CryptoJS v3.1.2 hmac.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var c=CryptoJS,k=c.enc.Utf8;c.algo.HMAC=c.lib.Base.extend({init:function(a,b){a=this._hasher=new a.init;"string"==typeof b&&(b=k.parse(b));var c=a.blockSize,e=4*c;b.sigBytes>e&&(b=a.finalize(b));b.clamp();for(var f=this._oKey=b.clone(),g=this._iKey=b.clone(),h=f.words,j=g.words,d=0;d<c;d++)h[d]^=1549556828,j[d]^=909522486;f.sigBytes=g.sigBytes=e;this.reset()},reset:function(){var a=this._hasher;a.reset();a.update(this._iKey)},update:function(a){this._hasher.update(a);return this},finalize:function(a){var b=
this._hasher;a=b.finalize(a);b.reset();return b.finalize(this._oKey.clone().concat(a))}})})();

/*
CryptoJS v3.1.2 pbkdf2-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var b=CryptoJS,a=b.lib,d=a.Base,m=a.WordArray,a=b.algo,q=a.HMAC,l=a.PBKDF2=d.extend({cfg:d.extend({keySize:4,hasher:a.SHA1,iterations:1}),init:function(a){this.cfg=this.cfg.extend(a)},compute:function(a,b){for(var c=this.cfg,f=q.create(c.hasher,a),g=m.create(),d=m.create([1]),l=g.words,r=d.words,n=c.keySize,c=c.iterations;l.length<n;){var h=f.update(b).finalize(d);f.reset();for(var j=h.words,s=j.length,k=h,p=1;p<c;p++){k=f.finalize(k);f.reset();for(var t=k.words,e=0;e<s;e++)j[e]^=t[e]}g.concat(h);
r[0]++}g.sigBytes=4*n;return g}});b.PBKDF2=function(a,b,c){return l.create(c).compute(a,b)}})();

/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var b64map="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var b64pad="=";function hex2b64(d){var b;var e;var a="";for(b=0;b+3<=d.length;b+=3){e=parseInt(d.substring(b,b+3),16);a+=b64map.charAt(e>>6)+b64map.charAt(e&63)}if(b+1==d.length){e=parseInt(d.substring(b,b+1),16);a+=b64map.charAt(e<<2)}else{if(b+2==d.length){e=parseInt(d.substring(b,b+2),16);a+=b64map.charAt(e>>2)+b64map.charAt((e&3)<<4)}}if(b64pad){while((a.length&3)>0){a+=b64pad}}return a}function b64tohex(f){var d="";var e;var b=0;var c;var a;for(e=0;e<f.length;++e){if(f.charAt(e)==b64pad){break}a=b64map.indexOf(f.charAt(e));if(a<0){continue}if(b==0){d+=int2char(a>>2);c=a&3;b=1}else{if(b==1){d+=int2char((c<<2)|(a>>4));c=a&15;b=2}else{if(b==2){d+=int2char(c);d+=int2char(a>>2);c=a&3;b=3}else{d+=int2char((c<<2)|(a>>4));d+=int2char(a&15);b=0}}}}if(b==1){d+=int2char(c<<2)}return d}function b64toBA(e){var d=b64tohex(e);var c;var b=new Array();for(c=0;2*c<d.length;++c){b[c]=parseInt(d.substring(2*c,2*c+2),16)}return b};
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var dbits;var canary=244837814094590;var j_lm=((canary&16777215)==15715070);function BigInteger(e,d,f){if(e!=null){if("number"==typeof e){this.fromNumber(e,d,f)}else{if(d==null&&"string"!=typeof e){this.fromString(e,256)}else{this.fromString(e,d)}}}}function nbi(){return new BigInteger(null)}function am1(f,a,b,e,h,g){while(--g>=0){var d=a*this[f++]+b[e]+h;h=Math.floor(d/67108864);b[e++]=d&67108863}return h}function am2(f,q,r,e,o,a){var k=q&32767,p=q>>15;while(--a>=0){var d=this[f]&32767;var g=this[f++]>>15;var b=p*d+g*k;d=k*d+((b&32767)<<15)+r[e]+(o&1073741823);o=(d>>>30)+(b>>>15)+p*g+(o>>>30);r[e++]=d&1073741823}return o}function am3(f,q,r,e,o,a){var k=q&16383,p=q>>14;while(--a>=0){var d=this[f]&16383;var g=this[f++]>>14;var b=p*d+g*k;d=k*d+((b&16383)<<14)+r[e]+o;o=(d>>28)+(b>>14)+p*g;r[e++]=d&268435455}return o}if(j_lm&&(navigator.appName=="Microsoft Internet Explorer")){BigInteger.prototype.am=am2;dbits=30}else{if(j_lm&&(navigator.appName!="Netscape")){BigInteger.prototype.am=am1;dbits=26}else{BigInteger.prototype.am=am3;dbits=28}}BigInteger.prototype.DB=dbits;BigInteger.prototype.DM=((1<<dbits)-1);BigInteger.prototype.DV=(1<<dbits);var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP);BigInteger.prototype.F1=BI_FP-dbits;BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM="0123456789abcdefghijklmnopqrstuvwxyz";var BI_RC=new Array();var rr,vv;rr="0".charCodeAt(0);for(vv=0;vv<=9;++vv){BI_RC[rr++]=vv}rr="a".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv}rr="A".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv}function int2char(a){return BI_RM.charAt(a)}function intAt(b,a){var d=BI_RC[b.charCodeAt(a)];return(d==null)?-1:d}function bnpCopyTo(b){for(var a=this.t-1;a>=0;--a){b[a]=this[a]}b.t=this.t;b.s=this.s}function bnpFromInt(a){this.t=1;this.s=(a<0)?-1:0;if(a>0){this[0]=a}else{if(a<-1){this[0]=a+this.DV}else{this.t=0}}}function nbv(a){var b=nbi();b.fromInt(a);return b}function bnpFromString(h,c){var e;if(c==16){e=4}else{if(c==8){e=3}else{if(c==256){e=8}else{if(c==2){e=1}else{if(c==32){e=5}else{if(c==4){e=2}else{this.fromRadix(h,c);return}}}}}}this.t=0;this.s=0;var g=h.length,d=false,f=0;while(--g>=0){var a=(e==8)?h[g]&255:intAt(h,g);if(a<0){if(h.charAt(g)=="-"){d=true}continue}d=false;if(f==0){this[this.t++]=a}else{if(f+e>this.DB){this[this.t-1]|=(a&((1<<(this.DB-f))-1))<<f;this[this.t++]=(a>>(this.DB-f))}else{this[this.t-1]|=a<<f}}f+=e;if(f>=this.DB){f-=this.DB}}if(e==8&&(h[0]&128)!=0){this.s=-1;if(f>0){this[this.t-1]|=((1<<(this.DB-f))-1)<<f}}this.clamp();if(d){BigInteger.ZERO.subTo(this,this)}}function bnpClamp(){var a=this.s&this.DM;while(this.t>0&&this[this.t-1]==a){--this.t}}function bnToString(c){if(this.s<0){return"-"+this.negate().toString(c)}var e;if(c==16){e=4}else{if(c==8){e=3}else{if(c==2){e=1}else{if(c==32){e=5}else{if(c==4){e=2}else{return this.toRadix(c)}}}}}var g=(1<<e)-1,l,a=false,h="",f=this.t;var j=this.DB-(f*this.DB)%e;if(f-->0){if(j<this.DB&&(l=this[f]>>j)>0){a=true;h=int2char(l)}while(f>=0){if(j<e){l=(this[f]&((1<<j)-1))<<(e-j);l|=this[--f]>>(j+=this.DB-e)}else{l=(this[f]>>(j-=e))&g;if(j<=0){j+=this.DB;--f}}if(l>0){a=true}if(a){h+=int2char(l)}}}return a?h:"0"}function bnNegate(){var a=nbi();BigInteger.ZERO.subTo(this,a);return a}function bnAbs(){return(this.s<0)?this.negate():this}function bnCompareTo(b){var d=this.s-b.s;if(d!=0){return d}var c=this.t;d=c-b.t;if(d!=0){return(this.s<0)?-d:d}while(--c>=0){if((d=this[c]-b[c])!=0){return d}}return 0}function nbits(a){var c=1,b;if((b=a>>>16)!=0){a=b;c+=16}if((b=a>>8)!=0){a=b;c+=8}if((b=a>>4)!=0){a=b;c+=4}if((b=a>>2)!=0){a=b;c+=2}if((b=a>>1)!=0){a=b;c+=1}return c}function bnBitLength(){if(this.t<=0){return 0}return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM))}function bnpDLShiftTo(c,b){var a;for(a=this.t-1;a>=0;--a){b[a+c]=this[a]}for(a=c-1;a>=0;--a){b[a]=0}b.t=this.t+c;b.s=this.s}function bnpDRShiftTo(c,b){for(var a=c;a<this.t;++a){b[a-c]=this[a]}b.t=Math.max(this.t-c,0);b.s=this.s}function bnpLShiftTo(j,e){var b=j%this.DB;var a=this.DB-b;var g=(1<<a)-1;var f=Math.floor(j/this.DB),h=(this.s<<b)&this.DM,d;for(d=this.t-1;d>=0;--d){e[d+f+1]=(this[d]>>a)|h;h=(this[d]&g)<<b}for(d=f-1;d>=0;--d){e[d]=0}e[f]=h;e.t=this.t+f+1;e.s=this.s;e.clamp()}function bnpRShiftTo(g,d){d.s=this.s;var e=Math.floor(g/this.DB);if(e>=this.t){d.t=0;return}var b=g%this.DB;var a=this.DB-b;var f=(1<<b)-1;d[0]=this[e]>>b;for(var c=e+1;c<this.t;++c){d[c-e-1]|=(this[c]&f)<<a;d[c-e]=this[c]>>b}if(b>0){d[this.t-e-1]|=(this.s&f)<<a}d.t=this.t-e;d.clamp()}function bnpSubTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]-d[e];f[e++]=g&this.DM;g>>=this.DB}if(d.t<this.t){g-=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB}g+=this.s}else{g+=this.s;while(e<d.t){g-=d[e];f[e++]=g&this.DM;g>>=this.DB}g-=d.s}f.s=(g<0)?-1:0;if(g<-1){f[e++]=this.DV+g}else{if(g>0){f[e++]=g}}f.t=e;f.clamp()}function bnpMultiplyTo(c,e){var b=this.abs(),f=c.abs();var d=b.t;e.t=d+f.t;while(--d>=0){e[d]=0}for(d=0;d<f.t;++d){e[d+b.t]=b.am(0,f[d],e,d,0,b.t)}e.s=0;e.clamp();if(this.s!=c.s){BigInteger.ZERO.subTo(e,e)}}function bnpSquareTo(d){var a=this.abs();var b=d.t=2*a.t;while(--b>=0){d[b]=0}for(b=0;b<a.t-1;++b){var e=a.am(b,a[b],d,2*b,0,1);if((d[b+a.t]+=a.am(b+1,2*a[b],d,2*b+1,e,a.t-b-1))>=a.DV){d[b+a.t]-=a.DV;d[b+a.t+1]=1}}if(d.t>0){d[d.t-1]+=a.am(b,a[b],d,2*b,0,1)}d.s=0;d.clamp()}function bnpDivRemTo(n,h,g){var w=n.abs();if(w.t<=0){return}var k=this.abs();if(k.t<w.t){if(h!=null){h.fromInt(0)}if(g!=null){this.copyTo(g)}return}if(g==null){g=nbi()}var d=nbi(),a=this.s,l=n.s;var v=this.DB-nbits(w[w.t-1]);if(v>0){w.lShiftTo(v,d);k.lShiftTo(v,g)}else{w.copyTo(d);k.copyTo(g)}var p=d.t;var b=d[p-1];if(b==0){return}var o=b*(1<<this.F1)+((p>1)?d[p-2]>>this.F2:0);var A=this.FV/o,z=(1<<this.F1)/o,x=1<<this.F2;var u=g.t,s=u-p,f=(h==null)?nbi():h;d.dlShiftTo(s,f);if(g.compareTo(f)>=0){g[g.t++]=1;g.subTo(f,g)}BigInteger.ONE.dlShiftTo(p,f);f.subTo(d,d);while(d.t<p){d[d.t++]=0}while(--s>=0){var c=(g[--u]==b)?this.DM:Math.floor(g[u]*A+(g[u-1]+x)*z);if((g[u]+=d.am(0,c,g,s,0,p))<c){d.dlShiftTo(s,f);g.subTo(f,g);while(g[u]<--c){g.subTo(f,g)}}}if(h!=null){g.drShiftTo(p,h);if(a!=l){BigInteger.ZERO.subTo(h,h)}}g.t=p;g.clamp();if(v>0){g.rShiftTo(v,g)}if(a<0){BigInteger.ZERO.subTo(g,g)}}function bnMod(b){var c=nbi();this.abs().divRemTo(b,null,c);if(this.s<0&&c.compareTo(BigInteger.ZERO)>0){b.subTo(c,c)}return c}function Classic(a){this.m=a}function cConvert(a){if(a.s<0||a.compareTo(this.m)>=0){return a.mod(this.m)}else{return a}}function cRevert(a){return a}function cReduce(a){a.divRemTo(this.m,null,a)}function cMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}function cSqrTo(a,b){a.squareTo(b);this.reduce(b)}Classic.prototype.convert=cConvert;Classic.prototype.revert=cRevert;Classic.prototype.reduce=cReduce;Classic.prototype.mulTo=cMulTo;Classic.prototype.sqrTo=cSqrTo;function bnpInvDigit(){if(this.t<1){return 0}var a=this[0];if((a&1)==0){return 0}var b=a&3;b=(b*(2-(a&15)*b))&15;b=(b*(2-(a&255)*b))&255;b=(b*(2-(((a&65535)*b)&65535)))&65535;b=(b*(2-a*b%this.DV))%this.DV;return(b>0)?this.DV-b:-b}function Montgomery(a){this.m=a;this.mp=a.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<(a.DB-15))-1;this.mt2=2*a.t}function montConvert(a){var b=nbi();a.abs().dlShiftTo(this.m.t,b);b.divRemTo(this.m,null,b);if(a.s<0&&b.compareTo(BigInteger.ZERO)>0){this.m.subTo(b,b)}return b}function montRevert(a){var b=nbi();a.copyTo(b);this.reduce(b);return b}function montReduce(a){while(a.t<=this.mt2){a[a.t++]=0}for(var c=0;c<this.m.t;++c){var b=a[c]&32767;var d=(b*this.mpl+(((b*this.mph+(a[c]>>15)*this.mpl)&this.um)<<15))&a.DM;b=c+this.m.t;a[b]+=this.m.am(0,d,a,c,0,this.m.t);while(a[b]>=a.DV){a[b]-=a.DV;a[++b]++}}a.clamp();a.drShiftTo(this.m.t,a);if(a.compareTo(this.m)>=0){a.subTo(this.m,a)}}function montSqrTo(a,b){a.squareTo(b);this.reduce(b)}function montMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}Montgomery.prototype.convert=montConvert;Montgomery.prototype.revert=montRevert;Montgomery.prototype.reduce=montReduce;Montgomery.prototype.mulTo=montMulTo;Montgomery.prototype.sqrTo=montSqrTo;function bnpIsEven(){return((this.t>0)?(this[0]&1):this.s)==0}function bnpExp(h,j){if(h>4294967295||h<1){return BigInteger.ONE}var f=nbi(),a=nbi(),d=j.convert(this),c=nbits(h)-1;d.copyTo(f);while(--c>=0){j.sqrTo(f,a);if((h&(1<<c))>0){j.mulTo(a,d,f)}else{var b=f;f=a;a=b}}return j.revert(f)}function bnModPowInt(b,a){var c;if(b<256||a.isEven()){c=new Classic(a)}else{c=new Montgomery(a)}return this.exp(b,c)}BigInteger.prototype.copyTo=bnpCopyTo;BigInteger.prototype.fromInt=bnpFromInt;BigInteger.prototype.fromString=bnpFromString;BigInteger.prototype.clamp=bnpClamp;BigInteger.prototype.dlShiftTo=bnpDLShiftTo;BigInteger.prototype.drShiftTo=bnpDRShiftTo;BigInteger.prototype.lShiftTo=bnpLShiftTo;BigInteger.prototype.rShiftTo=bnpRShiftTo;BigInteger.prototype.subTo=bnpSubTo;BigInteger.prototype.multiplyTo=bnpMultiplyTo;BigInteger.prototype.squareTo=bnpSquareTo;BigInteger.prototype.divRemTo=bnpDivRemTo;BigInteger.prototype.invDigit=bnpInvDigit;BigInteger.prototype.isEven=bnpIsEven;BigInteger.prototype.exp=bnpExp;BigInteger.prototype.toString=bnToString;BigInteger.prototype.negate=bnNegate;BigInteger.prototype.abs=bnAbs;BigInteger.prototype.compareTo=bnCompareTo;BigInteger.prototype.bitLength=bnBitLength;BigInteger.prototype.mod=bnMod;BigInteger.prototype.modPowInt=bnModPowInt;BigInteger.ZERO=nbv(0);BigInteger.ONE=nbv(1);
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function bnClone(){var a=nbi();this.copyTo(a);return a}function bnIntValue(){if(this.s<0){if(this.t==1){return this[0]-this.DV}else{if(this.t==0){return -1}}}else{if(this.t==1){return this[0]}else{if(this.t==0){return 0}}}return((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0]}function bnByteValue(){return(this.t==0)?this.s:(this[0]<<24)>>24}function bnShortValue(){return(this.t==0)?this.s:(this[0]<<16)>>16}function bnpChunkSize(a){return Math.floor(Math.LN2*this.DB/Math.log(a))}function bnSigNum(){if(this.s<0){return -1}else{if(this.t<=0||(this.t==1&&this[0]<=0)){return 0}else{return 1}}}function bnpToRadix(c){if(c==null){c=10}if(this.signum()==0||c<2||c>36){return"0"}var f=this.chunkSize(c);var e=Math.pow(c,f);var i=nbv(e),j=nbi(),h=nbi(),g="";this.divRemTo(i,j,h);while(j.signum()>0){g=(e+h.intValue()).toString(c).substr(1)+g;j.divRemTo(i,j,h)}return h.intValue().toString(c)+g}function bnpFromRadix(m,h){this.fromInt(0);if(h==null){h=10}var f=this.chunkSize(h);var g=Math.pow(h,f),e=false,a=0,l=0;for(var c=0;c<m.length;++c){var k=intAt(m,c);if(k<0){if(m.charAt(c)=="-"&&this.signum()==0){e=true}continue}l=h*l+k;if(++a>=f){this.dMultiply(g);this.dAddOffset(l,0);a=0;l=0}}if(a>0){this.dMultiply(Math.pow(h,a));this.dAddOffset(l,0)}if(e){BigInteger.ZERO.subTo(this,this)}}function bnpFromNumber(f,e,h){if("number"==typeof e){if(f<2){this.fromInt(1)}else{this.fromNumber(f,h);if(!this.testBit(f-1)){this.bitwiseTo(BigInteger.ONE.shiftLeft(f-1),op_or,this)}if(this.isEven()){this.dAddOffset(1,0)}while(!this.isProbablePrime(e)){this.dAddOffset(2,0);if(this.bitLength()>f){this.subTo(BigInteger.ONE.shiftLeft(f-1),this)}}}}else{var d=new Array(),g=f&7;d.length=(f>>3)+1;e.nextBytes(d);if(g>0){d[0]&=((1<<g)-1)}else{d[0]=0}this.fromString(d,256)}}function bnToByteArray(){var b=this.t,c=new Array();c[0]=this.s;var e=this.DB-(b*this.DB)%8,f,a=0;if(b-->0){if(e<this.DB&&(f=this[b]>>e)!=(this.s&this.DM)>>e){c[a++]=f|(this.s<<(this.DB-e))}while(b>=0){if(e<8){f=(this[b]&((1<<e)-1))<<(8-e);f|=this[--b]>>(e+=this.DB-8)}else{f=(this[b]>>(e-=8))&255;if(e<=0){e+=this.DB;--b}}if((f&128)!=0){f|=-256}if(a==0&&(this.s&128)!=(f&128)){++a}if(a>0||f!=this.s){c[a++]=f}}}return c}function bnEquals(b){return(this.compareTo(b)==0)}function bnMin(b){return(this.compareTo(b)<0)?this:b}function bnMax(b){return(this.compareTo(b)>0)?this:b}function bnpBitwiseTo(c,h,e){var d,g,b=Math.min(c.t,this.t);for(d=0;d<b;++d){e[d]=h(this[d],c[d])}if(c.t<this.t){g=c.s&this.DM;for(d=b;d<this.t;++d){e[d]=h(this[d],g)}e.t=this.t}else{g=this.s&this.DM;for(d=b;d<c.t;++d){e[d]=h(g,c[d])}e.t=c.t}e.s=h(this.s,c.s);e.clamp()}function op_and(a,b){return a&b}function bnAnd(b){var c=nbi();this.bitwiseTo(b,op_and,c);return c}function op_or(a,b){return a|b}function bnOr(b){var c=nbi();this.bitwiseTo(b,op_or,c);return c}function op_xor(a,b){return a^b}function bnXor(b){var c=nbi();this.bitwiseTo(b,op_xor,c);return c}function op_andnot(a,b){return a&~b}function bnAndNot(b){var c=nbi();this.bitwiseTo(b,op_andnot,c);return c}function bnNot(){var b=nbi();for(var a=0;a<this.t;++a){b[a]=this.DM&~this[a]}b.t=this.t;b.s=~this.s;return b}function bnShiftLeft(b){var a=nbi();if(b<0){this.rShiftTo(-b,a)}else{this.lShiftTo(b,a)}return a}function bnShiftRight(b){var a=nbi();if(b<0){this.lShiftTo(-b,a)}else{this.rShiftTo(b,a)}return a}function lbit(a){if(a==0){return -1}var b=0;if((a&65535)==0){a>>=16;b+=16}if((a&255)==0){a>>=8;b+=8}if((a&15)==0){a>>=4;b+=4}if((a&3)==0){a>>=2;b+=2}if((a&1)==0){++b}return b}function bnGetLowestSetBit(){for(var a=0;a<this.t;++a){if(this[a]!=0){return a*this.DB+lbit(this[a])}}if(this.s<0){return this.t*this.DB}return -1}function cbit(a){var b=0;while(a!=0){a&=a-1;++b}return b}function bnBitCount(){var c=0,a=this.s&this.DM;for(var b=0;b<this.t;++b){c+=cbit(this[b]^a)}return c}function bnTestBit(b){var a=Math.floor(b/this.DB);if(a>=this.t){return(this.s!=0)}return((this[a]&(1<<(b%this.DB)))!=0)}function bnpChangeBit(c,b){var a=BigInteger.ONE.shiftLeft(c);this.bitwiseTo(a,b,a);return a}function bnSetBit(a){return this.changeBit(a,op_or)}function bnClearBit(a){return this.changeBit(a,op_andnot)}function bnFlipBit(a){return this.changeBit(a,op_xor)}function bnpAddTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]+d[e];f[e++]=g&this.DM;g>>=this.DB}if(d.t<this.t){g+=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB}g+=this.s}else{g+=this.s;while(e<d.t){g+=d[e];f[e++]=g&this.DM;g>>=this.DB}g+=d.s}f.s=(g<0)?-1:0;if(g>0){f[e++]=g}else{if(g<-1){f[e++]=this.DV+g}}f.t=e;f.clamp()}function bnAdd(b){var c=nbi();this.addTo(b,c);return c}function bnSubtract(b){var c=nbi();this.subTo(b,c);return c}function bnMultiply(b){var c=nbi();this.multiplyTo(b,c);return c}function bnSquare(){var a=nbi();this.squareTo(a);return a}function bnDivide(b){var c=nbi();this.divRemTo(b,c,null);return c}function bnRemainder(b){var c=nbi();this.divRemTo(b,null,c);return c}function bnDivideAndRemainder(b){var d=nbi(),c=nbi();this.divRemTo(b,d,c);return new Array(d,c)}function bnpDMultiply(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp()}function bnpDAddOffset(b,a){if(b==0){return}while(this.t<=a){this[this.t++]=0}this[a]+=b;while(this[a]>=this.DV){this[a]-=this.DV;if(++a>=this.t){this[this.t++]=0}++this[a]}}function NullExp(){}function nNop(a){return a}function nMulTo(a,c,b){a.multiplyTo(c,b)}function nSqrTo(a,b){a.squareTo(b)}NullExp.prototype.convert=nNop;NullExp.prototype.revert=nNop;NullExp.prototype.mulTo=nMulTo;NullExp.prototype.sqrTo=nSqrTo;function bnPow(a){return this.exp(a,new NullExp())}function bnpMultiplyLowerTo(b,f,e){var d=Math.min(this.t+b.t,f);e.s=0;e.t=d;while(d>0){e[--d]=0}var c;for(c=e.t-this.t;d<c;++d){e[d+this.t]=this.am(0,b[d],e,d,0,this.t)}for(c=Math.min(b.t,f);d<c;++d){this.am(0,b[d],e,d,0,f-d)}e.clamp()}function bnpMultiplyUpperTo(b,e,d){--e;var c=d.t=this.t+b.t-e;d.s=0;while(--c>=0){d[c]=0}for(c=Math.max(e-this.t,0);c<b.t;++c){d[this.t+c-e]=this.am(e-c,b[c],d,0,0,this.t+c-e)}d.clamp();d.drShiftTo(1,d)}function Barrett(a){this.r2=nbi();this.q3=nbi();BigInteger.ONE.dlShiftTo(2*a.t,this.r2);this.mu=this.r2.divide(a);this.m=a}function barrettConvert(a){if(a.s<0||a.t>2*this.m.t){return a.mod(this.m)}else{if(a.compareTo(this.m)<0){return a}else{var b=nbi();a.copyTo(b);this.reduce(b);return b}}}function barrettRevert(a){return a}function barrettReduce(a){a.drShiftTo(this.m.t-1,this.r2);if(a.t>this.m.t+1){a.t=this.m.t+1;a.clamp()}this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);while(a.compareTo(this.r2)<0){a.dAddOffset(1,this.m.t+1)}a.subTo(this.r2,a);while(a.compareTo(this.m)>=0){a.subTo(this.m,a)}}function barrettSqrTo(a,b){a.squareTo(b);this.reduce(b)}function barrettMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}Barrett.prototype.convert=barrettConvert;Barrett.prototype.revert=barrettRevert;Barrett.prototype.reduce=barrettReduce;Barrett.prototype.mulTo=barrettMulTo;Barrett.prototype.sqrTo=barrettSqrTo;function bnModPow(q,f){var o=q.bitLength(),h,b=nbv(1),v;if(o<=0){return b}else{if(o<18){h=1}else{if(o<48){h=3}else{if(o<144){h=4}else{if(o<768){h=5}else{h=6}}}}}if(o<8){v=new Classic(f)}else{if(f.isEven()){v=new Barrett(f)}else{v=new Montgomery(f)}}var p=new Array(),d=3,s=h-1,a=(1<<h)-1;p[1]=v.convert(this);if(h>1){var A=nbi();v.sqrTo(p[1],A);while(d<=a){p[d]=nbi();v.mulTo(A,p[d-2],p[d]);d+=2}}var l=q.t-1,x,u=true,c=nbi(),y;o=nbits(q[l])-1;while(l>=0){if(o>=s){x=(q[l]>>(o-s))&a}else{x=(q[l]&((1<<(o+1))-1))<<(s-o);if(l>0){x|=q[l-1]>>(this.DB+o-s)}}d=h;while((x&1)==0){x>>=1;--d}if((o-=d)<0){o+=this.DB;--l}if(u){p[x].copyTo(b);u=false}else{while(d>1){v.sqrTo(b,c);v.sqrTo(c,b);d-=2}if(d>0){v.sqrTo(b,c)}else{y=b;b=c;c=y}v.mulTo(c,p[x],b)}while(l>=0&&(q[l]&(1<<o))==0){v.sqrTo(b,c);y=b;b=c;c=y;if(--o<0){o=this.DB-1;--l}}}return v.revert(b)}function bnGCD(c){var b=(this.s<0)?this.negate():this.clone();var h=(c.s<0)?c.negate():c.clone();if(b.compareTo(h)<0){var e=b;b=h;h=e}var d=b.getLowestSetBit(),f=h.getLowestSetBit();if(f<0){return b}if(d<f){f=d}if(f>0){b.rShiftTo(f,b);h.rShiftTo(f,h)}while(b.signum()>0){if((d=b.getLowestSetBit())>0){b.rShiftTo(d,b)}if((d=h.getLowestSetBit())>0){h.rShiftTo(d,h)}if(b.compareTo(h)>=0){b.subTo(h,b);b.rShiftTo(1,b)}else{h.subTo(b,h);h.rShiftTo(1,h)}}if(f>0){h.lShiftTo(f,h)}return h}function bnpModInt(e){if(e<=0){return 0}var c=this.DV%e,b=(this.s<0)?e-1:0;if(this.t>0){if(c==0){b=this[0]%e}else{for(var a=this.t-1;a>=0;--a){b=(c*b+this[a])%e}}}return b}function bnModInverse(f){var j=f.isEven();if((this.isEven()&&j)||f.signum()==0){return BigInteger.ZERO}var i=f.clone(),h=this.clone();var g=nbv(1),e=nbv(0),l=nbv(0),k=nbv(1);while(i.signum()!=0){while(i.isEven()){i.rShiftTo(1,i);if(j){if(!g.isEven()||!e.isEven()){g.addTo(this,g);e.subTo(f,e)}g.rShiftTo(1,g)}else{if(!e.isEven()){e.subTo(f,e)}}e.rShiftTo(1,e)}while(h.isEven()){h.rShiftTo(1,h);if(j){if(!l.isEven()||!k.isEven()){l.addTo(this,l);k.subTo(f,k)}l.rShiftTo(1,l)}else{if(!k.isEven()){k.subTo(f,k)}}k.rShiftTo(1,k)}if(i.compareTo(h)>=0){i.subTo(h,i);if(j){g.subTo(l,g)}e.subTo(k,e)}else{h.subTo(i,h);if(j){l.subTo(g,l)}k.subTo(e,k)}}if(h.compareTo(BigInteger.ONE)!=0){return BigInteger.ZERO}if(k.compareTo(f)>=0){return k.subtract(f)}if(k.signum()<0){k.addTo(f,k)}else{return k}if(k.signum()<0){return k.add(f)}else{return k}}var lowprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];var lplim=(1<<26)/lowprimes[lowprimes.length-1];function bnIsProbablePrime(e){var d,b=this.abs();if(b.t==1&&b[0]<=lowprimes[lowprimes.length-1]){for(d=0;d<lowprimes.length;++d){if(b[0]==lowprimes[d]){return true}}return false}if(b.isEven()){return false}d=1;while(d<lowprimes.length){var a=lowprimes[d],c=d+1;while(c<lowprimes.length&&a<lplim){a*=lowprimes[c++]}a=b.modInt(a);while(d<c){if(a%lowprimes[d++]==0){return false}}}return b.millerRabin(e)}function bnpMillerRabin(f){var g=this.subtract(BigInteger.ONE);var c=g.getLowestSetBit();if(c<=0){return false}var h=g.shiftRight(c);f=(f+1)>>1;if(f>lowprimes.length){f=lowprimes.length}var b=nbi();for(var e=0;e<f;++e){b.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);var l=b.modPow(h,this);if(l.compareTo(BigInteger.ONE)!=0&&l.compareTo(g)!=0){var d=1;while(d++<c&&l.compareTo(g)!=0){l=l.modPowInt(2,this);if(l.compareTo(BigInteger.ONE)==0){return false}}if(l.compareTo(g)!=0){return false}}}return true}BigInteger.prototype.chunkSize=bnpChunkSize;BigInteger.prototype.toRadix=bnpToRadix;BigInteger.prototype.fromRadix=bnpFromRadix;BigInteger.prototype.fromNumber=bnpFromNumber;BigInteger.prototype.bitwiseTo=bnpBitwiseTo;BigInteger.prototype.changeBit=bnpChangeBit;BigInteger.prototype.addTo=bnpAddTo;BigInteger.prototype.dMultiply=bnpDMultiply;BigInteger.prototype.dAddOffset=bnpDAddOffset;BigInteger.prototype.multiplyLowerTo=bnpMultiplyLowerTo;BigInteger.prototype.multiplyUpperTo=bnpMultiplyUpperTo;BigInteger.prototype.modInt=bnpModInt;BigInteger.prototype.millerRabin=bnpMillerRabin;BigInteger.prototype.clone=bnClone;BigInteger.prototype.intValue=bnIntValue;BigInteger.prototype.byteValue=bnByteValue;BigInteger.prototype.shortValue=bnShortValue;BigInteger.prototype.signum=bnSigNum;BigInteger.prototype.toByteArray=bnToByteArray;BigInteger.prototype.equals=bnEquals;BigInteger.prototype.min=bnMin;BigInteger.prototype.max=bnMax;BigInteger.prototype.and=bnAnd;BigInteger.prototype.or=bnOr;BigInteger.prototype.xor=bnXor;BigInteger.prototype.andNot=bnAndNot;BigInteger.prototype.not=bnNot;BigInteger.prototype.shiftLeft=bnShiftLeft;BigInteger.prototype.shiftRight=bnShiftRight;BigInteger.prototype.getLowestSetBit=bnGetLowestSetBit;BigInteger.prototype.bitCount=bnBitCount;BigInteger.prototype.testBit=bnTestBit;BigInteger.prototype.setBit=bnSetBit;BigInteger.prototype.clearBit=bnClearBit;BigInteger.prototype.flipBit=bnFlipBit;BigInteger.prototype.add=bnAdd;BigInteger.prototype.subtract=bnSubtract;BigInteger.prototype.multiply=bnMultiply;BigInteger.prototype.divide=bnDivide;BigInteger.prototype.remainder=bnRemainder;BigInteger.prototype.divideAndRemainder=bnDivideAndRemainder;BigInteger.prototype.modPow=bnModPow;BigInteger.prototype.modInverse=bnModInverse;BigInteger.prototype.pow=bnPow;BigInteger.prototype.gcd=bnGCD;BigInteger.prototype.isProbablePrime=bnIsProbablePrime;BigInteger.prototype.square=bnSquare;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function Arcfour(){this.i=0;this.j=0;this.S=new Array()}function ARC4init(d){var c,a,b;for(c=0;c<256;++c){this.S[c]=c}a=0;for(c=0;c<256;++c){a=(a+this.S[c]+d[c%d.length])&255;b=this.S[c];this.S[c]=this.S[a];this.S[a]=b}this.i=0;this.j=0}function ARC4next(){var a;this.i=(this.i+1)&255;this.j=(this.j+this.S[this.i])&255;a=this.S[this.i];this.S[this.i]=this.S[this.j];this.S[this.j]=a;return this.S[(a+this.S[this.i])&255]}Arcfour.prototype.init=ARC4init;Arcfour.prototype.next=ARC4next;function prng_newstate(){return new Arcfour()}var rng_psize=256;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var rng_state;var rng_pool;var rng_pptr;function rng_seed_int(a){rng_pool[rng_pptr++]^=a&255;rng_pool[rng_pptr++]^=(a>>8)&255;rng_pool[rng_pptr++]^=(a>>16)&255;rng_pool[rng_pptr++]^=(a>>24)&255;if(rng_pptr>=rng_psize){rng_pptr-=rng_psize}}function rng_seed_time(){rng_seed_int(new Date().getTime())}if(rng_pool==null){rng_pool=new Array();rng_pptr=0;var t;if(window!==undefined&&(window.crypto!==undefined||window.msCrypto!==undefined)){var crypto=window.crypto||window.msCrypto;if(crypto.getRandomValues){var ua=new Uint8Array(32);crypto.getRandomValues(ua);for(t=0;t<32;++t){rng_pool[rng_pptr++]=ua[t]}}else{if(navigator.appName=="Netscape"&&navigator.appVersion<"5"){var z=window.crypto.random(32);for(t=0;t<z.length;++t){rng_pool[rng_pptr++]=z.charCodeAt(t)&255}}}}while(rng_pptr<rng_psize){t=Math.floor(65536*Math.random());rng_pool[rng_pptr++]=t>>>8;rng_pool[rng_pptr++]=t&255}rng_pptr=0;rng_seed_time()}function rng_get_byte(){if(rng_state==null){rng_seed_time();rng_state=prng_newstate();rng_state.init(rng_pool);for(rng_pptr=0;rng_pptr<rng_pool.length;++rng_pptr){rng_pool[rng_pptr]=0}rng_pptr=0}return rng_state.next()}function rng_get_bytes(b){var a;for(a=0;a<b.length;++a){b[a]=rng_get_byte()}}function SecureRandom(){}SecureRandom.prototype.nextBytes=rng_get_bytes;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function parseBigInt(b,a){return new BigInteger(b,a)}function linebrk(c,d){var a="";var b=0;while(b+d<c.length){a+=c.substring(b,b+d)+"\n";b+=d}return a+c.substring(b,c.length)}function byte2Hex(a){if(a<16){return"0"+a.toString(16)}else{return a.toString(16)}}function pkcs1pad2(e,h){if(h<e.length+11){throw"Message too long for RSA";return null}var g=new Array();var d=e.length-1;while(d>=0&&h>0){var f=e.charCodeAt(d--);if(f<128){g[--h]=f}else{if((f>127)&&(f<2048)){g[--h]=(f&63)|128;g[--h]=(f>>6)|192}else{g[--h]=(f&63)|128;g[--h]=((f>>6)&63)|128;g[--h]=(f>>12)|224}}}g[--h]=0;var b=new SecureRandom();var a=new Array();while(h>2){a[0]=0;while(a[0]==0){b.nextBytes(a)}g[--h]=a[0]}g[--h]=2;g[--h]=0;return new BigInteger(g)}function oaep_mgf1_arr(c,a,e){var b="",d=0;while(b.length<a){b+=e(String.fromCharCode.apply(String,c.concat([(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255])));d+=1}return b}function oaep_pad(q,a,f,l){var c=KJUR.crypto.MessageDigest;var o=KJUR.crypto.Util;var b=null;if(!f){f="sha1"}if(typeof f==="string"){b=c.getCanonicalAlgName(f);l=c.getHashLength(b);f=function(i){return hextorstr(o.hashHex(rstrtohex(i),b))}}if(q.length+2*l+2>a){throw"Message too long for RSA"}var k="",e;for(e=0;e<a-q.length-2*l-2;e+=1){k+="\x00"}var h=f("")+k+"\x01"+q;var g=new Array(l);new SecureRandom().nextBytes(g);var j=oaep_mgf1_arr(g,h.length,f);var p=[];for(e=0;e<h.length;e+=1){p[e]=h.charCodeAt(e)^j.charCodeAt(e)}var m=oaep_mgf1_arr(p,g.length,f);var d=[0];for(e=0;e<g.length;e+=1){d[e+1]=g[e]^m.charCodeAt(e)}return new BigInteger(d.concat(p))}function RSAKey(){this.n=null;this.e=0;this.d=null;this.p=null;this.q=null;this.dmp1=null;this.dmq1=null;this.coeff=null}function RSASetPublic(b,a){this.isPublic=true;this.isPrivate=false;if(typeof b!=="string"){this.n=b;this.e=a}else{if(b!=null&&a!=null&&b.length>0&&a.length>0){this.n=parseBigInt(b,16);this.e=parseInt(a,16)}else{throw"Invalid RSA public key"}}}function RSADoPublic(a){return a.modPowInt(this.e,this.n)}function RSAEncrypt(d){var a=pkcs1pad2(d,(this.n.bitLength()+7)>>3);if(a==null){return null}var e=this.doPublic(a);if(e==null){return null}var b=e.toString(16);if((b.length&1)==0){return b}else{return"0"+b}}function RSAEncryptOAEP(f,e,b){var a=oaep_pad(f,(this.n.bitLength()+7)>>3,e,b);if(a==null){return null}var g=this.doPublic(a);if(g==null){return null}var d=g.toString(16);if((d.length&1)==0){return d}else{return"0"+d}}RSAKey.prototype.doPublic=RSADoPublic;RSAKey.prototype.setPublic=RSASetPublic;RSAKey.prototype.encrypt=RSAEncrypt;RSAKey.prototype.encryptOAEP=RSAEncryptOAEP;RSAKey.prototype.type="RSA";
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function pkcs1unpad2(g,j){var a=g.toByteArray();var f=0;while(f<a.length&&a[f]==0){++f}if(a.length-f!=j-1||a[f]!=2){return null}++f;while(a[f]!=0){if(++f>=a.length){return null}}var e="";while(++f<a.length){var h=a[f]&255;if(h<128){e+=String.fromCharCode(h)}else{if((h>191)&&(h<224)){e+=String.fromCharCode(((h&31)<<6)|(a[f+1]&63));++f}else{e+=String.fromCharCode(((h&15)<<12)|((a[f+1]&63)<<6)|(a[f+2]&63));f+=2}}}return e}function oaep_mgf1_str(c,a,e){var b="",d=0;while(b.length<a){b+=e(c+String.fromCharCode.apply(String,[(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255]));d+=1}return b}function oaep_unpad(o,b,g,p){var e=KJUR.crypto.MessageDigest;var r=KJUR.crypto.Util;var c=null;if(!g){g="sha1"}if(typeof g==="string"){c=e.getCanonicalAlgName(g);p=e.getHashLength(c);g=function(d){return hextorstr(r.hashHex(rstrtohex(d),c))}}o=o.toByteArray();var h;for(h=0;h<o.length;h+=1){o[h]&=255}while(o.length<b){o.unshift(0)}o=String.fromCharCode.apply(String,o);if(o.length<2*p+2){throw"Cipher too short"}var f=o.substr(1,p);var s=o.substr(p+1);var q=oaep_mgf1_str(s,p,g);var k=[],h;for(h=0;h<f.length;h+=1){k[h]=f.charCodeAt(h)^q.charCodeAt(h)}var l=oaep_mgf1_str(String.fromCharCode.apply(String,k),o.length-p,g);var j=[];for(h=0;h<s.length;h+=1){j[h]=s.charCodeAt(h)^l.charCodeAt(h)}j=String.fromCharCode.apply(String,j);if(j.substr(0,p)!==g("")){throw"Hash mismatch"}j=j.substr(p);var a=j.indexOf("\x01");var m=(a!=-1)?j.substr(0,a).lastIndexOf("\x00"):-1;if(m+1!=a){throw"Malformed data"}return j.substr(a+1)}function RSASetPrivate(c,a,b){this.isPrivate=true;if(typeof c!=="string"){this.n=c;this.e=a;this.d=b}else{if(c!=null&&a!=null&&c.length>0&&a.length>0){this.n=parseBigInt(c,16);this.e=parseInt(a,16);this.d=parseBigInt(b,16)}else{throw"Invalid RSA private key"}}}function RSASetPrivateEx(g,d,e,c,b,a,h,f){this.isPrivate=true;this.isPublic=false;if(g==null){throw"RSASetPrivateEx N == null"}if(d==null){throw"RSASetPrivateEx E == null"}if(g.length==0){throw"RSASetPrivateEx N.length == 0"}if(d.length==0){throw"RSASetPrivateEx E.length == 0"}if(g!=null&&d!=null&&g.length>0&&d.length>0){this.n=parseBigInt(g,16);this.e=parseInt(d,16);this.d=parseBigInt(e,16);this.p=parseBigInt(c,16);this.q=parseBigInt(b,16);this.dmp1=parseBigInt(a,16);this.dmq1=parseBigInt(h,16);this.coeff=parseBigInt(f,16)}else{throw"Invalid RSA private key in RSASetPrivateEx"}}function RSAGenerate(b,i){var a=new SecureRandom();var f=b>>1;this.e=parseInt(i,16);var c=new BigInteger(i,16);for(;;){for(;;){this.p=new BigInteger(b-f,1,a);if(this.p.subtract(BigInteger.ONE).gcd(c).compareTo(BigInteger.ONE)==0&&this.p.isProbablePrime(10)){break}}for(;;){this.q=new BigInteger(f,1,a);if(this.q.subtract(BigInteger.ONE).gcd(c).compareTo(BigInteger.ONE)==0&&this.q.isProbablePrime(10)){break}}if(this.p.compareTo(this.q)<=0){var h=this.p;this.p=this.q;this.q=h}var g=this.p.subtract(BigInteger.ONE);var d=this.q.subtract(BigInteger.ONE);var e=g.multiply(d);if(e.gcd(c).compareTo(BigInteger.ONE)==0){this.n=this.p.multiply(this.q);if(this.n.bitLength()==b){this.d=c.modInverse(e);this.dmp1=this.d.mod(g);this.dmq1=this.d.mod(d);this.coeff=this.q.modInverse(this.p);break}}}this.isPrivate=true}function RSADoPrivate(a){if(this.p==null||this.q==null){return a.modPow(this.d,this.n)}var c=a.mod(this.p).modPow(this.dmp1,this.p);var b=a.mod(this.q).modPow(this.dmq1,this.q);while(c.compareTo(b)<0){c=c.add(this.p)}return c.subtract(b).multiply(this.coeff).mod(this.p).multiply(this.q).add(b)}function RSADecrypt(b){if(b.length!=Math.ceil(this.n.bitLength()/4)){throw new Error("wrong ctext length")}var d=parseBigInt(b,16);var a=this.doPrivate(d);if(a==null){return null}return pkcs1unpad2(a,(this.n.bitLength()+7)>>3)}function RSADecryptOAEP(e,d,b){if(e.length!=Math.ceil(this.n.bitLength()/4)){throw new Error("wrong ctext length")}var f=parseBigInt(e,16);var a=this.doPrivate(f);if(a==null){return null}return oaep_unpad(a,(this.n.bitLength()+7)>>3,d,b)}RSAKey.prototype.doPrivate=RSADoPrivate;RSAKey.prototype.setPrivate=RSASetPrivate;RSAKey.prototype.setPrivateEx=RSASetPrivateEx;RSAKey.prototype.generate=RSAGenerate;RSAKey.prototype.decrypt=RSADecrypt;RSAKey.prototype.decryptOAEP=RSADecryptOAEP;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function ECFieldElementFp(b,a){this.x=a;this.q=b}function feFpEquals(a){if(a==this){return true}return(this.q.equals(a.q)&&this.x.equals(a.x))}function feFpToBigInteger(){return this.x}function feFpNegate(){return new ECFieldElementFp(this.q,this.x.negate().mod(this.q))}function feFpAdd(a){return new ECFieldElementFp(this.q,this.x.add(a.toBigInteger()).mod(this.q))}function feFpSubtract(a){return new ECFieldElementFp(this.q,this.x.subtract(a.toBigInteger()).mod(this.q))}function feFpMultiply(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger()).mod(this.q))}function feFpSquare(){return new ECFieldElementFp(this.q,this.x.square().mod(this.q))}function feFpDivide(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger().modInverse(this.q)).mod(this.q))}ECFieldElementFp.prototype.equals=feFpEquals;ECFieldElementFp.prototype.toBigInteger=feFpToBigInteger;ECFieldElementFp.prototype.negate=feFpNegate;ECFieldElementFp.prototype.add=feFpAdd;ECFieldElementFp.prototype.subtract=feFpSubtract;ECFieldElementFp.prototype.multiply=feFpMultiply;ECFieldElementFp.prototype.square=feFpSquare;ECFieldElementFp.prototype.divide=feFpDivide;function ECPointFp(c,a,d,b){this.curve=c;this.x=a;this.y=d;if(b==null){this.z=BigInteger.ONE}else{this.z=b}this.zinv=null}function pointFpGetX(){if(this.zinv==null){this.zinv=this.z.modInverse(this.curve.q)}return this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpGetY(){if(this.zinv==null){this.zinv=this.z.modInverse(this.curve.q)}return this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpEquals(a){if(a==this){return true}if(this.isInfinity()){return a.isInfinity()}if(a.isInfinity()){return this.isInfinity()}var c,b;c=a.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(a.z)).mod(this.curve.q);if(!c.equals(BigInteger.ZERO)){return false}b=a.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(a.z)).mod(this.curve.q);return b.equals(BigInteger.ZERO)}function pointFpIsInfinity(){if((this.x==null)&&(this.y==null)){return true}return this.z.equals(BigInteger.ZERO)&&!this.y.toBigInteger().equals(BigInteger.ZERO)}function pointFpNegate(){return new ECPointFp(this.curve,this.x,this.y.negate(),this.z)}function pointFpAdd(l){if(this.isInfinity()){return l}if(l.isInfinity()){return this}var p=l.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(l.z)).mod(this.curve.q);var o=l.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(l.z)).mod(this.curve.q);if(BigInteger.ZERO.equals(o)){if(BigInteger.ZERO.equals(p)){return this.twice()}return this.curve.getInfinity()}var j=new BigInteger("3");var e=this.x.toBigInteger();var n=this.y.toBigInteger();var c=l.x.toBigInteger();var k=l.y.toBigInteger();var m=o.square();var i=m.multiply(o);var d=e.multiply(m);var g=p.square().multiply(this.z);var a=g.subtract(d.shiftLeft(1)).multiply(l.z).subtract(i).multiply(o).mod(this.curve.q);var h=d.multiply(j).multiply(p).subtract(n.multiply(i)).subtract(g.multiply(p)).multiply(l.z).add(p.multiply(i)).mod(this.curve.q);var f=i.multiply(this.z).multiply(l.z).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(a),this.curve.fromBigInteger(h),f)}function pointFpTwice(){if(this.isInfinity()){return this}if(this.y.toBigInteger().signum()==0){return this.curve.getInfinity()}var g=new BigInteger("3");var c=this.x.toBigInteger();var h=this.y.toBigInteger();var e=h.multiply(this.z);var j=e.multiply(h).mod(this.curve.q);var i=this.curve.a.toBigInteger();var k=c.square().multiply(g);if(!BigInteger.ZERO.equals(i)){k=k.add(this.z.square().multiply(i))}k=k.mod(this.curve.q);var b=k.square().subtract(c.shiftLeft(3).multiply(j)).shiftLeft(1).multiply(e).mod(this.curve.q);var f=k.multiply(g).multiply(c).subtract(j.shiftLeft(1)).shiftLeft(2).multiply(j).subtract(k.square().multiply(k)).mod(this.curve.q);var d=e.square().multiply(e).shiftLeft(3).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(b),this.curve.fromBigInteger(f),d)}function pointFpMultiply(d){if(this.isInfinity()){return this}if(d.signum()==0){return this.curve.getInfinity()}var m=d;var l=m.multiply(new BigInteger("3"));var b=this.negate();var j=this;var q=this.curve.q.subtract(d);var o=q.multiply(new BigInteger("3"));var c=new ECPointFp(this.curve,this.x,this.y);var a=c.negate();var g;for(g=l.bitLength()-2;g>0;--g){j=j.twice();var n=l.testBit(g);var f=m.testBit(g);if(n!=f){j=j.add(n?this:b)}}for(g=o.bitLength()-2;g>0;--g){c=c.twice();var p=o.testBit(g);var r=q.testBit(g);if(p!=r){c=c.add(p?c:a)}}return j}function pointFpMultiplyTwo(c,a,b){var d;if(c.bitLength()>b.bitLength()){d=c.bitLength()-1}else{d=b.bitLength()-1}var f=this.curve.getInfinity();var e=this.add(a);while(d>=0){f=f.twice();if(c.testBit(d)){if(b.testBit(d)){f=f.add(e)}else{f=f.add(this)}}else{if(b.testBit(d)){f=f.add(a)}}--d}return f}ECPointFp.prototype.getX=pointFpGetX;ECPointFp.prototype.getY=pointFpGetY;ECPointFp.prototype.equals=pointFpEquals;ECPointFp.prototype.isInfinity=pointFpIsInfinity;ECPointFp.prototype.negate=pointFpNegate;ECPointFp.prototype.add=pointFpAdd;ECPointFp.prototype.twice=pointFpTwice;ECPointFp.prototype.multiply=pointFpMultiply;ECPointFp.prototype.multiplyTwo=pointFpMultiplyTwo;function ECCurveFp(e,d,c){this.q=e;this.a=this.fromBigInteger(d);this.b=this.fromBigInteger(c);this.infinity=new ECPointFp(this,null,null)}function curveFpGetQ(){return this.q}function curveFpGetA(){return this.a}function curveFpGetB(){return this.b}function curveFpEquals(a){if(a==this){return true}return(this.q.equals(a.q)&&this.a.equals(a.a)&&this.b.equals(a.b))}function curveFpGetInfinity(){return this.infinity}function curveFpFromBigInteger(a){return new ECFieldElementFp(this.q,a)}function curveFpDecodePointHex(d){switch(parseInt(d.substr(0,2),16)){case 0:return this.infinity;case 2:case 3:return null;case 4:case 6:case 7:var a=(d.length-2)/2;var c=d.substr(2,a);var b=d.substr(a+2,a);return new ECPointFp(this,this.fromBigInteger(new BigInteger(c,16)),this.fromBigInteger(new BigInteger(b,16)));default:return null}}ECCurveFp.prototype.getQ=curveFpGetQ;ECCurveFp.prototype.getA=curveFpGetA;ECCurveFp.prototype.getB=curveFpGetB;ECCurveFp.prototype.equals=curveFpEquals;ECCurveFp.prototype.getInfinity=curveFpGetInfinity;ECCurveFp.prototype.fromBigInteger=curveFpFromBigInteger;ECCurveFp.prototype.decodePointHex=curveFpDecodePointHex;
/*! (c) Stefan Thomas | https://github.com/bitcoinjs/bitcoinjs-lib
 */
ECFieldElementFp.prototype.getByteLength=function(){return Math.floor((this.toBigInteger().bitLength()+7)/8)};ECPointFp.prototype.getEncoded=function(c){var d=function(h,f){var g=h.toByteArrayUnsigned();if(f<g.length){g=g.slice(g.length-f)}else{while(f>g.length){g.unshift(0)}}return g};var a=this.getX().toBigInteger();var e=this.getY().toBigInteger();var b=d(a,32);if(c){if(e.isEven()){b.unshift(2)}else{b.unshift(3)}}else{b.unshift(4);b=b.concat(d(e,32))}return b};ECPointFp.decodeFrom=function(g,c){var f=c[0];var e=c.length-1;var d=c.slice(1,1+e/2);var b=c.slice(1+e/2,1+e);d.unshift(0);b.unshift(0);var a=new BigInteger(d);var h=new BigInteger(b);return new ECPointFp(g,g.fromBigInteger(a),g.fromBigInteger(h))};ECPointFp.decodeFromHex=function(g,c){var f=c.substr(0,2);var e=c.length-2;var d=c.substr(2,e/2);var b=c.substr(2+e/2,e/2);var a=new BigInteger(d,16);var h=new BigInteger(b,16);return new ECPointFp(g,g.fromBigInteger(a),g.fromBigInteger(h))};ECPointFp.prototype.add2D=function(c){if(this.isInfinity()){return c}if(c.isInfinity()){return this}if(this.x.equals(c.x)){if(this.y.equals(c.y)){return this.twice()}return this.curve.getInfinity()}var g=c.x.subtract(this.x);var e=c.y.subtract(this.y);var a=e.divide(g);var d=a.square().subtract(this.x).subtract(c.x);var f=a.multiply(this.x.subtract(d)).subtract(this.y);return new ECPointFp(this.curve,d,f)};ECPointFp.prototype.twice2D=function(){if(this.isInfinity()){return this}if(this.y.toBigInteger().signum()==0){return this.curve.getInfinity()}var b=this.curve.fromBigInteger(BigInteger.valueOf(2));var e=this.curve.fromBigInteger(BigInteger.valueOf(3));var a=this.x.square().multiply(e).add(this.curve.a).divide(this.y.multiply(b));var c=a.square().subtract(this.x.multiply(b));var d=a.multiply(this.x.subtract(c)).subtract(this.y);return new ECPointFp(this.curve,c,d)};ECPointFp.prototype.multiply2D=function(b){if(this.isInfinity()){return this}if(b.signum()==0){return this.curve.getInfinity()}var g=b;var f=g.multiply(new BigInteger("3"));var l=this.negate();var d=this;var c;for(c=f.bitLength()-2;c>0;--c){d=d.twice();var a=f.testBit(c);var j=g.testBit(c);if(a!=j){d=d.add2D(a?this:l)}}return d};ECPointFp.prototype.isOnCurve=function(){var d=this.getX().toBigInteger();var i=this.getY().toBigInteger();var f=this.curve.getA().toBigInteger();var c=this.curve.getB().toBigInteger();var h=this.curve.getQ();var e=i.multiply(i).mod(h);var g=d.multiply(d).multiply(d).add(f.multiply(d)).add(c).mod(h);return e.equals(g)};ECPointFp.prototype.toString=function(){return"("+this.getX().toBigInteger().toString()+","+this.getY().toBigInteger().toString()+")"};ECPointFp.prototype.validate=function(){var c=this.curve.getQ();if(this.isInfinity()){throw new Error("Point is at infinity.")}var a=this.getX().toBigInteger();var b=this.getY().toBigInteger();if(a.compareTo(BigInteger.ONE)<0||a.compareTo(c.subtract(BigInteger.ONE))>0){throw new Error("x coordinate out of bounds")}if(b.compareTo(BigInteger.ONE)<0||b.compareTo(c.subtract(BigInteger.ONE))>0){throw new Error("y coordinate out of bounds")}if(!this.isOnCurve()){throw new Error("Point is not on the curve.")}if(this.multiply(c).isInfinity()){throw new Error("Point is not a scalar multiple of G.")}return true};
/*! Mike Samuel (c) 2009 | code.google.com/p/json-sans-eval
 */
var jsonParse=(function(){var e="(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)";var j='(?:[^\\0-\\x08\\x0a-\\x1f"\\\\]|\\\\(?:["/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';var i='(?:"'+j+'*")';var d=new RegExp("(?:false|true|null|[\\{\\}\\[\\]]|"+e+"|"+i+")","g");var k=new RegExp("\\\\(?:([^u])|u(.{4}))","g");var g={'"':'"',"/":"/","\\":"\\",b:"\b",f:"\f",n:"\n",r:"\r",t:"\t"};function h(l,m,n){return m?g[m]:String.fromCharCode(parseInt(n,16))}var c=new String("");var a="\\";var f={"{":Object,"[":Array};var b=Object.hasOwnProperty;return function(u,q){var p=u.match(d);var x;var v=p[0];var l=false;if("{"===v){x={}}else{if("["===v){x=[]}else{x=[];l=true}}var t;var r=[x];for(var o=1-l,m=p.length;o<m;++o){v=p[o];var w;switch(v.charCodeAt(0)){default:w=r[0];w[t||w.length]=+(v);t=void 0;break;case 34:v=v.substring(1,v.length-1);if(v.indexOf(a)!==-1){v=v.replace(k,h)}w=r[0];if(!t){if(w instanceof Array){t=w.length}else{t=v||c;break}}w[t]=v;t=void 0;break;case 91:w=r[0];r.unshift(w[t||w.length]=[]);t=void 0;break;case 93:r.shift();break;case 102:w=r[0];w[t||w.length]=false;t=void 0;break;case 110:w=r[0];w[t||w.length]=null;t=void 0;break;case 116:w=r[0];w[t||w.length]=true;t=void 0;break;case 123:w=r[0];r.unshift(w[t||w.length]={});t=void 0;break;case 125:r.shift();break}}if(l){if(r.length!==1){throw new Error()}x=x[0]}else{if(r.length){throw new Error()}}if(q){var s=function(C,B){var D=C[B];if(D&&typeof D==="object"){var n=null;for(var z in D){if(b.call(D,z)&&D!==C){var y=s(D,z);if(y!==void 0){D[z]=y}else{if(!n){n=[]}n.push(z)}}}if(n){for(var A=n.length;--A>=0;){delete D[n[A]]}}}return q.call(C,B,D)};x=s({"":x},"")}return x}})();
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}KJUR.asn1.ASN1Util=new function(){this.integerToByteHex=function(a){var b=a.toString(16);if((b.length%2)==1){b="0"+b}return b};this.bigIntToMinTwosComplementsHex=function(j){var f=j.toString(16);if(f.substr(0,1)!="-"){if(f.length%2==1){f="0"+f}else{if(!f.match(/^[0-7]/)){f="00"+f}}}else{var a=f.substr(1);var e=a.length;if(e%2==1){e+=1}else{if(!f.match(/^[0-7]/)){e+=2}}var g="";for(var d=0;d<e;d++){g+="f"}var c=new BigInteger(g,16);var b=c.xor(j).add(BigInteger.ONE);f=b.toString(16).replace(/^-/,"")}return f};this.getPEMStringFromHex=function(a,b){return hextopem(a,b)};this.newObject=function(l){var F=KJUR,p=F.asn1,B=p.DERBoolean,f=p.DERInteger,u=p.DERBitString,j=p.DEROctetString,x=p.DERNull,y=p.DERObjectIdentifier,n=p.DEREnumerated,h=p.DERUTF8String,g=p.DERNumericString,A=p.DERPrintableString,w=p.DERTeletexString,r=p.DERIA5String,E=p.DERUTCTime,k=p.DERGeneralizedTime,b=p.DERVisibleString,m=p.DERBMPString,o=p.DERSequence,d=p.DERSet,t=p.DERTaggedObject,q=p.ASN1Util.newObject;var v=Object.keys(l);if(v.length!=1){throw"key of param shall be only one."}var H=v[0];if(":bool:int:bitstr:octstr:null:oid:enum:utf8str:numstr:prnstr:telstr:ia5str:utctime:gentime:visstr:bmpstr:seq:set:tag:".indexOf(":"+H+":")==-1){throw new Error("undefined key: "+H)}if(H=="bool"){return new B(l[H])}if(H=="int"){return new f(l[H])}if(H=="bitstr"){return new u(l[H])}if(H=="octstr"){return new j(l[H])}if(H=="null"){return new x(l[H])}if(H=="oid"){return new y(l[H])}if(H=="enum"){return new n(l[H])}if(H=="utf8str"){return new h(l[H])}if(H=="numstr"){return new g(l[H])}if(H=="prnstr"){return new A(l[H])}if(H=="telstr"){return new w(l[H])}if(H=="ia5str"){return new r(l[H])}if(H=="utctime"){return new E(l[H])}if(H=="gentime"){return new k(l[H])}if(H=="visstr"){return new b(l[H])}if(H=="bmpstr"){return new m(l[H])}if(H=="seq"){var e=l[H];var G=[];for(var z=0;z<e.length;z++){var D=q(e[z]);G.push(D)}return new o({array:G})}if(H=="set"){var e=l[H];var G=[];for(var z=0;z<e.length;z++){var D=q(e[z]);G.push(D)}return new d({array:G})}if(H=="tag"){var C=l[H];if(Object.prototype.toString.call(C)==="[object Array]"&&C.length==3){var s=q(C[2]);return new t({tag:C[0],explicit:C[1],obj:s})}else{var c={};if(C.explicit!==undefined){c.explicit=C.explicit}if(C.tag!==undefined){c.tag=C.tag}if(C.obj===undefined){throw"obj shall be specified for 'tag'."}c.obj=q(C.obj);return new t(c)}}};this.jsonToASN1HEX=function(b){var a=this.newObject(b);return a.getEncodedHex()}};KJUR.asn1.ASN1Util.oidHexToInt=function(a){var j="";var k=parseInt(a.substr(0,2),16);var d=Math.floor(k/40);var c=k%40;var j=d+"."+c;var e="";for(var f=2;f<a.length;f+=2){var g=parseInt(a.substr(f,2),16);var h=("00000000"+g.toString(2)).slice(-8);e=e+h.substr(1,7);if(h.substr(0,1)=="0"){var b=new BigInteger(e,2);j=j+"."+b.toString(10);e=""}}return j};KJUR.asn1.ASN1Util.oidIntToHex=function(f){var e=function(a){var k=a.toString(16);if(k.length==1){k="0"+k}return k};var d=function(o){var n="";var k=new BigInteger(o,10);var a=k.toString(2);var l=7-a.length%7;if(l==7){l=0}var q="";for(var m=0;m<l;m++){q+="0"}a=q+a;for(var m=0;m<a.length-1;m+=7){var p=a.substr(m,7);if(m!=a.length-7){p="1"+p}n+=e(parseInt(p,2))}return n};if(!f.match(/^[0-9.]+$/)){throw"malformed oid string: "+f}var g="";var b=f.split(".");var j=parseInt(b[0])*40+parseInt(b[1]);g+=e(j);b.splice(0,2);for(var c=0;c<b.length;c++){g+=d(b[c])}return g};KJUR.asn1.ASN1Object=function(){var c=true;var b=null;var d="00";var e="00";var a="";this.getLengthHexFromValue=function(){if(typeof this.hV=="undefined"||this.hV==null){throw"this.hV is null or undefined."}if(this.hV.length%2==1){throw"value hex must be even length: n="+a.length+",v="+this.hV}var i=this.hV.length/2;var h=i.toString(16);if(h.length%2==1){h="0"+h}if(i<128){return h}else{var g=h.length/2;if(g>15){throw"ASN.1 length too long to represent by 8x: n = "+i.toString(16)}var f=128+g;return f.toString(16)+h}};this.getEncodedHex=function(){if(this.hTLV==null||this.isModified){this.hV=this.getFreshValueHex();this.hL=this.getLengthHexFromValue();this.hTLV=this.hT+this.hL+this.hV;this.isModified=false}return this.hTLV};this.getValueHex=function(){this.getEncodedHex();return this.hV};this.getFreshValueHex=function(){return""}};KJUR.asn1.DERAbstractString=function(c){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);var b=null;var a=null;this.getString=function(){return this.s};this.setString=function(d){this.hTLV=null;this.isModified=true;this.s=d;this.hV=utf8tohex(this.s).toLowerCase()};this.setStringHex=function(d){this.hTLV=null;this.isModified=true;this.s=null;this.hV=d};this.getFreshValueHex=function(){return this.hV};if(typeof c!="undefined"){if(typeof c=="string"){this.setString(c)}else{if(typeof c.str!="undefined"){this.setString(c.str)}else{if(typeof c.hex!="undefined"){this.setStringHex(c.hex)}}}}};YAHOO.lang.extend(KJUR.asn1.DERAbstractString,KJUR.asn1.ASN1Object);KJUR.asn1.DERAbstractTime=function(c){KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);var b=null;var a=null;this.localDateToUTC=function(g){var e=g.getTime()+(g.getTimezoneOffset()*60000);var f=new Date(e);return f};this.formatDate=function(m,o,e){var g=this.zeroPadding;var n=this.localDateToUTC(m);var p=String(n.getFullYear());if(o=="utc"){p=p.substr(2,2)}var l=g(String(n.getMonth()+1),2);var q=g(String(n.getDate()),2);var h=g(String(n.getHours()),2);var i=g(String(n.getMinutes()),2);var j=g(String(n.getSeconds()),2);var r=p+l+q+h+i+j;if(e===true){var f=n.getMilliseconds();if(f!=0){var k=g(String(f),3);k=k.replace(/[0]+$/,"");r=r+"."+k}}return r+"Z"};this.zeroPadding=function(e,d){if(e.length>=d){return e}return new Array(d-e.length+1).join("0")+e};this.getString=function(){return this.s};this.setString=function(d){this.hTLV=null;this.isModified=true;this.s=d;this.hV=stohex(d)};this.setByDateValue=function(h,j,e,d,f,g){var i=new Date(Date.UTC(h,j-1,e,d,f,g,0));this.setByDate(i)};this.getFreshValueHex=function(){return this.hV}};YAHOO.lang.extend(KJUR.asn1.DERAbstractTime,KJUR.asn1.ASN1Object);KJUR.asn1.DERAbstractStructured=function(b){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);var a=null;this.setByASN1ObjectArray=function(c){this.hTLV=null;this.isModified=true;this.asn1Array=c};this.appendASN1Object=function(c){this.hTLV=null;this.isModified=true;this.asn1Array.push(c)};this.asn1Array=new Array();if(typeof b!="undefined"){if(typeof b.array!="undefined"){this.asn1Array=b.array}}};YAHOO.lang.extend(KJUR.asn1.DERAbstractStructured,KJUR.asn1.ASN1Object);KJUR.asn1.DERBoolean=function(){KJUR.asn1.DERBoolean.superclass.constructor.call(this);this.hT="01";this.hTLV="0101ff"};YAHOO.lang.extend(KJUR.asn1.DERBoolean,KJUR.asn1.ASN1Object);KJUR.asn1.DERInteger=function(a){KJUR.asn1.DERInteger.superclass.constructor.call(this);this.hT="02";this.setByBigInteger=function(b){this.hTLV=null;this.isModified=true;this.hV=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(b)};this.setByInteger=function(c){var b=new BigInteger(String(c),10);this.setByBigInteger(b)};this.setValueHex=function(b){this.hV=b};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a.bigint!="undefined"){this.setByBigInteger(a.bigint)}else{if(typeof a["int"]!="undefined"){this.setByInteger(a["int"])}else{if(typeof a=="number"){this.setByInteger(a)}else{if(typeof a.hex!="undefined"){this.setValueHex(a.hex)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERInteger,KJUR.asn1.ASN1Object);KJUR.asn1.DERBitString=function(b){if(b!==undefined&&typeof b.obj!=="undefined"){var a=KJUR.asn1.ASN1Util.newObject(b.obj);b.hex="00"+a.getEncodedHex()}KJUR.asn1.DERBitString.superclass.constructor.call(this);this.hT="03";this.setHexValueIncludingUnusedBits=function(c){this.hTLV=null;this.isModified=true;this.hV=c};this.setUnusedBitsAndHexValue=function(c,e){if(c<0||7<c){throw"unused bits shall be from 0 to 7: u = "+c}var d="0"+c;this.hTLV=null;this.isModified=true;this.hV=d+e};this.setByBinaryString=function(e){e=e.replace(/0+$/,"");var f=8-e.length%8;if(f==8){f=0}for(var g=0;g<=f;g++){e+="0"}var j="";for(var g=0;g<e.length-1;g+=8){var d=e.substr(g,8);var c=parseInt(d,2).toString(16);if(c.length==1){c="0"+c}j+=c}this.hTLV=null;this.isModified=true;this.hV="0"+f+j};this.setByBooleanArray=function(e){var d="";for(var c=0;c<e.length;c++){if(e[c]==true){d+="1"}else{d+="0"}}this.setByBinaryString(d)};this.newFalseArray=function(e){var c=new Array(e);for(var d=0;d<e;d++){c[d]=false}return c};this.getFreshValueHex=function(){return this.hV};if(typeof b!="undefined"){if(typeof b=="string"&&b.toLowerCase().match(/^[0-9a-f]+$/)){this.setHexValueIncludingUnusedBits(b)}else{if(typeof b.hex!="undefined"){this.setHexValueIncludingUnusedBits(b.hex)}else{if(typeof b.bin!="undefined"){this.setByBinaryString(b.bin)}else{if(typeof b.array!="undefined"){this.setByBooleanArray(b.array)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERBitString,KJUR.asn1.ASN1Object);KJUR.asn1.DEROctetString=function(b){if(b!==undefined&&typeof b.obj!=="undefined"){var a=KJUR.asn1.ASN1Util.newObject(b.obj);b.hex=a.getEncodedHex()}KJUR.asn1.DEROctetString.superclass.constructor.call(this,b);this.hT="04"};YAHOO.lang.extend(KJUR.asn1.DEROctetString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERNull=function(){KJUR.asn1.DERNull.superclass.constructor.call(this);this.hT="05";this.hTLV="0500"};YAHOO.lang.extend(KJUR.asn1.DERNull,KJUR.asn1.ASN1Object);KJUR.asn1.DERObjectIdentifier=function(c){var b=function(d){var e=d.toString(16);if(e.length==1){e="0"+e}return e};var a=function(k){var j="";var e=new BigInteger(k,10);var d=e.toString(2);var f=7-d.length%7;if(f==7){f=0}var m="";for(var g=0;g<f;g++){m+="0"}d=m+d;for(var g=0;g<d.length-1;g+=7){var l=d.substr(g,7);if(g!=d.length-7){l="1"+l}j+=b(parseInt(l,2))}return j};KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this);this.hT="06";this.setValueHex=function(d){this.hTLV=null;this.isModified=true;this.s=null;this.hV=d};this.setValueOidString=function(f){if(!f.match(/^[0-9.]+$/)){throw"malformed oid string: "+f}var g="";var d=f.split(".");var j=parseInt(d[0])*40+parseInt(d[1]);g+=b(j);d.splice(0,2);for(var e=0;e<d.length;e++){g+=a(d[e])}this.hTLV=null;this.isModified=true;this.s=null;this.hV=g};this.setValueName=function(e){var d=KJUR.asn1.x509.OID.name2oid(e);if(d!==""){this.setValueOidString(d)}else{throw"DERObjectIdentifier oidName undefined: "+e}};this.getFreshValueHex=function(){return this.hV};if(c!==undefined){if(typeof c==="string"){if(c.match(/^[0-2].[0-9.]+$/)){this.setValueOidString(c)}else{this.setValueName(c)}}else{if(c.oid!==undefined){this.setValueOidString(c.oid)}else{if(c.hex!==undefined){this.setValueHex(c.hex)}else{if(c.name!==undefined){this.setValueName(c.name)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERObjectIdentifier,KJUR.asn1.ASN1Object);KJUR.asn1.DEREnumerated=function(a){KJUR.asn1.DEREnumerated.superclass.constructor.call(this);this.hT="0a";this.setByBigInteger=function(b){this.hTLV=null;this.isModified=true;this.hV=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(b)};this.setByInteger=function(c){var b=new BigInteger(String(c),10);this.setByBigInteger(b)};this.setValueHex=function(b){this.hV=b};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a["int"]!="undefined"){this.setByInteger(a["int"])}else{if(typeof a=="number"){this.setByInteger(a)}else{if(typeof a.hex!="undefined"){this.setValueHex(a.hex)}}}}};YAHOO.lang.extend(KJUR.asn1.DEREnumerated,KJUR.asn1.ASN1Object);KJUR.asn1.DERUTF8String=function(a){KJUR.asn1.DERUTF8String.superclass.constructor.call(this,a);this.hT="0c"};YAHOO.lang.extend(KJUR.asn1.DERUTF8String,KJUR.asn1.DERAbstractString);KJUR.asn1.DERNumericString=function(a){KJUR.asn1.DERNumericString.superclass.constructor.call(this,a);this.hT="12"};YAHOO.lang.extend(KJUR.asn1.DERNumericString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERPrintableString=function(a){KJUR.asn1.DERPrintableString.superclass.constructor.call(this,a);this.hT="13"};YAHOO.lang.extend(KJUR.asn1.DERPrintableString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERTeletexString=function(a){KJUR.asn1.DERTeletexString.superclass.constructor.call(this,a);this.hT="14"};YAHOO.lang.extend(KJUR.asn1.DERTeletexString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERIA5String=function(a){KJUR.asn1.DERIA5String.superclass.constructor.call(this,a);this.hT="16"};YAHOO.lang.extend(KJUR.asn1.DERIA5String,KJUR.asn1.DERAbstractString);KJUR.asn1.DERVisibleString=function(a){KJUR.asn1.DERIA5String.superclass.constructor.call(this,a);this.hT="1a"};YAHOO.lang.extend(KJUR.asn1.DERVisibleString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERBMPString=function(a){KJUR.asn1.DERBMPString.superclass.constructor.call(this,a);this.hT="1e"};YAHOO.lang.extend(KJUR.asn1.DERBMPString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERUTCTime=function(a){KJUR.asn1.DERUTCTime.superclass.constructor.call(this,a);this.hT="17";this.setByDate=function(b){this.hTLV=null;this.isModified=true;this.date=b;this.s=this.formatDate(this.date,"utc");this.hV=stohex(this.s)};this.getFreshValueHex=function(){if(typeof this.date=="undefined"&&typeof this.s=="undefined"){this.date=new Date();this.s=this.formatDate(this.date,"utc");this.hV=stohex(this.s)}return this.hV};if(a!==undefined){if(a.str!==undefined){this.setString(a.str)}else{if(typeof a=="string"&&a.match(/^[0-9]{12}Z$/)){this.setString(a)}else{if(a.hex!==undefined){this.setStringHex(a.hex)}else{if(a.date!==undefined){this.setByDate(a.date)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERUTCTime,KJUR.asn1.DERAbstractTime);KJUR.asn1.DERGeneralizedTime=function(a){KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this,a);this.hT="18";this.withMillis=false;this.setByDate=function(b){this.hTLV=null;this.isModified=true;this.date=b;this.s=this.formatDate(this.date,"gen",this.withMillis);this.hV=stohex(this.s)};this.getFreshValueHex=function(){if(this.date===undefined&&this.s===undefined){this.date=new Date();this.s=this.formatDate(this.date,"gen",this.withMillis);this.hV=stohex(this.s)}return this.hV};if(a!==undefined){if(a.str!==undefined){this.setString(a.str)}else{if(typeof a=="string"&&a.match(/^[0-9]{14}Z$/)){this.setString(a)}else{if(a.hex!==undefined){this.setStringHex(a.hex)}else{if(a.date!==undefined){this.setByDate(a.date)}}}}if(a.millis===true){this.withMillis=true}}};YAHOO.lang.extend(KJUR.asn1.DERGeneralizedTime,KJUR.asn1.DERAbstractTime);KJUR.asn1.DERSequence=function(a){KJUR.asn1.DERSequence.superclass.constructor.call(this,a);this.hT="30";this.getFreshValueHex=function(){var c="";for(var b=0;b<this.asn1Array.length;b++){var d=this.asn1Array[b];c+=d.getEncodedHex()}this.hV=c;return this.hV}};YAHOO.lang.extend(KJUR.asn1.DERSequence,KJUR.asn1.DERAbstractStructured);KJUR.asn1.DERSet=function(a){KJUR.asn1.DERSet.superclass.constructor.call(this,a);this.hT="31";this.sortFlag=true;this.getFreshValueHex=function(){var b=new Array();for(var c=0;c<this.asn1Array.length;c++){var d=this.asn1Array[c];b.push(d.getEncodedHex())}if(this.sortFlag==true){b.sort()}this.hV=b.join("");return this.hV};if(typeof a!="undefined"){if(typeof a.sortflag!="undefined"&&a.sortflag==false){this.sortFlag=false}}};YAHOO.lang.extend(KJUR.asn1.DERSet,KJUR.asn1.DERAbstractStructured);KJUR.asn1.DERTaggedObject=function(a){KJUR.asn1.DERTaggedObject.superclass.constructor.call(this);this.hT="a0";this.hV="";this.isExplicit=true;this.asn1Object=null;this.setASN1Object=function(b,c,d){this.hT=c;this.isExplicit=b;this.asn1Object=d;if(this.isExplicit){this.hV=this.asn1Object.getEncodedHex();this.hTLV=null;this.isModified=true}else{this.hV=null;this.hTLV=d.getEncodedHex();this.hTLV=this.hTLV.replace(/^../,c);this.isModified=false}};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a.tag!="undefined"){this.hT=a.tag}if(typeof a.explicit!="undefined"){this.isExplicit=a.explicit}if(typeof a.obj!="undefined"){this.asn1Object=a.obj;this.setASN1Object(this.isExplicit,this.hT,this.asn1Object)}}};YAHOO.lang.extend(KJUR.asn1.DERTaggedObject,KJUR.asn1.ASN1Object);
var ASN1HEX=new function(){};ASN1HEX.getLblen=function(c,a){if(c.substr(a+2,1)!="8"){return 1}var b=parseInt(c.substr(a+3,1));if(b==0){return -1}if(0<b&&b<10){return b+1}return -2};ASN1HEX.getL=function(c,b){var a=ASN1HEX.getLblen(c,b);if(a<1){return""}return c.substr(b+2,a*2)};ASN1HEX.getVblen=function(d,a){var c,b;c=ASN1HEX.getL(d,a);if(c==""){return -1}if(c.substr(0,1)==="8"){b=new BigInteger(c.substr(2),16)}else{b=new BigInteger(c,16)}return b.intValue()};ASN1HEX.getVidx=function(c,b){var a=ASN1HEX.getLblen(c,b);if(a<0){return a}return b+(a+1)*2};ASN1HEX.getV=function(d,a){var c=ASN1HEX.getVidx(d,a);var b=ASN1HEX.getVblen(d,a);return d.substr(c,b*2)};ASN1HEX.getTLV=function(b,a){return b.substr(a,2)+ASN1HEX.getL(b,a)+ASN1HEX.getV(b,a)};ASN1HEX.getNextSiblingIdx=function(d,a){var c=ASN1HEX.getVidx(d,a);var b=ASN1HEX.getVblen(d,a);return c+b*2};ASN1HEX.getChildIdx=function(e,f){var j=ASN1HEX;var g=new Array();var i=j.getVidx(e,f);if(e.substr(f,2)=="03"){g.push(i+2)}else{g.push(i)}var l=j.getVblen(e,f);var c=i;var d=0;while(1){var b=j.getNextSiblingIdx(e,c);if(b==null||(b-i>=(l*2))){break}if(d>=200){break}g.push(b);c=b;d++}return g};ASN1HEX.getNthChildIdx=function(d,b,e){var c=ASN1HEX.getChildIdx(d,b);return c[e]};ASN1HEX.getIdxbyList=function(e,d,c,i){var g=ASN1HEX;var f,b;if(c.length==0){if(i!==undefined){if(e.substr(d,2)!==i){throw Error("checking tag doesn't match: "+e.substr(d,2)+"!="+i)}}return d}f=c.shift();b=g.getChildIdx(e,d);return g.getIdxbyList(e,b[f],c,i)};ASN1HEX.getIdxbyListEx=function(f,k,b,g){var m=ASN1HEX;var d,l;if(b.length==0){if(g!==undefined){if(f.substr(k,2)!==g){return -1}}return k}d=b.shift();l=m.getChildIdx(f,k);var j=0;for(var e=0;e<l.length;e++){var c=f.substr(l[e],2);if((typeof d=="number"&&(!m.isContextTag(c))&&j==d)||(typeof d=="string"&&m.isContextTag(c,d))){return m.getIdxbyListEx(f,l[e],b,g)}if(!m.isContextTag(c)){j++}}return -1};ASN1HEX.getTLVbyList=function(d,c,b,f){var e=ASN1HEX;var a=e.getIdxbyList(d,c,b);if(a===undefined){throw new Error("can't find nthList object")}if(f!==undefined){if(d.substr(a,2)!=f){throw new Error("checking tag doesn't match: "+d.substr(a,2)+"!="+f)}}return e.getTLV(d,a)};ASN1HEX.getTLVbyListEx=function(d,c,b,f){var e=ASN1HEX;var a=e.getIdxbyListEx(d,c,b,f);if(a==-1){return null}return e.getTLV(d,a)};ASN1HEX.getVbyList=function(e,c,b,g,i){var f=ASN1HEX;var a,d;a=f.getIdxbyList(e,c,b,g);if(a===undefined){throw"can't find nthList object"}d=f.getV(e,a);if(i===true){d=d.substr(2)}return d};ASN1HEX.getVbyListEx=function(b,e,a,d,f){var j=ASN1HEX;var g,c,i;g=j.getIdxbyListEx(b,e,a,d);if(g==-1){return null}i=j.getV(b,g);if(b.substr(g,2)=="03"&&f!==false){i=i.substr(2)}return i};ASN1HEX.hextooidstr=function(e){var h=function(b,a){if(b.length>=a){return b}return new Array(a-b.length+1).join("0")+b};var l=[];var o=e.substr(0,2);var f=parseInt(o,16);l[0]=new String(Math.floor(f/40));l[1]=new String(f%40);var m=e.substr(2);var k=[];for(var g=0;g<m.length/2;g++){k.push(parseInt(m.substr(g*2,2),16))}var j=[];var d="";for(var g=0;g<k.length;g++){if(k[g]&128){d=d+h((k[g]&127).toString(2),7)}else{d=d+h((k[g]&127).toString(2),7);j.push(new String(parseInt(d,2)));d=""}}var n=l.join(".");if(j.length>0){n=n+"."+j.join(".")}return n};ASN1HEX.dump=function(t,c,l,g){var p=ASN1HEX;var j=p.getV;var y=p.dump;var w=p.getChildIdx;var e=t;if(t instanceof KJUR.asn1.ASN1Object){e=t.getEncodedHex()}var q=function(A,i){if(A.length<=i*2){return A}else{var v=A.substr(0,i)+"..(total "+A.length/2+"bytes).."+A.substr(A.length-i,i);return v}};if(c===undefined){c={ommit_long_octet:32}}if(l===undefined){l=0}if(g===undefined){g=""}var x=c.ommit_long_octet;var z=e.substr(l,2);if(z=="01"){var h=j(e,l);if(h=="00"){return g+"BOOLEAN FALSE\n"}else{return g+"BOOLEAN TRUE\n"}}if(z=="02"){var h=j(e,l);return g+"INTEGER "+q(h,x)+"\n"}if(z=="03"){var h=j(e,l);if(p.isASN1HEX(h.substr(2))){var k=g+"BITSTRING, encapsulates\n";k=k+y(h.substr(2),c,0,g+"  ");return k}else{return g+"BITSTRING "+q(h,x)+"\n"}}if(z=="04"){var h=j(e,l);if(p.isASN1HEX(h)){var k=g+"OCTETSTRING, encapsulates\n";k=k+y(h,c,0,g+"  ");return k}else{return g+"OCTETSTRING "+q(h,x)+"\n"}}if(z=="05"){return g+"NULL\n"}if(z=="06"){var m=j(e,l);var b=KJUR.asn1.ASN1Util.oidHexToInt(m);var o=KJUR.asn1.x509.OID.oid2name(b);var a=b.replace(/\./g," ");if(o!=""){return g+"ObjectIdentifier "+o+" ("+a+")\n"}else{return g+"ObjectIdentifier ("+a+")\n"}}if(z=="0c"){return g+"UTF8String '"+hextoutf8(j(e,l))+"'\n"}if(z=="13"){return g+"PrintableString '"+hextoutf8(j(e,l))+"'\n"}if(z=="14"){return g+"TeletexString '"+hextoutf8(j(e,l))+"'\n"}if(z=="16"){return g+"IA5String '"+hextoutf8(j(e,l))+"'\n"}if(z=="17"){return g+"UTCTime "+hextoutf8(j(e,l))+"\n"}if(z=="18"){return g+"GeneralizedTime "+hextoutf8(j(e,l))+"\n"}if(z=="1a"){return g+"VisualString '"+hextoutf8(j(e,l))+"'\n"}if(z=="1e"){return g+"BMPString '"+hextoutf8(j(e,l))+"'\n"}if(z=="30"){if(e.substr(l,4)=="3000"){return g+"SEQUENCE {}\n"}var k=g+"SEQUENCE\n";var d=w(e,l);var f=c;if((d.length==2||d.length==3)&&e.substr(d[0],2)=="06"&&e.substr(d[d.length-1],2)=="04"){var o=p.oidname(j(e,d[0]));var r=JSON.parse(JSON.stringify(c));r.x509ExtName=o;f=r}for(var u=0;u<d.length;u++){k=k+y(e,f,d[u],g+"  ")}return k}if(z=="31"){var k=g+"SET\n";var d=w(e,l);for(var u=0;u<d.length;u++){k=k+y(e,c,d[u],g+"  ")}return k}var z=parseInt(z,16);if((z&128)!=0){var n=z&31;if((z&32)!=0){var k=g+"["+n+"]\n";var d=w(e,l);for(var u=0;u<d.length;u++){k=k+y(e,c,d[u],g+"  ")}return k}else{var h=j(e,l);if(h.substr(0,8)=="68747470"){h=hextoutf8(h)}if(c.x509ExtName==="subjectAltName"&&n==2){h=hextoutf8(h)}var k=g+"["+n+"] "+h+"\n";return k}}return g+"UNKNOWN("+z+") "+j(e,l)+"\n"};ASN1HEX.isContextTag=function(c,b){c=c.toLowerCase();var f,e;try{f=parseInt(c,16)}catch(d){return -1}if(b===undefined){if((f&192)==128){return true}else{return false}}try{var a=b.match(/^\[[0-9]+\]$/);if(a==null){return false}e=parseInt(b.substr(1,b.length-1),10);if(e>31){return false}if(((f&192)==128)&&((f&31)==e)){return true}return false}catch(d){return false}};ASN1HEX.isASN1HEX=function(e){var d=ASN1HEX;if(e.length%2==1){return false}var c=d.getVblen(e,0);var b=e.substr(0,2);var f=d.getL(e,0);var a=e.length-b.length-f.length;if(a==c*2){return true}return false};ASN1HEX.checkStrictDER=function(g,o,d,c,r){var s=ASN1HEX;if(d===undefined){if(typeof g!="string"){throw new Error("not hex string")}g=g.toLowerCase();if(!KJUR.lang.String.isHex(g)){throw new Error("not hex string")}d=g.length;c=g.length/2;if(c<128){r=1}else{r=Math.ceil(c.toString(16))+1}}var k=s.getL(g,o);if(k.length>r*2){throw new Error("L of TLV too long: idx="+o)}var n=s.getVblen(g,o);if(n>c){throw new Error("value of L too long than hex: idx="+o)}var q=s.getTLV(g,o);var f=q.length-2-s.getL(g,o).length;if(f!==(n*2)){throw new Error("V string length and L's value not the same:"+f+"/"+(n*2))}if(o===0){if(g.length!=q.length){throw new Error("total length and TLV length unmatch:"+g.length+"!="+q.length)}}var b=g.substr(o,2);if(b==="02"){var a=s.getVidx(g,o);if(g.substr(a,2)=="00"&&g.charCodeAt(a+2)<56){throw new Error("not least zeros for DER INTEGER")}}if(parseInt(b,16)&32){var p=s.getVblen(g,o);var m=0;var l=s.getChildIdx(g,o);for(var e=0;e<l.length;e++){var j=s.getTLV(g,l[e]);m+=j.length;s.checkStrictDER(g,l[e],d,c,r)}if((p*2)!=m){throw new Error("sum of children's TLV length and L unmatch: "+(p*2)+"!="+m)}}};ASN1HEX.oidname=function(a){var c=KJUR.asn1;if(KJUR.lang.String.isHex(a)){a=c.ASN1Util.oidHexToInt(a)}var b=c.x509.OID.oid2name(a);if(b===""){b=a}return b};
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}if(typeof KJUR.asn1.x509=="undefined"||!KJUR.asn1.x509){KJUR.asn1.x509={}}KJUR.asn1.x509.Certificate=function(e){KJUR.asn1.x509.Certificate.superclass.constructor.call(this);var a=null,j=null,h=null,k=null,i=null,b=KJUR,f=b.crypto,g=b.asn1,d=g.DERSequence,c=g.DERBitString;this.sign=function(){this.asn1SignatureAlg=this.asn1TBSCert.asn1SignatureAlg;var m=new KJUR.crypto.Signature({alg:this.asn1SignatureAlg.nameAlg});m.init(this.prvKey);m.updateHex(this.asn1TBSCert.getEncodedHex());this.hexSig=m.sign();this.asn1Sig=new c({hex:"00"+this.hexSig});var l=new d({array:[this.asn1TBSCert,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=l.getEncodedHex();this.isModified=false};this.setSignatureHex=function(l){this.asn1SignatureAlg=this.asn1TBSCert.asn1SignatureAlg;this.hexSig=l;this.asn1Sig=new c({hex:"00"+this.hexSig});var m=new d({array:[this.asn1TBSCert,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=m.getEncodedHex();this.isModified=false};this.getEncodedHex=function(){if(this.isModified==false&&this.hTLV!=null){return this.hTLV}throw"not signed yet"};this.getPEMString=function(){var l=hextob64nl(this.getEncodedHex());return"-----BEGIN CERTIFICATE-----\r\n"+l+"\r\n-----END CERTIFICATE-----\r\n"};if(e!==undefined){if(e.tbscertobj!==undefined){this.asn1TBSCert=e.tbscertobj}if(e.prvkeyobj!==undefined){this.prvKey=e.prvkeyobj}}};YAHOO.lang.extend(KJUR.asn1.x509.Certificate,KJUR.asn1.ASN1Object);KJUR.asn1.x509.TBSCertificate=function(e){KJUR.asn1.x509.TBSCertificate.superclass.constructor.call(this);var b=KJUR,i=b.asn1,f=i.DERSequence,h=i.DERInteger,c=i.DERTaggedObject,d=i.x509,g=d.Time,a=d.X500Name,j=d.SubjectPublicKeyInfo;this._initialize=function(){this.asn1Array=new Array();this.asn1Version=new c({obj:new h({"int":2})});this.asn1SerialNumber=null;this.asn1SignatureAlg=null;this.asn1Issuer=null;this.asn1NotBefore=null;this.asn1NotAfter=null;this.asn1Subject=null;this.asn1SubjPKey=null;this.extensionsArray=new Array()};this.setSerialNumberByParam=function(k){this.asn1SerialNumber=new h(k)};this.setSignatureAlgByParam=function(k){this.asn1SignatureAlg=new d.AlgorithmIdentifier(k)};this.setIssuerByParam=function(k){this.asn1Issuer=new a(k)};this.setNotBeforeByParam=function(k){this.asn1NotBefore=new g(k)};this.setNotAfterByParam=function(k){this.asn1NotAfter=new g(k)};this.setSubjectByParam=function(k){this.asn1Subject=new a(k)};this.setSubjectPublicKey=function(k){this.asn1SubjPKey=new j(k)};this.setSubjectPublicKeyByGetKey=function(l){var k=KEYUTIL.getKey(l);this.asn1SubjPKey=new j(k)};this.appendExtension=function(k){this.extensionsArray.push(k)};this.appendExtensionByName=function(l,k){KJUR.asn1.x509.Extension.appendByNameToArray(l,k,this.extensionsArray)};this.getEncodedHex=function(){if(this.asn1NotBefore==null||this.asn1NotAfter==null){throw"notBefore and/or notAfter not set"}var l=new f({array:[this.asn1NotBefore,this.asn1NotAfter]});this.asn1Array=new Array();this.asn1Array.push(this.asn1Version);this.asn1Array.push(this.asn1SerialNumber);this.asn1Array.push(this.asn1SignatureAlg);this.asn1Array.push(this.asn1Issuer);this.asn1Array.push(l);this.asn1Array.push(this.asn1Subject);this.asn1Array.push(this.asn1SubjPKey);if(this.extensionsArray.length>0){var m=new f({array:this.extensionsArray});var k=new c({explicit:true,tag:"a3",obj:m});this.asn1Array.push(k)}var n=new f({array:this.asn1Array});this.hTLV=n.getEncodedHex();this.isModified=false;return this.hTLV};this._initialize()};YAHOO.lang.extend(KJUR.asn1.x509.TBSCertificate,KJUR.asn1.ASN1Object);KJUR.asn1.x509.Extension=function(d){KJUR.asn1.x509.Extension.superclass.constructor.call(this);var f=null,a=KJUR,e=a.asn1,h=e.DERObjectIdentifier,i=e.DEROctetString,b=e.DERBitString,g=e.DERBoolean,c=e.DERSequence;this.getEncodedHex=function(){var m=new h({oid:this.oid});var l=new i({hex:this.getExtnValueHex()});var k=new Array();k.push(m);if(this.critical){k.push(new g())}k.push(l);var j=new c({array:k});return j.getEncodedHex()};this.critical=false;if(d!==undefined){if(d.critical!==undefined){this.critical=d.critical}}};YAHOO.lang.extend(KJUR.asn1.x509.Extension,KJUR.asn1.ASN1Object);KJUR.asn1.x509.Extension.appendByNameToArray=function(e,c,b){var g=e.toLowerCase(),f=KJUR.asn1.x509;if(g=="basicconstraints"){var d=new f.BasicConstraints(c);b.push(d)}else{if(g=="keyusage"){var d=new f.KeyUsage(c);b.push(d)}else{if(g=="crldistributionpoints"){var d=new f.CRLDistributionPoints(c);b.push(d)}else{if(g=="extkeyusage"){var d=new f.ExtKeyUsage(c);b.push(d)}else{if(g=="authoritykeyidentifier"){var d=new f.AuthorityKeyIdentifier(c);b.push(d)}else{if(g=="subjectkeyidentifier"){var d=new f.SubjectKeyIdentifier(c);b.push(d)}else{if(g=="authorityinfoaccess"){var d=new f.AuthorityInfoAccess(c);b.push(d)}else{if(g=="subjectaltname"){var d=new f.SubjectAltName(c);b.push(d)}else{if(g=="issueraltname"){var d=new f.IssuerAltName(c);b.push(d)}else{if(g=="certificatepolicies"){var d=new f.CertificatePolicies(c);b.push(d)}else{throw new Error("unsupported extension name: "+e)}}}}}}}}}}};KJUR.asn1.x509.KeyUsage=function(f){KJUR.asn1.x509.KeyUsage.superclass.constructor.call(this,f);var a=X509.KEYUSAGE_NAME;this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.15";if(f!==undefined){if(f.bin!==undefined){this.asn1ExtnValue=new KJUR.asn1.DERBitString(f)}if(f.names!==undefined&&f.names.length!==undefined){var e=f.names;var d="000000000";for(var c=0;c<e.length;c++){for(var b=0;b<a.length;b++){if(e[c]===a[b]){d=d.substring(0,b)+"1"+d.substring(b+1,d.length)}}}this.asn1ExtnValue=new KJUR.asn1.DERBitString({bin:d})}}};YAHOO.lang.extend(KJUR.asn1.x509.KeyUsage,KJUR.asn1.x509.Extension);KJUR.asn1.x509.BasicConstraints=function(c){KJUR.asn1.x509.BasicConstraints.superclass.constructor.call(this,c);var a=false;var b=-1;this.getExtnValueHex=function(){var e=new Array();if(this.cA){e.push(new KJUR.asn1.DERBoolean())}if(this.pathLen>-1){e.push(new KJUR.asn1.DERInteger({"int":this.pathLen}))}var d=new KJUR.asn1.DERSequence({array:e});this.asn1ExtnValue=d;return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.19";this.cA=false;this.pathLen=-1;if(c!==undefined){if(c.cA!==undefined){this.cA=c.cA}if(c.pathLen!==undefined){this.pathLen=c.pathLen}}};YAHOO.lang.extend(KJUR.asn1.x509.BasicConstraints,KJUR.asn1.x509.Extension);KJUR.asn1.x509.CRLDistributionPoints=function(d){KJUR.asn1.x509.CRLDistributionPoints.superclass.constructor.call(this,d);var b=KJUR,a=b.asn1,c=a.x509;this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.setByDPArray=function(e){this.asn1ExtnValue=new a.DERSequence({array:e})};this.setByOneURI=function(h){var e=new c.GeneralNames([{uri:h}]);var g=new c.DistributionPointName(e);var f=new c.DistributionPoint({dpobj:g});this.setByDPArray([f])};this.oid="2.5.29.31";if(d!==undefined){if(d.array!==undefined){this.setByDPArray(d.array)}else{if(d.uri!==undefined){this.setByOneURI(d.uri)}}}};YAHOO.lang.extend(KJUR.asn1.x509.CRLDistributionPoints,KJUR.asn1.x509.Extension);KJUR.asn1.x509.CertificatePolicies=function(f){KJUR.asn1.x509.CertificatePolicies.superclass.constructor.call(this,f);var c=KJUR,b=c.asn1,e=b.x509,a=b.DERSequence,d=e.PolicyInformation;this.params=null;this.getExtnValueHex=function(){var j=[];for(var h=0;h<this.params.array.length;h++){j.push(new d(this.params.array[h]))}var g=new a({array:j});this.asn1ExtnValue=g;return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.32";if(f!==undefined){this.params=f}};YAHOO.lang.extend(KJUR.asn1.x509.CertificatePolicies,KJUR.asn1.x509.Extension);KJUR.asn1.x509.PolicyInformation=function(d){KJUR.asn1.x509.PolicyInformation.superclass.constructor.call(this,d);var c=KJUR.asn1,b=c.DERSequence,e=c.DERObjectIdentifier,a=c.x509.PolicyQualifierInfo;this.params=null;this.getEncodedHex=function(){if(this.params.policyoid===undefined&&this.params.array===undefined){throw new Error("parameter oid and array missing")}var f=[new e({oid:this.params.policyoid})];if(this.params.array!==undefined){var j=[];for(var h=0;h<this.params.array.length;h++){j.push(new a(this.params.array[h]))}if(j.length>0){f.push(new b({array:j}))}}var g=new b({array:f});return g.getEncodedHex()};if(d!==undefined){this.params=d}};YAHOO.lang.extend(KJUR.asn1.x509.PolicyInformation,KJUR.asn1.ASN1Object);KJUR.asn1.x509.PolicyQualifierInfo=function(e){KJUR.asn1.x509.PolicyQualifierInfo.superclass.constructor.call(this,e);var c=KJUR.asn1,b=c.DERSequence,d=c.DERIA5String,f=c.DERObjectIdentifier,a=c.x509.UserNotice;this.params=null;this.getEncodedHex=function(){if(this.params.cps!==undefined){var g=new b({array:[new f({oid:"1.3.6.1.5.5.7.2.1"}),new d({str:this.params.cps})]});return g.getEncodedHex()}if(this.params.unotice!=undefined){var g=new b({array:[new f({oid:"1.3.6.1.5.5.7.2.2"}),new a(this.params.unotice)]});return g.getEncodedHex()}};if(e!==undefined){this.params=e}};YAHOO.lang.extend(KJUR.asn1.x509.PolicyQualifierInfo,KJUR.asn1.ASN1Object);KJUR.asn1.x509.UserNotice=function(e){KJUR.asn1.x509.UserNotice.superclass.constructor.call(this,e);var a=KJUR.asn1.DERSequence,d=KJUR.asn1.DERInteger,c=KJUR.asn1.x509.DisplayText,b=KJUR.asn1.x509.NoticeReference;this.params=null;this.getEncodedHex=function(){var f=[];if(this.params.noticeref!==undefined){f.push(new b(this.params.noticeref))}if(this.params.exptext!==undefined){f.push(new c(this.params.exptext))}var g=new a({array:f});return g.getEncodedHex()};if(e!==undefined){this.params=e}};YAHOO.lang.extend(KJUR.asn1.x509.UserNotice,KJUR.asn1.ASN1Object);KJUR.asn1.x509.NoticeReference=function(d){KJUR.asn1.x509.NoticeReference.superclass.constructor.call(this,d);var a=KJUR.asn1.DERSequence,c=KJUR.asn1.DERInteger,b=KJUR.asn1.x509.DisplayText;this.params=null;this.getEncodedHex=function(){var f=[];if(this.params.org!==undefined){f.push(new b(this.params.org))}if(this.params.noticenum!==undefined){var h=[];var e=this.params.noticenum;for(var j=0;j<e.length;j++){h.push(new c(e[j]))}f.push(new a({array:h}))}if(f.length==0){throw new Error("parameter is empty")}var g=new a({array:f});return g.getEncodedHex()};if(d!==undefined){this.params=d}};YAHOO.lang.extend(KJUR.asn1.x509.NoticeReference,KJUR.asn1.ASN1Object);KJUR.asn1.x509.DisplayText=function(a){KJUR.asn1.x509.DisplayText.superclass.constructor.call(this,a);this.hT="0c";if(a!==undefined){if(a.type==="ia5"){this.hT="16"}else{if(a.type==="vis"){this.hT="1a"}else{if(a.type==="bmp"){this.hT="1e"}}}}};YAHOO.lang.extend(KJUR.asn1.x509.DisplayText,KJUR.asn1.DERAbstractString);KJUR.asn1.x509.ExtKeyUsage=function(c){KJUR.asn1.x509.ExtKeyUsage.superclass.constructor.call(this,c);var b=KJUR,a=b.asn1;this.setPurposeArray=function(d){this.asn1ExtnValue=new a.DERSequence();for(var e=0;e<d.length;e++){var f=new a.DERObjectIdentifier(d[e]);this.asn1ExtnValue.appendASN1Object(f)}};this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.37";if(c!==undefined){if(c.array!==undefined){this.setPurposeArray(c.array)}}};YAHOO.lang.extend(KJUR.asn1.x509.ExtKeyUsage,KJUR.asn1.x509.Extension);KJUR.asn1.x509.AuthorityKeyIdentifier=function(f){KJUR.asn1.x509.AuthorityKeyIdentifier.superclass.constructor.call(this,f);var b=KJUR,a=b.asn1,d=a.DERTaggedObject,e=a.x509.GeneralNames,c=b.crypto.Util.isKey;this.asn1KID=null;this.asn1CertIssuer=null;this.asn1CertSN=null;this.getExtnValueHex=function(){var h=new Array();if(this.asn1KID){h.push(new d({explicit:false,tag:"80",obj:this.asn1KID}))}if(this.asn1CertIssuer){h.push(new d({explicit:false,tag:"a1",obj:new e([{dn:this.asn1CertIssuer}])}))}if(this.asn1CertSN){h.push(new d({explicit:false,tag:"82",obj:this.asn1CertSN}))}var g=new a.DERSequence({array:h});this.asn1ExtnValue=g;return this.asn1ExtnValue.getEncodedHex()};this.setKIDByParam=function(i){if(i.str!==undefined||i.hex!==undefined){this.asn1KID=new KJUR.asn1.DEROctetString(i)}else{if((typeof i==="object"&&KJUR.crypto.Util.isKey(i))||(typeof i==="string"&&i.indexOf("BEGIN ")!=-1)){var h=i;if(typeof i==="string"){h=KEYUTIL.getKey(i)}var g=KEYUTIL.getKeyID(h);this.asn1KID=new KJUR.asn1.DEROctetString({hex:g})}}};this.setCertIssuerByParam=function(g){if(g.str!==undefined||g.ldapstr!==undefined||g.hex!==undefined||g.certsubject!==undefined||g.certissuer!==undefined){this.asn1CertIssuer=new KJUR.asn1.x509.X500Name(g)}else{if(typeof g==="string"&&g.indexOf("BEGIN ")!=-1&&g.indexOf("CERTIFICATE")!=-1){this.asn1CertIssuer=new KJUR.asn1.x509.X500Name({certissuer:g})}}};this.setCertSNByParam=function(i){if(i.str!==undefined||i.bigint!==undefined||i.hex!==undefined){this.asn1CertSN=new KJUR.asn1.DERInteger(i)}else{if(typeof i==="string"&&i.indexOf("BEGIN ")!=-1&&i.indexOf("CERTIFICATE")){var g=new X509();g.readCertPEM(i);var h=g.getSerialNumberHex();this.asn1CertSN=new KJUR.asn1.DERInteger({hex:h})}}};this.oid="2.5.29.35";if(f!==undefined){if(f.kid!==undefined){this.setKIDByParam(f.kid)}if(f.issuer!==undefined){this.setCertIssuerByParam(f.issuer)}if(f.sn!==undefined){this.setCertSNByParam(f.sn)}if(f.issuersn!==undefined&&typeof f.issuersn==="string"&&f.issuersn.indexOf("BEGIN ")!=-1&&f.issuersn.indexOf("CERTIFICATE")){this.setCertSNByParam(f.issuersn);this.setCertIssuerByParam(f.issuersn)}}};YAHOO.lang.extend(KJUR.asn1.x509.AuthorityKeyIdentifier,KJUR.asn1.x509.Extension);KJUR.asn1.x509.SubjectKeyIdentifier=function(d){KJUR.asn1.x509.SubjectKeyIdentifier.superclass.constructor.call(this,d);var b=KJUR,a=b.asn1,c=a.DEROctetString;this.asn1KID=null;this.getExtnValueHex=function(){this.asn1ExtnValue=this.asn1KID;return this.asn1ExtnValue.getEncodedHex()};this.setKIDByParam=function(g){if(g.str!==undefined||g.hex!==undefined){this.asn1KID=new c(g)}else{if((typeof g==="object"&&KJUR.crypto.Util.isKey(g))||(typeof g==="string"&&g.indexOf("BEGIN")!=-1)){var f=g;if(typeof g==="string"){f=KEYUTIL.getKey(g)}var e=KEYUTIL.getKeyID(f);this.asn1KID=new KJUR.asn1.DEROctetString({hex:e})}}};this.oid="2.5.29.14";if(d!==undefined){if(d.kid!==undefined){this.setKIDByParam(d.kid)}}};YAHOO.lang.extend(KJUR.asn1.x509.SubjectKeyIdentifier,KJUR.asn1.x509.Extension);KJUR.asn1.x509.AuthorityInfoAccess=function(a){KJUR.asn1.x509.AuthorityInfoAccess.superclass.constructor.call(this,a);this.setAccessDescriptionArray=function(k){var j=new Array(),b=KJUR,g=b.asn1,d=g.DERSequence;for(var f=0;f<k.length;f++){var c=new g.DERObjectIdentifier(k[f].accessMethod);var e=new g.x509.GeneralName(k[f].accessLocation);var h=new d({array:[c,e]});j.push(h)}this.asn1ExtnValue=new d({array:j})};this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="1.3.6.1.5.5.7.1.1";if(a!==undefined){if(a.array!==undefined){this.setAccessDescriptionArray(a.array)}}};YAHOO.lang.extend(KJUR.asn1.x509.AuthorityInfoAccess,KJUR.asn1.x509.Extension);KJUR.asn1.x509.SubjectAltName=function(a){KJUR.asn1.x509.SubjectAltName.superclass.constructor.call(this,a);this.setNameArray=function(b){this.asn1ExtnValue=new KJUR.asn1.x509.GeneralNames(b)};this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.17";if(a!==undefined){if(a.array!==undefined){this.setNameArray(a.array)}}};YAHOO.lang.extend(KJUR.asn1.x509.SubjectAltName,KJUR.asn1.x509.Extension);KJUR.asn1.x509.IssuerAltName=function(a){KJUR.asn1.x509.IssuerAltName.superclass.constructor.call(this,a);this.setNameArray=function(b){this.asn1ExtnValue=new KJUR.asn1.x509.GeneralNames(b)};this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.18";if(a!==undefined){if(a.array!==undefined){this.setNameArray(a.array)}}};YAHOO.lang.extend(KJUR.asn1.x509.IssuerAltName,KJUR.asn1.x509.Extension);KJUR.asn1.x509.CRL=function(f){KJUR.asn1.x509.CRL.superclass.constructor.call(this);var b=null,d=null,e=null,c=null,a=null;this.sign=function(){this.asn1SignatureAlg=this.asn1TBSCertList.asn1SignatureAlg;sig=new KJUR.crypto.Signature({alg:this.asn1SignatureAlg.nameAlg,prov:"cryptojs/jsrsa"});sig.init(this.prvKey);sig.updateHex(this.asn1TBSCertList.getEncodedHex());this.hexSig=sig.sign();this.asn1Sig=new KJUR.asn1.DERBitString({hex:"00"+this.hexSig});var g=new KJUR.asn1.DERSequence({array:[this.asn1TBSCertList,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=g.getEncodedHex();this.isModified=false};this.getEncodedHex=function(){if(this.isModified==false&&this.hTLV!=null){return this.hTLV}throw"not signed yet"};this.getPEMString=function(){var g=hextob64nl(this.getEncodedHex());return"-----BEGIN X509 CRL-----\r\n"+g+"\r\n-----END X509 CRL-----\r\n"};if(f!==undefined){if(f.tbsobj!==undefined){this.asn1TBSCertList=f.tbsobj}if(f.prvkeyobj!==undefined){this.prvKey=f.prvkeyobj}}};YAHOO.lang.extend(KJUR.asn1.x509.CRL,KJUR.asn1.ASN1Object);KJUR.asn1.x509.TBSCertList=function(g){KJUR.asn1.x509.TBSCertList.superclass.constructor.call(this);var e=null,d=KJUR,c=d.asn1,b=c.DERSequence,f=c.x509,a=f.Time;this.setSignatureAlgByParam=function(h){this.asn1SignatureAlg=new f.AlgorithmIdentifier(h)};this.setIssuerByParam=function(h){this.asn1Issuer=new f.X500Name(h)};this.setThisUpdateByParam=function(h){this.asn1ThisUpdate=new a(h)};this.setNextUpdateByParam=function(h){this.asn1NextUpdate=new a(h)};this.addRevokedCert=function(h,i){var k={};if(h!=undefined&&h!=null){k.sn=h}if(i!=undefined&&i!=null){k.time=i}var j=new f.CRLEntry(k);this.aRevokedCert.push(j)};this.getEncodedHex=function(){this.asn1Array=new Array();if(this.asn1Version!=null){this.asn1Array.push(this.asn1Version)}this.asn1Array.push(this.asn1SignatureAlg);this.asn1Array.push(this.asn1Issuer);this.asn1Array.push(this.asn1ThisUpdate);if(this.asn1NextUpdate!=null){this.asn1Array.push(this.asn1NextUpdate)}if(this.aRevokedCert.length>0){var h=new b({array:this.aRevokedCert});this.asn1Array.push(h)}var i=new b({array:this.asn1Array});this.hTLV=i.getEncodedHex();this.isModified=false;return this.hTLV};this._initialize=function(){this.asn1Version=null;this.asn1SignatureAlg=null;this.asn1Issuer=null;this.asn1ThisUpdate=null;this.asn1NextUpdate=null;this.aRevokedCert=new Array()};this._initialize()};YAHOO.lang.extend(KJUR.asn1.x509.TBSCertList,KJUR.asn1.ASN1Object);KJUR.asn1.x509.CRLEntry=function(e){KJUR.asn1.x509.CRLEntry.superclass.constructor.call(this);var d=null,c=null,b=KJUR,a=b.asn1;this.setCertSerial=function(f){this.sn=new a.DERInteger(f)};this.setRevocationDate=function(f){this.time=new a.x509.Time(f)};this.getEncodedHex=function(){var f=new a.DERSequence({array:[this.sn,this.time]});this.TLV=f.getEncodedHex();return this.TLV};if(e!==undefined){if(e.time!==undefined){this.setRevocationDate(e.time)}if(e.sn!==undefined){this.setCertSerial(e.sn)}}};YAHOO.lang.extend(KJUR.asn1.x509.CRLEntry,KJUR.asn1.ASN1Object);KJUR.asn1.x509.X500Name=function(f){KJUR.asn1.x509.X500Name.superclass.constructor.call(this);this.asn1Array=new Array();var d=KJUR,c=d.asn1,e=c.x509,b=pemtohex;this.setByString=function(g){var k=g.split("/");k.shift();var j=[];for(var l=0;l<k.length;l++){if(k[l].match(/^[^=]+=.+$/)){j.push(k[l])}else{var h=j.length-1;j[h]=j[h]+"/"+k[l]}}for(var l=0;l<j.length;l++){this.asn1Array.push(new e.RDN({str:j[l]}))}};this.setByLdapString=function(g){var h=e.X500Name.ldapToCompat(g);this.setByString(h)};this.setByObject=function(i){for(var g in i){if(i.hasOwnProperty(g)){var h=new KJUR.asn1.x509.RDN({str:g+"="+i[g]});this.asn1Array?this.asn1Array.push(h):this.asn1Array=[h]}}};this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}var g=new c.DERSequence({array:this.asn1Array});this.hTLV=g.getEncodedHex();return this.hTLV};if(f!==undefined){if(f.str!==undefined){this.setByString(f.str)}else{if(f.ldapstr!==undefined){this.setByLdapString(f.ldapstr)}else{if(f.hex!==undefined){this.hTLV=f.hex}else{if(f.certissuer!==undefined){var a=new X509();a.readCertPEM(f.certissuer);this.hTLV=a.getIssuerHex()}else{if(f.certsubject!==undefined){var a=new X509();a.readCertPEM(f.certsubject);this.hTLV=a.getSubjectHex()}else{if(typeof f==="object"&&f.certsubject===undefined&&f.certissuer===undefined){this.setByObject(f)}}}}}}}};YAHOO.lang.extend(KJUR.asn1.x509.X500Name,KJUR.asn1.ASN1Object);KJUR.asn1.x509.X500Name.compatToLDAP=function(d){if(d.substr(0,1)!=="/"){throw"malformed input"}var b="";d=d.substr(1);var c=d.split("/");c.reverse();c=c.map(function(a){return a.replace(/,/,"\\,")});return c.join(",")};KJUR.asn1.x509.X500Name.onelineToLDAP=function(a){return KJUR.asn1.x509.X500Name.compatToLDAP(a)};KJUR.asn1.x509.X500Name.ldapToCompat=function(g){var c=g.split(",");var e=false;var b=[];for(var f=0;c.length>0;f++){var h=c.shift();if(e===true){var d=b.pop();var j=(d+","+h).replace(/\\,/g,",");b.push(j);e=false}else{b.push(h)}if(h.substr(-1,1)==="\\"){e=true}}b=b.map(function(a){return a.replace("/","\\/")});b.reverse();return"/"+b.join("/")};KJUR.asn1.x509.X500Name.ldapToOneline=function(a){return KJUR.asn1.x509.X500Name.ldapToCompat(a)};KJUR.asn1.x509.RDN=function(a){KJUR.asn1.x509.RDN.superclass.constructor.call(this);this.asn1Array=new Array();this.addByString=function(b){this.asn1Array.push(new KJUR.asn1.x509.AttributeTypeAndValue({str:b}))};this.addByMultiValuedString=function(d){var b=KJUR.asn1.x509.RDN.parseString(d);for(var c=0;c<b.length;c++){this.addByString(b[c])}};this.getEncodedHex=function(){var b=new KJUR.asn1.DERSet({array:this.asn1Array});this.TLV=b.getEncodedHex();return this.TLV};if(a!==undefined){if(a.str!==undefined){this.addByMultiValuedString(a.str)}}};YAHOO.lang.extend(KJUR.asn1.x509.RDN,KJUR.asn1.ASN1Object);KJUR.asn1.x509.RDN.parseString=function(m){var j=m.split(/\+/);var h=false;var c=[];for(var g=0;j.length>0;g++){var k=j.shift();if(h===true){var f=c.pop();var d=(f+"+"+k).replace(/\\\+/g,"+");c.push(d);h=false}else{c.push(k)}if(k.substr(-1,1)==="\\"){h=true}}var l=false;var b=[];for(var g=0;c.length>0;g++){var k=c.shift();if(l===true){var e=b.pop();if(k.match(/"$/)){var d=(e+"+"+k).replace(/^([^=]+)="(.*)"$/,"$1=$2");b.push(d);l=false}else{b.push(e+"+"+k)}}else{b.push(k)}if(k.match(/^[^=]+="/)){l=true}}return b};KJUR.asn1.x509.AttributeTypeAndValue=function(d){KJUR.asn1.x509.AttributeTypeAndValue.superclass.constructor.call(this);var f=null,e=null,a="utf8",c=KJUR,b=c.asn1;this.setByString=function(h){var g=h.match(/^([^=]+)=(.+)$/);if(g){this.setByAttrTypeAndValueStr(g[1],g[2])}else{throw"malformed attrTypeAndValueStr: "+h}};this.setByAttrTypeAndValueStr=function(i,h){this.typeObj=KJUR.asn1.x509.OID.atype2obj(i);var g=a;if(i=="C"){g="prn"}this.valueObj=this.getValueObj(g,h)};this.getValueObj=function(h,g){if(h=="utf8"){return new b.DERUTF8String({str:g})}if(h=="prn"){return new b.DERPrintableString({str:g})}if(h=="tel"){return new b.DERTeletexString({str:g})}if(h=="ia5"){return new b.DERIA5String({str:g})}throw"unsupported directory string type: type="+h+" value="+g};this.getEncodedHex=function(){var g=new b.DERSequence({array:[this.typeObj,this.valueObj]});this.TLV=g.getEncodedHex();return this.TLV};if(d!==undefined){if(d.str!==undefined){this.setByString(d.str)}}};YAHOO.lang.extend(KJUR.asn1.x509.AttributeTypeAndValue,KJUR.asn1.ASN1Object);KJUR.asn1.x509.SubjectPublicKeyInfo=function(f){KJUR.asn1.x509.SubjectPublicKeyInfo.superclass.constructor.call(this);var l=null,k=null,a=KJUR,j=a.asn1,i=j.DERInteger,b=j.DERBitString,m=j.DERObjectIdentifier,e=j.DERSequence,h=j.ASN1Util.newObject,d=j.x509,o=d.AlgorithmIdentifier,g=a.crypto,n=g.ECDSA,c=g.DSA;this.getASN1Object=function(){if(this.asn1AlgId==null||this.asn1SubjPKey==null){throw"algId and/or subjPubKey not set"}var p=new e({array:[this.asn1AlgId,this.asn1SubjPKey]});return p};this.getEncodedHex=function(){var p=this.getASN1Object();this.hTLV=p.getEncodedHex();return this.hTLV};this.setPubKey=function(q){try{if(q instanceof RSAKey){var u=h({seq:[{"int":{bigint:q.n}},{"int":{"int":q.e}}]});var s=u.getEncodedHex();this.asn1AlgId=new o({name:"rsaEncryption"});this.asn1SubjPKey=new b({hex:"00"+s})}}catch(p){}try{if(q instanceof KJUR.crypto.ECDSA){var r=new m({name:q.curveName});this.asn1AlgId=new o({name:"ecPublicKey",asn1params:r});this.asn1SubjPKey=new b({hex:"00"+q.pubKeyHex})}}catch(p){}try{if(q instanceof KJUR.crypto.DSA){var r=new h({seq:[{"int":{bigint:q.p}},{"int":{bigint:q.q}},{"int":{bigint:q.g}}]});this.asn1AlgId=new o({name:"dsa",asn1params:r});var t=new i({bigint:q.y});this.asn1SubjPKey=new b({hex:"00"+t.getEncodedHex()})}}catch(p){}};if(f!==undefined){this.setPubKey(f)}};YAHOO.lang.extend(KJUR.asn1.x509.SubjectPublicKeyInfo,KJUR.asn1.ASN1Object);KJUR.asn1.x509.Time=function(f){KJUR.asn1.x509.Time.superclass.constructor.call(this);var e=null,a=null,d=KJUR,c=d.asn1,b=c.DERUTCTime,g=c.DERGeneralizedTime;this.setTimeParams=function(h){this.timeParams=h};this.getEncodedHex=function(){var h=null;if(this.timeParams!=null){if(this.type=="utc"){h=new b(this.timeParams)}else{h=new g(this.timeParams)}}else{if(this.type=="utc"){h=new b()}else{h=new g()}}this.TLV=h.getEncodedHex();return this.TLV};this.type="utc";if(f!==undefined){if(f.type!==undefined){this.type=f.type}else{if(f.str!==undefined){if(f.str.match(/^[0-9]{12}Z$/)){this.type="utc"}if(f.str.match(/^[0-9]{14}Z$/)){this.type="gen"}}}this.timeParams=f}};YAHOO.lang.extend(KJUR.asn1.x509.Time,KJUR.asn1.ASN1Object);KJUR.asn1.x509.AlgorithmIdentifier=function(e){KJUR.asn1.x509.AlgorithmIdentifier.superclass.constructor.call(this);this.nameAlg=null;this.asn1Alg=null;this.asn1Params=null;this.paramEmpty=false;var b=KJUR,a=b.asn1,c=a.x509.AlgorithmIdentifier.PSSNAME2ASN1TLV;this.getEncodedHex=function(){if(this.nameAlg===null&&this.asn1Alg===null){throw new Error("algorithm not specified")}if(this.nameAlg!==null){var f=null;for(var h in c){if(h===this.nameAlg){f=c[h]}}if(f!==null){this.hTLV=f;return this.hTLV}}if(this.nameAlg!==null&&this.asn1Alg===null){this.asn1Alg=a.x509.OID.name2obj(this.nameAlg)}var g=[this.asn1Alg];if(this.asn1Params!==null){g.push(this.asn1Params)}var i=new a.DERSequence({array:g});this.hTLV=i.getEncodedHex();return this.hTLV};if(e!==undefined){if(e.name!==undefined){this.nameAlg=e.name}if(e.asn1params!==undefined){this.asn1Params=e.asn1params}if(e.paramempty!==undefined){this.paramEmpty=e.paramempty}}if(this.asn1Params===null&&this.paramEmpty===false&&this.nameAlg!==null){var d=this.nameAlg.toLowerCase();if(d.substr(-7,7)!=="withdsa"&&d.substr(-9,9)!=="withecdsa"){this.asn1Params=new a.DERNull()}}};YAHOO.lang.extend(KJUR.asn1.x509.AlgorithmIdentifier,KJUR.asn1.ASN1Object);KJUR.asn1.x509.AlgorithmIdentifier.PSSNAME2ASN1TLV={SHAwithRSAandMGF1:"300d06092a864886f70d01010a3000",SHA256withRSAandMGF1:"303d06092a864886f70d01010a3030a00d300b0609608648016503040201a11a301806092a864886f70d010108300b0609608648016503040201a203020120",SHA384withRSAandMGF1:"303d06092a864886f70d01010a3030a00d300b0609608648016503040202a11a301806092a864886f70d010108300b0609608648016503040202a203020130",SHA512withRSAandMGF1:"303d06092a864886f70d01010a3030a00d300b0609608648016503040203a11a301806092a864886f70d010108300b0609608648016503040203a203020140"};KJUR.asn1.x509.GeneralName=function(e){KJUR.asn1.x509.GeneralName.superclass.constructor.call(this);var m=null,i=null,k={rfc822:"81",dns:"82",dn:"a4",uri:"86",ip:"87"},b=KJUR,g=b.asn1,f=g.DERSequence,j=g.DEROctetString,d=g.DERIA5String,c=g.DERTaggedObject,l=g.ASN1Object,a=g.x509.X500Name,h=pemtohex;this.explicit=false;this.setByParam=function(p){var r=null;var u=null;if(p===undefined){return}if(p.rfc822!==undefined){this.type="rfc822";u=new d({str:p[this.type]})}if(p.dns!==undefined){this.type="dns";u=new d({str:p[this.type]})}if(p.uri!==undefined){this.type="uri";u=new d({str:p[this.type]})}if(p.dn!==undefined){this.type="dn";this.explicit=true;if(typeof p.dn==="string"){u=new a({str:p.dn})}else{if(p.dn instanceof KJUR.asn1.x509.X500Name){u=p.dn}else{u=new a(p.dn)}}}if(p.ldapdn!==undefined){this.type="dn";this.explicit=true;u=new a({ldapstr:p.ldapdn})}if(p.certissuer!==undefined){this.type="dn";this.explicit=true;var o=p.certissuer;var w=null;if(o.match(/^[0-9A-Fa-f]+$/)){w==o}if(o.indexOf("-----BEGIN ")!=-1){w=h(o)}if(w==null){throw"certissuer param not cert"}var t=new X509();t.hex=w;var y=t.getIssuerHex();u=new l();u.hTLV=y}if(p.certsubj!==undefined){this.type="dn";this.explicit=true;var o=p.certsubj;var w=null;if(o.match(/^[0-9A-Fa-f]+$/)){w==o}if(o.indexOf("-----BEGIN ")!=-1){w=h(o)}if(w==null){throw"certsubj param not cert"}var t=new X509();t.hex=w;var y=t.getSubjectHex();u=new l();u.hTLV=y}if(p.ip!==undefined){this.type="ip";this.explicit=false;var q=p.ip;var s;var n="malformed IP address";if(q.match(/^[0-9.]+[.][0-9.]+$/)){s=intarystrtohex("["+q.split(".").join(",")+"]");if(s.length!==8){throw n}}else{if(q.match(/^[0-9A-Fa-f:]+:[0-9A-Fa-f:]+$/)){s=ipv6tohex(q)}else{if(q.match(/^([0-9A-Fa-f][0-9A-Fa-f]){1,}$/)){s=q}else{throw n}}}u=new j({hex:s})}if(this.type==null){throw"unsupported type in params="+p}this.asn1Obj=new c({explicit:this.explicit,tag:k[this.type],obj:u})};this.getEncodedHex=function(){return this.asn1Obj.getEncodedHex()};if(e!==undefined){this.setByParam(e)}};YAHOO.lang.extend(KJUR.asn1.x509.GeneralName,KJUR.asn1.ASN1Object);KJUR.asn1.x509.GeneralNames=function(d){KJUR.asn1.x509.GeneralNames.superclass.constructor.call(this);var a=null,c=KJUR,b=c.asn1;this.setByParamArray=function(g){for(var e=0;e<g.length;e++){var f=new b.x509.GeneralName(g[e]);this.asn1Array.push(f)}};this.getEncodedHex=function(){var e=new b.DERSequence({array:this.asn1Array});return e.getEncodedHex()};this.asn1Array=new Array();if(typeof d!="undefined"){this.setByParamArray(d)}};YAHOO.lang.extend(KJUR.asn1.x509.GeneralNames,KJUR.asn1.ASN1Object);KJUR.asn1.x509.DistributionPointName=function(b){KJUR.asn1.x509.DistributionPointName.superclass.constructor.call(this);var h=null,e=null,a=null,g=null,d=KJUR,c=d.asn1,f=c.DERTaggedObject;this.getEncodedHex=function(){if(this.type!="full"){throw"currently type shall be 'full': "+this.type}this.asn1Obj=new f({explicit:false,tag:this.tag,obj:this.asn1V});this.hTLV=this.asn1Obj.getEncodedHex();return this.hTLV};if(b!==undefined){if(c.x509.GeneralNames.prototype.isPrototypeOf(b)){this.type="full";this.tag="a0";this.asn1V=b}else{throw"This class supports GeneralNames only as argument"}}};YAHOO.lang.extend(KJUR.asn1.x509.DistributionPointName,KJUR.asn1.ASN1Object);KJUR.asn1.x509.DistributionPoint=function(d){KJUR.asn1.x509.DistributionPoint.superclass.constructor.call(this);var a=null,c=KJUR,b=c.asn1;this.getEncodedHex=function(){var e=new b.DERSequence();if(this.asn1DP!=null){var f=new b.DERTaggedObject({explicit:true,tag:"a0",obj:this.asn1DP});e.appendASN1Object(f)}this.hTLV=e.getEncodedHex();return this.hTLV};if(d!==undefined){if(d.dpobj!==undefined){this.asn1DP=d.dpobj}}};YAHOO.lang.extend(KJUR.asn1.x509.DistributionPoint,KJUR.asn1.ASN1Object);KJUR.asn1.x509.OID=new function(a){this.atype2oidList={CN:"2.5.4.3",L:"2.5.4.7",ST:"2.5.4.8",O:"2.5.4.10",OU:"2.5.4.11",C:"2.5.4.6",STREET:"2.5.4.9",DC:"0.9.2342.19200300.100.1.25",UID:"0.9.2342.19200300.100.1.1",SN:"2.5.4.4",T:"2.5.4.12",DN:"2.5.4.49",E:"1.2.840.113549.1.9.1",description:"2.5.4.13",businessCategory:"2.5.4.15",postalCode:"2.5.4.17",serialNumber:"2.5.4.5",uniqueIdentifier:"2.5.4.45",organizationIdentifier:"2.5.4.97",jurisdictionOfIncorporationL:"1.3.6.1.4.1.311.60.2.1.1",jurisdictionOfIncorporationSP:"1.3.6.1.4.1.311.60.2.1.2",jurisdictionOfIncorporationC:"1.3.6.1.4.1.311.60.2.1.3"};this.name2oidList={sha1:"1.3.14.3.2.26",sha256:"2.16.840.1.101.3.4.2.1",sha384:"2.16.840.1.101.3.4.2.2",sha512:"2.16.840.1.101.3.4.2.3",sha224:"2.16.840.1.101.3.4.2.4",md5:"1.2.840.113549.2.5",md2:"1.3.14.7.2.2.1",ripemd160:"1.3.36.3.2.1",MD2withRSA:"1.2.840.113549.1.1.2",MD4withRSA:"1.2.840.113549.1.1.3",MD5withRSA:"1.2.840.113549.1.1.4",SHA1withRSA:"1.2.840.113549.1.1.5",SHA224withRSA:"1.2.840.113549.1.1.14",SHA256withRSA:"1.2.840.113549.1.1.11",SHA384withRSA:"1.2.840.113549.1.1.12",SHA512withRSA:"1.2.840.113549.1.1.13",SHA1withECDSA:"1.2.840.10045.4.1",SHA224withECDSA:"1.2.840.10045.4.3.1",SHA256withECDSA:"1.2.840.10045.4.3.2",SHA384withECDSA:"1.2.840.10045.4.3.3",SHA512withECDSA:"1.2.840.10045.4.3.4",dsa:"1.2.840.10040.4.1",SHA1withDSA:"1.2.840.10040.4.3",SHA224withDSA:"2.16.840.1.101.3.4.3.1",SHA256withDSA:"2.16.840.1.101.3.4.3.2",rsaEncryption:"1.2.840.113549.1.1.1",commonName:"2.5.4.3",countryName:"2.5.4.6",localityName:"2.5.4.7",stateOrProvinceName:"2.5.4.8",streetAddress:"2.5.4.9",organizationName:"2.5.4.10",organizationalUnitName:"2.5.4.11",domainComponent:"0.9.2342.19200300.100.1.25",userId:"0.9.2342.19200300.100.1.1",surname:"2.5.4.4",title:"2.5.4.12",distinguishedName:"2.5.4.49",emailAddress:"1.2.840.113549.1.9.1",description:"2.5.4.13",businessCategory:"2.5.4.15",postalCode:"2.5.4.17",uniqueIdentifier:"2.5.4.45",organizationIdentifier:"2.5.4.97",jurisdictionOfIncorporationL:"1.3.6.1.4.1.311.60.2.1.1",jurisdictionOfIncorporationSP:"1.3.6.1.4.1.311.60.2.1.2",jurisdictionOfIncorporationC:"1.3.6.1.4.1.311.60.2.1.3",subjectKeyIdentifier:"2.5.29.14",keyUsage:"2.5.29.15",subjectAltName:"2.5.29.17",issuerAltName:"2.5.29.18",basicConstraints:"2.5.29.19",nameConstraints:"2.5.29.30",cRLDistributionPoints:"2.5.29.31",certificatePolicies:"2.5.29.32",authorityKeyIdentifier:"2.5.29.35",policyConstraints:"2.5.29.36",extKeyUsage:"2.5.29.37",authorityInfoAccess:"1.3.6.1.5.5.7.1.1",ocsp:"1.3.6.1.5.5.7.48.1",caIssuers:"1.3.6.1.5.5.7.48.2",anyExtendedKeyUsage:"2.5.29.37.0",serverAuth:"1.3.6.1.5.5.7.3.1",clientAuth:"1.3.6.1.5.5.7.3.2",codeSigning:"1.3.6.1.5.5.7.3.3",emailProtection:"1.3.6.1.5.5.7.3.4",timeStamping:"1.3.6.1.5.5.7.3.8",ocspSigning:"1.3.6.1.5.5.7.3.9",ecPublicKey:"1.2.840.10045.2.1",secp256r1:"1.2.840.10045.3.1.7",secp256k1:"1.3.132.0.10",secp384r1:"1.3.132.0.34",pkcs5PBES2:"1.2.840.113549.1.5.13",pkcs5PBKDF2:"1.2.840.113549.1.5.12","des-EDE3-CBC":"1.2.840.113549.3.7",data:"1.2.840.113549.1.7.1","signed-data":"1.2.840.113549.1.7.2","enveloped-data":"1.2.840.113549.1.7.3","digested-data":"1.2.840.113549.1.7.5","encrypted-data":"1.2.840.113549.1.7.6","authenticated-data":"1.2.840.113549.1.9.16.1.2",tstinfo:"1.2.840.113549.1.9.16.1.4",extensionRequest:"1.2.840.113549.1.9.14",};this.objCache={};this.name2obj=function(b){if(typeof this.objCache[b]!="undefined"){return this.objCache[b]}if(typeof this.name2oidList[b]=="undefined"){throw"Name of ObjectIdentifier not defined: "+b}var c=this.name2oidList[b];var d=new KJUR.asn1.DERObjectIdentifier({oid:c});this.objCache[b]=d;return d};this.atype2obj=function(b){if(typeof this.objCache[b]!="undefined"){return this.objCache[b]}if(typeof this.atype2oidList[b]=="undefined"){throw"AttributeType name undefined: "+b}var c=this.atype2oidList[b];var d=new KJUR.asn1.DERObjectIdentifier({oid:c});this.objCache[b]=d;return d}};KJUR.asn1.x509.OID.oid2name=function(b){var c=KJUR.asn1.x509.OID.name2oidList;for(var a in c){if(c[a]==b){return a}}return""};KJUR.asn1.x509.OID.oid2atype=function(b){var c=KJUR.asn1.x509.OID.atype2oidList;for(var a in c){if(c[a]==b){return a}}return b};KJUR.asn1.x509.OID.name2oid=function(a){var b=KJUR.asn1.x509.OID.name2oidList;if(b[a]===undefined){return""}return b[a]};KJUR.asn1.x509.X509Util={};KJUR.asn1.x509.X509Util.newCertPEM=function(h){var g=KJUR.asn1.x509,b=g.TBSCertificate,a=g.Certificate;var f=new b();if(h.serial!==undefined){f.setSerialNumberByParam(h.serial)}else{throw"serial number undefined."}if(typeof h.sigalg.name==="string"){f.setSignatureAlgByParam(h.sigalg)}else{throw"unproper signature algorithm name"}if(h.issuer!==undefined){f.setIssuerByParam(h.issuer)}else{throw"issuer name undefined."}if(h.notbefore!==undefined){f.setNotBeforeByParam(h.notbefore)}else{throw"notbefore undefined."}if(h.notafter!==undefined){f.setNotAfterByParam(h.notafter)}else{throw"notafter undefined."}if(h.subject!==undefined){f.setSubjectByParam(h.subject)}else{throw"subject name undefined."}if(h.sbjpubkey!==undefined){f.setSubjectPublicKeyByGetKey(h.sbjpubkey)}else{throw"subject public key undefined."}if(h.ext!==undefined&&h.ext.length!==undefined){for(var d=0;d<h.ext.length;d++){for(key in h.ext[d]){f.appendExtensionByName(key,h.ext[d][key])}}}if(h.cakey===undefined&&h.sighex===undefined){throw"param cakey and sighex undefined."}var e=null;var c=null;if(h.cakey){if(h.cakey.isPrivate===true){e=h.cakey}else{e=KEYUTIL.getKey.apply(null,h.cakey)}c=new a({tbscertobj:f,prvkeyobj:e});c.sign()}if(h.sighex){c=new a({tbscertobj:f});c.setSignatureHex(h.sighex)}return c.getPEMString()};
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}if(typeof KJUR.asn1.cms=="undefined"||!KJUR.asn1.cms){KJUR.asn1.cms={}}KJUR.asn1.cms.Attribute=function(d){var a=[],c=KJUR,b=c.asn1;b.cms.Attribute.superclass.constructor.call(this);this.getEncodedHex=function(){var h,g,e;h=new b.DERObjectIdentifier({oid:this.attrTypeOid});g=new b.DERSet({array:this.valueList});try{g.getEncodedHex()}catch(f){throw"fail valueSet.getEncodedHex in Attribute(1)/"+f}e=new b.DERSequence({array:[h,g]});try{this.hTLV=e.getEncodedHex()}catch(f){throw"failed seq.getEncodedHex in Attribute(2)/"+f}return this.hTLV}};YAHOO.lang.extend(KJUR.asn1.cms.Attribute,KJUR.asn1.ASN1Object);KJUR.asn1.cms.ContentType=function(d){var c=KJUR,b=c.asn1;b.cms.ContentType.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.3";var a=null;if(typeof d!="undefined"){var a=new b.DERObjectIdentifier(d);this.valueList=[a]}};YAHOO.lang.extend(KJUR.asn1.cms.ContentType,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.MessageDigest=function(d){var b=KJUR,e=b.asn1,g=e.DEROctetString,i=e.cms;i.MessageDigest.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.4";if(d!==undefined){if(d.eciObj instanceof i.EncapsulatedContentInfo&&typeof d.hashAlg==="string"){var h=d.eciObj.eContentValueHex;var c=d.hashAlg;var a=b.crypto.Util.hashHex(h,c);var f=new g({hex:a});f.getEncodedHex();this.valueList=[f]}else{var f=new g(d);f.getEncodedHex();this.valueList=[f]}}};YAHOO.lang.extend(KJUR.asn1.cms.MessageDigest,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.SigningTime=function(e){var d=KJUR,c=d.asn1;c.cms.SigningTime.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.5";if(e!==undefined){var a=new c.x509.Time(e);try{a.getEncodedHex()}catch(b){throw"SigningTime.getEncodedHex() failed/"+b}this.valueList=[a]}};YAHOO.lang.extend(KJUR.asn1.cms.SigningTime,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.SigningCertificate=function(f){var c=KJUR,b=c.asn1,a=b.DERSequence,e=b.cms,d=c.crypto;e.SigningCertificate.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.12";this.setCerts=function(n){var l=[];for(var k=0;k<n.length;k++){var h=pemtohex(n[k]);var g=c.crypto.Util.hashHex(h,"sha1");var o=new b.DEROctetString({hex:g});o.getEncodedHex();var m=new e.IssuerSerial({cert:n[k]});m.getEncodedHex();var p=new a({array:[o,m]});p.getEncodedHex();l.push(p)}var j=new a({array:l});j.getEncodedHex();this.valueList=[j]};if(f!==undefined){if(typeof f.array=="object"){this.setCerts(f.array)}}};YAHOO.lang.extend(KJUR.asn1.cms.SigningCertificate,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.SigningCertificateV2=function(h){var d=KJUR,c=d.asn1,b=c.DERSequence,g=c.x509,f=c.cms,e=d.crypto;f.SigningCertificateV2.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.47";this.setCerts=function(r,k){var p=[];for(var n=0;n<r.length;n++){var l=pemtohex(r[n]);var t=[];if(k!=="sha256"){t.push(new g.AlgorithmIdentifier({name:k}))}var j=e.Util.hashHex(l,k);var s=new c.DEROctetString({hex:j});s.getEncodedHex();t.push(s);var o=new f.IssuerSerial({cert:r[n]});o.getEncodedHex();t.push(o);var q=new b({array:t});q.getEncodedHex();p.push(q)}var m=new b({array:p});m.getEncodedHex();this.valueList=[m]};if(h!==undefined){if(typeof h.array=="object"){var a="sha256";if(typeof h.hashAlg=="string"){a=h.hashAlg}this.setCerts(h.array,a)}}};YAHOO.lang.extend(KJUR.asn1.cms.SigningCertificateV2,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.IssuerSerial=function(f){var d=KJUR,h=d.asn1,g=h.DERInteger,j=h.cms,e=h.x509,b=e.X500Name,a=e.GeneralNames,c=X509;j.IssuerSerial.superclass.constructor.call(this);var k=null;var i=null;this.setByCertPEM=function(o){var m=pemtohex(o);var l=new c();l.hex=m;var p=l.getIssuerHex();this.dIssuer=new b();this.dIssuer.hTLV=p;var n=l.getSerialNumberHex();this.dSerial=new g({hex:n})};this.getEncodedHex=function(){var l=new a([{dn:this.dIssuer}]);var m=new h.DERSequence({array:[l,this.dSerial]});this.hTLV=m.getEncodedHex();return this.hTLV};if(f!==undefined){if(typeof f=="string"&&f.indexOf("-----BEGIN ")!=-1){this.setByCertPEM(f)}if(f.issuer&&f.serial){if(f.issuer instanceof b){this.dIssuer=f.issuer}else{this.dIssuer=new b(f.issuer)}if(f.serial instanceof g){this.dSerial=f.serial}else{this.dSerial=new g(f.serial)}}if(typeof f.cert=="string"){this.setByCertPEM(f.cert)}}};YAHOO.lang.extend(KJUR.asn1.cms.IssuerSerial,KJUR.asn1.ASN1Object);KJUR.asn1.cms.IssuerAndSerialNumber=function(e){var b=KJUR,g=b.asn1,f=g.DERInteger,i=g.cms,d=g.x509,a=d.X500Name,c=X509;i.IssuerAndSerialNumber.superclass.constructor.call(this);var j=null;var h=null;this.setByCertPEM=function(n){var l=pemtohex(n);var k=new c();k.hex=l;var o=k.getIssuerHex();this.dIssuer=new a();this.dIssuer.hTLV=o;var m=k.getSerialNumberHex();this.dSerial=new f({hex:m})};this.getEncodedHex=function(){var k=new g.DERSequence({array:[this.dIssuer,this.dSerial]});this.hTLV=k.getEncodedHex();return this.hTLV};if(e!==undefined){if(typeof e=="string"&&e.indexOf("-----BEGIN ")!=-1){this.setByCertPEM(e)}if(e.issuer&&e.serial){if(e.issuer instanceof a){this.dIssuer=e.issuer}else{this.dIssuer=new a(e.issuer)}if(e.serial instanceof f){this.dSerial=e.serial}else{this.dSerial=new f(e.serial)}}if(typeof e.cert=="string"){this.setByCertPEM(e.cert)}}};YAHOO.lang.extend(KJUR.asn1.cms.IssuerAndSerialNumber,KJUR.asn1.ASN1Object);KJUR.asn1.cms.AttributeList=function(d){var b=KJUR,a=b.asn1,c=a.cms;c.AttributeList.superclass.constructor.call(this);this.list=new Array();this.sortFlag=true;this.add=function(e){if(e instanceof c.Attribute){this.list.push(e)}};this.length=function(){return this.list.length};this.clear=function(){this.list=new Array();this.hTLV=null;this.hV=null};this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}var e=new a.DERSet({array:this.list,sortflag:this.sortFlag});this.hTLV=e.getEncodedHex();return this.hTLV};if(d!==undefined){if(typeof d.sortflag!="undefined"&&d.sortflag==false){this.sortFlag=false}}};YAHOO.lang.extend(KJUR.asn1.cms.AttributeList,KJUR.asn1.ASN1Object);KJUR.asn1.cms.SignerInfo=function(e){var a=KJUR,h=a.asn1,b=h.DERTaggedObject,n=h.cms,j=n.AttributeList,g=n.ContentType,k=n.EncapsulatedContentInfo,c=n.MessageDigest,l=n.SignedData,d=h.x509,m=d.AlgorithmIdentifier,f=a.crypto,i=KEYUTIL;n.SignerInfo.superclass.constructor.call(this);this.dCMSVersion=new h.DERInteger({"int":1});this.dSignerIdentifier=null;this.dDigestAlgorithm=null;this.dSignedAttrs=new j();this.dSigAlg=null;this.dSig=null;this.dUnsignedAttrs=new j();this.setSignerIdentifier=function(p){if(typeof p=="string"&&p.indexOf("CERTIFICATE")!=-1&&p.indexOf("BEGIN")!=-1&&p.indexOf("END")!=-1){var o=p;this.dSignerIdentifier=new n.IssuerAndSerialNumber({cert:p})}};this.setForContentAndHash=function(o){if(o!==undefined){if(o.eciObj instanceof k){this.dSignedAttrs.add(new g({oid:"1.2.840.113549.1.7.1"}));this.dSignedAttrs.add(new c({eciObj:o.eciObj,hashAlg:o.hashAlg}))}if(o.sdObj!==undefined&&o.sdObj instanceof l){if(o.sdObj.digestAlgNameList.join(":").indexOf(o.hashAlg)==-1){o.sdObj.digestAlgNameList.push(o.hashAlg)}}if(typeof o.hashAlg=="string"){this.dDigestAlgorithm=new m({name:o.hashAlg})}}};this.sign=function(t,p){this.dSigAlg=new m({name:p});var q=this.dSignedAttrs.getEncodedHex();var o=i.getKey(t);var s=new f.Signature({alg:p});s.init(o);s.updateHex(q);var r=s.sign();this.dSig=new h.DEROctetString({hex:r})};this.addUnsigned=function(o){this.hTLV=null;this.dUnsignedAttrs.hTLV=null;this.dUnsignedAttrs.add(o)};this.getEncodedHex=function(){if(this.dSignedAttrs instanceof j&&this.dSignedAttrs.length()==0){throw"SignedAttrs length = 0 (empty)"}var o=new b({obj:this.dSignedAttrs,tag:"a0",explicit:false});var r=null;if(this.dUnsignedAttrs.length()>0){r=new b({obj:this.dUnsignedAttrs,tag:"a1",explicit:false})}var q=[this.dCMSVersion,this.dSignerIdentifier,this.dDigestAlgorithm,o,this.dSigAlg,this.dSig,];if(r!=null){q.push(r)}var p=new h.DERSequence({array:q});this.hTLV=p.getEncodedHex();return this.hTLV}};YAHOO.lang.extend(KJUR.asn1.cms.SignerInfo,KJUR.asn1.ASN1Object);KJUR.asn1.cms.EncapsulatedContentInfo=function(g){var c=KJUR,b=c.asn1,e=b.DERTaggedObject,a=b.DERSequence,h=b.DERObjectIdentifier,d=b.DEROctetString,f=b.cms;f.EncapsulatedContentInfo.superclass.constructor.call(this);this.dEContentType=new h({name:"data"});this.dEContent=null;this.isDetached=false;this.eContentValueHex=null;this.setContentType=function(i){if(i.match(/^[0-2][.][0-9.]+$/)){this.dEContentType=new h({oid:i})}else{this.dEContentType=new h({name:i})}};this.setContentValue=function(i){if(i!==undefined){if(typeof i.hex=="string"){this.eContentValueHex=i.hex}else{if(typeof i.str=="string"){this.eContentValueHex=utf8tohex(i.str)}}}};this.setContentValueHex=function(i){this.eContentValueHex=i};this.setContentValueStr=function(i){this.eContentValueHex=utf8tohex(i)};this.getEncodedHex=function(){if(typeof this.eContentValueHex!="string"){throw"eContentValue not yet set"}var k=new d({hex:this.eContentValueHex});this.dEContent=new e({obj:k,tag:"a0",explicit:true});var i=[this.dEContentType];if(!this.isDetached){i.push(this.dEContent)}var j=new a({array:i});this.hTLV=j.getEncodedHex();return this.hTLV}};YAHOO.lang.extend(KJUR.asn1.cms.EncapsulatedContentInfo,KJUR.asn1.ASN1Object);KJUR.asn1.cms.ContentInfo=function(f){var c=KJUR,b=c.asn1,d=b.DERTaggedObject,a=b.DERSequence,e=b.x509;KJUR.asn1.cms.ContentInfo.superclass.constructor.call(this);this.dContentType=null;this.dContent=null;this.setContentType=function(g){if(typeof g=="string"){this.dContentType=e.OID.name2obj(g)}};this.getEncodedHex=function(){var h=new d({obj:this.dContent,tag:"a0",explicit:true});var g=new a({array:[this.dContentType,h]});this.hTLV=g.getEncodedHex();return this.hTLV};if(f!==undefined){if(f.type){this.setContentType(f.type)}if(f.obj&&f.obj instanceof b.ASN1Object){this.dContent=f.obj}}};YAHOO.lang.extend(KJUR.asn1.cms.ContentInfo,KJUR.asn1.ASN1Object);KJUR.asn1.cms.SignedData=function(e){var a=KJUR,h=a.asn1,j=h.ASN1Object,g=h.DERInteger,m=h.DERSet,f=h.DERSequence,b=h.DERTaggedObject,l=h.cms,i=l.EncapsulatedContentInfo,d=l.SignerInfo,n=l.ContentInfo,c=h.x509,k=c.AlgorithmIdentifier;KJUR.asn1.cms.SignedData.superclass.constructor.call(this);this.dCMSVersion=new g({"int":1});this.dDigestAlgs=null;this.digestAlgNameList=[];this.dEncapContentInfo=new i();this.dCerts=null;this.certificateList=[];this.crlList=[];this.signerInfoList=[new d()];this.addCertificatesByPEM=function(p){var q=pemtohex(p);var r=new j();r.hTLV=q;this.certificateList.push(r)};this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}if(this.dDigestAlgs==null){var u=[];for(var t=0;t<this.digestAlgNameList.length;t++){var s=this.digestAlgNameList[t];var w=new k({name:s});u.push(w)}this.dDigestAlgs=new m({array:u})}var p=[this.dCMSVersion,this.dDigestAlgs,this.dEncapContentInfo];if(this.dCerts==null){if(this.certificateList.length>0){var v=new m({array:this.certificateList});this.dCerts=new b({obj:v,tag:"a0",explicit:false})}}if(this.dCerts!=null){p.push(this.dCerts)}var r=new m({array:this.signerInfoList});p.push(r);var q=new f({array:p});this.hTLV=q.getEncodedHex();return this.hTLV};this.getContentInfo=function(){this.getEncodedHex();var o=new n({type:"signed-data",obj:this});return o};this.getContentInfoEncodedHex=function(){var o=this.getContentInfo();var p=o.getEncodedHex();return p};this.getPEM=function(){return hextopem(this.getContentInfoEncodedHex(),"CMS")}};YAHOO.lang.extend(KJUR.asn1.cms.SignedData,KJUR.asn1.ASN1Object);KJUR.asn1.cms.CMSUtil=new function(){};KJUR.asn1.cms.CMSUtil.newSignedData=function(d){var b=KJUR,j=b.asn1,q=j.cms,f=q.SignerInfo,n=q.SignedData,o=q.SigningTime,a=q.SigningCertificate,p=q.SigningCertificateV2,c=j.cades,e=c.SignaturePolicyIdentifier;var m=new n();m.dEncapContentInfo.setContentValue(d.content);if(typeof d.detached=="boolean"){m.dEncapContentInfo.isDetached=d.detached}if(typeof d.certs=="object"){for(var h=0;h<d.certs.length;h++){m.addCertificatesByPEM(d.certs[h])}}m.signerInfoList=[];for(var h=0;h<d.signerInfos.length;h++){var k=d.signerInfos[h];var g=new f();g.setSignerIdentifier(k.signerCert);g.setForContentAndHash({sdObj:m,eciObj:m.dEncapContentInfo,hashAlg:k.hashAlg});for(attrName in k.sAttr){var r=k.sAttr[attrName];if(attrName=="SigningTime"){var l=new o(r);g.dSignedAttrs.add(l)}if(attrName=="SigningCertificate"){var l=new a(r);g.dSignedAttrs.add(l)}if(attrName=="SigningCertificateV2"){var l=new p(r);g.dSignedAttrs.add(l)}if(attrName=="SignaturePolicyIdentifier"){var l=new e(r);g.dSignedAttrs.add(l)}}g.sign(k.signerPrvKey,k.sigAlg);m.signerInfoList.push(g)}return m};KJUR.asn1.cms.CMSUtil.verifySignedData=function(n){var C=KJUR,p=C.asn1,s=p.cms,D=s.SignerInfo,q=s.SignedData,y=s.SigningTime,b=s.SigningCertificate,d=s.SigningCertificateV2,A=p.cades,u=A.SignaturePolicyIdentifier,i=C.lang.String.isHex,v=ASN1HEX,h=v.getVbyList,a=v.getTLVbyList,t=v.getIdxbyList,z=v.getChildIdx,c=v.getTLV,B=v.oidname,j=C.crypto.Util.hashHex;if(n.cms===undefined&&!i(n.cms)){}var E=n.cms;var g=function(J,H){var G;for(var I=3;I<6;I++){G=t(J,0,[1,0,I]);if(G!==undefined){var F=J.substr(G,2);if(F==="a0"){H.certsIdx=G}if(F==="a1"){H.revinfosIdx=G}if(F==="31"){H.signerinfosIdx=G}}}};var l=function(I,F){var H=F.signerinfosIdx;if(H===undefined){return}var L=z(I,H);F.signerInfoIdxList=L;for(var G=0;G<L.length;G++){var K=L[G];var J={idx:K};k(I,J);F.signerInfos.push(J)}};var k=function(I,J){var F=J.idx;J.signerid_issuer1=a(I,F,[1,0],"30");J.signerid_serial1=h(I,F,[1,1],"02");J.hashalg=B(h(I,F,[2,0],"06"));var H=t(I,F,[3],"a0");J.idxSignedAttrs=H;f(I,J,H);var G=z(I,F);var K=G.length;if(K<6){throw"malformed SignerInfo"}J.sigalg=B(h(I,F,[K-2,0],"06"));J.sigval=h(I,F,[K-1],"04")};var f=function(L,M,F){var J=z(L,F);M.signedAttrIdxList=J;for(var K=0;K<J.length;K++){var I=J[K];var G=h(L,I,[0],"06");var H;if(G==="2a864886f70d010905"){H=hextoutf8(h(L,I,[1,0]));M.saSigningTime=H}else{if(G==="2a864886f70d010904"){H=h(L,I,[1,0],"04");M.saMessageDigest=H}}}};var w=function(G,F){if(h(G,0,[0],"06")!=="2a864886f70d010702"){return F}F.cmsType="signedData";F.econtent=h(G,0,[1,0,2,1,0]);g(G,F);F.signerInfos=[];l(G,F)};var o=function(J,F){var G=F.parse.signerInfos;var L=G.length;var K=true;for(var I=0;I<L;I++){var H=G[I];e(J,F,H,I);if(!H.isValid){K=false}}F.isValid=K};var x=function(F,Q,J,P){var N=Q.parse.certsIdx;var H;if(Q.certs===undefined){H=[];Q.certkeys=[];var K=z(F,N);for(var I=0;I<K.length;I++){var M=c(F,K[I]);var O=new X509();O.readCertHex(M);H[I]=O;Q.certkeys[I]=O.getPublicKey()}Q.certs=H}else{H=Q.certs}Q.cccc=H.length;Q.cccci=K.length;for(var I=0;I<H.length;I++){var L=O.getIssuerHex();var G=O.getSerialNumberHex();if(J.signerid_issuer1===L&&J.signerid_serial1===G){J.certkey_idx=I}}};var e=function(F,R,I,N){I.verifyDetail={};var Q=I.verifyDetail;var K=R.parse.econtent;var G=I.hashalg;var L=I.saMessageDigest;Q.validMessageDigest=false;if(j(K,G)===L){Q.validMessageDigest=true}x(F,R,I,N);Q.validSignatureValue=false;var H=I.sigalg;var M="31"+c(F,I.idxSignedAttrs).substr(2);I.signedattrshex=M;var J=R.certs[I.certkey_idx].getPublicKey();var P=new KJUR.crypto.Signature({alg:H});P.init(J);P.updateHex(M);var O=P.verify(I.sigval);Q.validSignatureValue_isValid=O;if(O===true){Q.validSignatureValue=true}I.isValid=false;if(Q.validMessageDigest&&Q.validSignatureValue){I.isValid=true}};var m=function(){};var r={isValid:false,parse:{}};w(E,r.parse);o(E,r);return r};
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}if(typeof KJUR.asn1.tsp=="undefined"||!KJUR.asn1.tsp){KJUR.asn1.tsp={}}KJUR.asn1.tsp.Accuracy=function(f){var c=KJUR,b=c.asn1,e=b.DERInteger,a=b.DERSequence,d=b.DERTaggedObject;b.tsp.Accuracy.superclass.constructor.call(this);this.seconds=null;this.millis=null;this.micros=null;this.getEncodedHex=function(){var i=null;var k=null;var m=null;var g=[];if(this.seconds!=null){i=new e({"int":this.seconds});g.push(i)}if(this.millis!=null){var l=new e({"int":this.millis});k=new d({obj:l,tag:"80",explicit:false});g.push(k)}if(this.micros!=null){var j=new e({"int":this.micros});m=new d({obj:j,tag:"81",explicit:false});g.push(m)}var h=new a({array:g});this.hTLV=h.getEncodedHex();return this.hTLV};if(f!==undefined){if(typeof f.seconds=="number"){this.seconds=f.seconds}if(typeof f.millis=="number"){this.millis=f.millis}if(typeof f.micros=="number"){this.micros=f.micros}}};YAHOO.lang.extend(KJUR.asn1.tsp.Accuracy,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.MessageImprint=function(g){var c=KJUR,b=c.asn1,a=b.DERSequence,d=b.DEROctetString,f=b.x509,e=f.AlgorithmIdentifier;b.tsp.MessageImprint.superclass.constructor.call(this);this.dHashAlg=null;this.dHashValue=null;this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}var h=new a({array:[this.dHashAlg,this.dHashValue]});return h.getEncodedHex()};if(g!==undefined){if(typeof g.hashAlg=="string"){this.dHashAlg=new e({name:g.hashAlg})}if(typeof g.hashValue=="string"){this.dHashValue=new d({hex:g.hashValue})}}};YAHOO.lang.extend(KJUR.asn1.tsp.MessageImprint,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.TimeStampReq=function(c){var a=KJUR,f=a.asn1,d=f.DERSequence,e=f.DERInteger,g=f.DERBoolean,i=f.DERObjectIdentifier,h=f.tsp,b=h.MessageImprint;h.TimeStampReq.superclass.constructor.call(this);this.dVersion=new e({"int":1});this.dMessageImprint=null;this.dPolicy=null;this.dNonce=null;this.certReq=true;this.setMessageImprint=function(j){if(j instanceof b){this.dMessageImprint=j;return}if(typeof j=="object"){this.dMessageImprint=new b(j)}};this.getEncodedHex=function(){if(this.dMessageImprint==null){throw"messageImprint shall be specified"}var j=[this.dVersion,this.dMessageImprint];if(this.dPolicy!=null){j.push(this.dPolicy)}if(this.dNonce!=null){j.push(this.dNonce)}if(this.certReq){j.push(new g())}var k=new d({array:j});this.hTLV=k.getEncodedHex();return this.hTLV};if(c!==undefined){if(typeof c.mi=="object"){this.setMessageImprint(c.mi)}if(typeof c.policy=="object"){this.dPolicy=new i(c.policy)}if(typeof c.nonce=="object"){this.dNonce=new e(c.nonce)}if(typeof c.certreq=="boolean"){this.certReq=c.certreq}}};YAHOO.lang.extend(KJUR.asn1.tsp.TimeStampReq,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.TSTInfo=function(e){var c=KJUR,i=c.asn1,f=i.DERSequence,h=i.DERInteger,k=i.DERBoolean,g=i.DERGeneralizedTime,l=i.DERObjectIdentifier,j=i.tsp,d=j.MessageImprint,b=j.Accuracy,a=i.x509.X500Name;j.TSTInfo.superclass.constructor.call(this);this.dVersion=new h({"int":1});this.dPolicy=null;this.dMessageImprint=null;this.dSerialNumber=null;this.dGenTime=null;this.dAccuracy=null;this.dOrdering=null;this.dNonce=null;this.dTsa=null;this.getEncodedHex=function(){var m=[this.dVersion];if(this.dPolicy==null){throw"policy shall be specified."}m.push(this.dPolicy);if(this.dMessageImprint==null){throw"messageImprint shall be specified."}m.push(this.dMessageImprint);if(this.dSerialNumber==null){throw"serialNumber shall be specified."}m.push(this.dSerialNumber);if(this.dGenTime==null){throw"genTime shall be specified."}m.push(this.dGenTime);if(this.dAccuracy!=null){m.push(this.dAccuracy)}if(this.dOrdering!=null){m.push(this.dOrdering)}if(this.dNonce!=null){m.push(this.dNonce)}if(this.dTsa!=null){m.push(this.dTsa)}var n=new f({array:m});this.hTLV=n.getEncodedHex();return this.hTLV};if(e!==undefined){if(typeof e.policy=="string"){if(!e.policy.match(/^[0-9.]+$/)){throw"policy shall be oid like 0.1.4.134"}this.dPolicy=new l({oid:e.policy})}if(e.messageImprint!==undefined){this.dMessageImprint=new d(e.messageImprint)}if(e.serialNumber!==undefined){this.dSerialNumber=new h(e.serialNumber)}if(e.genTime!==undefined){this.dGenTime=new g(e.genTime)}if(e.accuracy!==undefined){this.dAccuracy=new b(e.accuracy)}if(e.ordering!==undefined&&e.ordering==true){this.dOrdering=new k()}if(e.nonce!==undefined){this.dNonce=new h(e.nonce)}if(e.tsa!==undefined){this.dTsa=new a(e.tsa)}}};YAHOO.lang.extend(KJUR.asn1.tsp.TSTInfo,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.TimeStampResp=function(g){var e=KJUR,d=e.asn1,c=d.DERSequence,f=d.ASN1Object,a=d.tsp,b=a.PKIStatusInfo;a.TimeStampResp.superclass.constructor.call(this);this.dStatus=null;this.dTST=null;this.getEncodedHex=function(){if(this.dStatus==null){throw"status shall be specified"}var h=[this.dStatus];if(this.dTST!=null){h.push(this.dTST)}var i=new c({array:h});this.hTLV=i.getEncodedHex();return this.hTLV};if(g!==undefined){if(typeof g.status=="object"){this.dStatus=new b(g.status)}if(g.tst!==undefined&&g.tst instanceof f){this.dTST=g.tst.getContentInfo()}}};YAHOO.lang.extend(KJUR.asn1.tsp.TimeStampResp,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIStatusInfo=function(h){var g=KJUR,f=g.asn1,e=f.DERSequence,a=f.tsp,d=a.PKIStatus,c=a.PKIFreeText,b=a.PKIFailureInfo;a.PKIStatusInfo.superclass.constructor.call(this);this.dStatus=null;this.dStatusString=null;this.dFailureInfo=null;this.getEncodedHex=function(){if(this.dStatus==null){throw"status shall be specified"}var i=[this.dStatus];if(this.dStatusString!=null){i.push(this.dStatusString)}if(this.dFailureInfo!=null){i.push(this.dFailureInfo)}var j=new e({array:i});this.hTLV=j.getEncodedHex();return this.hTLV};if(h!==undefined){if(typeof h.status=="object"){this.dStatus=new d(h.status)}if(typeof h.statstr=="object"){this.dStatusString=new c({array:h.statstr})}if(typeof h.failinfo=="object"){this.dFailureInfo=new b(h.failinfo)}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIStatusInfo,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIStatus=function(h){var d=KJUR,c=d.asn1,g=c.DERInteger,a=c.tsp,b=a.PKIStatus;a.PKIStatus.superclass.constructor.call(this);var f=null;this.getEncodedHex=function(){this.hTLV=this.dStatus.getEncodedHex();return this.hTLV};if(h!==undefined){if(h.name!==undefined){var e=b.valueList;if(e[h.name]===undefined){throw"name undefined: "+h.name}this.dStatus=new g({"int":e[h.name]})}else{this.dStatus=new g(h)}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIStatus,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIStatus.valueList={granted:0,grantedWithMods:1,rejection:2,waiting:3,revocationWarning:4,revocationNotification:5};KJUR.asn1.tsp.PKIFreeText=function(f){var e=KJUR,d=e.asn1,b=d.DERSequence,c=d.DERUTF8String,a=d.tsp;a.PKIFreeText.superclass.constructor.call(this);this.textList=[];this.getEncodedHex=function(){var g=[];for(var j=0;j<this.textList.length;j++){g.push(new c({str:this.textList[j]}))}var h=new b({array:g});this.hTLV=h.getEncodedHex();return this.hTLV};if(f!==undefined){if(typeof f.array=="object"){this.textList=f.array}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIFreeText,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIFailureInfo=function(g){var d=KJUR,c=d.asn1,f=c.DERBitString,a=c.tsp,b=a.PKIFailureInfo;b.superclass.constructor.call(this);this.value=null;this.getEncodedHex=function(){if(this.value==null){throw"value shall be specified"}var h=new Number(this.value).toString(2);var i=new f();i.setByBinaryString(h);this.hTLV=i.getEncodedHex();return this.hTLV};if(g!==undefined){if(typeof g.name=="string"){var e=b.valueList;if(e[g.name]===undefined){throw"name undefined: "+g.name}this.value=e[g.name]}else{if(typeof g["int"]=="number"){this.value=g["int"]}}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIFailureInfo,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIFailureInfo.valueList={badAlg:0,badRequest:2,badDataFormat:5,timeNotAvailable:14,unacceptedPolicy:15,unacceptedExtension:16,addInfoNotAvailable:17,systemFailure:25};KJUR.asn1.tsp.AbstractTSAAdapter=function(a){this.getTSTHex=function(c,b){throw"not implemented yet"}};KJUR.asn1.tsp.SimpleTSAAdapter=function(e){var d=KJUR,c=d.asn1,a=c.tsp,b=d.crypto.Util.hashHex;a.SimpleTSAAdapter.superclass.constructor.call(this);this.params=null;this.serial=0;this.getTSTHex=function(g,f){var i=b(g,f);this.params.tstInfo.messageImprint={hashAlg:f,hashValue:i};this.params.tstInfo.serialNumber={"int":this.serial++};var h=Math.floor(Math.random()*1000000000);this.params.tstInfo.nonce={"int":h};var j=a.TSPUtil.newTimeStampToken(this.params);return j.getContentInfoEncodedHex()};if(e!==undefined){this.params=e}};YAHOO.lang.extend(KJUR.asn1.tsp.SimpleTSAAdapter,KJUR.asn1.tsp.AbstractTSAAdapter);KJUR.asn1.tsp.FixedTSAAdapter=function(e){var d=KJUR,c=d.asn1,a=c.tsp,b=d.crypto.Util.hashHex;a.FixedTSAAdapter.superclass.constructor.call(this);this.params=null;this.getTSTHex=function(g,f){var h=b(g,f);this.params.tstInfo.messageImprint={hashAlg:f,hashValue:h};var i=a.TSPUtil.newTimeStampToken(this.params);return i.getContentInfoEncodedHex()};if(e!==undefined){this.params=e}};YAHOO.lang.extend(KJUR.asn1.tsp.FixedTSAAdapter,KJUR.asn1.tsp.AbstractTSAAdapter);KJUR.asn1.tsp.TSPUtil=new function(){};KJUR.asn1.tsp.TSPUtil.newTimeStampToken=function(c){var b=KJUR,h=b.asn1,m=h.cms,k=h.tsp,a=h.tsp.TSTInfo;var j=new m.SignedData();var g=new a(c.tstInfo);var f=g.getEncodedHex();j.dEncapContentInfo.setContentValue({hex:f});j.dEncapContentInfo.setContentType("tstinfo");if(typeof c.certs=="object"){for(var e=0;e<c.certs.length;e++){j.addCertificatesByPEM(c.certs[e])}}var d=j.signerInfoList[0];d.setSignerIdentifier(c.signerCert);d.setForContentAndHash({sdObj:j,eciObj:j.dEncapContentInfo,hashAlg:c.hashAlg});var l=new m.SigningCertificate({array:[c.signerCert]});d.dSignedAttrs.add(l);d.sign(c.signerPrvKey,c.sigAlg);return j};KJUR.asn1.tsp.TSPUtil.parseTimeStampReq=function(m){var l=ASN1HEX;var h=l.getChildIdx;var f=l.getV;var b=l.getTLV;var j={};j.certreq=false;var a=h(m,0);if(a.length<2){throw"TimeStampReq must have at least 2 items"}var e=b(m,a[1]);j.mi=KJUR.asn1.tsp.TSPUtil.parseMessageImprint(e);for(var d=2;d<a.length;d++){var g=a[d];var k=m.substr(g,2);if(k=="06"){var c=f(m,g);j.policy=l.hextooidstr(c)}if(k=="02"){j.nonce=f(m,g)}if(k=="01"){j.certreq=true}}return j};KJUR.asn1.tsp.TSPUtil.parseMessageImprint=function(c){var m=ASN1HEX;var j=m.getChildIdx;var i=m.getV;var g=m.getIdxbyList;var k={};if(c.substr(0,2)!="30"){throw"head of messageImprint hex shall be '30'"}var a=j(c,0);var l=g(c,0,[0,0]);var e=i(c,l);var d=m.hextooidstr(e);var h=KJUR.asn1.x509.OID.oid2name(d);if(h==""){throw"hashAlg name undefined: "+d}var b=h;var f=g(c,0,[1]);k.hashAlg=b;k.hashValue=i(c,f);return k};
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}if(typeof KJUR.asn1.cades=="undefined"||!KJUR.asn1.cades){KJUR.asn1.cades={}}KJUR.asn1.cades.SignaturePolicyIdentifier=function(f){var b=KJUR,h=b.asn1,i=h.DERObjectIdentifier,g=h.DERSequence,e=h.cades,c=e.OtherHashAlgAndValue;e.SignaturePolicyIdentifier.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.15";if(f!==undefined){if(typeof f.oid=="string"&&typeof f.hash=="object"){var d=new i({oid:f.oid});var a=new c(f.hash);var j=new g({array:[d,a]});this.valueList=[j]}}};YAHOO.lang.extend(KJUR.asn1.cades.SignaturePolicyIdentifier,KJUR.asn1.cms.Attribute);KJUR.asn1.cades.OtherHashAlgAndValue=function(e){var a=KJUR,g=a.asn1,f=g.DERSequence,h=g.DEROctetString,d=g.x509,i=d.AlgorithmIdentifier,c=g.cades,b=c.OtherHashAlgAndValue;b.superclass.constructor.call(this);this.dAlg=null;this.dHash=null;this.getEncodedHex=function(){var j=new f({array:[this.dAlg,this.dHash]});this.hTLV=j.getEncodedHex();return this.hTLV};if(e!==undefined){if(typeof e.alg=="string"&&typeof e.hash=="string"){this.dAlg=new i({name:e.alg});this.dHash=new h({hex:e.hash})}}};YAHOO.lang.extend(KJUR.asn1.cades.OtherHashAlgAndValue,KJUR.asn1.ASN1Object);KJUR.asn1.cades.SignatureTimeStamp=function(h){var c=KJUR,b=c.asn1,e=b.ASN1Object,g=b.x509,a=b.cades;a.SignatureTimeStamp.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.14";this.tstHex=null;if(h!==undefined){if(h.res!==undefined){if(typeof h.res=="string"&&h.res.match(/^[0-9A-Fa-f]+$/)){}else{if(h.res instanceof e){}else{throw"res param shall be ASN1Object or hex string"}}}if(h.tst!==undefined){if(typeof h.tst=="string"&&h.tst.match(/^[0-9A-Fa-f]+$/)){var f=new e();this.tstHex=h.tst;f.hTLV=this.tstHex;f.getEncodedHex();this.valueList=[f]}else{if(h.tst instanceof e){}else{throw"tst param shall be ASN1Object or hex string"}}}}};YAHOO.lang.extend(KJUR.asn1.cades.SignatureTimeStamp,KJUR.asn1.cms.Attribute);KJUR.asn1.cades.CompleteCertificateRefs=function(d){var c=KJUR,b=c.asn1,a=b.cades;a.CompleteCertificateRefs.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.21";this.setByArray=function(e){this.valueList=[];for(var f=0;f<e.length;f++){var g=new a.OtherCertID(e[f]);this.valueList.push(g)}};if(d!==undefined){if(typeof d=="object"&&typeof d.length=="number"){this.setByArray(d)}}};YAHOO.lang.extend(KJUR.asn1.cades.CompleteCertificateRefs,KJUR.asn1.cms.Attribute);KJUR.asn1.cades.OtherCertID=function(e){var c=KJUR,b=c.asn1,d=b.cms,a=b.cades;a.OtherCertID.superclass.constructor.call(this);this.hasIssuerSerial=true;this.dOtherCertHash=null;this.dIssuerSerial=null;this.setByCertPEM=function(f){this.dOtherCertHash=new a.OtherHash(f);if(this.hasIssuerSerial){this.dIssuerSerial=new d.IssuerAndSerialNumber(f)}};this.getEncodedHex=function(){if(this.hTLV!=null){return this.hTLV}if(this.dOtherCertHash==null){throw"otherCertHash not set"}var f=[this.dOtherCertHash];if(this.dIssuerSerial!=null){f.push(this.dIssuerSerial)}var g=new b.DERSequence({array:f});this.hTLV=g.getEncodedHex();return this.hTLV};if(e!==undefined){if(typeof e=="string"&&e.indexOf("-----BEGIN ")!=-1){this.setByCertPEM(e)}if(typeof e=="object"){if(e.hasis===false){this.hasIssuerSerial=false}if(typeof e.cert=="string"){this.setByCertPEM(e.cert)}}}};YAHOO.lang.extend(KJUR.asn1.cades.OtherCertID,KJUR.asn1.ASN1Object);KJUR.asn1.cades.OtherHash=function(f){var d=KJUR,c=d.asn1,e=c.cms,b=c.cades,g=b.OtherHashAlgAndValue,a=d.crypto.Util.hashHex;b.OtherHash.superclass.constructor.call(this);this.alg="sha256";this.dOtherHash=null;this.setByCertPEM=function(h){if(h.indexOf("-----BEGIN ")==-1){throw"certPEM not to seem PEM format"}var i=pemtohex(h);var j=a(i,this.alg);this.dOtherHash=new g({alg:this.alg,hash:j})};this.getEncodedHex=function(){if(this.dOtherHash==null){throw"OtherHash not set"}return this.dOtherHash.getEncodedHex()};if(f!==undefined){if(typeof f=="string"){if(f.indexOf("-----BEGIN ")!=-1){this.setByCertPEM(f)}else{if(f.match(/^[0-9A-Fa-f]+$/)){this.dOtherHash=new c.DEROctetString({hex:f})}else{throw"unsupported string value for params"}}}else{if(typeof f=="object"){if(typeof f.cert=="string"){if(typeof f.alg=="string"){this.alg=f.alg}this.setByCertPEM(f.cert)}else{this.dOtherHash=new g(f)}}}}};YAHOO.lang.extend(KJUR.asn1.cades.OtherHash,KJUR.asn1.ASN1Object);KJUR.asn1.cades.CAdESUtil=new function(){};KJUR.asn1.cades.CAdESUtil.addSigTS=function(c,b,a){};KJUR.asn1.cades.CAdESUtil.parseSignedDataForAddingUnsigned=function(f){var q=ASN1HEX,w=q.getChildIdx,b=q.getTLV,a=q.getTLVbyList,s=q.getTLVbyListEx,l=q.getIdxbyList,e=q.getIdxbyListEx,D=KJUR,h=D.asn1,m=h.ASN1Object,k=h.cms,j=k.SignedData,x=h.cades,B=x.CAdESUtil;var n={};if(a(f,0,[0])!="06092a864886f70d010702"){throw"hex is not CMS SignedData"}var A=l(f,0,[1,0]);var C=w(f,A);if(C.length<4){throw"num of SignedData elem shall be 4 at least"}var d=C.shift();n.version=b(f,d);var y=C.shift();n.algs=b(f,y);var c=C.shift();n.encapcontent=b(f,c);n.certs=null;n.revs=null;n.si=[];var p=C.shift();if(f.substr(p,2)=="a0"){n.certs=b(f,p);p=C.shift()}if(f.substr(p,2)=="a1"){n.revs=b(f,p);p=C.shift()}var v=p;if(f.substr(v,2)!="31"){throw"Can't find signerInfos"}var g=w(f,v);for(var t=0;t<g.length;t++){var u=g[t];var o=B.parseSignerInfoForAddingUnsigned(f,u,t);n.si[t]=o}var z=null;n.obj=new j();z=new m();z.hTLV=n.version;n.obj.dCMSVersion=z;z=new m();z.hTLV=n.algs;n.obj.dDigestAlgs=z;z=new m();z.hTLV=n.encapcontent;n.obj.dEncapContentInfo=z;z=new m();z.hTLV=n.certs;n.obj.dCerts=z;n.obj.signerInfoList=[];for(var t=0;t<n.si.length;t++){n.obj.signerInfoList.push(n.si[t].obj)}return n};KJUR.asn1.cades.CAdESUtil.parseSignerInfoForAddingUnsigned=function(g,q,c){var p=ASN1HEX,s=p.getChildIdx,a=p.getTLV,l=p.getV,v=KJUR,h=v.asn1,n=h.ASN1Object,j=h.cms,k=j.AttributeList,w=j.SignerInfo;var o={};var t=s(g,q);if(t.length!=6){throw"not supported items for SignerInfo (!=6)"}var d=t.shift();o.version=a(g,d);var e=t.shift();o.si=a(g,e);var m=t.shift();o.digalg=a(g,m);var f=t.shift();o.sattrs=a(g,f);var i=t.shift();o.sigalg=a(g,i);var b=t.shift();o.sig=a(g,b);o.sigval=l(g,b);var u=null;o.obj=new w();u=new n();u.hTLV=o.version;o.obj.dCMSVersion=u;u=new n();u.hTLV=o.si;o.obj.dSignerIdentifier=u;u=new n();u.hTLV=o.digalg;o.obj.dDigestAlgorithm=u;u=new n();u.hTLV=o.sattrs;o.obj.dSignedAttrs=u;u=new n();u.hTLV=o.sigalg;o.obj.dSigAlg=u;u=new n();u.hTLV=o.sig;o.obj.dSig=u;o.obj.dUnsignedAttrs=new k();return o};
if(typeof KJUR.asn1.csr=="undefined"||!KJUR.asn1.csr){KJUR.asn1.csr={}}KJUR.asn1.csr.CertificationRequest=function(d){var a=KJUR,f=a.asn1,b=f.DERBitString,e=f.DERSequence,k=f.csr,c=f.x509;k.CertificationRequest.superclass.constructor.call(this);var l=null;var j=null;var h=null;var i=null;var g=null;this.sign=function(p,n){if(this.prvKey==null){this.prvKey=n}this.asn1SignatureAlg=new c.AlgorithmIdentifier({name:p});var o=new a.crypto.Signature({alg:p});o.init(this.prvKey);o.updateHex(this.asn1CSRInfo.getEncodedHex());this.hexSig=o.sign();this.asn1Sig=new b({hex:"00"+this.hexSig});var m=new e({array:[this.asn1CSRInfo,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=m.getEncodedHex();this.isModified=false};this.getPEMString=function(){return hextopem(this.getEncodedHex(),"CERTIFICATE REQUEST")};this.getEncodedHex=function(){if(this.isModified==false&&this.hTLV!=null){return this.hTLV}throw"not signed yet"};if(d!==undefined&&d.csrinfo!==undefined){this.asn1CSRInfo=d.csrinfo}};YAHOO.lang.extend(KJUR.asn1.csr.CertificationRequest,KJUR.asn1.ASN1Object);KJUR.asn1.csr.CertificationRequestInfo=function(e){var b=KJUR,h=b.asn1,g=h.DERInteger,f=h.DERSequence,m=h.DERSet,j=h.DERNull,c=h.DERTaggedObject,k=h.DERObjectIdentifier,l=h.csr,d=h.x509,a=d.X500Name,n=d.Extension,i=KEYUTIL;l.CertificationRequestInfo.superclass.constructor.call(this);this._initialize=function(){this.asn1Array=new Array();this.asn1Version=new g({"int":0});this.asn1Subject=null;this.asn1SubjPKey=null;this.extensionsArray=new Array()};this.setSubjectByParam=function(o){this.asn1Subject=new a(o)};this.setSubjectPublicKeyByGetKey=function(p){var o=i.getKey(p);this.asn1SubjPKey=new d.SubjectPublicKeyInfo(o)};this.appendExtensionByName=function(p,o){n.appendByNameToArray(p,o,this.extensionsArray)};this.getEncodedHex=function(){this.asn1Array=new Array();this.asn1Array.push(this.asn1Version);this.asn1Array.push(this.asn1Subject);this.asn1Array.push(this.asn1SubjPKey);if(this.extensionsArray.length>0){var s=new f({array:this.extensionsArray});var r=new m({array:[s]});var q=new f({array:[new k({oid:"1.2.840.113549.1.9.14"}),r]});var p=new c({explicit:true,tag:"a0",obj:q});this.asn1Array.push(p)}else{var p=new c({explicit:false,tag:"a0",obj:new j()});this.asn1Array.push(p)}var t=new f({array:this.asn1Array});this.hTLV=t.getEncodedHex();this.isModified=false;return this.hTLV};this._initialize()};YAHOO.lang.extend(KJUR.asn1.csr.CertificationRequestInfo,KJUR.asn1.ASN1Object);KJUR.asn1.csr.CSRUtil=new function(){};KJUR.asn1.csr.CSRUtil.newCSRPEM=function(h){var c=KEYUTIL,b=KJUR.asn1.csr;if(h.subject===undefined){throw"parameter subject undefined"}if(h.sbjpubkey===undefined){throw"parameter sbjpubkey undefined"}if(h.sigalg===undefined){throw"parameter sigalg undefined"}if(h.sbjprvkey===undefined){throw"parameter sbjpubkey undefined"}var d=new b.CertificationRequestInfo();d.setSubjectByParam(h.subject);d.setSubjectPublicKeyByGetKey(h.sbjpubkey);if(h.ext!==undefined&&h.ext.length!==undefined){for(var e=0;e<h.ext.length;e++){for(key in h.ext[e]){d.appendExtensionByName(key,h.ext[e][key])}}}var f=new b.CertificationRequest({csrinfo:d});var a=c.getKey(h.sbjprvkey);f.sign(h.sigalg,a);var g=f.getPEMString();return g};KJUR.asn1.csr.CSRUtil.getInfo=function(c){var f=ASN1HEX;var g=f.getTLVbyListEx;var b={};b.subject={};b.pubkey={};if(c.indexOf("-----BEGIN CERTIFICATE REQUEST")==-1){throw"argument is not PEM file"}var e=pemtohex(c,"CERTIFICATE REQUEST");try{b.subject.hex=g(e,0,[0,1])}catch(d){}try{b.subject.name=X509.hex2dn(b.subject.hex)}catch(d){}b.pubkey.hex=g(e,0,[0,2]);b.pubkey.obj=KEYUTIL.getKey(b.pubkey.hex,null,"pkcs8pub");try{b.ext=[];var a=new X509();a.parseExt(c);b.ext.push({subjectAltName:{array:a.getExtSubjectAltName2()}})}catch(d){}return b};
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}if(typeof KJUR.asn1.ocsp=="undefined"||!KJUR.asn1.ocsp){KJUR.asn1.ocsp={}}KJUR.asn1.ocsp.DEFAULT_HASH="sha1";KJUR.asn1.ocsp.CertID=function(g){var d=KJUR,k=d.asn1,m=k.DEROctetString,j=k.DERInteger,h=k.DERSequence,f=k.x509,n=f.AlgorithmIdentifier,o=k.ocsp,l=o.DEFAULT_HASH,i=d.crypto,e=i.Util.hashHex,c=X509,q=ASN1HEX;o.CertID.superclass.constructor.call(this);this.dHashAlg=null;this.dIssuerNameHash=null;this.dIssuerKeyHash=null;this.dSerialNumber=null;this.setByValue=function(t,s,p,r){if(r===undefined){r=l}this.dHashAlg=new n({name:r});this.dIssuerNameHash=new m({hex:t});this.dIssuerKeyHash=new m({hex:s});this.dSerialNumber=new j({hex:p})};this.setByCert=function(x,t,v){if(v===undefined){v=l}var p=new c();p.readCertPEM(t);var y=new c();y.readCertPEM(x);var z=y.getPublicKeyHex();var w=q.getTLVbyList(z,0,[1,0],"30");var r=p.getSerialNumberHex();var s=e(y.getSubjectHex(),v);var u=e(w,v);this.setByValue(s,u,r,v);this.hoge=p.getSerialNumberHex()};this.getEncodedHex=function(){if(this.dHashAlg===null&&this.dIssuerNameHash===null&&this.dIssuerKeyHash===null&&this.dSerialNumber===null){throw"not yet set values"}var p=[this.dHashAlg,this.dIssuerNameHash,this.dIssuerKeyHash,this.dSerialNumber];var r=new h({array:p});this.hTLV=r.getEncodedHex();return this.hTLV};if(g!==undefined){var b=g;if(b.issuerCert!==undefined&&b.subjectCert!==undefined){var a=l;if(b.alg===undefined){a=undefined}this.setByCert(b.issuerCert,b.subjectCert,a)}else{if(b.namehash!==undefined&&b.keyhash!==undefined&&b.serial!==undefined){var a=l;if(b.alg===undefined){a=undefined}this.setByValue(b.namehash,b.keyhash,b.serial,a)}else{throw"invalid constructor arguments"}}}};YAHOO.lang.extend(KJUR.asn1.ocsp.CertID,KJUR.asn1.ASN1Object);KJUR.asn1.ocsp.Request=function(f){var c=KJUR,b=c.asn1,a=b.DERSequence,d=b.ocsp;d.Request.superclass.constructor.call(this);this.dReqCert=null;this.dExt=null;this.getEncodedHex=function(){var g=[];if(this.dReqCert===null){throw"reqCert not set"}g.push(this.dReqCert);var h=new a({array:g});this.hTLV=h.getEncodedHex();return this.hTLV};if(typeof f!=="undefined"){var e=new d.CertID(f);this.dReqCert=e}};YAHOO.lang.extend(KJUR.asn1.ocsp.Request,KJUR.asn1.ASN1Object);KJUR.asn1.ocsp.TBSRequest=function(e){var c=KJUR,b=c.asn1,a=b.DERSequence,d=b.ocsp;d.TBSRequest.superclass.constructor.call(this);this.version=0;this.dRequestorName=null;this.dRequestList=[];this.dRequestExt=null;this.setRequestListByParam=function(h){var f=[];for(var g=0;g<h.length;g++){var j=new d.Request(h[0]);f.push(j)}this.dRequestList=f};this.getEncodedHex=function(){var f=[];if(this.version!==0){throw"not supported version: "+this.version}if(this.dRequestorName!==null){throw"requestorName not supported"}var h=new a({array:this.dRequestList});f.push(h);if(this.dRequestExt!==null){throw"requestExtensions not supported"}var g=new a({array:f});this.hTLV=g.getEncodedHex();return this.hTLV};if(e!==undefined){if(e.reqList!==undefined){this.setRequestListByParam(e.reqList)}}};YAHOO.lang.extend(KJUR.asn1.ocsp.TBSRequest,KJUR.asn1.ASN1Object);KJUR.asn1.ocsp.OCSPRequest=function(f){var c=KJUR,b=c.asn1,a=b.DERSequence,d=b.ocsp;d.OCSPRequest.superclass.constructor.call(this);this.dTbsRequest=null;this.dOptionalSignature=null;this.getEncodedHex=function(){var g=[];if(this.dTbsRequest!==null){g.push(this.dTbsRequest)}else{throw"tbsRequest not set"}if(this.dOptionalSignature!==null){throw"optionalSignature not supported"}var h=new a({array:g});this.hTLV=h.getEncodedHex();return this.hTLV};if(f!==undefined){if(f.reqList!==undefined){var e=new d.TBSRequest(f);this.dTbsRequest=e}}};YAHOO.lang.extend(KJUR.asn1.ocsp.OCSPRequest,KJUR.asn1.ASN1Object);KJUR.asn1.ocsp.OCSPUtil={};KJUR.asn1.ocsp.OCSPUtil.getRequestHex=function(a,b,h){var d=KJUR,c=d.asn1,e=c.ocsp;if(h===undefined){h=e.DEFAULT_HASH}var g={alg:h,issuerCert:a,subjectCert:b};var f=new e.OCSPRequest({reqList:[g]});return f.getEncodedHex()};KJUR.asn1.ocsp.OCSPUtil.getOCSPResponseInfo=function(b){var m=ASN1HEX,c=m.getVbyList,k=m.getVbyListEx,e=m.getIdxbyList,d=m.getIdxbyListEx,g=m.getV;var n={};try{var j=k(b,0,[0],"0a");n.responseStatus=parseInt(j,16)}catch(f){}if(n.responseStatus!==0){return n}try{var i=e(b,0,[1,0,1,0,0,2,0,1]);if(b.substr(i,2)==="80"){n.certStatus="good"}else{if(b.substr(i,2)==="a1"){n.certStatus="revoked";n.revocationTime=hextoutf8(c(b,i,[0]))}else{if(b.substr(i,2)==="82"){n.certStatus="unknown"}}}}catch(f){}try{var a=e(b,0,[1,0,1,0,0,2,0,2]);n.thisUpdate=hextoutf8(g(b,a))}catch(f){}try{var l=e(b,0,[1,0,1,0,0,2,0,3]);if(b.substr(l,2)==="a0"){n.nextUpdate=hextoutf8(c(b,l,[0]))}}catch(f){}return n};
var KJUR;if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.lang=="undefined"||!KJUR.lang){KJUR.lang={}}KJUR.lang.String=function(){};function Base64x(){}function stoBA(d){var b=new Array();for(var c=0;c<d.length;c++){b[c]=d.charCodeAt(c)}return b}function BAtos(b){var d="";for(var c=0;c<b.length;c++){d=d+String.fromCharCode(b[c])}return d}function BAtohex(b){var e="";for(var d=0;d<b.length;d++){var c=b[d].toString(16);if(c.length==1){c="0"+c}e=e+c}return e}function stohex(a){return BAtohex(stoBA(a))}function stob64(a){return hex2b64(stohex(a))}function stob64u(a){return b64tob64u(hex2b64(stohex(a)))}function b64utos(a){return BAtos(b64toBA(b64utob64(a)))}function b64tob64u(a){a=a.replace(/\=/g,"");a=a.replace(/\+/g,"-");a=a.replace(/\//g,"_");return a}function b64utob64(a){if(a.length%4==2){a=a+"=="}else{if(a.length%4==3){a=a+"="}}a=a.replace(/-/g,"+");a=a.replace(/_/g,"/");return a}function hextob64u(a){if(a.length%2==1){a="0"+a}return b64tob64u(hex2b64(a))}function b64utohex(a){return b64tohex(b64utob64(a))}var utf8tob64u,b64utoutf8;if(typeof Buffer==="function"){utf8tob64u=function(a){return b64tob64u(new Buffer(a,"utf8").toString("base64"))};b64utoutf8=function(a){return new Buffer(b64utob64(a),"base64").toString("utf8")}}else{utf8tob64u=function(a){return hextob64u(uricmptohex(encodeURIComponentAll(a)))};b64utoutf8=function(a){return decodeURIComponent(hextouricmp(b64utohex(a)))}}function utf8tob64(a){return hex2b64(uricmptohex(encodeURIComponentAll(a)))}function b64toutf8(a){return decodeURIComponent(hextouricmp(b64tohex(a)))}function utf8tohex(a){return uricmptohex(encodeURIComponentAll(a))}function hextoutf8(a){return decodeURIComponent(hextouricmp(a))}function hextorstr(c){var b="";for(var a=0;a<c.length-1;a+=2){b+=String.fromCharCode(parseInt(c.substr(a,2),16))}return b}function rstrtohex(c){var a="";for(var b=0;b<c.length;b++){a+=("0"+c.charCodeAt(b).toString(16)).slice(-2)}return a}function hextob64(a){return hex2b64(a)}function hextob64nl(b){var a=hextob64(b);var c=a.replace(/(.{64})/g,"$1\r\n");c=c.replace(/\r\n$/,"");return c}function b64nltohex(b){var a=b.replace(/[^0-9A-Za-z\/+=]*/g,"");var c=b64tohex(a);return c}function hextopem(a,b){var c=hextob64nl(a);return"-----BEGIN "+b+"-----\r\n"+c+"\r\n-----END "+b+"-----\r\n"}function pemtohex(a,b){if(a.indexOf("-----BEGIN ")==-1){throw"can't find PEM header: "+b}if(b!==undefined){a=a.replace(new RegExp("^[^]*-----BEGIN "+b+"-----"),"");a=a.replace(new RegExp("-----END "+b+"-----[^]*$"),"")}else{a=a.replace(/^[^]*-----BEGIN [^-]+-----/,"");a=a.replace(/-----END [^-]+-----[^]*$/,"")}return b64nltohex(a)}function hextoArrayBuffer(d){if(d.length%2!=0){throw"input is not even length"}if(d.match(/^[0-9A-Fa-f]+$/)==null){throw"input is not hexadecimal"}var b=new ArrayBuffer(d.length/2);var a=new DataView(b);for(var c=0;c<d.length/2;c++){a.setUint8(c,parseInt(d.substr(c*2,2),16))}return b}function ArrayBuffertohex(b){var d="";var a=new DataView(b);for(var c=0;c<b.byteLength;c++){d+=("00"+a.getUint8(c).toString(16)).slice(-2)}return d}function zulutomsec(n){var l,j,m,e,f,i,b,k;var a,h,g,c;c=n.match(/^(\d{2}|\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(|\.\d+)Z$/);if(c){a=c[1];l=parseInt(a);if(a.length===2){if(50<=l&&l<100){l=1900+l}else{if(0<=l&&l<50){l=2000+l}}}j=parseInt(c[2])-1;m=parseInt(c[3]);e=parseInt(c[4]);f=parseInt(c[5]);i=parseInt(c[6]);b=0;h=c[7];if(h!==""){g=(h.substr(1)+"00").substr(0,3);b=parseInt(g)}return Date.UTC(l,j,m,e,f,i,b)}throw"unsupported zulu format: "+n}function zulutosec(a){var b=zulutomsec(a);return ~~(b/1000)}function zulutodate(a){return new Date(zulutomsec(a))}function datetozulu(g,e,f){var b;var a=g.getUTCFullYear();if(e){if(a<1950||2049<a){throw"not proper year for UTCTime: "+a}b=(""+a).slice(-2)}else{b=("000"+a).slice(-4)}b+=("0"+(g.getUTCMonth()+1)).slice(-2);b+=("0"+g.getUTCDate()).slice(-2);b+=("0"+g.getUTCHours()).slice(-2);b+=("0"+g.getUTCMinutes()).slice(-2);b+=("0"+g.getUTCSeconds()).slice(-2);if(f){var c=g.getUTCMilliseconds();if(c!==0){c=("00"+c).slice(-3);c=c.replace(/0+$/g,"");b+="."+c}}b+="Z";return b}function uricmptohex(a){return a.replace(/%/g,"")}function hextouricmp(a){return a.replace(/(..)/g,"%$1")}function ipv6tohex(g){var b="malformed IPv6 address";if(!g.match(/^[0-9A-Fa-f:]+$/)){throw b}g=g.toLowerCase();var d=g.split(":").length-1;if(d<2){throw b}var e=":".repeat(7-d+2);g=g.replace("::",e);var c=g.split(":");if(c.length!=8){throw b}for(var f=0;f<8;f++){c[f]=("0000"+c[f]).slice(-4)}return c.join("")}function hextoipv6(e){if(!e.match(/^[0-9A-Fa-f]{32}$/)){throw"malformed IPv6 address octet"}e=e.toLowerCase();var b=e.match(/.{1,4}/g);for(var d=0;d<8;d++){b[d]=b[d].replace(/^0+/,"");if(b[d]==""){b[d]="0"}}e=":"+b.join(":")+":";var c=e.match(/:(0:){2,}/g);if(c===null){return e.slice(1,-1)}var f="";for(var d=0;d<c.length;d++){if(c[d].length>f.length){f=c[d]}}e=e.replace(f,"::");return e.slice(1,-1)}function hextoip(b){var d="malformed hex value";if(!b.match(/^([0-9A-Fa-f][0-9A-Fa-f]){1,}$/)){throw d}if(b.length==8){var c;try{c=parseInt(b.substr(0,2),16)+"."+parseInt(b.substr(2,2),16)+"."+parseInt(b.substr(4,2),16)+"."+parseInt(b.substr(6,2),16);return c}catch(a){throw d}}else{if(b.length==32){return hextoipv6(b)}else{return b}}}function iptohex(f){var j="malformed IP address";f=f.toLowerCase(f);if(f.match(/^[0-9.]+$/)){var b=f.split(".");if(b.length!==4){throw j}var g="";try{for(var e=0;e<4;e++){var h=parseInt(b[e]);g+=("0"+h.toString(16)).slice(-2)}return g}catch(c){throw j}}else{if(f.match(/^[0-9a-f:]+$/)&&f.indexOf(":")!==-1){return ipv6tohex(f)}else{throw j}}}function encodeURIComponentAll(a){var d=encodeURIComponent(a);var b="";for(var c=0;c<d.length;c++){if(d[c]=="%"){b=b+d.substr(c,3);c=c+2}else{b=b+"%"+stohex(d[c])}}return b}function newline_toUnix(a){a=a.replace(/\r\n/mg,"\n");return a}function newline_toDos(a){a=a.replace(/\r\n/mg,"\n");a=a.replace(/\n/mg,"\r\n");return a}KJUR.lang.String.isInteger=function(a){if(a.match(/^[0-9]+$/)){return true}else{if(a.match(/^-[0-9]+$/)){return true}else{return false}}};KJUR.lang.String.isHex=function(a){if(a.length%2==0&&(a.match(/^[0-9a-f]+$/)||a.match(/^[0-9A-F]+$/))){return true}else{return false}};KJUR.lang.String.isBase64=function(a){a=a.replace(/\s+/g,"");if(a.match(/^[0-9A-Za-z+\/]+={0,3}$/)&&a.length%4==0){return true}else{return false}};KJUR.lang.String.isBase64URL=function(a){if(a.match(/[+/=]/)){return false}a=b64utob64(a);return KJUR.lang.String.isBase64(a)};KJUR.lang.String.isIntegerArray=function(a){a=a.replace(/\s+/g,"");if(a.match(/^\[[0-9,]+\]$/)){return true}else{return false}};function hextoposhex(a){if(a.length%2==1){return"0"+a}if(a.substr(0,1)>"7"){return"00"+a}return a}function intarystrtohex(b){b=b.replace(/^\s*\[\s*/,"");b=b.replace(/\s*\]\s*$/,"");b=b.replace(/\s*/g,"");try{var c=b.split(/,/).map(function(g,e,h){var f=parseInt(g);if(f<0||255<f){throw"integer not in range 0-255"}var d=("00"+f.toString(16)).slice(-2);return d}).join("");return c}catch(a){throw"malformed integer array string: "+a}}var strdiffidx=function(c,a){var d=c.length;if(c.length>a.length){d=a.length}for(var b=0;b<d;b++){if(c.charCodeAt(b)!=a.charCodeAt(b)){return b}}if(c.length!=a.length){return d}return -1};
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.Util=new function(){this.DIGESTINFOHEAD={sha1:"3021300906052b0e03021a05000414",sha224:"302d300d06096086480165030402040500041c",sha256:"3031300d060960864801650304020105000420",sha384:"3041300d060960864801650304020205000430",sha512:"3051300d060960864801650304020305000440",md2:"3020300c06082a864886f70d020205000410",md5:"3020300c06082a864886f70d020505000410",ripemd160:"3021300906052b2403020105000414",};this.DEFAULTPROVIDER={md5:"cryptojs",sha1:"cryptojs",sha224:"cryptojs",sha256:"cryptojs",sha384:"cryptojs",sha512:"cryptojs",ripemd160:"cryptojs",hmacmd5:"cryptojs",hmacsha1:"cryptojs",hmacsha224:"cryptojs",hmacsha256:"cryptojs",hmacsha384:"cryptojs",hmacsha512:"cryptojs",hmacripemd160:"cryptojs",MD5withRSA:"cryptojs/jsrsa",SHA1withRSA:"cryptojs/jsrsa",SHA224withRSA:"cryptojs/jsrsa",SHA256withRSA:"cryptojs/jsrsa",SHA384withRSA:"cryptojs/jsrsa",SHA512withRSA:"cryptojs/jsrsa",RIPEMD160withRSA:"cryptojs/jsrsa",MD5withECDSA:"cryptojs/jsrsa",SHA1withECDSA:"cryptojs/jsrsa",SHA224withECDSA:"cryptojs/jsrsa",SHA256withECDSA:"cryptojs/jsrsa",SHA384withECDSA:"cryptojs/jsrsa",SHA512withECDSA:"cryptojs/jsrsa",RIPEMD160withECDSA:"cryptojs/jsrsa",SHA1withDSA:"cryptojs/jsrsa",SHA224withDSA:"cryptojs/jsrsa",SHA256withDSA:"cryptojs/jsrsa",MD5withRSAandMGF1:"cryptojs/jsrsa",SHAwithRSAandMGF1:"cryptojs/jsrsa",SHA1withRSAandMGF1:"cryptojs/jsrsa",SHA224withRSAandMGF1:"cryptojs/jsrsa",SHA256withRSAandMGF1:"cryptojs/jsrsa",SHA384withRSAandMGF1:"cryptojs/jsrsa",SHA512withRSAandMGF1:"cryptojs/jsrsa",RIPEMD160withRSAandMGF1:"cryptojs/jsrsa",};this.CRYPTOJSMESSAGEDIGESTNAME={md5:CryptoJS.algo.MD5,sha1:CryptoJS.algo.SHA1,sha224:CryptoJS.algo.SHA224,sha256:CryptoJS.algo.SHA256,sha384:CryptoJS.algo.SHA384,sha512:CryptoJS.algo.SHA512,ripemd160:CryptoJS.algo.RIPEMD160};this.getDigestInfoHex=function(a,b){if(typeof this.DIGESTINFOHEAD[b]=="undefined"){throw"alg not supported in Util.DIGESTINFOHEAD: "+b}return this.DIGESTINFOHEAD[b]+a};this.getPaddedDigestInfoHex=function(h,a,j){var c=this.getDigestInfoHex(h,a);var d=j/4;if(c.length+22>d){throw"key is too short for SigAlg: keylen="+j+","+a}var b="0001";var k="00"+c;var g="";var l=d-b.length-k.length;for(var f=0;f<l;f+=2){g+="ff"}var e=b+g+k;return e};this.hashString=function(a,c){var b=new KJUR.crypto.MessageDigest({alg:c});return b.digestString(a)};this.hashHex=function(b,c){var a=new KJUR.crypto.MessageDigest({alg:c});return a.digestHex(b)};this.sha1=function(a){return this.hashString(a,"sha1")};this.sha256=function(a){return this.hashString(a,"sha256")};this.sha256Hex=function(a){return this.hashHex(a,"sha256")};this.sha512=function(a){return this.hashString(a,"sha512")};this.sha512Hex=function(a){return this.hashHex(a,"sha512")};this.isKey=function(a){if(a instanceof RSAKey||a instanceof KJUR.crypto.DSA||a instanceof KJUR.crypto.ECDSA){return true}else{return false}}};KJUR.crypto.Util.md5=function(a){var b=new KJUR.crypto.MessageDigest({alg:"md5",prov:"cryptojs"});return b.digestString(a)};KJUR.crypto.Util.ripemd160=function(a){var b=new KJUR.crypto.MessageDigest({alg:"ripemd160",prov:"cryptojs"});return b.digestString(a)};KJUR.crypto.Util.SECURERANDOMGEN=new SecureRandom();KJUR.crypto.Util.getRandomHexOfNbytes=function(b){var a=new Array(b);KJUR.crypto.Util.SECURERANDOMGEN.nextBytes(a);return BAtohex(a)};KJUR.crypto.Util.getRandomBigIntegerOfNbytes=function(a){return new BigInteger(KJUR.crypto.Util.getRandomHexOfNbytes(a),16)};KJUR.crypto.Util.getRandomHexOfNbits=function(d){var c=d%8;var a=(d-c)/8;var b=new Array(a+1);KJUR.crypto.Util.SECURERANDOMGEN.nextBytes(b);b[0]=(((255<<c)&255)^255)&b[0];return BAtohex(b)};KJUR.crypto.Util.getRandomBigIntegerOfNbits=function(a){return new BigInteger(KJUR.crypto.Util.getRandomHexOfNbits(a),16)};KJUR.crypto.Util.getRandomBigIntegerZeroToMax=function(b){var a=b.bitLength();while(1){var c=KJUR.crypto.Util.getRandomBigIntegerOfNbits(a);if(b.compareTo(c)!=-1){return c}}};KJUR.crypto.Util.getRandomBigIntegerMinToMax=function(e,b){var c=e.compareTo(b);if(c==1){throw"biMin is greater than biMax"}if(c==0){return e}var a=b.subtract(e);var d=KJUR.crypto.Util.getRandomBigIntegerZeroToMax(a);return d.add(e)};KJUR.crypto.MessageDigest=function(c){var b=null;var a=null;var d=null;this.setAlgAndProvider=function(g,f){g=KJUR.crypto.MessageDigest.getCanonicalAlgName(g);if(g!==null&&f===undefined){f=KJUR.crypto.Util.DEFAULTPROVIDER[g]}if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(g)!=-1&&f=="cryptojs"){try{this.md=KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[g].create()}catch(e){throw"setAlgAndProvider hash alg set fail alg="+g+"/"+e}this.updateString=function(h){this.md.update(h)};this.updateHex=function(h){var i=CryptoJS.enc.Hex.parse(h);this.md.update(i)};this.digest=function(){var h=this.md.finalize();return h.toString(CryptoJS.enc.Hex)};this.digestString=function(h){this.updateString(h);return this.digest()};this.digestHex=function(h){this.updateHex(h);return this.digest()}}if(":sha256:".indexOf(g)!=-1&&f=="sjcl"){try{this.md=new sjcl.hash.sha256()}catch(e){throw"setAlgAndProvider hash alg set fail alg="+g+"/"+e}this.updateString=function(h){this.md.update(h)};this.updateHex=function(i){var h=sjcl.codec.hex.toBits(i);this.md.update(h)};this.digest=function(){var h=this.md.finalize();return sjcl.codec.hex.fromBits(h)};this.digestString=function(h){this.updateString(h);return this.digest()};this.digestHex=function(h){this.updateHex(h);return this.digest()}}};this.updateString=function(e){throw"updateString(str) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.updateHex=function(e){throw"updateHex(hex) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digest=function(){throw"digest() not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digestString=function(e){throw"digestString(str) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digestHex=function(e){throw"digestHex(hex) not supported for this alg/prov: "+this.algName+"/"+this.provName};if(c!==undefined){if(c.alg!==undefined){this.algName=c.alg;if(c.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]}this.setAlgAndProvider(this.algName,this.provName)}}};KJUR.crypto.MessageDigest.getCanonicalAlgName=function(a){if(typeof a==="string"){a=a.toLowerCase();a=a.replace(/-/,"")}return a};KJUR.crypto.MessageDigest.getHashLength=function(c){var b=KJUR.crypto.MessageDigest;var a=b.getCanonicalAlgName(c);if(b.HASHLENGTH[a]===undefined){throw"not supported algorithm: "+c}return b.HASHLENGTH[a]};KJUR.crypto.MessageDigest.HASHLENGTH={md5:16,sha1:20,sha224:28,sha256:32,sha384:48,sha512:64,ripemd160:20};KJUR.crypto.Mac=function(d){var f=null;var c=null;var a=null;var e=null;var b=null;this.setAlgAndProvider=function(k,i){k=k.toLowerCase();if(k==null){k="hmacsha1"}k=k.toLowerCase();if(k.substr(0,4)!="hmac"){throw"setAlgAndProvider unsupported HMAC alg: "+k}if(i===undefined){i=KJUR.crypto.Util.DEFAULTPROVIDER[k]}this.algProv=k+"/"+i;var g=k.substr(4);if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(g)!=-1&&i=="cryptojs"){try{var j=KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[g];this.mac=CryptoJS.algo.HMAC.create(j,this.pass)}catch(h){throw"setAlgAndProvider hash alg set fail hashAlg="+g+"/"+h}this.updateString=function(l){this.mac.update(l)};this.updateHex=function(l){var m=CryptoJS.enc.Hex.parse(l);this.mac.update(m)};this.doFinal=function(){var l=this.mac.finalize();return l.toString(CryptoJS.enc.Hex)};this.doFinalString=function(l){this.updateString(l);return this.doFinal()};this.doFinalHex=function(l){this.updateHex(l);return this.doFinal()}}};this.updateString=function(g){throw"updateString(str) not supported for this alg/prov: "+this.algProv};this.updateHex=function(g){throw"updateHex(hex) not supported for this alg/prov: "+this.algProv};this.doFinal=function(){throw"digest() not supported for this alg/prov: "+this.algProv};this.doFinalString=function(g){throw"digestString(str) not supported for this alg/prov: "+this.algProv};this.doFinalHex=function(g){throw"digestHex(hex) not supported for this alg/prov: "+this.algProv};this.setPassword=function(h){if(typeof h=="string"){var g=h;if(h.length%2==1||!h.match(/^[0-9A-Fa-f]+$/)){g=rstrtohex(h)}this.pass=CryptoJS.enc.Hex.parse(g);return}if(typeof h!="object"){throw"KJUR.crypto.Mac unsupported password type: "+h}var g=null;if(h.hex!==undefined){if(h.hex.length%2!=0||!h.hex.match(/^[0-9A-Fa-f]+$/)){throw"Mac: wrong hex password: "+h.hex}g=h.hex}if(h.utf8!==undefined){g=utf8tohex(h.utf8)}if(h.rstr!==undefined){g=rstrtohex(h.rstr)}if(h.b64!==undefined){g=b64tohex(h.b64)}if(h.b64u!==undefined){g=b64utohex(h.b64u)}if(g==null){throw"KJUR.crypto.Mac unsupported password type: "+h}this.pass=CryptoJS.enc.Hex.parse(g)};if(d!==undefined){if(d.pass!==undefined){this.setPassword(d.pass)}if(d.alg!==undefined){this.algName=d.alg;if(d.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]}this.setAlgAndProvider(this.algName,this.provName)}}};KJUR.crypto.Signature=function(o){var q=null;var n=null;var r=null;var c=null;var l=null;var d=null;var k=null;var h=null;var p=null;var e=null;var b=-1;var g=null;var j=null;var a=null;var i=null;var f=null;this._setAlgNames=function(){var s=this.algName.match(/^(.+)with(.+)$/);if(s){this.mdAlgName=s[1].toLowerCase();this.pubkeyAlgName=s[2].toLowerCase();if(this.pubkeyAlgName=="rsaandmgf1"&&this.mdAlgName=="sha"){this.mdAlgName="sha1"}}};this._zeroPaddingOfSignature=function(x,w){var v="";var t=w/4-x.length;for(var u=0;u<t;u++){v=v+"0"}return v+x};this.setAlgAndProvider=function(u,t){this._setAlgNames();if(t!="cryptojs/jsrsa"){throw new Error("provider not supported: "+t)}if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(this.mdAlgName)!=-1){try{this.md=new KJUR.crypto.MessageDigest({alg:this.mdAlgName})}catch(s){throw new Error("setAlgAndProvider hash alg set fail alg="+this.mdAlgName+"/"+s)}this.init=function(w,x){var y=null;try{if(x===undefined){y=KEYUTIL.getKey(w)}else{y=KEYUTIL.getKey(w,x)}}catch(v){throw"init failed:"+v}if(y.isPrivate===true){this.prvKey=y;this.state="SIGN"}else{if(y.isPublic===true){this.pubKey=y;this.state="VERIFY"}else{throw"init failed.:"+y}}};this.updateString=function(v){this.md.updateString(v)};this.updateHex=function(v){this.md.updateHex(v)};this.sign=function(){this.sHashHex=this.md.digest();if(this.prvKey===undefined&&this.ecprvhex!==undefined&&this.eccurvename!==undefined&&KJUR.crypto.ECDSA!==undefined){this.prvKey=new KJUR.crypto.ECDSA({curve:this.eccurvename,prv:this.ecprvhex})}if(this.prvKey instanceof RSAKey&&this.pubkeyAlgName==="rsaandmgf1"){this.hSign=this.prvKey.signWithMessageHashPSS(this.sHashHex,this.mdAlgName,this.pssSaltLen)}else{if(this.prvKey instanceof RSAKey&&this.pubkeyAlgName==="rsa"){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex,this.mdAlgName)}else{if(this.prvKey instanceof KJUR.crypto.ECDSA){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex)}else{if(this.prvKey instanceof KJUR.crypto.DSA){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex)}else{throw"Signature: unsupported private key alg: "+this.pubkeyAlgName}}}}return this.hSign};this.signString=function(v){this.updateString(v);return this.sign()};this.signHex=function(v){this.updateHex(v);return this.sign()};this.verify=function(v){this.sHashHex=this.md.digest();if(this.pubKey===undefined&&this.ecpubhex!==undefined&&this.eccurvename!==undefined&&KJUR.crypto.ECDSA!==undefined){this.pubKey=new KJUR.crypto.ECDSA({curve:this.eccurvename,pub:this.ecpubhex})}if(this.pubKey instanceof RSAKey&&this.pubkeyAlgName==="rsaandmgf1"){return this.pubKey.verifyWithMessageHashPSS(this.sHashHex,v,this.mdAlgName,this.pssSaltLen)}else{if(this.pubKey instanceof RSAKey&&this.pubkeyAlgName==="rsa"){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{if(KJUR.crypto.ECDSA!==undefined&&this.pubKey instanceof KJUR.crypto.ECDSA){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{if(KJUR.crypto.DSA!==undefined&&this.pubKey instanceof KJUR.crypto.DSA){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{throw"Signature: unsupported public key alg: "+this.pubkeyAlgName}}}}}}};this.init=function(s,t){throw"init(key, pass) not supported for this alg:prov="+this.algProvName};this.updateString=function(s){throw"updateString(str) not supported for this alg:prov="+this.algProvName};this.updateHex=function(s){throw"updateHex(hex) not supported for this alg:prov="+this.algProvName};this.sign=function(){throw"sign() not supported for this alg:prov="+this.algProvName};this.signString=function(s){throw"digestString(str) not supported for this alg:prov="+this.algProvName};this.signHex=function(s){throw"digestHex(hex) not supported for this alg:prov="+this.algProvName};this.verify=function(s){throw"verify(hSigVal) not supported for this alg:prov="+this.algProvName};this.initParams=o;if(o!==undefined){if(o.alg!==undefined){this.algName=o.alg;if(o.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]}else{this.provName=o.prov}this.algProvName=this.algName+":"+this.provName;this.setAlgAndProvider(this.algName,this.provName);this._setAlgNames()}if(o.psssaltlen!==undefined){this.pssSaltLen=o.psssaltlen}if(o.prvkeypem!==undefined){if(o.prvkeypas!==undefined){throw"both prvkeypem and prvkeypas parameters not supported"}else{try{var q=KEYUTIL.getKey(o.prvkeypem);this.init(q)}catch(m){throw"fatal error to load pem private key: "+m}}}}};KJUR.crypto.Cipher=function(a){};KJUR.crypto.Cipher.encrypt=function(e,f,d){if(f instanceof RSAKey&&f.isPublic){var c=KJUR.crypto.Cipher.getAlgByKeyAndName(f,d);if(c==="RSA"){return f.encrypt(e)}if(c==="RSAOAEP"){return f.encryptOAEP(e,"sha1")}var b=c.match(/^RSAOAEP(\d+)$/);if(b!==null){return f.encryptOAEP(e,"sha"+b[1])}throw"Cipher.encrypt: unsupported algorithm for RSAKey: "+d}else{throw"Cipher.encrypt: unsupported key or algorithm"}};KJUR.crypto.Cipher.decrypt=function(e,f,d){if(f instanceof RSAKey&&f.isPrivate){var c=KJUR.crypto.Cipher.getAlgByKeyAndName(f,d);if(c==="RSA"){return f.decrypt(e)}if(c==="RSAOAEP"){return f.decryptOAEP(e,"sha1")}var b=c.match(/^RSAOAEP(\d+)$/);if(b!==null){return f.decryptOAEP(e,"sha"+b[1])}throw"Cipher.decrypt: unsupported algorithm for RSAKey: "+d}else{throw"Cipher.decrypt: unsupported key or algorithm"}};KJUR.crypto.Cipher.getAlgByKeyAndName=function(b,a){if(b instanceof RSAKey){if(":RSA:RSAOAEP:RSAOAEP224:RSAOAEP256:RSAOAEP384:RSAOAEP512:".indexOf(a)!=-1){return a}if(a===null||a===undefined){return"RSA"}throw"getAlgByKeyAndName: not supported algorithm name for RSAKey: "+a}throw"getAlgByKeyAndName: not supported algorithm name: "+a};KJUR.crypto.OID=new function(){this.oidhex2name={"2a864886f70d010101":"rsaEncryption","2a8648ce3d0201":"ecPublicKey","2a8648ce380401":"dsa","2a8648ce3d030107":"secp256r1","2b8104001f":"secp192k1","2b81040021":"secp224r1","2b8104000a":"secp256k1","2b81040023":"secp521r1","2b81040022":"secp384r1","2a8648ce380403":"SHA1withDSA","608648016503040301":"SHA224withDSA","608648016503040302":"SHA256withDSA",}};
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.ECDSA=function(e){var g="secp256r1";var p=null;var b=null;var i=null;var j=Error,f=BigInteger,h=ECPointFp,m=KJUR.crypto.ECDSA,c=KJUR.crypto.ECParameterDB,d=m.getName,q=ASN1HEX,n=q.getVbyListEx,k=q.isASN1HEX;var a=new SecureRandom();var o=null;this.type="EC";this.isPrivate=false;this.isPublic=false;function l(x,t,w,s){var r=Math.max(t.bitLength(),s.bitLength());var y=x.add2D(w);var v=x.curve.getInfinity();for(var u=r-1;u>=0;--u){v=v.twice2D();v.z=f.ONE;if(t.testBit(u)){if(s.testBit(u)){v=v.add2D(y)}else{v=v.add2D(x)}}else{if(s.testBit(u)){v=v.add2D(w)}}}return v}this.getBigRandom=function(r){return new f(r.bitLength(),a).mod(r.subtract(f.ONE)).add(f.ONE)};this.setNamedCurve=function(r){this.ecparams=c.getByName(r);this.prvKeyHex=null;this.pubKeyHex=null;this.curveName=r};this.setPrivateKeyHex=function(r){this.isPrivate=true;this.prvKeyHex=r};this.setPublicKeyHex=function(r){this.isPublic=true;this.pubKeyHex=r};this.getPublicKeyXYHex=function(){var t=this.pubKeyHex;if(t.substr(0,2)!=="04"){throw"this method supports uncompressed format(04) only"}var s=this.ecparams.keylen/4;if(t.length!==2+s*2){throw"malformed public key hex length"}var r={};r.x=t.substr(2,s);r.y=t.substr(2+s);return r};this.getShortNISTPCurveName=function(){var r=this.curveName;if(r==="secp256r1"||r==="NIST P-256"||r==="P-256"||r==="prime256v1"){return"P-256"}if(r==="secp384r1"||r==="NIST P-384"||r==="P-384"){return"P-384"}return null};this.generateKeyPairHex=function(){var t=this.ecparams.n;var w=this.getBigRandom(t);var u=this.ecparams.G.multiply(w);var z=u.getX().toBigInteger();var x=u.getY().toBigInteger();var r=this.ecparams.keylen/4;var v=("0000000000"+w.toString(16)).slice(-r);var A=("0000000000"+z.toString(16)).slice(-r);var y=("0000000000"+x.toString(16)).slice(-r);var s="04"+A+y;this.setPrivateKeyHex(v);this.setPublicKeyHex(s);return{ecprvhex:v,ecpubhex:s}};this.signWithMessageHash=function(r){return this.signHex(r,this.prvKeyHex)};this.signHex=function(x,u){var A=new f(u,16);var v=this.ecparams.n;var z=new f(x.substring(0,this.ecparams.keylen/4),16);do{var w=this.getBigRandom(v);var B=this.ecparams.G;var y=B.multiply(w);var t=y.getX().toBigInteger().mod(v)}while(t.compareTo(f.ZERO)<=0);var C=w.modInverse(v).multiply(z.add(A.multiply(t))).mod(v);return m.biRSSigToASN1Sig(t,C)};this.sign=function(w,B){var z=B;var u=this.ecparams.n;var y=f.fromByteArrayUnsigned(w);do{var v=this.getBigRandom(u);var A=this.ecparams.G;var x=A.multiply(v);var t=x.getX().toBigInteger().mod(u)}while(t.compareTo(BigInteger.ZERO)<=0);var C=v.modInverse(u).multiply(y.add(z.multiply(t))).mod(u);return this.serializeSig(t,C)};this.verifyWithMessageHash=function(s,r){return this.verifyHex(s,r,this.pubKeyHex)};this.verifyHex=function(v,y,u){try{var t,B;var w=m.parseSigHex(y);t=w.r;B=w.s;var x=h.decodeFromHex(this.ecparams.curve,u);var z=new f(v.substring(0,this.ecparams.keylen/4),16);return this.verifyRaw(z,t,B,x)}catch(A){return false}};this.verify=function(z,A,u){var w,t;if(Bitcoin.Util.isArray(A)){var y=this.parseSig(A);w=y.r;t=y.s}else{if("object"===typeof A&&A.r&&A.s){w=A.r;t=A.s}else{throw"Invalid value for signature"}}var v;if(u instanceof ECPointFp){v=u}else{if(Bitcoin.Util.isArray(u)){v=h.decodeFrom(this.ecparams.curve,u)}else{throw"Invalid format for pubkey value, must be byte array or ECPointFp"}}var x=f.fromByteArrayUnsigned(z);return this.verifyRaw(x,w,t,v)};this.verifyRaw=function(z,t,E,y){var x=this.ecparams.n;var D=this.ecparams.G;if(t.compareTo(f.ONE)<0||t.compareTo(x)>=0){return false}if(E.compareTo(f.ONE)<0||E.compareTo(x)>=0){return false}var A=E.modInverse(x);var w=z.multiply(A).mod(x);var u=t.multiply(A).mod(x);var B=D.multiply(w).add(y.multiply(u));var C=B.getX().toBigInteger().mod(x);return C.equals(t)};this.serializeSig=function(v,u){var w=v.toByteArraySigned();var t=u.toByteArraySigned();var x=[];x.push(2);x.push(w.length);x=x.concat(w);x.push(2);x.push(t.length);x=x.concat(t);x.unshift(x.length);x.unshift(48);return x};this.parseSig=function(y){var x;if(y[0]!=48){throw new Error("Signature not a valid DERSequence")}x=2;if(y[x]!=2){throw new Error("First element in signature must be a DERInteger")}var w=y.slice(x+2,x+2+y[x+1]);x+=2+y[x+1];if(y[x]!=2){throw new Error("Second element in signature must be a DERInteger")}var t=y.slice(x+2,x+2+y[x+1]);x+=2+y[x+1];var v=f.fromByteArrayUnsigned(w);var u=f.fromByteArrayUnsigned(t);return{r:v,s:u}};this.parseSigCompact=function(w){if(w.length!==65){throw"Signature has the wrong length"}var t=w[0]-27;if(t<0||t>7){throw"Invalid signature type"}var x=this.ecparams.n;var v=f.fromByteArrayUnsigned(w.slice(1,33)).mod(x);var u=f.fromByteArrayUnsigned(w.slice(33,65)).mod(x);return{r:v,s:u,i:t}};this.readPKCS5PrvKeyHex=function(u){if(k(u)===false){throw new Error("not ASN.1 hex string")}var r,t,v;try{r=n(u,0,["[0]",0],"06");t=n(u,0,[1],"04");try{v=n(u,0,["[1]",0],"03")}catch(s){}}catch(s){throw new Error("malformed PKCS#1/5 plain ECC private key")}this.curveName=d(r);if(this.curveName===undefined){throw"unsupported curve name"}this.setNamedCurve(this.curveName);this.setPublicKeyHex(v);this.setPrivateKeyHex(t);this.isPublic=false};this.readPKCS8PrvKeyHex=function(v){if(k(v)===false){throw new j("not ASN.1 hex string")}var t,r,u,w;try{t=n(v,0,[1,0],"06");r=n(v,0,[1,1],"06");u=n(v,0,[2,0,1],"04");try{w=n(v,0,[2,0,"[1]",0],"03")}catch(s){}}catch(s){throw new j("malformed PKCS#8 plain ECC private key")}this.curveName=d(r);if(this.curveName===undefined){throw new j("unsupported curve name")}this.setNamedCurve(this.curveName);this.setPublicKeyHex(w);this.setPrivateKeyHex(u);this.isPublic=false};this.readPKCS8PubKeyHex=function(u){if(k(u)===false){throw new j("not ASN.1 hex string")}var t,r,v;try{t=n(u,0,[0,0],"06");r=n(u,0,[0,1],"06");v=n(u,0,[1],"03")}catch(s){throw new j("malformed PKCS#8 ECC public key")}this.curveName=d(r);if(this.curveName===null){throw new j("unsupported curve name")}this.setNamedCurve(this.curveName);this.setPublicKeyHex(v)};this.readCertPubKeyHex=function(t,v){if(k(t)===false){throw new j("not ASN.1 hex string")}var r,u;try{r=n(t,0,[0,5,0,1],"06");u=n(t,0,[0,5,1],"03")}catch(s){throw new j("malformed X.509 certificate ECC public key")}this.curveName=d(r);if(this.curveName===null){throw new j("unsupported curve name")}this.setNamedCurve(this.curveName);this.setPublicKeyHex(u)};if(e!==undefined){if(e.curve!==undefined){this.curveName=e.curve}}if(this.curveName===undefined){this.curveName=g}this.setNamedCurve(this.curveName);if(e!==undefined){if(e.prv!==undefined){this.setPrivateKeyHex(e.prv)}if(e.pub!==undefined){this.setPublicKeyHex(e.pub)}}};KJUR.crypto.ECDSA.parseSigHex=function(a){var b=KJUR.crypto.ECDSA.parseSigHexInHexRS(a);var d=new BigInteger(b.r,16);var c=new BigInteger(b.s,16);return{r:d,s:c}};KJUR.crypto.ECDSA.parseSigHexInHexRS=function(f){var j=ASN1HEX,i=j.getChildIdx,g=j.getV;j.checkStrictDER(f,0);if(f.substr(0,2)!="30"){throw new Error("signature is not a ASN.1 sequence")}var h=i(f,0);if(h.length!=2){throw new Error("signature shall have two elements")}var e=h[0];var d=h[1];if(f.substr(e,2)!="02"){throw new Error("1st item not ASN.1 integer")}if(f.substr(d,2)!="02"){throw new Error("2nd item not ASN.1 integer")}var c=g(f,e);var b=g(f,d);return{r:c,s:b}};KJUR.crypto.ECDSA.asn1SigToConcatSig=function(c){var d=KJUR.crypto.ECDSA.parseSigHexInHexRS(c);var b=d.r;var a=d.s;if(b.substr(0,2)=="00"&&(b.length%32)==2){b=b.substr(2)}if(a.substr(0,2)=="00"&&(a.length%32)==2){a=a.substr(2)}if((b.length%32)==30){b="00"+b}if((a.length%32)==30){a="00"+a}if(b.length%32!=0){throw"unknown ECDSA sig r length error"}if(a.length%32!=0){throw"unknown ECDSA sig s length error"}return b+a};KJUR.crypto.ECDSA.concatSigToASN1Sig=function(a){if((((a.length/2)*8)%(16*8))!=0){throw"unknown ECDSA concatinated r-s sig  length error"}var c=a.substr(0,a.length/2);var b=a.substr(a.length/2);return KJUR.crypto.ECDSA.hexRSSigToASN1Sig(c,b)};KJUR.crypto.ECDSA.hexRSSigToASN1Sig=function(b,a){var d=new BigInteger(b,16);var c=new BigInteger(a,16);return KJUR.crypto.ECDSA.biRSSigToASN1Sig(d,c)};KJUR.crypto.ECDSA.biRSSigToASN1Sig=function(f,d){var c=KJUR.asn1;var b=new c.DERInteger({bigint:f});var a=new c.DERInteger({bigint:d});var e=new c.DERSequence({array:[b,a]});return e.getEncodedHex()};KJUR.crypto.ECDSA.getName=function(a){if(a==="2b8104001f"){return"secp192k1"}if(a==="2a8648ce3d030107"){return"secp256r1"}if(a==="2b8104000a"){return"secp256k1"}if(a==="2b81040021"){return"secp224r1"}if(a==="2b81040022"){return"secp384r1"}if("|secp256r1|NIST P-256|P-256|prime256v1|".indexOf(a)!==-1){return"secp256r1"}if("|secp256k1|".indexOf(a)!==-1){return"secp256k1"}if("|secp224r1|NIST P-224|P-224|".indexOf(a)!==-1){return"secp224r1"}if("|secp384r1|NIST P-384|P-384|".indexOf(a)!==-1){return"secp384r1"}return null};
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.ECParameterDB=new function(){var b={};var c={};function a(d){return new BigInteger(d,16)}this.getByName=function(e){var d=e;if(typeof c[d]!="undefined"){d=c[e]}if(typeof b[d]!="undefined"){return b[d]}throw"unregistered EC curve name: "+d};this.regist=function(A,l,o,g,m,e,j,f,k,u,d,x){b[A]={};var s=a(o);var z=a(g);var y=a(m);var t=a(e);var w=a(j);var r=new ECCurveFp(s,z,y);var q=r.decodePointHex("04"+f+k);b[A]["name"]=A;b[A]["keylen"]=l;b[A]["curve"]=r;b[A]["G"]=q;b[A]["n"]=t;b[A]["h"]=w;b[A]["oid"]=d;b[A]["info"]=x;for(var v=0;v<u.length;v++){c[u[v]]=A}}};KJUR.crypto.ECParameterDB.regist("secp128r1",128,"FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF","FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFC","E87579C11079F43DD824993C2CEE5ED3","FFFFFFFE0000000075A30D1B9038A115","1","161FF7528B899B2D0C28607CA52C5B86","CF5AC8395BAFEB13C02DA292DDED7A83",[],"","secp128r1 : SECG curve over a 128 bit prime field");KJUR.crypto.ECParameterDB.regist("secp160k1",160,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73","0","7","0100000000000000000001B8FA16DFAB9ACA16B6B3","1","3B4C382CE37AA192A4019E763036F4F5DD4D7EBB","938CF935318FDCED6BC28286531733C3F03C4FEE",[],"","secp160k1 : SECG curve over a 160 bit prime field");KJUR.crypto.ECParameterDB.regist("secp160r1",160,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC","1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45","0100000000000000000001F4C8F927AED3CA752257","1","4A96B5688EF573284664698968C38BB913CBFC82","23A628553168947D59DCC912042351377AC5FB32",[],"","secp160r1 : SECG curve over a 160 bit prime field");KJUR.crypto.ECParameterDB.regist("secp192k1",192,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37","0","3","FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D","1","DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D","9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D",[]);KJUR.crypto.ECParameterDB.regist("secp192r1",192,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC","64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1","FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831","1","188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012","07192B95FFC8DA78631011ED6B24CDD573F977A11E794811",[]);KJUR.crypto.ECParameterDB.regist("secp224r1",224,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE","B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4","FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D","1","B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21","BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34",[]);KJUR.crypto.ECParameterDB.regist("secp256k1",256,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F","0","7","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141","1","79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798","483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8",[]);KJUR.crypto.ECParameterDB.regist("secp256r1",256,"FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF","FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC","5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B","FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551","1","6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296","4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5",["NIST P-256","P-256","prime256v1"]);KJUR.crypto.ECParameterDB.regist("secp384r1",384,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC","B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7634D81F4372DDF581A0DB248B0A77AECEC196ACCC52973","1","AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB7","3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f",["NIST P-384","P-384"]);KJUR.crypto.ECParameterDB.regist("secp521r1",521,"1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF","1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC","051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00","1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409","1","C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66","011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650",["NIST P-521","P-521"]);
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.DSA=function(){var b=ASN1HEX,e=b.getVbyList,d=b.getVbyListEx,a=b.isASN1HEX,c=BigInteger;this.p=null;this.q=null;this.g=null;this.y=null;this.x=null;this.type="DSA";this.isPrivate=false;this.isPublic=false;this.setPrivate=function(j,i,h,k,f){this.isPrivate=true;this.p=j;this.q=i;this.g=h;this.y=k;this.x=f};this.setPrivateHex=function(i,g,k,n,o){var h,f,j,l,m;h=new BigInteger(i,16);f=new BigInteger(g,16);j=new BigInteger(k,16);if(typeof n==="string"&&n.length>1){l=new BigInteger(n,16)}else{l=null}m=new BigInteger(o,16);this.setPrivate(h,f,j,l,m)};this.setPublic=function(i,h,f,j){this.isPublic=true;this.p=i;this.q=h;this.g=f;this.y=j;this.x=null};this.setPublicHex=function(k,j,i,l){var g,f,m,h;g=new BigInteger(k,16);f=new BigInteger(j,16);m=new BigInteger(i,16);h=new BigInteger(l,16);this.setPublic(g,f,m,h)};this.signWithMessageHash=function(j){var i=this.p;var h=this.q;var m=this.g;var o=this.y;var t=this.x;var l=KJUR.crypto.Util.getRandomBigIntegerMinToMax(BigInteger.ONE.add(BigInteger.ONE),h.subtract(BigInteger.ONE));var u=j.substr(0,h.bitLength()/4);var n=new BigInteger(u,16);var f=(m.modPow(l,i)).mod(h);var w=(l.modInverse(h).multiply(n.add(t.multiply(f)))).mod(h);var v=KJUR.asn1.ASN1Util.jsonToASN1HEX({seq:[{"int":{bigint:f}},{"int":{bigint:w}}]});return v};this.verifyWithMessageHash=function(m,l){var j=this.p;var h=this.q;var o=this.g;var u=this.y;var n=this.parseASN1Signature(l);var f=n[0];var C=n[1];var B=m.substr(0,h.bitLength()/4);var t=new BigInteger(B,16);if(BigInteger.ZERO.compareTo(f)>0||f.compareTo(h)>0){throw"invalid DSA signature"}if(BigInteger.ZERO.compareTo(C)>=0||C.compareTo(h)>0){throw"invalid DSA signature"}var x=C.modInverse(h);var k=t.multiply(x).mod(h);var i=f.multiply(x).mod(h);var A=o.modPow(k,j).multiply(u.modPow(i,j)).mod(j).mod(h);return A.compareTo(f)==0};this.parseASN1Signature=function(f){try{var i=new c(d(f,0,[0],"02"),16);var h=new c(d(f,0,[1],"02"),16);return[i,h]}catch(g){throw new Error("malformed ASN.1 DSA signature")}};this.readPKCS5PrvKeyHex=function(j){var k,i,g,l,m;if(a(j)===false){throw new Error("not ASN.1 hex string")}try{k=d(j,0,[1],"02");i=d(j,0,[2],"02");g=d(j,0,[3],"02");l=d(j,0,[4],"02");m=d(j,0,[5],"02")}catch(f){throw new Error("malformed PKCS#1/5 plain DSA private key")}this.setPrivateHex(k,i,g,l,m)};this.readPKCS8PrvKeyHex=function(j){var k,i,g,l;if(a(j)===false){throw new Error("not ASN.1 hex string")}try{k=d(j,0,[1,1,0],"02");i=d(j,0,[1,1,1],"02");g=d(j,0,[1,1,2],"02");l=d(j,0,[2,0],"02")}catch(f){throw new Error("malformed PKCS#8 plain DSA private key")}this.setPrivateHex(k,i,g,null,l)};this.readPKCS8PubKeyHex=function(j){var k,i,g,l;if(a(j)===false){throw new Error("not ASN.1 hex string")}try{k=d(j,0,[0,1,0],"02");i=d(j,0,[0,1,1],"02");g=d(j,0,[0,1,2],"02");l=d(j,0,[1,0],"02")}catch(f){throw new Error("malformed PKCS#8 DSA public key")}this.setPublicHex(k,i,g,l)};this.readCertPubKeyHex=function(j,m){var k,i,g,l;if(a(j)===false){throw new Error("not ASN.1 hex string")}try{k=d(j,0,[0,5,0,1,0],"02");i=d(j,0,[0,5,0,1,1],"02");g=d(j,0,[0,5,0,1,2],"02");l=d(j,0,[0,5,1,0],"02")}catch(f){throw new Error("malformed X.509 certificate DSA public key")}this.setPublicHex(k,i,g,l)}};
var KEYUTIL=function(){var d=function(p,r,q){return k(CryptoJS.AES,p,r,q)};var e=function(p,r,q){return k(CryptoJS.TripleDES,p,r,q)};var a=function(p,r,q){return k(CryptoJS.DES,p,r,q)};var k=function(s,x,u,q){var r=CryptoJS.enc.Hex.parse(x);var w=CryptoJS.enc.Hex.parse(u);var p=CryptoJS.enc.Hex.parse(q);var t={};t.key=w;t.iv=p;t.ciphertext=r;var v=s.decrypt(t,w,{iv:p});return CryptoJS.enc.Hex.stringify(v)};var l=function(p,r,q){return g(CryptoJS.AES,p,r,q)};var o=function(p,r,q){return g(CryptoJS.TripleDES,p,r,q)};var f=function(p,r,q){return g(CryptoJS.DES,p,r,q)};var g=function(t,y,v,q){var s=CryptoJS.enc.Hex.parse(y);var x=CryptoJS.enc.Hex.parse(v);var p=CryptoJS.enc.Hex.parse(q);var w=t.encrypt(s,x,{iv:p});var r=CryptoJS.enc.Hex.parse(w.toString());var u=CryptoJS.enc.Base64.stringify(r);return u};var i={"AES-256-CBC":{proc:d,eproc:l,keylen:32,ivlen:16},"AES-192-CBC":{proc:d,eproc:l,keylen:24,ivlen:16},"AES-128-CBC":{proc:d,eproc:l,keylen:16,ivlen:16},"DES-EDE3-CBC":{proc:e,eproc:o,keylen:24,ivlen:8},"DES-CBC":{proc:a,eproc:f,keylen:8,ivlen:8}};var c=function(p){return i[p]["proc"]};var m=function(p){var r=CryptoJS.lib.WordArray.random(p);var q=CryptoJS.enc.Hex.stringify(r);return q};var n=function(v){var w={};var q=v.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)","m"));if(q){w.cipher=q[1];w.ivsalt=q[2]}var p=v.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"));if(p){w.type=p[1]}var u=-1;var x=0;if(v.indexOf("\r\n\r\n")!=-1){u=v.indexOf("\r\n\r\n");x=2}if(v.indexOf("\n\n")!=-1){u=v.indexOf("\n\n");x=1}var t=v.indexOf("-----END");if(u!=-1&&t!=-1){var r=v.substring(u+x*2,t-x);r=r.replace(/\s+/g,"");w.data=r}return w};var j=function(q,y,p){var v=p.substring(0,16);var t=CryptoJS.enc.Hex.parse(v);var r=CryptoJS.enc.Utf8.parse(y);var u=i[q]["keylen"]+i[q]["ivlen"];var x="";var w=null;for(;;){var s=CryptoJS.algo.MD5.create();if(w!=null){s.update(w)}s.update(r);s.update(t);w=s.finalize();x=x+CryptoJS.enc.Hex.stringify(w);if(x.length>=u*2){break}}var z={};z.keyhex=x.substr(0,i[q]["keylen"]*2);z.ivhex=x.substr(i[q]["keylen"]*2,i[q]["ivlen"]*2);return z};var b=function(p,v,r,w){var s=CryptoJS.enc.Base64.parse(p);var q=CryptoJS.enc.Hex.stringify(s);var u=i[v]["proc"];var t=u(q,r,w);return t};var h=function(p,s,q,u){var r=i[s]["eproc"];var t=r(p,q,u);return t};return{version:"1.0.0",parsePKCS5PEM:function(p){return n(p)},getKeyAndUnusedIvByPasscodeAndIvsalt:function(q,p,r){return j(q,p,r)},decryptKeyB64:function(p,r,q,s){return b(p,r,q,s)},getDecryptedKeyHex:function(y,x){var q=n(y);var t=q.type;var r=q.cipher;var p=q.ivsalt;var s=q.data;var w=j(r,x,p);var v=w.keyhex;var u=b(s,r,v,p);return u},getEncryptedPKCS5PEMFromPrvKeyHex:function(x,s,A,t,r){var p="";if(typeof t=="undefined"||t==null){t="AES-256-CBC"}if(typeof i[t]=="undefined"){throw"KEYUTIL unsupported algorithm: "+t}if(typeof r=="undefined"||r==null){var v=i[t]["ivlen"];var u=m(v);r=u.toUpperCase()}var z=j(t,A,r);var y=z.keyhex;var w=h(s,t,y,r);var q=w.replace(/(.{64})/g,"$1\r\n");var p="-----BEGIN "+x+" PRIVATE KEY-----\r\n";p+="Proc-Type: 4,ENCRYPTED\r\n";p+="DEK-Info: "+t+","+r+"\r\n";p+="\r\n";p+=q;p+="\r\n-----END "+x+" PRIVATE KEY-----\r\n";return p},parseHexOfEncryptedPKCS8:function(y){var B=ASN1HEX;var z=B.getChildIdx;var w=B.getV;var t={};var r=z(y,0);if(r.length!=2){throw"malformed format: SEQUENCE(0).items != 2: "+r.length}t.ciphertext=w(y,r[1]);var A=z(y,r[0]);if(A.length!=2){throw"malformed format: SEQUENCE(0.0).items != 2: "+A.length}if(w(y,A[0])!="2a864886f70d01050d"){throw"this only supports pkcs5PBES2"}var p=z(y,A[1]);if(A.length!=2){throw"malformed format: SEQUENCE(0.0.1).items != 2: "+p.length}var q=z(y,p[1]);if(q.length!=2){throw"malformed format: SEQUENCE(0.0.1.1).items != 2: "+q.length}if(w(y,q[0])!="2a864886f70d0307"){throw"this only supports TripleDES"}t.encryptionSchemeAlg="TripleDES";t.encryptionSchemeIV=w(y,q[1]);var s=z(y,p[0]);if(s.length!=2){throw"malformed format: SEQUENCE(0.0.1.0).items != 2: "+s.length}if(w(y,s[0])!="2a864886f70d01050c"){throw"this only supports pkcs5PBKDF2"}var x=z(y,s[1]);if(x.length<2){throw"malformed format: SEQUENCE(0.0.1.0.1).items < 2: "+x.length}t.pbkdf2Salt=w(y,x[0]);var u=w(y,x[1]);try{t.pbkdf2Iter=parseInt(u,16)}catch(v){throw"malformed format pbkdf2Iter: "+u}return t},getPBKDF2KeyHexFromParam:function(u,p){var t=CryptoJS.enc.Hex.parse(u.pbkdf2Salt);var q=u.pbkdf2Iter;var s=CryptoJS.PBKDF2(p,t,{keySize:192/32,iterations:q});var r=CryptoJS.enc.Hex.stringify(s);return r},_getPlainPKCS8HexFromEncryptedPKCS8PEM:function(x,y){var r=pemtohex(x,"ENCRYPTED PRIVATE KEY");var p=this.parseHexOfEncryptedPKCS8(r);var u=KEYUTIL.getPBKDF2KeyHexFromParam(p,y);var v={};v.ciphertext=CryptoJS.enc.Hex.parse(p.ciphertext);var t=CryptoJS.enc.Hex.parse(u);var s=CryptoJS.enc.Hex.parse(p.encryptionSchemeIV);var w=CryptoJS.TripleDES.decrypt(v,t,{iv:s});var q=CryptoJS.enc.Hex.stringify(w);return q},getKeyFromEncryptedPKCS8PEM:function(s,q){var p=this._getPlainPKCS8HexFromEncryptedPKCS8PEM(s,q);var r=this.getKeyFromPlainPrivatePKCS8Hex(p);return r},parsePlainPrivatePKCS8Hex:function(s){var v=ASN1HEX;var u=v.getChildIdx;var t=v.getV;var q={};q.algparam=null;if(s.substr(0,2)!="30"){throw"malformed plain PKCS8 private key(code:001)"}var r=u(s,0);if(r.length!=3){throw"malformed plain PKCS8 private key(code:002)"}if(s.substr(r[1],2)!="30"){throw"malformed PKCS8 private key(code:003)"}var p=u(s,r[1]);if(p.length!=2){throw"malformed PKCS8 private key(code:004)"}if(s.substr(p[0],2)!="06"){throw"malformed PKCS8 private key(code:005)"}q.algoid=t(s,p[0]);if(s.substr(p[1],2)=="06"){q.algparam=t(s,p[1])}if(s.substr(r[2],2)!="04"){throw"malformed PKCS8 private key(code:006)"}q.keyidx=v.getVidx(s,r[2]);return q},getKeyFromPlainPrivatePKCS8PEM:function(q){var p=pemtohex(q,"PRIVATE KEY");var r=this.getKeyFromPlainPrivatePKCS8Hex(p);return r},getKeyFromPlainPrivatePKCS8Hex:function(p){var q=this.parsePlainPrivatePKCS8Hex(p);var r;if(q.algoid=="2a864886f70d010101"){r=new RSAKey()}else{if(q.algoid=="2a8648ce380401"){r=new KJUR.crypto.DSA()}else{if(q.algoid=="2a8648ce3d0201"){r=new KJUR.crypto.ECDSA()}else{throw"unsupported private key algorithm"}}}r.readPKCS8PrvKeyHex(p);return r},_getKeyFromPublicPKCS8Hex:function(q){var p;var r=ASN1HEX.getVbyList(q,0,[0,0],"06");if(r==="2a864886f70d010101"){p=new RSAKey()}else{if(r==="2a8648ce380401"){p=new KJUR.crypto.DSA()}else{if(r==="2a8648ce3d0201"){p=new KJUR.crypto.ECDSA()}else{throw"unsupported PKCS#8 public key hex"}}}p.readPKCS8PubKeyHex(q);return p},parsePublicRawRSAKeyHex:function(r){var u=ASN1HEX;var t=u.getChildIdx;var s=u.getV;var p={};if(r.substr(0,2)!="30"){throw"malformed RSA key(code:001)"}var q=t(r,0);if(q.length!=2){throw"malformed RSA key(code:002)"}if(r.substr(q[0],2)!="02"){throw"malformed RSA key(code:003)"}p.n=s(r,q[0]);if(r.substr(q[1],2)!="02"){throw"malformed RSA key(code:004)"}p.e=s(r,q[1]);return p},parsePublicPKCS8Hex:function(t){var v=ASN1HEX;var u=v.getChildIdx;var s=v.getV;var q={};q.algparam=null;var r=u(t,0);if(r.length!=2){throw"outer DERSequence shall have 2 elements: "+r.length}var w=r[0];if(t.substr(w,2)!="30"){throw"malformed PKCS8 public key(code:001)"}var p=u(t,w);if(p.length!=2){throw"malformed PKCS8 public key(code:002)"}if(t.substr(p[0],2)!="06"){throw"malformed PKCS8 public key(code:003)"}q.algoid=s(t,p[0]);if(t.substr(p[1],2)=="06"){q.algparam=s(t,p[1])}else{if(t.substr(p[1],2)=="30"){q.algparam={};q.algparam.p=v.getVbyList(t,p[1],[0],"02");q.algparam.q=v.getVbyList(t,p[1],[1],"02");q.algparam.g=v.getVbyList(t,p[1],[2],"02")}}if(t.substr(r[1],2)!="03"){throw"malformed PKCS8 public key(code:004)"}q.key=s(t,r[1]).substr(2);return q},}}();KEYUTIL.getKey=function(l,k,n){var G=ASN1HEX,L=G.getChildIdx,v=G.getV,d=G.getVbyList,c=KJUR.crypto,i=c.ECDSA,C=c.DSA,w=RSAKey,M=pemtohex,F=KEYUTIL;if(typeof w!="undefined"&&l instanceof w){return l}if(typeof i!="undefined"&&l instanceof i){return l}if(typeof C!="undefined"&&l instanceof C){return l}if(l.curve!==undefined&&l.xy!==undefined&&l.d===undefined){return new i({pub:l.xy,curve:l.curve})}if(l.curve!==undefined&&l.d!==undefined){return new i({prv:l.d,curve:l.curve})}if(l.kty===undefined&&l.n!==undefined&&l.e!==undefined&&l.d===undefined){var P=new w();P.setPublic(l.n,l.e);return P}if(l.kty===undefined&&l.n!==undefined&&l.e!==undefined&&l.d!==undefined&&l.p!==undefined&&l.q!==undefined&&l.dp!==undefined&&l.dq!==undefined&&l.co!==undefined&&l.qi===undefined){var P=new w();P.setPrivateEx(l.n,l.e,l.d,l.p,l.q,l.dp,l.dq,l.co);return P}if(l.kty===undefined&&l.n!==undefined&&l.e!==undefined&&l.d!==undefined&&l.p===undefined){var P=new w();P.setPrivate(l.n,l.e,l.d);return P}if(l.p!==undefined&&l.q!==undefined&&l.g!==undefined&&l.y!==undefined&&l.x===undefined){var P=new C();P.setPublic(l.p,l.q,l.g,l.y);return P}if(l.p!==undefined&&l.q!==undefined&&l.g!==undefined&&l.y!==undefined&&l.x!==undefined){var P=new C();P.setPrivate(l.p,l.q,l.g,l.y,l.x);return P}if(l.kty==="RSA"&&l.n!==undefined&&l.e!==undefined&&l.d===undefined){var P=new w();P.setPublic(b64utohex(l.n),b64utohex(l.e));return P}if(l.kty==="RSA"&&l.n!==undefined&&l.e!==undefined&&l.d!==undefined&&l.p!==undefined&&l.q!==undefined&&l.dp!==undefined&&l.dq!==undefined&&l.qi!==undefined){var P=new w();P.setPrivateEx(b64utohex(l.n),b64utohex(l.e),b64utohex(l.d),b64utohex(l.p),b64utohex(l.q),b64utohex(l.dp),b64utohex(l.dq),b64utohex(l.qi));return P}if(l.kty==="RSA"&&l.n!==undefined&&l.e!==undefined&&l.d!==undefined){var P=new w();P.setPrivate(b64utohex(l.n),b64utohex(l.e),b64utohex(l.d));return P}if(l.kty==="EC"&&l.crv!==undefined&&l.x!==undefined&&l.y!==undefined&&l.d===undefined){var j=new i({curve:l.crv});var t=j.ecparams.keylen/4;var B=("0000000000"+b64utohex(l.x)).slice(-t);var z=("0000000000"+b64utohex(l.y)).slice(-t);var u="04"+B+z;j.setPublicKeyHex(u);return j}if(l.kty==="EC"&&l.crv!==undefined&&l.x!==undefined&&l.y!==undefined&&l.d!==undefined){var j=new i({curve:l.crv});var t=j.ecparams.keylen/4;var B=("0000000000"+b64utohex(l.x)).slice(-t);var z=("0000000000"+b64utohex(l.y)).slice(-t);var u="04"+B+z;var b=("0000000000"+b64utohex(l.d)).slice(-t);j.setPublicKeyHex(u);j.setPrivateKeyHex(b);return j}if(n==="pkcs5prv"){var J=l,G=ASN1HEX,N,P;N=L(J,0);if(N.length===9){P=new w();P.readPKCS5PrvKeyHex(J)}else{if(N.length===6){P=new C();P.readPKCS5PrvKeyHex(J)}else{if(N.length>2&&J.substr(N[1],2)==="04"){P=new i();P.readPKCS5PrvKeyHex(J)}else{throw"unsupported PKCS#1/5 hexadecimal key"}}}return P}if(n==="pkcs8prv"){var P=F.getKeyFromPlainPrivatePKCS8Hex(l);return P}if(n==="pkcs8pub"){return F._getKeyFromPublicPKCS8Hex(l)}if(n==="x509pub"){return X509.getPublicKeyFromCertHex(l)}if(l.indexOf("-END CERTIFICATE-",0)!=-1||l.indexOf("-END X509 CERTIFICATE-",0)!=-1||l.indexOf("-END TRUSTED CERTIFICATE-",0)!=-1){return X509.getPublicKeyFromCertPEM(l)}if(l.indexOf("-END PUBLIC KEY-")!=-1){var O=pemtohex(l,"PUBLIC KEY");return F._getKeyFromPublicPKCS8Hex(O)}if(l.indexOf("-END RSA PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")==-1){var m=M(l,"RSA PRIVATE KEY");return F.getKey(m,null,"pkcs5prv")}if(l.indexOf("-END DSA PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")==-1){var I=M(l,"DSA PRIVATE KEY");var E=d(I,0,[1],"02");var D=d(I,0,[2],"02");var K=d(I,0,[3],"02");var r=d(I,0,[4],"02");var s=d(I,0,[5],"02");var P=new C();P.setPrivate(new BigInteger(E,16),new BigInteger(D,16),new BigInteger(K,16),new BigInteger(r,16),new BigInteger(s,16));return P}if(l.indexOf("-END EC PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")==-1){var m=M(l,"EC PRIVATE KEY");return F.getKey(m,null,"pkcs5prv")}if(l.indexOf("-END PRIVATE KEY-")!=-1){return F.getKeyFromPlainPrivatePKCS8PEM(l)}if(l.indexOf("-END RSA PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")!=-1){var o=F.getDecryptedKeyHex(l,k);var H=new RSAKey();H.readPKCS5PrvKeyHex(o);return H}if(l.indexOf("-END EC PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")!=-1){var I=F.getDecryptedKeyHex(l,k);var P=d(I,0,[1],"04");var f=d(I,0,[2,0],"06");var A=d(I,0,[3,0],"03").substr(2);var e="";if(KJUR.crypto.OID.oidhex2name[f]!==undefined){e=KJUR.crypto.OID.oidhex2name[f]}else{throw"undefined OID(hex) in KJUR.crypto.OID: "+f}var j=new i({curve:e});j.setPublicKeyHex(A);j.setPrivateKeyHex(P);j.isPublic=false;return j}if(l.indexOf("-END DSA PRIVATE KEY-")!=-1&&l.indexOf("4,ENCRYPTED")!=-1){var I=F.getDecryptedKeyHex(l,k);var E=d(I,0,[1],"02");var D=d(I,0,[2],"02");var K=d(I,0,[3],"02");var r=d(I,0,[4],"02");var s=d(I,0,[5],"02");var P=new C();P.setPrivate(new BigInteger(E,16),new BigInteger(D,16),new BigInteger(K,16),new BigInteger(r,16),new BigInteger(s,16));return P}if(l.indexOf("-END ENCRYPTED PRIVATE KEY-")!=-1){return F.getKeyFromEncryptedPKCS8PEM(l,k)}throw new Error("not supported argument")};KEYUTIL.generateKeypair=function(a,c){if(a=="RSA"){var b=c;var h=new RSAKey();h.generate(b,"10001");h.isPrivate=true;h.isPublic=true;var f=new RSAKey();var e=h.n.toString(16);var i=h.e.toString(16);f.setPublic(e,i);f.isPrivate=false;f.isPublic=true;var k={};k.prvKeyObj=h;k.pubKeyObj=f;return k}else{if(a=="EC"){var d=c;var g=new KJUR.crypto.ECDSA({curve:d});var j=g.generateKeyPairHex();var h=new KJUR.crypto.ECDSA({curve:d});h.setPublicKeyHex(j.ecpubhex);h.setPrivateKeyHex(j.ecprvhex);h.isPrivate=true;h.isPublic=false;var f=new KJUR.crypto.ECDSA({curve:d});f.setPublicKeyHex(j.ecpubhex);f.isPrivate=false;f.isPublic=true;var k={};k.prvKeyObj=h;k.pubKeyObj=f;return k}else{throw"unknown algorithm: "+a}}};KEYUTIL.getPEM=function(b,D,y,m,q,j){var F=KJUR,k=F.asn1,z=k.DERObjectIdentifier,f=k.DERInteger,l=k.ASN1Util.newObject,a=k.x509,C=a.SubjectPublicKeyInfo,e=F.crypto,u=e.DSA,r=e.ECDSA,n=RSAKey;function A(s){var G=l({seq:[{"int":0},{"int":{bigint:s.n}},{"int":s.e},{"int":{bigint:s.d}},{"int":{bigint:s.p}},{"int":{bigint:s.q}},{"int":{bigint:s.dmp1}},{"int":{bigint:s.dmq1}},{"int":{bigint:s.coeff}}]});return G}function B(G){var s=l({seq:[{"int":1},{octstr:{hex:G.prvKeyHex}},{tag:["a0",true,{oid:{name:G.curveName}}]},{tag:["a1",true,{bitstr:{hex:"00"+G.pubKeyHex}}]}]});return s}function x(s){var G=l({seq:[{"int":0},{"int":{bigint:s.p}},{"int":{bigint:s.q}},{"int":{bigint:s.g}},{"int":{bigint:s.y}},{"int":{bigint:s.x}}]});return G}if(((n!==undefined&&b instanceof n)||(u!==undefined&&b instanceof u)||(r!==undefined&&b instanceof r))&&b.isPublic==true&&(D===undefined||D=="PKCS8PUB")){var E=new C(b);var w=E.getEncodedHex();return hextopem(w,"PUBLIC KEY")}if(D=="PKCS1PRV"&&n!==undefined&&b instanceof n&&(y===undefined||y==null)&&b.isPrivate==true){var E=A(b);var w=E.getEncodedHex();return hextopem(w,"RSA PRIVATE KEY")}if(D=="PKCS1PRV"&&r!==undefined&&b instanceof r&&(y===undefined||y==null)&&b.isPrivate==true){var i=new z({name:b.curveName});var v=i.getEncodedHex();var h=B(b);var t=h.getEncodedHex();var p="";p+=hextopem(v,"EC PARAMETERS");p+=hextopem(t,"EC PRIVATE KEY");return p}if(D=="PKCS1PRV"&&u!==undefined&&b instanceof u&&(y===undefined||y==null)&&b.isPrivate==true){var E=x(b);var w=E.getEncodedHex();return hextopem(w,"DSA PRIVATE KEY")}if(D=="PKCS5PRV"&&n!==undefined&&b instanceof n&&(y!==undefined&&y!=null)&&b.isPrivate==true){var E=A(b);var w=E.getEncodedHex();if(m===undefined){m="DES-EDE3-CBC"}return this.getEncryptedPKCS5PEMFromPrvKeyHex("RSA",w,y,m,j)}if(D=="PKCS5PRV"&&r!==undefined&&b instanceof r&&(y!==undefined&&y!=null)&&b.isPrivate==true){var E=B(b);var w=E.getEncodedHex();if(m===undefined){m="DES-EDE3-CBC"}return this.getEncryptedPKCS5PEMFromPrvKeyHex("EC",w,y,m,j)}if(D=="PKCS5PRV"&&u!==undefined&&b instanceof u&&(y!==undefined&&y!=null)&&b.isPrivate==true){var E=x(b);var w=E.getEncodedHex();if(m===undefined){m="DES-EDE3-CBC"}return this.getEncryptedPKCS5PEMFromPrvKeyHex("DSA",w,y,m,j)}var o=function(G,s){var I=c(G,s);var H=new l({seq:[{seq:[{oid:{name:"pkcs5PBES2"}},{seq:[{seq:[{oid:{name:"pkcs5PBKDF2"}},{seq:[{octstr:{hex:I.pbkdf2Salt}},{"int":I.pbkdf2Iter}]}]},{seq:[{oid:{name:"des-EDE3-CBC"}},{octstr:{hex:I.encryptionSchemeIV}}]}]}]},{octstr:{hex:I.ciphertext}}]});return H.getEncodedHex()};var c=function(N,O){var H=100;var M=CryptoJS.lib.WordArray.random(8);var L="DES-EDE3-CBC";var s=CryptoJS.lib.WordArray.random(8);var I=CryptoJS.PBKDF2(O,M,{keySize:192/32,iterations:H});var J=CryptoJS.enc.Hex.parse(N);var K=CryptoJS.TripleDES.encrypt(J,I,{iv:s})+"";var G={};G.ciphertext=K;G.pbkdf2Salt=CryptoJS.enc.Hex.stringify(M);G.pbkdf2Iter=H;G.encryptionSchemeAlg=L;G.encryptionSchemeIV=CryptoJS.enc.Hex.stringify(s);return G};if(D=="PKCS8PRV"&&n!=undefined&&b instanceof n&&b.isPrivate==true){var g=A(b);var d=g.getEncodedHex();var E=l({seq:[{"int":0},{seq:[{oid:{name:"rsaEncryption"}},{"null":true}]},{octstr:{hex:d}}]});var w=E.getEncodedHex();if(y===undefined||y==null){return hextopem(w,"PRIVATE KEY")}else{var t=o(w,y);return hextopem(t,"ENCRYPTED PRIVATE KEY")}}if(D=="PKCS8PRV"&&r!==undefined&&b instanceof r&&b.isPrivate==true){var g=new l({seq:[{"int":1},{octstr:{hex:b.prvKeyHex}},{tag:["a1",true,{bitstr:{hex:"00"+b.pubKeyHex}}]}]});var d=g.getEncodedHex();var E=l({seq:[{"int":0},{seq:[{oid:{name:"ecPublicKey"}},{oid:{name:b.curveName}}]},{octstr:{hex:d}}]});var w=E.getEncodedHex();if(y===undefined||y==null){return hextopem(w,"PRIVATE KEY")}else{var t=o(w,y);return hextopem(t,"ENCRYPTED PRIVATE KEY")}}if(D=="PKCS8PRV"&&u!==undefined&&b instanceof u&&b.isPrivate==true){var g=new f({bigint:b.x});var d=g.getEncodedHex();var E=l({seq:[{"int":0},{seq:[{oid:{name:"dsa"}},{seq:[{"int":{bigint:b.p}},{"int":{bigint:b.q}},{"int":{bigint:b.g}}]}]},{octstr:{hex:d}}]});var w=E.getEncodedHex();if(y===undefined||y==null){return hextopem(w,"PRIVATE KEY")}else{var t=o(w,y);return hextopem(t,"ENCRYPTED PRIVATE KEY")}}throw"unsupported object nor format"};KEYUTIL.getKeyFromCSRPEM=function(b){var a=pemtohex(b,"CERTIFICATE REQUEST");var c=KEYUTIL.getKeyFromCSRHex(a);return c};KEYUTIL.getKeyFromCSRHex=function(a){var c=KEYUTIL.parseCSRHex(a);var b=KEYUTIL.getKey(c.p8pubkeyhex,null,"pkcs8pub");return b};KEYUTIL.parseCSRHex=function(d){var i=ASN1HEX;var f=i.getChildIdx;var c=i.getTLV;var b={};var g=d;if(g.substr(0,2)!="30"){throw"malformed CSR(code:001)"}var e=f(g,0);if(e.length<1){throw"malformed CSR(code:002)"}if(g.substr(e[0],2)!="30"){throw"malformed CSR(code:003)"}var a=f(g,e[0]);if(a.length<3){throw"malformed CSR(code:004)"}b.p8pubkeyhex=c(g,a[2]);return b};KEYUTIL.getKeyID=function(f){var c=KEYUTIL;var e=ASN1HEX;if(typeof f==="string"&&f.indexOf("BEGIN ")!=-1){f=c.getKey(f)}var d=pemtohex(c.getPEM(f));var b=e.getIdxbyList(d,0,[1]);var a=e.getV(d,b).substring(2);return KJUR.crypto.Util.hashHex(a,"sha1")};KEYUTIL.getJWKFromKey=function(d){var b={};if(d instanceof RSAKey&&d.isPrivate){b.kty="RSA";b.n=hextob64u(d.n.toString(16));b.e=hextob64u(d.e.toString(16));b.d=hextob64u(d.d.toString(16));b.p=hextob64u(d.p.toString(16));b.q=hextob64u(d.q.toString(16));b.dp=hextob64u(d.dmp1.toString(16));b.dq=hextob64u(d.dmq1.toString(16));b.qi=hextob64u(d.coeff.toString(16));return b}else{if(d instanceof RSAKey&&d.isPublic){b.kty="RSA";b.n=hextob64u(d.n.toString(16));b.e=hextob64u(d.e.toString(16));return b}else{if(d instanceof KJUR.crypto.ECDSA&&d.isPrivate){var a=d.getShortNISTPCurveName();if(a!=="P-256"&&a!=="P-384"){throw"unsupported curve name for JWT: "+a}var c=d.getPublicKeyXYHex();b.kty="EC";b.crv=a;b.x=hextob64u(c.x);b.y=hextob64u(c.y);b.d=hextob64u(d.prvKeyHex);return b}else{if(d instanceof KJUR.crypto.ECDSA&&d.isPublic){var a=d.getShortNISTPCurveName();if(a!=="P-256"&&a!=="P-384"){throw"unsupported curve name for JWT: "+a}var c=d.getPublicKeyXYHex();b.kty="EC";b.crv=a;b.x=hextob64u(c.x);b.y=hextob64u(c.y);return b}}}}throw"not supported key object"};
RSAKey.getPosArrayOfChildrenFromHex=function(a){return ASN1HEX.getChildIdx(a,0)};RSAKey.getHexValueArrayOfChildrenFromHex=function(f){var n=ASN1HEX;var i=n.getV;var k=RSAKey.getPosArrayOfChildrenFromHex(f);var e=i(f,k[0]);var j=i(f,k[1]);var b=i(f,k[2]);var c=i(f,k[3]);var h=i(f,k[4]);var g=i(f,k[5]);var m=i(f,k[6]);var l=i(f,k[7]);var d=i(f,k[8]);var k=new Array();k.push(e,j,b,c,h,g,m,l,d);return k};RSAKey.prototype.readPrivateKeyFromPEMString=function(d){var c=pemtohex(d);var b=RSAKey.getHexValueArrayOfChildrenFromHex(c);this.setPrivateEx(b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8])};RSAKey.prototype.readPKCS5PrvKeyHex=function(c){var b=RSAKey.getHexValueArrayOfChildrenFromHex(c);this.setPrivateEx(b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8])};RSAKey.prototype.readPKCS8PrvKeyHex=function(e){var c,i,k,b,a,f,d,j;var m=ASN1HEX;var l=m.getVbyListEx;if(m.isASN1HEX(e)===false){throw new Error("not ASN.1 hex string")}try{c=l(e,0,[2,0,1],"02");i=l(e,0,[2,0,2],"02");k=l(e,0,[2,0,3],"02");b=l(e,0,[2,0,4],"02");a=l(e,0,[2,0,5],"02");f=l(e,0,[2,0,6],"02");d=l(e,0,[2,0,7],"02");j=l(e,0,[2,0,8],"02")}catch(g){throw new Error("malformed PKCS#8 plain RSA private key")}this.setPrivateEx(c,i,k,b,a,f,d,j)};RSAKey.prototype.readPKCS5PubKeyHex=function(c){var e=ASN1HEX;var b=e.getV;if(e.isASN1HEX(c)===false){throw"keyHex is not ASN.1 hex string"}var a=e.getChildIdx(c,0);if(a.length!==2||c.substr(a[0],2)!=="02"||c.substr(a[1],2)!=="02"){throw"wrong hex for PKCS#5 public key"}var f=b(c,a[0]);var d=b(c,a[1]);this.setPublic(f,d)};RSAKey.prototype.readPKCS8PubKeyHex=function(b){var c=ASN1HEX;if(c.isASN1HEX(b)===false){throw new Error("not ASN.1 hex string")}if(c.getTLVbyListEx(b,0,[0,0])!=="06092a864886f70d010101"){throw new Error("not PKCS8 RSA public key")}var a=c.getTLVbyListEx(b,0,[1,0]);this.readPKCS5PubKeyHex(a)};RSAKey.prototype.readCertPubKeyHex=function(b,d){var a,c;a=new X509();a.readCertHex(b);c=a.getPublicKeyHex();this.readPKCS8PubKeyHex(c)};
var _RE_HEXDECONLY=new RegExp("[^0-9a-f]","gi");function _rsasign_getHexPaddedDigestInfoForString(d,e,a){var b=function(f){return KJUR.crypto.Util.hashString(f,a)};var c=b(d);return KJUR.crypto.Util.getPaddedDigestInfoHex(c,a,e)}function _zeroPaddingOfSignature(e,d){var c="";var a=d/4-e.length;for(var b=0;b<a;b++){c=c+"0"}return c+e}RSAKey.prototype.sign=function(d,a){var b=function(e){return KJUR.crypto.Util.hashString(e,a)};var c=b(d);return this.signWithMessageHash(c,a)};RSAKey.prototype.signWithMessageHash=function(e,c){var f=KJUR.crypto.Util.getPaddedDigestInfoHex(e,c,this.n.bitLength());var b=parseBigInt(f,16);var d=this.doPrivate(b);var a=d.toString(16);return _zeroPaddingOfSignature(a,this.n.bitLength())};function pss_mgf1_str(c,a,e){var b="",d=0;while(b.length<a){b+=hextorstr(e(rstrtohex(c+String.fromCharCode.apply(String,[(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255]))));d+=1}return b}RSAKey.prototype.signPSS=function(e,a,d){var c=function(f){return KJUR.crypto.Util.hashHex(f,a)};var b=c(rstrtohex(e));if(d===undefined){d=-1}return this.signWithMessageHashPSS(b,a,d)};RSAKey.prototype.signWithMessageHashPSS=function(l,a,k){var b=hextorstr(l);var g=b.length;var m=this.n.bitLength()-1;var c=Math.ceil(m/8);var d;var o=function(i){return KJUR.crypto.Util.hashHex(i,a)};if(k===-1||k===undefined){k=g}else{if(k===-2){k=c-g-2}else{if(k<-2){throw"invalid salt length"}}}if(c<(g+k+2)){throw"data too long"}var f="";if(k>0){f=new Array(k);new SecureRandom().nextBytes(f);f=String.fromCharCode.apply(String,f)}var n=hextorstr(o(rstrtohex("\x00\x00\x00\x00\x00\x00\x00\x00"+b+f)));var j=[];for(d=0;d<c-k-g-2;d+=1){j[d]=0}var e=String.fromCharCode.apply(String,j)+"\x01"+f;var h=pss_mgf1_str(n,e.length,o);var q=[];for(d=0;d<e.length;d+=1){q[d]=e.charCodeAt(d)^h.charCodeAt(d)}var p=(65280>>(8*c-m))&255;q[0]&=~p;for(d=0;d<g;d++){q.push(n.charCodeAt(d))}q.push(188);return _zeroPaddingOfSignature(this.doPrivate(new BigInteger(q)).toString(16),this.n.bitLength())};function _rsasign_getDecryptSignatureBI(a,d,c){var b=new RSAKey();b.setPublic(d,c);var e=b.doPublic(a);return e}function _rsasign_getHexDigestInfoFromSig(a,c,b){var e=_rsasign_getDecryptSignatureBI(a,c,b);var d=e.toString(16).replace(/^1f+00/,"");return d}function _rsasign_getAlgNameAndHashFromHexDisgestInfo(f){for(var e in KJUR.crypto.Util.DIGESTINFOHEAD){var d=KJUR.crypto.Util.DIGESTINFOHEAD[e];var b=d.length;if(f.substring(0,b)==d){var c=[e,f.substring(b)];return c}}return[]}RSAKey.prototype.verify=function(f,j){j=j.replace(_RE_HEXDECONLY,"");j=j.replace(/[ \n]+/g,"");var b=parseBigInt(j,16);if(b.bitLength()>this.n.bitLength()){return 0}var i=this.doPublic(b);var e=i.toString(16).replace(/^1f+00/,"");var g=_rsasign_getAlgNameAndHashFromHexDisgestInfo(e);if(g.length==0){return false}var d=g[0];var h=g[1];var a=function(k){return KJUR.crypto.Util.hashString(k,d)};var c=a(f);return(h==c)};RSAKey.prototype.verifyWithMessageHash=function(e,a){if(a.length!=Math.ceil(this.n.bitLength()/4)){return false}var b=parseBigInt(a,16);if(b.bitLength()>this.n.bitLength()){return 0}var h=this.doPublic(b);var g=h.toString(16).replace(/^1f+00/,"");var c=_rsasign_getAlgNameAndHashFromHexDisgestInfo(g);if(c.length==0){return false}var d=c[0];var f=c[1];return(f==e)};RSAKey.prototype.verifyPSS=function(c,b,a,f){var e=function(g){return KJUR.crypto.Util.hashHex(g,a)};var d=e(rstrtohex(c));if(f===undefined){f=-1}return this.verifyWithMessageHashPSS(d,b,a,f)};RSAKey.prototype.verifyWithMessageHashPSS=function(f,s,l,c){if(s.length!=Math.ceil(this.n.bitLength()/4)){return false}var k=new BigInteger(s,16);var r=function(i){return KJUR.crypto.Util.hashHex(i,l)};var j=hextorstr(f);var h=j.length;var g=this.n.bitLength()-1;var m=Math.ceil(g/8);var q;if(c===-1||c===undefined){c=h}else{if(c===-2){c=m-h-2}else{if(c<-2){throw"invalid salt length"}}}if(m<(h+c+2)){throw"data too long"}var a=this.doPublic(k).toByteArray();for(q=0;q<a.length;q+=1){a[q]&=255}while(a.length<m){a.unshift(0)}if(a[m-1]!==188){throw"encoded message does not end in 0xbc"}a=String.fromCharCode.apply(String,a);var d=a.substr(0,m-h-1);var e=a.substr(d.length,h);var p=(65280>>(8*m-g))&255;if((d.charCodeAt(0)&p)!==0){throw"bits beyond keysize not zero"}var n=pss_mgf1_str(e,d.length,r);var o=[];for(q=0;q<d.length;q+=1){o[q]=d.charCodeAt(q)^n.charCodeAt(q)}o[0]&=~p;var b=m-h-c-2;for(q=0;q<b;q+=1){if(o[q]!==0){throw"leftmost octets not zero"}}if(o[b]!==1){throw"0x01 marker not found"}return e===hextorstr(r(rstrtohex("\x00\x00\x00\x00\x00\x00\x00\x00"+j+String.fromCharCode.apply(String,o.slice(-c)))))};RSAKey.SALT_LEN_HLEN=-1;RSAKey.SALT_LEN_MAX=-2;RSAKey.SALT_LEN_RECOVER=-2;
function X509(){var o=ASN1HEX,m=o.getChildIdx,k=o.getV,b=o.getTLV,h=o.getVbyList,n=o.getVbyListEx,c=o.getTLVbyList,e=o.getTLVbyListEx,i=o.getIdxbyList,d=o.getVidx,l=o.oidname,a=X509,g=pemtohex,f;try{f=KJUR.asn1.x509.AlgorithmIdentifier.PSSNAME2ASN1TLV}catch(j){}this.hex=null;this.version=0;this.foffset=0;this.aExtInfo=null;this.getVersion=function(){if(this.hex===null||this.version!==0){return this.version}if(c(this.hex,0,[0,0])!=="a003020102"){this.version=1;this.foffset=-1;return 1}this.version=3;return 3};this.getSerialNumberHex=function(){return h(this.hex,0,[0,1+this.foffset],"02")};this.getSignatureAlgorithmField=function(){var q=null;var p=e(this.hex,0,[0,1]);for(var r in f){if(p===f[r]){return r}}return l(n(this.hex,0,[0,1,0],"06"))};this.getIssuerHex=function(){return c(this.hex,0,[0,3+this.foffset],"30")};this.getIssuerString=function(){return a.hex2dn(this.getIssuerHex())};this.getSubjectHex=function(){return c(this.hex,0,[0,5+this.foffset],"30")};this.getSubjectString=function(){return a.hex2dn(this.getSubjectHex())};this.getNotBefore=function(){var p=h(this.hex,0,[0,4+this.foffset,0]);p=p.replace(/(..)/g,"%$1");p=decodeURIComponent(p);return p};this.getNotAfter=function(){var p=h(this.hex,0,[0,4+this.foffset,1]);p=p.replace(/(..)/g,"%$1");p=decodeURIComponent(p);return p};this.getPublicKeyHex=function(){return o.getTLVbyList(this.hex,0,[0,6+this.foffset],"30")};this.getPublicKeyIdx=function(){return i(this.hex,0,[0,6+this.foffset],"30")};this.getPublicKeyContentIdx=function(){var p=this.getPublicKeyIdx();return i(this.hex,p,[1,0],"30")};this.getPublicKey=function(){return KEYUTIL.getKey(this.getPublicKeyHex(),null,"pkcs8pub")};this.getSignatureAlgorithmName=function(){return l(h(this.hex,0,[1,0],"06"))};this.getSignatureValueHex=function(){return h(this.hex,0,[2],"03",true)};this.verifySignature=function(r){var s=this.getSignatureAlgorithmField();var p=this.getSignatureValueHex();var q=c(this.hex,0,[0],"30");var t=new KJUR.crypto.Signature({alg:s});t.init(r);t.updateHex(q);return t.verify(p)};this.parseExt=function(y){var r,p,t;if(y===undefined){t=this.hex;if(this.version!==3){return -1}r=i(t,0,[0,7,0],"30");p=m(t,r)}else{t=pemtohex(y);var u=i(t,0,[0,3,0,0],"06");if(k(t,u)!="2a864886f70d01090e"){this.aExtInfo=new Array();return}r=i(t,0,[0,3,0,1,0],"30");p=m(t,r);this.hex=t}this.aExtInfo=new Array();for(var s=0;s<p.length;s++){var w={};w.critical=false;var v=m(t,p[s]);var q=0;if(v.length===3){w.critical=true;q=1}w.oid=o.hextooidstr(h(t,p[s],[0],"06"));var x=i(t,p[s],[1+q]);w.vidx=d(t,x);this.aExtInfo.push(w)}};this.getExtInfo=function(r){var p=this.aExtInfo;var s=r;if(!r.match(/^[0-9.]+$/)){s=KJUR.asn1.x509.OID.name2oid(r)}if(s===""){return undefined}for(var q=0;q<p.length;q++){if(p[q].oid===s){return p[q]}}return undefined};this.getExtBasicConstraints=function(){var r=this.getExtInfo("basicConstraints");if(r===undefined){return r}var p=k(this.hex,r.vidx);if(p===""){return{}}if(p==="0101ff"){return{cA:true}}if(p.substr(0,8)==="0101ff02"){var s=k(p,6);var q=parseInt(s,16);return{cA:true,pathLen:q}}throw"basicConstraints parse error"};this.getExtKeyUsageBin=function(){var s=this.getExtInfo("keyUsage");if(s===undefined){return""}var q=k(this.hex,s.vidx);if(q.length%2!=0||q.length<=2){throw new Error("malformed key usage value")}var p=parseInt(q.substr(0,2));var r=parseInt(q.substr(2),16).toString(2);r=("0000000"+r).slice(-8);return r.substr(0,r.length-p)};this.getExtKeyUsageString=function(){var r=this.getExtKeyUsageBin();var p=new Array();for(var q=0;q<r.length;q++){if(r.substr(q,1)=="1"){p.push(X509.KEYUSAGE_NAME[q])}}return p.join(",")};this.getExtSubjectKeyIdentifier=function(){var p=this.getExtInfo("subjectKeyIdentifier");if(p===undefined){return p}return k(this.hex,p.vidx)};this.getExtAuthorityKeyIdentifier=function(){var t=this.getExtInfo("authorityKeyIdentifier");if(t===undefined){return t}var p={};var s=b(this.hex,t.vidx);var q=m(s,0);for(var r=0;r<q.length;r++){if(s.substr(q[r],2)==="80"){p.kid=k(s,q[r])}}return p};this.getExtExtKeyUsageName=function(){var t=this.getExtInfo("extKeyUsage");if(t===undefined){return t}var p=new Array();var s=b(this.hex,t.vidx);if(s===""){return p}var q=m(s,0);for(var r=0;r<q.length;r++){p.push(l(k(s,q[r])))}return p};this.getExtSubjectAltName=function(){var q=this.getExtSubjectAltName2();var p=new Array();for(var r=0;r<q.length;r++){if(q[r][0]==="DNS"){p.push(q[r][1])}}return p};this.getExtSubjectAltName2=function(){var t,w,v;var u=this.getExtInfo("subjectAltName");if(u===undefined){return u}var p=new Array();var s=b(this.hex,u.vidx);var q=m(s,0);for(var r=0;r<q.length;r++){v=s.substr(q[r],2);t=k(s,q[r]);if(v==="81"){w=hextoutf8(t);p.push(["MAIL",w])}if(v==="82"){w=hextoutf8(t);p.push(["DNS",w])}if(v==="84"){w=X509.hex2dn(t,0);p.push(["DN",w])}if(v==="86"){w=hextoutf8(t);p.push(["URI",w])}if(v==="87"){w=hextoip(t);p.push(["IP",w])}}return p};this.getExtCRLDistributionPointsURI=function(){var u=this.getExtInfo("cRLDistributionPoints");if(u===undefined){return u}var p=new Array();var q=m(this.hex,u.vidx);for(var s=0;s<q.length;s++){try{var v=h(this.hex,q[s],[0,0,0],"86");var t=hextoutf8(v);p.push(t)}catch(r){}}return p};this.getExtAIAInfo=function(){var t=this.getExtInfo("authorityInfoAccess");if(t===undefined){return t}var p={ocsp:[],caissuer:[]};var q=m(this.hex,t.vidx);for(var r=0;r<q.length;r++){var u=h(this.hex,q[r],[0],"06");var s=h(this.hex,q[r],[1],"86");if(u==="2b06010505073001"){p.ocsp.push(hextoutf8(s))}if(u==="2b06010505073002"){p.caissuer.push(hextoutf8(s))}}return p};this.getExtCertificatePolicies=function(){var s=this.getExtInfo("certificatePolicies");if(s===undefined){return s}var p=b(this.hex,s.vidx);var y=[];var w=m(p,0);for(var v=0;v<w.length;v++){var x={};var r=m(p,w[v]);x.id=l(k(p,r[0]));if(r.length===2){var q=m(p,r[1]);for(var u=0;u<q.length;u++){var t=h(p,q[u],[0],"06");if(t==="2b06010505070201"){x.cps=hextoutf8(h(p,q[u],[1]))}else{if(t==="2b06010505070202"){x.unotice=hextoutf8(h(p,q[u],[1,0]))}}}}y.push(x)}return y};this.readCertPEM=function(p){this.readCertHex(g(p))};this.readCertHex=function(p){this.hex=p;this.getVersion();try{i(this.hex,0,[0,7],"a3");this.parseExt()}catch(q){}};this.getInfo=function(){var q=X509;var F,y,D;F="Basic Fields\n";F+="  serial number: "+this.getSerialNumberHex()+"\n";F+="  signature algorithm: "+this.getSignatureAlgorithmField()+"\n";F+="  issuer: "+this.getIssuerString()+"\n";F+="  notBefore: "+this.getNotBefore()+"\n";F+="  notAfter: "+this.getNotAfter()+"\n";F+="  subject: "+this.getSubjectString()+"\n";F+="  subject public key info: \n";y=this.getPublicKey();F+="    key algorithm: "+y.type+"\n";if(y.type==="RSA"){F+="    n="+hextoposhex(y.n.toString(16)).substr(0,16)+"...\n";F+="    e="+hextoposhex(y.e.toString(16))+"\n"}D=this.aExtInfo;if(D!==undefined&&D!==null){F+="X509v3 Extensions:\n";for(var w=0;w<D.length;w++){var r=D[w];var E=KJUR.asn1.x509.OID.oid2name(r.oid);if(E===""){E=r.oid}var B="";if(r.critical===true){B="CRITICAL"}F+="  "+E+" "+B+":\n";if(E==="basicConstraints"){var z=this.getExtBasicConstraints();if(z.cA===undefined){F+="    {}\n"}else{F+="    cA=true";if(z.pathLen!==undefined){F+=", pathLen="+z.pathLen}F+="\n"}}else{if(E==="keyUsage"){F+="    "+this.getExtKeyUsageString()+"\n"}else{if(E==="subjectKeyIdentifier"){F+="    "+this.getExtSubjectKeyIdentifier()+"\n"}else{if(E==="authorityKeyIdentifier"){var p=this.getExtAuthorityKeyIdentifier();if(p.kid!==undefined){F+="    kid="+p.kid+"\n"}}else{if(E==="extKeyUsage"){var A=this.getExtExtKeyUsageName();F+="    "+A.join(", ")+"\n"}else{if(E==="subjectAltName"){var x=this.getExtSubjectAltName2();F+="    "+x+"\n"}else{if(E==="cRLDistributionPoints"){var C=this.getExtCRLDistributionPointsURI();F+="    "+C+"\n"}else{if(E==="authorityInfoAccess"){var u=this.getExtAIAInfo();if(u.ocsp!==undefined){F+="    ocsp: "+u.ocsp.join(",")+"\n"}if(u.caissuer!==undefined){F+="    caissuer: "+u.caissuer.join(",")+"\n"}}else{if(E==="certificatePolicies"){var t=this.getExtCertificatePolicies();for(var v=0;v<t.length;v++){if(t[v].id!==undefined){F+="    policy oid: "+t[v].id+"\n"}if(t[v].cps!==undefined){F+="    cps: "+t[v].cps+"\n"}}}}}}}}}}}}}F+="signature algorithm: "+this.getSignatureAlgorithmName()+"\n";F+="signature: "+this.getSignatureValueHex().substr(0,16)+"...\n";return F}}X509.hex2dn=function(f,b){if(b===undefined){b=0}if(f.substr(b,2)!=="30"){throw"malformed DN"}var c=new Array();var d=ASN1HEX.getChildIdx(f,b);for(var e=0;e<d.length;e++){c.push(X509.hex2rdn(f,d[e]))}c=c.map(function(a){return a.replace("/","\\/")});return"/"+c.join("/")};X509.hex2rdn=function(f,b){if(b===undefined){b=0}if(f.substr(b,2)!=="31"){throw"malformed RDN"}var c=new Array();var d=ASN1HEX.getChildIdx(f,b);for(var e=0;e<d.length;e++){c.push(X509.hex2attrTypeValue(f,d[e]))}c=c.map(function(a){return a.replace("+","\\+")});return c.join("+")};X509.hex2attrTypeValue=function(d,i){var j=ASN1HEX;var h=j.getV;if(i===undefined){i=0}if(d.substr(i,2)!=="30"){throw"malformed attribute type and value"}var g=j.getChildIdx(d,i);if(g.length!==2||d.substr(g[0],2)!=="06"){"malformed attribute type and value"}var b=h(d,g[0]);var f=KJUR.asn1.ASN1Util.oidHexToInt(b);var e=KJUR.asn1.x509.OID.oid2atype(f);var a=h(d,g[1]);var c=hextorstr(a);return e+"="+c};X509.getPublicKeyFromCertHex=function(b){var a=new X509();a.readCertHex(b);return a.getPublicKey()};X509.getPublicKeyFromCertPEM=function(b){var a=new X509();a.readCertPEM(b);return a.getPublicKey()};X509.getPublicKeyInfoPropOfCertPEM=function(c){var e=ASN1HEX;var g=e.getVbyList;var b={};var a,f,d;b.algparam=null;a=new X509();a.readCertPEM(c);f=a.getPublicKeyHex();b.keyhex=g(f,0,[1],"03").substr(2);b.algoid=g(f,0,[0,0],"06");if(b.algoid==="2a8648ce3d0201"){b.algparam=g(f,0,[0,1],"06")}return b};X509.KEYUSAGE_NAME=["digitalSignature","nonRepudiation","keyEncipherment","dataEncipherment","keyAgreement","keyCertSign","cRLSign","encipherOnly","decipherOnly"];
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.jws=="undefined"||!KJUR.jws){KJUR.jws={}}KJUR.jws.JWS=function(){var b=KJUR,a=b.jws.JWS,c=a.isSafeJSONString;this.parseJWS=function(g,j){if((this.parsedJWS!==undefined)&&(j||(this.parsedJWS.sigvalH!==undefined))){return}var i=g.match(/^([^.]+)\.([^.]+)\.([^.]+)$/);if(i==null){throw"JWS signature is not a form of 'Head.Payload.SigValue'."}var k=i[1];var e=i[2];var l=i[3];var n=k+"."+e;this.parsedJWS={};this.parsedJWS.headB64U=k;this.parsedJWS.payloadB64U=e;this.parsedJWS.sigvalB64U=l;this.parsedJWS.si=n;if(!j){var h=b64utohex(l);var f=parseBigInt(h,16);this.parsedJWS.sigvalH=h;this.parsedJWS.sigvalBI=f}var d=b64utoutf8(k);var m=b64utoutf8(e);this.parsedJWS.headS=d;this.parsedJWS.payloadS=m;if(!c(d,this.parsedJWS,"headP")){throw"malformed JSON string for JWS Head: "+d}}};KJUR.jws.JWS.sign=function(j,w,z,A,a){var x=KJUR,n=x.jws,r=n.JWS,h=r.readSafeJSONString,q=r.isSafeJSONString,d=x.crypto,l=d.ECDSA,p=d.Mac,c=d.Signature,u=JSON;var t,k,o;if(typeof w!="string"&&typeof w!="object"){throw"spHeader must be JSON string or object: "+w}if(typeof w=="object"){k=w;t=u.stringify(k)}if(typeof w=="string"){t=w;if(!q(t)){throw"JWS Head is not safe JSON string: "+t}k=h(t)}o=z;if(typeof z=="object"){o=u.stringify(z)}if((j==""||j==null)&&k.alg!==undefined){j=k.alg}if((j!=""&&j!=null)&&k.alg===undefined){k.alg=j;t=u.stringify(k)}if(j!==k.alg){throw"alg and sHeader.alg doesn't match: "+j+"!="+k.alg}var s=null;if(r.jwsalg2sigalg[j]===undefined){throw"unsupported alg name: "+j}else{s=r.jwsalg2sigalg[j]}var e=utf8tob64u(t);var m=utf8tob64u(o);var b=e+"."+m;var y="";if(s.substr(0,4)=="Hmac"){if(A===undefined){throw"mac key shall be specified for HS* alg"}var i=new p({alg:s,prov:"cryptojs",pass:A});i.updateString(b);y=i.doFinal()}else{if(s.indexOf("withECDSA")!=-1){var f=new c({alg:s});f.init(A,a);f.updateString(b);var g=f.sign();y=KJUR.crypto.ECDSA.asn1SigToConcatSig(g)}else{if(s!="none"){var f=new c({alg:s});f.init(A,a);f.updateString(b);y=f.sign()}}}var v=hextob64u(y);return b+"."+v};KJUR.jws.JWS.verify=function(w,B,n){var x=KJUR,q=x.jws,t=q.JWS,i=t.readSafeJSONString,e=x.crypto,p=e.ECDSA,s=e.Mac,d=e.Signature,m;if(typeof RSAKey!==undefined){m=RSAKey}var y=w.split(".");if(y.length!==3){return false}var f=y[0];var r=y[1];var c=f+"."+r;var A=b64utohex(y[2]);var l=i(b64utoutf8(y[0]));var k=null;var z=null;if(l.alg===undefined){throw"algorithm not specified in header"}else{k=l.alg;z=k.substr(0,2)}if(n!=null&&Object.prototype.toString.call(n)==="[object Array]"&&n.length>0){var b=":"+n.join(":")+":";if(b.indexOf(":"+k+":")==-1){throw"algorithm '"+k+"' not accepted in the list"}}if(k!="none"&&B===null){throw"key shall be specified to verify."}if(typeof B=="string"&&B.indexOf("-----BEGIN ")!=-1){B=KEYUTIL.getKey(B)}if(z=="RS"||z=="PS"){if(!(B instanceof m)){throw"key shall be a RSAKey obj for RS* and PS* algs"}}if(z=="ES"){if(!(B instanceof p)){throw"key shall be a ECDSA obj for ES* algs"}}if(k=="none"){}var u=null;if(t.jwsalg2sigalg[l.alg]===undefined){throw"unsupported alg name: "+k}else{u=t.jwsalg2sigalg[k]}if(u=="none"){throw"not supported"}else{if(u.substr(0,4)=="Hmac"){var o=null;if(B===undefined){throw"hexadecimal key shall be specified for HMAC"}var j=new s({alg:u,pass:B});j.updateString(c);o=j.doFinal();return A==o}else{if(u.indexOf("withECDSA")!=-1){var h=null;try{h=p.concatSigToASN1Sig(A)}catch(v){return false}var g=new d({alg:u});g.init(B);g.updateString(c);return g.verify(h)}else{var g=new d({alg:u});g.init(B);g.updateString(c);return g.verify(A)}}}};KJUR.jws.JWS.parse=function(g){var c=g.split(".");var b={};var f,e,d;if(c.length!=2&&c.length!=3){throw"malformed sJWS: wrong number of '.' splitted elements"}f=c[0];e=c[1];if(c.length==3){d=c[2]}b.headerObj=KJUR.jws.JWS.readSafeJSONString(b64utoutf8(f));b.payloadObj=KJUR.jws.JWS.readSafeJSONString(b64utoutf8(e));b.headerPP=JSON.stringify(b.headerObj,null,"  ");if(b.payloadObj==null){b.payloadPP=b64utoutf8(e)}else{b.payloadPP=JSON.stringify(b.payloadObj,null,"  ")}if(d!==undefined){b.sigHex=b64utohex(d)}return b};KJUR.jws.JWS.verifyJWT=function(e,l,r){var d=KJUR,j=d.jws,o=j.JWS,n=o.readSafeJSONString,p=o.inArray,f=o.includedArray;var k=e.split(".");var c=k[0];var i=k[1];var q=c+"."+i;var m=b64utohex(k[2]);var h=n(b64utoutf8(c));var g=n(b64utoutf8(i));if(h.alg===undefined){return false}if(r.alg===undefined){throw"acceptField.alg shall be specified"}if(!p(h.alg,r.alg)){return false}if(g.iss!==undefined&&typeof r.iss==="object"){if(!p(g.iss,r.iss)){return false}}if(g.sub!==undefined&&typeof r.sub==="object"){if(!p(g.sub,r.sub)){return false}}if(g.aud!==undefined&&typeof r.aud==="object"){if(typeof g.aud=="string"){if(!p(g.aud,r.aud)){return false}}else{if(typeof g.aud=="object"){if(!f(g.aud,r.aud)){return false}}}}var b=j.IntDate.getNow();if(r.verifyAt!==undefined&&typeof r.verifyAt==="number"){b=r.verifyAt}if(r.gracePeriod===undefined||typeof r.gracePeriod!=="number"){r.gracePeriod=0}if(g.exp!==undefined&&typeof g.exp=="number"){if(g.exp+r.gracePeriod<b){return false}}if(g.nbf!==undefined&&typeof g.nbf=="number"){if(b<g.nbf-r.gracePeriod){return false}}if(g.iat!==undefined&&typeof g.iat=="number"){if(b<g.iat-r.gracePeriod){return false}}if(g.jti!==undefined&&r.jti!==undefined){if(g.jti!==r.jti){return false}}if(!o.verify(e,l,r.alg)){return false}return true};KJUR.jws.JWS.includedArray=function(b,a){var c=KJUR.jws.JWS.inArray;if(b===null){return false}if(typeof b!=="object"){return false}if(typeof b.length!=="number"){return false}for(var d=0;d<b.length;d++){if(!c(b[d],a)){return false}}return true};KJUR.jws.JWS.inArray=function(d,b){if(b===null){return false}if(typeof b!=="object"){return false}if(typeof b.length!=="number"){return false}for(var c=0;c<b.length;c++){if(b[c]==d){return true}}return false};KJUR.jws.JWS.jwsalg2sigalg={HS256:"HmacSHA256",HS384:"HmacSHA384",HS512:"HmacSHA512",RS256:"SHA256withRSA",RS384:"SHA384withRSA",RS512:"SHA512withRSA",ES256:"SHA256withECDSA",ES384:"SHA384withECDSA",PS256:"SHA256withRSAandMGF1",PS384:"SHA384withRSAandMGF1",PS512:"SHA512withRSAandMGF1",none:"none",};KJUR.jws.JWS.isSafeJSONString=function(c,b,d){var e=null;try{e=jsonParse(c);if(typeof e!="object"){return 0}if(e.constructor===Array){return 0}if(b){b[d]=e}return 1}catch(a){return 0}};KJUR.jws.JWS.readSafeJSONString=function(b){var c=null;try{c=jsonParse(b);if(typeof c!="object"){return null}if(c.constructor===Array){return null}return c}catch(a){return null}};KJUR.jws.JWS.getEncodedSignatureValueFromJWS=function(b){var a=b.match(/^[^.]+\.[^.]+\.([^.]+)$/);if(a==null){throw"JWS signature is not a form of 'Head.Payload.SigValue'."}return a[1]};KJUR.jws.JWS.getJWKthumbprint=function(d){if(d.kty!=="RSA"&&d.kty!=="EC"&&d.kty!=="oct"){throw"unsupported algorithm for JWK Thumprint"}var a="{";if(d.kty==="RSA"){if(typeof d.n!="string"||typeof d.e!="string"){throw"wrong n and e value for RSA key"}a+='"e":"'+d.e+'",';a+='"kty":"'+d.kty+'",';a+='"n":"'+d.n+'"}'}else{if(d.kty==="EC"){if(typeof d.crv!="string"||typeof d.x!="string"||typeof d.y!="string"){throw"wrong crv, x and y value for EC key"}a+='"crv":"'+d.crv+'",';a+='"kty":"'+d.kty+'",';a+='"x":"'+d.x+'",';a+='"y":"'+d.y+'"}'}else{if(d.kty==="oct"){if(typeof d.k!="string"){throw"wrong k value for oct(symmetric) key"}a+='"kty":"'+d.kty+'",';a+='"k":"'+d.k+'"}'}}}var b=rstrtohex(a);var c=KJUR.crypto.Util.hashHex(b,"sha256");var e=hextob64u(c);return e};KJUR.jws.IntDate={};KJUR.jws.IntDate.get=function(c){var b=KJUR.jws.IntDate,d=b.getNow,a=b.getZulu;if(c=="now"){return d()}else{if(c=="now + 1hour"){return d()+60*60}else{if(c=="now + 1day"){return d()+60*60*24}else{if(c=="now + 1month"){return d()+60*60*24*30}else{if(c=="now + 1year"){return d()+60*60*24*365}else{if(c.match(/Z$/)){return a(c)}else{if(c.match(/^[0-9]+$/)){return parseInt(c)}}}}}}}throw"unsupported format: "+c};KJUR.jws.IntDate.getZulu=function(a){return zulutosec(a)};KJUR.jws.IntDate.getNow=function(){var a=~~(new Date()/1000);return a};KJUR.jws.IntDate.intDate2UTCString=function(a){var b=new Date(a*1000);return b.toUTCString()};KJUR.jws.IntDate.intDate2Zulu=function(e){var i=new Date(e*1000),h=("0000"+i.getUTCFullYear()).slice(-4),g=("00"+(i.getUTCMonth()+1)).slice(-2),b=("00"+i.getUTCDate()).slice(-2),a=("00"+i.getUTCHours()).slice(-2),c=("00"+i.getUTCMinutes()).slice(-2),f=("00"+i.getUTCSeconds()).slice(-2);return h+g+b+a+c+f+"Z"};
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.jws=="undefined"||!KJUR.jws){KJUR.jws={}}KJUR.jws.JWSJS=function(){var c=KJUR,b=c.jws,a=b.JWS,d=a.readSafeJSONString;this.aHeader=[];this.sPayload="";this.aSignature=[];this.init=function(){this.aHeader=[];this.sPayload=undefined;this.aSignature=[]};this.initWithJWS=function(f){this.init();var e=f.split(".");if(e.length!=3){throw"malformed input JWS"}this.aHeader.push(e[0]);this.sPayload=e[1];this.aSignature.push(e[2])};this.addSignature=function(e,h,m,k){if(this.sPayload===undefined||this.sPayload===null){throw"there's no JSON-JS signature to add."}var l=this.aHeader.length;if(this.aHeader.length!=this.aSignature.length){throw"aHeader.length != aSignature.length"}try{var f=KJUR.jws.JWS.sign(e,h,this.sPayload,m,k);var j=f.split(".");var n=j[0];var g=j[2];this.aHeader.push(j[0]);this.aSignature.push(j[2])}catch(i){if(this.aHeader.length>l){this.aHeader.pop()}if(this.aSignature.length>l){this.aSignature.pop()}throw"addSignature failed: "+i}};this.verifyAll=function(h){if(this.aHeader.length!==h.length||this.aSignature.length!==h.length){return false}for(var g=0;g<h.length;g++){var f=h[g];if(f.length!==2){return false}var e=this.verifyNth(g,f[0],f[1]);if(e===false){return false}}return true};this.verifyNth=function(f,j,g){if(this.aHeader.length<=f||this.aSignature.length<=f){return false}var h=this.aHeader[f];var k=this.aSignature[f];var l=h+"."+this.sPayload+"."+k;var e=false;try{e=a.verify(l,j,g)}catch(i){return false}return e};this.readJWSJS=function(g){if(typeof g==="string"){var f=d(g);if(f==null){throw"argument is not safe JSON object string"}this.aHeader=f.headers;this.sPayload=f.payload;this.aSignature=f.signatures}else{try{if(g.headers.length>0){this.aHeader=g.headers}else{throw"malformed header"}if(typeof g.payload==="string"){this.sPayload=g.payload}else{throw"malformed signatures"}if(g.signatures.length>0){this.aSignature=g.signatures}else{throw"malformed signatures"}}catch(e){throw"malformed JWS-JS JSON object: "+e}}};this.getJSON=function(){return{headers:this.aHeader,payload:this.sPayload,signatures:this.aSignature}};this.isEmpty=function(){if(this.aHeader.length==0){return 1}return 0}};
exports.SecureRandom = SecureRandom;
exports.rng_seed_time = rng_seed_time;

exports.BigInteger = BigInteger;
exports.RSAKey = RSAKey;
exports.ECDSA = KJUR.crypto.ECDSA;
exports.DSA = KJUR.crypto.DSA;
exports.Signature = KJUR.crypto.Signature;
exports.MessageDigest = KJUR.crypto.MessageDigest;
exports.Mac = KJUR.crypto.Mac;
exports.Cipher = KJUR.crypto.Cipher;
exports.KEYUTIL = KEYUTIL;
exports.ASN1HEX = ASN1HEX;
exports.X509 = X509;
exports.CryptoJS = CryptoJS;

// ext/base64.js
exports.b64tohex = b64tohex;
exports.b64toBA = b64toBA;

// ext/ec*.js
exports.ECFieldElementFp = ECFieldElementFp;
exports.ECPointFp = ECPointFp;
exports.ECCurveFp = ECCurveFp;

// base64x.js
exports.stoBA = stoBA;
exports.BAtos = BAtos;
exports.BAtohex = BAtohex;
exports.stohex = stohex;
exports.stob64 = stob64;
exports.stob64u = stob64u;
exports.b64utos = b64utos;
exports.b64tob64u = b64tob64u;
exports.b64utob64 = b64utob64;
exports.hex2b64 = hex2b64;
exports.hextob64u = hextob64u;
exports.b64utohex = b64utohex;
exports.utf8tob64u = utf8tob64u;
exports.b64utoutf8 = b64utoutf8;
exports.utf8tob64 = utf8tob64;
exports.b64toutf8 = b64toutf8;
exports.utf8tohex = utf8tohex;
exports.hextoutf8 = hextoutf8;
exports.hextorstr = hextorstr;
exports.rstrtohex = rstrtohex;
exports.hextob64 = hextob64;
exports.hextob64nl = hextob64nl;
exports.b64nltohex = b64nltohex;
exports.hextopem = hextopem;
exports.pemtohex = pemtohex;
exports.hextoArrayBuffer = hextoArrayBuffer;
exports.ArrayBuffertohex = ArrayBuffertohex;
exports.zulutomsec = zulutomsec;
exports.zulutosec = zulutosec;
exports.zulutodate = zulutodate;
exports.datetozulu = datetozulu;
exports.uricmptohex = uricmptohex;
exports.hextouricmp = hextouricmp;
exports.ipv6tohex = ipv6tohex;
exports.hextoipv6 = hextoipv6;
exports.hextoip = hextoip;
exports.iptohex = iptohex;
exports.encodeURIComponentAll = encodeURIComponentAll;
exports.newline_toUnix = newline_toUnix;
exports.newline_toDos = newline_toDos;
exports.hextoposhex = hextoposhex;
exports.intarystrtohex = intarystrtohex;
exports.strdiffidx = strdiffidx;

// name spaces
exports.KJUR = KJUR;
exports.crypto = KJUR.crypto;
exports.asn1 = KJUR.asn1;
exports.jws = KJUR.jws;
exports.lang = KJUR.lang;



}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":3}],45:[function(require,module,exports){
'use strict'
var inherits = require('inherits')
var HashBase = require('hash-base')
var Buffer = require('safe-buffer').Buffer

var ARRAY16 = new Array(16)

function MD5 () {
  HashBase.call(this, 64)

  // state
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
}

inherits(MD5, HashBase)

MD5.prototype._update = function () {
  var M = ARRAY16
  for (var i = 0; i < 16; ++i) M[i] = this._block.readInt32LE(i * 4)

  var a = this._a
  var b = this._b
  var c = this._c
  var d = this._d

  a = fnF(a, b, c, d, M[0], 0xd76aa478, 7)
  d = fnF(d, a, b, c, M[1], 0xe8c7b756, 12)
  c = fnF(c, d, a, b, M[2], 0x242070db, 17)
  b = fnF(b, c, d, a, M[3], 0xc1bdceee, 22)
  a = fnF(a, b, c, d, M[4], 0xf57c0faf, 7)
  d = fnF(d, a, b, c, M[5], 0x4787c62a, 12)
  c = fnF(c, d, a, b, M[6], 0xa8304613, 17)
  b = fnF(b, c, d, a, M[7], 0xfd469501, 22)
  a = fnF(a, b, c, d, M[8], 0x698098d8, 7)
  d = fnF(d, a, b, c, M[9], 0x8b44f7af, 12)
  c = fnF(c, d, a, b, M[10], 0xffff5bb1, 17)
  b = fnF(b, c, d, a, M[11], 0x895cd7be, 22)
  a = fnF(a, b, c, d, M[12], 0x6b901122, 7)
  d = fnF(d, a, b, c, M[13], 0xfd987193, 12)
  c = fnF(c, d, a, b, M[14], 0xa679438e, 17)
  b = fnF(b, c, d, a, M[15], 0x49b40821, 22)

  a = fnG(a, b, c, d, M[1], 0xf61e2562, 5)
  d = fnG(d, a, b, c, M[6], 0xc040b340, 9)
  c = fnG(c, d, a, b, M[11], 0x265e5a51, 14)
  b = fnG(b, c, d, a, M[0], 0xe9b6c7aa, 20)
  a = fnG(a, b, c, d, M[5], 0xd62f105d, 5)
  d = fnG(d, a, b, c, M[10], 0x02441453, 9)
  c = fnG(c, d, a, b, M[15], 0xd8a1e681, 14)
  b = fnG(b, c, d, a, M[4], 0xe7d3fbc8, 20)
  a = fnG(a, b, c, d, M[9], 0x21e1cde6, 5)
  d = fnG(d, a, b, c, M[14], 0xc33707d6, 9)
  c = fnG(c, d, a, b, M[3], 0xf4d50d87, 14)
  b = fnG(b, c, d, a, M[8], 0x455a14ed, 20)
  a = fnG(a, b, c, d, M[13], 0xa9e3e905, 5)
  d = fnG(d, a, b, c, M[2], 0xfcefa3f8, 9)
  c = fnG(c, d, a, b, M[7], 0x676f02d9, 14)
  b = fnG(b, c, d, a, M[12], 0x8d2a4c8a, 20)

  a = fnH(a, b, c, d, M[5], 0xfffa3942, 4)
  d = fnH(d, a, b, c, M[8], 0x8771f681, 11)
  c = fnH(c, d, a, b, M[11], 0x6d9d6122, 16)
  b = fnH(b, c, d, a, M[14], 0xfde5380c, 23)
  a = fnH(a, b, c, d, M[1], 0xa4beea44, 4)
  d = fnH(d, a, b, c, M[4], 0x4bdecfa9, 11)
  c = fnH(c, d, a, b, M[7], 0xf6bb4b60, 16)
  b = fnH(b, c, d, a, M[10], 0xbebfbc70, 23)
  a = fnH(a, b, c, d, M[13], 0x289b7ec6, 4)
  d = fnH(d, a, b, c, M[0], 0xeaa127fa, 11)
  c = fnH(c, d, a, b, M[3], 0xd4ef3085, 16)
  b = fnH(b, c, d, a, M[6], 0x04881d05, 23)
  a = fnH(a, b, c, d, M[9], 0xd9d4d039, 4)
  d = fnH(d, a, b, c, M[12], 0xe6db99e5, 11)
  c = fnH(c, d, a, b, M[15], 0x1fa27cf8, 16)
  b = fnH(b, c, d, a, M[2], 0xc4ac5665, 23)

  a = fnI(a, b, c, d, M[0], 0xf4292244, 6)
  d = fnI(d, a, b, c, M[7], 0x432aff97, 10)
  c = fnI(c, d, a, b, M[14], 0xab9423a7, 15)
  b = fnI(b, c, d, a, M[5], 0xfc93a039, 21)
  a = fnI(a, b, c, d, M[12], 0x655b59c3, 6)
  d = fnI(d, a, b, c, M[3], 0x8f0ccc92, 10)
  c = fnI(c, d, a, b, M[10], 0xffeff47d, 15)
  b = fnI(b, c, d, a, M[1], 0x85845dd1, 21)
  a = fnI(a, b, c, d, M[8], 0x6fa87e4f, 6)
  d = fnI(d, a, b, c, M[15], 0xfe2ce6e0, 10)
  c = fnI(c, d, a, b, M[6], 0xa3014314, 15)
  b = fnI(b, c, d, a, M[13], 0x4e0811a1, 21)
  a = fnI(a, b, c, d, M[4], 0xf7537e82, 6)
  d = fnI(d, a, b, c, M[11], 0xbd3af235, 10)
  c = fnI(c, d, a, b, M[2], 0x2ad7d2bb, 15)
  b = fnI(b, c, d, a, M[9], 0xeb86d391, 21)

  this._a = (this._a + a) | 0
  this._b = (this._b + b) | 0
  this._c = (this._c + c) | 0
  this._d = (this._d + d) | 0
}

MD5.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64)
    this._update()
    this._blockOffset = 0
  }

  this._block.fill(0, this._blockOffset, 56)
  this._block.writeUInt32LE(this._length[0], 56)
  this._block.writeUInt32LE(this._length[1], 60)
  this._update()

  // produce result
  var buffer = Buffer.allocUnsafe(16)
  buffer.writeInt32LE(this._a, 0)
  buffer.writeInt32LE(this._b, 4)
  buffer.writeInt32LE(this._c, 8)
  buffer.writeInt32LE(this._d, 12)
  return buffer
}

function rotl (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fnF (a, b, c, d, m, k, s) {
  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + b) | 0
}

function fnG (a, b, c, d, m, k, s) {
  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + b) | 0
}

function fnH (a, b, c, d, m, k, s) {
  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + b) | 0
}

function fnI (a, b, c, d, m, k, s) {
  return (rotl((a + ((c ^ (b | (~d)))) + m + k) | 0, s) + b) | 0
}

module.exports = MD5

},{"hash-base":40,"inherits":41,"safe-buffer":53}],46:[function(require,module,exports){
exports.pbkdf2 = require('./lib/async')
exports.pbkdf2Sync = require('./lib/sync')

},{"./lib/async":47,"./lib/sync":50}],47:[function(require,module,exports){
(function (process,global){(function (){
var checkParameters = require('./precondition')
var defaultEncoding = require('./default-encoding')
var sync = require('./sync')
var Buffer = require('safe-buffer').Buffer

var ZERO_BUF
var subtle = global.crypto && global.crypto.subtle
var toBrowser = {
  'sha': 'SHA-1',
  'sha-1': 'SHA-1',
  'sha1': 'SHA-1',
  'sha256': 'SHA-256',
  'sha-256': 'SHA-256',
  'sha384': 'SHA-384',
  'sha-384': 'SHA-384',
  'sha-512': 'SHA-512',
  'sha512': 'SHA-512'
}
var checks = []
function checkNative (algo) {
  if (global.process && !global.process.browser) {
    return Promise.resolve(false)
  }
  if (!subtle || !subtle.importKey || !subtle.deriveBits) {
    return Promise.resolve(false)
  }
  if (checks[algo] !== undefined) {
    return checks[algo]
  }
  ZERO_BUF = ZERO_BUF || Buffer.alloc(8)
  var prom = browserPbkdf2(ZERO_BUF, ZERO_BUF, 10, 128, algo)
    .then(function () {
      return true
    }).catch(function () {
      return false
    })
  checks[algo] = prom
  return prom
}

function browserPbkdf2 (password, salt, iterations, length, algo) {
  return subtle.importKey(
    'raw', password, {name: 'PBKDF2'}, false, ['deriveBits']
  ).then(function (key) {
    return subtle.deriveBits({
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: {
        name: algo
      }
    }, key, length << 3)
  }).then(function (res) {
    return Buffer.from(res)
  })
}

function resolvePromise (promise, callback) {
  promise.then(function (out) {
    process.nextTick(function () {
      callback(null, out)
    })
  }, function (e) {
    process.nextTick(function () {
      callback(e)
    })
  })
}
module.exports = function (password, salt, iterations, keylen, digest, callback) {
  if (typeof digest === 'function') {
    callback = digest
    digest = undefined
  }

  digest = digest || 'sha1'
  var algo = toBrowser[digest.toLowerCase()]

  if (!algo || typeof global.Promise !== 'function') {
    return process.nextTick(function () {
      var out
      try {
        out = sync(password, salt, iterations, keylen, digest)
      } catch (e) {
        return callback(e)
      }
      callback(null, out)
    })
  }

  checkParameters(password, salt, iterations, keylen)
  if (typeof callback !== 'function') throw new Error('No callback provided to pbkdf2')
  if (!Buffer.isBuffer(password)) password = Buffer.from(password, defaultEncoding)
  if (!Buffer.isBuffer(salt)) salt = Buffer.from(salt, defaultEncoding)

  resolvePromise(checkNative(algo).then(function (resp) {
    if (resp) return browserPbkdf2(password, salt, iterations, keylen, algo)

    return sync(password, salt, iterations, keylen, digest)
  }), callback)
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./default-encoding":48,"./precondition":49,"./sync":50,"_process":8,"safe-buffer":53}],48:[function(require,module,exports){
(function (process){(function (){
var defaultEncoding
/* istanbul ignore next */
if (process.browser) {
  defaultEncoding = 'utf-8'
} else {
  var pVersionMajor = parseInt(process.version.split('.')[0].slice(1), 10)

  defaultEncoding = pVersionMajor >= 6 ? 'utf-8' : 'binary'
}
module.exports = defaultEncoding

}).call(this)}).call(this,require('_process'))
},{"_process":8}],49:[function(require,module,exports){
(function (Buffer){(function (){
var MAX_ALLOC = Math.pow(2, 30) - 1 // default in iojs

function checkBuffer (buf, name) {
  if (typeof buf !== 'string' && !Buffer.isBuffer(buf)) {
    throw new TypeError(name + ' must be a buffer or string')
  }
}

module.exports = function (password, salt, iterations, keylen) {
  checkBuffer(password, 'Password')
  checkBuffer(salt, 'Salt')

  if (typeof iterations !== 'number') {
    throw new TypeError('Iterations not a number')
  }

  if (iterations < 0) {
    throw new TypeError('Bad iterations')
  }

  if (typeof keylen !== 'number') {
    throw new TypeError('Key length not a number')
  }

  if (keylen < 0 || keylen > MAX_ALLOC || keylen !== keylen) { /* eslint no-self-compare: 0 */
    throw new TypeError('Bad key length')
  }
}

}).call(this)}).call(this,{"isBuffer":require("C:/Users/olive/AppData/Roaming/npm/node_modules/browserify/node_modules/is-buffer/index.js")})
},{"C:/Users/olive/AppData/Roaming/npm/node_modules/browserify/node_modules/is-buffer/index.js":7}],50:[function(require,module,exports){
var md5 = require('create-hash/md5')
var RIPEMD160 = require('ripemd160')
var sha = require('sha.js')

var checkParameters = require('./precondition')
var defaultEncoding = require('./default-encoding')
var Buffer = require('safe-buffer').Buffer
var ZEROS = Buffer.alloc(128)
var sizes = {
  md5: 16,
  sha1: 20,
  sha224: 28,
  sha256: 32,
  sha384: 48,
  sha512: 64,
  rmd160: 20,
  ripemd160: 20
}

function Hmac (alg, key, saltLen) {
  var hash = getDigest(alg)
  var blocksize = (alg === 'sha512' || alg === 'sha384') ? 128 : 64

  if (key.length > blocksize) {
    key = hash(key)
  } else if (key.length < blocksize) {
    key = Buffer.concat([key, ZEROS], blocksize)
  }

  var ipad = Buffer.allocUnsafe(blocksize + sizes[alg])
  var opad = Buffer.allocUnsafe(blocksize + sizes[alg])
  for (var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }

  var ipad1 = Buffer.allocUnsafe(blocksize + saltLen + 4)
  ipad.copy(ipad1, 0, 0, blocksize)
  this.ipad1 = ipad1
  this.ipad2 = ipad
  this.opad = opad
  this.alg = alg
  this.blocksize = blocksize
  this.hash = hash
  this.size = sizes[alg]
}

Hmac.prototype.run = function (data, ipad) {
  data.copy(ipad, this.blocksize)
  var h = this.hash(ipad)
  h.copy(this.opad, this.blocksize)
  return this.hash(this.opad)
}

function getDigest (alg) {
  function shaFunc (data) {
    return sha(alg).update(data).digest()
  }
  function rmd160Func (data) {
    return new RIPEMD160().update(data).digest()
  }

  if (alg === 'rmd160' || alg === 'ripemd160') return rmd160Func
  if (alg === 'md5') return md5
  return shaFunc
}

function pbkdf2 (password, salt, iterations, keylen, digest) {
  checkParameters(password, salt, iterations, keylen)

  if (!Buffer.isBuffer(password)) password = Buffer.from(password, defaultEncoding)
  if (!Buffer.isBuffer(salt)) salt = Buffer.from(salt, defaultEncoding)

  digest = digest || 'sha1'

  var hmac = new Hmac(digest, password, salt.length)

  var DK = Buffer.allocUnsafe(keylen)
  var block1 = Buffer.allocUnsafe(salt.length + 4)
  salt.copy(block1, 0, 0, salt.length)

  var destPos = 0
  var hLen = sizes[digest]
  var l = Math.ceil(keylen / hLen)

  for (var i = 1; i <= l; i++) {
    block1.writeUInt32BE(i, salt.length)

    var T = hmac.run(block1, hmac.ipad1)
    var U = T

    for (var j = 1; j < iterations; j++) {
      U = hmac.run(U, hmac.ipad2)
      for (var k = 0; k < hLen; k++) T[k] ^= U[k]
    }

    T.copy(DK, destPos)
    destPos += hLen
  }

  return DK
}

module.exports = pbkdf2

},{"./default-encoding":48,"./precondition":49,"create-hash/md5":39,"ripemd160":52,"safe-buffer":53,"sha.js":55}],51:[function(require,module,exports){
(function (process,global){(function (){
'use strict'

// limit of Crypto.getRandomValues()
// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
var MAX_BYTES = 65536

// Node supports requesting up to this number of bytes
// https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
var MAX_UINT32 = 4294967295

function oldBrowser () {
  throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
}

var Buffer = require('safe-buffer').Buffer
var crypto = global.crypto || global.msCrypto

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes
} else {
  module.exports = oldBrowser
}

function randomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > MAX_UINT32) throw new RangeError('requested too many random bytes')

  var bytes = Buffer.allocUnsafe(size)

  if (size > 0) {  // getRandomValues fails on IE if size == 0
    if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
      // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
      for (var generated = 0; generated < size; generated += MAX_BYTES) {
        // buffer.slice automatically checks if the end is past the end of
        // the buffer so we don't have to here
        crypto.getRandomValues(bytes.slice(generated, generated + MAX_BYTES))
      }
    } else {
      crypto.getRandomValues(bytes)
    }
  }

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes)
    })
  }

  return bytes
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":8,"safe-buffer":53}],52:[function(require,module,exports){
'use strict'
var Buffer = require('buffer').Buffer
var inherits = require('inherits')
var HashBase = require('hash-base')

var ARRAY16 = new Array(16)

var zl = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
]

var zr = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
]

var sl = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
]

var sr = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
]

var hl = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e]
var hr = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000]

function RIPEMD160 () {
  HashBase.call(this, 64)

  // state
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0
}

inherits(RIPEMD160, HashBase)

RIPEMD160.prototype._update = function () {
  var words = ARRAY16
  for (var j = 0; j < 16; ++j) words[j] = this._block.readInt32LE(j * 4)

  var al = this._a | 0
  var bl = this._b | 0
  var cl = this._c | 0
  var dl = this._d | 0
  var el = this._e | 0

  var ar = this._a | 0
  var br = this._b | 0
  var cr = this._c | 0
  var dr = this._d | 0
  var er = this._e | 0

  // computation
  for (var i = 0; i < 80; i += 1) {
    var tl
    var tr
    if (i < 16) {
      tl = fn1(al, bl, cl, dl, el, words[zl[i]], hl[0], sl[i])
      tr = fn5(ar, br, cr, dr, er, words[zr[i]], hr[0], sr[i])
    } else if (i < 32) {
      tl = fn2(al, bl, cl, dl, el, words[zl[i]], hl[1], sl[i])
      tr = fn4(ar, br, cr, dr, er, words[zr[i]], hr[1], sr[i])
    } else if (i < 48) {
      tl = fn3(al, bl, cl, dl, el, words[zl[i]], hl[2], sl[i])
      tr = fn3(ar, br, cr, dr, er, words[zr[i]], hr[2], sr[i])
    } else if (i < 64) {
      tl = fn4(al, bl, cl, dl, el, words[zl[i]], hl[3], sl[i])
      tr = fn2(ar, br, cr, dr, er, words[zr[i]], hr[3], sr[i])
    } else { // if (i<80) {
      tl = fn5(al, bl, cl, dl, el, words[zl[i]], hl[4], sl[i])
      tr = fn1(ar, br, cr, dr, er, words[zr[i]], hr[4], sr[i])
    }

    al = el
    el = dl
    dl = rotl(cl, 10)
    cl = bl
    bl = tl

    ar = er
    er = dr
    dr = rotl(cr, 10)
    cr = br
    br = tr
  }

  // update state
  var t = (this._b + cl + dr) | 0
  this._b = (this._c + dl + er) | 0
  this._c = (this._d + el + ar) | 0
  this._d = (this._e + al + br) | 0
  this._e = (this._a + bl + cr) | 0
  this._a = t
}

RIPEMD160.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64)
    this._update()
    this._blockOffset = 0
  }

  this._block.fill(0, this._blockOffset, 56)
  this._block.writeUInt32LE(this._length[0], 56)
  this._block.writeUInt32LE(this._length[1], 60)
  this._update()

  // produce result
  var buffer = Buffer.alloc ? Buffer.alloc(20) : new Buffer(20)
  buffer.writeInt32LE(this._a, 0)
  buffer.writeInt32LE(this._b, 4)
  buffer.writeInt32LE(this._c, 8)
  buffer.writeInt32LE(this._d, 12)
  buffer.writeInt32LE(this._e, 16)
  return buffer
}

function rotl (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fn1 (a, b, c, d, e, m, k, s) {
  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + e) | 0
}

function fn2 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + e) | 0
}

function fn3 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b | (~c)) ^ d) + m + k) | 0, s) + e) | 0
}

function fn4 (a, b, c, d, e, m, k, s) {
  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + e) | 0
}

function fn5 (a, b, c, d, e, m, k, s) {
  return (rotl((a + (b ^ (c | (~d))) + m + k) | 0, s) + e) | 0
}

module.exports = RIPEMD160

},{"buffer":3,"hash-base":40,"inherits":41}],53:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":3}],54:[function(require,module,exports){
var Buffer = require('safe-buffer').Buffer

// prototype class for hash functions
function Hash (blockSize, finalSize) {
  this._block = Buffer.alloc(blockSize)
  this._finalSize = finalSize
  this._blockSize = blockSize
  this._len = 0
}

Hash.prototype.update = function (data, enc) {
  if (typeof data === 'string') {
    enc = enc || 'utf8'
    data = Buffer.from(data, enc)
  }

  var block = this._block
  var blockSize = this._blockSize
  var length = data.length
  var accum = this._len

  for (var offset = 0; offset < length;) {
    var assigned = accum % blockSize
    var remainder = Math.min(length - offset, blockSize - assigned)

    for (var i = 0; i < remainder; i++) {
      block[assigned + i] = data[offset + i]
    }

    accum += remainder
    offset += remainder

    if ((accum % blockSize) === 0) {
      this._update(block)
    }
  }

  this._len += length
  return this
}

Hash.prototype.digest = function (enc) {
  var rem = this._len % this._blockSize

  this._block[rem] = 0x80

  // zero (rem + 1) trailing bits, where (rem + 1) is the smallest
  // non-negative solution to the equation (length + 1 + (rem + 1)) === finalSize mod blockSize
  this._block.fill(0, rem + 1)

  if (rem >= this._finalSize) {
    this._update(this._block)
    this._block.fill(0)
  }

  var bits = this._len * 8

  // uint32
  if (bits <= 0xffffffff) {
    this._block.writeUInt32BE(bits, this._blockSize - 4)

  // uint64
  } else {
    var lowBits = (bits & 0xffffffff) >>> 0
    var highBits = (bits - lowBits) / 0x100000000

    this._block.writeUInt32BE(highBits, this._blockSize - 8)
    this._block.writeUInt32BE(lowBits, this._blockSize - 4)
  }

  this._update(this._block)
  var hash = this._hash()

  return enc ? hash.toString(enc) : hash
}

Hash.prototype._update = function () {
  throw new Error('_update must be implemented by subclass')
}

module.exports = Hash

},{"safe-buffer":53}],55:[function(require,module,exports){
var exports = module.exports = function SHA (algorithm) {
  algorithm = algorithm.toLowerCase()

  var Algorithm = exports[algorithm]
  if (!Algorithm) throw new Error(algorithm + ' is not supported (we accept pull requests)')

  return new Algorithm()
}

exports.sha = require('./sha')
exports.sha1 = require('./sha1')
exports.sha224 = require('./sha224')
exports.sha256 = require('./sha256')
exports.sha384 = require('./sha384')
exports.sha512 = require('./sha512')

},{"./sha":56,"./sha1":57,"./sha224":58,"./sha256":59,"./sha384":60,"./sha512":61}],56:[function(require,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-0, as defined
 * in FIPS PUB 180-1
 * This source code is derived from sha1.js of the same repository.
 * The difference between SHA-0 and SHA-1 is just a bitwise rotate left
 * operation was added.
 */

var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
]

var W = new Array(80)

function Sha () {
  this.init()
  this._w = W

  Hash.call(this, 64, 56)
}

inherits(Sha, Hash)

Sha.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  return this
}

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 80; ++i) W[i] = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20)
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

    e = d
    d = c
    c = rotl30(b)
    b = a
    a = t
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
}

Sha.prototype._hash = function () {
  var H = Buffer.allocUnsafe(20)

  H.writeInt32BE(this._a | 0, 0)
  H.writeInt32BE(this._b | 0, 4)
  H.writeInt32BE(this._c | 0, 8)
  H.writeInt32BE(this._d | 0, 12)
  H.writeInt32BE(this._e | 0, 16)

  return H
}

module.exports = Sha

},{"./hash":54,"inherits":41,"safe-buffer":53}],57:[function(require,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
]

var W = new Array(80)

function Sha1 () {
  this.init()
  this._w = W

  Hash.call(this, 64, 56)
}

inherits(Sha1, Hash)

Sha1.prototype.init = function () {
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
  this._e = 0xc3d2e1f0

  return this
}

function rotl1 (num) {
  return (num << 1) | (num >>> 31)
}

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha1.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 80; ++i) W[i] = rotl1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16])

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20)
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0

    e = d
    d = c
    c = rotl30(b)
    b = a
    a = t
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
}

Sha1.prototype._hash = function () {
  var H = Buffer.allocUnsafe(20)

  H.writeInt32BE(this._a | 0, 0)
  H.writeInt32BE(this._b | 0, 4)
  H.writeInt32BE(this._c | 0, 8)
  H.writeInt32BE(this._d | 0, 12)
  H.writeInt32BE(this._e | 0, 16)

  return H
}

module.exports = Sha1

},{"./hash":54,"inherits":41,"safe-buffer":53}],58:[function(require,module,exports){
/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = require('inherits')
var Sha256 = require('./sha256')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var W = new Array(64)

function Sha224 () {
  this.init()

  this._w = W // new Array(64)

  Hash.call(this, 64, 56)
}

inherits(Sha224, Sha256)

Sha224.prototype.init = function () {
  this._a = 0xc1059ed8
  this._b = 0x367cd507
  this._c = 0x3070dd17
  this._d = 0xf70e5939
  this._e = 0xffc00b31
  this._f = 0x68581511
  this._g = 0x64f98fa7
  this._h = 0xbefa4fa4

  return this
}

Sha224.prototype._hash = function () {
  var H = Buffer.allocUnsafe(28)

  H.writeInt32BE(this._a, 0)
  H.writeInt32BE(this._b, 4)
  H.writeInt32BE(this._c, 8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)

  return H
}

module.exports = Sha224

},{"./hash":54,"./sha256":59,"inherits":41,"safe-buffer":53}],59:[function(require,module,exports){
/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
  0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
  0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
  0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
  0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
  0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
  0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
  0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
  0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
]

var W = new Array(64)

function Sha256 () {
  this.init()

  this._w = W // new Array(64)

  Hash.call(this, 64, 56)
}

inherits(Sha256, Hash)

Sha256.prototype.init = function () {
  this._a = 0x6a09e667
  this._b = 0xbb67ae85
  this._c = 0x3c6ef372
  this._d = 0xa54ff53a
  this._e = 0x510e527f
  this._f = 0x9b05688c
  this._g = 0x1f83d9ab
  this._h = 0x5be0cd19

  return this
}

function ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x) {
  return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10)
}

function sigma1 (x) {
  return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7)
}

function gamma0 (x) {
  return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3)
}

function gamma1 (x) {
  return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10)
}

Sha256.prototype._update = function (M) {
  var W = this._w

  var a = this._a | 0
  var b = this._b | 0
  var c = this._c | 0
  var d = this._d | 0
  var e = this._e | 0
  var f = this._f | 0
  var g = this._g | 0
  var h = this._h | 0

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4)
  for (; i < 64; ++i) W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0

  for (var j = 0; j < 64; ++j) {
    var T1 = (h + sigma1(e) + ch(e, f, g) + K[j] + W[j]) | 0
    var T2 = (sigma0(a) + maj(a, b, c)) | 0

    h = g
    g = f
    f = e
    e = (d + T1) | 0
    d = c
    c = b
    b = a
    a = (T1 + T2) | 0
  }

  this._a = (a + this._a) | 0
  this._b = (b + this._b) | 0
  this._c = (c + this._c) | 0
  this._d = (d + this._d) | 0
  this._e = (e + this._e) | 0
  this._f = (f + this._f) | 0
  this._g = (g + this._g) | 0
  this._h = (h + this._h) | 0
}

Sha256.prototype._hash = function () {
  var H = Buffer.allocUnsafe(32)

  H.writeInt32BE(this._a, 0)
  H.writeInt32BE(this._b, 4)
  H.writeInt32BE(this._c, 8)
  H.writeInt32BE(this._d, 12)
  H.writeInt32BE(this._e, 16)
  H.writeInt32BE(this._f, 20)
  H.writeInt32BE(this._g, 24)
  H.writeInt32BE(this._h, 28)

  return H
}

module.exports = Sha256

},{"./hash":54,"inherits":41,"safe-buffer":53}],60:[function(require,module,exports){
var inherits = require('inherits')
var SHA512 = require('./sha512')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var W = new Array(160)

function Sha384 () {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha384, SHA512)

Sha384.prototype.init = function () {
  this._ah = 0xcbbb9d5d
  this._bh = 0x629a292a
  this._ch = 0x9159015a
  this._dh = 0x152fecd8
  this._eh = 0x67332667
  this._fh = 0x8eb44a87
  this._gh = 0xdb0c2e0d
  this._hh = 0x47b5481d

  this._al = 0xc1059ed8
  this._bl = 0x367cd507
  this._cl = 0x3070dd17
  this._dl = 0xf70e5939
  this._el = 0xffc00b31
  this._fl = 0x68581511
  this._gl = 0x64f98fa7
  this._hl = 0xbefa4fa4

  return this
}

Sha384.prototype._hash = function () {
  var H = Buffer.allocUnsafe(48)

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._ah, this._al, 0)
  writeInt64BE(this._bh, this._bl, 8)
  writeInt64BE(this._ch, this._cl, 16)
  writeInt64BE(this._dh, this._dl, 24)
  writeInt64BE(this._eh, this._el, 32)
  writeInt64BE(this._fh, this._fl, 40)

  return H
}

module.exports = Sha384

},{"./hash":54,"./sha512":61,"inherits":41,"safe-buffer":53}],61:[function(require,module,exports){
var inherits = require('inherits')
var Hash = require('./hash')
var Buffer = require('safe-buffer').Buffer

var K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
]

var W = new Array(160)

function Sha512 () {
  this.init()
  this._w = W

  Hash.call(this, 128, 112)
}

inherits(Sha512, Hash)

Sha512.prototype.init = function () {
  this._ah = 0x6a09e667
  this._bh = 0xbb67ae85
  this._ch = 0x3c6ef372
  this._dh = 0xa54ff53a
  this._eh = 0x510e527f
  this._fh = 0x9b05688c
  this._gh = 0x1f83d9ab
  this._hh = 0x5be0cd19

  this._al = 0xf3bcc908
  this._bl = 0x84caa73b
  this._cl = 0xfe94f82b
  this._dl = 0x5f1d36f1
  this._el = 0xade682d1
  this._fl = 0x2b3e6c1f
  this._gl = 0xfb41bd6b
  this._hl = 0x137e2179

  return this
}

function Ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x, xl) {
  return (x >>> 28 | xl << 4) ^ (xl >>> 2 | x << 30) ^ (xl >>> 7 | x << 25)
}

function sigma1 (x, xl) {
  return (x >>> 14 | xl << 18) ^ (x >>> 18 | xl << 14) ^ (xl >>> 9 | x << 23)
}

function Gamma0 (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7)
}

function Gamma0l (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7 | xl << 25)
}

function Gamma1 (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6)
}

function Gamma1l (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6 | xl << 26)
}

function getCarry (a, b) {
  return (a >>> 0) < (b >>> 0) ? 1 : 0
}

Sha512.prototype._update = function (M) {
  var W = this._w

  var ah = this._ah | 0
  var bh = this._bh | 0
  var ch = this._ch | 0
  var dh = this._dh | 0
  var eh = this._eh | 0
  var fh = this._fh | 0
  var gh = this._gh | 0
  var hh = this._hh | 0

  var al = this._al | 0
  var bl = this._bl | 0
  var cl = this._cl | 0
  var dl = this._dl | 0
  var el = this._el | 0
  var fl = this._fl | 0
  var gl = this._gl | 0
  var hl = this._hl | 0

  for (var i = 0; i < 32; i += 2) {
    W[i] = M.readInt32BE(i * 4)
    W[i + 1] = M.readInt32BE(i * 4 + 4)
  }
  for (; i < 160; i += 2) {
    var xh = W[i - 15 * 2]
    var xl = W[i - 15 * 2 + 1]
    var gamma0 = Gamma0(xh, xl)
    var gamma0l = Gamma0l(xl, xh)

    xh = W[i - 2 * 2]
    xl = W[i - 2 * 2 + 1]
    var gamma1 = Gamma1(xh, xl)
    var gamma1l = Gamma1l(xl, xh)

    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
    var Wi7h = W[i - 7 * 2]
    var Wi7l = W[i - 7 * 2 + 1]

    var Wi16h = W[i - 16 * 2]
    var Wi16l = W[i - 16 * 2 + 1]

    var Wil = (gamma0l + Wi7l) | 0
    var Wih = (gamma0 + Wi7h + getCarry(Wil, gamma0l)) | 0
    Wil = (Wil + gamma1l) | 0
    Wih = (Wih + gamma1 + getCarry(Wil, gamma1l)) | 0
    Wil = (Wil + Wi16l) | 0
    Wih = (Wih + Wi16h + getCarry(Wil, Wi16l)) | 0

    W[i] = Wih
    W[i + 1] = Wil
  }

  for (var j = 0; j < 160; j += 2) {
    Wih = W[j]
    Wil = W[j + 1]

    var majh = maj(ah, bh, ch)
    var majl = maj(al, bl, cl)

    var sigma0h = sigma0(ah, al)
    var sigma0l = sigma0(al, ah)
    var sigma1h = sigma1(eh, el)
    var sigma1l = sigma1(el, eh)

    // t1 = h + sigma1 + ch + K[j] + W[j]
    var Kih = K[j]
    var Kil = K[j + 1]

    var chh = Ch(eh, fh, gh)
    var chl = Ch(el, fl, gl)

    var t1l = (hl + sigma1l) | 0
    var t1h = (hh + sigma1h + getCarry(t1l, hl)) | 0
    t1l = (t1l + chl) | 0
    t1h = (t1h + chh + getCarry(t1l, chl)) | 0
    t1l = (t1l + Kil) | 0
    t1h = (t1h + Kih + getCarry(t1l, Kil)) | 0
    t1l = (t1l + Wil) | 0
    t1h = (t1h + Wih + getCarry(t1l, Wil)) | 0

    // t2 = sigma0 + maj
    var t2l = (sigma0l + majl) | 0
    var t2h = (sigma0h + majh + getCarry(t2l, sigma0l)) | 0

    hh = gh
    hl = gl
    gh = fh
    gl = fl
    fh = eh
    fl = el
    el = (dl + t1l) | 0
    eh = (dh + t1h + getCarry(el, dl)) | 0
    dh = ch
    dl = cl
    ch = bh
    cl = bl
    bh = ah
    bl = al
    al = (t1l + t2l) | 0
    ah = (t1h + t2h + getCarry(al, t1l)) | 0
  }

  this._al = (this._al + al) | 0
  this._bl = (this._bl + bl) | 0
  this._cl = (this._cl + cl) | 0
  this._dl = (this._dl + dl) | 0
  this._el = (this._el + el) | 0
  this._fl = (this._fl + fl) | 0
  this._gl = (this._gl + gl) | 0
  this._hl = (this._hl + hl) | 0

  this._ah = (this._ah + ah + getCarry(this._al, al)) | 0
  this._bh = (this._bh + bh + getCarry(this._bl, bl)) | 0
  this._ch = (this._ch + ch + getCarry(this._cl, cl)) | 0
  this._dh = (this._dh + dh + getCarry(this._dl, dl)) | 0
  this._eh = (this._eh + eh + getCarry(this._el, el)) | 0
  this._fh = (this._fh + fh + getCarry(this._fl, fl)) | 0
  this._gh = (this._gh + gh + getCarry(this._gl, gl)) | 0
  this._hh = (this._hh + hh + getCarry(this._hl, hl)) | 0
}

Sha512.prototype._hash = function () {
  var H = Buffer.allocUnsafe(64)

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset)
    H.writeInt32BE(l, offset + 4)
  }

  writeInt64BE(this._ah, this._al, 0)
  writeInt64BE(this._bh, this._bl, 8)
  writeInt64BE(this._ch, this._cl, 16)
  writeInt64BE(this._dh, this._dl, 24)
  writeInt64BE(this._eh, this._el, 32)
  writeInt64BE(this._fh, this._fl, 40)
  writeInt64BE(this._gh, this._gl, 48)
  writeInt64BE(this._hh, this._hl, 56)

  return H
}

module.exports = Sha512

},{"./hash":54,"inherits":41,"safe-buffer":53}],62:[function(require,module,exports){
(function (root) {
   "use strict";

/***** unorm.js *****/

/*
 * UnicodeNormalizer 1.0.0
 * Copyright (c) 2008 Matsuza
 * Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 * $Date: 2008-06-05 16:44:17 +0200 (Thu, 05 Jun 2008) $
 * $Rev: 13309 $
 */

   var DEFAULT_FEATURE = [null, 0, {}];
   var CACHE_THRESHOLD = 10;
   var SBase = 0xAC00, LBase = 0x1100, VBase = 0x1161, TBase = 0x11A7, LCount = 19, VCount = 21, TCount = 28;
   var NCount = VCount * TCount; // 588
   var SCount = LCount * NCount; // 11172

   var UChar = function(cp, feature){
      this.codepoint = cp;
      this.feature = feature;
   };

   // Strategies
   var cache = {};
   var cacheCounter = [];
   for (var i = 0; i <= 0xFF; ++i){
      cacheCounter[i] = 0;
   }

   function fromCache(next, cp, needFeature){
      var ret = cache[cp];
      if(!ret){
         ret = next(cp, needFeature);
         if(!!ret.feature && ++cacheCounter[(cp >> 8) & 0xFF] > CACHE_THRESHOLD){
            cache[cp] = ret;
         }
      }
      return ret;
   }

   function fromData(next, cp, needFeature){
      var hash = cp & 0xFF00;
      var dunit = UChar.udata[hash] || {};
      var f = dunit[cp];
      return f ? new UChar(cp, f) : new UChar(cp, DEFAULT_FEATURE);
   }
   function fromCpOnly(next, cp, needFeature){
      return !!needFeature ? next(cp, needFeature) : new UChar(cp, null);
   }
   function fromRuleBasedJamo(next, cp, needFeature){
      var j;
      if(cp < LBase || (LBase + LCount <= cp && cp < SBase) || (SBase + SCount < cp)){
         return next(cp, needFeature);
      }
      if(LBase <= cp && cp < LBase + LCount){
         var c = {};
         var base = (cp - LBase) * VCount;
         for (j = 0; j < VCount; ++j){
            c[VBase + j] = SBase + TCount * (j + base);
         }
         return new UChar(cp, [,,c]);
      }

      var SIndex = cp - SBase;
      var TIndex = SIndex % TCount;
      var feature = [];
      if(TIndex !== 0){
         feature[0] = [SBase + SIndex - TIndex, TBase + TIndex];
      } else {
         feature[0] = [LBase + Math.floor(SIndex / NCount), VBase + Math.floor((SIndex % NCount) / TCount)];
         feature[2] = {};
         for (j = 1; j < TCount; ++j){
            feature[2][TBase + j] = cp + j;
         }
      }
      return new UChar(cp, feature);
   }
   function fromCpFilter(next, cp, needFeature){
      return cp < 60 || 13311 < cp && cp < 42607 ? new UChar(cp, DEFAULT_FEATURE) : next(cp, needFeature);
   }

   var strategies = [fromCpFilter, fromCache, fromCpOnly, fromRuleBasedJamo, fromData];

   UChar.fromCharCode = strategies.reduceRight(function (next, strategy) {
      return function (cp, needFeature) {
         return strategy(next, cp, needFeature);
      };
   }, null);

   UChar.isHighSurrogate = function(cp){
      return cp >= 0xD800 && cp <= 0xDBFF;
   };
   UChar.isLowSurrogate = function(cp){
      return cp >= 0xDC00 && cp <= 0xDFFF;
   };

   UChar.prototype.prepFeature = function(){
      if(!this.feature){
         this.feature = UChar.fromCharCode(this.codepoint, true).feature;
      }
   };

   UChar.prototype.toString = function(){
      if(this.codepoint < 0x10000){
         return String.fromCharCode(this.codepoint);
      } else {
         var x = this.codepoint - 0x10000;
         return String.fromCharCode(Math.floor(x / 0x400) + 0xD800, x % 0x400 + 0xDC00);
      }
   };

   UChar.prototype.getDecomp = function(){
      this.prepFeature();
      return this.feature[0] || null;
   };

   UChar.prototype.isCompatibility = function(){
      this.prepFeature();
      return !!this.feature[1] && (this.feature[1] & (1 << 8));
   };
   UChar.prototype.isExclude = function(){
      this.prepFeature();
      return !!this.feature[1] && (this.feature[1] & (1 << 9));
   };
   UChar.prototype.getCanonicalClass = function(){
      this.prepFeature();
      return !!this.feature[1] ? (this.feature[1] & 0xff) : 0;
   };
   UChar.prototype.getComposite = function(following){
      this.prepFeature();
      if(!this.feature[2]){
         return null;
      }
      var cp = this.feature[2][following.codepoint];
      return cp ? UChar.fromCharCode(cp) : null;
   };

   var UCharIterator = function(str){
      this.str = str;
      this.cursor = 0;
   };
   UCharIterator.prototype.next = function(){
      if(!!this.str && this.cursor < this.str.length){
         var cp = this.str.charCodeAt(this.cursor++);
         var d;
         if(UChar.isHighSurrogate(cp) && this.cursor < this.str.length && UChar.isLowSurrogate((d = this.str.charCodeAt(this.cursor)))){
            cp = (cp - 0xD800) * 0x400 + (d -0xDC00) + 0x10000;
            ++this.cursor;
         }
         return UChar.fromCharCode(cp);
      } else {
         this.str = null;
         return null;
      }
   };

   var RecursDecompIterator = function(it, cano){
      this.it = it;
      this.canonical = cano;
      this.resBuf = [];
   };

   RecursDecompIterator.prototype.next = function(){
      function recursiveDecomp(cano, uchar){
         var decomp = uchar.getDecomp();
         if(!!decomp && !(cano && uchar.isCompatibility())){
            var ret = [];
            for(var i = 0; i < decomp.length; ++i){
               var a = recursiveDecomp(cano, UChar.fromCharCode(decomp[i]));
                ret = ret.concat(a);
            }
            return ret;
         } else {
            return [uchar];
         }
      }
      if(this.resBuf.length === 0){
         var uchar = this.it.next();
         if(!uchar){
            return null;
         }
         this.resBuf = recursiveDecomp(this.canonical, uchar);
      }
      return this.resBuf.shift();
   };

   var DecompIterator = function(it){
      this.it = it;
      this.resBuf = [];
   };

   DecompIterator.prototype.next = function(){
      var cc;
      if(this.resBuf.length === 0){
         do{
            var uchar = this.it.next();
            if(!uchar){
               break;
            }
            cc = uchar.getCanonicalClass();
            var inspt = this.resBuf.length;
            if(cc !== 0){
               for(; inspt > 0; --inspt){
                  var uchar2 = this.resBuf[inspt - 1];
                  var cc2 = uchar2.getCanonicalClass();
                  if(cc2 <= cc){
                     break;
                  }
               }
            }
            this.resBuf.splice(inspt, 0, uchar);
         } while(cc !== 0);
      }
      return this.resBuf.shift();
   };

   var CompIterator = function(it){
      this.it = it;
      this.procBuf = [];
      this.resBuf = [];
      this.lastClass = null;
   };

   CompIterator.prototype.next = function(){
      while(this.resBuf.length === 0){
         var uchar = this.it.next();
         if(!uchar){
            this.resBuf = this.procBuf;
            this.procBuf = [];
            break;
         }
         if(this.procBuf.length === 0){
            this.lastClass = uchar.getCanonicalClass();
            this.procBuf.push(uchar);
         } else {
            var starter = this.procBuf[0];
            var composite = starter.getComposite(uchar);
            var cc = uchar.getCanonicalClass();
            if(!!composite && (this.lastClass < cc || this.lastClass === 0)){
               this.procBuf[0] = composite;
            } else {
               if(cc === 0){
                  this.resBuf = this.procBuf;
                  this.procBuf = [];
               }
               this.lastClass = cc;
               this.procBuf.push(uchar);
            }
         }
      }
      return this.resBuf.shift();
   };

   var createIterator = function(mode, str){
      switch(mode){
         case "NFD":
            return new DecompIterator(new RecursDecompIterator(new UCharIterator(str), true));
         case "NFKD":
            return new DecompIterator(new RecursDecompIterator(new UCharIterator(str), false));
         case "NFC":
            return new CompIterator(new DecompIterator(new RecursDecompIterator(new UCharIterator(str), true)));
         case "NFKC":
            return new CompIterator(new DecompIterator(new RecursDecompIterator(new UCharIterator(str), false)));
      }
      throw mode + " is invalid";
   };
   var normalize = function(mode, str){
      var it = createIterator(mode, str);
      var ret = "";
      var uchar;
      while(!!(uchar = it.next())){
         ret += uchar.toString();
      }
      return ret;
   };

   /* API functions */
   function nfd(str){
      return normalize("NFD", str);
   }

   function nfkd(str){
      return normalize("NFKD", str);
   }

   function nfc(str){
      return normalize("NFC", str);
   }

   function nfkc(str){
      return normalize("NFKC", str);
   }

/* Unicode data */
UChar.udata={
0:{60:[,,{824:8814}],61:[,,{824:8800}],62:[,,{824:8815}],65:[,,{768:192,769:193,770:194,771:195,772:256,774:258,775:550,776:196,777:7842,778:197,780:461,783:512,785:514,803:7840,805:7680,808:260}],66:[,,{775:7682,803:7684,817:7686}],67:[,,{769:262,770:264,775:266,780:268,807:199}],68:[,,{775:7690,780:270,803:7692,807:7696,813:7698,817:7694}],69:[,,{768:200,769:201,770:202,771:7868,772:274,774:276,775:278,776:203,777:7866,780:282,783:516,785:518,803:7864,807:552,808:280,813:7704,816:7706}],70:[,,{775:7710}],71:[,,{769:500,770:284,772:7712,774:286,775:288,780:486,807:290}],72:[,,{770:292,775:7714,776:7718,780:542,803:7716,807:7720,814:7722}],73:[,,{768:204,769:205,770:206,771:296,772:298,774:300,775:304,776:207,777:7880,780:463,783:520,785:522,803:7882,808:302,816:7724}],74:[,,{770:308}],75:[,,{769:7728,780:488,803:7730,807:310,817:7732}],76:[,,{769:313,780:317,803:7734,807:315,813:7740,817:7738}],77:[,,{769:7742,775:7744,803:7746}],78:[,,{768:504,769:323,771:209,775:7748,780:327,803:7750,807:325,813:7754,817:7752}],79:[,,{768:210,769:211,770:212,771:213,772:332,774:334,775:558,776:214,777:7886,779:336,780:465,783:524,785:526,795:416,803:7884,808:490}],80:[,,{769:7764,775:7766}],82:[,,{769:340,775:7768,780:344,783:528,785:530,803:7770,807:342,817:7774}],83:[,,{769:346,770:348,775:7776,780:352,803:7778,806:536,807:350}],84:[,,{775:7786,780:356,803:7788,806:538,807:354,813:7792,817:7790}],85:[,,{768:217,769:218,770:219,771:360,772:362,774:364,776:220,777:7910,778:366,779:368,780:467,783:532,785:534,795:431,803:7908,804:7794,808:370,813:7798,816:7796}],86:[,,{771:7804,803:7806}],87:[,,{768:7808,769:7810,770:372,775:7814,776:7812,803:7816}],88:[,,{775:7818,776:7820}],89:[,,{768:7922,769:221,770:374,771:7928,772:562,775:7822,776:376,777:7926,803:7924}],90:[,,{769:377,770:7824,775:379,780:381,803:7826,817:7828}],97:[,,{768:224,769:225,770:226,771:227,772:257,774:259,775:551,776:228,777:7843,778:229,780:462,783:513,785:515,803:7841,805:7681,808:261}],98:[,,{775:7683,803:7685,817:7687}],99:[,,{769:263,770:265,775:267,780:269,807:231}],100:[,,{775:7691,780:271,803:7693,807:7697,813:7699,817:7695}],101:[,,{768:232,769:233,770:234,771:7869,772:275,774:277,775:279,776:235,777:7867,780:283,783:517,785:519,803:7865,807:553,808:281,813:7705,816:7707}],102:[,,{775:7711}],103:[,,{769:501,770:285,772:7713,774:287,775:289,780:487,807:291}],104:[,,{770:293,775:7715,776:7719,780:543,803:7717,807:7721,814:7723,817:7830}],105:[,,{768:236,769:237,770:238,771:297,772:299,774:301,776:239,777:7881,780:464,783:521,785:523,803:7883,808:303,816:7725}],106:[,,{770:309,780:496}],107:[,,{769:7729,780:489,803:7731,807:311,817:7733}],108:[,,{769:314,780:318,803:7735,807:316,813:7741,817:7739}],109:[,,{769:7743,775:7745,803:7747}],110:[,,{768:505,769:324,771:241,775:7749,780:328,803:7751,807:326,813:7755,817:7753}],111:[,,{768:242,769:243,770:244,771:245,772:333,774:335,775:559,776:246,777:7887,779:337,780:466,783:525,785:527,795:417,803:7885,808:491}],112:[,,{769:7765,775:7767}],114:[,,{769:341,775:7769,780:345,783:529,785:531,803:7771,807:343,817:7775}],115:[,,{769:347,770:349,775:7777,780:353,803:7779,806:537,807:351}],116:[,,{775:7787,776:7831,780:357,803:7789,806:539,807:355,813:7793,817:7791}],117:[,,{768:249,769:250,770:251,771:361,772:363,774:365,776:252,777:7911,778:367,779:369,780:468,783:533,785:535,795:432,803:7909,804:7795,808:371,813:7799,816:7797}],118:[,,{771:7805,803:7807}],119:[,,{768:7809,769:7811,770:373,775:7815,776:7813,778:7832,803:7817}],120:[,,{775:7819,776:7821}],121:[,,{768:7923,769:253,770:375,771:7929,772:563,775:7823,776:255,777:7927,778:7833,803:7925}],122:[,,{769:378,770:7825,775:380,780:382,803:7827,817:7829}],160:[[32],256],168:[[32,776],256,{768:8173,769:901,834:8129}],170:[[97],256],175:[[32,772],256],178:[[50],256],179:[[51],256],180:[[32,769],256],181:[[956],256],184:[[32,807],256],185:[[49],256],186:[[111],256],188:[[49,8260,52],256],189:[[49,8260,50],256],190:[[51,8260,52],256],192:[[65,768]],193:[[65,769]],194:[[65,770],,{768:7846,769:7844,771:7850,777:7848}],195:[[65,771]],196:[[65,776],,{772:478}],197:[[65,778],,{769:506}],198:[,,{769:508,772:482}],199:[[67,807],,{769:7688}],200:[[69,768]],201:[[69,769]],202:[[69,770],,{768:7872,769:7870,771:7876,777:7874}],203:[[69,776]],204:[[73,768]],205:[[73,769]],206:[[73,770]],207:[[73,776],,{769:7726}],209:[[78,771]],210:[[79,768]],211:[[79,769]],212:[[79,770],,{768:7890,769:7888,771:7894,777:7892}],213:[[79,771],,{769:7756,772:556,776:7758}],214:[[79,776],,{772:554}],216:[,,{769:510}],217:[[85,768]],218:[[85,769]],219:[[85,770]],220:[[85,776],,{768:475,769:471,772:469,780:473}],221:[[89,769]],224:[[97,768]],225:[[97,769]],226:[[97,770],,{768:7847,769:7845,771:7851,777:7849}],227:[[97,771]],228:[[97,776],,{772:479}],229:[[97,778],,{769:507}],230:[,,{769:509,772:483}],231:[[99,807],,{769:7689}],232:[[101,768]],233:[[101,769]],234:[[101,770],,{768:7873,769:7871,771:7877,777:7875}],235:[[101,776]],236:[[105,768]],237:[[105,769]],238:[[105,770]],239:[[105,776],,{769:7727}],241:[[110,771]],242:[[111,768]],243:[[111,769]],244:[[111,770],,{768:7891,769:7889,771:7895,777:7893}],245:[[111,771],,{769:7757,772:557,776:7759}],246:[[111,776],,{772:555}],248:[,,{769:511}],249:[[117,768]],250:[[117,769]],251:[[117,770]],252:[[117,776],,{768:476,769:472,772:470,780:474}],253:[[121,769]],255:[[121,776]]},
256:{256:[[65,772]],257:[[97,772]],258:[[65,774],,{768:7856,769:7854,771:7860,777:7858}],259:[[97,774],,{768:7857,769:7855,771:7861,777:7859}],260:[[65,808]],261:[[97,808]],262:[[67,769]],263:[[99,769]],264:[[67,770]],265:[[99,770]],266:[[67,775]],267:[[99,775]],268:[[67,780]],269:[[99,780]],270:[[68,780]],271:[[100,780]],274:[[69,772],,{768:7700,769:7702}],275:[[101,772],,{768:7701,769:7703}],276:[[69,774]],277:[[101,774]],278:[[69,775]],279:[[101,775]],280:[[69,808]],281:[[101,808]],282:[[69,780]],283:[[101,780]],284:[[71,770]],285:[[103,770]],286:[[71,774]],287:[[103,774]],288:[[71,775]],289:[[103,775]],290:[[71,807]],291:[[103,807]],292:[[72,770]],293:[[104,770]],296:[[73,771]],297:[[105,771]],298:[[73,772]],299:[[105,772]],300:[[73,774]],301:[[105,774]],302:[[73,808]],303:[[105,808]],304:[[73,775]],306:[[73,74],256],307:[[105,106],256],308:[[74,770]],309:[[106,770]],310:[[75,807]],311:[[107,807]],313:[[76,769]],314:[[108,769]],315:[[76,807]],316:[[108,807]],317:[[76,780]],318:[[108,780]],319:[[76,183],256],320:[[108,183],256],323:[[78,769]],324:[[110,769]],325:[[78,807]],326:[[110,807]],327:[[78,780]],328:[[110,780]],329:[[700,110],256],332:[[79,772],,{768:7760,769:7762}],333:[[111,772],,{768:7761,769:7763}],334:[[79,774]],335:[[111,774]],336:[[79,779]],337:[[111,779]],340:[[82,769]],341:[[114,769]],342:[[82,807]],343:[[114,807]],344:[[82,780]],345:[[114,780]],346:[[83,769],,{775:7780}],347:[[115,769],,{775:7781}],348:[[83,770]],349:[[115,770]],350:[[83,807]],351:[[115,807]],352:[[83,780],,{775:7782}],353:[[115,780],,{775:7783}],354:[[84,807]],355:[[116,807]],356:[[84,780]],357:[[116,780]],360:[[85,771],,{769:7800}],361:[[117,771],,{769:7801}],362:[[85,772],,{776:7802}],363:[[117,772],,{776:7803}],364:[[85,774]],365:[[117,774]],366:[[85,778]],367:[[117,778]],368:[[85,779]],369:[[117,779]],370:[[85,808]],371:[[117,808]],372:[[87,770]],373:[[119,770]],374:[[89,770]],375:[[121,770]],376:[[89,776]],377:[[90,769]],378:[[122,769]],379:[[90,775]],380:[[122,775]],381:[[90,780]],382:[[122,780]],383:[[115],256,{775:7835}],416:[[79,795],,{768:7900,769:7898,771:7904,777:7902,803:7906}],417:[[111,795],,{768:7901,769:7899,771:7905,777:7903,803:7907}],431:[[85,795],,{768:7914,769:7912,771:7918,777:7916,803:7920}],432:[[117,795],,{768:7915,769:7913,771:7919,777:7917,803:7921}],439:[,,{780:494}],452:[[68,381],256],453:[[68,382],256],454:[[100,382],256],455:[[76,74],256],456:[[76,106],256],457:[[108,106],256],458:[[78,74],256],459:[[78,106],256],460:[[110,106],256],461:[[65,780]],462:[[97,780]],463:[[73,780]],464:[[105,780]],465:[[79,780]],466:[[111,780]],467:[[85,780]],468:[[117,780]],469:[[220,772]],470:[[252,772]],471:[[220,769]],472:[[252,769]],473:[[220,780]],474:[[252,780]],475:[[220,768]],476:[[252,768]],478:[[196,772]],479:[[228,772]],480:[[550,772]],481:[[551,772]],482:[[198,772]],483:[[230,772]],486:[[71,780]],487:[[103,780]],488:[[75,780]],489:[[107,780]],490:[[79,808],,{772:492}],491:[[111,808],,{772:493}],492:[[490,772]],493:[[491,772]],494:[[439,780]],495:[[658,780]],496:[[106,780]],497:[[68,90],256],498:[[68,122],256],499:[[100,122],256],500:[[71,769]],501:[[103,769]],504:[[78,768]],505:[[110,768]],506:[[197,769]],507:[[229,769]],508:[[198,769]],509:[[230,769]],510:[[216,769]],511:[[248,769]],66045:[,220]},
512:{512:[[65,783]],513:[[97,783]],514:[[65,785]],515:[[97,785]],516:[[69,783]],517:[[101,783]],518:[[69,785]],519:[[101,785]],520:[[73,783]],521:[[105,783]],522:[[73,785]],523:[[105,785]],524:[[79,783]],525:[[111,783]],526:[[79,785]],527:[[111,785]],528:[[82,783]],529:[[114,783]],530:[[82,785]],531:[[114,785]],532:[[85,783]],533:[[117,783]],534:[[85,785]],535:[[117,785]],536:[[83,806]],537:[[115,806]],538:[[84,806]],539:[[116,806]],542:[[72,780]],543:[[104,780]],550:[[65,775],,{772:480}],551:[[97,775],,{772:481}],552:[[69,807],,{774:7708}],553:[[101,807],,{774:7709}],554:[[214,772]],555:[[246,772]],556:[[213,772]],557:[[245,772]],558:[[79,775],,{772:560}],559:[[111,775],,{772:561}],560:[[558,772]],561:[[559,772]],562:[[89,772]],563:[[121,772]],658:[,,{780:495}],688:[[104],256],689:[[614],256],690:[[106],256],691:[[114],256],692:[[633],256],693:[[635],256],694:[[641],256],695:[[119],256],696:[[121],256],728:[[32,774],256],729:[[32,775],256],730:[[32,778],256],731:[[32,808],256],732:[[32,771],256],733:[[32,779],256],736:[[611],256],737:[[108],256],738:[[115],256],739:[[120],256],740:[[661],256],66272:[,220]},
768:{768:[,230],769:[,230],770:[,230],771:[,230],772:[,230],773:[,230],774:[,230],775:[,230],776:[,230,{769:836}],777:[,230],778:[,230],779:[,230],780:[,230],781:[,230],782:[,230],783:[,230],784:[,230],785:[,230],786:[,230],787:[,230],788:[,230],789:[,232],790:[,220],791:[,220],792:[,220],793:[,220],794:[,232],795:[,216],796:[,220],797:[,220],798:[,220],799:[,220],800:[,220],801:[,202],802:[,202],803:[,220],804:[,220],805:[,220],806:[,220],807:[,202],808:[,202],809:[,220],810:[,220],811:[,220],812:[,220],813:[,220],814:[,220],815:[,220],816:[,220],817:[,220],818:[,220],819:[,220],820:[,1],821:[,1],822:[,1],823:[,1],824:[,1],825:[,220],826:[,220],827:[,220],828:[,220],829:[,230],830:[,230],831:[,230],832:[[768],230],833:[[769],230],834:[,230],835:[[787],230],836:[[776,769],230],837:[,240],838:[,230],839:[,220],840:[,220],841:[,220],842:[,230],843:[,230],844:[,230],845:[,220],846:[,220],848:[,230],849:[,230],850:[,230],851:[,220],852:[,220],853:[,220],854:[,220],855:[,230],856:[,232],857:[,220],858:[,220],859:[,230],860:[,233],861:[,234],862:[,234],863:[,233],864:[,234],865:[,234],866:[,233],867:[,230],868:[,230],869:[,230],870:[,230],871:[,230],872:[,230],873:[,230],874:[,230],875:[,230],876:[,230],877:[,230],878:[,230],879:[,230],884:[[697]],890:[[32,837],256],894:[[59]],900:[[32,769],256],901:[[168,769]],902:[[913,769]],903:[[183]],904:[[917,769]],905:[[919,769]],906:[[921,769]],908:[[927,769]],910:[[933,769]],911:[[937,769]],912:[[970,769]],913:[,,{768:8122,769:902,772:8121,774:8120,787:7944,788:7945,837:8124}],917:[,,{768:8136,769:904,787:7960,788:7961}],919:[,,{768:8138,769:905,787:7976,788:7977,837:8140}],921:[,,{768:8154,769:906,772:8153,774:8152,776:938,787:7992,788:7993}],927:[,,{768:8184,769:908,787:8008,788:8009}],929:[,,{788:8172}],933:[,,{768:8170,769:910,772:8169,774:8168,776:939,788:8025}],937:[,,{768:8186,769:911,787:8040,788:8041,837:8188}],938:[[921,776]],939:[[933,776]],940:[[945,769],,{837:8116}],941:[[949,769]],942:[[951,769],,{837:8132}],943:[[953,769]],944:[[971,769]],945:[,,{768:8048,769:940,772:8113,774:8112,787:7936,788:7937,834:8118,837:8115}],949:[,,{768:8050,769:941,787:7952,788:7953}],951:[,,{768:8052,769:942,787:7968,788:7969,834:8134,837:8131}],953:[,,{768:8054,769:943,772:8145,774:8144,776:970,787:7984,788:7985,834:8150}],959:[,,{768:8056,769:972,787:8000,788:8001}],961:[,,{787:8164,788:8165}],965:[,,{768:8058,769:973,772:8161,774:8160,776:971,787:8016,788:8017,834:8166}],969:[,,{768:8060,769:974,787:8032,788:8033,834:8182,837:8179}],970:[[953,776],,{768:8146,769:912,834:8151}],971:[[965,776],,{768:8162,769:944,834:8167}],972:[[959,769]],973:[[965,769]],974:[[969,769],,{837:8180}],976:[[946],256],977:[[952],256],978:[[933],256,{769:979,776:980}],979:[[978,769]],980:[[978,776]],981:[[966],256],982:[[960],256],1008:[[954],256],1009:[[961],256],1010:[[962],256],1012:[[920],256],1013:[[949],256],1017:[[931],256],66422:[,230],66423:[,230],66424:[,230],66425:[,230],66426:[,230]},
1024:{1024:[[1045,768]],1025:[[1045,776]],1027:[[1043,769]],1030:[,,{776:1031}],1031:[[1030,776]],1036:[[1050,769]],1037:[[1048,768]],1038:[[1059,774]],1040:[,,{774:1232,776:1234}],1043:[,,{769:1027}],1045:[,,{768:1024,774:1238,776:1025}],1046:[,,{774:1217,776:1244}],1047:[,,{776:1246}],1048:[,,{768:1037,772:1250,774:1049,776:1252}],1049:[[1048,774]],1050:[,,{769:1036}],1054:[,,{776:1254}],1059:[,,{772:1262,774:1038,776:1264,779:1266}],1063:[,,{776:1268}],1067:[,,{776:1272}],1069:[,,{776:1260}],1072:[,,{774:1233,776:1235}],1075:[,,{769:1107}],1077:[,,{768:1104,774:1239,776:1105}],1078:[,,{774:1218,776:1245}],1079:[,,{776:1247}],1080:[,,{768:1117,772:1251,774:1081,776:1253}],1081:[[1080,774]],1082:[,,{769:1116}],1086:[,,{776:1255}],1091:[,,{772:1263,774:1118,776:1265,779:1267}],1095:[,,{776:1269}],1099:[,,{776:1273}],1101:[,,{776:1261}],1104:[[1077,768]],1105:[[1077,776]],1107:[[1075,769]],1110:[,,{776:1111}],1111:[[1110,776]],1116:[[1082,769]],1117:[[1080,768]],1118:[[1091,774]],1140:[,,{783:1142}],1141:[,,{783:1143}],1142:[[1140,783]],1143:[[1141,783]],1155:[,230],1156:[,230],1157:[,230],1158:[,230],1159:[,230],1217:[[1046,774]],1218:[[1078,774]],1232:[[1040,774]],1233:[[1072,774]],1234:[[1040,776]],1235:[[1072,776]],1238:[[1045,774]],1239:[[1077,774]],1240:[,,{776:1242}],1241:[,,{776:1243}],1242:[[1240,776]],1243:[[1241,776]],1244:[[1046,776]],1245:[[1078,776]],1246:[[1047,776]],1247:[[1079,776]],1250:[[1048,772]],1251:[[1080,772]],1252:[[1048,776]],1253:[[1080,776]],1254:[[1054,776]],1255:[[1086,776]],1256:[,,{776:1258}],1257:[,,{776:1259}],1258:[[1256,776]],1259:[[1257,776]],1260:[[1069,776]],1261:[[1101,776]],1262:[[1059,772]],1263:[[1091,772]],1264:[[1059,776]],1265:[[1091,776]],1266:[[1059,779]],1267:[[1091,779]],1268:[[1063,776]],1269:[[1095,776]],1272:[[1067,776]],1273:[[1099,776]]},
1280:{1415:[[1381,1410],256],1425:[,220],1426:[,230],1427:[,230],1428:[,230],1429:[,230],1430:[,220],1431:[,230],1432:[,230],1433:[,230],1434:[,222],1435:[,220],1436:[,230],1437:[,230],1438:[,230],1439:[,230],1440:[,230],1441:[,230],1442:[,220],1443:[,220],1444:[,220],1445:[,220],1446:[,220],1447:[,220],1448:[,230],1449:[,230],1450:[,220],1451:[,230],1452:[,230],1453:[,222],1454:[,228],1455:[,230],1456:[,10],1457:[,11],1458:[,12],1459:[,13],1460:[,14],1461:[,15],1462:[,16],1463:[,17],1464:[,18],1465:[,19],1466:[,19],1467:[,20],1468:[,21],1469:[,22],1471:[,23],1473:[,24],1474:[,25],1476:[,230],1477:[,220],1479:[,18]},
1536:{1552:[,230],1553:[,230],1554:[,230],1555:[,230],1556:[,230],1557:[,230],1558:[,230],1559:[,230],1560:[,30],1561:[,31],1562:[,32],1570:[[1575,1619]],1571:[[1575,1620]],1572:[[1608,1620]],1573:[[1575,1621]],1574:[[1610,1620]],1575:[,,{1619:1570,1620:1571,1621:1573}],1608:[,,{1620:1572}],1610:[,,{1620:1574}],1611:[,27],1612:[,28],1613:[,29],1614:[,30],1615:[,31],1616:[,32],1617:[,33],1618:[,34],1619:[,230],1620:[,230],1621:[,220],1622:[,220],1623:[,230],1624:[,230],1625:[,230],1626:[,230],1627:[,230],1628:[,220],1629:[,230],1630:[,230],1631:[,220],1648:[,35],1653:[[1575,1652],256],1654:[[1608,1652],256],1655:[[1735,1652],256],1656:[[1610,1652],256],1728:[[1749,1620]],1729:[,,{1620:1730}],1730:[[1729,1620]],1746:[,,{1620:1747}],1747:[[1746,1620]],1749:[,,{1620:1728}],1750:[,230],1751:[,230],1752:[,230],1753:[,230],1754:[,230],1755:[,230],1756:[,230],1759:[,230],1760:[,230],1761:[,230],1762:[,230],1763:[,220],1764:[,230],1767:[,230],1768:[,230],1770:[,220],1771:[,230],1772:[,230],1773:[,220]},
1792:{1809:[,36],1840:[,230],1841:[,220],1842:[,230],1843:[,230],1844:[,220],1845:[,230],1846:[,230],1847:[,220],1848:[,220],1849:[,220],1850:[,230],1851:[,220],1852:[,220],1853:[,230],1854:[,220],1855:[,230],1856:[,230],1857:[,230],1858:[,220],1859:[,230],1860:[,220],1861:[,230],1862:[,220],1863:[,230],1864:[,220],1865:[,230],1866:[,230],2027:[,230],2028:[,230],2029:[,230],2030:[,230],2031:[,230],2032:[,230],2033:[,230],2034:[,220],2035:[,230]},
2048:{2070:[,230],2071:[,230],2072:[,230],2073:[,230],2075:[,230],2076:[,230],2077:[,230],2078:[,230],2079:[,230],2080:[,230],2081:[,230],2082:[,230],2083:[,230],2085:[,230],2086:[,230],2087:[,230],2089:[,230],2090:[,230],2091:[,230],2092:[,230],2093:[,230],2137:[,220],2138:[,220],2139:[,220],2276:[,230],2277:[,230],2278:[,220],2279:[,230],2280:[,230],2281:[,220],2282:[,230],2283:[,230],2284:[,230],2285:[,220],2286:[,220],2287:[,220],2288:[,27],2289:[,28],2290:[,29],2291:[,230],2292:[,230],2293:[,230],2294:[,220],2295:[,230],2296:[,230],2297:[,220],2298:[,220],2299:[,230],2300:[,230],2301:[,230],2302:[,230],2303:[,230]},
2304:{2344:[,,{2364:2345}],2345:[[2344,2364]],2352:[,,{2364:2353}],2353:[[2352,2364]],2355:[,,{2364:2356}],2356:[[2355,2364]],2364:[,7],2381:[,9],2385:[,230],2386:[,220],2387:[,230],2388:[,230],2392:[[2325,2364],512],2393:[[2326,2364],512],2394:[[2327,2364],512],2395:[[2332,2364],512],2396:[[2337,2364],512],2397:[[2338,2364],512],2398:[[2347,2364],512],2399:[[2351,2364],512],2492:[,7],2503:[,,{2494:2507,2519:2508}],2507:[[2503,2494]],2508:[[2503,2519]],2509:[,9],2524:[[2465,2492],512],2525:[[2466,2492],512],2527:[[2479,2492],512]},
2560:{2611:[[2610,2620],512],2614:[[2616,2620],512],2620:[,7],2637:[,9],2649:[[2582,2620],512],2650:[[2583,2620],512],2651:[[2588,2620],512],2654:[[2603,2620],512],2748:[,7],2765:[,9],68109:[,220],68111:[,230],68152:[,230],68153:[,1],68154:[,220],68159:[,9],68325:[,230],68326:[,220]},
2816:{2876:[,7],2887:[,,{2878:2891,2902:2888,2903:2892}],2888:[[2887,2902]],2891:[[2887,2878]],2892:[[2887,2903]],2893:[,9],2908:[[2849,2876],512],2909:[[2850,2876],512],2962:[,,{3031:2964}],2964:[[2962,3031]],3014:[,,{3006:3018,3031:3020}],3015:[,,{3006:3019}],3018:[[3014,3006]],3019:[[3015,3006]],3020:[[3014,3031]],3021:[,9]},
3072:{3142:[,,{3158:3144}],3144:[[3142,3158]],3149:[,9],3157:[,84],3158:[,91],3260:[,7],3263:[,,{3285:3264}],3264:[[3263,3285]],3270:[,,{3266:3274,3285:3271,3286:3272}],3271:[[3270,3285]],3272:[[3270,3286]],3274:[[3270,3266],,{3285:3275}],3275:[[3274,3285]],3277:[,9]},
3328:{3398:[,,{3390:3402,3415:3404}],3399:[,,{3390:3403}],3402:[[3398,3390]],3403:[[3399,3390]],3404:[[3398,3415]],3405:[,9],3530:[,9],3545:[,,{3530:3546,3535:3548,3551:3550}],3546:[[3545,3530]],3548:[[3545,3535],,{3530:3549}],3549:[[3548,3530]],3550:[[3545,3551]]},
3584:{3635:[[3661,3634],256],3640:[,103],3641:[,103],3642:[,9],3656:[,107],3657:[,107],3658:[,107],3659:[,107],3763:[[3789,3762],256],3768:[,118],3769:[,118],3784:[,122],3785:[,122],3786:[,122],3787:[,122],3804:[[3755,3737],256],3805:[[3755,3745],256]},
3840:{3852:[[3851],256],3864:[,220],3865:[,220],3893:[,220],3895:[,220],3897:[,216],3907:[[3906,4023],512],3917:[[3916,4023],512],3922:[[3921,4023],512],3927:[[3926,4023],512],3932:[[3931,4023],512],3945:[[3904,4021],512],3953:[,129],3954:[,130],3955:[[3953,3954],512],3956:[,132],3957:[[3953,3956],512],3958:[[4018,3968],512],3959:[[4018,3969],256],3960:[[4019,3968],512],3961:[[4019,3969],256],3962:[,130],3963:[,130],3964:[,130],3965:[,130],3968:[,130],3969:[[3953,3968],512],3970:[,230],3971:[,230],3972:[,9],3974:[,230],3975:[,230],3987:[[3986,4023],512],3997:[[3996,4023],512],4002:[[4001,4023],512],4007:[[4006,4023],512],4012:[[4011,4023],512],4025:[[3984,4021],512],4038:[,220]},
4096:{4133:[,,{4142:4134}],4134:[[4133,4142]],4151:[,7],4153:[,9],4154:[,9],4237:[,220],4348:[[4316],256],69702:[,9],69759:[,9],69785:[,,{69818:69786}],69786:[[69785,69818]],69787:[,,{69818:69788}],69788:[[69787,69818]],69797:[,,{69818:69803}],69803:[[69797,69818]],69817:[,9],69818:[,7]},
4352:{69888:[,230],69889:[,230],69890:[,230],69934:[[69937,69927]],69935:[[69938,69927]],69937:[,,{69927:69934}],69938:[,,{69927:69935}],69939:[,9],69940:[,9],70003:[,7],70080:[,9]},
4608:{70197:[,9],70198:[,7],70377:[,7],70378:[,9]},
4864:{4957:[,230],4958:[,230],4959:[,230],70460:[,7],70471:[,,{70462:70475,70487:70476}],70475:[[70471,70462]],70476:[[70471,70487]],70477:[,9],70502:[,230],70503:[,230],70504:[,230],70505:[,230],70506:[,230],70507:[,230],70508:[,230],70512:[,230],70513:[,230],70514:[,230],70515:[,230],70516:[,230]},
5120:{70841:[,,{70832:70844,70842:70843,70845:70846}],70843:[[70841,70842]],70844:[[70841,70832]],70846:[[70841,70845]],70850:[,9],70851:[,7]},
5376:{71096:[,,{71087:71098}],71097:[,,{71087:71099}],71098:[[71096,71087]],71099:[[71097,71087]],71103:[,9],71104:[,7]},
5632:{71231:[,9],71350:[,9],71351:[,7]},
5888:{5908:[,9],5940:[,9],6098:[,9],6109:[,230]},
6144:{6313:[,228]},
6400:{6457:[,222],6458:[,230],6459:[,220]},
6656:{6679:[,230],6680:[,220],6752:[,9],6773:[,230],6774:[,230],6775:[,230],6776:[,230],6777:[,230],6778:[,230],6779:[,230],6780:[,230],6783:[,220],6832:[,230],6833:[,230],6834:[,230],6835:[,230],6836:[,230],6837:[,220],6838:[,220],6839:[,220],6840:[,220],6841:[,220],6842:[,220],6843:[,230],6844:[,230],6845:[,220]},
6912:{6917:[,,{6965:6918}],6918:[[6917,6965]],6919:[,,{6965:6920}],6920:[[6919,6965]],6921:[,,{6965:6922}],6922:[[6921,6965]],6923:[,,{6965:6924}],6924:[[6923,6965]],6925:[,,{6965:6926}],6926:[[6925,6965]],6929:[,,{6965:6930}],6930:[[6929,6965]],6964:[,7],6970:[,,{6965:6971}],6971:[[6970,6965]],6972:[,,{6965:6973}],6973:[[6972,6965]],6974:[,,{6965:6976}],6975:[,,{6965:6977}],6976:[[6974,6965]],6977:[[6975,6965]],6978:[,,{6965:6979}],6979:[[6978,6965]],6980:[,9],7019:[,230],7020:[,220],7021:[,230],7022:[,230],7023:[,230],7024:[,230],7025:[,230],7026:[,230],7027:[,230],7082:[,9],7083:[,9],7142:[,7],7154:[,9],7155:[,9]},
7168:{7223:[,7],7376:[,230],7377:[,230],7378:[,230],7380:[,1],7381:[,220],7382:[,220],7383:[,220],7384:[,220],7385:[,220],7386:[,230],7387:[,230],7388:[,220],7389:[,220],7390:[,220],7391:[,220],7392:[,230],7394:[,1],7395:[,1],7396:[,1],7397:[,1],7398:[,1],7399:[,1],7400:[,1],7405:[,220],7412:[,230],7416:[,230],7417:[,230]},
7424:{7468:[[65],256],7469:[[198],256],7470:[[66],256],7472:[[68],256],7473:[[69],256],7474:[[398],256],7475:[[71],256],7476:[[72],256],7477:[[73],256],7478:[[74],256],7479:[[75],256],7480:[[76],256],7481:[[77],256],7482:[[78],256],7484:[[79],256],7485:[[546],256],7486:[[80],256],7487:[[82],256],7488:[[84],256],7489:[[85],256],7490:[[87],256],7491:[[97],256],7492:[[592],256],7493:[[593],256],7494:[[7426],256],7495:[[98],256],7496:[[100],256],7497:[[101],256],7498:[[601],256],7499:[[603],256],7500:[[604],256],7501:[[103],256],7503:[[107],256],7504:[[109],256],7505:[[331],256],7506:[[111],256],7507:[[596],256],7508:[[7446],256],7509:[[7447],256],7510:[[112],256],7511:[[116],256],7512:[[117],256],7513:[[7453],256],7514:[[623],256],7515:[[118],256],7516:[[7461],256],7517:[[946],256],7518:[[947],256],7519:[[948],256],7520:[[966],256],7521:[[967],256],7522:[[105],256],7523:[[114],256],7524:[[117],256],7525:[[118],256],7526:[[946],256],7527:[[947],256],7528:[[961],256],7529:[[966],256],7530:[[967],256],7544:[[1085],256],7579:[[594],256],7580:[[99],256],7581:[[597],256],7582:[[240],256],7583:[[604],256],7584:[[102],256],7585:[[607],256],7586:[[609],256],7587:[[613],256],7588:[[616],256],7589:[[617],256],7590:[[618],256],7591:[[7547],256],7592:[[669],256],7593:[[621],256],7594:[[7557],256],7595:[[671],256],7596:[[625],256],7597:[[624],256],7598:[[626],256],7599:[[627],256],7600:[[628],256],7601:[[629],256],7602:[[632],256],7603:[[642],256],7604:[[643],256],7605:[[427],256],7606:[[649],256],7607:[[650],256],7608:[[7452],256],7609:[[651],256],7610:[[652],256],7611:[[122],256],7612:[[656],256],7613:[[657],256],7614:[[658],256],7615:[[952],256],7616:[,230],7617:[,230],7618:[,220],7619:[,230],7620:[,230],7621:[,230],7622:[,230],7623:[,230],7624:[,230],7625:[,230],7626:[,220],7627:[,230],7628:[,230],7629:[,234],7630:[,214],7631:[,220],7632:[,202],7633:[,230],7634:[,230],7635:[,230],7636:[,230],7637:[,230],7638:[,230],7639:[,230],7640:[,230],7641:[,230],7642:[,230],7643:[,230],7644:[,230],7645:[,230],7646:[,230],7647:[,230],7648:[,230],7649:[,230],7650:[,230],7651:[,230],7652:[,230],7653:[,230],7654:[,230],7655:[,230],7656:[,230],7657:[,230],7658:[,230],7659:[,230],7660:[,230],7661:[,230],7662:[,230],7663:[,230],7664:[,230],7665:[,230],7666:[,230],7667:[,230],7668:[,230],7669:[,230],7676:[,233],7677:[,220],7678:[,230],7679:[,220]},
7680:{7680:[[65,805]],7681:[[97,805]],7682:[[66,775]],7683:[[98,775]],7684:[[66,803]],7685:[[98,803]],7686:[[66,817]],7687:[[98,817]],7688:[[199,769]],7689:[[231,769]],7690:[[68,775]],7691:[[100,775]],7692:[[68,803]],7693:[[100,803]],7694:[[68,817]],7695:[[100,817]],7696:[[68,807]],7697:[[100,807]],7698:[[68,813]],7699:[[100,813]],7700:[[274,768]],7701:[[275,768]],7702:[[274,769]],7703:[[275,769]],7704:[[69,813]],7705:[[101,813]],7706:[[69,816]],7707:[[101,816]],7708:[[552,774]],7709:[[553,774]],7710:[[70,775]],7711:[[102,775]],7712:[[71,772]],7713:[[103,772]],7714:[[72,775]],7715:[[104,775]],7716:[[72,803]],7717:[[104,803]],7718:[[72,776]],7719:[[104,776]],7720:[[72,807]],7721:[[104,807]],7722:[[72,814]],7723:[[104,814]],7724:[[73,816]],7725:[[105,816]],7726:[[207,769]],7727:[[239,769]],7728:[[75,769]],7729:[[107,769]],7730:[[75,803]],7731:[[107,803]],7732:[[75,817]],7733:[[107,817]],7734:[[76,803],,{772:7736}],7735:[[108,803],,{772:7737}],7736:[[7734,772]],7737:[[7735,772]],7738:[[76,817]],7739:[[108,817]],7740:[[76,813]],7741:[[108,813]],7742:[[77,769]],7743:[[109,769]],7744:[[77,775]],7745:[[109,775]],7746:[[77,803]],7747:[[109,803]],7748:[[78,775]],7749:[[110,775]],7750:[[78,803]],7751:[[110,803]],7752:[[78,817]],7753:[[110,817]],7754:[[78,813]],7755:[[110,813]],7756:[[213,769]],7757:[[245,769]],7758:[[213,776]],7759:[[245,776]],7760:[[332,768]],7761:[[333,768]],7762:[[332,769]],7763:[[333,769]],7764:[[80,769]],7765:[[112,769]],7766:[[80,775]],7767:[[112,775]],7768:[[82,775]],7769:[[114,775]],7770:[[82,803],,{772:7772}],7771:[[114,803],,{772:7773}],7772:[[7770,772]],7773:[[7771,772]],7774:[[82,817]],7775:[[114,817]],7776:[[83,775]],7777:[[115,775]],7778:[[83,803],,{775:7784}],7779:[[115,803],,{775:7785}],7780:[[346,775]],7781:[[347,775]],7782:[[352,775]],7783:[[353,775]],7784:[[7778,775]],7785:[[7779,775]],7786:[[84,775]],7787:[[116,775]],7788:[[84,803]],7789:[[116,803]],7790:[[84,817]],7791:[[116,817]],7792:[[84,813]],7793:[[116,813]],7794:[[85,804]],7795:[[117,804]],7796:[[85,816]],7797:[[117,816]],7798:[[85,813]],7799:[[117,813]],7800:[[360,769]],7801:[[361,769]],7802:[[362,776]],7803:[[363,776]],7804:[[86,771]],7805:[[118,771]],7806:[[86,803]],7807:[[118,803]],7808:[[87,768]],7809:[[119,768]],7810:[[87,769]],7811:[[119,769]],7812:[[87,776]],7813:[[119,776]],7814:[[87,775]],7815:[[119,775]],7816:[[87,803]],7817:[[119,803]],7818:[[88,775]],7819:[[120,775]],7820:[[88,776]],7821:[[120,776]],7822:[[89,775]],7823:[[121,775]],7824:[[90,770]],7825:[[122,770]],7826:[[90,803]],7827:[[122,803]],7828:[[90,817]],7829:[[122,817]],7830:[[104,817]],7831:[[116,776]],7832:[[119,778]],7833:[[121,778]],7834:[[97,702],256],7835:[[383,775]],7840:[[65,803],,{770:7852,774:7862}],7841:[[97,803],,{770:7853,774:7863}],7842:[[65,777]],7843:[[97,777]],7844:[[194,769]],7845:[[226,769]],7846:[[194,768]],7847:[[226,768]],7848:[[194,777]],7849:[[226,777]],7850:[[194,771]],7851:[[226,771]],7852:[[7840,770]],7853:[[7841,770]],7854:[[258,769]],7855:[[259,769]],7856:[[258,768]],7857:[[259,768]],7858:[[258,777]],7859:[[259,777]],7860:[[258,771]],7861:[[259,771]],7862:[[7840,774]],7863:[[7841,774]],7864:[[69,803],,{770:7878}],7865:[[101,803],,{770:7879}],7866:[[69,777]],7867:[[101,777]],7868:[[69,771]],7869:[[101,771]],7870:[[202,769]],7871:[[234,769]],7872:[[202,768]],7873:[[234,768]],7874:[[202,777]],7875:[[234,777]],7876:[[202,771]],7877:[[234,771]],7878:[[7864,770]],7879:[[7865,770]],7880:[[73,777]],7881:[[105,777]],7882:[[73,803]],7883:[[105,803]],7884:[[79,803],,{770:7896}],7885:[[111,803],,{770:7897}],7886:[[79,777]],7887:[[111,777]],7888:[[212,769]],7889:[[244,769]],7890:[[212,768]],7891:[[244,768]],7892:[[212,777]],7893:[[244,777]],7894:[[212,771]],7895:[[244,771]],7896:[[7884,770]],7897:[[7885,770]],7898:[[416,769]],7899:[[417,769]],7900:[[416,768]],7901:[[417,768]],7902:[[416,777]],7903:[[417,777]],7904:[[416,771]],7905:[[417,771]],7906:[[416,803]],7907:[[417,803]],7908:[[85,803]],7909:[[117,803]],7910:[[85,777]],7911:[[117,777]],7912:[[431,769]],7913:[[432,769]],7914:[[431,768]],7915:[[432,768]],7916:[[431,777]],7917:[[432,777]],7918:[[431,771]],7919:[[432,771]],7920:[[431,803]],7921:[[432,803]],7922:[[89,768]],7923:[[121,768]],7924:[[89,803]],7925:[[121,803]],7926:[[89,777]],7927:[[121,777]],7928:[[89,771]],7929:[[121,771]]},
7936:{7936:[[945,787],,{768:7938,769:7940,834:7942,837:8064}],7937:[[945,788],,{768:7939,769:7941,834:7943,837:8065}],7938:[[7936,768],,{837:8066}],7939:[[7937,768],,{837:8067}],7940:[[7936,769],,{837:8068}],7941:[[7937,769],,{837:8069}],7942:[[7936,834],,{837:8070}],7943:[[7937,834],,{837:8071}],7944:[[913,787],,{768:7946,769:7948,834:7950,837:8072}],7945:[[913,788],,{768:7947,769:7949,834:7951,837:8073}],7946:[[7944,768],,{837:8074}],7947:[[7945,768],,{837:8075}],7948:[[7944,769],,{837:8076}],7949:[[7945,769],,{837:8077}],7950:[[7944,834],,{837:8078}],7951:[[7945,834],,{837:8079}],7952:[[949,787],,{768:7954,769:7956}],7953:[[949,788],,{768:7955,769:7957}],7954:[[7952,768]],7955:[[7953,768]],7956:[[7952,769]],7957:[[7953,769]],7960:[[917,787],,{768:7962,769:7964}],7961:[[917,788],,{768:7963,769:7965}],7962:[[7960,768]],7963:[[7961,768]],7964:[[7960,769]],7965:[[7961,769]],7968:[[951,787],,{768:7970,769:7972,834:7974,837:8080}],7969:[[951,788],,{768:7971,769:7973,834:7975,837:8081}],7970:[[7968,768],,{837:8082}],7971:[[7969,768],,{837:8083}],7972:[[7968,769],,{837:8084}],7973:[[7969,769],,{837:8085}],7974:[[7968,834],,{837:8086}],7975:[[7969,834],,{837:8087}],7976:[[919,787],,{768:7978,769:7980,834:7982,837:8088}],7977:[[919,788],,{768:7979,769:7981,834:7983,837:8089}],7978:[[7976,768],,{837:8090}],7979:[[7977,768],,{837:8091}],7980:[[7976,769],,{837:8092}],7981:[[7977,769],,{837:8093}],7982:[[7976,834],,{837:8094}],7983:[[7977,834],,{837:8095}],7984:[[953,787],,{768:7986,769:7988,834:7990}],7985:[[953,788],,{768:7987,769:7989,834:7991}],7986:[[7984,768]],7987:[[7985,768]],7988:[[7984,769]],7989:[[7985,769]],7990:[[7984,834]],7991:[[7985,834]],7992:[[921,787],,{768:7994,769:7996,834:7998}],7993:[[921,788],,{768:7995,769:7997,834:7999}],7994:[[7992,768]],7995:[[7993,768]],7996:[[7992,769]],7997:[[7993,769]],7998:[[7992,834]],7999:[[7993,834]],8000:[[959,787],,{768:8002,769:8004}],8001:[[959,788],,{768:8003,769:8005}],8002:[[8000,768]],8003:[[8001,768]],8004:[[8000,769]],8005:[[8001,769]],8008:[[927,787],,{768:8010,769:8012}],8009:[[927,788],,{768:8011,769:8013}],8010:[[8008,768]],8011:[[8009,768]],8012:[[8008,769]],8013:[[8009,769]],8016:[[965,787],,{768:8018,769:8020,834:8022}],8017:[[965,788],,{768:8019,769:8021,834:8023}],8018:[[8016,768]],8019:[[8017,768]],8020:[[8016,769]],8021:[[8017,769]],8022:[[8016,834]],8023:[[8017,834]],8025:[[933,788],,{768:8027,769:8029,834:8031}],8027:[[8025,768]],8029:[[8025,769]],8031:[[8025,834]],8032:[[969,787],,{768:8034,769:8036,834:8038,837:8096}],8033:[[969,788],,{768:8035,769:8037,834:8039,837:8097}],8034:[[8032,768],,{837:8098}],8035:[[8033,768],,{837:8099}],8036:[[8032,769],,{837:8100}],8037:[[8033,769],,{837:8101}],8038:[[8032,834],,{837:8102}],8039:[[8033,834],,{837:8103}],8040:[[937,787],,{768:8042,769:8044,834:8046,837:8104}],8041:[[937,788],,{768:8043,769:8045,834:8047,837:8105}],8042:[[8040,768],,{837:8106}],8043:[[8041,768],,{837:8107}],8044:[[8040,769],,{837:8108}],8045:[[8041,769],,{837:8109}],8046:[[8040,834],,{837:8110}],8047:[[8041,834],,{837:8111}],8048:[[945,768],,{837:8114}],8049:[[940]],8050:[[949,768]],8051:[[941]],8052:[[951,768],,{837:8130}],8053:[[942]],8054:[[953,768]],8055:[[943]],8056:[[959,768]],8057:[[972]],8058:[[965,768]],8059:[[973]],8060:[[969,768],,{837:8178}],8061:[[974]],8064:[[7936,837]],8065:[[7937,837]],8066:[[7938,837]],8067:[[7939,837]],8068:[[7940,837]],8069:[[7941,837]],8070:[[7942,837]],8071:[[7943,837]],8072:[[7944,837]],8073:[[7945,837]],8074:[[7946,837]],8075:[[7947,837]],8076:[[7948,837]],8077:[[7949,837]],8078:[[7950,837]],8079:[[7951,837]],8080:[[7968,837]],8081:[[7969,837]],8082:[[7970,837]],8083:[[7971,837]],8084:[[7972,837]],8085:[[7973,837]],8086:[[7974,837]],8087:[[7975,837]],8088:[[7976,837]],8089:[[7977,837]],8090:[[7978,837]],8091:[[7979,837]],8092:[[7980,837]],8093:[[7981,837]],8094:[[7982,837]],8095:[[7983,837]],8096:[[8032,837]],8097:[[8033,837]],8098:[[8034,837]],8099:[[8035,837]],8100:[[8036,837]],8101:[[8037,837]],8102:[[8038,837]],8103:[[8039,837]],8104:[[8040,837]],8105:[[8041,837]],8106:[[8042,837]],8107:[[8043,837]],8108:[[8044,837]],8109:[[8045,837]],8110:[[8046,837]],8111:[[8047,837]],8112:[[945,774]],8113:[[945,772]],8114:[[8048,837]],8115:[[945,837]],8116:[[940,837]],8118:[[945,834],,{837:8119}],8119:[[8118,837]],8120:[[913,774]],8121:[[913,772]],8122:[[913,768]],8123:[[902]],8124:[[913,837]],8125:[[32,787],256],8126:[[953]],8127:[[32,787],256,{768:8141,769:8142,834:8143}],8128:[[32,834],256],8129:[[168,834]],8130:[[8052,837]],8131:[[951,837]],8132:[[942,837]],8134:[[951,834],,{837:8135}],8135:[[8134,837]],8136:[[917,768]],8137:[[904]],8138:[[919,768]],8139:[[905]],8140:[[919,837]],8141:[[8127,768]],8142:[[8127,769]],8143:[[8127,834]],8144:[[953,774]],8145:[[953,772]],8146:[[970,768]],8147:[[912]],8150:[[953,834]],8151:[[970,834]],8152:[[921,774]],8153:[[921,772]],8154:[[921,768]],8155:[[906]],8157:[[8190,768]],8158:[[8190,769]],8159:[[8190,834]],8160:[[965,774]],8161:[[965,772]],8162:[[971,768]],8163:[[944]],8164:[[961,787]],8165:[[961,788]],8166:[[965,834]],8167:[[971,834]],8168:[[933,774]],8169:[[933,772]],8170:[[933,768]],8171:[[910]],8172:[[929,788]],8173:[[168,768]],8174:[[901]],8175:[[96]],8178:[[8060,837]],8179:[[969,837]],8180:[[974,837]],8182:[[969,834],,{837:8183}],8183:[[8182,837]],8184:[[927,768]],8185:[[908]],8186:[[937,768]],8187:[[911]],8188:[[937,837]],8189:[[180]],8190:[[32,788],256,{768:8157,769:8158,834:8159}]},
8192:{8192:[[8194]],8193:[[8195]],8194:[[32],256],8195:[[32],256],8196:[[32],256],8197:[[32],256],8198:[[32],256],8199:[[32],256],8200:[[32],256],8201:[[32],256],8202:[[32],256],8209:[[8208],256],8215:[[32,819],256],8228:[[46],256],8229:[[46,46],256],8230:[[46,46,46],256],8239:[[32],256],8243:[[8242,8242],256],8244:[[8242,8242,8242],256],8246:[[8245,8245],256],8247:[[8245,8245,8245],256],8252:[[33,33],256],8254:[[32,773],256],8263:[[63,63],256],8264:[[63,33],256],8265:[[33,63],256],8279:[[8242,8242,8242,8242],256],8287:[[32],256],8304:[[48],256],8305:[[105],256],8308:[[52],256],8309:[[53],256],8310:[[54],256],8311:[[55],256],8312:[[56],256],8313:[[57],256],8314:[[43],256],8315:[[8722],256],8316:[[61],256],8317:[[40],256],8318:[[41],256],8319:[[110],256],8320:[[48],256],8321:[[49],256],8322:[[50],256],8323:[[51],256],8324:[[52],256],8325:[[53],256],8326:[[54],256],8327:[[55],256],8328:[[56],256],8329:[[57],256],8330:[[43],256],8331:[[8722],256],8332:[[61],256],8333:[[40],256],8334:[[41],256],8336:[[97],256],8337:[[101],256],8338:[[111],256],8339:[[120],256],8340:[[601],256],8341:[[104],256],8342:[[107],256],8343:[[108],256],8344:[[109],256],8345:[[110],256],8346:[[112],256],8347:[[115],256],8348:[[116],256],8360:[[82,115],256],8400:[,230],8401:[,230],8402:[,1],8403:[,1],8404:[,230],8405:[,230],8406:[,230],8407:[,230],8408:[,1],8409:[,1],8410:[,1],8411:[,230],8412:[,230],8417:[,230],8421:[,1],8422:[,1],8423:[,230],8424:[,220],8425:[,230],8426:[,1],8427:[,1],8428:[,220],8429:[,220],8430:[,220],8431:[,220],8432:[,230]},
8448:{8448:[[97,47,99],256],8449:[[97,47,115],256],8450:[[67],256],8451:[[176,67],256],8453:[[99,47,111],256],8454:[[99,47,117],256],8455:[[400],256],8457:[[176,70],256],8458:[[103],256],8459:[[72],256],8460:[[72],256],8461:[[72],256],8462:[[104],256],8463:[[295],256],8464:[[73],256],8465:[[73],256],8466:[[76],256],8467:[[108],256],8469:[[78],256],8470:[[78,111],256],8473:[[80],256],8474:[[81],256],8475:[[82],256],8476:[[82],256],8477:[[82],256],8480:[[83,77],256],8481:[[84,69,76],256],8482:[[84,77],256],8484:[[90],256],8486:[[937]],8488:[[90],256],8490:[[75]],8491:[[197]],8492:[[66],256],8493:[[67],256],8495:[[101],256],8496:[[69],256],8497:[[70],256],8499:[[77],256],8500:[[111],256],8501:[[1488],256],8502:[[1489],256],8503:[[1490],256],8504:[[1491],256],8505:[[105],256],8507:[[70,65,88],256],8508:[[960],256],8509:[[947],256],8510:[[915],256],8511:[[928],256],8512:[[8721],256],8517:[[68],256],8518:[[100],256],8519:[[101],256],8520:[[105],256],8521:[[106],256],8528:[[49,8260,55],256],8529:[[49,8260,57],256],8530:[[49,8260,49,48],256],8531:[[49,8260,51],256],8532:[[50,8260,51],256],8533:[[49,8260,53],256],8534:[[50,8260,53],256],8535:[[51,8260,53],256],8536:[[52,8260,53],256],8537:[[49,8260,54],256],8538:[[53,8260,54],256],8539:[[49,8260,56],256],8540:[[51,8260,56],256],8541:[[53,8260,56],256],8542:[[55,8260,56],256],8543:[[49,8260],256],8544:[[73],256],8545:[[73,73],256],8546:[[73,73,73],256],8547:[[73,86],256],8548:[[86],256],8549:[[86,73],256],8550:[[86,73,73],256],8551:[[86,73,73,73],256],8552:[[73,88],256],8553:[[88],256],8554:[[88,73],256],8555:[[88,73,73],256],8556:[[76],256],8557:[[67],256],8558:[[68],256],8559:[[77],256],8560:[[105],256],8561:[[105,105],256],8562:[[105,105,105],256],8563:[[105,118],256],8564:[[118],256],8565:[[118,105],256],8566:[[118,105,105],256],8567:[[118,105,105,105],256],8568:[[105,120],256],8569:[[120],256],8570:[[120,105],256],8571:[[120,105,105],256],8572:[[108],256],8573:[[99],256],8574:[[100],256],8575:[[109],256],8585:[[48,8260,51],256],8592:[,,{824:8602}],8594:[,,{824:8603}],8596:[,,{824:8622}],8602:[[8592,824]],8603:[[8594,824]],8622:[[8596,824]],8653:[[8656,824]],8654:[[8660,824]],8655:[[8658,824]],8656:[,,{824:8653}],8658:[,,{824:8655}],8660:[,,{824:8654}]},
8704:{8707:[,,{824:8708}],8708:[[8707,824]],8712:[,,{824:8713}],8713:[[8712,824]],8715:[,,{824:8716}],8716:[[8715,824]],8739:[,,{824:8740}],8740:[[8739,824]],8741:[,,{824:8742}],8742:[[8741,824]],8748:[[8747,8747],256],8749:[[8747,8747,8747],256],8751:[[8750,8750],256],8752:[[8750,8750,8750],256],8764:[,,{824:8769}],8769:[[8764,824]],8771:[,,{824:8772}],8772:[[8771,824]],8773:[,,{824:8775}],8775:[[8773,824]],8776:[,,{824:8777}],8777:[[8776,824]],8781:[,,{824:8813}],8800:[[61,824]],8801:[,,{824:8802}],8802:[[8801,824]],8804:[,,{824:8816}],8805:[,,{824:8817}],8813:[[8781,824]],8814:[[60,824]],8815:[[62,824]],8816:[[8804,824]],8817:[[8805,824]],8818:[,,{824:8820}],8819:[,,{824:8821}],8820:[[8818,824]],8821:[[8819,824]],8822:[,,{824:8824}],8823:[,,{824:8825}],8824:[[8822,824]],8825:[[8823,824]],8826:[,,{824:8832}],8827:[,,{824:8833}],8828:[,,{824:8928}],8829:[,,{824:8929}],8832:[[8826,824]],8833:[[8827,824]],8834:[,,{824:8836}],8835:[,,{824:8837}],8836:[[8834,824]],8837:[[8835,824]],8838:[,,{824:8840}],8839:[,,{824:8841}],8840:[[8838,824]],8841:[[8839,824]],8849:[,,{824:8930}],8850:[,,{824:8931}],8866:[,,{824:8876}],8872:[,,{824:8877}],8873:[,,{824:8878}],8875:[,,{824:8879}],8876:[[8866,824]],8877:[[8872,824]],8878:[[8873,824]],8879:[[8875,824]],8882:[,,{824:8938}],8883:[,,{824:8939}],8884:[,,{824:8940}],8885:[,,{824:8941}],8928:[[8828,824]],8929:[[8829,824]],8930:[[8849,824]],8931:[[8850,824]],8938:[[8882,824]],8939:[[8883,824]],8940:[[8884,824]],8941:[[8885,824]]},
8960:{9001:[[12296]],9002:[[12297]]},
9216:{9312:[[49],256],9313:[[50],256],9314:[[51],256],9315:[[52],256],9316:[[53],256],9317:[[54],256],9318:[[55],256],9319:[[56],256],9320:[[57],256],9321:[[49,48],256],9322:[[49,49],256],9323:[[49,50],256],9324:[[49,51],256],9325:[[49,52],256],9326:[[49,53],256],9327:[[49,54],256],9328:[[49,55],256],9329:[[49,56],256],9330:[[49,57],256],9331:[[50,48],256],9332:[[40,49,41],256],9333:[[40,50,41],256],9334:[[40,51,41],256],9335:[[40,52,41],256],9336:[[40,53,41],256],9337:[[40,54,41],256],9338:[[40,55,41],256],9339:[[40,56,41],256],9340:[[40,57,41],256],9341:[[40,49,48,41],256],9342:[[40,49,49,41],256],9343:[[40,49,50,41],256],9344:[[40,49,51,41],256],9345:[[40,49,52,41],256],9346:[[40,49,53,41],256],9347:[[40,49,54,41],256],9348:[[40,49,55,41],256],9349:[[40,49,56,41],256],9350:[[40,49,57,41],256],9351:[[40,50,48,41],256],9352:[[49,46],256],9353:[[50,46],256],9354:[[51,46],256],9355:[[52,46],256],9356:[[53,46],256],9357:[[54,46],256],9358:[[55,46],256],9359:[[56,46],256],9360:[[57,46],256],9361:[[49,48,46],256],9362:[[49,49,46],256],9363:[[49,50,46],256],9364:[[49,51,46],256],9365:[[49,52,46],256],9366:[[49,53,46],256],9367:[[49,54,46],256],9368:[[49,55,46],256],9369:[[49,56,46],256],9370:[[49,57,46],256],9371:[[50,48,46],256],9372:[[40,97,41],256],9373:[[40,98,41],256],9374:[[40,99,41],256],9375:[[40,100,41],256],9376:[[40,101,41],256],9377:[[40,102,41],256],9378:[[40,103,41],256],9379:[[40,104,41],256],9380:[[40,105,41],256],9381:[[40,106,41],256],9382:[[40,107,41],256],9383:[[40,108,41],256],9384:[[40,109,41],256],9385:[[40,110,41],256],9386:[[40,111,41],256],9387:[[40,112,41],256],9388:[[40,113,41],256],9389:[[40,114,41],256],9390:[[40,115,41],256],9391:[[40,116,41],256],9392:[[40,117,41],256],9393:[[40,118,41],256],9394:[[40,119,41],256],9395:[[40,120,41],256],9396:[[40,121,41],256],9397:[[40,122,41],256],9398:[[65],256],9399:[[66],256],9400:[[67],256],9401:[[68],256],9402:[[69],256],9403:[[70],256],9404:[[71],256],9405:[[72],256],9406:[[73],256],9407:[[74],256],9408:[[75],256],9409:[[76],256],9410:[[77],256],9411:[[78],256],9412:[[79],256],9413:[[80],256],9414:[[81],256],9415:[[82],256],9416:[[83],256],9417:[[84],256],9418:[[85],256],9419:[[86],256],9420:[[87],256],9421:[[88],256],9422:[[89],256],9423:[[90],256],9424:[[97],256],9425:[[98],256],9426:[[99],256],9427:[[100],256],9428:[[101],256],9429:[[102],256],9430:[[103],256],9431:[[104],256],9432:[[105],256],9433:[[106],256],9434:[[107],256],9435:[[108],256],9436:[[109],256],9437:[[110],256],9438:[[111],256],9439:[[112],256],9440:[[113],256],9441:[[114],256],9442:[[115],256],9443:[[116],256],9444:[[117],256],9445:[[118],256],9446:[[119],256],9447:[[120],256],9448:[[121],256],9449:[[122],256],9450:[[48],256]},
10752:{10764:[[8747,8747,8747,8747],256],10868:[[58,58,61],256],10869:[[61,61],256],10870:[[61,61,61],256],10972:[[10973,824],512]},
11264:{11388:[[106],256],11389:[[86],256],11503:[,230],11504:[,230],11505:[,230]},
11520:{11631:[[11617],256],11647:[,9],11744:[,230],11745:[,230],11746:[,230],11747:[,230],11748:[,230],11749:[,230],11750:[,230],11751:[,230],11752:[,230],11753:[,230],11754:[,230],11755:[,230],11756:[,230],11757:[,230],11758:[,230],11759:[,230],11760:[,230],11761:[,230],11762:[,230],11763:[,230],11764:[,230],11765:[,230],11766:[,230],11767:[,230],11768:[,230],11769:[,230],11770:[,230],11771:[,230],11772:[,230],11773:[,230],11774:[,230],11775:[,230]},
11776:{11935:[[27597],256],12019:[[40863],256]},
12032:{12032:[[19968],256],12033:[[20008],256],12034:[[20022],256],12035:[[20031],256],12036:[[20057],256],12037:[[20101],256],12038:[[20108],256],12039:[[20128],256],12040:[[20154],256],12041:[[20799],256],12042:[[20837],256],12043:[[20843],256],12044:[[20866],256],12045:[[20886],256],12046:[[20907],256],12047:[[20960],256],12048:[[20981],256],12049:[[20992],256],12050:[[21147],256],12051:[[21241],256],12052:[[21269],256],12053:[[21274],256],12054:[[21304],256],12055:[[21313],256],12056:[[21340],256],12057:[[21353],256],12058:[[21378],256],12059:[[21430],256],12060:[[21448],256],12061:[[21475],256],12062:[[22231],256],12063:[[22303],256],12064:[[22763],256],12065:[[22786],256],12066:[[22794],256],12067:[[22805],256],12068:[[22823],256],12069:[[22899],256],12070:[[23376],256],12071:[[23424],256],12072:[[23544],256],12073:[[23567],256],12074:[[23586],256],12075:[[23608],256],12076:[[23662],256],12077:[[23665],256],12078:[[24027],256],12079:[[24037],256],12080:[[24049],256],12081:[[24062],256],12082:[[24178],256],12083:[[24186],256],12084:[[24191],256],12085:[[24308],256],12086:[[24318],256],12087:[[24331],256],12088:[[24339],256],12089:[[24400],256],12090:[[24417],256],12091:[[24435],256],12092:[[24515],256],12093:[[25096],256],12094:[[25142],256],12095:[[25163],256],12096:[[25903],256],12097:[[25908],256],12098:[[25991],256],12099:[[26007],256],12100:[[26020],256],12101:[[26041],256],12102:[[26080],256],12103:[[26085],256],12104:[[26352],256],12105:[[26376],256],12106:[[26408],256],12107:[[27424],256],12108:[[27490],256],12109:[[27513],256],12110:[[27571],256],12111:[[27595],256],12112:[[27604],256],12113:[[27611],256],12114:[[27663],256],12115:[[27668],256],12116:[[27700],256],12117:[[28779],256],12118:[[29226],256],12119:[[29238],256],12120:[[29243],256],12121:[[29247],256],12122:[[29255],256],12123:[[29273],256],12124:[[29275],256],12125:[[29356],256],12126:[[29572],256],12127:[[29577],256],12128:[[29916],256],12129:[[29926],256],12130:[[29976],256],12131:[[29983],256],12132:[[29992],256],12133:[[30000],256],12134:[[30091],256],12135:[[30098],256],12136:[[30326],256],12137:[[30333],256],12138:[[30382],256],12139:[[30399],256],12140:[[30446],256],12141:[[30683],256],12142:[[30690],256],12143:[[30707],256],12144:[[31034],256],12145:[[31160],256],12146:[[31166],256],12147:[[31348],256],12148:[[31435],256],12149:[[31481],256],12150:[[31859],256],12151:[[31992],256],12152:[[32566],256],12153:[[32593],256],12154:[[32650],256],12155:[[32701],256],12156:[[32769],256],12157:[[32780],256],12158:[[32786],256],12159:[[32819],256],12160:[[32895],256],12161:[[32905],256],12162:[[33251],256],12163:[[33258],256],12164:[[33267],256],12165:[[33276],256],12166:[[33292],256],12167:[[33307],256],12168:[[33311],256],12169:[[33390],256],12170:[[33394],256],12171:[[33400],256],12172:[[34381],256],12173:[[34411],256],12174:[[34880],256],12175:[[34892],256],12176:[[34915],256],12177:[[35198],256],12178:[[35211],256],12179:[[35282],256],12180:[[35328],256],12181:[[35895],256],12182:[[35910],256],12183:[[35925],256],12184:[[35960],256],12185:[[35997],256],12186:[[36196],256],12187:[[36208],256],12188:[[36275],256],12189:[[36523],256],12190:[[36554],256],12191:[[36763],256],12192:[[36784],256],12193:[[36789],256],12194:[[37009],256],12195:[[37193],256],12196:[[37318],256],12197:[[37324],256],12198:[[37329],256],12199:[[38263],256],12200:[[38272],256],12201:[[38428],256],12202:[[38582],256],12203:[[38585],256],12204:[[38632],256],12205:[[38737],256],12206:[[38750],256],12207:[[38754],256],12208:[[38761],256],12209:[[38859],256],12210:[[38893],256],12211:[[38899],256],12212:[[38913],256],12213:[[39080],256],12214:[[39131],256],12215:[[39135],256],12216:[[39318],256],12217:[[39321],256],12218:[[39340],256],12219:[[39592],256],12220:[[39640],256],12221:[[39647],256],12222:[[39717],256],12223:[[39727],256],12224:[[39730],256],12225:[[39740],256],12226:[[39770],256],12227:[[40165],256],12228:[[40565],256],12229:[[40575],256],12230:[[40613],256],12231:[[40635],256],12232:[[40643],256],12233:[[40653],256],12234:[[40657],256],12235:[[40697],256],12236:[[40701],256],12237:[[40718],256],12238:[[40723],256],12239:[[40736],256],12240:[[40763],256],12241:[[40778],256],12242:[[40786],256],12243:[[40845],256],12244:[[40860],256],12245:[[40864],256]},
12288:{12288:[[32],256],12330:[,218],12331:[,228],12332:[,232],12333:[,222],12334:[,224],12335:[,224],12342:[[12306],256],12344:[[21313],256],12345:[[21316],256],12346:[[21317],256],12358:[,,{12441:12436}],12363:[,,{12441:12364}],12364:[[12363,12441]],12365:[,,{12441:12366}],12366:[[12365,12441]],12367:[,,{12441:12368}],12368:[[12367,12441]],12369:[,,{12441:12370}],12370:[[12369,12441]],12371:[,,{12441:12372}],12372:[[12371,12441]],12373:[,,{12441:12374}],12374:[[12373,12441]],12375:[,,{12441:12376}],12376:[[12375,12441]],12377:[,,{12441:12378}],12378:[[12377,12441]],12379:[,,{12441:12380}],12380:[[12379,12441]],12381:[,,{12441:12382}],12382:[[12381,12441]],12383:[,,{12441:12384}],12384:[[12383,12441]],12385:[,,{12441:12386}],12386:[[12385,12441]],12388:[,,{12441:12389}],12389:[[12388,12441]],12390:[,,{12441:12391}],12391:[[12390,12441]],12392:[,,{12441:12393}],12393:[[12392,12441]],12399:[,,{12441:12400,12442:12401}],12400:[[12399,12441]],12401:[[12399,12442]],12402:[,,{12441:12403,12442:12404}],12403:[[12402,12441]],12404:[[12402,12442]],12405:[,,{12441:12406,12442:12407}],12406:[[12405,12441]],12407:[[12405,12442]],12408:[,,{12441:12409,12442:12410}],12409:[[12408,12441]],12410:[[12408,12442]],12411:[,,{12441:12412,12442:12413}],12412:[[12411,12441]],12413:[[12411,12442]],12436:[[12358,12441]],12441:[,8],12442:[,8],12443:[[32,12441],256],12444:[[32,12442],256],12445:[,,{12441:12446}],12446:[[12445,12441]],12447:[[12424,12426],256],12454:[,,{12441:12532}],12459:[,,{12441:12460}],12460:[[12459,12441]],12461:[,,{12441:12462}],12462:[[12461,12441]],12463:[,,{12441:12464}],12464:[[12463,12441]],12465:[,,{12441:12466}],12466:[[12465,12441]],12467:[,,{12441:12468}],12468:[[12467,12441]],12469:[,,{12441:12470}],12470:[[12469,12441]],12471:[,,{12441:12472}],12472:[[12471,12441]],12473:[,,{12441:12474}],12474:[[12473,12441]],12475:[,,{12441:12476}],12476:[[12475,12441]],12477:[,,{12441:12478}],12478:[[12477,12441]],12479:[,,{12441:12480}],12480:[[12479,12441]],12481:[,,{12441:12482}],12482:[[12481,12441]],12484:[,,{12441:12485}],12485:[[12484,12441]],12486:[,,{12441:12487}],12487:[[12486,12441]],12488:[,,{12441:12489}],12489:[[12488,12441]],12495:[,,{12441:12496,12442:12497}],12496:[[12495,12441]],12497:[[12495,12442]],12498:[,,{12441:12499,12442:12500}],12499:[[12498,12441]],12500:[[12498,12442]],12501:[,,{12441:12502,12442:12503}],12502:[[12501,12441]],12503:[[12501,12442]],12504:[,,{12441:12505,12442:12506}],12505:[[12504,12441]],12506:[[12504,12442]],12507:[,,{12441:12508,12442:12509}],12508:[[12507,12441]],12509:[[12507,12442]],12527:[,,{12441:12535}],12528:[,,{12441:12536}],12529:[,,{12441:12537}],12530:[,,{12441:12538}],12532:[[12454,12441]],12535:[[12527,12441]],12536:[[12528,12441]],12537:[[12529,12441]],12538:[[12530,12441]],12541:[,,{12441:12542}],12542:[[12541,12441]],12543:[[12467,12488],256]},
12544:{12593:[[4352],256],12594:[[4353],256],12595:[[4522],256],12596:[[4354],256],12597:[[4524],256],12598:[[4525],256],12599:[[4355],256],12600:[[4356],256],12601:[[4357],256],12602:[[4528],256],12603:[[4529],256],12604:[[4530],256],12605:[[4531],256],12606:[[4532],256],12607:[[4533],256],12608:[[4378],256],12609:[[4358],256],12610:[[4359],256],12611:[[4360],256],12612:[[4385],256],12613:[[4361],256],12614:[[4362],256],12615:[[4363],256],12616:[[4364],256],12617:[[4365],256],12618:[[4366],256],12619:[[4367],256],12620:[[4368],256],12621:[[4369],256],12622:[[4370],256],12623:[[4449],256],12624:[[4450],256],12625:[[4451],256],12626:[[4452],256],12627:[[4453],256],12628:[[4454],256],12629:[[4455],256],12630:[[4456],256],12631:[[4457],256],12632:[[4458],256],12633:[[4459],256],12634:[[4460],256],12635:[[4461],256],12636:[[4462],256],12637:[[4463],256],12638:[[4464],256],12639:[[4465],256],12640:[[4466],256],12641:[[4467],256],12642:[[4468],256],12643:[[4469],256],12644:[[4448],256],12645:[[4372],256],12646:[[4373],256],12647:[[4551],256],12648:[[4552],256],12649:[[4556],256],12650:[[4558],256],12651:[[4563],256],12652:[[4567],256],12653:[[4569],256],12654:[[4380],256],12655:[[4573],256],12656:[[4575],256],12657:[[4381],256],12658:[[4382],256],12659:[[4384],256],12660:[[4386],256],12661:[[4387],256],12662:[[4391],256],12663:[[4393],256],12664:[[4395],256],12665:[[4396],256],12666:[[4397],256],12667:[[4398],256],12668:[[4399],256],12669:[[4402],256],12670:[[4406],256],12671:[[4416],256],12672:[[4423],256],12673:[[4428],256],12674:[[4593],256],12675:[[4594],256],12676:[[4439],256],12677:[[4440],256],12678:[[4441],256],12679:[[4484],256],12680:[[4485],256],12681:[[4488],256],12682:[[4497],256],12683:[[4498],256],12684:[[4500],256],12685:[[4510],256],12686:[[4513],256],12690:[[19968],256],12691:[[20108],256],12692:[[19977],256],12693:[[22235],256],12694:[[19978],256],12695:[[20013],256],12696:[[19979],256],12697:[[30002],256],12698:[[20057],256],12699:[[19993],256],12700:[[19969],256],12701:[[22825],256],12702:[[22320],256],12703:[[20154],256]},
12800:{12800:[[40,4352,41],256],12801:[[40,4354,41],256],12802:[[40,4355,41],256],12803:[[40,4357,41],256],12804:[[40,4358,41],256],12805:[[40,4359,41],256],12806:[[40,4361,41],256],12807:[[40,4363,41],256],12808:[[40,4364,41],256],12809:[[40,4366,41],256],12810:[[40,4367,41],256],12811:[[40,4368,41],256],12812:[[40,4369,41],256],12813:[[40,4370,41],256],12814:[[40,4352,4449,41],256],12815:[[40,4354,4449,41],256],12816:[[40,4355,4449,41],256],12817:[[40,4357,4449,41],256],12818:[[40,4358,4449,41],256],12819:[[40,4359,4449,41],256],12820:[[40,4361,4449,41],256],12821:[[40,4363,4449,41],256],12822:[[40,4364,4449,41],256],12823:[[40,4366,4449,41],256],12824:[[40,4367,4449,41],256],12825:[[40,4368,4449,41],256],12826:[[40,4369,4449,41],256],12827:[[40,4370,4449,41],256],12828:[[40,4364,4462,41],256],12829:[[40,4363,4457,4364,4453,4523,41],256],12830:[[40,4363,4457,4370,4462,41],256],12832:[[40,19968,41],256],12833:[[40,20108,41],256],12834:[[40,19977,41],256],12835:[[40,22235,41],256],12836:[[40,20116,41],256],12837:[[40,20845,41],256],12838:[[40,19971,41],256],12839:[[40,20843,41],256],12840:[[40,20061,41],256],12841:[[40,21313,41],256],12842:[[40,26376,41],256],12843:[[40,28779,41],256],12844:[[40,27700,41],256],12845:[[40,26408,41],256],12846:[[40,37329,41],256],12847:[[40,22303,41],256],12848:[[40,26085,41],256],12849:[[40,26666,41],256],12850:[[40,26377,41],256],12851:[[40,31038,41],256],12852:[[40,21517,41],256],12853:[[40,29305,41],256],12854:[[40,36001,41],256],12855:[[40,31069,41],256],12856:[[40,21172,41],256],12857:[[40,20195,41],256],12858:[[40,21628,41],256],12859:[[40,23398,41],256],12860:[[40,30435,41],256],12861:[[40,20225,41],256],12862:[[40,36039,41],256],12863:[[40,21332,41],256],12864:[[40,31085,41],256],12865:[[40,20241,41],256],12866:[[40,33258,41],256],12867:[[40,33267,41],256],12868:[[21839],256],12869:[[24188],256],12870:[[25991],256],12871:[[31631],256],12880:[[80,84,69],256],12881:[[50,49],256],12882:[[50,50],256],12883:[[50,51],256],12884:[[50,52],256],12885:[[50,53],256],12886:[[50,54],256],12887:[[50,55],256],12888:[[50,56],256],12889:[[50,57],256],12890:[[51,48],256],12891:[[51,49],256],12892:[[51,50],256],12893:[[51,51],256],12894:[[51,52],256],12895:[[51,53],256],12896:[[4352],256],12897:[[4354],256],12898:[[4355],256],12899:[[4357],256],12900:[[4358],256],12901:[[4359],256],12902:[[4361],256],12903:[[4363],256],12904:[[4364],256],12905:[[4366],256],12906:[[4367],256],12907:[[4368],256],12908:[[4369],256],12909:[[4370],256],12910:[[4352,4449],256],12911:[[4354,4449],256],12912:[[4355,4449],256],12913:[[4357,4449],256],12914:[[4358,4449],256],12915:[[4359,4449],256],12916:[[4361,4449],256],12917:[[4363,4449],256],12918:[[4364,4449],256],12919:[[4366,4449],256],12920:[[4367,4449],256],12921:[[4368,4449],256],12922:[[4369,4449],256],12923:[[4370,4449],256],12924:[[4366,4449,4535,4352,4457],256],12925:[[4364,4462,4363,4468],256],12926:[[4363,4462],256],12928:[[19968],256],12929:[[20108],256],12930:[[19977],256],12931:[[22235],256],12932:[[20116],256],12933:[[20845],256],12934:[[19971],256],12935:[[20843],256],12936:[[20061],256],12937:[[21313],256],12938:[[26376],256],12939:[[28779],256],12940:[[27700],256],12941:[[26408],256],12942:[[37329],256],12943:[[22303],256],12944:[[26085],256],12945:[[26666],256],12946:[[26377],256],12947:[[31038],256],12948:[[21517],256],12949:[[29305],256],12950:[[36001],256],12951:[[31069],256],12952:[[21172],256],12953:[[31192],256],12954:[[30007],256],12955:[[22899],256],12956:[[36969],256],12957:[[20778],256],12958:[[21360],256],12959:[[27880],256],12960:[[38917],256],12961:[[20241],256],12962:[[20889],256],12963:[[27491],256],12964:[[19978],256],12965:[[20013],256],12966:[[19979],256],12967:[[24038],256],12968:[[21491],256],12969:[[21307],256],12970:[[23447],256],12971:[[23398],256],12972:[[30435],256],12973:[[20225],256],12974:[[36039],256],12975:[[21332],256],12976:[[22812],256],12977:[[51,54],256],12978:[[51,55],256],12979:[[51,56],256],12980:[[51,57],256],12981:[[52,48],256],12982:[[52,49],256],12983:[[52,50],256],12984:[[52,51],256],12985:[[52,52],256],12986:[[52,53],256],12987:[[52,54],256],12988:[[52,55],256],12989:[[52,56],256],12990:[[52,57],256],12991:[[53,48],256],12992:[[49,26376],256],12993:[[50,26376],256],12994:[[51,26376],256],12995:[[52,26376],256],12996:[[53,26376],256],12997:[[54,26376],256],12998:[[55,26376],256],12999:[[56,26376],256],13000:[[57,26376],256],13001:[[49,48,26376],256],13002:[[49,49,26376],256],13003:[[49,50,26376],256],13004:[[72,103],256],13005:[[101,114,103],256],13006:[[101,86],256],13007:[[76,84,68],256],13008:[[12450],256],13009:[[12452],256],13010:[[12454],256],13011:[[12456],256],13012:[[12458],256],13013:[[12459],256],13014:[[12461],256],13015:[[12463],256],13016:[[12465],256],13017:[[12467],256],13018:[[12469],256],13019:[[12471],256],13020:[[12473],256],13021:[[12475],256],13022:[[12477],256],13023:[[12479],256],13024:[[12481],256],13025:[[12484],256],13026:[[12486],256],13027:[[12488],256],13028:[[12490],256],13029:[[12491],256],13030:[[12492],256],13031:[[12493],256],13032:[[12494],256],13033:[[12495],256],13034:[[12498],256],13035:[[12501],256],13036:[[12504],256],13037:[[12507],256],13038:[[12510],256],13039:[[12511],256],13040:[[12512],256],13041:[[12513],256],13042:[[12514],256],13043:[[12516],256],13044:[[12518],256],13045:[[12520],256],13046:[[12521],256],13047:[[12522],256],13048:[[12523],256],13049:[[12524],256],13050:[[12525],256],13051:[[12527],256],13052:[[12528],256],13053:[[12529],256],13054:[[12530],256]},
13056:{13056:[[12450,12497,12540,12488],256],13057:[[12450,12523,12501,12449],256],13058:[[12450,12531,12506,12450],256],13059:[[12450,12540,12523],256],13060:[[12452,12491,12531,12464],256],13061:[[12452,12531,12481],256],13062:[[12454,12457,12531],256],13063:[[12456,12473,12463,12540,12489],256],13064:[[12456,12540,12459,12540],256],13065:[[12458,12531,12473],256],13066:[[12458,12540,12512],256],13067:[[12459,12452,12522],256],13068:[[12459,12521,12483,12488],256],13069:[[12459,12525,12522,12540],256],13070:[[12460,12525,12531],256],13071:[[12460,12531,12510],256],13072:[[12462,12460],256],13073:[[12462,12491,12540],256],13074:[[12461,12517,12522,12540],256],13075:[[12462,12523,12480,12540],256],13076:[[12461,12525],256],13077:[[12461,12525,12464,12521,12512],256],13078:[[12461,12525,12513,12540,12488,12523],256],13079:[[12461,12525,12527,12483,12488],256],13080:[[12464,12521,12512],256],13081:[[12464,12521,12512,12488,12531],256],13082:[[12463,12523,12476,12452,12525],256],13083:[[12463,12525,12540,12493],256],13084:[[12465,12540,12473],256],13085:[[12467,12523,12490],256],13086:[[12467,12540,12509],256],13087:[[12469,12452,12463,12523],256],13088:[[12469,12531,12481,12540,12512],256],13089:[[12471,12522,12531,12464],256],13090:[[12475,12531,12481],256],13091:[[12475,12531,12488],256],13092:[[12480,12540,12473],256],13093:[[12487,12471],256],13094:[[12489,12523],256],13095:[[12488,12531],256],13096:[[12490,12494],256],13097:[[12494,12483,12488],256],13098:[[12495,12452,12484],256],13099:[[12497,12540,12475,12531,12488],256],13100:[[12497,12540,12484],256],13101:[[12496,12540,12524,12523],256],13102:[[12500,12450,12473,12488,12523],256],13103:[[12500,12463,12523],256],13104:[[12500,12467],256],13105:[[12499,12523],256],13106:[[12501,12449,12521,12483,12489],256],13107:[[12501,12451,12540,12488],256],13108:[[12502,12483,12471,12455,12523],256],13109:[[12501,12521,12531],256],13110:[[12504,12463,12479,12540,12523],256],13111:[[12506,12477],256],13112:[[12506,12491,12498],256],13113:[[12504,12523,12484],256],13114:[[12506,12531,12473],256],13115:[[12506,12540,12472],256],13116:[[12505,12540,12479],256],13117:[[12509,12452,12531,12488],256],13118:[[12508,12523,12488],256],13119:[[12507,12531],256],13120:[[12509,12531,12489],256],13121:[[12507,12540,12523],256],13122:[[12507,12540,12531],256],13123:[[12510,12452,12463,12525],256],13124:[[12510,12452,12523],256],13125:[[12510,12483,12495],256],13126:[[12510,12523,12463],256],13127:[[12510,12531,12471,12519,12531],256],13128:[[12511,12463,12525,12531],256],13129:[[12511,12522],256],13130:[[12511,12522,12496,12540,12523],256],13131:[[12513,12460],256],13132:[[12513,12460,12488,12531],256],13133:[[12513,12540,12488,12523],256],13134:[[12516,12540,12489],256],13135:[[12516,12540,12523],256],13136:[[12518,12450,12531],256],13137:[[12522,12483,12488,12523],256],13138:[[12522,12521],256],13139:[[12523,12500,12540],256],13140:[[12523,12540,12502,12523],256],13141:[[12524,12512],256],13142:[[12524,12531,12488,12466,12531],256],13143:[[12527,12483,12488],256],13144:[[48,28857],256],13145:[[49,28857],256],13146:[[50,28857],256],13147:[[51,28857],256],13148:[[52,28857],256],13149:[[53,28857],256],13150:[[54,28857],256],13151:[[55,28857],256],13152:[[56,28857],256],13153:[[57,28857],256],13154:[[49,48,28857],256],13155:[[49,49,28857],256],13156:[[49,50,28857],256],13157:[[49,51,28857],256],13158:[[49,52,28857],256],13159:[[49,53,28857],256],13160:[[49,54,28857],256],13161:[[49,55,28857],256],13162:[[49,56,28857],256],13163:[[49,57,28857],256],13164:[[50,48,28857],256],13165:[[50,49,28857],256],13166:[[50,50,28857],256],13167:[[50,51,28857],256],13168:[[50,52,28857],256],13169:[[104,80,97],256],13170:[[100,97],256],13171:[[65,85],256],13172:[[98,97,114],256],13173:[[111,86],256],13174:[[112,99],256],13175:[[100,109],256],13176:[[100,109,178],256],13177:[[100,109,179],256],13178:[[73,85],256],13179:[[24179,25104],256],13180:[[26157,21644],256],13181:[[22823,27491],256],13182:[[26126,27835],256],13183:[[26666,24335,20250,31038],256],13184:[[112,65],256],13185:[[110,65],256],13186:[[956,65],256],13187:[[109,65],256],13188:[[107,65],256],13189:[[75,66],256],13190:[[77,66],256],13191:[[71,66],256],13192:[[99,97,108],256],13193:[[107,99,97,108],256],13194:[[112,70],256],13195:[[110,70],256],13196:[[956,70],256],13197:[[956,103],256],13198:[[109,103],256],13199:[[107,103],256],13200:[[72,122],256],13201:[[107,72,122],256],13202:[[77,72,122],256],13203:[[71,72,122],256],13204:[[84,72,122],256],13205:[[956,8467],256],13206:[[109,8467],256],13207:[[100,8467],256],13208:[[107,8467],256],13209:[[102,109],256],13210:[[110,109],256],13211:[[956,109],256],13212:[[109,109],256],13213:[[99,109],256],13214:[[107,109],256],13215:[[109,109,178],256],13216:[[99,109,178],256],13217:[[109,178],256],13218:[[107,109,178],256],13219:[[109,109,179],256],13220:[[99,109,179],256],13221:[[109,179],256],13222:[[107,109,179],256],13223:[[109,8725,115],256],13224:[[109,8725,115,178],256],13225:[[80,97],256],13226:[[107,80,97],256],13227:[[77,80,97],256],13228:[[71,80,97],256],13229:[[114,97,100],256],13230:[[114,97,100,8725,115],256],13231:[[114,97,100,8725,115,178],256],13232:[[112,115],256],13233:[[110,115],256],13234:[[956,115],256],13235:[[109,115],256],13236:[[112,86],256],13237:[[110,86],256],13238:[[956,86],256],13239:[[109,86],256],13240:[[107,86],256],13241:[[77,86],256],13242:[[112,87],256],13243:[[110,87],256],13244:[[956,87],256],13245:[[109,87],256],13246:[[107,87],256],13247:[[77,87],256],13248:[[107,937],256],13249:[[77,937],256],13250:[[97,46,109,46],256],13251:[[66,113],256],13252:[[99,99],256],13253:[[99,100],256],13254:[[67,8725,107,103],256],13255:[[67,111,46],256],13256:[[100,66],256],13257:[[71,121],256],13258:[[104,97],256],13259:[[72,80],256],13260:[[105,110],256],13261:[[75,75],256],13262:[[75,77],256],13263:[[107,116],256],13264:[[108,109],256],13265:[[108,110],256],13266:[[108,111,103],256],13267:[[108,120],256],13268:[[109,98],256],13269:[[109,105,108],256],13270:[[109,111,108],256],13271:[[80,72],256],13272:[[112,46,109,46],256],13273:[[80,80,77],256],13274:[[80,82],256],13275:[[115,114],256],13276:[[83,118],256],13277:[[87,98],256],13278:[[86,8725,109],256],13279:[[65,8725,109],256],13280:[[49,26085],256],13281:[[50,26085],256],13282:[[51,26085],256],13283:[[52,26085],256],13284:[[53,26085],256],13285:[[54,26085],256],13286:[[55,26085],256],13287:[[56,26085],256],13288:[[57,26085],256],13289:[[49,48,26085],256],13290:[[49,49,26085],256],13291:[[49,50,26085],256],13292:[[49,51,26085],256],13293:[[49,52,26085],256],13294:[[49,53,26085],256],13295:[[49,54,26085],256],13296:[[49,55,26085],256],13297:[[49,56,26085],256],13298:[[49,57,26085],256],13299:[[50,48,26085],256],13300:[[50,49,26085],256],13301:[[50,50,26085],256],13302:[[50,51,26085],256],13303:[[50,52,26085],256],13304:[[50,53,26085],256],13305:[[50,54,26085],256],13306:[[50,55,26085],256],13307:[[50,56,26085],256],13308:[[50,57,26085],256],13309:[[51,48,26085],256],13310:[[51,49,26085],256],13311:[[103,97,108],256]},
27136:{92912:[,1],92913:[,1],92914:[,1],92915:[,1],92916:[,1]},
27392:{92976:[,230],92977:[,230],92978:[,230],92979:[,230],92980:[,230],92981:[,230],92982:[,230]},
42496:{42607:[,230],42612:[,230],42613:[,230],42614:[,230],42615:[,230],42616:[,230],42617:[,230],42618:[,230],42619:[,230],42620:[,230],42621:[,230],42652:[[1098],256],42653:[[1100],256],42655:[,230],42736:[,230],42737:[,230]},
42752:{42864:[[42863],256],43000:[[294],256],43001:[[339],256]},
43008:{43014:[,9],43204:[,9],43232:[,230],43233:[,230],43234:[,230],43235:[,230],43236:[,230],43237:[,230],43238:[,230],43239:[,230],43240:[,230],43241:[,230],43242:[,230],43243:[,230],43244:[,230],43245:[,230],43246:[,230],43247:[,230],43248:[,230],43249:[,230]},
43264:{43307:[,220],43308:[,220],43309:[,220],43347:[,9],43443:[,7],43456:[,9]},
43520:{43696:[,230],43698:[,230],43699:[,230],43700:[,220],43703:[,230],43704:[,230],43710:[,230],43711:[,230],43713:[,230],43766:[,9]},
43776:{43868:[[42791],256],43869:[[43831],256],43870:[[619],256],43871:[[43858],256],44013:[,9]},
48128:{113822:[,1]},
53504:{119134:[[119127,119141],512],119135:[[119128,119141],512],119136:[[119135,119150],512],119137:[[119135,119151],512],119138:[[119135,119152],512],119139:[[119135,119153],512],119140:[[119135,119154],512],119141:[,216],119142:[,216],119143:[,1],119144:[,1],119145:[,1],119149:[,226],119150:[,216],119151:[,216],119152:[,216],119153:[,216],119154:[,216],119163:[,220],119164:[,220],119165:[,220],119166:[,220],119167:[,220],119168:[,220],119169:[,220],119170:[,220],119173:[,230],119174:[,230],119175:[,230],119176:[,230],119177:[,230],119178:[,220],119179:[,220],119210:[,230],119211:[,230],119212:[,230],119213:[,230],119227:[[119225,119141],512],119228:[[119226,119141],512],119229:[[119227,119150],512],119230:[[119228,119150],512],119231:[[119227,119151],512],119232:[[119228,119151],512]},
53760:{119362:[,230],119363:[,230],119364:[,230]},
54272:{119808:[[65],256],119809:[[66],256],119810:[[67],256],119811:[[68],256],119812:[[69],256],119813:[[70],256],119814:[[71],256],119815:[[72],256],119816:[[73],256],119817:[[74],256],119818:[[75],256],119819:[[76],256],119820:[[77],256],119821:[[78],256],119822:[[79],256],119823:[[80],256],119824:[[81],256],119825:[[82],256],119826:[[83],256],119827:[[84],256],119828:[[85],256],119829:[[86],256],119830:[[87],256],119831:[[88],256],119832:[[89],256],119833:[[90],256],119834:[[97],256],119835:[[98],256],119836:[[99],256],119837:[[100],256],119838:[[101],256],119839:[[102],256],119840:[[103],256],119841:[[104],256],119842:[[105],256],119843:[[106],256],119844:[[107],256],119845:[[108],256],119846:[[109],256],119847:[[110],256],119848:[[111],256],119849:[[112],256],119850:[[113],256],119851:[[114],256],119852:[[115],256],119853:[[116],256],119854:[[117],256],119855:[[118],256],119856:[[119],256],119857:[[120],256],119858:[[121],256],119859:[[122],256],119860:[[65],256],119861:[[66],256],119862:[[67],256],119863:[[68],256],119864:[[69],256],119865:[[70],256],119866:[[71],256],119867:[[72],256],119868:[[73],256],119869:[[74],256],119870:[[75],256],119871:[[76],256],119872:[[77],256],119873:[[78],256],119874:[[79],256],119875:[[80],256],119876:[[81],256],119877:[[82],256],119878:[[83],256],119879:[[84],256],119880:[[85],256],119881:[[86],256],119882:[[87],256],119883:[[88],256],119884:[[89],256],119885:[[90],256],119886:[[97],256],119887:[[98],256],119888:[[99],256],119889:[[100],256],119890:[[101],256],119891:[[102],256],119892:[[103],256],119894:[[105],256],119895:[[106],256],119896:[[107],256],119897:[[108],256],119898:[[109],256],119899:[[110],256],119900:[[111],256],119901:[[112],256],119902:[[113],256],119903:[[114],256],119904:[[115],256],119905:[[116],256],119906:[[117],256],119907:[[118],256],119908:[[119],256],119909:[[120],256],119910:[[121],256],119911:[[122],256],119912:[[65],256],119913:[[66],256],119914:[[67],256],119915:[[68],256],119916:[[69],256],119917:[[70],256],119918:[[71],256],119919:[[72],256],119920:[[73],256],119921:[[74],256],119922:[[75],256],119923:[[76],256],119924:[[77],256],119925:[[78],256],119926:[[79],256],119927:[[80],256],119928:[[81],256],119929:[[82],256],119930:[[83],256],119931:[[84],256],119932:[[85],256],119933:[[86],256],119934:[[87],256],119935:[[88],256],119936:[[89],256],119937:[[90],256],119938:[[97],256],119939:[[98],256],119940:[[99],256],119941:[[100],256],119942:[[101],256],119943:[[102],256],119944:[[103],256],119945:[[104],256],119946:[[105],256],119947:[[106],256],119948:[[107],256],119949:[[108],256],119950:[[109],256],119951:[[110],256],119952:[[111],256],119953:[[112],256],119954:[[113],256],119955:[[114],256],119956:[[115],256],119957:[[116],256],119958:[[117],256],119959:[[118],256],119960:[[119],256],119961:[[120],256],119962:[[121],256],119963:[[122],256],119964:[[65],256],119966:[[67],256],119967:[[68],256],119970:[[71],256],119973:[[74],256],119974:[[75],256],119977:[[78],256],119978:[[79],256],119979:[[80],256],119980:[[81],256],119982:[[83],256],119983:[[84],256],119984:[[85],256],119985:[[86],256],119986:[[87],256],119987:[[88],256],119988:[[89],256],119989:[[90],256],119990:[[97],256],119991:[[98],256],119992:[[99],256],119993:[[100],256],119995:[[102],256],119997:[[104],256],119998:[[105],256],119999:[[106],256],120000:[[107],256],120001:[[108],256],120002:[[109],256],120003:[[110],256],120005:[[112],256],120006:[[113],256],120007:[[114],256],120008:[[115],256],120009:[[116],256],120010:[[117],256],120011:[[118],256],120012:[[119],256],120013:[[120],256],120014:[[121],256],120015:[[122],256],120016:[[65],256],120017:[[66],256],120018:[[67],256],120019:[[68],256],120020:[[69],256],120021:[[70],256],120022:[[71],256],120023:[[72],256],120024:[[73],256],120025:[[74],256],120026:[[75],256],120027:[[76],256],120028:[[77],256],120029:[[78],256],120030:[[79],256],120031:[[80],256],120032:[[81],256],120033:[[82],256],120034:[[83],256],120035:[[84],256],120036:[[85],256],120037:[[86],256],120038:[[87],256],120039:[[88],256],120040:[[89],256],120041:[[90],256],120042:[[97],256],120043:[[98],256],120044:[[99],256],120045:[[100],256],120046:[[101],256],120047:[[102],256],120048:[[103],256],120049:[[104],256],120050:[[105],256],120051:[[106],256],120052:[[107],256],120053:[[108],256],120054:[[109],256],120055:[[110],256],120056:[[111],256],120057:[[112],256],120058:[[113],256],120059:[[114],256],120060:[[115],256],120061:[[116],256],120062:[[117],256],120063:[[118],256]},
54528:{120064:[[119],256],120065:[[120],256],120066:[[121],256],120067:[[122],256],120068:[[65],256],120069:[[66],256],120071:[[68],256],120072:[[69],256],120073:[[70],256],120074:[[71],256],120077:[[74],256],120078:[[75],256],120079:[[76],256],120080:[[77],256],120081:[[78],256],120082:[[79],256],120083:[[80],256],120084:[[81],256],120086:[[83],256],120087:[[84],256],120088:[[85],256],120089:[[86],256],120090:[[87],256],120091:[[88],256],120092:[[89],256],120094:[[97],256],120095:[[98],256],120096:[[99],256],120097:[[100],256],120098:[[101],256],120099:[[102],256],120100:[[103],256],120101:[[104],256],120102:[[105],256],120103:[[106],256],120104:[[107],256],120105:[[108],256],120106:[[109],256],120107:[[110],256],120108:[[111],256],120109:[[112],256],120110:[[113],256],120111:[[114],256],120112:[[115],256],120113:[[116],256],120114:[[117],256],120115:[[118],256],120116:[[119],256],120117:[[120],256],120118:[[121],256],120119:[[122],256],120120:[[65],256],120121:[[66],256],120123:[[68],256],120124:[[69],256],120125:[[70],256],120126:[[71],256],120128:[[73],256],120129:[[74],256],120130:[[75],256],120131:[[76],256],120132:[[77],256],120134:[[79],256],120138:[[83],256],120139:[[84],256],120140:[[85],256],120141:[[86],256],120142:[[87],256],120143:[[88],256],120144:[[89],256],120146:[[97],256],120147:[[98],256],120148:[[99],256],120149:[[100],256],120150:[[101],256],120151:[[102],256],120152:[[103],256],120153:[[104],256],120154:[[105],256],120155:[[106],256],120156:[[107],256],120157:[[108],256],120158:[[109],256],120159:[[110],256],120160:[[111],256],120161:[[112],256],120162:[[113],256],120163:[[114],256],120164:[[115],256],120165:[[116],256],120166:[[117],256],120167:[[118],256],120168:[[119],256],120169:[[120],256],120170:[[121],256],120171:[[122],256],120172:[[65],256],120173:[[66],256],120174:[[67],256],120175:[[68],256],120176:[[69],256],120177:[[70],256],120178:[[71],256],120179:[[72],256],120180:[[73],256],120181:[[74],256],120182:[[75],256],120183:[[76],256],120184:[[77],256],120185:[[78],256],120186:[[79],256],120187:[[80],256],120188:[[81],256],120189:[[82],256],120190:[[83],256],120191:[[84],256],120192:[[85],256],120193:[[86],256],120194:[[87],256],120195:[[88],256],120196:[[89],256],120197:[[90],256],120198:[[97],256],120199:[[98],256],120200:[[99],256],120201:[[100],256],120202:[[101],256],120203:[[102],256],120204:[[103],256],120205:[[104],256],120206:[[105],256],120207:[[106],256],120208:[[107],256],120209:[[108],256],120210:[[109],256],120211:[[110],256],120212:[[111],256],120213:[[112],256],120214:[[113],256],120215:[[114],256],120216:[[115],256],120217:[[116],256],120218:[[117],256],120219:[[118],256],120220:[[119],256],120221:[[120],256],120222:[[121],256],120223:[[122],256],120224:[[65],256],120225:[[66],256],120226:[[67],256],120227:[[68],256],120228:[[69],256],120229:[[70],256],120230:[[71],256],120231:[[72],256],120232:[[73],256],120233:[[74],256],120234:[[75],256],120235:[[76],256],120236:[[77],256],120237:[[78],256],120238:[[79],256],120239:[[80],256],120240:[[81],256],120241:[[82],256],120242:[[83],256],120243:[[84],256],120244:[[85],256],120245:[[86],256],120246:[[87],256],120247:[[88],256],120248:[[89],256],120249:[[90],256],120250:[[97],256],120251:[[98],256],120252:[[99],256],120253:[[100],256],120254:[[101],256],120255:[[102],256],120256:[[103],256],120257:[[104],256],120258:[[105],256],120259:[[106],256],120260:[[107],256],120261:[[108],256],120262:[[109],256],120263:[[110],256],120264:[[111],256],120265:[[112],256],120266:[[113],256],120267:[[114],256],120268:[[115],256],120269:[[116],256],120270:[[117],256],120271:[[118],256],120272:[[119],256],120273:[[120],256],120274:[[121],256],120275:[[122],256],120276:[[65],256],120277:[[66],256],120278:[[67],256],120279:[[68],256],120280:[[69],256],120281:[[70],256],120282:[[71],256],120283:[[72],256],120284:[[73],256],120285:[[74],256],120286:[[75],256],120287:[[76],256],120288:[[77],256],120289:[[78],256],120290:[[79],256],120291:[[80],256],120292:[[81],256],120293:[[82],256],120294:[[83],256],120295:[[84],256],120296:[[85],256],120297:[[86],256],120298:[[87],256],120299:[[88],256],120300:[[89],256],120301:[[90],256],120302:[[97],256],120303:[[98],256],120304:[[99],256],120305:[[100],256],120306:[[101],256],120307:[[102],256],120308:[[103],256],120309:[[104],256],120310:[[105],256],120311:[[106],256],120312:[[107],256],120313:[[108],256],120314:[[109],256],120315:[[110],256],120316:[[111],256],120317:[[112],256],120318:[[113],256],120319:[[114],256]},
54784:{120320:[[115],256],120321:[[116],256],120322:[[117],256],120323:[[118],256],120324:[[119],256],120325:[[120],256],120326:[[121],256],120327:[[122],256],120328:[[65],256],120329:[[66],256],120330:[[67],256],120331:[[68],256],120332:[[69],256],120333:[[70],256],120334:[[71],256],120335:[[72],256],120336:[[73],256],120337:[[74],256],120338:[[75],256],120339:[[76],256],120340:[[77],256],120341:[[78],256],120342:[[79],256],120343:[[80],256],120344:[[81],256],120345:[[82],256],120346:[[83],256],120347:[[84],256],120348:[[85],256],120349:[[86],256],120350:[[87],256],120351:[[88],256],120352:[[89],256],120353:[[90],256],120354:[[97],256],120355:[[98],256],120356:[[99],256],120357:[[100],256],120358:[[101],256],120359:[[102],256],120360:[[103],256],120361:[[104],256],120362:[[105],256],120363:[[106],256],120364:[[107],256],120365:[[108],256],120366:[[109],256],120367:[[110],256],120368:[[111],256],120369:[[112],256],120370:[[113],256],120371:[[114],256],120372:[[115],256],120373:[[116],256],120374:[[117],256],120375:[[118],256],120376:[[119],256],120377:[[120],256],120378:[[121],256],120379:[[122],256],120380:[[65],256],120381:[[66],256],120382:[[67],256],120383:[[68],256],120384:[[69],256],120385:[[70],256],120386:[[71],256],120387:[[72],256],120388:[[73],256],120389:[[74],256],120390:[[75],256],120391:[[76],256],120392:[[77],256],120393:[[78],256],120394:[[79],256],120395:[[80],256],120396:[[81],256],120397:[[82],256],120398:[[83],256],120399:[[84],256],120400:[[85],256],120401:[[86],256],120402:[[87],256],120403:[[88],256],120404:[[89],256],120405:[[90],256],120406:[[97],256],120407:[[98],256],120408:[[99],256],120409:[[100],256],120410:[[101],256],120411:[[102],256],120412:[[103],256],120413:[[104],256],120414:[[105],256],120415:[[106],256],120416:[[107],256],120417:[[108],256],120418:[[109],256],120419:[[110],256],120420:[[111],256],120421:[[112],256],120422:[[113],256],120423:[[114],256],120424:[[115],256],120425:[[116],256],120426:[[117],256],120427:[[118],256],120428:[[119],256],120429:[[120],256],120430:[[121],256],120431:[[122],256],120432:[[65],256],120433:[[66],256],120434:[[67],256],120435:[[68],256],120436:[[69],256],120437:[[70],256],120438:[[71],256],120439:[[72],256],120440:[[73],256],120441:[[74],256],120442:[[75],256],120443:[[76],256],120444:[[77],256],120445:[[78],256],120446:[[79],256],120447:[[80],256],120448:[[81],256],120449:[[82],256],120450:[[83],256],120451:[[84],256],120452:[[85],256],120453:[[86],256],120454:[[87],256],120455:[[88],256],120456:[[89],256],120457:[[90],256],120458:[[97],256],120459:[[98],256],120460:[[99],256],120461:[[100],256],120462:[[101],256],120463:[[102],256],120464:[[103],256],120465:[[104],256],120466:[[105],256],120467:[[106],256],120468:[[107],256],120469:[[108],256],120470:[[109],256],120471:[[110],256],120472:[[111],256],120473:[[112],256],120474:[[113],256],120475:[[114],256],120476:[[115],256],120477:[[116],256],120478:[[117],256],120479:[[118],256],120480:[[119],256],120481:[[120],256],120482:[[121],256],120483:[[122],256],120484:[[305],256],120485:[[567],256],120488:[[913],256],120489:[[914],256],120490:[[915],256],120491:[[916],256],120492:[[917],256],120493:[[918],256],120494:[[919],256],120495:[[920],256],120496:[[921],256],120497:[[922],256],120498:[[923],256],120499:[[924],256],120500:[[925],256],120501:[[926],256],120502:[[927],256],120503:[[928],256],120504:[[929],256],120505:[[1012],256],120506:[[931],256],120507:[[932],256],120508:[[933],256],120509:[[934],256],120510:[[935],256],120511:[[936],256],120512:[[937],256],120513:[[8711],256],120514:[[945],256],120515:[[946],256],120516:[[947],256],120517:[[948],256],120518:[[949],256],120519:[[950],256],120520:[[951],256],120521:[[952],256],120522:[[953],256],120523:[[954],256],120524:[[955],256],120525:[[956],256],120526:[[957],256],120527:[[958],256],120528:[[959],256],120529:[[960],256],120530:[[961],256],120531:[[962],256],120532:[[963],256],120533:[[964],256],120534:[[965],256],120535:[[966],256],120536:[[967],256],120537:[[968],256],120538:[[969],256],120539:[[8706],256],120540:[[1013],256],120541:[[977],256],120542:[[1008],256],120543:[[981],256],120544:[[1009],256],120545:[[982],256],120546:[[913],256],120547:[[914],256],120548:[[915],256],120549:[[916],256],120550:[[917],256],120551:[[918],256],120552:[[919],256],120553:[[920],256],120554:[[921],256],120555:[[922],256],120556:[[923],256],120557:[[924],256],120558:[[925],256],120559:[[926],256],120560:[[927],256],120561:[[928],256],120562:[[929],256],120563:[[1012],256],120564:[[931],256],120565:[[932],256],120566:[[933],256],120567:[[934],256],120568:[[935],256],120569:[[936],256],120570:[[937],256],120571:[[8711],256],120572:[[945],256],120573:[[946],256],120574:[[947],256],120575:[[948],256]},
55040:{120576:[[949],256],120577:[[950],256],120578:[[951],256],120579:[[952],256],120580:[[953],256],120581:[[954],256],120582:[[955],256],120583:[[956],256],120584:[[957],256],120585:[[958],256],120586:[[959],256],120587:[[960],256],120588:[[961],256],120589:[[962],256],120590:[[963],256],120591:[[964],256],120592:[[965],256],120593:[[966],256],120594:[[967],256],120595:[[968],256],120596:[[969],256],120597:[[8706],256],120598:[[1013],256],120599:[[977],256],120600:[[1008],256],120601:[[981],256],120602:[[1009],256],120603:[[982],256],120604:[[913],256],120605:[[914],256],120606:[[915],256],120607:[[916],256],120608:[[917],256],120609:[[918],256],120610:[[919],256],120611:[[920],256],120612:[[921],256],120613:[[922],256],120614:[[923],256],120615:[[924],256],120616:[[925],256],120617:[[926],256],120618:[[927],256],120619:[[928],256],120620:[[929],256],120621:[[1012],256],120622:[[931],256],120623:[[932],256],120624:[[933],256],120625:[[934],256],120626:[[935],256],120627:[[936],256],120628:[[937],256],120629:[[8711],256],120630:[[945],256],120631:[[946],256],120632:[[947],256],120633:[[948],256],120634:[[949],256],120635:[[950],256],120636:[[951],256],120637:[[952],256],120638:[[953],256],120639:[[954],256],120640:[[955],256],120641:[[956],256],120642:[[957],256],120643:[[958],256],120644:[[959],256],120645:[[960],256],120646:[[961],256],120647:[[962],256],120648:[[963],256],120649:[[964],256],120650:[[965],256],120651:[[966],256],120652:[[967],256],120653:[[968],256],120654:[[969],256],120655:[[8706],256],120656:[[1013],256],120657:[[977],256],120658:[[1008],256],120659:[[981],256],120660:[[1009],256],120661:[[982],256],120662:[[913],256],120663:[[914],256],120664:[[915],256],120665:[[916],256],120666:[[917],256],120667:[[918],256],120668:[[919],256],120669:[[920],256],120670:[[921],256],120671:[[922],256],120672:[[923],256],120673:[[924],256],120674:[[925],256],120675:[[926],256],120676:[[927],256],120677:[[928],256],120678:[[929],256],120679:[[1012],256],120680:[[931],256],120681:[[932],256],120682:[[933],256],120683:[[934],256],120684:[[935],256],120685:[[936],256],120686:[[937],256],120687:[[8711],256],120688:[[945],256],120689:[[946],256],120690:[[947],256],120691:[[948],256],120692:[[949],256],120693:[[950],256],120694:[[951],256],120695:[[952],256],120696:[[953],256],120697:[[954],256],120698:[[955],256],120699:[[956],256],120700:[[957],256],120701:[[958],256],120702:[[959],256],120703:[[960],256],120704:[[961],256],120705:[[962],256],120706:[[963],256],120707:[[964],256],120708:[[965],256],120709:[[966],256],120710:[[967],256],120711:[[968],256],120712:[[969],256],120713:[[8706],256],120714:[[1013],256],120715:[[977],256],120716:[[1008],256],120717:[[981],256],120718:[[1009],256],120719:[[982],256],120720:[[913],256],120721:[[914],256],120722:[[915],256],120723:[[916],256],120724:[[917],256],120725:[[918],256],120726:[[919],256],120727:[[920],256],120728:[[921],256],120729:[[922],256],120730:[[923],256],120731:[[924],256],120732:[[925],256],120733:[[926],256],120734:[[927],256],120735:[[928],256],120736:[[929],256],120737:[[1012],256],120738:[[931],256],120739:[[932],256],120740:[[933],256],120741:[[934],256],120742:[[935],256],120743:[[936],256],120744:[[937],256],120745:[[8711],256],120746:[[945],256],120747:[[946],256],120748:[[947],256],120749:[[948],256],120750:[[949],256],120751:[[950],256],120752:[[951],256],120753:[[952],256],120754:[[953],256],120755:[[954],256],120756:[[955],256],120757:[[956],256],120758:[[957],256],120759:[[958],256],120760:[[959],256],120761:[[960],256],120762:[[961],256],120763:[[962],256],120764:[[963],256],120765:[[964],256],120766:[[965],256],120767:[[966],256],120768:[[967],256],120769:[[968],256],120770:[[969],256],120771:[[8706],256],120772:[[1013],256],120773:[[977],256],120774:[[1008],256],120775:[[981],256],120776:[[1009],256],120777:[[982],256],120778:[[988],256],120779:[[989],256],120782:[[48],256],120783:[[49],256],120784:[[50],256],120785:[[51],256],120786:[[52],256],120787:[[53],256],120788:[[54],256],120789:[[55],256],120790:[[56],256],120791:[[57],256],120792:[[48],256],120793:[[49],256],120794:[[50],256],120795:[[51],256],120796:[[52],256],120797:[[53],256],120798:[[54],256],120799:[[55],256],120800:[[56],256],120801:[[57],256],120802:[[48],256],120803:[[49],256],120804:[[50],256],120805:[[51],256],120806:[[52],256],120807:[[53],256],120808:[[54],256],120809:[[55],256],120810:[[56],256],120811:[[57],256],120812:[[48],256],120813:[[49],256],120814:[[50],256],120815:[[51],256],120816:[[52],256],120817:[[53],256],120818:[[54],256],120819:[[55],256],120820:[[56],256],120821:[[57],256],120822:[[48],256],120823:[[49],256],120824:[[50],256],120825:[[51],256],120826:[[52],256],120827:[[53],256],120828:[[54],256],120829:[[55],256],120830:[[56],256],120831:[[57],256]},
59392:{125136:[,220],125137:[,220],125138:[,220],125139:[,220],125140:[,220],125141:[,220],125142:[,220]},
60928:{126464:[[1575],256],126465:[[1576],256],126466:[[1580],256],126467:[[1583],256],126469:[[1608],256],126470:[[1586],256],126471:[[1581],256],126472:[[1591],256],126473:[[1610],256],126474:[[1603],256],126475:[[1604],256],126476:[[1605],256],126477:[[1606],256],126478:[[1587],256],126479:[[1593],256],126480:[[1601],256],126481:[[1589],256],126482:[[1602],256],126483:[[1585],256],126484:[[1588],256],126485:[[1578],256],126486:[[1579],256],126487:[[1582],256],126488:[[1584],256],126489:[[1590],256],126490:[[1592],256],126491:[[1594],256],126492:[[1646],256],126493:[[1722],256],126494:[[1697],256],126495:[[1647],256],126497:[[1576],256],126498:[[1580],256],126500:[[1607],256],126503:[[1581],256],126505:[[1610],256],126506:[[1603],256],126507:[[1604],256],126508:[[1605],256],126509:[[1606],256],126510:[[1587],256],126511:[[1593],256],126512:[[1601],256],126513:[[1589],256],126514:[[1602],256],126516:[[1588],256],126517:[[1578],256],126518:[[1579],256],126519:[[1582],256],126521:[[1590],256],126523:[[1594],256],126530:[[1580],256],126535:[[1581],256],126537:[[1610],256],126539:[[1604],256],126541:[[1606],256],126542:[[1587],256],126543:[[1593],256],126545:[[1589],256],126546:[[1602],256],126548:[[1588],256],126551:[[1582],256],126553:[[1590],256],126555:[[1594],256],126557:[[1722],256],126559:[[1647],256],126561:[[1576],256],126562:[[1580],256],126564:[[1607],256],126567:[[1581],256],126568:[[1591],256],126569:[[1610],256],126570:[[1603],256],126572:[[1605],256],126573:[[1606],256],126574:[[1587],256],126575:[[1593],256],126576:[[1601],256],126577:[[1589],256],126578:[[1602],256],126580:[[1588],256],126581:[[1578],256],126582:[[1579],256],126583:[[1582],256],126585:[[1590],256],126586:[[1592],256],126587:[[1594],256],126588:[[1646],256],126590:[[1697],256],126592:[[1575],256],126593:[[1576],256],126594:[[1580],256],126595:[[1583],256],126596:[[1607],256],126597:[[1608],256],126598:[[1586],256],126599:[[1581],256],126600:[[1591],256],126601:[[1610],256],126603:[[1604],256],126604:[[1605],256],126605:[[1606],256],126606:[[1587],256],126607:[[1593],256],126608:[[1601],256],126609:[[1589],256],126610:[[1602],256],126611:[[1585],256],126612:[[1588],256],126613:[[1578],256],126614:[[1579],256],126615:[[1582],256],126616:[[1584],256],126617:[[1590],256],126618:[[1592],256],126619:[[1594],256],126625:[[1576],256],126626:[[1580],256],126627:[[1583],256],126629:[[1608],256],126630:[[1586],256],126631:[[1581],256],126632:[[1591],256],126633:[[1610],256],126635:[[1604],256],126636:[[1605],256],126637:[[1606],256],126638:[[1587],256],126639:[[1593],256],126640:[[1601],256],126641:[[1589],256],126642:[[1602],256],126643:[[1585],256],126644:[[1588],256],126645:[[1578],256],126646:[[1579],256],126647:[[1582],256],126648:[[1584],256],126649:[[1590],256],126650:[[1592],256],126651:[[1594],256]},
61696:{127232:[[48,46],256],127233:[[48,44],256],127234:[[49,44],256],127235:[[50,44],256],127236:[[51,44],256],127237:[[52,44],256],127238:[[53,44],256],127239:[[54,44],256],127240:[[55,44],256],127241:[[56,44],256],127242:[[57,44],256],127248:[[40,65,41],256],127249:[[40,66,41],256],127250:[[40,67,41],256],127251:[[40,68,41],256],127252:[[40,69,41],256],127253:[[40,70,41],256],127254:[[40,71,41],256],127255:[[40,72,41],256],127256:[[40,73,41],256],127257:[[40,74,41],256],127258:[[40,75,41],256],127259:[[40,76,41],256],127260:[[40,77,41],256],127261:[[40,78,41],256],127262:[[40,79,41],256],127263:[[40,80,41],256],127264:[[40,81,41],256],127265:[[40,82,41],256],127266:[[40,83,41],256],127267:[[40,84,41],256],127268:[[40,85,41],256],127269:[[40,86,41],256],127270:[[40,87,41],256],127271:[[40,88,41],256],127272:[[40,89,41],256],127273:[[40,90,41],256],127274:[[12308,83,12309],256],127275:[[67],256],127276:[[82],256],127277:[[67,68],256],127278:[[87,90],256],127280:[[65],256],127281:[[66],256],127282:[[67],256],127283:[[68],256],127284:[[69],256],127285:[[70],256],127286:[[71],256],127287:[[72],256],127288:[[73],256],127289:[[74],256],127290:[[75],256],127291:[[76],256],127292:[[77],256],127293:[[78],256],127294:[[79],256],127295:[[80],256],127296:[[81],256],127297:[[82],256],127298:[[83],256],127299:[[84],256],127300:[[85],256],127301:[[86],256],127302:[[87],256],127303:[[88],256],127304:[[89],256],127305:[[90],256],127306:[[72,86],256],127307:[[77,86],256],127308:[[83,68],256],127309:[[83,83],256],127310:[[80,80,86],256],127311:[[87,67],256],127338:[[77,67],256],127339:[[77,68],256],127376:[[68,74],256]},
61952:{127488:[[12411,12363],256],127489:[[12467,12467],256],127490:[[12469],256],127504:[[25163],256],127505:[[23383],256],127506:[[21452],256],127507:[[12487],256],127508:[[20108],256],127509:[[22810],256],127510:[[35299],256],127511:[[22825],256],127512:[[20132],256],127513:[[26144],256],127514:[[28961],256],127515:[[26009],256],127516:[[21069],256],127517:[[24460],256],127518:[[20877],256],127519:[[26032],256],127520:[[21021],256],127521:[[32066],256],127522:[[29983],256],127523:[[36009],256],127524:[[22768],256],127525:[[21561],256],127526:[[28436],256],127527:[[25237],256],127528:[[25429],256],127529:[[19968],256],127530:[[19977],256],127531:[[36938],256],127532:[[24038],256],127533:[[20013],256],127534:[[21491],256],127535:[[25351],256],127536:[[36208],256],127537:[[25171],256],127538:[[31105],256],127539:[[31354],256],127540:[[21512],256],127541:[[28288],256],127542:[[26377],256],127543:[[26376],256],127544:[[30003],256],127545:[[21106],256],127546:[[21942],256],127552:[[12308,26412,12309],256],127553:[[12308,19977,12309],256],127554:[[12308,20108,12309],256],127555:[[12308,23433,12309],256],127556:[[12308,28857,12309],256],127557:[[12308,25171,12309],256],127558:[[12308,30423,12309],256],127559:[[12308,21213,12309],256],127560:[[12308,25943,12309],256],127568:[[24471],256],127569:[[21487],256]},
63488:{194560:[[20029]],194561:[[20024]],194562:[[20033]],194563:[[131362]],194564:[[20320]],194565:[[20398]],194566:[[20411]],194567:[[20482]],194568:[[20602]],194569:[[20633]],194570:[[20711]],194571:[[20687]],194572:[[13470]],194573:[[132666]],194574:[[20813]],194575:[[20820]],194576:[[20836]],194577:[[20855]],194578:[[132380]],194579:[[13497]],194580:[[20839]],194581:[[20877]],194582:[[132427]],194583:[[20887]],194584:[[20900]],194585:[[20172]],194586:[[20908]],194587:[[20917]],194588:[[168415]],194589:[[20981]],194590:[[20995]],194591:[[13535]],194592:[[21051]],194593:[[21062]],194594:[[21106]],194595:[[21111]],194596:[[13589]],194597:[[21191]],194598:[[21193]],194599:[[21220]],194600:[[21242]],194601:[[21253]],194602:[[21254]],194603:[[21271]],194604:[[21321]],194605:[[21329]],194606:[[21338]],194607:[[21363]],194608:[[21373]],194609:[[21375]],194610:[[21375]],194611:[[21375]],194612:[[133676]],194613:[[28784]],194614:[[21450]],194615:[[21471]],194616:[[133987]],194617:[[21483]],194618:[[21489]],194619:[[21510]],194620:[[21662]],194621:[[21560]],194622:[[21576]],194623:[[21608]],194624:[[21666]],194625:[[21750]],194626:[[21776]],194627:[[21843]],194628:[[21859]],194629:[[21892]],194630:[[21892]],194631:[[21913]],194632:[[21931]],194633:[[21939]],194634:[[21954]],194635:[[22294]],194636:[[22022]],194637:[[22295]],194638:[[22097]],194639:[[22132]],194640:[[20999]],194641:[[22766]],194642:[[22478]],194643:[[22516]],194644:[[22541]],194645:[[22411]],194646:[[22578]],194647:[[22577]],194648:[[22700]],194649:[[136420]],194650:[[22770]],194651:[[22775]],194652:[[22790]],194653:[[22810]],194654:[[22818]],194655:[[22882]],194656:[[136872]],194657:[[136938]],194658:[[23020]],194659:[[23067]],194660:[[23079]],194661:[[23000]],194662:[[23142]],194663:[[14062]],194664:[[14076]],194665:[[23304]],194666:[[23358]],194667:[[23358]],194668:[[137672]],194669:[[23491]],194670:[[23512]],194671:[[23527]],194672:[[23539]],194673:[[138008]],194674:[[23551]],194675:[[23558]],194676:[[24403]],194677:[[23586]],194678:[[14209]],194679:[[23648]],194680:[[23662]],194681:[[23744]],194682:[[23693]],194683:[[138724]],194684:[[23875]],194685:[[138726]],194686:[[23918]],194687:[[23915]],194688:[[23932]],194689:[[24033]],194690:[[24034]],194691:[[14383]],194692:[[24061]],194693:[[24104]],194694:[[24125]],194695:[[24169]],194696:[[14434]],194697:[[139651]],194698:[[14460]],194699:[[24240]],194700:[[24243]],194701:[[24246]],194702:[[24266]],194703:[[172946]],194704:[[24318]],194705:[[140081]],194706:[[140081]],194707:[[33281]],194708:[[24354]],194709:[[24354]],194710:[[14535]],194711:[[144056]],194712:[[156122]],194713:[[24418]],194714:[[24427]],194715:[[14563]],194716:[[24474]],194717:[[24525]],194718:[[24535]],194719:[[24569]],194720:[[24705]],194721:[[14650]],194722:[[14620]],194723:[[24724]],194724:[[141012]],194725:[[24775]],194726:[[24904]],194727:[[24908]],194728:[[24910]],194729:[[24908]],194730:[[24954]],194731:[[24974]],194732:[[25010]],194733:[[24996]],194734:[[25007]],194735:[[25054]],194736:[[25074]],194737:[[25078]],194738:[[25104]],194739:[[25115]],194740:[[25181]],194741:[[25265]],194742:[[25300]],194743:[[25424]],194744:[[142092]],194745:[[25405]],194746:[[25340]],194747:[[25448]],194748:[[25475]],194749:[[25572]],194750:[[142321]],194751:[[25634]],194752:[[25541]],194753:[[25513]],194754:[[14894]],194755:[[25705]],194756:[[25726]],194757:[[25757]],194758:[[25719]],194759:[[14956]],194760:[[25935]],194761:[[25964]],194762:[[143370]],194763:[[26083]],194764:[[26360]],194765:[[26185]],194766:[[15129]],194767:[[26257]],194768:[[15112]],194769:[[15076]],194770:[[20882]],194771:[[20885]],194772:[[26368]],194773:[[26268]],194774:[[32941]],194775:[[17369]],194776:[[26391]],194777:[[26395]],194778:[[26401]],194779:[[26462]],194780:[[26451]],194781:[[144323]],194782:[[15177]],194783:[[26618]],194784:[[26501]],194785:[[26706]],194786:[[26757]],194787:[[144493]],194788:[[26766]],194789:[[26655]],194790:[[26900]],194791:[[15261]],194792:[[26946]],194793:[[27043]],194794:[[27114]],194795:[[27304]],194796:[[145059]],194797:[[27355]],194798:[[15384]],194799:[[27425]],194800:[[145575]],194801:[[27476]],194802:[[15438]],194803:[[27506]],194804:[[27551]],194805:[[27578]],194806:[[27579]],194807:[[146061]],194808:[[138507]],194809:[[146170]],194810:[[27726]],194811:[[146620]],194812:[[27839]],194813:[[27853]],194814:[[27751]],194815:[[27926]]},
63744:{63744:[[35912]],63745:[[26356]],63746:[[36554]],63747:[[36040]],63748:[[28369]],63749:[[20018]],63750:[[21477]],63751:[[40860]],63752:[[40860]],63753:[[22865]],63754:[[37329]],63755:[[21895]],63756:[[22856]],63757:[[25078]],63758:[[30313]],63759:[[32645]],63760:[[34367]],63761:[[34746]],63762:[[35064]],63763:[[37007]],63764:[[27138]],63765:[[27931]],63766:[[28889]],63767:[[29662]],63768:[[33853]],63769:[[37226]],63770:[[39409]],63771:[[20098]],63772:[[21365]],63773:[[27396]],63774:[[29211]],63775:[[34349]],63776:[[40478]],63777:[[23888]],63778:[[28651]],63779:[[34253]],63780:[[35172]],63781:[[25289]],63782:[[33240]],63783:[[34847]],63784:[[24266]],63785:[[26391]],63786:[[28010]],63787:[[29436]],63788:[[37070]],63789:[[20358]],63790:[[20919]],63791:[[21214]],63792:[[25796]],63793:[[27347]],63794:[[29200]],63795:[[30439]],63796:[[32769]],63797:[[34310]],63798:[[34396]],63799:[[36335]],63800:[[38706]],63801:[[39791]],63802:[[40442]],63803:[[30860]],63804:[[31103]],63805:[[32160]],63806:[[33737]],63807:[[37636]],63808:[[40575]],63809:[[35542]],63810:[[22751]],63811:[[24324]],63812:[[31840]],63813:[[32894]],63814:[[29282]],63815:[[30922]],63816:[[36034]],63817:[[38647]],63818:[[22744]],63819:[[23650]],63820:[[27155]],63821:[[28122]],63822:[[28431]],63823:[[32047]],63824:[[32311]],63825:[[38475]],63826:[[21202]],63827:[[32907]],63828:[[20956]],63829:[[20940]],63830:[[31260]],63831:[[32190]],63832:[[33777]],63833:[[38517]],63834:[[35712]],63835:[[25295]],63836:[[27138]],63837:[[35582]],63838:[[20025]],63839:[[23527]],63840:[[24594]],63841:[[29575]],63842:[[30064]],63843:[[21271]],63844:[[30971]],63845:[[20415]],63846:[[24489]],63847:[[19981]],63848:[[27852]],63849:[[25976]],63850:[[32034]],63851:[[21443]],63852:[[22622]],63853:[[30465]],63854:[[33865]],63855:[[35498]],63856:[[27578]],63857:[[36784]],63858:[[27784]],63859:[[25342]],63860:[[33509]],63861:[[25504]],63862:[[30053]],63863:[[20142]],63864:[[20841]],63865:[[20937]],63866:[[26753]],63867:[[31975]],63868:[[33391]],63869:[[35538]],63870:[[37327]],63871:[[21237]],63872:[[21570]],63873:[[22899]],63874:[[24300]],63875:[[26053]],63876:[[28670]],63877:[[31018]],63878:[[38317]],63879:[[39530]],63880:[[40599]],63881:[[40654]],63882:[[21147]],63883:[[26310]],63884:[[27511]],63885:[[36706]],63886:[[24180]],63887:[[24976]],63888:[[25088]],63889:[[25754]],63890:[[28451]],63891:[[29001]],63892:[[29833]],63893:[[31178]],63894:[[32244]],63895:[[32879]],63896:[[36646]],63897:[[34030]],63898:[[36899]],63899:[[37706]],63900:[[21015]],63901:[[21155]],63902:[[21693]],63903:[[28872]],63904:[[35010]],63905:[[35498]],63906:[[24265]],63907:[[24565]],63908:[[25467]],63909:[[27566]],63910:[[31806]],63911:[[29557]],63912:[[20196]],63913:[[22265]],63914:[[23527]],63915:[[23994]],63916:[[24604]],63917:[[29618]],63918:[[29801]],63919:[[32666]],63920:[[32838]],63921:[[37428]],63922:[[38646]],63923:[[38728]],63924:[[38936]],63925:[[20363]],63926:[[31150]],63927:[[37300]],63928:[[38584]],63929:[[24801]],63930:[[20102]],63931:[[20698]],63932:[[23534]],63933:[[23615]],63934:[[26009]],63935:[[27138]],63936:[[29134]],63937:[[30274]],63938:[[34044]],63939:[[36988]],63940:[[40845]],63941:[[26248]],63942:[[38446]],63943:[[21129]],63944:[[26491]],63945:[[26611]],63946:[[27969]],63947:[[28316]],63948:[[29705]],63949:[[30041]],63950:[[30827]],63951:[[32016]],63952:[[39006]],63953:[[20845]],63954:[[25134]],63955:[[38520]],63956:[[20523]],63957:[[23833]],63958:[[28138]],63959:[[36650]],63960:[[24459]],63961:[[24900]],63962:[[26647]],63963:[[29575]],63964:[[38534]],63965:[[21033]],63966:[[21519]],63967:[[23653]],63968:[[26131]],63969:[[26446]],63970:[[26792]],63971:[[27877]],63972:[[29702]],63973:[[30178]],63974:[[32633]],63975:[[35023]],63976:[[35041]],63977:[[37324]],63978:[[38626]],63979:[[21311]],63980:[[28346]],63981:[[21533]],63982:[[29136]],63983:[[29848]],63984:[[34298]],63985:[[38563]],63986:[[40023]],63987:[[40607]],63988:[[26519]],63989:[[28107]],63990:[[33256]],63991:[[31435]],63992:[[31520]],63993:[[31890]],63994:[[29376]],63995:[[28825]],63996:[[35672]],63997:[[20160]],63998:[[33590]],63999:[[21050]],194816:[[27966]],194817:[[28023]],194818:[[27969]],194819:[[28009]],194820:[[28024]],194821:[[28037]],194822:[[146718]],194823:[[27956]],194824:[[28207]],194825:[[28270]],194826:[[15667]],194827:[[28363]],194828:[[28359]],194829:[[147153]],194830:[[28153]],194831:[[28526]],194832:[[147294]],194833:[[147342]],194834:[[28614]],194835:[[28729]],194836:[[28702]],194837:[[28699]],194838:[[15766]],194839:[[28746]],194840:[[28797]],194841:[[28791]],194842:[[28845]],194843:[[132389]],194844:[[28997]],194845:[[148067]],194846:[[29084]],194847:[[148395]],194848:[[29224]],194849:[[29237]],194850:[[29264]],194851:[[149000]],194852:[[29312]],194853:[[29333]],194854:[[149301]],194855:[[149524]],194856:[[29562]],194857:[[29579]],194858:[[16044]],194859:[[29605]],194860:[[16056]],194861:[[16056]],194862:[[29767]],194863:[[29788]],194864:[[29809]],194865:[[29829]],194866:[[29898]],194867:[[16155]],194868:[[29988]],194869:[[150582]],194870:[[30014]],194871:[[150674]],194872:[[30064]],194873:[[139679]],194874:[[30224]],194875:[[151457]],194876:[[151480]],194877:[[151620]],194878:[[16380]],194879:[[16392]],194880:[[30452]],194881:[[151795]],194882:[[151794]],194883:[[151833]],194884:[[151859]],194885:[[30494]],194886:[[30495]],194887:[[30495]],194888:[[30538]],194889:[[16441]],194890:[[30603]],194891:[[16454]],194892:[[16534]],194893:[[152605]],194894:[[30798]],194895:[[30860]],194896:[[30924]],194897:[[16611]],194898:[[153126]],194899:[[31062]],194900:[[153242]],194901:[[153285]],194902:[[31119]],194903:[[31211]],194904:[[16687]],194905:[[31296]],194906:[[31306]],194907:[[31311]],194908:[[153980]],194909:[[154279]],194910:[[154279]],194911:[[31470]],194912:[[16898]],194913:[[154539]],194914:[[31686]],194915:[[31689]],194916:[[16935]],194917:[[154752]],194918:[[31954]],194919:[[17056]],194920:[[31976]],194921:[[31971]],194922:[[32000]],194923:[[155526]],194924:[[32099]],194925:[[17153]],194926:[[32199]],194927:[[32258]],194928:[[32325]],194929:[[17204]],194930:[[156200]],194931:[[156231]],194932:[[17241]],194933:[[156377]],194934:[[32634]],194935:[[156478]],194936:[[32661]],194937:[[32762]],194938:[[32773]],194939:[[156890]],194940:[[156963]],194941:[[32864]],194942:[[157096]],194943:[[32880]],194944:[[144223]],194945:[[17365]],194946:[[32946]],194947:[[33027]],194948:[[17419]],194949:[[33086]],194950:[[23221]],194951:[[157607]],194952:[[157621]],194953:[[144275]],194954:[[144284]],194955:[[33281]],194956:[[33284]],194957:[[36766]],194958:[[17515]],194959:[[33425]],194960:[[33419]],194961:[[33437]],194962:[[21171]],194963:[[33457]],194964:[[33459]],194965:[[33469]],194966:[[33510]],194967:[[158524]],194968:[[33509]],194969:[[33565]],194970:[[33635]],194971:[[33709]],194972:[[33571]],194973:[[33725]],194974:[[33767]],194975:[[33879]],194976:[[33619]],194977:[[33738]],194978:[[33740]],194979:[[33756]],194980:[[158774]],194981:[[159083]],194982:[[158933]],194983:[[17707]],194984:[[34033]],194985:[[34035]],194986:[[34070]],194987:[[160714]],194988:[[34148]],194989:[[159532]],194990:[[17757]],194991:[[17761]],194992:[[159665]],194993:[[159954]],194994:[[17771]],194995:[[34384]],194996:[[34396]],194997:[[34407]],194998:[[34409]],194999:[[34473]],195000:[[34440]],195001:[[34574]],195002:[[34530]],195003:[[34681]],195004:[[34600]],195005:[[34667]],195006:[[34694]],195007:[[17879]],195008:[[34785]],195009:[[34817]],195010:[[17913]],195011:[[34912]],195012:[[34915]],195013:[[161383]],195014:[[35031]],195015:[[35038]],195016:[[17973]],195017:[[35066]],195018:[[13499]],195019:[[161966]],195020:[[162150]],195021:[[18110]],195022:[[18119]],195023:[[35488]],195024:[[35565]],195025:[[35722]],195026:[[35925]],195027:[[162984]],195028:[[36011]],195029:[[36033]],195030:[[36123]],195031:[[36215]],195032:[[163631]],195033:[[133124]],195034:[[36299]],195035:[[36284]],195036:[[36336]],195037:[[133342]],195038:[[36564]],195039:[[36664]],195040:[[165330]],195041:[[165357]],195042:[[37012]],195043:[[37105]],195044:[[37137]],195045:[[165678]],195046:[[37147]],195047:[[37432]],195048:[[37591]],195049:[[37592]],195050:[[37500]],195051:[[37881]],195052:[[37909]],195053:[[166906]],195054:[[38283]],195055:[[18837]],195056:[[38327]],195057:[[167287]],195058:[[18918]],195059:[[38595]],195060:[[23986]],195061:[[38691]],195062:[[168261]],195063:[[168474]],195064:[[19054]],195065:[[19062]],195066:[[38880]],195067:[[168970]],195068:[[19122]],195069:[[169110]],195070:[[38923]],195071:[[38923]]},
64000:{64000:[[20999]],64001:[[24230]],64002:[[25299]],64003:[[31958]],64004:[[23429]],64005:[[27934]],64006:[[26292]],64007:[[36667]],64008:[[34892]],64009:[[38477]],64010:[[35211]],64011:[[24275]],64012:[[20800]],64013:[[21952]],64016:[[22618]],64018:[[26228]],64021:[[20958]],64022:[[29482]],64023:[[30410]],64024:[[31036]],64025:[[31070]],64026:[[31077]],64027:[[31119]],64028:[[38742]],64029:[[31934]],64030:[[32701]],64032:[[34322]],64034:[[35576]],64037:[[36920]],64038:[[37117]],64042:[[39151]],64043:[[39164]],64044:[[39208]],64045:[[40372]],64046:[[37086]],64047:[[38583]],64048:[[20398]],64049:[[20711]],64050:[[20813]],64051:[[21193]],64052:[[21220]],64053:[[21329]],64054:[[21917]],64055:[[22022]],64056:[[22120]],64057:[[22592]],64058:[[22696]],64059:[[23652]],64060:[[23662]],64061:[[24724]],64062:[[24936]],64063:[[24974]],64064:[[25074]],64065:[[25935]],64066:[[26082]],64067:[[26257]],64068:[[26757]],64069:[[28023]],64070:[[28186]],64071:[[28450]],64072:[[29038]],64073:[[29227]],64074:[[29730]],64075:[[30865]],64076:[[31038]],64077:[[31049]],64078:[[31048]],64079:[[31056]],64080:[[31062]],64081:[[31069]],64082:[[31117]],64083:[[31118]],64084:[[31296]],64085:[[31361]],64086:[[31680]],64087:[[32244]],64088:[[32265]],64089:[[32321]],64090:[[32626]],64091:[[32773]],64092:[[33261]],64093:[[33401]],64094:[[33401]],64095:[[33879]],64096:[[35088]],64097:[[35222]],64098:[[35585]],64099:[[35641]],64100:[[36051]],64101:[[36104]],64102:[[36790]],64103:[[36920]],64104:[[38627]],64105:[[38911]],64106:[[38971]],64107:[[24693]],64108:[[148206]],64109:[[33304]],64112:[[20006]],64113:[[20917]],64114:[[20840]],64115:[[20352]],64116:[[20805]],64117:[[20864]],64118:[[21191]],64119:[[21242]],64120:[[21917]],64121:[[21845]],64122:[[21913]],64123:[[21986]],64124:[[22618]],64125:[[22707]],64126:[[22852]],64127:[[22868]],64128:[[23138]],64129:[[23336]],64130:[[24274]],64131:[[24281]],64132:[[24425]],64133:[[24493]],64134:[[24792]],64135:[[24910]],64136:[[24840]],64137:[[24974]],64138:[[24928]],64139:[[25074]],64140:[[25140]],64141:[[25540]],64142:[[25628]],64143:[[25682]],64144:[[25942]],64145:[[26228]],64146:[[26391]],64147:[[26395]],64148:[[26454]],64149:[[27513]],64150:[[27578]],64151:[[27969]],64152:[[28379]],64153:[[28363]],64154:[[28450]],64155:[[28702]],64156:[[29038]],64157:[[30631]],64158:[[29237]],64159:[[29359]],64160:[[29482]],64161:[[29809]],64162:[[29958]],64163:[[30011]],64164:[[30237]],64165:[[30239]],64166:[[30410]],64167:[[30427]],64168:[[30452]],64169:[[30538]],64170:[[30528]],64171:[[30924]],64172:[[31409]],64173:[[31680]],64174:[[31867]],64175:[[32091]],64176:[[32244]],64177:[[32574]],64178:[[32773]],64179:[[33618]],64180:[[33775]],64181:[[34681]],64182:[[35137]],64183:[[35206]],64184:[[35222]],64185:[[35519]],64186:[[35576]],64187:[[35531]],64188:[[35585]],64189:[[35582]],64190:[[35565]],64191:[[35641]],64192:[[35722]],64193:[[36104]],64194:[[36664]],64195:[[36978]],64196:[[37273]],64197:[[37494]],64198:[[38524]],64199:[[38627]],64200:[[38742]],64201:[[38875]],64202:[[38911]],64203:[[38923]],64204:[[38971]],64205:[[39698]],64206:[[40860]],64207:[[141386]],64208:[[141380]],64209:[[144341]],64210:[[15261]],64211:[[16408]],64212:[[16441]],64213:[[152137]],64214:[[154832]],64215:[[163539]],64216:[[40771]],64217:[[40846]],195072:[[38953]],195073:[[169398]],195074:[[39138]],195075:[[19251]],195076:[[39209]],195077:[[39335]],195078:[[39362]],195079:[[39422]],195080:[[19406]],195081:[[170800]],195082:[[39698]],195083:[[40000]],195084:[[40189]],195085:[[19662]],195086:[[19693]],195087:[[40295]],195088:[[172238]],195089:[[19704]],195090:[[172293]],195091:[[172558]],195092:[[172689]],195093:[[40635]],195094:[[19798]],195095:[[40697]],195096:[[40702]],195097:[[40709]],195098:[[40719]],195099:[[40726]],195100:[[40763]],195101:[[173568]]},
64256:{64256:[[102,102],256],64257:[[102,105],256],64258:[[102,108],256],64259:[[102,102,105],256],64260:[[102,102,108],256],64261:[[383,116],256],64262:[[115,116],256],64275:[[1396,1398],256],64276:[[1396,1381],256],64277:[[1396,1387],256],64278:[[1406,1398],256],64279:[[1396,1389],256],64285:[[1497,1460],512],64286:[,26],64287:[[1522,1463],512],64288:[[1506],256],64289:[[1488],256],64290:[[1491],256],64291:[[1492],256],64292:[[1499],256],64293:[[1500],256],64294:[[1501],256],64295:[[1512],256],64296:[[1514],256],64297:[[43],256],64298:[[1513,1473],512],64299:[[1513,1474],512],64300:[[64329,1473],512],64301:[[64329,1474],512],64302:[[1488,1463],512],64303:[[1488,1464],512],64304:[[1488,1468],512],64305:[[1489,1468],512],64306:[[1490,1468],512],64307:[[1491,1468],512],64308:[[1492,1468],512],64309:[[1493,1468],512],64310:[[1494,1468],512],64312:[[1496,1468],512],64313:[[1497,1468],512],64314:[[1498,1468],512],64315:[[1499,1468],512],64316:[[1500,1468],512],64318:[[1502,1468],512],64320:[[1504,1468],512],64321:[[1505,1468],512],64323:[[1507,1468],512],64324:[[1508,1468],512],64326:[[1510,1468],512],64327:[[1511,1468],512],64328:[[1512,1468],512],64329:[[1513,1468],512],64330:[[1514,1468],512],64331:[[1493,1465],512],64332:[[1489,1471],512],64333:[[1499,1471],512],64334:[[1508,1471],512],64335:[[1488,1500],256],64336:[[1649],256],64337:[[1649],256],64338:[[1659],256],64339:[[1659],256],64340:[[1659],256],64341:[[1659],256],64342:[[1662],256],64343:[[1662],256],64344:[[1662],256],64345:[[1662],256],64346:[[1664],256],64347:[[1664],256],64348:[[1664],256],64349:[[1664],256],64350:[[1658],256],64351:[[1658],256],64352:[[1658],256],64353:[[1658],256],64354:[[1663],256],64355:[[1663],256],64356:[[1663],256],64357:[[1663],256],64358:[[1657],256],64359:[[1657],256],64360:[[1657],256],64361:[[1657],256],64362:[[1700],256],64363:[[1700],256],64364:[[1700],256],64365:[[1700],256],64366:[[1702],256],64367:[[1702],256],64368:[[1702],256],64369:[[1702],256],64370:[[1668],256],64371:[[1668],256],64372:[[1668],256],64373:[[1668],256],64374:[[1667],256],64375:[[1667],256],64376:[[1667],256],64377:[[1667],256],64378:[[1670],256],64379:[[1670],256],64380:[[1670],256],64381:[[1670],256],64382:[[1671],256],64383:[[1671],256],64384:[[1671],256],64385:[[1671],256],64386:[[1677],256],64387:[[1677],256],64388:[[1676],256],64389:[[1676],256],64390:[[1678],256],64391:[[1678],256],64392:[[1672],256],64393:[[1672],256],64394:[[1688],256],64395:[[1688],256],64396:[[1681],256],64397:[[1681],256],64398:[[1705],256],64399:[[1705],256],64400:[[1705],256],64401:[[1705],256],64402:[[1711],256],64403:[[1711],256],64404:[[1711],256],64405:[[1711],256],64406:[[1715],256],64407:[[1715],256],64408:[[1715],256],64409:[[1715],256],64410:[[1713],256],64411:[[1713],256],64412:[[1713],256],64413:[[1713],256],64414:[[1722],256],64415:[[1722],256],64416:[[1723],256],64417:[[1723],256],64418:[[1723],256],64419:[[1723],256],64420:[[1728],256],64421:[[1728],256],64422:[[1729],256],64423:[[1729],256],64424:[[1729],256],64425:[[1729],256],64426:[[1726],256],64427:[[1726],256],64428:[[1726],256],64429:[[1726],256],64430:[[1746],256],64431:[[1746],256],64432:[[1747],256],64433:[[1747],256],64467:[[1709],256],64468:[[1709],256],64469:[[1709],256],64470:[[1709],256],64471:[[1735],256],64472:[[1735],256],64473:[[1734],256],64474:[[1734],256],64475:[[1736],256],64476:[[1736],256],64477:[[1655],256],64478:[[1739],256],64479:[[1739],256],64480:[[1733],256],64481:[[1733],256],64482:[[1737],256],64483:[[1737],256],64484:[[1744],256],64485:[[1744],256],64486:[[1744],256],64487:[[1744],256],64488:[[1609],256],64489:[[1609],256],64490:[[1574,1575],256],64491:[[1574,1575],256],64492:[[1574,1749],256],64493:[[1574,1749],256],64494:[[1574,1608],256],64495:[[1574,1608],256],64496:[[1574,1735],256],64497:[[1574,1735],256],64498:[[1574,1734],256],64499:[[1574,1734],256],64500:[[1574,1736],256],64501:[[1574,1736],256],64502:[[1574,1744],256],64503:[[1574,1744],256],64504:[[1574,1744],256],64505:[[1574,1609],256],64506:[[1574,1609],256],64507:[[1574,1609],256],64508:[[1740],256],64509:[[1740],256],64510:[[1740],256],64511:[[1740],256]},
64512:{64512:[[1574,1580],256],64513:[[1574,1581],256],64514:[[1574,1605],256],64515:[[1574,1609],256],64516:[[1574,1610],256],64517:[[1576,1580],256],64518:[[1576,1581],256],64519:[[1576,1582],256],64520:[[1576,1605],256],64521:[[1576,1609],256],64522:[[1576,1610],256],64523:[[1578,1580],256],64524:[[1578,1581],256],64525:[[1578,1582],256],64526:[[1578,1605],256],64527:[[1578,1609],256],64528:[[1578,1610],256],64529:[[1579,1580],256],64530:[[1579,1605],256],64531:[[1579,1609],256],64532:[[1579,1610],256],64533:[[1580,1581],256],64534:[[1580,1605],256],64535:[[1581,1580],256],64536:[[1581,1605],256],64537:[[1582,1580],256],64538:[[1582,1581],256],64539:[[1582,1605],256],64540:[[1587,1580],256],64541:[[1587,1581],256],64542:[[1587,1582],256],64543:[[1587,1605],256],64544:[[1589,1581],256],64545:[[1589,1605],256],64546:[[1590,1580],256],64547:[[1590,1581],256],64548:[[1590,1582],256],64549:[[1590,1605],256],64550:[[1591,1581],256],64551:[[1591,1605],256],64552:[[1592,1605],256],64553:[[1593,1580],256],64554:[[1593,1605],256],64555:[[1594,1580],256],64556:[[1594,1605],256],64557:[[1601,1580],256],64558:[[1601,1581],256],64559:[[1601,1582],256],64560:[[1601,1605],256],64561:[[1601,1609],256],64562:[[1601,1610],256],64563:[[1602,1581],256],64564:[[1602,1605],256],64565:[[1602,1609],256],64566:[[1602,1610],256],64567:[[1603,1575],256],64568:[[1603,1580],256],64569:[[1603,1581],256],64570:[[1603,1582],256],64571:[[1603,1604],256],64572:[[1603,1605],256],64573:[[1603,1609],256],64574:[[1603,1610],256],64575:[[1604,1580],256],64576:[[1604,1581],256],64577:[[1604,1582],256],64578:[[1604,1605],256],64579:[[1604,1609],256],64580:[[1604,1610],256],64581:[[1605,1580],256],64582:[[1605,1581],256],64583:[[1605,1582],256],64584:[[1605,1605],256],64585:[[1605,1609],256],64586:[[1605,1610],256],64587:[[1606,1580],256],64588:[[1606,1581],256],64589:[[1606,1582],256],64590:[[1606,1605],256],64591:[[1606,1609],256],64592:[[1606,1610],256],64593:[[1607,1580],256],64594:[[1607,1605],256],64595:[[1607,1609],256],64596:[[1607,1610],256],64597:[[1610,1580],256],64598:[[1610,1581],256],64599:[[1610,1582],256],64600:[[1610,1605],256],64601:[[1610,1609],256],64602:[[1610,1610],256],64603:[[1584,1648],256],64604:[[1585,1648],256],64605:[[1609,1648],256],64606:[[32,1612,1617],256],64607:[[32,1613,1617],256],64608:[[32,1614,1617],256],64609:[[32,1615,1617],256],64610:[[32,1616,1617],256],64611:[[32,1617,1648],256],64612:[[1574,1585],256],64613:[[1574,1586],256],64614:[[1574,1605],256],64615:[[1574,1606],256],64616:[[1574,1609],256],64617:[[1574,1610],256],64618:[[1576,1585],256],64619:[[1576,1586],256],64620:[[1576,1605],256],64621:[[1576,1606],256],64622:[[1576,1609],256],64623:[[1576,1610],256],64624:[[1578,1585],256],64625:[[1578,1586],256],64626:[[1578,1605],256],64627:[[1578,1606],256],64628:[[1578,1609],256],64629:[[1578,1610],256],64630:[[1579,1585],256],64631:[[1579,1586],256],64632:[[1579,1605],256],64633:[[1579,1606],256],64634:[[1579,1609],256],64635:[[1579,1610],256],64636:[[1601,1609],256],64637:[[1601,1610],256],64638:[[1602,1609],256],64639:[[1602,1610],256],64640:[[1603,1575],256],64641:[[1603,1604],256],64642:[[1603,1605],256],64643:[[1603,1609],256],64644:[[1603,1610],256],64645:[[1604,1605],256],64646:[[1604,1609],256],64647:[[1604,1610],256],64648:[[1605,1575],256],64649:[[1605,1605],256],64650:[[1606,1585],256],64651:[[1606,1586],256],64652:[[1606,1605],256],64653:[[1606,1606],256],64654:[[1606,1609],256],64655:[[1606,1610],256],64656:[[1609,1648],256],64657:[[1610,1585],256],64658:[[1610,1586],256],64659:[[1610,1605],256],64660:[[1610,1606],256],64661:[[1610,1609],256],64662:[[1610,1610],256],64663:[[1574,1580],256],64664:[[1574,1581],256],64665:[[1574,1582],256],64666:[[1574,1605],256],64667:[[1574,1607],256],64668:[[1576,1580],256],64669:[[1576,1581],256],64670:[[1576,1582],256],64671:[[1576,1605],256],64672:[[1576,1607],256],64673:[[1578,1580],256],64674:[[1578,1581],256],64675:[[1578,1582],256],64676:[[1578,1605],256],64677:[[1578,1607],256],64678:[[1579,1605],256],64679:[[1580,1581],256],64680:[[1580,1605],256],64681:[[1581,1580],256],64682:[[1581,1605],256],64683:[[1582,1580],256],64684:[[1582,1605],256],64685:[[1587,1580],256],64686:[[1587,1581],256],64687:[[1587,1582],256],64688:[[1587,1605],256],64689:[[1589,1581],256],64690:[[1589,1582],256],64691:[[1589,1605],256],64692:[[1590,1580],256],64693:[[1590,1581],256],64694:[[1590,1582],256],64695:[[1590,1605],256],64696:[[1591,1581],256],64697:[[1592,1605],256],64698:[[1593,1580],256],64699:[[1593,1605],256],64700:[[1594,1580],256],64701:[[1594,1605],256],64702:[[1601,1580],256],64703:[[1601,1581],256],64704:[[1601,1582],256],64705:[[1601,1605],256],64706:[[1602,1581],256],64707:[[1602,1605],256],64708:[[1603,1580],256],64709:[[1603,1581],256],64710:[[1603,1582],256],64711:[[1603,1604],256],64712:[[1603,1605],256],64713:[[1604,1580],256],64714:[[1604,1581],256],64715:[[1604,1582],256],64716:[[1604,1605],256],64717:[[1604,1607],256],64718:[[1605,1580],256],64719:[[1605,1581],256],64720:[[1605,1582],256],64721:[[1605,1605],256],64722:[[1606,1580],256],64723:[[1606,1581],256],64724:[[1606,1582],256],64725:[[1606,1605],256],64726:[[1606,1607],256],64727:[[1607,1580],256],64728:[[1607,1605],256],64729:[[1607,1648],256],64730:[[1610,1580],256],64731:[[1610,1581],256],64732:[[1610,1582],256],64733:[[1610,1605],256],64734:[[1610,1607],256],64735:[[1574,1605],256],64736:[[1574,1607],256],64737:[[1576,1605],256],64738:[[1576,1607],256],64739:[[1578,1605],256],64740:[[1578,1607],256],64741:[[1579,1605],256],64742:[[1579,1607],256],64743:[[1587,1605],256],64744:[[1587,1607],256],64745:[[1588,1605],256],64746:[[1588,1607],256],64747:[[1603,1604],256],64748:[[1603,1605],256],64749:[[1604,1605],256],64750:[[1606,1605],256],64751:[[1606,1607],256],64752:[[1610,1605],256],64753:[[1610,1607],256],64754:[[1600,1614,1617],256],64755:[[1600,1615,1617],256],64756:[[1600,1616,1617],256],64757:[[1591,1609],256],64758:[[1591,1610],256],64759:[[1593,1609],256],64760:[[1593,1610],256],64761:[[1594,1609],256],64762:[[1594,1610],256],64763:[[1587,1609],256],64764:[[1587,1610],256],64765:[[1588,1609],256],64766:[[1588,1610],256],64767:[[1581,1609],256]},
64768:{64768:[[1581,1610],256],64769:[[1580,1609],256],64770:[[1580,1610],256],64771:[[1582,1609],256],64772:[[1582,1610],256],64773:[[1589,1609],256],64774:[[1589,1610],256],64775:[[1590,1609],256],64776:[[1590,1610],256],64777:[[1588,1580],256],64778:[[1588,1581],256],64779:[[1588,1582],256],64780:[[1588,1605],256],64781:[[1588,1585],256],64782:[[1587,1585],256],64783:[[1589,1585],256],64784:[[1590,1585],256],64785:[[1591,1609],256],64786:[[1591,1610],256],64787:[[1593,1609],256],64788:[[1593,1610],256],64789:[[1594,1609],256],64790:[[1594,1610],256],64791:[[1587,1609],256],64792:[[1587,1610],256],64793:[[1588,1609],256],64794:[[1588,1610],256],64795:[[1581,1609],256],64796:[[1581,1610],256],64797:[[1580,1609],256],64798:[[1580,1610],256],64799:[[1582,1609],256],64800:[[1582,1610],256],64801:[[1589,1609],256],64802:[[1589,1610],256],64803:[[1590,1609],256],64804:[[1590,1610],256],64805:[[1588,1580],256],64806:[[1588,1581],256],64807:[[1588,1582],256],64808:[[1588,1605],256],64809:[[1588,1585],256],64810:[[1587,1585],256],64811:[[1589,1585],256],64812:[[1590,1585],256],64813:[[1588,1580],256],64814:[[1588,1581],256],64815:[[1588,1582],256],64816:[[1588,1605],256],64817:[[1587,1607],256],64818:[[1588,1607],256],64819:[[1591,1605],256],64820:[[1587,1580],256],64821:[[1587,1581],256],64822:[[1587,1582],256],64823:[[1588,1580],256],64824:[[1588,1581],256],64825:[[1588,1582],256],64826:[[1591,1605],256],64827:[[1592,1605],256],64828:[[1575,1611],256],64829:[[1575,1611],256],64848:[[1578,1580,1605],256],64849:[[1578,1581,1580],256],64850:[[1578,1581,1580],256],64851:[[1578,1581,1605],256],64852:[[1578,1582,1605],256],64853:[[1578,1605,1580],256],64854:[[1578,1605,1581],256],64855:[[1578,1605,1582],256],64856:[[1580,1605,1581],256],64857:[[1580,1605,1581],256],64858:[[1581,1605,1610],256],64859:[[1581,1605,1609],256],64860:[[1587,1581,1580],256],64861:[[1587,1580,1581],256],64862:[[1587,1580,1609],256],64863:[[1587,1605,1581],256],64864:[[1587,1605,1581],256],64865:[[1587,1605,1580],256],64866:[[1587,1605,1605],256],64867:[[1587,1605,1605],256],64868:[[1589,1581,1581],256],64869:[[1589,1581,1581],256],64870:[[1589,1605,1605],256],64871:[[1588,1581,1605],256],64872:[[1588,1581,1605],256],64873:[[1588,1580,1610],256],64874:[[1588,1605,1582],256],64875:[[1588,1605,1582],256],64876:[[1588,1605,1605],256],64877:[[1588,1605,1605],256],64878:[[1590,1581,1609],256],64879:[[1590,1582,1605],256],64880:[[1590,1582,1605],256],64881:[[1591,1605,1581],256],64882:[[1591,1605,1581],256],64883:[[1591,1605,1605],256],64884:[[1591,1605,1610],256],64885:[[1593,1580,1605],256],64886:[[1593,1605,1605],256],64887:[[1593,1605,1605],256],64888:[[1593,1605,1609],256],64889:[[1594,1605,1605],256],64890:[[1594,1605,1610],256],64891:[[1594,1605,1609],256],64892:[[1601,1582,1605],256],64893:[[1601,1582,1605],256],64894:[[1602,1605,1581],256],64895:[[1602,1605,1605],256],64896:[[1604,1581,1605],256],64897:[[1604,1581,1610],256],64898:[[1604,1581,1609],256],64899:[[1604,1580,1580],256],64900:[[1604,1580,1580],256],64901:[[1604,1582,1605],256],64902:[[1604,1582,1605],256],64903:[[1604,1605,1581],256],64904:[[1604,1605,1581],256],64905:[[1605,1581,1580],256],64906:[[1605,1581,1605],256],64907:[[1605,1581,1610],256],64908:[[1605,1580,1581],256],64909:[[1605,1580,1605],256],64910:[[1605,1582,1580],256],64911:[[1605,1582,1605],256],64914:[[1605,1580,1582],256],64915:[[1607,1605,1580],256],64916:[[1607,1605,1605],256],64917:[[1606,1581,1605],256],64918:[[1606,1581,1609],256],64919:[[1606,1580,1605],256],64920:[[1606,1580,1605],256],64921:[[1606,1580,1609],256],64922:[[1606,1605,1610],256],64923:[[1606,1605,1609],256],64924:[[1610,1605,1605],256],64925:[[1610,1605,1605],256],64926:[[1576,1582,1610],256],64927:[[1578,1580,1610],256],64928:[[1578,1580,1609],256],64929:[[1578,1582,1610],256],64930:[[1578,1582,1609],256],64931:[[1578,1605,1610],256],64932:[[1578,1605,1609],256],64933:[[1580,1605,1610],256],64934:[[1580,1581,1609],256],64935:[[1580,1605,1609],256],64936:[[1587,1582,1609],256],64937:[[1589,1581,1610],256],64938:[[1588,1581,1610],256],64939:[[1590,1581,1610],256],64940:[[1604,1580,1610],256],64941:[[1604,1605,1610],256],64942:[[1610,1581,1610],256],64943:[[1610,1580,1610],256],64944:[[1610,1605,1610],256],64945:[[1605,1605,1610],256],64946:[[1602,1605,1610],256],64947:[[1606,1581,1610],256],64948:[[1602,1605,1581],256],64949:[[1604,1581,1605],256],64950:[[1593,1605,1610],256],64951:[[1603,1605,1610],256],64952:[[1606,1580,1581],256],64953:[[1605,1582,1610],256],64954:[[1604,1580,1605],256],64955:[[1603,1605,1605],256],64956:[[1604,1580,1605],256],64957:[[1606,1580,1581],256],64958:[[1580,1581,1610],256],64959:[[1581,1580,1610],256],64960:[[1605,1580,1610],256],64961:[[1601,1605,1610],256],64962:[[1576,1581,1610],256],64963:[[1603,1605,1605],256],64964:[[1593,1580,1605],256],64965:[[1589,1605,1605],256],64966:[[1587,1582,1610],256],64967:[[1606,1580,1610],256],65008:[[1589,1604,1746],256],65009:[[1602,1604,1746],256],65010:[[1575,1604,1604,1607],256],65011:[[1575,1603,1576,1585],256],65012:[[1605,1581,1605,1583],256],65013:[[1589,1604,1593,1605],256],65014:[[1585,1587,1608,1604],256],65015:[[1593,1604,1610,1607],256],65016:[[1608,1587,1604,1605],256],65017:[[1589,1604,1609],256],65018:[[1589,1604,1609,32,1575,1604,1604,1607,32,1593,1604,1610,1607,32,1608,1587,1604,1605],256],65019:[[1580,1604,32,1580,1604,1575,1604,1607],256],65020:[[1585,1740,1575,1604],256]},
65024:{65040:[[44],256],65041:[[12289],256],65042:[[12290],256],65043:[[58],256],65044:[[59],256],65045:[[33],256],65046:[[63],256],65047:[[12310],256],65048:[[12311],256],65049:[[8230],256],65056:[,230],65057:[,230],65058:[,230],65059:[,230],65060:[,230],65061:[,230],65062:[,230],65063:[,220],65064:[,220],65065:[,220],65066:[,220],65067:[,220],65068:[,220],65069:[,220],65072:[[8229],256],65073:[[8212],256],65074:[[8211],256],65075:[[95],256],65076:[[95],256],65077:[[40],256],65078:[[41],256],65079:[[123],256],65080:[[125],256],65081:[[12308],256],65082:[[12309],256],65083:[[12304],256],65084:[[12305],256],65085:[[12298],256],65086:[[12299],256],65087:[[12296],256],65088:[[12297],256],65089:[[12300],256],65090:[[12301],256],65091:[[12302],256],65092:[[12303],256],65095:[[91],256],65096:[[93],256],65097:[[8254],256],65098:[[8254],256],65099:[[8254],256],65100:[[8254],256],65101:[[95],256],65102:[[95],256],65103:[[95],256],65104:[[44],256],65105:[[12289],256],65106:[[46],256],65108:[[59],256],65109:[[58],256],65110:[[63],256],65111:[[33],256],65112:[[8212],256],65113:[[40],256],65114:[[41],256],65115:[[123],256],65116:[[125],256],65117:[[12308],256],65118:[[12309],256],65119:[[35],256],65120:[[38],256],65121:[[42],256],65122:[[43],256],65123:[[45],256],65124:[[60],256],65125:[[62],256],65126:[[61],256],65128:[[92],256],65129:[[36],256],65130:[[37],256],65131:[[64],256],65136:[[32,1611],256],65137:[[1600,1611],256],65138:[[32,1612],256],65140:[[32,1613],256],65142:[[32,1614],256],65143:[[1600,1614],256],65144:[[32,1615],256],65145:[[1600,1615],256],65146:[[32,1616],256],65147:[[1600,1616],256],65148:[[32,1617],256],65149:[[1600,1617],256],65150:[[32,1618],256],65151:[[1600,1618],256],65152:[[1569],256],65153:[[1570],256],65154:[[1570],256],65155:[[1571],256],65156:[[1571],256],65157:[[1572],256],65158:[[1572],256],65159:[[1573],256],65160:[[1573],256],65161:[[1574],256],65162:[[1574],256],65163:[[1574],256],65164:[[1574],256],65165:[[1575],256],65166:[[1575],256],65167:[[1576],256],65168:[[1576],256],65169:[[1576],256],65170:[[1576],256],65171:[[1577],256],65172:[[1577],256],65173:[[1578],256],65174:[[1578],256],65175:[[1578],256],65176:[[1578],256],65177:[[1579],256],65178:[[1579],256],65179:[[1579],256],65180:[[1579],256],65181:[[1580],256],65182:[[1580],256],65183:[[1580],256],65184:[[1580],256],65185:[[1581],256],65186:[[1581],256],65187:[[1581],256],65188:[[1581],256],65189:[[1582],256],65190:[[1582],256],65191:[[1582],256],65192:[[1582],256],65193:[[1583],256],65194:[[1583],256],65195:[[1584],256],65196:[[1584],256],65197:[[1585],256],65198:[[1585],256],65199:[[1586],256],65200:[[1586],256],65201:[[1587],256],65202:[[1587],256],65203:[[1587],256],65204:[[1587],256],65205:[[1588],256],65206:[[1588],256],65207:[[1588],256],65208:[[1588],256],65209:[[1589],256],65210:[[1589],256],65211:[[1589],256],65212:[[1589],256],65213:[[1590],256],65214:[[1590],256],65215:[[1590],256],65216:[[1590],256],65217:[[1591],256],65218:[[1591],256],65219:[[1591],256],65220:[[1591],256],65221:[[1592],256],65222:[[1592],256],65223:[[1592],256],65224:[[1592],256],65225:[[1593],256],65226:[[1593],256],65227:[[1593],256],65228:[[1593],256],65229:[[1594],256],65230:[[1594],256],65231:[[1594],256],65232:[[1594],256],65233:[[1601],256],65234:[[1601],256],65235:[[1601],256],65236:[[1601],256],65237:[[1602],256],65238:[[1602],256],65239:[[1602],256],65240:[[1602],256],65241:[[1603],256],65242:[[1603],256],65243:[[1603],256],65244:[[1603],256],65245:[[1604],256],65246:[[1604],256],65247:[[1604],256],65248:[[1604],256],65249:[[1605],256],65250:[[1605],256],65251:[[1605],256],65252:[[1605],256],65253:[[1606],256],65254:[[1606],256],65255:[[1606],256],65256:[[1606],256],65257:[[1607],256],65258:[[1607],256],65259:[[1607],256],65260:[[1607],256],65261:[[1608],256],65262:[[1608],256],65263:[[1609],256],65264:[[1609],256],65265:[[1610],256],65266:[[1610],256],65267:[[1610],256],65268:[[1610],256],65269:[[1604,1570],256],65270:[[1604,1570],256],65271:[[1604,1571],256],65272:[[1604,1571],256],65273:[[1604,1573],256],65274:[[1604,1573],256],65275:[[1604,1575],256],65276:[[1604,1575],256]},
65280:{65281:[[33],256],65282:[[34],256],65283:[[35],256],65284:[[36],256],65285:[[37],256],65286:[[38],256],65287:[[39],256],65288:[[40],256],65289:[[41],256],65290:[[42],256],65291:[[43],256],65292:[[44],256],65293:[[45],256],65294:[[46],256],65295:[[47],256],65296:[[48],256],65297:[[49],256],65298:[[50],256],65299:[[51],256],65300:[[52],256],65301:[[53],256],65302:[[54],256],65303:[[55],256],65304:[[56],256],65305:[[57],256],65306:[[58],256],65307:[[59],256],65308:[[60],256],65309:[[61],256],65310:[[62],256],65311:[[63],256],65312:[[64],256],65313:[[65],256],65314:[[66],256],65315:[[67],256],65316:[[68],256],65317:[[69],256],65318:[[70],256],65319:[[71],256],65320:[[72],256],65321:[[73],256],65322:[[74],256],65323:[[75],256],65324:[[76],256],65325:[[77],256],65326:[[78],256],65327:[[79],256],65328:[[80],256],65329:[[81],256],65330:[[82],256],65331:[[83],256],65332:[[84],256],65333:[[85],256],65334:[[86],256],65335:[[87],256],65336:[[88],256],65337:[[89],256],65338:[[90],256],65339:[[91],256],65340:[[92],256],65341:[[93],256],65342:[[94],256],65343:[[95],256],65344:[[96],256],65345:[[97],256],65346:[[98],256],65347:[[99],256],65348:[[100],256],65349:[[101],256],65350:[[102],256],65351:[[103],256],65352:[[104],256],65353:[[105],256],65354:[[106],256],65355:[[107],256],65356:[[108],256],65357:[[109],256],65358:[[110],256],65359:[[111],256],65360:[[112],256],65361:[[113],256],65362:[[114],256],65363:[[115],256],65364:[[116],256],65365:[[117],256],65366:[[118],256],65367:[[119],256],65368:[[120],256],65369:[[121],256],65370:[[122],256],65371:[[123],256],65372:[[124],256],65373:[[125],256],65374:[[126],256],65375:[[10629],256],65376:[[10630],256],65377:[[12290],256],65378:[[12300],256],65379:[[12301],256],65380:[[12289],256],65381:[[12539],256],65382:[[12530],256],65383:[[12449],256],65384:[[12451],256],65385:[[12453],256],65386:[[12455],256],65387:[[12457],256],65388:[[12515],256],65389:[[12517],256],65390:[[12519],256],65391:[[12483],256],65392:[[12540],256],65393:[[12450],256],65394:[[12452],256],65395:[[12454],256],65396:[[12456],256],65397:[[12458],256],65398:[[12459],256],65399:[[12461],256],65400:[[12463],256],65401:[[12465],256],65402:[[12467],256],65403:[[12469],256],65404:[[12471],256],65405:[[12473],256],65406:[[12475],256],65407:[[12477],256],65408:[[12479],256],65409:[[12481],256],65410:[[12484],256],65411:[[12486],256],65412:[[12488],256],65413:[[12490],256],65414:[[12491],256],65415:[[12492],256],65416:[[12493],256],65417:[[12494],256],65418:[[12495],256],65419:[[12498],256],65420:[[12501],256],65421:[[12504],256],65422:[[12507],256],65423:[[12510],256],65424:[[12511],256],65425:[[12512],256],65426:[[12513],256],65427:[[12514],256],65428:[[12516],256],65429:[[12518],256],65430:[[12520],256],65431:[[12521],256],65432:[[12522],256],65433:[[12523],256],65434:[[12524],256],65435:[[12525],256],65436:[[12527],256],65437:[[12531],256],65438:[[12441],256],65439:[[12442],256],65440:[[12644],256],65441:[[12593],256],65442:[[12594],256],65443:[[12595],256],65444:[[12596],256],65445:[[12597],256],65446:[[12598],256],65447:[[12599],256],65448:[[12600],256],65449:[[12601],256],65450:[[12602],256],65451:[[12603],256],65452:[[12604],256],65453:[[12605],256],65454:[[12606],256],65455:[[12607],256],65456:[[12608],256],65457:[[12609],256],65458:[[12610],256],65459:[[12611],256],65460:[[12612],256],65461:[[12613],256],65462:[[12614],256],65463:[[12615],256],65464:[[12616],256],65465:[[12617],256],65466:[[12618],256],65467:[[12619],256],65468:[[12620],256],65469:[[12621],256],65470:[[12622],256],65474:[[12623],256],65475:[[12624],256],65476:[[12625],256],65477:[[12626],256],65478:[[12627],256],65479:[[12628],256],65482:[[12629],256],65483:[[12630],256],65484:[[12631],256],65485:[[12632],256],65486:[[12633],256],65487:[[12634],256],65490:[[12635],256],65491:[[12636],256],65492:[[12637],256],65493:[[12638],256],65494:[[12639],256],65495:[[12640],256],65498:[[12641],256],65499:[[12642],256],65500:[[12643],256],65504:[[162],256],65505:[[163],256],65506:[[172],256],65507:[[175],256],65508:[[166],256],65509:[[165],256],65510:[[8361],256],65512:[[9474],256],65513:[[8592],256],65514:[[8593],256],65515:[[8594],256],65516:[[8595],256],65517:[[9632],256],65518:[[9675],256]}

};

   /***** Module to export */
   var unorm = {
      nfc: nfc,
      nfd: nfd,
      nfkc: nfkc,
      nfkd: nfkd
   };

   /*globals module:true,define:true*/

   // CommonJS
   if (typeof module === "object") {
      module.exports = unorm;

   // AMD
   } else if (typeof define === "function" && define.amd) {
      define("unorm", function () {
         return unorm;
      });

   // Global
   } else {
      root.unorm = unorm;
   }

   /***** Export as shim for String::normalize method *****/
   /*
      http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts#november_8_2013_draft_rev_21

      21.1.3.12 String.prototype.normalize(form="NFC")
      When the normalize method is called with one argument form, the following steps are taken:

      1. Let O be CheckObjectCoercible(this value).
      2. Let S be ToString(O).
      3. ReturnIfAbrupt(S).
      4. If form is not provided or undefined let form be "NFC".
      5. Let f be ToString(form).
      6. ReturnIfAbrupt(f).
      7. If f is not one of "NFC", "NFD", "NFKC", or "NFKD", then throw a RangeError Exception.
      8. Let ns be the String value is the result of normalizing S into the normalization form named by f as specified in Unicode Standard Annex #15, UnicodeNormalizatoin Forms.
      9. Return ns.

      The length property of the normalize method is 0.

      *NOTE* The normalize function is intentionally generic; it does not require that its this value be a String object. Therefore it can be transferred to other kinds of objects for use as a method.
   */
    unorm.shimApplied = false;

   if (!String.prototype.normalize) {
      Object.defineProperty(String.prototype, "normalize", {
         enumerable: false,
         configurable: true,
         writable: true,
         value: function(form) {
            var str = "" + this;
            form =  form === undefined ? "NFC" : form;
            
            if (form === "NFC") {
               return unorm.nfc(str);
            } else if (form === "NFD") {
               return unorm.nfd(str);
            } else if (form === "NFKC") {
               return unorm.nfkc(str);
            } else if (form === "NFKD") {
               return unorm.nfkd(str);
            } else {
               throw new RangeError("Invalid normalization form: " + form);
            }
         }
      });

      unorm.shimApplied = true;
   }
}(this));

},{}],63:[function(require,module,exports){
(function (Buffer){(function (){
const bip39 = require("bip39");
const sha256 = require('js-sha256');

class RNG {
    constructor(seed) {
        if(bip39.validateMnemonic(seed)) {
            seed = bip39.mnemonicToSeedHex(seed);
        } else {
            seed = sha256(seed);
        }
        this.seed = seed;
        this.rng = this.sfc32();
    }

    xmur3() {
        for(var i = 0, h = 1779033703 ^ this.seed.length; i < this.seed.length; i++) {
            h = Math.imul(h ^ this.seed.charCodeAt(i), 3432918353);
            h = h << 13 | h >>> 19;
        }
        
        
        return function() {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h ^= h >>> 16) >>> 0;
        }       
    }

    sfc32() {
        let seed = this.xmur3();
        let a = seed();
        let b = seed();
        let c = seed();
        let d = seed();
        return function() {
          a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
          var t = (a + b) | 0;
          a = b ^ b >>> 9;
          b = c + (c << 3) | 0;
          c = (c << 21 | c >>> 11);
          d = d + 1 | 0;
          t = t + d | 0;
          c = c + t | 0;
          return (t >>> 0) / 4294967296;
        }       
    }

    dec2Hex(dec) {
        return ('0' + dec.toString(16)).substr(-2)
    }

    random() {
        return this.rng();
    }

    randomRange(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }

    randomValues(array) {
        for(var i=0;i<array.length;i++) {
            array[i] = this.randomRange(0, 255);
        }
        return array
    }

    randomBytes(size) {
        var buffer = Buffer.allocUnsafe(size);
        buffer = this.randomValues(buffer)
        return buffer;
    }

    nextBytes(array) {
        return this.randomValues(array);
    }
}

module.exports = RNG;
}).call(this)}).call(this,require("buffer").Buffer)
},{"bip39":28,"buffer":3,"js-sha256":42}],64:[function(require,module,exports){
const RNG = require("./rng");
const asn1 = require("jsrsasign").asn1;
const BigInteger = require('jsbn').BigInteger;

class RSAKey {

    constructor(seed) {
        this.n = null;
        this.e = 0;
        this.d = null;
        this.p = null;
        this.q = null;
        this.dmp1 = null;
        this.dmq1 = null;
        this.coeff = null;
        this.seed = seed;
        this.rng = new RNG(seed);
    }


    async _getRandomBN(length) {
        const self = this;
        return new Promise(function(resolve, reject) {
            try {
                let num = new BigInteger(length, 1, self.rng)
                resolve(num)
            } catch(e) {
                reject(e)
            }
        })


    }

    async _isValid(num, exponent) {
        return new Promise(function(resolve, reject) {
            try {
                resolve(num.subtract(BigInteger.ONE).gcd(exponent).compareTo(BigInteger.ONE) == 0 && num.isProbablePrime(10))

            } catch(e) {
                reject(e)
            }
        })
    }

    async _getPrime(length,exponent) {
        const self = this;
        return new Promise(async function(resolve, reject) {
            try {
                let valid = false;
                let num;
                while(!valid) {
                    num = await self._getRandomBN(length, exponent)
                    valid = await self._isValid(num, exponent)
                }
                resolve(num);


            } catch(e) {
                reject(e)
            }
        })
                
    }


    async generate(B, E) {

        const self = this;
        return new Promise(async function(resolve, reject) {

            try {
                //key size
                B = B || 2048
                //exponent
                E = E || "65537"
                const qs = B >> 1
                self.e = parseInt(E, 16)
                const exponent = new BigInteger(E, 16);

                let valid = false;

                while(!valid) {
                    self.p = await self._getPrime(B-qs, exponent)
                    self.q = await self._getPrime(qs, exponent)
                    
                    if(self.p.compareTo(self.q) <= 0) {
                        //swap values
                        let t = self.p
                        self.p = self.q
                        self.q = t
                    }

                    let p1 = self.p.subtract(BigInteger.ONE);
                    let q1 = self.q.subtract(BigInteger.ONE);
                    let phi = p1.multiply(q1);

                    if(phi.gcd(exponent).compareTo(BigInteger.ONE) == 0) {
                        self.n = self.p.multiply(self.q);
                        self.d = exponent.modInverse(phi);
                        self.dmp1 = self.d.mod(p1);
                        self.dmq1 = self.d.mod(q1);
                        self.coeff = self.q.modInverse(self.p);
                        valid = true;
                    }
                }

                let key = {}
                key.privateKey = await self.privateKey();
                key.publicKey = await self.publicKey();
                resolve(key);
                    
            } catch(error) {
                reject(error);
            }
                
        })
        

    }


    async privateBaseKey() {
        const self = this
        return new Promise(async function(resolve, reject) {
            try {
                const options = {
                    array: [
                        new asn1.DERInteger({int: 0}),
                        new asn1.DERInteger({bigint: self.n}),
                        new asn1.DERInteger({int: self.e}),
                        new asn1.DERInteger({bigint: self.d}),
                        new asn1.DERInteger({bigint: self.p}),
                        new asn1.DERInteger({bigint: self.q}),
                        new asn1.DERInteger({bigint: self.dmp1}),
                        new asn1.DERInteger({bigint: self.dmq1}),
                        new asn1.DERInteger({bigint: self.coeff})
                    ]
                };
                const seq = new asn1.DERSequence(options);
                resolve(seq.getEncodedHex());

            } catch(e) {
                reject(e);
            }
        })
                
    }

    async privateKey() {
        const self = this;
        return new Promise(async function(resolve, reject) {
            try {
                let basekey = await self.privateBaseKey()
                let key = asn1.ASN1Util.getPEMStringFromHex(basekey.toString("hex"),'RSA PRIVATE KEY')
                resolve(key)
            } catch(e) {
                reject(e);
            }
        })
        return 
    }

    async publicBaseKey() {
        const self = this;
        return new Promise(async function(resolve, reject) {
            try {
                const first_sequence = new asn1.DERSequence({
                    array: [
                        new asn1.DERObjectIdentifier({oid: "1.2.840.113549.1.1.1"}), // RSA Encryption pkcs #1 oid
                        new asn1.DERNull()
                    ]
                });

                const second_sequence = new asn1.DERSequence({
                    array: [
                        new asn1.DERInteger({bigint: self.n}),
                        new asn1.DERInteger({int: self.e})
                    ]
                });

                const bit_string = new asn1.DERBitString({
                    hex: "00" + second_sequence.getEncodedHex()
                });

                const seq = new asn1.DERSequence({
                    array: [
                        first_sequence,
                        bit_string
                    ]
                });
                let basekey = seq.getEncodedHex()
                resolve(basekey);
            } catch(e) {
                reject(e);
            }
        })
                
    }

    async publicKey() {
        const self = this;
        return new Promise(async function(resolve, reject) {
            try {
                let basekey = await self.publicBaseKey();
                let key = asn1.ASN1Util.getPEMStringFromHex(basekey.toString("hex"),'PUBLIC KEY')
                resolve(key)
            } catch(e) {
                reject(e);
            }
        })
    }
}



module.exports = RSAKey;


},{"./rng":63,"jsbn":43,"jsrsasign":44}]},{},[27])(27)
});
