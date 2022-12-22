interface InstagramVideoMediaBase {
  caption: string;
  id: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  carousel: null | {
    id: string;
    media_type: "CAROUSEL_ALBUM";
    media_url: string;
    permalink: string;
    timestamp: string;
  };
}

export interface InstagramVideoMedia extends InstagramVideoMediaBase {
  media_type: "VIDEO";
  thumbnail_url: string;
}

export interface InstagramImageMedia extends InstagramVideoMediaBase {
  media_type: "IMAGE";
}

export type InstagramMedia = InstagramVideoMedia | InstagramImageMedia;
