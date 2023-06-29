# syntax=docker/dockerfile:1
FROM golang

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
    apt-get install -y wget build-essential pkg-config --no-install-recommends

# Install ImageMagick deps
RUN apt-get -q -y install libjpeg-dev libpng-dev libtiff-dev \
    libgif-dev libx11-dev ghostscript --no-install-recommends

ENV IMAGEMAGICK_VERSION=6.9.10-11
ENV CGO_CFLAGS_ALLOW='-Xpreprocessor'

RUN cd && \
	wget https://github.com/ImageMagick/ImageMagick6/archive/${IMAGEMAGICK_VERSION}.tar.gz && \
	tar xvzf ${IMAGEMAGICK_VERSION}.tar.gz && \
	cd ImageMagick* && \
	./configure \
	    --without-magick-plus-plus \
	    --without-perl \
	    --disable-openmp \
	    --with-gvc=no \
	    --disable-docs && \
	make -j$(nproc) && make install && \
	ldconfig /usr/local/lib

RUN go version
RUN pkg-config --cflags --libs MagickWand

WORKDIR /app
COPY ./ ./

RUN go mod download
RUN go build -o crm ./cmd/main.go
RUN chmod 777 crm

CMD ["./crm"]