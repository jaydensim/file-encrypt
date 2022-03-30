let dropperIcons = {
  upload:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>',
  archive:
    '<polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line>',
  file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>',
};

export function dropperHTML(title, subtitle, providedIcon) {
  let icon = "";
  if (providedIcon) {
    icon = `<p><svg viewBox="0 0 24 24" class="app-functional--navy-icon">${
      dropperIcons[providedIcon] || dropperIcons.upload
    }</svg></p>`;
  }
  return `<div>${icon}<h3>${title}</h3><p>${subtitle}</p></div>`;
}
