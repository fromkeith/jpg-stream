var jpeg = require('./build/jpeg');
var Decoder = jpeg.JPEGDecoder;
var util = require('util');
var Transform = require('stream').Transform;
var exif = require('exif-reader');

function JPEGDecoder(opts) {
  Transform.call(this);
  this.decoder = new Decoder();
  
  if (opts && opts.width && opts.height)
    this.decoder.setDesiredSize(opts.width, opts.height);
    
  var self = this;
  self.decoderCallback = new jpeg.JsEventCallback();
  self.decoderCallback.progress = function progresFunc(typePtr, ptr, len) {
    var type = jpeg.Pointer_stringify(typePtr);
      //console.log('progress:', type, ptr, len);
      switch (type) {
        
          
        case 'exif':
          var buf = new Buffer(jpeg.HEAPU8.subarray(ptr, ptr + len));
          self.emit('meta', exif(buf));
          break;
          
        case 'scanline':
          var buf = new Buffer(jpeg.HEAPU8.subarray(ptr, ptr + len));
          self.push(buf);
          break;
          
        case 'end':
          self.push(null);
          break;
      }
    };
  self.decoderCallback.message = function messageFunc(typePtr, msgPtr) {
      var type = jpeg.Pointer_stringify(typePtr);
      var msg = jpeg.Pointer_stringify(msgPtr);
      //console.log('message:', type, msg);
      switch (type) {
        case 'error':
          jpeg.destroy(self.decoder);
          jpeg.destroy(self.decoderCallback);
          self.emit('error', new Error(msg));
          break;
        case 'outputSize':
          self.format = {
            width: self.decoder.getWidth(),
            height: self.decoder.getHeight(),
            colorSpace: self.decoder.getColorSpace()
          };
          console.log('colorSpace', self.format.colorSpace);
          self.emit('format', self.format);
          break;
      }
    };
  this.decoder.setCallback(self.decoderCallback);
}

util.inherits(JPEGDecoder, Transform);

JPEGDecoder.probe = function(buf) {
  return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
};

JPEGDecoder.prototype._transform = function(data, encoding, done) {
  var buf = data instanceof Uint8Array ? data : new Uint8Array(data);

  var nativeBuf = jpeg._malloc(buf.byteLength*buf.BYTES_PER_ELEMENT);
  jpeg.HEAPU8.set(buf, nativeBuf);
  var res = this.decoder.decode(nativeBuf, buf.byteLength)
  jpeg._free(nativeBuf);

  done();
};

JPEGDecoder.prototype._flush = function(done) {
  jpeg.destroy(this.decoder);
  jpeg.destroy(this.decoderCallback);
  done();
};

module.exports = JPEGDecoder;
