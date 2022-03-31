import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox';
import { ActionFunction, LinksFunction, useFetcher } from 'remix';
import reachBase from '@reach/combobox/styles.css';
import styles from './index.css';

import { search } from '~/utils/search';
import { debounce } from '~/utils/debounce';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: reachBase },
  { rel: 'stylesheet', href: styles },
];

export const action: ActionFunction = async ({ request }) => {
  const { searchTerm } = Object.fromEntries(await request.formData());
  if (!searchTerm || typeof searchTerm !== 'string') return [];

  const searchResults = await search(searchTerm);

  return searchResults
    .map((item) => ({
      title: item.title,
      id: item.id,
      thumbnail: item.thumbnail,
      artists: item.artists,
      duration: item.duration,
    }))
    .filter(Boolean);
};

export default function Index() {
  const fetcher = useFetcher();

  const doSearch = async (searchTerm: string) => {
    if (searchTerm.length >= 3) {
      fetcher.submit({ searchTerm }, { method: 'post' });
    }
  };

  return (
    <main>
      <h1>riffs!</h1>

      <fetcher.Form method='post' autoComplete='off'>
        <Combobox aria-label='Search'>
          <ComboboxInput
            name='searchInput'
            onInput={({ currentTarget: { value } }) => debounce(doSearch, Math.max(20, 150 - value.length * 20))(value)}
            autocomplete={false}
            autoComplete='off'
            placeholder='Song name'
          />
          {fetcher.data && (
            <ComboboxPopover>
              <ComboboxList className='search-list'>
                {fetcher.data.map((item: Record<string, string>) => (
                  <ComboboxOption key={item.id} value={item.id} className='search-option'>
                    {item.title} - {item.artists}
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
