import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes raw HTML string to prevent Cross-Site Scripting (XSS) attacks.
 * Allows safe tags and attributes used by the Rich Text Editor.
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
    if (!dirtyHtml) return '';
    return DOMPurify.sanitize(dirtyHtml, {
        ALLOWED_TAGS: [
            'p', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'br', 'img', 'span', 'div', 'blockquote', 'hr', 'table',
            'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code', 'sub', 'sup', 's', 'u',
            'iframe', 'video', 'source', 'figure', 'figcaption'
        ],
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'style',
            'width', 'height', 'frameborder', 'allowfullscreen', 'allow',
            'type', 'colspan', 'rowspan'
        ],
    });
}
