#ifndef EVENT_CALLBACK_H
#define EVENT_CALLBACK_H

class EventCallback {
public:
  virtual ~EventCallback() {};
  virtual void progress(const char* msyType, unsigned int output, unsigned int bufSize) = 0;
  virtual void message(const char* msgType, const char* msg) = 0;
};

#endif

