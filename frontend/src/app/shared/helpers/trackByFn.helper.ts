/**
 * TrackBy helper function for Angular *ngFor directives
 * Tracks items by their unique properties to improve performance
 * Falls back to index if no unique property is available
 * @param index - The index of the item
 * @param item - The item being tracked
 * @returns The unique identifier for the item, or index as fallback
 */
export function trackById(index: number, item: any): any {
  if (item instanceof Date) return item.getTime();
  return item?.id ?? item?.key ?? item?.value ?? item?.category ?? item?.user?.id ?? item ?? index;
}
