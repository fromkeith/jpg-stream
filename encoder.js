var jpeg = require('./build/jpeg');
var Encoder = jpeg.JPEGEncoder;
var util = require('util');
var PixelStream = require('pixel-stream');

function JPEGEncoder(width, height, opts) {
  PixelStream.apply(this, arguments);
  if (typeof width === 'object') {
    opts = width;
    width = undefined;
    height = undefined;
  }

  this.encoderOpts = {
    quality: (opts ? opts.quality : 100),
    width: width || (opts ? opts.width : undefined),
    height: height || (opts ? opts.height : undefined)
  };

  this.encoder = new Encoder();
  this.ended = false;

  var self = this;
  self.encoderCallback = new jpeg.JsEventCallback();
  self.encoderCallback.progress = function(typePtr, ptr, len) {
    var type = jpeg.Pointer_stringify(typePtr);
    switch (type) {
      case 'data':
        self.push(new Buffer(jpeg.HEAPU8.subarray(ptr, ptr + len)));
        break;
    }
  };
  self.encoderCallback.message = function (typePtr, msgPtr) {
      var type = jpeg.Pointer_stringify(typePtr);
      var msg = jpeg.Pointer_stringify(msgPtr);
      switch (type) {
        case 'error':
          self.ended = true;
          jpeg.destroy(self.encoder);
          jpeg.destroy(self.encoderCallback);
          self.emit('error', new Error(msg));
          break;
      }
  };
  this.encoder.setCallback(self.encoderCallback);
}

util.inherits(JPEGEncoder, PixelStream);

JPEGEncoder.prototype.supportedColorSpaces = ['rgb', 'gray', 'cmyk'];

JPEGEncoder.prototype._start = function(done) {
  this.encoder.setWidth(this.encoderOpts.width || this.format.width);
  this.encoder.setHeight(this.encoderOpts.height || this.format.height);
  this.encoder.setColorSpace(this.encoderOpts.colorSpace || this.format.colorSpace);
  this.encoder.setQuality(this.encoderOpts.quality || this.format.quality || 100);
  done();
};

JPEGEncoder.prototype._writePixels = function(data, done) {
  if (!this.ended) {
    var buf = data instanceof Uint8Array ? data : new Uint8Array(data);

    var nativeBuf = jpeg._malloc(buf.byteLength*buf.BYTES_PER_ELEMENT);
    jpeg.HEAPU8.set(buf, nativeBuf);
    var res = this.encoder.encode(nativeBuf, buf.byteLength)
    jpeg._free(nativeBuf);
  }
  done();
};

JPEGEncoder.prototype._endFrame = function(done) {
  if (!this.ended) {
    this.ended = true;
    this.encoder.end();
    jpeg.destroy(this.encoder);
    jpeg.destroy(this.encoderCallback);
  }
  done();
};

module.exports = JPEGEncoder;
