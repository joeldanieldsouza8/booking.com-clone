import { Listing, Result, SearchParams } from "./definitions";

import puppeteer from "puppeteer";
import { Browser } from "puppeteer";
import fs from "fs";

// https://www.booking.com/searchresults.en-gb.html?ss=Devon%2C+United+Kingdom&efdco=1&label=gen173nr-1FCAEoggI46AdIM1gEaFCIAQGYAQm4ARfIAQzYAQHoAQH4AQuIAgGoAgO4Avfdxa8GwAIB0gIkNjdkNWZhNWItOGMzNC00MmI5LWJhYzUtNGFmZjA1YTllODI32AIG4AIB&sid=c4d8deb55ae3e3376149ac511fb81f03&aid=304142&lang=en-gb&sb=1&src_elem=sb&src=index&dest_id=1687&dest_type=region&checkin=2024-03-17&checkout=2024-04-13&group_adults=2&no_rooms=1&group_children=0

/*
export async function fetchResults(searchParams: SearchParams) {
  console.log("searchParams", searchParams); // debug

  const username = process.env.OXYLABS_USERNAME;
  const password = process.env.OXYLABS_PASSWORD;

  // Convert the string to a URL object which gives us access to some pretty cool methods
  const url = new URL(searchParams.url);
  console.log("url", url); // debug

  // Loop through the searchParams object and append the key-value pairs to the URL object
  Object.keys(searchParams).forEach((key) => {
    // Skip the url and location keys as we've already added them to the URL object
    if (key === "url" || key === "location") return;

    // Append the key-value pairs to the URL object using the URLSearchParams object
    const value = searchParams[key as keyof SearchParams];

    // If the value is a string, append it to the URL object using the URLSearchParams object
    if (typeof value === "string") {
      url.searchParams.append(key, value);
    }
  });

  console.log("scraping url >>>", url.href); // debug

  const body = {
    source: "universal",
    url: url.href,
    parse: true,
    render: "html",
    parsing_instructions: {
      listings: {
        _fns: [
          {
            _fn: "xpath",
            _args: ["//div[@data-testid='property-card-container']"],
          },
        ],
        _items: {
          title: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [".//div[@data-testid='title']/text()"],
              },
            ],
          },
          description: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [
                  ".//h4[contains(@class, 'abf093bdfe e8f7c070a7')]/text()",
                ],
              },
            ],
          },
          booking_metadata: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [
                  ".//div[contains(@class, 'c5ca594cb1 f19ed67e4b')]/div[contains(@class, 'abf093bdfe f45d8e4c32')]/text()",
                ],
              },
            ],
          },
          link: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [".//a[contains(@class, 'a78ca197d0')]/@href"],
              },
            ],
          },
          price: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [
                  `.//span[contains(@class, 'f6431b446c fbfd7c1165 e84eb96b1f')]/text()`,
                ],
              },
            ],
          },
          url: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [".//img/@src"],
              },
            ],
          },
          rating_word: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [
                  ".//div[@class='a3b8729ab1 e6208ee469 cb2cbb3ccb']/text()",
                ],
              },
            ],
          },
          rating: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [".//div[@class='a3b8729ab1 d86cee9b25']/text()"],
              },
            ],
          },
          rating_count: {
            _fns: [
              {
                _fn: "xpath_one",
                _args: [
                  ".//div[@class='abf093bdfe f45d8e4c32 d935416c47']/text()",
                ],
              },
            ],
          },
        },
      },
      total_listings: {
        _fns: [
          {
            _fn: "xpath_one",
            _args: [".//h1/text()"],
          },
        ],
      },
    },
  };

  const response = await fetch("https://realtime.oxylabs.io/v1/queries", {
    method: "POST",
    next: {
      revalidate: 60 * 60,
    },
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
        "base64"
      )}`,
    },
  })
  .then((response) => response.json())
    .then((data) => {
      if (data.results.length === 0) return;
      const result: Result = data.results[0];

      return result;
    })
    .catch((err) => console.log(err));

  return response;
}
*/

export async function fetchResults(
  searchParams: SearchParams
): Promise<Result> {
  // Launch the browser and open a new blank page
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the URL
  const url = searchParams.url.toString();
  await page.goto(url);

  // Optionally, wait for the specific elements if needed
  await page.waitForSelector('[data-testid="property-card"]', {
    visible: true,
  });

  const listingData: Listing[] = await page.evaluate(() => {
    function convertPriceToNumber(price: string) {
      return parseInt(price.replace(/\D/g, ""));
    }

    const listings = Array.from(
      document.querySelectorAll('[data-testid="property-card"]')
    );
    return listings.map((el) => {
      const title =
        el.querySelector('[data-testid="title"]')?.textContent || "N/A";

      const price = convertPriceToNumber(
        el.querySelector('[data-testid="price-and-discounted-price"]')
          ?.textContent || "N/A"
      );

      const imgSrc =
        el.querySelector('[data-testid="image"]')?.getAttribute("src") || "N/A";

      const description =
        el.querySelector("h4.abf093bdfe.e8f7c070a7")?.textContent || "N/A";

      const rating_word =
        el.querySelector(".a3b8729ab1.e6208ee469.cb2cbb3ccb")?.textContent ||
        "N/A";

      const rating_count =
        el.querySelector(".abf093bdfe.f45d8e4c32.d935416c47")?.textContent ||
        "N/A";

      const rating =
        el.querySelector(".a3b8729ab1.d86cee9b25")?.textContent || "N/A";

      const booking_metadata =
        el.querySelector('[data-testid="price-for-x-nights"]')?.textContent ||
        "N/A";

      return {
        title,
        price,
        imgSrc,
        description,
        rating_word,
        rating_count,
        rating,
        booking_metadata,
      };
    });
  });

  console.log(listingData); // debug

  await browser.close();

  fs.writeFile("listingData.json", JSON.stringify(listingData), (err) => {
    if (err) throw err;
    console.log("Data written to file");
  });

  // You'll need to adjust the following return statement according to your application's needs
  return {
    content: {
      listings: listingData,
      total_listings: listingData.length.toString(),
    },
  };
}
