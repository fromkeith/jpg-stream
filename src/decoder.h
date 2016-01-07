#ifndef JPEGDECODER_H
#define JPEGDECODER_H

extern "C" {
#include <stdio.h>
#include <jpeglib.h>
}

#include <vector>
#include <string>

#include "callback.h"



enum JPEGState {
  JPEG_HEADER,
  JPEG_START_DECOMPRESS,
  JPEG_DECOMPRESS,
  JPEG_DONE,
  JPEG_ERROR
};


class JPEGDecoder {
public:

  JPEGDecoder();
  ~JPEGDecoder();

  void setDesiredSize(int dw, int dh) {
    desiredWidth = dw;
    desiredHeight = dh;
  }
  void skipBytes(long numBytes);
  bool decode(void *buffer, size_t length);

  
  int getWidth() const {
    return outputWidth;
  }
  
  int getHeight() const {
    return outputHeight;
  }
  
  EventCallback* getCallback() const {
    return callback;
  }
  
  void setCallback(EventCallback* cb) {
    callback = cb;
  }
  
  const char * getColorSpace() const {    
    switch (dec.out_color_space) {
      case JCS_RGB:
        return "rgb";
      case JCS_GRAYSCALE:
        return "gray";
      case JCS_CMYK:
        return "cmyk";
      default:
        return "rgb";
    }
  }
  
  void error(char *message);
    
private:
  bool readHeader();
  bool startDecompress();
  void findExif();
  bool decompress();
  
  jpeg_error_mgr err;
  jpeg_decompress_struct dec;
  JPEGState state;
  int imageWidth, imageHeight;
  int desiredWidth, desiredHeight;
  int outputWidth, outputHeight;
  uint8_t *output;
  int bytesToSkip;
  std::vector<uint8_t> data;
  EventCallback* callback;
};

#endif
