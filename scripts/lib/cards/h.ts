/**
 * Tiny vnode helper for satori. Satori accepts a plain `{ type, props }` tree
 * shaped like a React element (it never touches React itself), so this
 * avoids pulling in React/JSX for a handful of SVG cards.
 */

export interface VNode {
  type: string;
  props: Record<string, unknown>;
}

export type Child = VNode | string | number | null | false | undefined;

/**
 * Builds a satori-compatible vnode. Satori mirrors React's own runtime
 * shape: a single child is passed as the bare value, not wrapped in an
 * array, and only a real (2+) array of children counts as "has children"
 * for its "must set display" check. Match that exactly, or every text leaf
 * trips the check.
 */
export function h(type: string, props: Record<string, unknown> = {}, ...children: (Child | Child[])[]): VNode {
  const flat = children.flat(Infinity as 1).filter((c): c is VNode | string | number => c !== null && c !== false && c !== undefined);
  const value = flat.length <= 1 ? flat[0] : flat;
  return { type, props: { ...props, children: value } };
}
