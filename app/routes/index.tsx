import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox';
import { useEffect } from 'react';
import { ActionFunction, LinksFunction, useFetcher } from 'remix';
import reachBase from '@reach/combobox/styles.css';
import styles from './index.css';
import search from 'ytsr';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: reachBase },
  { rel: 'stylesheet', href: styles },
];

export const action: ActionFunction = async ({ request }) => {
  const { searchTerm } = Object.fromEntries(await request.formData());
  if (!searchTerm || typeof searchTerm !== 'string') return [];

  const searchResults = await search(searchTerm, { limit: 15 });
  return searchResults.items
    .map((item) =>
      item?.type === 'video'
        ? {
            title: item.title,
            id: item.id,
            bestThumbnail: item.bestThumbnail?.url,
            author: item.author?.name,
            duration: item.duration,
          }
        : null
    )
    .filter(Boolean);
};

export default function Index() {
  const fetcher = useFetcher();

  useEffect(() => {
    // fetch('/resource/full/lbA3jxab4A0')
    //   .then((r) => r.text())
    //   .then((r) => new File([atob(r)], 'test.webm'))
    //   .then((file) => window.URL.createObjectURL(file))
    //   .then((url) => window.open(url));
  }, []);

  return (
    <main>
      <h1>riffs.run</h1>

      <fetcher.Form method='post'>
        <Combobox aria-label='Search'>
          <ComboboxInput
            name='searchInput'
            onChange={({ currentTarget: { value } }) => fetcher.submit({ searchTerm: value }, { method: 'post' })}
          />
          {fetcher.data && (
            <ComboboxPopover>
              <ComboboxList className='search-list'>
                {fetcher.data.map((item: Record<string, string>) => (
                  <ComboboxOption key={item.id} value={item.id} className='search-option'>
                    {item.title}
                  </ComboboxOption>
                ))}
              </ComboboxList>
            </ComboboxPopover>
          )}
        </Combobox>
      </fetcher.Form>
    </main>
  );
}

const debounce = (fn: Function, ms: number) => {
  let timer: number | undefined;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), ms);
  };
};
