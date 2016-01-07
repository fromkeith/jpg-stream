
#ifndef JPEGENCODER_H
#define JPEGENCODER_H

extern "C" {
#include <stdio.h>
#include <jpeglib.h>
}

#include <vector>
#include <string>

//#include <emscripten/val.h>
//#include <emscripten/bind.h>

#include "callback.h"

//using namespace emscripten;

class JPEGEncoder {
public:
  JPEGEncoder();
  ~JPEGEncoder();
  

  void encode(void *buffer, size_t length);
  void emptyOutput();
  void end();
  
  int getWidth() const {
    return enc.image_width;
  }
  
  void setWidth(int w) {
    enc.image_width = w;
  }
  
  int getHeight() const {
    return enc.image_height;
  }
  
  void setHeight(int h) {
    enc.image_height = h;
  }
  
  int getQuality() const {
    return quality;
  }
  
  void setQuality(int q) {
    quality = q;
  }
  
  const char * getColorSpace() const {
    switch (enc.in_color_space) {
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
 
  void setColorSpace(std::string cs) {
    if (cs.compare("gray") == 0) {
      enc.input_components = 1;
      enc.in_color_space = JCS_GRAYSCALE;
    } else if (cs.compare("cmyk") == 0) {
      enc.input_components = 4;
      enc.in_color_space = JCS_CMYK;
    } else {
      enc.input_components = 3;
      enc.in_color_space = JCS_RGB;
    }
    
    scanlineLength = enc.image_width * enc.input_components;
  }
  
  EventCallback * getCallback() const {
    return callback;
  }

  void setCallback(EventCallback *cb) {
    callback = cb;
  }
  
  void error(char *message);

private:
  struct jpeg_compress_struct enc;
  struct jpeg_error_mgr err;
    
  int quality;
  std::string colorSpace;
  EventCallback *callback;
  bool decoding;
  int scanlineLength;
  std::vector<uint8_t> buf;
  uint8_t *output;
};


#endif
