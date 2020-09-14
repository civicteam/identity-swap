/**
 * A type interface for any state that is loaded from some backend or async source.
 */
export interface Loadable {
  loading: boolean;
  error: string | null;
}
