"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { TextInput } from "@/components/ui/inputs";
import { buildQueryString } from "@/helpers/search-params";

const SEARCH_DEBOUNCE_MS = 300;

interface UrlSearchInputProps {
  initialValue: string;
  placeholder: string;
}

/** Search box that writes ?q= to the URL (and goes back to page 1) so the server renders the results. */
export function UrlSearchInput({ initialValue, placeholder }: UrlSearchInputProps) {
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
      router.replace(`${pathname}${buildQueryString({ q: text.trim() })}`, { scroll: false });
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
