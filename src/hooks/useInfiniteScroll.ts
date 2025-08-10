import { useEffect, useState } from "react";
import debounce from "lodash/debounce";

type UseInfiniteScrollParams = {
  threshold?: number;
  onTrigger: () => Promise<void>;
};

const DEFAULT_THRESHOLD = 0;

export const useInfiniteScroll = ({
  onTrigger,
  threshold = DEFAULT_THRESHOLD,
}: UseInfiniteScrollParams) => {
  const [loading, setLoading] = useState(false);
  const debouncedFn = debounce(async () => {
    if (loading) return;

    if (
      document.body.clientHeight - window.innerHeight - window.scrollY <=
      threshold
    ) {
      setLoading(true);

      await onTrigger();

      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    document.addEventListener("scroll", debouncedFn);

    return () => document.removeEventListener("scroll", debouncedFn);
  }, [debouncedFn]);

  return { loading };
};
