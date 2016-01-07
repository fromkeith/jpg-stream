all: build/jpeg.js

jpeg-9a/.libs/libjpeg.dylib: jpegsrc.v9a.tar
	tar -xvf jpegsrc.v9a.tar
	cd jpeg-9a && emconfigure ./configure && emmake make
	
build/jpeg.js: jpeg-9a/.libs/libjpeg.dylib src/*.h src/*.cc
	mkdir -p build/
	python $(EMSCRIPTEN)/tools/webidl_binder.py src/jpeg-9a.idl src/glue
	emcc --memory-init-file 0 \
			 -Ijpeg-9a/ \
			 -s NO_FILESYSTEM=1 \
			 -s NO_BROWSER=1 \
			 -s DISABLE_EXCEPTION_CATCHING=1 \
			 -s PRECISE_I64_MATH=0 \
			 -s TOTAL_MEMORY=33554432 \
                         -s NO_DYNAMIC_EXECUTION=1 \
                         -s EXPORTED_RUNTIME_METHODS=[] \
			 -O3 jpeg-9a/.libs/libjpeg.so src/*.cc -o build/jpeg.js \
                         -std=c++11 --post-js src/glue.js
	echo "module.exports = Module;" >> build/jpeg.js

clean:
	rm -rf jpeg-9a/ build/