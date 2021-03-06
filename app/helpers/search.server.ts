export const search = async (query: string) => {
  const response = await fetch(
    `https://music.youtube.com/youtubei/v1/search?alt=json&key=${process.env.YOUTUBE_MUSIC_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        origin: 'https://music.youtube.com',
      },
      body: JSON.stringify({
        query,
        context: { client: { clientName: 'WEB_REMIX', clientVersion: '0.1' } },
        params: 'EgWKAQIIAWoKEAoQCRADEAQQBQ%3D%3D', // this tells YTM to only search for songs
      }),
    }
  ).then((r) => r.json());

  let items = [];
  try {
    items =
      response.contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents
        .pop()
        .musicShelfRenderer.contents.map(({ musicResponsiveListItemRenderer }: any) => ({
          title: getTitle(musicResponsiveListItemRenderer),
          id: getId(musicResponsiveListItemRenderer),
          artists: getArtists(musicResponsiveListItemRenderer),
          thumbnail: getThumbnail(musicResponsiveListItemRenderer),
          duration: getDuration(musicResponsiveListItemRenderer),
        })) ?? [];
  } catch (err) {
    console.error('Oopsie', err);
  }

  return items as Array<Partial<{ title: string; id: string; artists: string[]; thumbnail: string; duration: string }>>;
};

const getTitle = (item: any) => {
  let title = '';
  try {
    title = item.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
  } catch (err) {
    console.log('Failed to parse title', err);
  }
  return title;
};

const getId = (item: any) => {
  let id = '';
  try {
    id =
      item.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0].navigationEndpoint.watchEndpoint
        .videoId;
  } catch (err) {
    console.log('Failed to parse id', err);
  }
  return id;
};

const getArtists = (item: any) => {
  let artists = [];
  try {
    artists = item.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs
      .filter(
        (r: any) =>
          r.navigationEndpoint?.browseEndpoint.browseEndpointContextSupportedConfigs.browseEndpointContextMusicConfig
            .pageType === 'MUSIC_PAGE_TYPE_ARTIST'
      )
      .map((r: any) => r.text as string);
  } catch (err) {
    console.log('Failed to parse artists', err);
  }
  return artists;
};

const getThumbnail = (item: any) => {
  let thumbnailUrl = '';
  try {
    thumbnailUrl = item.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails.pop()?.url;
  } catch (err) {
    console.log('Failed to parse thumbnailUrl', err);
  }
  return thumbnailUrl;
};

const getDuration = (item: any) => {
  let duration;
  try {
    duration = item.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs.pop().text;
  } catch (err) {
    console.log('Failed to parse duration', err);
  }
  return duration;
};
