# Image Map

The uploaded numbered images are the source assets. The app references cropped display copies from `public/images/cropped` in `src/App.tsx`.

- `Frame 1 (1).png`: preferred profile image, when present
- `1.png`: fallback portrait
- `2.png`: material styling
- `3.png`: material / drawing reference
- `4.png`: 01 Chipmong cover
- `5.png`: 03 Sensok Villa cover
- `6.png`: 02 Borey Angkor PP cover
- `7.png`: 04 Technical Drawing cover
- `8.png`-`11.png` and `13.png`-`16.png`: Chipmong modal gallery
- `18.png`-`24.png`: Borey Angkor PP modal gallery
- `26.png`-`30.png`, `32.png`-`36.png`, and `38.png`-`41.png`: Sensok Villa modal gallery
- `12.png`, `17.png`, `25.png`, `31.png`, and `37.png`: floor-plan source files, currently excluded from modals

Those cropped copies keep modal images aligned to the visible render or plan instead of the full transparent 1080x1080 export canvas.

There are only three project modals. Floor-plan source files remain in the folder, but they are not shown in any modal.

- `01 Chipmong`: includes its cover and render images.
- `02 Borey Angkor PP`: includes its cover and render images.
- `03 Sensok Villa`: includes its cover and living room, hall, and kitchen render images.

`04 Technical Drawing` is a static content card and does not open a modal.
