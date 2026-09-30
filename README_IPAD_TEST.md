# iPad Test 2 Harness

This test-only branch is based on verified commit `69c8e8d2b37a88e7de93515c5eefb783ac00193b`.

`ipad-test.html` loads the branch's current `index.html` and the existing opponent-turn resolver render bridge, then mounts the combined page locally in the browser. It does not modify the combat engine, Action Log, Combat History, or canonical roster state.

Purpose: reproduce the verified Test 2 resolver entry path in an iPad-friendly HTML page before making any production-code change.

Do not merge this branch or deploy it.