# Paths
build := typescript/tsconfig.build.json
dev := typescript/tsconfig.dev.json

dbPath := F:/db/

# NPX functions
ifeq ($(OS), Windows_NT)
	tsc := .\node_modules\.bin\tsc
else
	tsc := node_modules/.bin/tsc
endif
mocha := node_modules/.bin/mocha

main: dev

dev:
	@echo "[INFO] Building for development"
	@$(tsc) --p $(dev)

build:
	@echo "[INFO] Building for production"
	@$(tsc) --p $(build)

run: dev
	@NODE_ENV=development \
	node dist/index.js

prepare: dev
	@node dist/prepare.js

host:
	@mongod --dbpath $(dbPath)
	
tests:
	@echo "[INFO] Testing with Mocha"
	@NODE_ENV=test $(mocha)

cov:
	@echo "[INFO] Testing with Nyc and Mocha"
	@NODE_ENV=test \
	nyc $(mocha)

install:
	@echo "[INFO] Installing dev Dependencies"
	@yarn install --production=false

install-prod:
	@echo "[INFO] Installing Dependencies"
	@yarn install --production=true

clean:
ifeq ($(OS), Windows_NT)
	@echo "[INFO] Skipping"
else
	@echo "[INFO] Cleaning dist files"
	@rm -rf dist
	@rm -rf .nyc_output
	@rm -rf coverage
endif

publish: install build
	@echo "[INFO] Publishing package"
	@npm publish --access=public
