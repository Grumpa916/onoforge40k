# Deployment Inline Handler Removal Plan

Purpose: document the bounded removal of obsolete inline deployment interaction handlers after `deployment-interaction.js` became the sole deployment interaction owner.

The full `index.html` must be processed in GitHub Actions because it exceeds the normal contents retrieval limit. The removal must be performed by an automated repository workflow against the committed branch source, followed by the deployment boundary audit and regression suite.

Safety requirements:
- Do not alter battlefield geometry.
- Do not alter deployment state semantics.
- Do not remove unrelated application listeners.
- Preserve the protected gameplay checkpoint.
- Require CI evidence that the targeted inline handlers are gone and the deployment interaction module remains present.

This plan is temporary implementation documentation and should be removed after the bounded migration is completed and recorded in the next meaningful save point.
