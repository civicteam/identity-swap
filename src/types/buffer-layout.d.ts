declare module "buffer-layout" {
  export type Layout = {
    encode(src: unknown, b: Buffer, number?: offset): number;
    span: number;
  };

  export function struct(fields: Layout[]): Layout;
  export function blob(value: number, property: string): Layout;

  export function u8(property: string): Layout;
  export function u32(property: string): Layout;

  export function nu64(property: string): Layout;
}
