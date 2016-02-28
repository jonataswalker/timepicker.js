ROOT_DIR	:= $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
NOW		:= $(shell date --iso=seconds)
SRC_DIR 	:= $(ROOT_DIR)/src
BUILD_DIR 	:= $(ROOT_DIR)/build
JS_DEBUG 	:= $(BUILD_DIR)/timepicker.js
JS_FINAL 	:= $(BUILD_DIR)/timepicker.min.js
CSS_COMBINED 	:= $(BUILD_DIR)/timepicker.css
CSS_FINAL 	:= $(BUILD_DIR)/timepicker.min.css
TMPFILE 	:= $(BUILD_DIR)/tmp
PACKAGE_JSON 	:= $(ROOT_DIR)/package.json

LAST_VERSION	:= $(shell cat $(PACKAGE_JSON) | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin').toString()).version")

DESCRIPTION	:= $(shell cat $(PACKAGE_JSON) | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin').toString()).description")

JS_FILES 	:= $(SRC_DIR)/wrapper-head.js \
		   $(SRC_DIR)/base.js \
		   $(SRC_DIR)/internal.js \
		   $(SRC_DIR)/html.js \
		   $(SRC_DIR)/drag.js \
		   $(SRC_DIR)/utils.js \
		   $(SRC_DIR)/wrapper-tail.js

CSS_FILES 	:= $(SRC_DIR)/timepicker.css

CLEANCSS 	:= ./node_modules/.bin/cleancss
CLEANCSSFLAGS 	:= --skip-restructuring
POSTCSS 	:= ./node_modules/.bin/postcss
POSTCSSFLAGS 	:= --use autoprefixer -b "last 3 versions, ie >= 9"
JSHINT 		:= ./node_modules/.bin/jshint
UGLIFYJS 	:= ./node_modules/.bin/uglifyjs
UGLIFYJSFLAGS 	:= --mangle --mangle-regex --screw-ie8 --lint -c warnings=false
JS_BEAUTIFY	:= ./node_modules/.bin/js-beautify
BEAUTIFYFLAGS 	:= -f - --indent-size 2 --preserve-newlines
NODEMON 	:= ./node_modules/.bin/nodemon
PARALLELSHELL 	:= ./node_modules/.bin/parallelshell

# just to create variables like NODEMON_JS_FLAGS when called
define NodemonFlags
	UP_LANG = $(shell echo $(1) | tr '[:lower:]' '[:upper:]')
	NODEMON_$$(UP_LANG)_FLAGS := --on-change-only --watch "$(SRC_DIR)" --ext "$(1)" --exec "make build-$(1)"
endef

define HEADER
// $(DESCRIPTION)
// https://github.com/jonataswalker/timepicker.js
// Version: v$(LAST_VERSION)
// Built: $(NOW)

endef
export HEADER

# targets
build-watch: build watch

watch:
	$(PARALLELSHELL) "make watch-js" "make watch-css"

build: build-js build-css

build-js: combine-js jshint uglifyjs addheader
	@echo `date +'%H:%M:%S'` "Build JS ... OK"

build-css: combine-css cleancss
	@echo `date +'%H:%M:%S'` "Build CSS ... OK"

uglifyjs:
	@$(UGLIFYJS) $(JS_DEBUG) $(UGLIFYJSFLAGS) > $(JS_FINAL)

jshint:
	@$(JSHINT) $(JS_DEBUG)

addheader-debug:
	@echo "$$HEADER" | cat - $(JS_DEBUG) > $(TMPFILE) && mv $(TMPFILE) $(JS_DEBUG)

addheader-min:
	@echo "$$HEADER" | cat - $(JS_FINAL) > $(TMPFILE) && mv $(TMPFILE) $(JS_FINAL)

addheader: addheader-debug addheader-min

cleancss:
	@cat $(CSS_COMBINED) | $(CLEANCSS) $(CLEANCSSFLAGS) > $(CSS_FINAL)

combine-js:
	@cat $(JS_FILES) | $(JS_BEAUTIFY) $(BEAUTIFYFLAGS) > $(JS_DEBUG)

combine-css:
	@cat $(CSS_FILES) | $(POSTCSS) $(POSTCSSFLAGS) > $(CSS_COMBINED)

watch-js: $(JS_FILES)
	$(eval $(call NodemonFlags,js))
	@$(NODEMON) $(NODEMON_JS_FLAGS)

watch-css: $(CSS_FILES)
	$(eval $(call NodemonFlags,css))
	@$(NODEMON) $(NODEMON_CSS_FLAGS)
	
.DEFAULT_GOAL := build
