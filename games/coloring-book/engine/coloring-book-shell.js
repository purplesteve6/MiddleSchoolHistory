/* ============================================================
   Middle School History Coloring Book — Shared Application Shell
   All coloring pages use this same interface. Page-specific
   title/artwork comes from that page's ./config.js.
   ============================================================ */

(function () {
  "use strict";

  const CFG = window.COLORING_BOOK_CONFIG || {};
  const host = document.getElementById("coloringBookShell");
  if (!host) throw new Error("Missing #coloringBookShell host.");

  const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const safeTitle = escapeHtml(CFG.title || "Coloring Book");

  host.innerHTML = `
  <section class="coloring-band coloring-band--image"
           style="background-image: url('/assets/images/banners/coloring-book-banner.jpg');"
           aria-label="Coloring Book banner">
    <div class="coloring-band__bottom">
      <div class="coloring-band__inner">
        <h1 class="coloring-band__title" id="pageTitle">${safeTitle}</h1>
      </div>
    </div>
  </section>

  <main class="coloring-page">
    <a class="coloring-back" href="/games/coloring-book/">← Coloring Book</a>

    <div class="coloring-app">
      <aside class="coloring-tools-panel" aria-label="Main coloring tools">
        <h2 class="tools-panel-title">Tools</h2>
        <div class="tool-buttons tool-buttons--rail">
          <button class="tool-button" type="button" data-tool="grab" aria-pressed="false">
            <span class="tool-button__icon" aria-hidden="true">✋</span>
            <span>Grab</span>
          </button>
          <button class="tool-button" type="button" data-tool="brush" aria-pressed="false">
            <span class="tool-button__icon" aria-hidden="true">🖌️</span>
            <span>Brush</span>
          </button>
          <button class="tool-button" type="button" data-tool="bucket" aria-pressed="true">
            <span class="tool-button__icon" aria-hidden="true">🪣</span>
            <span>Bucket</span>
          </button>
          <button class="tool-button" type="button" data-tool="eyedrop" aria-pressed="false">
            <span class="tool-button__icon" aria-hidden="true">💧</span>
            <span>Eyedropper</span>
          </button>
          <button class="tool-button" type="button" data-tool="eraser" aria-pressed="false">
            <span class="tool-button__icon tool-button__icon--eraser" aria-hidden="true">
              <svg viewBox="0 0 32 32" focusable="false" aria-hidden="true">
                <path class="eraser-icon__body" d="M7.2 21.9 17.9 7.8a3.2 3.2 0 0 1 4.5-.6l5.1 3.9a3.2 3.2 0 0 1 .6 4.5L17.4 29.7H9.8l-2-1.5a4.5 4.5 0 0 1-.6-6.3Z"/>
                <path class="eraser-icon__end" d="m7.2 21.9 7.3 5.6-1.7 2.2h-3l-2-1.5a4.5 4.5 0 0 1-.6-6.3Z"/>
                <path class="eraser-icon__seam" d="m12.7 14.7 7.3 5.6"/>
              </svg>
            </span>
            <span>Eraser</span>
          </button>
          <button class="tool-button" type="button" data-tool="text" aria-pressed="false">
            <span class="tool-button__icon" aria-hidden="true">T</span>
            <span>Text</span>
          </button>
          <button class="tool-button" type="button" data-tool="stamp" aria-pressed="false">
            <span class="tool-button__icon" aria-hidden="true">💬</span>
            <span>Stamp</span>
          </button>
        </div>
      </aside>

      <div class="coloring-side-stack">
        <aside class="coloring-options-panel" aria-label="Tool options">
          <h2 class="side-panel-title">Tool Options</h2>

          <div class="tool-options-scroll">
            <section class="tool-group tool-options" id="brushOptions" hidden>
              <span class="tool-label" id="brushOptionsLabel">Brush Size</span>
              <div class="brush-sizes">
                <button class="brush-size" type="button" data-brush-size="5" aria-label="Small brush"><span class="brush-dot" style="width:5px;height:5px"></span></button>
                <button class="brush-size" type="button" data-brush-size="12" aria-label="Medium brush"><span class="brush-dot" style="width:10px;height:10px"></span></button>
                <button class="brush-size" type="button" data-brush-size="24" aria-label="Large brush"><span class="brush-dot" style="width:16px;height:16px"></span></button>
                <button class="brush-size" type="button" data-brush-size="42" aria-label="Extra large brush"><span class="brush-dot" style="width:23px;height:23px"></span></button>
              </div>
            </section>

            <section class="tool-group tool-options" id="textOptions" hidden>
              <span class="tool-label">Text</span>
              <div class="text-settings">
                <textarea class="text-control text-control--multiline" id="textValue" maxlength="500" rows="3" placeholder="Type your text…" spellcheck="true"></textarea>

                <div class="text-format-toolbar" role="toolbar" aria-label="Text formatting">
                  <div class="text-format-group" aria-label="Text alignment">
                    <button class="text-format-button is-active" type="button" data-text-align="left" aria-label="Align left" aria-pressed="true" title="Align left">
                      <svg class="text-format-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h14M4 10h10M4 14h14M4 18h8"/></svg>
                    </button>
                    <button class="text-format-button" type="button" data-text-align="center" aria-label="Align center" aria-pressed="false" title="Align center">
                      <svg class="text-format-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M7 10h10M5 14h14M8 18h8"/></svg>
                    </button>
                    <button class="text-format-button" type="button" data-text-align="right" aria-label="Align right" aria-pressed="false" title="Align right">
                      <svg class="text-format-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h14M10 10h10M6 14h14M12 18h8"/></svg>
                    </button>
                  </div>
                  <span class="text-format-divider" aria-hidden="true"></span>
                  <div class="text-format-group" aria-label="Text style">
                    <button class="text-format-button text-format-button--letter" id="textBoldBtn" type="button" aria-label="Bold" aria-pressed="false" title="Bold"><strong>B</strong></button>
                    <button class="text-format-button text-format-button--letter" id="textItalicBtn" type="button" aria-label="Italic" aria-pressed="false" title="Italic"><em>I</em></button>
                  </div>
                </div>

                <select class="palette-select" id="textFont" aria-label="Text font">
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Impact, Haettenschweiler, sans-serif">Impact</option>
                  <option value="'Comic Sans MS', 'Trebuchet MS', sans-serif">Comic</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Lemon Milk', Arial, sans-serif">Lemon Milk</option>
                  <option value="'Tommy Soft', Arial, sans-serif">Tommy Soft</option>
                </select>

                <div class="stamp-control-block">
                  <div class="stamp-control-head"><label for="textSize">Size</label><span>Small</span><span>Large</span></div>
                  <input class="stamp-slider" id="textSize" type="range" value="44" min="10" max="160" step="2" aria-label="Text size" />
                </div>

                <div class="stamp-control-block">
                  <div class="stamp-control-head stamp-control-head--rotation"><label for="textRotation">Rotate</label><output id="textRotationValue" for="textRotation">0°</output></div>
                  <input class="stamp-slider" id="textRotation" type="range" min="-180" max="180" step="1" value="0" aria-label="Text rotation" />
                </div>

                <div class="stamp-control-block">
                  <div class="stamp-control-head"><label for="textStrokeWidth">Outline Width</label><span>None</span><span>Thick</span></div>
                  <input class="stamp-slider" id="textStrokeWidth" type="range" value="0" min="0" max="18" step="1" aria-label="Text outline width" />
                </div>

                <button class="delete-text-button" id="deleteTextBtn" type="button" disabled>Delete Selected Text</button>
              </div>
              <p class="tool-help">Type first, then click the artwork to place it. Click and drag existing text to move it.</p>
            </section>

            <section class="tool-group tool-options" id="stampOptions" hidden>
              <span class="tool-label">Stamp</span>

              <details class="stamp-library-disclosure" open>
                <summary>Stamp Library</summary>
                <div class="stamp-library-disclosure__body">
                  <div class="stamp-picker" id="stampPicker" aria-label="Choose a stamp"></div>
                </div>
              </details>

              <div class="stamp-control-block">
                <div class="stamp-control-head"><label for="stampSize">Size</label><span>Small</span><span>Large</span></div>
                <input class="stamp-slider" id="stampSize" type="range" min="80" max="1400" step="10" value="360" aria-label="Stamp size" />
              </div>

              <div class="stamp-control-block">
                <div class="stamp-control-head stamp-control-head--rotation"><label for="stampRotation">Rotate</label><output id="stampRotationValue" for="stampRotation">0°</output></div>
                <input class="stamp-slider" id="stampRotation" type="range" min="-180" max="180" step="1" value="0" aria-label="Stamp rotation" />
              </div>

              <button class="delete-text-button" id="deleteStampBtn" type="button" disabled>Delete Selected Stamp</button>
              <p class="tool-help">Choose a stamp, set its size and rotation, then click the artwork to place it. Drag a placed stamp to move it.</p>
            </section>
          </div>

          <div class="coloring-status" id="coloringStatus" role="status" aria-live="polite">Loading coloring page…</div>
        </aside>

        <aside class="coloring-palette-panel" aria-label="Colors and palettes">
          <h2 class="side-panel-title">Colors</h2>

          <div class="palette-top-row">
            <section class="global-colors global-colors--photoshop" aria-label="Foreground and background colors">
              <div class="global-colors__stack" role="group" aria-label="Choose color target">
                <button class="global-color-button global-color-button--background" type="button" data-global-color-target="background" aria-pressed="false" aria-label="Edit background color">
                  <span class="global-color-chip" id="backgroundColorChip" aria-hidden="true"></span>
                  <span class="global-color-badge" aria-hidden="true">BG</span>
                  <span class="sr-only">Background</span>
                </button>
                <button class="global-color-button global-color-button--foreground is-active" type="button" data-global-color-target="foreground" aria-pressed="true" aria-label="Edit foreground color">
                  <span class="global-color-chip" id="foregroundColorChip" aria-hidden="true"></span>
                  <span class="global-color-badge" aria-hidden="true">FG</span>
                  <span class="sr-only">Foreground</span>
                </button>
                <button class="swap-colors-button" id="swapColorsBtn" type="button" aria-label="Swap foreground and background colors" title="Swap colors">⇄</button>
              </div>
              <div class="global-colors__labels">
                <div class="global-color-readout">
                  <span class="global-color-readout__label">Foreground</span>
                  <span class="global-color-readout__value" id="foregroundColorText">#D7263D</span>
                </div>
                <div class="global-color-readout">
                  <span class="global-color-readout__label">Background</span>
                  <span class="global-color-readout__value" id="backgroundColorText">#000000</span>
                </div>
              </div>
            </section>

            <section class="tool-group palette-tool-group" aria-label="Color palettes">
              <div class="palette-tabs" role="tablist" aria-label="Palette views">
                <button class="palette-tab is-active" type="button" role="tab" aria-selected="true" data-palette-tab="presets">Palettes</button>
                <button class="palette-tab" type="button" role="tab" aria-selected="false" data-palette-tab="current">Current Colors</button>
              </div>
              <div class="palette-panel" data-palette-panel="presets">
                <label class="sr-only" for="paletteSelect">Palette</label>
                <select class="palette-select" id="paletteSelect" aria-label="Color palette"></select>
                <div class="swatches" id="swatches" aria-label="Palette colors"></div>
              </div>
              <div class="palette-panel" data-palette-panel="current" hidden>
                <div class="swatches current-swatches" id="currentSwatches" aria-label="Colors currently used in the artwork"></div>
                <p class="current-colors-empty" id="currentColorsEmpty">No custom colors are currently used.</p>
              </div>
            </section>
          </div>

          <div class="palette-current-row" aria-label="Currently active color target">
            <span class="current-color-chip" id="currentColorChip" aria-hidden="true"></span>
            <span><strong id="currentColorRoleText">Foreground</strong> is active · <strong id="currentColorText">#D7263D</strong></span>
          </div>

          <section class="color-picker-panel" aria-label="Custom color picker">
            <span class="tool-label">Custom Color Picker</span>
            <div class="color-picker-panel__body">
              <div class="color-picker-field" id="colorPickerField" role="slider" tabindex="0" aria-label="Choose saturation and brightness">
                <span class="color-picker-marker" id="colorPickerMarker" aria-hidden="true"></span>
              </div>
              <input class="hue-slider" id="hueSlider" type="range" min="0" max="360" step="1" value="350" aria-label="Hue" />
              <div class="color-picker-bottom-row color-picker-bottom-row--compact">
                <input class="hex-input" id="hexInput" type="text" value="#D7263D" maxlength="7" spellcheck="false" aria-label="Hex color code" />
              </div>
            </div>
          </section>
        </aside>
      </div>

      <section class="coloring-workspace" aria-label="Coloring page workspace">
        <div class="workspace-commandbar">
          <div class="workspace-actions" aria-label="File and edit actions">
            <button class="menu-button" id="undoBtn" type="button" disabled>↶ Undo</button>
            <button class="menu-button" id="redoBtn" type="button" disabled>↷ Redo</button>
            <button class="menu-button menu-button--danger" id="resetBtn" type="button">Clear</button>
            <button class="menu-button menu-button--primary" id="printBtn" type="button">Print / Save</button>
          </div>

          <div class="workspace-view-controls">
            <div class="drawing-position-compact" aria-label="Choose drawing position">
              <span class="compact-control-label">Drawing Position</span>
              <div class="layer-toggle layer-toggle--compact">
                <button class="layer-button is-active" type="button" data-layer-position="below" aria-pressed="true">Behind Lines</button>
                <button class="layer-button" type="button" data-layer-position="above" aria-pressed="false">On Top</button>
              </div>
              <span class="sr-only" id="layerPositionHint">New brush strokes and text will be placed behind the black lines.</span>
            </div>

            <div class="zoom-compact" aria-label="Zoom controls">
              <span class="compact-control-label">Zoom</span>
              <div class="zoom-inline-row">
                <input class="zoom-slider" id="zoomSlider" type="range" min="100" max="400" step="5" value="100" aria-label="Zoom level" />
                <span class="zoom-value" id="zoomValue">100%</span>
                <button class="zoom-reset-button" id="zoomResetBtn" type="button" disabled>Reset</button>
              </div>
            </div>
          </div>
        </div>

        <div class="artboard-wrap" id="artboardWrap">
          <div class="artboard is-loading" id="artboard" data-tool="bucket" aria-label="Interactive coloring page"></div>
        </div>

        <div class="workspace-foot">
          <span>Mouse wheel zooms toward the pointer. The Grab tool pans when you are zoomed in. Ctrl/Cmd + Z undoes.</span>
          <span>Your work stays in this browser tab until you leave or reload the page.</span>
        </div>
      </section>
    </div>
  </main>
  `;
})();
