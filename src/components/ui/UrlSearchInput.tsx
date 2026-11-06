"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { TextInput } from "@/components/ui/inputs";
import { buildQueryString } from "@/helpers/search-params";

const SEARCH_DEBOUNCE_MS = 300;

interface UrlSearchInputProps {
  initialValue: string;
  placeholder: string;
  /** Other URL params to keep while searching (e.g. the active filters). */
  keepParams?: Record<string, string | number | null>;
}

/** Search box that writes ?q= to the URL (and goes back to page 1) so the server renders the results.
 * `keepParams` are kept in the URL; the page param is always dropped. */
export function UrlSearchInput({ initialValue, placeholder, keepParams = {} }: UrlSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialValue);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Cancel a pending search when leaving the page.
  useEffect(() => () => clearTimeout(searchTimeout.current), []);

  function changeSearch(text: string) {
    setSearch(text);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      router.replace(`${pathname}${buildQueryString({ ...keepParams, q: text.trim() })}`, { scroll: false });
    }, SEARCH_DEBOUNCE_MS);
  }

  return (
    <TextInput
      type="search"
      value={search}
      onChange={(event) => changeSearch(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
}
