export function createElement(HTML: string) {
  return document.createRange().createContextualFragment(HTML)
    .firstElementChild as HTMLElement;
}
