export type SearchParams = {
  url: URL;
  group_adults: string;
  group_children: string;
  no_rooms: string;
  checkin: string;
  checkout: string;
};

export type Listing = {
  imgSrc: string;
  title: string | null;
  rating: string | null;
  description: string | null;
  price: number | null;
  booking_metadata: string | null;
  rating_word: string | null;
  rating_count: string | null;
};


export type Result = {
  content: {
    listings: Listing[];
    total_listings: string;
  };
};
