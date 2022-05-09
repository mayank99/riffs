import * as React from 'react';
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox';
import type { ActionFunction, LinksFunction } from 'remix';
import { useTransition } from 'remix';
import { Link } from 'remix';
import { json, useFetcher, useNavigate } from 'remix';
import styles from './index.css';
import { search } from '~/helpers/search';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export const action: ActionFunction = async ({ request }) => {
  const { searchTerm } = Object.fromEntries(await request.formData());
  if (!searchTerm || typeof searchTerm !== 'string') return [];

  const searchResults = await search(searchTerm);

  return json(
    searchResults
      .map((item) => ({
        title: item.title,
        id: item.id,
        thumbnail: item.thumbnail,
        artists: item.artists,
        duration: item.duration,
      }))
      .filter(Boolean)
  );
};

export default function Index() {
  const fetcher = useFetcher<Awaited<ReturnType<typeof search>>>();
  const navigate = useNavigate();
  const transition = useTransition();

  const [inputValue, setInputValue] = React.useState('');
  const listRef = React.useRef<HTMLUListElement>(null);

  const doSearch = (searchTerm: string) => {
    if (searchTerm.length >= 3) {
      fetcher.submit({ searchTerm }, { method: 'post' });
    }
  };

  return (
    <>
      <p>
        Search for a song and select start/end times to create a <em>riff</em>
      </p>
      <fetcher.Form method='post' autoComplete='off'>
        <Combobox
          aria-label='Search for a song or enter a url'
          className={`search-input-wrapper ${fetcher.state !== 'idle' || transition.state !== 'idle' ? 'loading' : ''}`}
          onSelect={(value) => {
            const item = fetcher.data?.find((item) => item.id === value);
            setInputValue(item?.title || '');
            navigate(`/${value}`);
          }}
        >
          <ComboboxInput
            name='searchTerm'
            className='search-input'
            autocomplete={false}
            autoComplete='off'
            autoFocus
            placeholder='Search…'
            value={inputValue}
            onInput={({ currentTarget: { value } }) => {
              doSearch(value);
              setInputValue(value);
            }}
            onKeyDown={(e) => {
              if (!e.isDefaultPrevented() && e.key.startsWith('Arrow')) {
                window.requestAnimationFrame(() => {
                  listRef.current?.querySelector('[data-highlighted]')?.scrollIntoView({ block: 'nearest' });
                });
              }
            }}
          />
          {fetcher.data && transition.state !== 'loading' && (
            <ComboboxPopover className='search-popover'>
              <ComboboxList className='search-list' ref={listRef}>
                {fetcher.data.flatMap((item, index) =>
                  item.id ? (
                    <ComboboxOption key={`${index}-${item.id}`} value={item.id!}>
                      <Link prefetch='intent' to={`/${item.id}`} className='search-option'>
                        <span
                          className='search-option-thumbnail'
                          style={{ '--thumbnail': `url(${item.thumbnail})` }}
                          aria-hidden
                        />
                        <span className='search-option-title'>{item.title}</span>
                        <span className='search-option-subtitle'>
                          <small>{item.artists?.[0]}</small>
                          <small>{item.duration}</small>
                        </span>
                      </Link>
                    </ComboboxOption>
                  ) : (
                    []
                  )
                )}
              </ComboboxList>
            </ComboboxPopover>
          )}
        </Combobox>
      </fetcher.Form>
    </>
  );
}
