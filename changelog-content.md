### New Features
- Add ProjectRef type to RunInput for better project reference handling
- Add automated release workflow with pull request validation and auto-merge capabilities

### Improvements
- Enhance PR validation with in-progress status comments
- Standardize release PR body format to match desktop application style
- Align PR validation comment format with desktop/CLI style consistency

### Bug Fixes
- Fix release gate pattern handling for squash merge operations
- Remove [skip ci] directive from release preparation commits
