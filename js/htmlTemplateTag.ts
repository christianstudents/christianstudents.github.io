/**
 * A template tag function that does absolutely nothing. It's meant to precede template literals and
 * lets `prettier` know how to format it in the code as HTML.
 * @example
 * ```ts
 * // Just place it right before the opening "`":
 * html`
 *   <div>
 *     <h1>Hello World</h1>
 *   </div>
 * `
 * ```
 */
export const html = (strings: TemplateStringsArray, ...values: unknown[]) =>
  String.raw({ raw: strings }, ...values);

export default html;
