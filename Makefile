# MarkdownOps — repo-level Makefile.
# Iterates the per-connector npm projects under mcp-servers/.

SERVERS := github gitlab jira linear notion asana

.PHONY: help install build test clean \
	$(addprefix install-,$(SERVERS)) \
	$(addprefix build-,$(SERVERS)) \
	$(addprefix test-,$(SERVERS)) \
	$(addprefix clean-,$(SERVERS))

help:
	@echo "MarkdownOps — make targets"
	@echo ""
	@echo "  make install            install + build every MCP server"
	@echo "  make build              run npm run build in every server"
	@echo "  make test               run npm test in every server"
	@echo "  make clean              remove node_modules and dist from every server"
	@echo ""
	@echo "Per-server targets (replace <s> with one of: $(SERVERS)):"
	@echo "  make install-<s>        e.g. make install-github"
	@echo "  make build-<s>"
	@echo "  make test-<s>"
	@echo "  make clean-<s>"
	@echo ""
	@echo "Run a server (after install):"
	@echo "  node mcp-servers/<s>/dist/index.js"

install: $(addprefix install-,$(SERVERS))
build:   $(addprefix build-,$(SERVERS))
test:    $(addprefix test-,$(SERVERS))
clean:   $(addprefix clean-,$(SERVERS))

install-%:
	@echo "==> install mcp-servers/$*"
	cd mcp-servers/$* && npm install --no-audit --no-fund && npm run build

build-%:
	@echo "==> build mcp-servers/$*"
	cd mcp-servers/$* && npm run build

test-%:
	@echo "==> test mcp-servers/$*"
	cd mcp-servers/$* && npm test

clean-%:
	@echo "==> clean mcp-servers/$*"
	rm -rf mcp-servers/$*/node_modules mcp-servers/$*/dist
