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

  return (
    <main>
      <h1>riffs!</h1>

      <fetcher.Form method='post' autoComplete='off'>
        <Combobox aria-label='Search'>
          <ComboboxInput
            name='searchInput'
            onChange={({ currentTarget: { value } }) => fetcher.submit({ searchTerm: value }, { method: 'post' })}
            autocomplete={false}
            autoComplete='off'
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
