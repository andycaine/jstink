VERSION := $(shell jq -r '.version' package.json)

tag:
	@if ! git rev-parse "v$(VERSION)" >/dev/null 2>&1; then \
        git tag -a v$(VERSION) -m "Release $(VERSION)"; \
    fi

release: tag
	git push origin v$(VERSION)
