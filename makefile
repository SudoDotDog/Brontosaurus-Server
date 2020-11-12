# Paths
build := typescript/tsconfig.build.json
dev := typescript/tsconfig.dev.json

# NPX functions
tsc := node_modules/.bin/tsc
mocha := node_modules/.bin/mocha
eslint := node_modules/.bin/eslint

.IGNORE: clean-linux

main: run

dev:
	@echo "[INFO] Building for development"
	@NODE_ENV=development $(tsc) --p $(dev)

build: clean-linux
	@echo "[INFO] Building for production"
	@NODE_ENV=production $(tsc) --p $(build)

run: dev
	@NODE_ENV=development \
	BRONTOSAURUS_DB=$(DB) \
	node dist/index.js

p-run: dev
	@NODE_ENV=production \
	node dist/index.js

prepare: dev
	@NODE_ENV=development \
	BRONTOSAURUS_DB=$(DB) \
	node dist/prepare.js

tests:
	@echo "[INFO] Testing with Mocha"
	@NODE_ENV=test \
	$(mocha) --config test/.mocharc.json

cov:
	@echo "[INFO] Testing with Nyc and Mocha"
	@NODE_ENV=test \
	nyc $(mocha) --config test/.mocharc.json

lint:
	@echo "[INFO] Linting"
	@NODE_ENV=production \
	$(eslint) . --ext .ts,.tsx \
	--config ./typescript/.eslintrc.json

lint-fix:
	@echo "[INFO] Linting and Fixing"
	@NODE_ENV=development \
	$(eslint) . --ext .ts,.tsx \
	--config ./typescript/.eslintrc.json --fix

install:
	@echo "[INFO] Installing Development Dependencies"
	@yarn install --production=false

install-prod:
	@echo "[INFO] Installing Production Dependencies"
	@yarn install --production=true

outdated: install
	@echo "[INFO] Checking Outdated Dependencies"
	@yarn outdated

clean-linux:
	@echo "[INFO] Cleaning dist files"
	@rm -rf dist
	@rm -rf .nyc_output
	@rm -rf coverage
