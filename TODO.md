# TODO for Fixing Errors in home.html and home.css

## Previous Steps (Completed):
- [x] Step 1: Edit home.html to change id="repoUrl" to id="repoInput" to match CSS styles.
- [x] Step 2: Edit home.html to remove the unnecessary outer <section class="hero-section"> and adjust the inner <section class="hero">.
- [x] Step 3: Edit home.html to wrap the input (#repoInput) and <button id="generateBtn"> in a <div class="input-button-group"> inside .hero for proper alignment.
- [x] Step 4: Verify changes by relaunching the browser and checking for resolved issues (ID mismatch, layout alignment).
- [x] Step 5: Update TODO.md to mark completed steps.

## Additional Steps for Accessibility Fixes (Completed):
- [x] Add aria-label to hamburger button.
- [x] Add aria-label to close button.
- [x] Add placeholder and aria-labelledby to readmeEditor textarea.
- [x] Add aria-labelledby and role to readmePreview div.

## Task Completion (Previous):
All errors in home.html have been fixed: structural issues resolved, accessibility improved, and layout verified via browser render with no console errors.

## New Steps for home.css Fixes (Based on User Feedback):
- [ ] Step 1: Update .input-button-group in home.css to add justify-content: center; and width: 100%; for centering the repo input and button in the hero section.
- [ ] Step 2: Adjust #repoInput styles in home.css to increase max-width to 80% (or 500px) for a longer width, and ensure consistent padding.
- [ ] Step 3: Add mobile media query (max-width: 600px) adjustments to .input-button-group for flex-direction: column; and full-width input stacking.
- [ ] Step 4: Verify changes by relaunching the browser and checking repo input width, centering, and mobile responsiveness.
- [ ] Step 5: Update TODO.md to mark completed steps.
