# Who's in the Room

Interactive presentation for Transformation 250.

The presentation is in `public/index.html`, including its embedded attendee data and images. Google Fonts and GSAP are loaded from external CDNs. The original attendee research remains unchanged.

Phones and smaller tablets use a searchable, scrollable attendee directory with category filters. Desktop keeps the room map. Profile controls support keyboard navigation, readable text sizing, and returning to the directory with the browser Back button.

The QR button opens sharing controls. `public/share-qr.svg` and `public/share-qr.png` point directly to https://whos-in-the-room.replit.app/ and are served locally with the site. The PNG can be downloaded for presentation slides. No external QR service or runtime QR library is required.

## Preview

Run `python3 -m http.server 3000 --bind 0.0.0.0 --directory public` and open port 3000.

## Replit

Import this repository into the personal Replit workspace. Publish using Static deployment with `public` as the public directory and no build command.

Changes pushed to GitHub must be pulled into Replit and republished to update the public site.
