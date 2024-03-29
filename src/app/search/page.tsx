import { fetchResults } from "@/lib/actions";
import { SearchParams } from "@/lib/definitions";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type SearchPageProps = {
  searchParams: SearchParams;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  //   console.log(props); // debug

  // Guard clause to ensure the searchParams.url is present
  if (!searchParams.url) return notFound();

  const results = await fetchResults(searchParams);
  console.log("results", results); // debug

  // Check if there are any results
  if (!results) return <div>No results found...</div>;

  console.log("results", results); // debug

  return (
    <section>
      <div className="mx-auto max-w-7xl p-6 lg:px-8">
        <h1 className="text-4xl font-bold pb-3">Your Trip Results</h1>

        <h2 className="pb-3">
          Dates of trip:
          <span className="italic ml-2">
            {searchParams.checkin} to {searchParams.checkout}
          </span>
        </h2>

        <hr className="mb-5" />

        <h3 className="font-semibold text-xl">
          {results.content.total_listings}
        </h3>

        <div className="space-y-2 mt-5">
          {results.content.listings.map((item) => (
            <div
              key={item.title}
              className="flex space-y-2 justify-between space-x-4 p-5 border rounded-lg"
            >
              <Image
                src={item.imgSrc}
                alt="image of property"
                className="h-44 w-44 rounded-lg"
                width={176}
                height={176}
              />

              <div className="flex flex-1 space-x-5 justify-between">
                <div>
                  <div className="font-bold text-blue-500 hover:text-blue-600 hover:underline">
                    {item.title}
                  </div>
                  <p className="text-xs">{item.description}</p>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="flex items-start justify-end space-x-2 text-right">
                    <div>
                      <p className="font-bold">{item.rating_word}</p>
                      <p className="text-xs">{item.rating_count}</p>
                    </div>

                    <p className="flex items-center justify-center font-bold text-sm w-10 h-10 text-white bg-blue-900 rounded-lg flex-shrink-0">
                      {item.rating || "N/A"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs">{item.booking_metadata}</p>
                    <p className="text-2xl font-bold">{item.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
