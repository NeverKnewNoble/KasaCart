import { toast } from "sonner";

/**
 * Toast the outcome of a service call.
 *
 * Our services swallow errors and return `undefined` on failure (and the entity,
 * or `true` for deletes, on success). So a nullish result means "failed".
 *
 * @returns true (and narrows the value) when the call succeeded.
 *
 * @example
 * const res = await Products.createProduct(input);
 * if (toastResult(res, "Product created")) refresh();
 */
export function toastResult<T>(
  result: T,
  success: string,
  error = "Something went wrong. Please try again."
): result is NonNullable<T> {
  if (result === undefined || result === null) {
    toast.error(error);
    return false;
  }
  toast.success(success);
  return true;
}
